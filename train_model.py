"""
Plant Disease Detection Model - Training Script
================================================
Trains CNN models for Rice and Wheat plant disease classification
using Transfer Learning with EfficientNetB0.

Key techniques for >90% accuracy:
- Transfer Learning (EfficientNetB0 pretrained on ImageNet)
- Heavy Data Augmentation 
- Progressive Fine-tuning (freeze -> train head -> unfreeze -> fine-tune)
- Class Weight Balancing
- Label Smoothing
- Learning Rate Scheduling (ReduceLROnPlateau)
- Early Stopping
- Dropout Regularization
"""

import os
import json
import numpy as np
import pandas as pd
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

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
INITIAL_EPOCHS = 15
FINE_TUNE_EPOCHS = 20
LABEL_SMOOTHING = 0.1
DROPOUT_RATE = 0.4
SEED = 42

BASE_DIR = Path(r"d:\clg\major project\Project folder")
MODELS_DIR = BASE_DIR / "models"
PLOTS_DIR = BASE_DIR / "plots"
MODELS_DIR.mkdir(exist_ok=True)
PLOTS_DIR.mkdir(exist_ok=True)

tf.random.set_seed(SEED)
np.random.seed(SEED)

print(f"TensorFlow version: {tf.__version__}")
print(f"Available devices: {[d.device_type for d in tf.config.list_physical_devices()]}")


# ─── Model Builder ──────────────────────────────────────────────────────────

def build_model(num_classes):
    """
    Build EfficientNetB0 transfer learning model with augmentation
    built directly into the model graph.
    """
    # EfficientNetB0 backbone
    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
    )
    base_model.trainable = False

    # Build model using Functional API
    inputs = layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name="input_image")

    # Data augmentation layers (only active during training)
    x = layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = layers.RandomRotation(0.3)(x)
    x = layers.RandomZoom((-0.2, 0.2))(x)
    x = layers.RandomContrast(0.3)(x)
    x = layers.RandomBrightness(0.2)(x)
    x = layers.RandomTranslation(0.1, 0.1)(x)

    # EfficientNetB0 feature extraction
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = layers.Dense(256, activation="relu", name="dense_head")(x)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(DROPOUT_RATE, name="dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = Model(inputs, outputs, name="PlantDiseaseClassifier")
    return model, base_model


def compile_model(model, learning_rate=1e-3):
    """Compile model with label smoothing and Adam optimizer."""
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=LABEL_SMOOTHING),
        metrics=["accuracy"]
    )
    return model


# ─── Data Loading: Rice ─────────────────────────────────────────────────────

def load_rice_data():
    """Load rice paddy disease dataset from directory structure."""
    rice_dir = BASE_DIR / "rice paddy disease dataset"
    train_img_dir = rice_dir / "train_images"
    csv_path = rice_dir / "train.csv"

    print("\n" + "=" * 60)
    print("  LOADING RICE PADDY DISEASE DATASET")
    print("=" * 60)

    df = pd.read_csv(csv_path)
    print(f"Total samples in CSV: {len(df)}")
    print(f"Classes: {df['label'].nunique()}")
    print(f"\nClass distribution:\n{df['label'].value_counts()}\n")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_img_dir,
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        seed=SEED,
        validation_split=0.2,
        subset="training",
        shuffle=True,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        train_img_dir,
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        seed=SEED,
        validation_split=0.2,
        subset="validation",
        shuffle=False,
    )

    class_names = train_ds.class_names
    print(f"Classes loaded: {class_names}")

    # Compute class weights
    all_labels = []
    for _, labels in train_ds.unbatch():
        all_labels.append(np.argmax(labels.numpy()))
    all_labels = np.array(all_labels)

    class_weights_arr = compute_class_weight(
        'balanced', classes=np.unique(all_labels), y=all_labels
    )
    class_weight_dict = dict(enumerate(class_weights_arr))
    print(f"Class weights computed for {len(class_weight_dict)} classes.")

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, class_names, class_weight_dict


# ─── Data Loading: Wheat ────────────────────────────────────────────────────

def load_wheat_data():
    """Load wheat plant disease dataset from directory structure."""
    wheat_dir = BASE_DIR / "wheat" / "data"

    print("\n" + "=" * 60)
    print("  LOADING WHEAT PLANT DISEASE DATASET")
    print("=" * 60)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        wheat_dir / "train",
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        seed=SEED,
        shuffle=True,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        wheat_dir / "valid",
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        seed=SEED,
        shuffle=False,
    )

    test_ds = tf.keras.utils.image_dataset_from_directory(
        wheat_dir / "test",
        label_mode="categorical",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        seed=SEED,
        shuffle=False,
    )

    class_names = train_ds.class_names
    print(f"Classes loaded: {class_names}")

    all_labels = []
    for _, labels in train_ds.unbatch():
        all_labels.append(np.argmax(labels.numpy()))
    all_labels = np.array(all_labels)

    unique, counts = np.unique(all_labels, return_counts=True)
    for cls_idx, count in zip(unique, counts):
        print(f"  {class_names[cls_idx]}: {count} samples")

    class_weights_arr = compute_class_weight(
        'balanced', classes=np.unique(all_labels), y=all_labels
    )
    class_weight_dict = dict(enumerate(class_weights_arr))
    print(f"Class weights computed.")

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    test_ds = test_ds.prefetch(buffer_size=AUTOTUNE)

    return train_ds, val_ds, test_ds, class_names, class_weight_dict


