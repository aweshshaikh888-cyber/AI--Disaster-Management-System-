import time
import uuid
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
from PIL import Image

from app.core.config import settings
from app.ai.image_preprocessing import validate_image_file, preprocess_image
from app.ai.cnn_architecture import DisasterCNNArchitecture

# Singleton CNN instance
disaster_model = DisasterCNNArchitecture()

def generate_gradcam_overlay(original_image: Image.Image, activation_map: np.ndarray, output_path: Path) -> str:
    """
    Generate Grad-CAM visual heatmap overlaid on original disaster image:
    1. Upscale 14x14 activation map to original image resolution with bilinear filter
    2. Color-map using Jet colormap (Red = high damage impact, Blue = background)
    3. Alpha-blend with original image
    4. Save to disk and return relative URL
    """
    orig_w, orig_h = original_image.size
    
    # Resize activation map to image dimensions using PIL
    heat_pil = Image.fromarray((activation_map * 255).astype(np.uint8), mode='L')
    heat_resized = heat_pil.resize((orig_w, orig_h), Image.Resampling.BICUBIC)
    heat_arr = np.array(heat_resized, dtype=np.float32) / 255.0
    
    # Custom Jet colormap calculation in pure NumPy
    # Map [0, 1] to RGB heatmap
    r = np.clip(1.5 - np.abs(heat_arr * 4 - 3), 0, 1)
    g = np.clip(1.5 - np.abs(heat_arr * 4 - 2), 0, 1)
    b = np.clip(1.5 - np.abs(heat_arr * 4 - 1), 0, 1)
    
    colormap_rgb = np.stack([r, g, b], axis=-1) * 255.0
    colormap_pil = Image.fromarray(colormap_rgb.astype(np.uint8), mode='RGB')
    
    # Blend 65% original + 35% Grad-CAM heatmap
    blended = Image.blend(original_image.convert("RGB"), colormap_pil, alpha=0.45)
    
    # Save output
    blended.save(output_path, "JPEG", quality=90)
    return f"/uploads/gradcam/{output_path.name}"

def generate_recommendations(predicted_class: str, disaster_category: str) -> list:
    """Generate operational emergency response protocols based on predicted damage class."""
    recommendations = []
    
    if predicted_class == "Critical Damage":
        recommendations.extend([
            "IMMEDIATE EVACUATION: Establish a 100-meter safety cordon around the structure.",
            "DEPLOY USAR: Dispatch Urban Search and Rescue team with acoustic listening & K9 units immediately.",
            "GAS & POWER SHUTOFF: Notify municipal grid operators to cut high-voltage and gas lines to prevent secondary fires.",
            "TRIAGE PREPARATION: Alert nearest Level-1 trauma centers for imminent casualty intake."
        ])
    elif predicted_class == "Severe Damage":
        recommendations.extend([
            "STRUCTURAL RESTRICTION: Mark perimeter as RED - Unsafe for occupancy.",
            "RESCUE DISPATCH: Deploy heavy rescue squad with hydraulic cutters and stabilization shoring.",
            "NEIGHBORING SURVEY: Inspect adjacent structures for risk of progressive secondary collapse.",
            "DISPATCH AMBULANCES: Mobilize 2 advanced life support (ALS) ambulances to staging point."
        ])
    elif predicted_class == "Moderate Damage":
        recommendations.extend([
            "STRUCTURAL ASSESSMENT: Require rapid on-site visual safety assessment by certified structural engineer.",
            "TEMPORARY EVACUATION: Relocate occupants to nearest designated relief shelter pending inspection.",
            "HAZARD MITIGATION: Secure fallen masonry, loose parapets, and shattered glazing."
        ])
    elif predicted_class == "Low Damage":
        recommendations.extend([
            "CAUTIONARY MONITORING: Structure exhibits minor superficial/cosmetic damage.",
            "UTILITY AUDIT: Verify water and electrical lines for micro-fractures before continuous use.",
            "MONITOR AFTERSHOCKS: Maintain alert status in seismic or active flood sectors."
        ])
    else: # No Damage
        recommendations.extend([
            "VISUAL CLEARANCE: No macroscopic structural failure detected on exterior facade.",
            "SAFETY NOTICE: A classification of 'No Damage' does not guarantee complete structural integrity; internal foundations must still be certified by authorities prior to re-entry.",
            "SECONDARY AUDIT: Check roof and foundation drainage if flood waters were active."
        ])
        
    return recommendations

def analyze_disaster_image(
    image_bytes: bytes,
    original_filename: str,
    disaster_category: str = "Unknown",
    location_name: str = "Unspecified Location",
    latitude: float = 0.0,
    longitude: float = 0.0
) -> Dict[str, Any]:
    """
    Execute end-to-end disaster damage analysis:
    1. Validation
    2. Preprocessing
    3. CNN inference
    4. Grad-CAM generation
    5. Actionable recommendations & safety advisories
    """
    start_time = time.time()
    validate_image_file(original_filename, image_bytes)
    
    # Save original image to uploads
    unique_id = str(uuid.uuid4())[:12]
    ext = Path(original_filename).suffix.lower() or ".jpg"
    orig_filename = f"{unique_id}_orig{ext}"
    orig_path = settings.UPLOADS_DIR / orig_filename
    
    with open(orig_path, "wb") as f:
        f.write(image_bytes)
    original_image_url = f"/uploads/{orig_filename}"
    
    # Preprocess
    normalized_tensor, pil_image = preprocess_image(image_bytes)
    
    # CNN forward inference
    predicted_class, confidence, probabilities, activation_map, metrics = disaster_model.forward(
        normalized_tensor, disaster_category
    )
    
    # Generate Grad-CAM visualization
    gradcam_filename = f"{unique_id}_gradcam.jpg"
    gradcam_path = settings.GRADCAM_DIR / gradcam_filename
    gradcam_url = generate_gradcam_overlay(pil_image, activation_map, gradcam_path)
    
    # Execution time
    execution_time_ms = round((time.time() - start_time) * 1000, 2)
    
    # Severity mapping
    severity_map = {
        "No Damage": "Low Priority / Safe",
        "Low Damage": "Low Priority",
        "Moderate Damage": "Medium Priority",
        "Severe Damage": "High Priority",
        "Critical Damage": "CRITICAL EMERGENCY"
    }
    
    recommendations = generate_recommendations(predicted_class, disaster_category)
    
    return {
        "analysis_id": unique_id,
        "filename": original_filename,
        "image_url": original_image_url,
        "gradcam_url": gradcam_url,
        "predicted_class": predicted_class,
        "confidence": confidence,
        "confidence_percentage": round(confidence * 100, 1),
        "severity_level": severity_map.get(predicted_class, "Medium Priority"),
        "disaster_type": disaster_category,
        "location_name": location_name,
        "latitude": latitude,
        "longitude": longitude,
        "class_probabilities": probabilities,
        "feature_metrics": metrics,
        "recommended_actions": recommendations,
        "structural_safety_disclaimer": "DISCLAIMER: AI image analysis identifies visual surface damage only. A building classified with 'No Damage' or 'Low Damage' must NOT automatically be considered structurally safe to enter without official civil engineer inspection.",
        "model_version": disaster_model.version,
        "model_name": disaster_model.model_name,
        "execution_time_ms": execution_time_ms,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "is_demo_calibrated": True
    }
