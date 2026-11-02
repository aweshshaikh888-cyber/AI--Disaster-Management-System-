from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict
from app.priority.priority_engine import priority_engine

router = APIRouter(prefix="/priority", tags=["Disaster Priority Engine"])

class CalculatePriorityRequest(BaseModel):
    severity: str
    affected_people: int = 0
    critical_infra: bool = False
    medical_emergency: bool = False
    hours_elapsed: float = 1.0

class UpdateWeightsRequest(BaseModel):
    damage_severity: float
    affected_population: float
    critical_infrastructure: float
    medical_emergency: float
    recency: float

@router.post("/calculate")
def calculate_priority_score(req: CalculatePriorityRequest):
    return priority_engine.calculate_priority(
        severity=req.severity,
        affected_people=req.affected_people,
        critical_infra=req.critical_infra,
        medical_emergency=req.medical_emergency,
        hours_elapsed=req.hours_elapsed
    )

@router.get("/weights")
def get_weights():
    return {
        "current_weights": priority_engine.weights,
        "default_weights": priority_engine.DEFAULT_WEIGHTS,
        "is_customized": priority_engine.weights != priority_engine.DEFAULT_WEIGHTS
    }

@router.post("/weights")
def update_weights(req: UpdateWeightsRequest):
    # Verify sum approximately 1.0
    total = req.damage_severity + req.affected_population + req.critical_infrastructure + req.medical_emergency + req.recency
    if abs(total - 1.0) > 0.05:
        # Normalize
        norm_factor = 1.0 / (total or 1.0)
        priority_engine.weights = {
            "damage_severity": round(req.damage_severity * norm_factor, 2),
            "affected_population": round(req.affected_population * norm_factor, 2),
            "critical_infrastructure": round(req.critical_infrastructure * norm_factor, 2),
            "medical_emergency": round(req.medical_emergency * norm_factor, 2),
            "recency": round(req.recency * norm_factor, 2)
        }
    else:
        priority_engine.weights = {
            "damage_severity": req.damage_severity,
            "affected_population": req.affected_population,
            "critical_infrastructure": req.critical_infrastructure,
            "medical_emergency": req.medical_emergency,
            "recency": req.recency
        }
    return {"success": True, "updated_weights": priority_engine.weights}