# ─── Training Pipeline ──────────────────────────────────────────────────────

def train_model(train_ds, val_ds, class_names, class_weight_dict, crop_name):
    """Two-phase training: frozen backbone then fine-tune top layers."""
    num_classes = len(class_names)
    model, base_model = build_model(num_classes)
    model = compile_model(model, learning_rate=1e-3)

    model.summary()

    checkpoint_path = str(MODELS_DIR / f"{crop_name}_best_model.keras")

    callbacks_phase1 = [
        EarlyStopping(
            monitor='val_accuracy', patience=5,
            restore_best_weights=True, verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss', factor=0.5,
            patience=3, min_lr=1e-6, verbose=1
        ),
        ModelCheckpoint(
            checkpoint_path, monitor='val_accuracy',
            save_best_only=True, verbose=1
        ),
    ]

    # Phase 1
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

    phase1_val_acc = max(history1.history['val_accuracy'])
    print(f"\n Phase 1 Best Val Accuracy: {phase1_val_acc:.4f}")

    # Phase 2: Fine-tune
    print(f"\n{'=' * 60}")
    print(f"  PHASE 2: Fine-tuning Top Layers ({crop_name.upper()})")
    print(f"{'=' * 60}")

    base_model.trainable = True
    total_layers = len(base_model.layers)
    freeze_until = int(total_layers * 0.7)

    for layer in base_model.layers[:freeze_until]:
        layer.trainable = False

    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    print(f"Unfroze {trainable_count}/{total_layers} layers for fine-tuning")

    model = compile_model(model, learning_rate=1e-4)

    callbacks_phase2 = [
        EarlyStopping(
            monitor='val_accuracy', patience=7,
            restore_best_weights=True, verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss', factor=0.5,
            patience=3, min_lr=1e-7, verbose=1
        ),
        ModelCheckpoint(
            checkpoint_path, monitor='val_accuracy',
            save_best_only=True, verbose=1
        ),
    ]

    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=callbacks_phase2,
        class_weight=class_weight_dict,
        verbose=1,
    )

    phase2_val_acc = max(history2.history['val_accuracy'])
    print(f"\n Phase 2 Best Val Accuracy: {phase2_val_acc:.4f}")

    # Load best weights
    model = tf.keras.models.load_model(checkpoint_path)

    # Combine histories
    combined_history = {}
    for key in history1.history:
        combined_history[key] = history1.history[key] + history2.history[key]

    return model, combined_history


# ─── Evaluation ──────────────────────────────────────────────────────────────

