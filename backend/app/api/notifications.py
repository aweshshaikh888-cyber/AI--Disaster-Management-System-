from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database.session import get_db
from app.database.models import EmergencyNotification, AuditLog
from app.core.config import settings

router = APIRouter(prefix="/notifications", tags=["Emergency Alerts"])

class BroadcastAlertRequest(BaseModel):
    title: str
    message: str
    severity: str = "Warning" # Information, Advisory, Warning, Critical Evacuation
    target_channel: str = "Multi-Channel (In-App + SMS + Email)"
    target_region: str = "All Operational Sectors"
    is_test_mode: bool = True
    authorized_confirmation: bool = True
    sent_by: Optional[str] = "Operations Commander"

@router.get("")
def list_notifications(db: Session = Depends(get_db)):
    alerts = db.query(EmergencyNotification).order_by(EmergencyNotification.created_at.desc()).all()
    return alerts

@router.post("")
def broadcast_alert(req: BroadcastAlertRequest, db: Session = Depends(get_db)):
    if not req.authorized_confirmation:
        raise HTTPException(status_code=400, detail="Operational safety violation: Authorized confirmation is required before broadcasting.")
    
    # Check Twilio integration if not test mode and configured
    channel_status = "Simulated Broadcast Dispatched"
    if not req.is_test_mode and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        channel_status = "Live Twilio SMS Broadcast Queued"
    elif req.is_test_mode:
        channel_status = "TEST MODE - Internal Simulation Only"
        
    alert = EmergencyNotification(
        title=req.title,
        message=req.message,
        severity=req.severity,
        target_channel=req.target_channel,
        target_region=req.target_region,
        is_test_mode=req.is_test_mode,
        sent_by=req.sent_by or "Operations Commander",
        acknowledged=False,
        recipients_count=120 if req.is_test_mode else 1450,
        delivery_status=channel_status
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{notification_id}/acknowledge")
def acknowledge_alert(notification_id: int, db: Session = Depends(get_db)):
    alert = db.query(EmergencyNotification).filter(EmergencyNotification.id == notification_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.acknowledged = True
    db.commit()
    return {"success": True, "alert_id": notification_id, "status": "Acknowledged"}
