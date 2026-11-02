from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import urllib.request
import urllib.parse
import json

from app.database.session import get_db
from app.database.models import Incident, RescueTeam, HospitalShelter, WeatherAlert
from app.core.config import settings

router = APIRouter(prefix="/map", tags=["Interactive Map"])

class MapConfigUpdate(BaseModel):
    google_maps_api_key: Optional[str] = None
    mapbox_api_key: Optional[str] = None
    maptiler_api_key: Optional[str] = None
    default_provider: Optional[str] = "openstreetmap" # openstreetmap, google_maps, mapbox, maptiler

@router.get("/config")
def get_map_config():
    """Retrieve map tile configurations and API key readiness status."""
    return {
        "providers": [
            {
                "id": "openstreetmap",
                "name": "CartoDB / OpenStreetMap (Default)",
                "type": "raster",
                "requires_api_key": False,
                "is_active": True,
                "url": "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            },
            {
                "id": "google_satellite",
                "name": "Google Maps Satellite Hybrid",
                "type": "satellite",
                "requires_api_key": True,
                "is_configured": bool(settings.GOOGLE_MAPS_API_KEY),
                "url": "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            },
            {
                "id": "google_roadmap",
                "name": "Google Maps Standard Roadmap",
                "type": "roadmap",
                "requires_api_key": True,
                "is_configured": bool(settings.GOOGLE_MAPS_API_KEY),
                "url": "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            },
            {
                "id": "mapbox_satellite",
                "name": "Mapbox High-Res Satellite",
                "type": "satellite",
                "requires_api_key": True,
                "is_configured": bool(settings.MAPBOX_API_KEY),
                "url": f"https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{{z}}/{{x}}/{{y}}?access_token={settings.MAPBOX_API_KEY or '{key}'}"
            },
            {
                "id": "mapbox_dark",
                "name": "Mapbox Tactical Dark",
                "type": "vector_dark",
                "requires_api_key": True,
                "is_configured": bool(settings.MAPBOX_API_KEY),
                "url": f"https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{{z}}/{{x}}/{{y}}?access_token={settings.MAPBOX_API_KEY or '{key}'}"
            }
        ],
        "active_keys": {
            "has_google_maps_key": bool(settings.GOOGLE_MAPS_API_KEY),
            "has_mapbox_key": bool(settings.MAPBOX_API_KEY),
            "has_maptiler_key": bool(settings.MAPTILER_API_KEY)
        }
    }

@router.post("/config")
def update_map_config(req: MapConfigUpdate):
    if req.google_maps_api_key is not None:
        settings.GOOGLE_MAPS_API_KEY = req.google_maps_api_key.strip()
    if req.mapbox_api_key is not None:
        settings.MAPBOX_API_KEY = req.mapbox_api_key.strip()
    if req.maptiler_api_key is not None:
        settings.MAPTILER_API_KEY = req.maptiler_api_key.strip()
    return {"success": True, "message": "Map API keys updated successfully."}

@router.get("/geocode")
def geocode_location(query: str = Query(..., description="Place name or address to search")):
    """
    Forward Geocoding: Converts place name or address into precise GPS coordinates.
    Prioritizes Google Geocoding API if key configured, otherwise utilizes OpenStreetMap Nominatim.
    """
    if not query.strip():
        return []

    # 1. Google Maps Geocoding API (if key available)
    if settings.GOOGLE_MAPS_API_KEY:
        try:
            params = urllib.parse.urlencode({"address": query, "key": settings.GOOGLE_MAPS_API_KEY})
            url = f"https://maps.googleapis.com/maps/api/geocode/json?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": "DisasterAI-Platform/2.4"})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get("status") == "OK":
                    results = []
                    for item in data.get("results", [])[:5]:
                        loc = item["geometry"]["location"]
                        results.append({
                            "display_name": item.get("formatted_address"),
                            "latitude": loc["lat"],
                            "longitude": loc["lng"],
                            "source": "Google Maps Geocoding API"
                        })
                    return results
        except Exception as e:
            # Fall back to OpenStreetMap
            pass

    # 2. OpenStreetMap Nominatim fallback
    try:
        params = urllib.parse.urlencode({"q": query, "format": "json", "limit": 5})
        url = f"https://nominatim.openstreetmap.org/search?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "DisasterAI-Platform/2.4 (contact@disasterai.gov)"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            results = []
            for item in data:
                results.append({
                    "display_name": item.get("display_name"),
                    "latitude": float(item["lat"]),
                    "longitude": float(item["lon"]),
                    "source": "OpenStreetMap Nominatim"
                })
            return results
    except Exception as e:
        return [
            {
                "display_name": f"{query} (Local Approximation)",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "source": "Local Fallback"
            }
        ]

@router.get("/reverse-geocode")
def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """
    Reverse Geocoding: Converts GPS coordinates into human-readable street address.
    """
    # 1. Google Maps Reverse Geocoding API (if key available)
    if settings.GOOGLE_MAPS_API_KEY:
        try:
            params = urllib.parse.urlencode({"latlng": f"{lat},{lon}", "key": settings.GOOGLE_MAPS_API_KEY})
            url = f"https://maps.googleapis.com/maps/api/geocode/json?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": "DisasterAI-Platform/2.4"})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                if data.get("status") == "OK" and data.get("results"):
                    return {
                        "formatted_address": data["results"][0].get("formatted_address"),
                        "latitude": lat,
                        "longitude": lon,
                        "source": "Google Maps Reverse Geocoding"
                    }
        except Exception:
            pass

    # 2. OpenStreetMap Nominatim reverse fallback
    try:
        params = urllib.parse.urlencode({"lat": lat, "lon": lon, "format": "json"})
        url = f"https://nominatim.openstreetmap.org/reverse?{params}"
        req = urllib.request.Request(url, headers={"User-Agent": "DisasterAI-Platform/2.4 (contact@disasterai.gov)"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return {
                "formatted_address": data.get("display_name", f"Coordinates: {lat:.4f}, {lon:.4f}"),
                "latitude": lat,
                "longitude": lon,
                "source": "OpenStreetMap Nominatim"
            }
    except Exception:
        return {
            "formatted_address": f"GPS Sector: {lat:.4f}° N, {lon:.4f}° E",
            "latitude": lat,
            "longitude": lon,
            "source": "GPS Coordinates"
        }

@router.get("/layers")
def get_map_layers(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    teams = db.query(RescueTeam).all()
    facilities = db.query(HospitalShelter).all()
    weather_alerts = db.query(WeatherAlert).all()
    
    # Format map incident markers
    incident_markers = []
    for inc in incidents:
        # Determine severity color
        color_map = {
            "No Damage": "#10b981",       # Green
            "Low Damage": "#22c55e",      # Green
            "Moderate Damage": "#eab308", # Yellow
            "Severe Damage": "#f97316",   # Orange
            "Critical Damage": "#ef4444"  # Red
        }
        incident_markers.append({
            "id": inc.id,
            "code": inc.incident_code,
            "title": inc.title,
            "disaster_type": inc.disaster_type,
            "severity": inc.severity,
            "color": color_map.get(inc.severity, "#f97316"),
            "latitude": inc.latitude,
            "longitude": inc.longitude,
            "status": inc.status,
            "priority_score": inc.priority_score,
            "priority_category": inc.priority_category,
            "affected_people": inc.affected_people_est,
            "image_url": inc.image_url,
            "gradcam_url": inc.gradcam_url,
            "location_name": inc.location_name
        })
        
    team_markers = []
    for t in teams:
        if t.latitude and t.longitude:
            team_markers.append({
                "id": t.id,
                "name": t.name,
                "specialization": t.specialization,
                "lead_name": t.lead_name,
                "status": t.status,
                "latitude": t.latitude,
                "longitude": t.longitude,
                "phone": t.contact_phone,
                "member_count": t.member_count
            })
            
    facility_markers = []
    for f in facilities:
        facility_markers.append({
            "id": f.id,
            "name": f.name,
            "facility_type": f.facility_type,
            "address": f.address,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "total_capacity": f.total_capacity,
            "available_capacity": f.available_capacity,
            "phone": f.contact_phone,
            "services": f.services,
            "status": f.status
        })
        
    return {
        "incidents": incident_markers,
        "rescue_teams": team_markers,
        "facilities": facility_markers,
        "weather_alerts": weather_alerts
    }
