"""
Plant Disease Detection Model - Rice Disease Training Script
=============================================================
Trains a CNN model for Rice plant disease classification
using Transfer Learning with EfficientNetB0.

Dataset:
  anshulm257/rice-disease-dataset  (~3829 images, 6 classes)
  Classes: Bacterial_Leaf_Blight, Brown_Spot, Healthy,
           Leaf_Blast, Leaf_Scald, Sheath_Blight

Key techniques for >90% accuracy:
  - Transfer Learning (EfficientNetB0 pretrained on ImageNet)
  - Heavy Data Augmentation
  - Progressive Fine-tuning (freeze -> train head -> unfreeze -> fine-tune)
  - Class Weight Balancing
  - Label Smoothing
  - Learning Rate Scheduling (ReduceLROnPlateau)
  - Early Stopping
  - Dropout Regularization
  - Multi-source dataset merging via kagglehub
"""

import os
import sys
import json
import shutil
import random
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import (
    EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
)
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix

# ─── Configuration ────────────────────────────────────────────────────────────

IMG_SIZE         = 224
BATCH_SIZE       = 32
INITIAL_EPOCHS   = 15
FINE_TUNE_EPOCHS = 20
LABEL_SMOOTHING  = 0.1
DROPOUT_RATE     = 0.4
SEED             = 42

# Base directory: folder where this script lives
BASE_DIR   = Path(__file__).parent.resolve()
MODELS_DIR = BASE_DIR / "models"
PLOTS_DIR  = BASE_DIR / "plots"
DATASET_DIR = BASE_DIR / "dataset"   # local dataset subfolder (optional manual override)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
PLOTS_DIR.mkdir(parents=True, exist_ok=True)
DATASET_DIR.mkdir(parents=True, exist_ok=True)

tf.random.set_seed(SEED)
np.random.seed(SEED)

print(f"TensorFlow version: {tf.__version__}")
print(f"Available devices: {[d.device_type for d in tf.config.list_physical_devices()]}")


# ─── Target Classes ───────────────────────────────────────────────────────────

RICE_DISEASE_CLASSES = [
    "Bacterial_Leaf_Blight",
    "Brown_Spot",
    "Healthy",
    "Leaf_Blast",
    "Leaf_Scald",
    "Sheath_Blight",
]


# ─── Fuzzy folder → canonical class matching ─────────────────────────────────

def normalize_name(s: str) -> str:
    """Lowercase, strip, replace separators with single underscore."""
    import re
    s = s.lower().strip()
    s = re.sub(r"[\s\-()]+", "_", s)
    s = re.sub(r"_+", "_", s)
    s = s.strip("_")
    return s


def match_class(folder_name: str, target_classes: list) -> str | None:
    """
    Return the canonical class name if folder_name fuzzy-matches one of the
    target_classes, else return None.

    Strategy:
      1. Exact match (normalized).
      2. All words in target appear in folder (substring).
      3. Folder name contains at least 60% of target words.
    """
    fn = normalize_name(folder_name)

    for cls in target_classes:
        cn = normalize_name(cls)
        if cn == fn:
            return cls

    # Remove crop-prefix tokens like "rice_", "paddy_"
    CROP_TOKENS = {"rice", "paddy", "oryza", "plant", "leaf", "disease"}
    fn_clean = fn
    for tok in CROP_TOKENS:
        fn_clean = fn_clean.replace(tok + "_", "").replace("_" + tok, "")

    for cls in target_classes:
        cn = normalize_name(cls)
        cn_clean = cn
        for tok in CROP_TOKENS:
            cn_clean = cn_clean.replace(tok + "_", "").replace("_" + tok, "")

        if cn_clean == fn_clean:
            return cls

        # Substring check: target words appear in folder
        target_words = set(cn_clean.split("_"))
        folder_words = set(fn_clean.split("_"))
        if target_words and target_words <= folder_words:
            return cls
        if cn_clean in fn_clean or fn_clean in cn_clean:
            return cls

        # Partial word-overlap (>=60%)
        if target_words:
            overlap = len(target_words & folder_words) / len(target_words)
            if overlap >= 0.6 and len(target_words) >= 2:
                return cls

    return None


