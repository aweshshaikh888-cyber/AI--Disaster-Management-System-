import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
GRADCAM_DIR = UPLOADS_DIR / "gradcam"
MODELS_DIR = BASE_DIR / "models_weights"

# Ensure directories exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(GRADCAM_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "DisasterAI Platform API"
    PROJECT_VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    UPLOADS_DIR: Path = UPLOADS_DIR
    GRADCAM_DIR: Path = GRADCAM_DIR
    MODELS_DIR: Path = MODELS_DIR
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'disaster_ai.db'}")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "disaster-ai-super-secret-security-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Model configuration
    ACTIVE_MODEL_VERSION: str = "DisasterCNN-v2.4-Augmented"
    CNN_INPUT_SHAPE: tuple = (224, 224, 3)
    DAMAGE_CLASSES: list = [
        "No Damage",
        "Low Damage",
        "Moderate Damage",
        "Severe Damage",
        "Critical Damage"
    ]
    
    # External APIs (Optional)
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    MAPBOX_API_KEY: str = os.getenv("MAPBOX_API_KEY", "")
    MAPTILER_API_KEY: str = os.getenv("MAPTILER_API_KEY", "")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
