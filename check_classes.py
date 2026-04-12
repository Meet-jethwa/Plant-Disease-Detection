import sys
from pathlib import Path

# Add current dir to path to import train_sugarcane_cotton
sys.path.append(str(Path(__file__).parent))
import train_sugarcane_cotton as tsc

cotton_dir = Path("dataset/Cotton")
class_to_images = tsc.scan_dataset_dir(cotton_dir, tsc.COTTON_CLASSES, "cotton")

found = [c for c, imgs in class_to_images.items() if len(imgs) > 0]

print("\n=== FINAL RESULT ===")
print(f"Total classes found with images: {len(found)} out of {len(tsc.COTTON_CLASSES)}")
print("Found classes:")
for c in found:
    print(f" - {c} ({len(class_to_images[c])} images)")

missing = [c for c in tsc.COTTON_CLASSES if c not in found]
print("\nMissing classes:")
for c in missing:
    print(f" - {c}")
