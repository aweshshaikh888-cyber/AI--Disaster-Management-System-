from typing import Dict, Any, List
from app.core.config import settings

AVAILABLE_MODELS = {
    "DisasterCNN-v2.4-Augmented": {
        "name": "DisasterCNN-v2.4-Augmented (ResNet-50 Feature Backbone)",
        "version": "2.4.0",
        "reported_accuracy": 98.12,
        "baseline_accuracy": 90.10,
        "augmentation_uplift": 8.02,
        "parameters": "25.6M",
        "input_dimensions": "224x224x3 (RGB)",
        "training_epochs": 50,
        "status": "Active / Loaded",
        "augmentation_techniques": [
            "Random Rotation (±30°)",
            "Perspective & Shear Distortion",
            "Color Jitter (Brightness/Contrast ±20%)",
            "Synthetic Smoke & Haze Simulation",
            "Random Horizontal / Vertical Flips"
        ],
        "description": "State-of-the-art CNN model fine-tuned on satellite, aerial drone, and ground disaster imagery with heavy spatial augmentation."
    },
    "DisasterCNN-v1.0-Baseline": {
        "name": "DisasterCNN-v1.0-Baseline (Standard ConvNet)",
        "version": "1.0.0",
        "reported_accuracy": 90.10,
        "baseline_accuracy": 90.10,
        "augmentation_uplift": 0.0,
        "parameters": "14.2M",
        "input_dimensions": "224x224x3 (RGB)",
        "training_epochs": 30,
        "status": "Archived Benchmark",
        "augmentation_techniques": ["Basic Horizontal Flip"],
        "description": "Initial baseline model trained without specialized disaster augmentation techniques."
    }
}

active_model_key = "DisasterCNN-v2.4-Augmented"

def get_active_model_info() -> Dict[str, Any]:
    return AVAILABLE_MODELS.get(active_model_key, list(AVAILABLE_MODELS.values())[0])

def list_available_models() -> List[Dict[str, Any]]:
    return list(AVAILABLE_MODELS.values())

def switch_active_model(model_version: str) -> Dict[str, Any]:
    global active_model_key
    if model_version in AVAILABLE_MODELS:
        active_model_key = model_version
        return {"success": True, "active_model": AVAILABLE_MODELS[model_version]}
    raise ValueError(f"Unknown model version '{model_version}'.")
