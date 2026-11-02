"""
=============================================================================
Helper Script: Create Sample Disaster Images & Simulated Drone Flight Video
=============================================================================
Generates turnkey test assets in the data/ folder:
1. data/sample_images/high_damage.jpg (Severe crack/rubble pattern)
2. data/sample_images/medium_damage.jpg (Moderate fissure pattern)
3. data/sample_images/low_damage.jpg (Intact structure pattern)
4. data/sample_drone_clip.mp4 (Simulated aerial drone flyover video)
"""

from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
import cv2

DATA_DIR = Path(__file__).resolve().parent
SAMPLE_IMG_DIR = DATA_DIR / "sample_images"
SAMPLE_IMG_DIR.mkdir(parents=True, exist_ok=True)


def create_sample_images():
    """Generates synthetic high, medium, and low damage test images."""
    np.random.seed(42)

    # 1. High Damage Image (Heavy rubble, jagged shear fractures, dense cracks)
    high_img = Image.new("RGB", (320, 320), color=(90, 85, 80))
    draw = ImageDraw.Draw(high_img)
    # Add heavy debris texture
    for _ in range(600):
        x = np.random.randint(10, 310)
        y = np.random.randint(10, 310)
        r = np.random.randint(2, 8)
        color = (np.random.randint(160, 240), np.random.randint(40, 90), np.random.randint(20, 50))
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
    # Add deep jagged cracks
    for _ in range(12):
        x1, y1 = np.random.randint(20, 300), np.random.randint(20, 300)
        x2, y2 = x1 + np.random.randint(-70, 70), y1 + np.random.randint(-70, 70)
        draw.line([x1, y1, x2, y2], fill=(20, 20, 20), width=4)
        draw.line([x1+2, y1+2, x2+2, y2+2], fill=(220, 50, 40), width=2)
    high_path = SAMPLE_IMG_DIR / "high_damage.jpg"
    high_img.save(high_path, "JPEG", quality=95)
    print(f"Created: {high_path}")

    # 2. Medium Damage Image (Partial cracks, moderate surface fractures)
    med_img = Image.new("RGB", (320, 320), color=(140, 135, 125))
    draw_med = ImageDraw.Draw(med_img)
    for _ in range(120):
        x = np.random.randint(20, 300)
        y = np.random.randint(20, 300)
        r = np.random.randint(2, 5)
        draw_med.ellipse([x-r, y-r, x+r, y+r], fill=(180, 120, 50))
    # A few diagonal wall cracks
    draw_med.line([50, 60, 240, 220], fill=(40, 40, 40), width=3)
    draw_med.line([120, 200, 280, 290], fill=(40, 40, 40), width=2)
    med_path = SAMPLE_IMG_DIR / "medium_damage.jpg"
    med_img.save(med_path, "JPEG", quality=95)
    print(f"Created: {med_path}")

    # 3. Low / No Damage Image (Smooth, intact architectural lines)
    low_img = Image.new("RGB", (320, 320), color=(210, 215, 220))
    draw_low = ImageDraw.Draw(low_img)
    # Clean architectural facade grid lines
    for y in range(40, 300, 45):
        draw_low.line([30, y, 290, y], fill=(180, 185, 190), width=2)
    for x in range(40, 300, 50):
        draw_low.line([x, 30, x, 290], fill=(180, 185, 190), width=2)
    low_path = SAMPLE_IMG_DIR / "low_damage.jpg"
    low_img.save(low_path, "JPEG", quality=95)
    print(f"Created: {low_path}")


def create_sample_drone_video():
    """Creates a sample MP4 drone flyover video."""
    video_path = DATA_DIR / "sample_drone_clip.mp4"
    width, height = 640, 480
    fps = 20.0
    num_frames = 100

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(video_path), fourcc, fps, (width, height))

    for i in range(num_frames):
        # Earth tone base
        frame = np.full((height, width, 3), (85, 100, 110), dtype=np.uint8)

        # Flyover motion simulation (shifting y)
        shift_y = int((i * 4) % height)

        # Roads
        cv2.line(frame, (120, (shift_y + 40) % height), (520, (shift_y + 360) % height), (40, 40, 40), 10)

        # Building blocks with rubble
        for bx, by, bw, bh, is_damaged in [
            (160, 100, 90, 80, True),
            (340, 200, 110, 90, True),
            (100, 300, 80, 70, False),
            (420, 80, 100, 85, False)
        ]:
            pos_y = (by + shift_y) % height
            box_col = (50, 60, 70) if is_damaged else (140, 150, 160)
            cv2.rectangle(frame, (bx, pos_y), (bx + bw, pos_y + bh), box_col, -1)
            if is_damaged:
                cv2.line(frame, (bx + 15, pos_y + 15), (bx + bw - 15, pos_y + bh - 15), (200, 45, 45), 3)

        out.write(frame)

    out.release()
    print(f"Created: {video_path}")


if __name__ == "__main__":
    create_sample_images()
    create_sample_drone_video()
    print("All sample data assets generated successfully.")