def scan_dataset_dir(root: Path, target_classes: list, crop_name: str) -> dict:
    """
    Recursively walk root looking for leaf-level class folders that match
    target_classes.  Returns dict: canonical_class -> list of image paths.
    """
    IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
    class_to_images = {c: [] for c in target_classes}
    matched = set()
    unmatched_folders = []

    print(f"\n  Scanning: {root}")
    for dirpath, dirnames, filenames in os.walk(root):
        images = [f for f in filenames if Path(f).suffix.lower() in IMAGE_EXTS]
        if not images:
            continue

        folder = Path(dirpath).name
        canonical = match_class(folder, target_classes)
        if canonical:
            matched.add(canonical)
            paths = [str(Path(dirpath) / f) for f in images]
            class_to_images[canonical].extend(paths)
            print(f"    ✓ '{folder}' → '{canonical}' ({len(images)} imgs)")
        else:
            unmatched_folders.append(folder)

    if unmatched_folders:
        print(f"  ⚠ Unmatched folders (ignored): {unmatched_folders[:20]}")

    missing = [c for c in target_classes if not class_to_images[c]]
    if missing:
        print(f"  ⚠ Classes with NO data found: {missing}")
    print(f"  Total classes found: {len(matched)}/{len(target_classes)}")

    return class_to_images


def merge_class_maps(*maps) -> dict:
    """Merge multiple class→images dicts (same keys) – union of image lists."""
    merged = {}
    for m in maps:
        for cls, imgs in m.items():
            merged.setdefault(cls, [])
            merged[cls].extend(imgs)
    return merged


# ─── Staged Dataset Builder ───────────────────────────────────────────────────

def build_tf_datasets(class_to_images: dict, target_classes: list,
                      val_split: float = 0.2):
    """
    Given a mapping of canonical_class->[image paths], construct train/val
    tf.data.Dataset objects using a manual split (so we can handle merged
    multi-source data that doesn't sit in a single directory tree).

    Returns: train_ds, val_ds, class_names, class_weight_dict
    """
    # Filter classes with at least 1 image; keep order = target_classes order
    class_names = [c for c in target_classes if class_to_images.get(c)]
    num_classes = len(class_names)

    print(f"\n  Classes with data: {class_names} ({num_classes} total)")

    all_paths, all_labels = [], []
    class_idx = {c: i for i, c in enumerate(class_names)}

    for cls in class_names:
        imgs = class_to_images[cls]
        random.seed(SEED)
        random.shuffle(imgs)
        for img_path in imgs:
            all_paths.append(img_path)
            all_labels.append(class_idx[cls])

    # Shuffle together
    combined = list(zip(all_paths, all_labels))
    random.seed(SEED)
    random.shuffle(combined)
    all_paths, all_labels = zip(*combined)
    all_paths = list(all_paths)
    all_labels = list(all_labels)

    total    = len(all_paths)
    val_size = int(total * val_split)
    train_size = total - val_size

    train_paths  = all_paths[:train_size]
    train_labels = all_labels[:train_size]
    val_paths    = all_paths[train_size:]
    val_labels   = all_labels[train_size:]

    print(f"  Total images : {total}")
    print(f"  Train samples: {train_size}")
    print(f"  Val samples  : {val_size}")

    # Class weight from training labels
    train_labels_arr = np.array(train_labels)
    class_weights_arr = compute_class_weight(
        'balanced',
        classes=np.unique(train_labels_arr),
        y=train_labels_arr
    )
    class_weight_dict = dict(enumerate(class_weights_arr))

    # Distribution
    unique, counts = np.unique(train_labels_arr, return_counts=True)
    for idx, cnt in zip(unique, counts):
        print(f"    {class_names[idx]}: {cnt} train samples")

    # Build tf.data pipelines
    @tf.function
    def load_and_preprocess(path, label):
        img = tf.io.read_file(path)
        img = tf.image.decode_image(img, channels=3, expand_animations=False)
        img = tf.image.resize(img, [IMG_SIZE, IMG_SIZE])
        img = tf.cast(img, tf.float32)
        label_oh = tf.one_hot(label, num_classes)
        return img, label_oh

    AUTOTUNE = tf.data.AUTOTUNE

    train_ds = (
        tf.data.Dataset.from_tensor_slices((train_paths, train_labels))
        .shuffle(buffer_size=min(train_size, 10000), seed=SEED)
        .map(load_and_preprocess, num_parallel_calls=AUTOTUNE)
        .batch(BATCH_SIZE)
        .prefetch(AUTOTUNE)
    )

    val_ds = (
        tf.data.Dataset.from_tensor_slices((val_paths, val_labels))
        .map(load_and_preprocess, num_parallel_calls=AUTOTUNE)
        .batch(BATCH_SIZE)
        .prefetch(AUTOTUNE)
    )

    return train_ds, val_ds, class_names, class_weight_dict


