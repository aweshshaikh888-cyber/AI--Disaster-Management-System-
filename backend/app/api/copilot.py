from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import datetime
from app.database.session import get_db
from app.database.models import Incident, EmergencyResource, RescueTeam
from app.core.config import settings

router = APIRouter(prefix="/copilot", tags=["AI Operations Assistant"])

class CopilotQueryRequest(BaseModel):
    query: str
    incident_id: Optional[int] = None
    task_type: Optional[str] = "general" # sitrep, checklist, explain_priority, resource_summary

@router.post("/query")
def ask_copilot(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    q = req.query.lower()
    
    # Check if asking for Situation Report (SITREP)
    if "sitrep" in q or req.task_type == "sitrep" or "situation report" in q:
        total = db.query(Incident).count()
        critical = db.query(Incident).filter(Incident.severity.in_(["Severe Damage", "Critical Damage"])).count()
        active_teams = db.query(RescueTeam).filter(RescueTeam.status != "Available").count()
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        
        sitrep_text = f"""### OPERATIONAL SITUATION REPORT (SITREP) - {now_str}

**1. SITUATION OVERVIEW:**
- Total Active Incidents Logged: **{total}**
- High / Critical Priority Incidents: **{critical}**
- Active Tactical Rescue Teams Deployed: **{active_teams}**

**2. KEY PRIORITIES:**
- Sector 4 collapse containment and victim extraction.
- River basin flood surge diversion and temporary shelter reinforcement.
- Medical supply restock for Level-1 trauma reception centers.

**3. STRUCTURAL SAFETY CAUTION:**
All visual CNN damage predictions remain tentative pending certified civil engineer ground inspection. Do not clear personnel into yellow/orange tagged buildings.

*Generated autonomously by DisasterAI Operations Copilot.*"""
        return {"response": sitrep_text, "source": "DisasterAI Operational Protocol Engine"}
        
    # Check if asking for Checklist
    if "checklist" in q or req.task_type == "checklist" or "protocol" in q:
        checklist = """### RAPID DISASTER DEPLOYMENT CHECKLIST

- [ ] **1. Incident Triangulation**: Confirm GPS coordinates, hazard zone radius, and secondary risks (gas, power lines).
- [ ] **2. Structural Damage Grade**: Review CNN visual analysis & Grad-CAM heatmap to locate failure points.
- [ ] **3. Perimeter Isolation**: Secure 100m cordon around Severe/Critical damage structures.
- [ ] **4. Unit Dispatch**: Mobilize matched specialized unit (USAR for collapse, Water Rescue for flood).
- [ ] **5. Hospital Bed Reservation**: Query nearest facility bed availability and notify triage.
- [ ] **6. Logistics Dispatch**: Issue emergency requisition for blood plasma, heavy cutting rigs, and power generators.
- [ ] **7. Multi-Channel Alert**: Broadcast cautionary geofenced advisory to civilians."""
        return {"response": checklist, "source": "NDMA Standard Operating Procedures"}

    # Check if asking to explain priority score
    if "priority" in q or req.task_type == "explain_priority" or "score" in q:
        if req.incident_id:
            inc = db.query(Incident).filter(Incident.id == req.incident_id).first()
            if inc:
                return {
                    "response": f"### Priority Analysis for {inc.incident_code} ({inc.title})\n\n"
                                f"- **Calculated Score**: `{inc.priority_score} / 100` ({inc.priority_category} Priority)\n"
                                f"- **Damage Severity ({inc.severity})**: Accounts for 35% of score weighting.\n"
                                f"- **Estimated Affected ({inc.affected_people_est} people)**: High human casualty vulnerability adds 25%.\n"
                                f"- **Critical Infrastructure**: {'Yes (High Impact)' if inc.critical_infra_affected else 'No (Standard Impact)'}.\n"
                                f"- **Medical Emergency**: {'Active Medical Hazard' if inc.medical_emergency else 'No Immediate Medical Hazard'}.\n\n"
                                f"**Recommendation**: { 'Immediate USAR & ALS Ambulance deployment required within 30 minutes.' if inc.priority_score >= 80 else 'Schedule rapid response team within standard triage interval.' }",
                    "source": "Disaster Priority Reasoning Model"
                }
        return {
            "response": "The priority score is computed transparently: `Score = (Severity×0.35) + (Population×0.25) + (Infra×0.15) + (Medical×0.15) + (Recency×0.10)`. Specify an incident ID to see its exact mathematical breakdown.",
            "source": "Disaster Priority Reasoning Model"
        }

    # Resource summary
    if "resource" in q or "supply" in q or req.task_type == "resource_summary":
        res_list = db.query(EmergencyResource).all()
        summary_lines = [f"- **{r.name}** ({r.category}): `{r.available_quantity} / {r.total_quantity} {r.unit}` available ({r.status})" for r in res_list]
        return {
            "response": "### CURRENT EMERGENCY DEPOT INVENTORY\n\n" + "\n".join(summary_lines),
            "source": "Central Logistics Database"
        }

    # General Disaster Operations Assistant response
    return {
        "response": f"I am the **DisasterAI Operations Copilot**. I can generate **SITREPs**, **Operational Checklists**, **Resource Audits**, or **Explain Priority Scores**.\n\n*Received Query*: '{req.query}'\n\nTip: Ask for 'Generate SITREP' or 'Show deployment checklist' to test emergency workflows.",
        "source": "DisasterAI Operations Knowledge Base"
    }
