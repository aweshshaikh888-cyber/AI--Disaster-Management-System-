from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database.session import get_db
from app.database.models import EmergencyResource, ResourceRequest, Incident

router = APIRouter(prefix="/resources", tags=["Emergency Resources"])

class ResourceUpdateRequest(BaseModel):
    available_quantity: int
    total_quantity: Optional[int] = None
    status: Optional[str] = None

class CreateRequestModel(BaseModel):
    incident_id: Optional[int] = None
    resource_id: int
    requested_quantity: int
    urgency: str = "High"
    requested_by: Optional[str] = "Field Commander"

@router.get("")
def list_resources(db: Session = Depends(get_db)):
    resources = db.query(EmergencyResource).all()
    # Auto-update status based on min_threshold
    for r in resources:
        if r.available_quantity <= (r.min_threshold // 2):
            r.status = "Critical"
        elif r.available_quantity <= r.min_threshold:
            r.status = "Low Stock"
        else:
            r.status = "Adequate"
    db.commit()
    return resources

@router.patch("/{resource_id}")
def update_resource(resource_id: int, req: ResourceUpdateRequest, db: Session = Depends(get_db)):
    res = db.query(EmergencyResource).filter(EmergencyResource.id == resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found.")
    res.available_quantity = req.available_quantity
    if req.total_quantity is not None: res.total_quantity = req.total_quantity
    if req.status is not None: res.status = req.status
    db.commit()
    db.refresh(res)
    return res

@router.get("/requests")
def list_resource_requests(db: Session = Depends(get_db)):
    requests = db.query(ResourceRequest).order_by(ResourceRequest.created_at.desc()).all()
    # Enrich with resource names
    results = []
    for rq in requests:
        res = db.query(EmergencyResource).filter(EmergencyResource.id == rq.resource_id).first()
        inc = db.query(Incident).filter(Incident.id == rq.incident_id).first() if rq.incident_id else None
        results.append({
            "id": rq.id,
            "resource_id": rq.resource_id,
            "resource_name": res.name if res else "Unknown Resource",
            "category": res.category if res else "",
            "unit": res.unit if res else "units",
            "requested_quantity": rq.requested_quantity,
            "urgency": rq.urgency,
            "status": rq.status,
            "requested_by": rq.requested_by,
            "incident_code": inc.incident_code if inc else "General Depot Request",
            "created_at": rq.created_at
        })
    return results

@router.post("/requests")
def create_resource_request(req: CreateRequestModel, db: Session = Depends(get_db)):
    res = db.query(EmergencyResource).filter(EmergencyResource.id == req.resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found.")
    
    rr = ResourceRequest(
        incident_id=req.incident_id,
        resource_id=req.resource_id,
        requested_quantity=req.requested_quantity,
        urgency=req.urgency,
        status="Pending",
        requested_by=req.requested_by
    )
    db.add(rr)
    db.commit()
    db.refresh(rr)
    return rr

@router.post("/requests/{request_id}/approve")
def approve_request(request_id: int, db: Session = Depends(get_db)):
    rr = db.query(ResourceRequest).filter(ResourceRequest.id == request_id).first()
    if not rr:
        raise HTTPException(status_code=404, detail="Request not found.")
    
    res = db.query(EmergencyResource).filter(EmergencyResource.id == rr.resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found.")
        
    if res.available_quantity < rr.requested_quantity:
        raise HTTPException(status_code=400, detail="Insufficient warehouse inventory available to approve this request.")
        
    res.available_quantity -= rr.requested_quantity
    rr.status = "Approved & Dispatched"
    db.commit()
    return {"success": True, "message": f"Dispatched {rr.requested_quantity} {res.unit} of {res.name}."}
