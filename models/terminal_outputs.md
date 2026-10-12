# Project v3: Terminal Outputs & Training Execution Log

This document records the exact terminal outputs for the multimodal plant disease training pipeline (Project v3) across all **4 economic crops (Wheat, Rice, Sugarcane, Cotton)** and **33 canonical disease and healthy classes**.

---

## Table of Contents
1. [Phase 1 & 2: Data Collection & Profile Assignment (`data_collection.py`)](#1-data-collection--profile-assignment)
2. [Data Verification & Class Distribution (`check_data.py`)](#2-data-verification--class-distribution)
3. [Weather Feature Normalization Statistics (`compute_stats.py`)](#3-weather-feature-normalization-statistics)
4. [Multimodal Deep Learning Model Training (`train_multimodal.py`)](#4-multimodal-deep-learning-model-training)
5. [Comprehensive Evaluation on Unseen Test Split (`evaluate.py`)](#5-comprehensive-evaluation-on-unseen-test-split)
6. [Generated Outputs & Artifact Reference](#6-generated-outputs--artifact-reference)

---

## 1. Data Collection & Profile Assignment

**Command:**
```powershell
python data_collection.py
```

**Terminal Output:**
```text
════════════════════════════════════════════════════════════
PHASE 1: Building profile pools
  Target: 91 profiles × 33 disease classes = 3003 total profiles
════════════════════════════════════════════════════════════
Generating 13 pool profiles (91/class × 33 classes)...
Pool generation: 100%|██████████| 13/13 [00:00<00:00, 19522.36it/s, ok=13, fail=0]
Pool generation done. ok=13, fail=0

── Pool diversity summary ──
  wheat         Yellow Rust                     ✓
  wheat         Brown Rust                      ✓
  wheat         Black Rust                      ✓
  wheat         Mildew                          ✓
  wheat         Septoria                        ✓
  wheat         Tan Spot                        ✓
  wheat         Fusarium Head Blight            ✓
  wheat         Smut                            ✓
  wheat         Aphid                           ✓
  wheat         Mite                            ✓
  wheat         Blast                           ✓
  wheat         Common Root Rot                 ✓
  wheat         Stem Fly                        ✓
  wheat         Leaf Blight                     ⚠ only 87
  wheat         Healthy                         ✓
  rice          Leaf Blast                      ✓
  rice          Bacterial Leaf Blight           ✓
  rice          Brown Spot                      ✓
  rice          Sheath Blight                   ✓
  rice          Leaf Scald                      ✓
  rice          Healthy Rice Leaf               ✓
  sugarcane     Redrot                          ✓
  sugarcane     Mosaic                          ✓
  sugarcane     Rust                            ✓
  sugarcane     Yellow Disease                  ✓
  sugarcane     Healthy                         ✓
  cotton        Bacterial Blight                ✓
  cotton        Curl Virus                      ✓
  cotton        Leaf Reddening                  ✓
  cotton        Leaf Variegation                ✓
  cotton        Leaf Hopper Jassids             ⚠ only 82
  cotton        Herbicide Damage                ✓
  cotton        Healthy Leaf                    ✓

════════════════════════════════════════════════════════════
PHASE 2: Scanning images and assigning profiles
════════════════════════════════════════════════════════════
Total images found: 22221
  Assigned 22221 images | Skipped (no pool): 0

Saved 22221 records to d:\clg\major project\Project folder\projectv3\dataset\dataset_index.json

── Split distribution ──
  train :  15290  (68.8%)
  val   :   3622  (16.3%)
  test  :   3309  (14.9%)

── Crop distribution ──
  cotton      : 2137
  rice        : 3829
  sugarcane   : 2521
  wheat       : 13734

── Profile reuse stats ──
  Unique profiles used : 2990
  Mean reuse per profile: 7.4
  Max reuse (any profile): 16
```

---

## 2. Data Verification & Class Distribution

**Command:**
```powershell
python check_data.py
```

**Terminal Output:**
```text
Total records: 22221
✓ No duplicate image paths
✓ All 22221 weather files present
✓ All weather files have correct shape (7, 11)

── Split distribution ──
  train :  15290 ( 68.8%)
  val   :   3622 ( 16.3%)
  test  :   3309 ( 14.9%)

── Crop distribution ──
  cotton      : 2137
  rice        : 3829
  sugarcane   : 2521
  wheat       : 13734

── Disease counts per crop ──

  COTTON
    Leaf Reddening                     : 578
    Curl Virus                         : 431
    Herbicide Damage                   : 280
    Healthy Leaf                       : 257
    Bacterial Blight                   : 250
    Leaf Hopper Jassids                : 225
    Leaf Variegation                   : 116

  RICE
    Healthy Rice Leaf                  : 653
    Brown Spot                         : 646
    Bacterial Leaf Blight              : 636
    Leaf Blast                         : 634
    Sheath Blight                      : 632
    Leaf Scald                         : 628

  SUGARCANE
    Healthy                            : 522
    Redrot                             : 518
    Rust                               : 514
    Yellow Disease                     : 505
    Mosaic                             : 462

  WHEAT
    Smut                               : 1380
    Yellow Rust                        : 1301
    Brown Rust                         : 1271
    Septoria                           : 1214
    Mildew                             : 1151
    Healthy                            : 1070
    Aphid                              : 973
    Mite                               : 870
    Leaf Blight                        : 842
    Tan Spot                           : 840
    Blast                              : 717
    Common Root Rot                    : 614
    Fusarium Head Blight               : 611
    Black Rust                         : 576
    Stem Fly                           : 304

✓ weather_stats.npy present (mean shape: (11,))
```

---

## 3. Weather Feature Normalization Statistics

**Command:**
```powershell
python compute_stats.py
```

**Terminal Output:**
```text
Loading index from: d:\clg\major project\Project folder\projectv3\dataset\dataset_index.json
Train records: 15290 / 22221 total
Loading weather files: 100%|██████████| 15290/15290 [00:03<00:00, 3852.85it/s]

Stats saved to: d:\clg\major project\Project folder\projectv3\dataset\weather_stats.npy

── Per-feature statistics (train) ──
Feature                    Mean        Std
------------------------------------------
temp_max                27.3465     5.8795
temp_min                16.6545     6.9336
temp_mean               21.4693     6.2781
rh_max                  88.6729    13.6081
rh_mean                 71.0964    16.6532
precip_sum               3.6458     9.6461
dewpoint_mean           14.9722     6.7497
wind_max                14.2296     5.1802
soil_temp                0.0000     0.0000
month_sin                0.1045     0.7756
month_cos                0.1919     0.5921
```

---

## 4. Multimodal Deep Learning Model Training

**Command:**
```powershell
python train_multimodal.py --variant multimodal --epochs 50 --batch_size 32
```

**Training Execution Summary:**
```text
Device: cuda (NVIDIA GeForce RTX 3060 Laptop GPU)
Train: 15290 | Val: 3622

── Phase 1: Warmup (5 epochs) ──
  Warmup 1/5 | train_loss=2.9237 acc=0.2570 | val_loss=2.1942 acc=0.4837
  Warmup 2/5 | train_loss=2.2549 acc=0.4949 | val_loss=1.7594 acc=0.6538
  Warmup 3/5 | train_loss=2.0649 acc=0.5794 | val_loss=1.5845 acc=0.7200
  Warmup 4/5 | train_loss=1.9500 acc=0.6228 | val_loss=1.5221 acc=0.7432
  Warmup 5/5 | train_loss=1.9152 acc=0.6480 | val_loss=1.4232 acc=0.7822

── Phase 2: Full Fine-Tuning ──
Unfroze top 40% of backbone (18,355,912 params trainable)
  FT 01/50 | train_loss=1.7762 acc=0.7047 | val_loss=1.2267 acc=0.8614 | Best model saved
  FT 02/50 | train_loss=1.6511 acc=0.7635 | val_loss=1.1169 acc=0.8987 | Best model saved
  FT 03/50 | train_loss=1.5850 acc=0.7891 | val_loss=1.0902 acc=0.9097 | Best model saved
  FT 04/50 | train_loss=1.5023 acc=0.8218 | val_loss=1.0688 acc=0.9169 | Best model saved
  FT 05/50 | train_loss=1.4675 acc=0.8334 | val_loss=1.0332 acc=0.9257 | Best model saved
  FT 06/50 | train_loss=1.4933 acc=0.8282 | val_loss=1.0299 acc=0.9246
  FT 07/50 | train_loss=1.4537 acc=0.8406 | val_loss=1.0170 acc=0.9332 | Best model saved
  FT 08/50 | train_loss=1.4167 acc=0.8560 | val_loss=1.0035 acc=0.9409 | Best model saved
  FT 09/50 | train_loss=1.4651 acc=0.8363 | val_loss=1.0203 acc=0.9343
  FT 10/50 | train_loss=1.3986 acc=0.8608 | val_loss=1.0054 acc=0.9376
  FT 11/50 | train_loss=1.4251 acc=0.8497 | val_loss=1.0142 acc=0.9335
  FT 12/50 | train_loss=1.4389 acc=0.8490 | val_loss=1.0010 acc=0.9376
  FT 13/50 | train_loss=1.3515 acc=0.8718 | val_loss=0.9991 acc=0.9382
  FT 14/50 | train_loss=1.3913 acc=0.8625 | val_loss=0.9766 acc=0.9440 | Best model saved
  FT 15/50 | train_loss=1.3611 acc=0.8707 | val_loss=0.9885 acc=0.9415
  FT 16/50 | train_loss=1.3422 acc=0.8775 | val_loss=0.9779 acc=0.9417
  FT 17/50 | train_loss=1.3237 acc=0.8821 | val_loss=0.9774 acc=0.9473 | Best model saved
  FT 18/50 | train_loss=1.3369 acc=0.8786 | val_loss=0.9814 acc=0.9428
  FT 19/50 | train_loss=1.3829 acc=0.8619 | val_loss=0.9678 acc=0.9453
  FT 20/50 | train_loss=1.3089 acc=0.8849 | val_loss=0.9629 acc=0.9517 | Best model saved (PEAK)
  FT 21/50 | train_loss=1.3222 acc=0.8816 | val_loss=0.9576 acc=0.9484
  FT 22/50 | train_loss=1.3217 acc=0.8790 | val_loss=0.9571 acc=0.9478
  FT 23/50 | train_loss=1.2776 acc=0.8947 | val_loss=0.9659 acc=0.9481
  FT 24/50 | train_loss=1.3419 acc=0.8713 | val_loss=0.9588 acc=0.9498
  FT 25/50 | train_loss=1.3059 acc=0.8864 | val_loss=0.9660 acc=0.9495
  FT 26/50 | train_loss=1.2869 acc=0.8920 | val_loss=0.9570 acc=0.9492
  FT 27/50 | train_loss=1.3036 acc=0.8851 | val_loss=0.9588 acc=0.9500
  FT 28/50 | train_loss=1.3050 acc=0.8847 | val_loss=0.9615 acc=0.9498

Early stopping triggered at epoch 28 (patience=8 without beating 95.17%).
Best model weights saved to: outputs\best_model_multimodal.pth
```

---

## 5. Comprehensive Evaluation on Unseen Test Split

**Command:**
```powershell
python evaluate.py
```

**Terminal Output:**
```text
Device: cuda
Loading model weights from: d:\clg\major project\Project folder\projectv3\outputs\best_model_multimodal.pth
Loading test dataset...
Test samples: 3309
Evaluating Test Set: 100%|██████████| 104/104 [00:41<00:00, 2.53it/s]

============================================================
OVERALL CLASSIFICATION REPORT (3,309 TEST SAMPLES)
============================================================
                            precision    recall  f1-score   support

               wheat_Aphid       0.97      0.88      0.92       128
          wheat_Black Rust       0.78      0.93      0.85        68
               wheat_Blast       0.94      0.91      0.92       111
          wheat_Brown Rust       0.87      0.93      0.90        84
     wheat_Common Root Rot       0.86      0.94      0.90        54
wheat_Fusarium Head Blight       0.97      0.96      0.96        69
             wheat_Healthy       0.97      0.95      0.96       199
         wheat_Leaf Blight       0.76      0.63      0.69       124
              wheat_Mildew       0.99      0.97      0.98       252
                wheat_Mite       0.90      0.93      0.91        97
            wheat_Septoria       0.97      0.97      0.97       215
                wheat_Smut       0.99      0.98      0.98       363
            wheat_Stem Fly       0.94      0.98      0.96        48
            wheat_Tan Spot       0.72      0.83      0.77       128
         wheat_Yellow Rust       0.99      1.00      0.99       228
rice_Bacterial Leaf Blight       0.93      0.92      0.93        77
           rice_Brown Spot       0.93      0.98      0.96        57
    rice_Healthy Rice Leaf       1.00      1.00      1.00        80
           rice_Leaf Blast       0.96      0.91      0.94       104
           rice_Leaf Scald       0.94      1.00      0.97        97
        rice_Sheath Blight       1.00      0.97      0.99        70
         sugarcane_Healthy       0.94      0.98      0.96       106
          sugarcane_Mosaic       0.99      0.94      0.96        85
          sugarcane_Redrot       1.00      1.00      1.00        68
            sugarcane_Rust       1.00      0.99      0.99        74
  sugarcane_Yellow Disease       0.97      0.97      0.97        38
   cotton_Bacterial Blight       0.92      1.00      0.96        33
         cotton_Curl Virus       0.98      1.00      0.99        58
       cotton_Healthy Leaf       1.00      0.97      0.99        40
   cotton_Herbicide Damage       1.00      1.00      1.00        34
cotton_Leaf Hopper Jassids       0.92      1.00      0.96        23
     cotton_Leaf Reddening       1.00      0.93      0.97        76
   cotton_Leaf Variegation       1.00      1.00      1.00        21

                  accuracy                           0.94      3309
                 macro avg       0.94      0.95      0.95      3309
              weighted avg       0.95      0.94      0.94      3309


============================================================
CROP: WHEAT (15 CLASSES)
============================================================
                            precision    recall  f1-score   support

               wheat_Aphid       0.97      0.88      0.92       128
          wheat_Black Rust       0.78      0.93      0.85        68
               wheat_Blast       0.94      0.91      0.92       111
          wheat_Brown Rust       0.87      0.93      0.90        84
     wheat_Common Root Rot       0.86      0.94      0.90        54
wheat_Fusarium Head Blight       0.97      0.96      0.96        69
             wheat_Healthy       0.97      0.95      0.96       199
         wheat_Leaf Blight       0.76      0.63      0.69       124
              wheat_Mildew       0.99      0.97      0.98       252
                wheat_Mite       0.90      0.93      0.91        97
            wheat_Septoria       0.97      0.97      0.97       215
                wheat_Smut       0.99      0.98      0.98       363
            wheat_Stem Fly       0.94      0.98      0.96        48
            wheat_Tan Spot       0.72      0.83      0.77       128
         wheat_Yellow Rust       0.99      1.00      0.99       228

                 micro avg       0.93      0.93      0.93      2168
                 macro avg       0.91      0.92      0.91      2168
              weighted avg       0.93      0.93      0.93      2168

Saved confusion matrix: outputs\confusion_matrix_wheat_multimodal.png
Saved F1 bar chart: outputs\f1_wheat_multimodal.png

============================================================
CROP: RICE (6 CLASSES)
============================================================
                            precision    recall  f1-score   support

rice_Bacterial Leaf Blight       0.93      0.92      0.93        77
           rice_Brown Spot       0.93      0.98      0.96        57
    rice_Healthy Rice Leaf       1.00      1.00      1.00        80
           rice_Leaf Blast       0.96      0.91      0.94       104
           rice_Leaf Scald       0.95      1.00      0.97        97
        rice_Sheath Blight       1.00      0.97      0.99        70

                  accuracy                           0.96       485
                 macro avg       0.96      0.96      0.96       485
              weighted avg       0.96      0.96      0.96       485

Saved confusion matrix: outputs\confusion_matrix_rice_multimodal.png
Saved F1 bar chart: outputs\f1_rice_multimodal.png

============================================================
CROP: SUGARCANE (5 CLASSES)
============================================================
                          precision    recall  f1-score   support

       sugarcane_Healthy       0.94      0.98      0.96       106
        sugarcane_Mosaic       0.99      0.94      0.96        85
        sugarcane_Redrot       1.00      1.00      1.00        68
          sugarcane_Rust       1.00      0.99      0.99        74
sugarcane_Yellow Disease       0.97      0.97      0.97        38

                accuracy                           0.98       371
               macro avg       0.98      0.98      0.98       371
            weighted avg       0.98      0.98      0.98       371

Saved confusion matrix: outputs\confusion_matrix_sugarcane_multimodal.png
Saved F1 bar chart: outputs\f1_sugarcane_multimodal.png

============================================================
CROP: COTTON (7 CLASSES)
============================================================
                            precision    recall  f1-score   support

   cotton_Bacterial Blight       0.92      1.00      0.96        33
         cotton_Curl Virus       0.98      1.00      0.99        58
       cotton_Healthy Leaf       1.00      0.97      0.99        40
   cotton_Herbicide Damage       1.00      1.00      1.00        34
cotton_Leaf Hopper Jassids       0.92      1.00      0.96        23
     cotton_Leaf Reddening       1.00      0.93      0.97        76
   cotton_Leaf Variegation       1.00      1.00      1.00        21

                  accuracy                           0.98       285
                 macro avg       0.97      0.99      0.98       285
              weighted avg       0.98      0.98      0.98       285

Saved confusion matrix: outputs\confusion_matrix_cotton_multimodal.png
Saved F1 bar chart: outputs\f1_cotton_multimodal.png

Completed evaluation! All outputs written to: d:\clg\major project\Project folder\projectv3\outputs
```

---

## 6. Generated Outputs & Artifact Reference

| Artifact | File Path | Description |
| :--- | :--- | :--- |
| **Model Weights** | [`outputs/best_model_multimodal.pth`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/best_model_multimodal.pth) | Best multimodal network checkpoint (81.4 MB) |
| **Full Report** | [`outputs/classification_report_multimodal.txt`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/classification_report_multimodal.txt) | Detailed per-class precision, recall, F1, support |
| **Training Curve** | [`outputs/training_history_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/training_history_multimodal.png) | Loss & Accuracy progression across epochs |
| **Overall F1 Bar Chart** | [`outputs/f1_per_class_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/f1_per_class_multimodal.png) | F1-score visualization across all 33 classes |
| **Wheat Confusion Matrix** | [`outputs/confusion_matrix_wheat_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/confusion_matrix_wheat_multimodal.png) | 15×15 Wheat disease confusion matrix |
| **Wheat F1 Bar Chart** | [`outputs/f1_wheat_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/f1_wheat_multimodal.png) | F1 scores across 15 Wheat disease classes |
| **Rice Confusion Matrix** | [`outputs/confusion_matrix_rice_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/confusion_matrix_rice_multimodal.png) | 6×6 Rice disease confusion matrix |
| **Rice F1 Bar Chart** | [`outputs/f1_rice_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/f1_rice_multimodal.png) | F1 scores across 6 Rice disease classes |
| **Sugarcane Confusion Matrix**| [`outputs/confusion_matrix_sugarcane_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/confusion_matrix_sugarcane_multimodal.png) | 5×5 Sugarcane disease confusion matrix |
| **Sugarcane F1 Bar Chart** | [`outputs/f1_sugarcane_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/f1_sugarcane_multimodal.png) | F1 scores across 5 Sugarcane disease classes |
| **Cotton Confusion Matrix** | [`outputs/confusion_matrix_cotton_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/confusion_matrix_cotton_multimodal.png) | 7×7 Cotton disease confusion matrix |
| **Cotton F1 Bar Chart** | [`outputs/f1_cotton_multimodal.png`](file:///d:/clg/major%20project/Project%20folder/projectv3/outputs/f1_cotton_multimodal.png) | F1 scores across 7 Cotton disease classes |
| **Dataset Index** | [`dataset/dataset_index.json`](file:///d:/clg/major%20project/Project%20folder/projectv3/dataset/dataset_index.json) | Metadata mapping 22,221 samples to weather profiles |
| **Weather Statistics** | [`dataset/weather_stats.npy`](file:///d:/clg/major%20project/Project%20folder/projectv3/dataset/weather_stats.npy) | Z-score normalization parameters for 11 weather features |
