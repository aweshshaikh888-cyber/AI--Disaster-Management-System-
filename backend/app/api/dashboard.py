from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.database.models import Incident, AIAnalysis, RescueTeam, EmergencyNotification, WeatherAlert

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_incidents = db.query(Incident).count()
    areas_analyzed = db.query(AIAnalysis).count()
    critical_incidents = db.query(Incident).filter(Incident.severity.in_(["Severe Damage", "Critical Damage"])).count()
    active_rescue_teams = db.query(RescueTeam).filter(RescueTeam.status.in_(["Assigned", "En Route", "On Site"])).count()
    total_rescue_teams = db.query(RescueTeam).count()
    pending_reports = db.query(Incident).filter(Incident.status == "Reported").count()
    
    # Severity distribution
    severity_counts = db.query(
        Incident.severity, func.count(Incident.id)
    ).group_by(Incident.severity).all()
    severity_dist = {sev: count for sev, count in severity_counts}
    
    # Disaster type distribution
    type_counts = db.query(
        Incident.disaster_type, func.count(Incident.id)
    ).group_by(Incident.disaster_type).all()
    type_dist = {dtype: count for dtype, count in type_counts}
    
    # Recent high-priority incidents
    recent_incidents = db.query(Incident).order_by(Incident.created_at.desc()).limit(5).all()
    
    # Recent AI analyses
    recent_analyses = db.query(AIAnalysis).order_by(AIAnalysis.created_at.desc()).limit(5).all()
    
    # Active weather alerts
    weather_alerts = db.query(WeatherAlert).order_by(WeatherAlert.timestamp.desc()).limit(3).all()
    
    # 7-day trend simulation
    incident_trends = [
        {"day": "Mon", "reported": 4, "resolved": 3, "critical": 1},
        {"day": "Tue", "reported": 6, "resolved": 5, "critical": 2},
        {"day": "Wed", "reported": 9, "resolved": 6, "critical": 4},
        {"day": "Thu", "reported": 14, "resolved": 8, "critical": 5},
        {"day": "Fri", "reported": 11, "resolved": 9, "critical": 3},
        {"day": "Sat", "reported": 7, "resolved": 10, "critical": 2},
        {"day": "Sun", "reported": 5, "resolved": 6, "critical": 1}
    ]
    
    return {
        "kpis": {
            "total_incidents": total_incidents,
            "areas_analyzed": areas_analyzed,
            "critical_incidents": critical_incidents,
            "active_rescue_teams": active_rescue_teams,
            "total_rescue_teams": total_rescue_teams,
            "pending_reports": pending_reports
        },
        "severity_distribution": severity_dist,
        "disaster_type_distribution": type_dist,
        "recent_incidents": recent_incidents,
        "recent_analyses": recent_analyses,
        "weather_alerts": weather_alerts,
        "trends": incident_trends
    }