def evaluate_model(model, val_ds, class_names, crop_name):
    """Generate classification report and confusion matrix."""
    print(f"\n{'=' * 60}")
    print(f"  EVALUATION: {crop_name.upper()}")
    print(f"{'=' * 60}")

    y_true = []
    y_pred = []

    for images, labels in val_ds:
        predictions = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(predictions, axis=1))

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    accuracy = np.mean(y_true == y_pred)
    print(f"\n Overall Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

    report = classification_report(y_true, y_pred, target_names=class_names)
    print(f"\nClassification Report:\n{report}")

    report_path = MODELS_DIR / f"{crop_name}_classification_report.txt"
    with open(report_path, 'w') as f:
        f.write(f"{'=' * 60}\n")
        f.write(f"  {crop_name.upper()} Disease Detection - Classification Report\n")
        f.write(f"{'=' * 60}\n\n")
        f.write(f"Overall Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)\n\n")
        f.write(report)

    cm = confusion_matrix(y_true, y_pred)
    fig_size = max(10, len(class_names) * 0.9)
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
    print(f" Confusion matrix saved to: {cm_path}")

    return accuracy


# ─── Plot Training History ───────────────────────────────────────────────────

def plot_training_history(history, crop_name):
    """Plot and save training accuracy/loss curves."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

    ax1.plot(history['accuracy'], label='Train Accuracy', linewidth=2, color='#2196F3')
    ax1.plot(history['val_accuracy'], label='Val Accuracy', linewidth=2, color='#FF5722')
    ax1.set_title(f'{crop_name.title()} - Model Accuracy', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend(fontsize=11)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([0, 1.05])

    phase1_len = INITIAL_EPOCHS
    if len(history['accuracy']) > phase1_len:
        ax1.axvline(x=phase1_len - 1, color='gray', linestyle='--', alpha=0.7)
        ax1.text(phase1_len - 0.5, 0.05, 'Fine-tune\nstart', fontsize=9, color='gray')

    ax2.plot(history['loss'], label='Train Loss', linewidth=2, color='#2196F3')
    ax2.plot(history['val_loss'], label='Val Loss', linewidth=2, color='#FF5722')
    ax2.set_title(f'{crop_name.title()} - Model Loss', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend(fontsize=11)
    ax2.grid(True, alpha=0.3)

    if len(history['loss']) > phase1_len:
        ax2.axvline(x=phase1_len - 1, color='gray', linestyle='--', alpha=0.7)

    plt.suptitle(f'{crop_name.title()} Plant Disease Detection - Training Progress',
                 fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()

    plot_path = PLOTS_DIR / f"{crop_name}_training_history.png"
    plt.savefig(plot_path, dpi=200, bbox_inches='tight')
    plt.close()
    print(f" Training plots saved to: {plot_path}")


# ─── Save Model Artifacts ───────────────────────────────────────────────────

def save_model_artifacts(model, class_names, crop_name, accuracy):
    """Save model and class label mapping."""
    model_path = MODELS_DIR / f"{crop_name}_disease_model.keras"
    model.save(model_path)
    print(f" Model saved to: {model_path}")

    labels_path = MODELS_DIR / f"{crop_name}_class_labels.json"
    label_map = {i: name for i, name in enumerate(class_names)}
    with open(labels_path, 'w') as f:
        json.dump(label_map, f, indent=2)
    print(f" Class labels saved to: {labels_path}")

    summary_path = MODELS_DIR / f"{crop_name}_model_info.json"
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
            "Label Smoothing (0.1)",
            "Dropout (0.4)",
            "ReduceLROnPlateau",
            "EarlyStopping",
            "BatchNormalization",
        ]
    }
    with open(summary_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f" Model info saved to: {summary_path}")


# ─── Main Training Pipelines ────────────────────────────────────────────────

def train_rice():
    """Complete training pipeline for Rice disease detection."""
    print("\n" + "=" * 60)
    print("  RICE PADDY DISEASE DETECTION MODEL")
    print("=" * 60)

    train_ds, val_ds, class_names, class_weight_dict = load_rice_data()
    model, history = train_model(train_ds, val_ds, class_names, class_weight_dict, "rice")
    accuracy = evaluate_model(model, val_ds, class_names, "rice")
    plot_training_history(history, "rice")
    save_model_artifacts(model, class_names, "rice", accuracy)
    return accuracy


def train_wheat():
    """Complete training pipeline for Wheat disease detection."""
    print("\n" + "=" * 60)
    print("  WHEAT PLANT DISEASE DETECTION MODEL")
    print("=" * 60)

    train_ds, val_ds, test_ds, class_names, class_weight_dict = load_wheat_data()
    model, history = train_model(train_ds, val_ds, class_names, class_weight_dict, "wheat")
    val_accuracy = evaluate_model(model, val_ds, class_names, "wheat")

    print(f"\n{'=' * 60}")
    print(f"  TEST SET EVALUATION: WHEAT")
    print(f"{'=' * 60}")
    test_accuracy = evaluate_model(model, test_ds, class_names, "wheat_test")

    plot_training_history(history, "wheat")
    save_model_artifacts(model, class_names, "wheat", val_accuracy)
    return val_accuracy, test_accuracy


# ─── Entry Point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  PLANT DISEASE DETECTION - CNN TRAINING PIPELINE")
    print("=" * 60)
    print(f"  Image Size: {IMG_SIZE}x{IMG_SIZE}")
    print(f"  Batch Size: {BATCH_SIZE}")
    print(f"  Phase 1 Epochs: {INITIAL_EPOCHS}")
    print(f"  Phase 2 Epochs (Fine-tune): {FINE_TUNE_EPOCHS}")
    print(f"  Label Smoothing: {LABEL_SMOOTHING}")
    print(f"  Dropout: {DROPOUT_RATE}")
    print("=" * 60)

    # Train Rice model
    rice_accuracy = train_rice()

    # Train Wheat model
    wheat_val_acc, wheat_test_acc = train_wheat()

    # Final Summary
    print("\n" + "=" * 60)
    print("  FINAL RESULTS SUMMARY")
    print("=" * 60)
    print(f"  Rice Model  - Validation Accuracy: {rice_accuracy * 100:.2f}%")
    print(f"  Wheat Model - Validation Accuracy: {wheat_val_acc * 100:.2f}%")
    print(f"  Wheat Model - Test Accuracy:       {wheat_test_acc * 100:.2f}%")
    print("=" * 60)
    print(f"\n  Models saved to: {MODELS_DIR}")
    print(f"  Plots saved to:  {PLOTS_DIR}")
    print("=" * 60)