# ─── Model Builder ───────────────────────────────────────────────────────────

def build_model(num_classes: int):
    """EfficientNetB0 transfer learning model with built-in augmentation."""
    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    base_model.trainable = False

    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name="input_image")

    # Data augmentation (active only during training)
    x = layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = layers.RandomRotation(0.3)(x)
    x = layers.RandomZoom((-0.2, 0.2))(x)
    x = layers.RandomContrast(0.3)(x)
    x = layers.RandomBrightness(0.2)(x)
    x = layers.RandomTranslation(0.1, 0.1)(x)

    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.Dense(256, activation="relu", name="dense_head")(x)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(DROPOUT_RATE, name="dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = Model(inputs, outputs, name="PlantDiseaseClassifier")
    return model, base_model


def compile_model(model, learning_rate: float = 1e-3):
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=["accuracy"]
    )
    return model


# ─── Training Pipeline ────────────────────────────────────────────────────────

def train_model(train_ds, val_ds, class_names: list,
                class_weight_dict: dict, crop_name: str):
    """Two-phase training: frozen backbone → fine-tune top layers."""
    num_classes = len(class_names)
    model, base_model = build_model(num_classes)
    model = compile_model(model, learning_rate=1e-3)
    model.summary()

    checkpoint_path = str(MODELS_DIR / f"{crop_name}_best_model.keras")

    callbacks_phase1 = [
        EarlyStopping(monitor='val_accuracy', patience=5,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5,
                          patience=3, min_lr=1e-6, verbose=1),
        ModelCheckpoint(checkpoint_path, monitor='val_accuracy',
                        save_best_only=True, verbose=1),
    ]

    print(f"\n{'=' * 60}")
    print(f"  PHASE 1: Training Classification Head ({crop_name.upper()})")
    print(f"{'=' * 60}")

    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=INITIAL_EPOCHS,
        callbacks=callbacks_phase1,
        class_weight=class_weight_dict,
        verbose=1,
    )
    print(f"\n  Phase 1 Best Val Accuracy: {max(history1.history['val_accuracy']):.4f}")

    # Phase 2: fine-tune top 30% of backbone layers
    print(f"\n{'=' * 60}")
    print(f"  PHASE 2: Fine-tuning Top Layers ({crop_name.upper()})")
    print(f"{'=' * 60}")

    base_model.trainable = True
    total_layers = len(base_model.layers)
    freeze_until = int(total_layers * 0.7)
    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False

    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    print(f"  Unfroze {trainable_count}/{total_layers} layers for fine-tuning")

    model = compile_model(model, learning_rate=1e-4)

    callbacks_phase2 = [
        EarlyStopping(monitor='val_accuracy', patience=7,
                      restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5,
                          patience=3, min_lr=1e-7, verbose=1),
        ModelCheckpoint(checkpoint_path, monitor='val_accuracy',
                        save_best_only=True, verbose=1),
    ]

    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=callbacks_phase2,
        class_weight=class_weight_dict,
        verbose=1,
    )
    print(f"\n  Phase 2 Best Val Accuracy: {max(history2.history['val_accuracy']):.4f}")

    model = tf.keras.models.load_model(checkpoint_path)

    combined_history = {}
    for key in history1.history:
        combined_history[key] = history1.history[key] + history2.history[key]

    return model, combined_history


# ─── Evaluation ──────────────────────────────────────────────────────────────

