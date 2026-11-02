from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database.session import get_db
from app.database.models import RescueTeam, Assignment, Incident, IncidentTimeline

router = APIRouter(prefix="/rescue-teams", tags=["Rescue Operations"])

class RescueTeamCreateRequest(BaseModel):
    name: str
    specialization: str
    lead_name: str
    contact_phone: str
    member_count: int = 8
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
    equipment_summary: Optional[str] = "Hydraulic cutters, Life detectors, First aid kits"
    vehicle_info: Optional[str] = "1 Heavy Rescue Truck, 1 4x4 Support Unit"

class AssignTeamRequest(BaseModel):
    team_id: int
    incident_id: int
    assigned_by: Optional[str] = "Command Center Officer"
    task_instructions: Optional[str] = "Deploy immediately to site. Establish triage and search for trapped occupants."

class UpdateTeamStatusRequest(BaseModel):
    status: str # Available, Assigned, En Route, On Site, Completed
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.get("")
def list_teams(db: Session = Depends(get_db)):
    teams = db.query(RescueTeam).all()
    return teams

@router.post("")
def create_team(req: RescueTeamCreateRequest, db: Session = Depends(get_db)):
    team = RescueTeam(
        name=req.name,
        specialization=req.specialization,
        lead_name=req.lead_name,
        contact_phone=req.contact_phone,
        member_count=req.member_count,
        latitude=req.latitude,
        longitude=req.longitude,
        equipment_summary=req.equipment_summary,
        vehicle_info=req.vehicle_info,
        status="Available"
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@router.post("/assign")
def assign_team(req: AssignTeamRequest, db: Session = Depends(get_db)):
    team = db.query(RescueTeam).filter(RescueTeam.id == req.team_id).first()
    incident = db.query(Incident).filter(Incident.id == req.incident_id).first()
    if not team or not incident:
        raise HTTPException(status_code=404, detail="Team or Incident not found.")
    
    # Update team status
    team.status = "En Route"
    incident.status = "Response Initiated"
    
    assignment = Assignment(
        team_id=team.id,
        incident_id=incident.id,
        assigned_by=req.assigned_by,
        status="Dispatched",
        task_instructions=req.task_instructions,
        dispatched_at=datetime.datetime.utcnow()
    )
    db.add(assignment)
    
    # Timeline
    timeline = IncidentTimeline(
        incident_id=incident.id,
        action="Rescue Unit Dispatched",
        notes=f"Team '{team.name}' ({team.specialization}, Lead: {team.lead_name}) dispatched. Instructions: {req.task_instructions}",
        author=req.assigned_by
    )
    db.add(timeline)
    
    db.commit()
    db.refresh(assignment)
    return {"success": True, "assignment": assignment, "team_status": team.status}

@router.patch("/{team_id}")
def update_team(team_id: int, req: UpdateTeamStatusRequest, db: Session = Depends(get_db)):
    team = db.query(RescueTeam).filter(RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    
    team.status = req.status
    if req.latitude is not None: team.latitude = req.latitude
    if req.longitude is not None: team.longitude = req.longitude
    
    db.commit()
    db.refresh(team)
    return team

@router.get("/assignments")
def list_assignments(db: Session = Depends(get_db)):
    assignments = db.query(Assignment).order_by(Assignment.dispatched_at.desc()).all()
    return assignments
