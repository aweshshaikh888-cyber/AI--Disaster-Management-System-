import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.database.models import HospitalShelter

router = APIRouter(prefix="/facilities", tags=["Hospitals and Shelters"])

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.get("")
def list_facilities(
    facility_type: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(HospitalShelter)
    if facility_type and facility_type != "All":
        query = query.filter(HospitalShelter.facility_type == facility_type)
        
    facilities = query.all()
    results = []
    for f in facilities:
        dist = None
        if lat is not None and lon is not None:
            dist = haversine_km(lat, lon, f.latitude, f.longitude)
            
        results.append({
            "id": f.id,
            "name": f.name,
            "facility_type": f.facility_type,
            "address": f.address,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "contact_phone": f.contact_phone,
            "total_capacity": f.total_capacity,
            "available_capacity": f.available_capacity,
            "services": f.services,
            "is_verified": f.is_verified,
            "status": f.status,
            "distance_km": dist
        })
        
    if lat is not None and lon is not None:
        results.sort(key=lambda x: x["distance_km"] or 999999)
        
    return results