def evaluate_model(model, val_ds, class_names: list, crop_name: str) -> float:
    print(f"\n{'=' * 60}")
    print(f"  EVALUATION: {crop_name.upper()}")
    print(f"{'=' * 60}")

    y_true, y_pred = [], []
    for images, labels in val_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    accuracy = np.mean(y_true == y_pred)
    print(f"\n  Overall Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    report = classification_report(y_true, y_pred, target_names=class_names)
    print(f"\nClassification Report:\n{report}")

    report_path = MODELS_DIR / f"{crop_name}_classification_report.txt"
    with open(report_path, 'w') as f:
        f.write(f"{'=' * 60}\n  {crop_name.upper()} Disease Detection\n{'=' * 60}\n\n")
        f.write(f"Overall Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)\n\n")
        f.write(report)

    cm = confusion_matrix(y_true, y_pred)
    fig_size = max(10, len(class_names) * 1.1)
    plt.figure(figsize=(fig_size, fig_size * 0.85))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title(f'{crop_name.title()} Disease Detection - Confusion Matrix', fontsize=14)
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    cm_path = PLOTS_DIR / f"{crop_name}_confusion_matrix.png"
    plt.savefig(cm_path, dpi=200)
    plt.close()
    print(f"  Confusion matrix → {cm_path}")

    return accuracy


def plot_training_history(history: dict, crop_name: str):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

    ax1.plot(history['accuracy'],     label='Train Accuracy', linewidth=2, color='#2196F3')
    ax1.plot(history['val_accuracy'], label='Val Accuracy',   linewidth=2, color='#FF5722')
    ax1.set_title(f'{crop_name.title()} - Model Accuracy', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Epoch'); ax1.set_ylabel('Accuracy')
    ax1.legend(fontsize=11); ax1.grid(True, alpha=0.3); ax1.set_ylim([0, 1.05])
    if len(history['accuracy']) > INITIAL_EPOCHS:
        ax1.axvline(x=INITIAL_EPOCHS - 1, color='gray', linestyle='--', alpha=0.7)
        ax1.text(INITIAL_EPOCHS - 0.5, 0.05, 'Fine-tune\nstart', fontsize=9, color='gray')

    ax2.plot(history['loss'],     label='Train Loss', linewidth=2, color='#2196F3')
    ax2.plot(history['val_loss'], label='Val Loss',   linewidth=2, color='#FF5722')
    ax2.set_title(f'{crop_name.title()} - Model Loss', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Epoch'); ax2.set_ylabel('Loss')
    ax2.legend(fontsize=11); ax2.grid(True, alpha=0.3)
    if len(history['loss']) > INITIAL_EPOCHS:
        ax2.axvline(x=INITIAL_EPOCHS - 1, color='gray', linestyle='--', alpha=0.7)

    plt.suptitle(f'{crop_name.title()} Plant Disease Detection - Training Progress',
                 fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()
    plot_path = PLOTS_DIR / f"{crop_name}_training_history.png"
    plt.savefig(plot_path, dpi=200, bbox_inches='tight')
    plt.close()
    print(f"  Training plots → {plot_path}")


def save_model_artifacts(model, class_names: list, crop_name: str, accuracy: float):
    model_path = MODELS_DIR / f"{crop_name}_disease_model.keras"
    model.save(model_path)
    print(f"  Model → {model_path}")

    labels_path = MODELS_DIR / f"{crop_name}_class_labels.json"
    with open(labels_path, 'w') as f:
        json.dump({i: name for i, name in enumerate(class_names)}, f, indent=2)
    print(f"  Class labels → {labels_path}")

    info = {
        "crop": crop_name,
        "architecture": "EfficientNetB0 (Transfer Learning)",
        "input_size": IMG_SIZE,
        "num_classes": len(class_names),
        "class_names": class_names,
        "validation_accuracy": float(accuracy),
        "techniques_used": [
            "Transfer Learning (EfficientNetB0)",
            "Data Augmentation (Flip, Rotate, Zoom, Contrast, Brightness)",
            "Progressive Fine-tuning",
            "Class Weight Balancing",
            f"Label Smoothing ({LABEL_SMOOTHING})",
            f"Dropout ({DROPOUT_RATE})",
            "ReduceLROnPlateau",
            "EarlyStopping",
            "BatchNormalization",
        ]
    }
    summary_path = MODELS_DIR / f"{crop_name}_model_info.json"
    with open(summary_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"  Model info → {summary_path}")


# ═══════════════════════════════════════════════════════════════════════════════
#  RICE DISEASE – 6 classes  (anshulm257/rice-disease-dataset)
# ═══════════════════════════════════════════════════════════════════════════════

def load_rice_disease_data():
    """
    Downloads the anshulm257/rice-disease-dataset from Kaggle via kagglehub.

    Dataset: anshulm257/rice-disease-dataset
    ~3829 images, 6 classes:
      Bacterial_Leaf_Blight, Brown_Spot, Healthy, Leaf_Blast,
      Leaf_Scald, Sheath_Blight

    The script scans the downloaded directory tree using fuzzy class matching,
    falls back to the local 'dataset/rice_disease/' subfolder if it exists.
    """
    print("\n" + "=" * 60)
    print("  LOADING RICE DISEASE DATASET (anshulm257)")
    print("=" * 60)

    try:
        import kagglehub
    except ImportError:
        raise ImportError(
            "kagglehub is not installed. Run: pip install kagglehub"
        )

    all_maps = []

    # Primary dataset: anshulm257/rice-disease-dataset
    print("\n  [1/2] Downloading primary dataset: anshulm257/rice-disease-dataset …")
    try:
        primary_path = Path(kagglehub.dataset_download("anshulm257/rice-disease-dataset"))
        print(f"  Downloaded → {primary_path}")
        primary_map = scan_dataset_dir(primary_path, RICE_DISEASE_CLASSES, "rice_disease")
        all_maps.append(primary_map)
    except Exception as e:
        print(f"  ⚠ Could not download primary dataset: {e}")

    # Fallback / supplementary dataset for any missing classes
    FALLBACK_DATASETS = [
        "tedisetiawan/rice-leaf-disease-dataset",
        "minhhuy243/rice-image-dataset",
    ]
    for slug in FALLBACK_DATASETS:
        try:
            print(f"\n  [2/2] Trying supplementary dataset: {slug} …")
            p = Path(kagglehub.dataset_download(slug))
            print(f"  Downloaded → {p}")
            fb_map = scan_dataset_dir(p, RICE_DISEASE_CLASSES, "rice_disease")
            found = [c for c in RICE_DISEASE_CLASSES if fb_map.get(c)]
            if found:
                print(f"  Found {len(found)} classes from this dataset: {found}")
                all_maps.append(fb_map)
            break
        except Exception as e:
            print(f"  ⚠ Could not download {slug}: {e}")

    # Optional local data directory (manual override)
    local_path = DATASET_DIR / "rice_disease"
    if local_path.exists():
        print(f"\n  Scanning local directory: {local_path}")
        local_map = scan_dataset_dir(local_path, RICE_DISEASE_CLASSES, "rice_disease")
        all_maps.append(local_map)

    if not all_maps:
        raise RuntimeError(
            "No rice disease dataset could be downloaded.\n"
            "Manually place images under:\n"
            f"  {DATASET_DIR / 'rice_disease' / '<ClassName>'}\n"
            "with one subfolder per class."
        )

    class_to_images = merge_class_maps(*all_maps)

    found   = [c for c in RICE_DISEASE_CLASSES if class_to_images.get(c)]
    missing = [c for c in RICE_DISEASE_CLASSES if not class_to_images.get(c)]
    print(f"\n  Classes found  : {found}")
    print(f"  Classes missing: {missing}")

    return build_tf_datasets(class_to_images, RICE_DISEASE_CLASSES)


def train_rice_disease():
    """Complete training pipeline for Rice Disease detection."""
    print("\n" + "=" * 60)
    print("  RICE DISEASE DETECTION MODEL")
    print("=" * 60)

    train_ds, val_ds, class_names, class_weight_dict = load_rice_disease_data()
    model, history = train_model(
        train_ds, val_ds, class_names, class_weight_dict, "rice_disease"
    )
    accuracy = evaluate_model(model, val_ds, class_names, "rice_disease")
    plot_training_history(history, "rice_disease")
    save_model_artifacts(model, class_names, "rice_disease", accuracy)
    return accuracy


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  PLANT DISEASE DETECTION - CNN TRAINING PIPELINE")
    print("  Rice Disease (anshulm257/rice-disease-dataset)")
    print("=" * 60)
    print(f"  Image Size        : {IMG_SIZE}x{IMG_SIZE}")
    print(f"  Batch Size        : {BATCH_SIZE}")
    print(f"  Phase 1 Epochs    : {INITIAL_EPOCHS}")
    print(f"  Phase 2 Epochs    : {FINE_TUNE_EPOCHS}")
    print(f"  Label Smoothing   : {LABEL_SMOOTHING}")
    print(f"  Dropout           : {DROPOUT_RATE}")
    print(f"  Models Dir        : {MODELS_DIR}")
    print(f"  Plots Dir         : {PLOTS_DIR}")
    print(f"  Dataset Cache Dir : {DATASET_DIR}")
    print("=" * 60)

    rice_disease_accuracy = train_rice_disease()

    print("\n" + "=" * 60)
    print("  FINAL RESULTS SUMMARY")
    print("=" * 60)
    print(f"  Rice Disease Model - Validation Accuracy: {rice_disease_accuracy * 100:.2f}%")
    print("=" * 60)
    print(f"\n  Models saved to : {MODELS_DIR}")
    print(f"  Plots saved to  : {PLOTS_DIR}")
    print("=" * 60)
