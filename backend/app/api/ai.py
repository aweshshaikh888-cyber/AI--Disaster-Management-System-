from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.session import get_db
from app.database.models import AIAnalysis, Incident, AuditLog
from app.ai.predict import analyze_disaster_image
from app.ai.evaluation import get_model_evaluation_metrics
from app.ai.model_loader import get_active_model_info, list_available_models, switch_active_model

router = APIRouter(prefix="/ai", tags=["AI Image Analysis"])

@router.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    disaster_type: str = Form("Unknown"),
    location_name: str = Form("Unspecified Location"),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0),
    incident_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        result = analyze_disaster_image(
            image_bytes=content,
            original_filename=file.filename or "disaster_capture.jpg",
            disaster_category=disaster_type,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude
        )
        
        # Save record to database
        db_analysis = AIAnalysis(
            incident_id=incident_id,
            filename=file.filename or "disaster_capture.jpg",
            image_path=result["image_url"],
            gradcam_path=result["gradcam_url"],
            predicted_class=result["predicted_class"],
            confidence_score=result["confidence"],
            severity_level=result["severity_level"],
            disaster_type=disaster_type,
            location_name=location_name,
            latitude=latitude,
            longitude=longitude,
            class_probabilities=result["class_probabilities"],
            feature_metrics=result["feature_metrics"],
            recommended_actions=result["recommended_actions"],
            model_version=result["model_version"],
            execution_time_ms=result["execution_time_ms"],
            is_demo=True
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        
        # If incident_id provided, attach to incident
        if incident_id:
            incident = db.query(Incident).filter(Incident.id == incident_id).first()
            if incident:
                incident.image_url = result["image_url"]
                incident.gradcam_url = result["gradcam_url"]
                incident.severity = result["predicted_class"]
                incident.ai_confidence = result["confidence"]
                db.commit()
                
        result["db_id"] = db_analysis.id
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analysis/{analysis_id}")
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(AIAnalysis).filter(AIAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    return analysis

@router.get("/model-metrics")
def get_metrics():
    """Retrieve full model benchmarks, confusion matrix, and training curves."""
    return get_model_evaluation_metrics()

@router.get("/model-status")
def get_status():
    """Check current AI model weights and operational status."""
    return get_active_model_info()

@router.get("/models")
def get_all_models():
    """List available model architectures in the registry."""
    return list_available_models()

@router.post("/switch-model")
def switch_model(model_version: str):
    """Switch active model version."""
    try:
        return switch_active_model(model_version)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
