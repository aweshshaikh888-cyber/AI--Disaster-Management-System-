from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database.session import get_db
from app.database.models import Incident, IncidentTimeline, AuditLog
from app.priority.priority_engine import priority_engine

router = APIRouter(prefix="/incidents", tags=["Incidents"])

class IncidentCreateRequest(BaseModel):
    title: str
    disaster_type: str
    severity: str = "Moderate Damage"
    description: Optional[str] = None
    location_name: str
    latitude: float
    longitude: float
    affected_people_est: Optional[int] = 0
    critical_infra_affected: Optional[bool] = False
    medical_emergency: Optional[bool] = False
    image_url: Optional[str] = None
    gradcam_url: Optional[str] = None
    reported_by: Optional[str] = "Citizen Report"
    reporter_contact: Optional[str] = None

class IncidentUpdateRequest(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    assigned_officer: Optional[str] = None
    is_verified: Optional[bool] = None
    affected_people_est: Optional[int] = None
    critical_infra_affected: Optional[bool] = None
    medical_emergency: Optional[bool] = None
    notes: Optional[str] = None

class TimelineEventRequest(BaseModel):
    action: str
    notes: Optional[str] = None
    author: Optional[str] = "Command Officer"

@router.get("")
def list_incidents(
    disaster_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if disaster_type and disaster_type != "All":
        query = query.filter(Incident.disaster_type == disaster_type)
    if severity and severity != "All":
        query = query.filter(Incident.severity == severity)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if search:
        query = query.filter((Incident.title.ilike(f"%{search}%")) | (Incident.location_name.ilike(f"%{search}%")))
        
    incidents = query.order_by(Incident.priority_score.desc(), Incident.created_at.desc()).limit(limit).all()
    return incidents

@router.post("")
def create_incident(req: IncidentCreateRequest, db: Session = Depends(get_db)):
    # Auto-generate incident code
    count = db.query(Incident).count() + 1
    code = f"DIS-2026-{count:03d}"
    
    # Calculate initial priority score
    p_result = priority_engine.calculate_priority(
        severity=req.severity,
        affected_people=req.affected_people_est or 0,
        critical_infra=req.critical_infra_affected or False,
        medical_emergency=req.medical_emergency or False,
        hours_elapsed=0.1
    )
    
    incident = Incident(
        incident_code=code,
        title=req.title,
        disaster_type=req.disaster_type,
        severity=req.severity,
        status="Reported",
        description=req.description,
        location_name=req.location_name,
        latitude=req.latitude,
        longitude=req.longitude,
        priority_score=p_result["priority_score"],
        priority_category=p_result["category"],
        affected_people_est=req.affected_people_est or 0,
        critical_infra_affected=req.critical_infra_affected or False,
        medical_emergency=req.medical_emergency or False,
        image_url=req.image_url,
        gradcam_url=req.gradcam_url,
        reported_by=req.reported_by,
        reporter_contact=req.reporter_contact,
        is_verified=False
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Initial timeline entry
    timeline = IncidentTimeline(
        incident_id=incident.id,
        action="Incident Registered",
        notes=f"Initial report filed with priority score {incident.priority_score} ({incident.priority_category}).",
        author=req.reported_by or "System"
    )
    db.add(timeline)
    db.commit()
    
    return incident

@router.get("/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    timelines = db.query(IncidentTimeline).filter(IncidentTimeline.incident_id == incident_id).order_by(IncidentTimeline.timestamp.asc()).all()
    analyses = incident.analyses
    
    return {
        "incident": incident,
        "timeline": timelines,
        "analyses": analyses
    }

@router.patch("/{incident_id}")
def update_incident(incident_id: int, req: IncidentUpdateRequest, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    old_status = incident.status
    if req.title is not None: incident.title = req.title
    if req.severity is not None: incident.severity = req.severity
    if req.status is not None: incident.status = req.status
    if req.description is not None: incident.description = req.description
    if req.assigned_officer is not None: incident.assigned_officer = req.assigned_officer
    if req.is_verified is not None: incident.is_verified = req.is_verified
    if req.affected_people_est is not None: incident.affected_people_est = req.affected_people_est
    if req.critical_infra_affected is not None: incident.critical_infra_affected = req.critical_infra_affected
    if req.medical_emergency is not None: incident.medical_emergency = req.medical_emergency
    
    # Recalculate priority
    p_result = priority_engine.calculate_priority(
        severity=incident.severity,
        affected_people=incident.affected_people_est,
        critical_infra=incident.critical_infra_affected,
        medical_emergency=incident.medical_emergency
    )
    incident.priority_score = p_result["priority_score"]
    incident.priority_category = p_result["category"]
    
    if req.status and req.status != old_status:
        timeline = IncidentTimeline(
            incident_id=incident.id,
            action=f"Status changed: {old_status} -> {req.status}",
            notes=req.notes or f"Updated status to {req.status}.",
            author="Command Officer"
        )
        db.add(timeline)
    elif req.notes:
        timeline = IncidentTimeline(
            incident_id=incident.id,
            action="Case Note Added",
            notes=req.notes,
            author="Command Officer"
        )
        db.add(timeline)
        
    db.commit()
    db.refresh(incident)
    return incident

@router.delete("/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    db.delete(incident)
    db.commit()
    return {"success": True, "message": "Incident removed."}

@router.post("/{incident_id}/timeline")
def add_timeline_event(incident_id: int, req: TimelineEventRequest, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    event = IncidentTimeline(
        incident_id=incident_id,
        action=req.action,
        notes=req.notes,
        author=req.author or "Operator"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
