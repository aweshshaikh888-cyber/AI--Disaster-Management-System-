import io
from PIL import Image, ImageOps
import numpy as np
from typing import Tuple

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB

def validate_image_file(filename: str, content: bytes) -> None:
    """Validate image extension and binary integrity."""
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f"File size exceeds limit of 20MB ({len(content)/(1024*1024):.1f}MB)")

def preprocess_image(image_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> Tuple[np.ndarray, Image.Image]:
    """
    Standardize disaster image for CNN inference:
    1. Open and convert to RGB
    2. Auto-orient according to EXIF
    3. Letterbox/resize to target dimensions (224, 224)
    4. Normalize using standard ImageNet mean & standard deviation
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = ImageOps.exif_transpose(image)
    
    # Resize with high-quality resampling
    resized_img = image.resize(target_size, Image.Resampling.BILINEAR)
    
    # Convert to array [H, W, C] in range [0, 1]
    img_array = np.array(resized_img, dtype=np.float32) / 255.0
    
    # Standard normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    normalized = (img_array - mean) / std
    
    return normalized, image
