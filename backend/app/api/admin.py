import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.database.models import User, AuditLog, Incident, AIAnalysis
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Administration and System Health"])

@router.get("/system-health")
def get_system_health(db: Session = Depends(get_db)):
    # Check DB
    db_ok = True
    try:
        db.query(User).count()
    except Exception:
        db_ok = False
        
    # Check Storage
    total, used, free = shutil.disk_usage(str(settings.BASE_DIR))
    
    # Uploads stats
    upload_count = len(os.listdir(settings.UPLOADS_DIR)) if os.path.exists(settings.UPLOADS_DIR) else 0
    gradcam_count = len(os.listdir(settings.GRADCAM_DIR)) if os.path.exists(settings.GRADCAM_DIR) else 0
    
    return {
        "status": "Operational",
        "api_version": settings.PROJECT_VERSION,
        "active_model": settings.ACTIVE_MODEL_VERSION,
        "services": {
            "fastapi_backend": {"status": "Healthy", "latency_ms": 1.2},
            "database": {"status": "Connected" if db_ok else "Degraded", "type": "SQLite (Local Dev)"},
            "ai_inference_engine": {"status": "Loaded", "backend": "NumPy / CNN Spatial Tensor"},
            "storage_disk": {
                "total_gb": round(total / (1024**3), 2),
                "used_gb": round(used / (1024**3), 2),
                "free_gb": round(free / (1024**3), 2),
                "uploads_count": upload_count,
                "gradcam_heatmaps_count": gradcam_count
            },
            "weather_provider": {"status": "Configured" if settings.OPENWEATHER_API_KEY else "Sample / Radar Simulation Mode"},
            "notification_gateway": {"status": "Configured" if settings.TWILIO_ACCOUNT_SID else "Test / Simulated Mode"}
        }
    }

@router.get("/audit-logs")
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": u.id,
        "username": u.username,
        "email": u.email,
        "role": u.role,
        "full_name": u.full_name,
        "agency": u.agency,
        "phone": u.phone,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@router.patch("/users/{user_id}/role")
def change_user_role(user_id: int, new_role: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = new_role.upper()
    db.commit()
    return {"success": True, "user_id": user.id, "new_role": user.role}
