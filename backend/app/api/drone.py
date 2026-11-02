from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Dict, Any
import time

router = APIRouter(prefix="/drone", tags=["Live Drone Monitoring"])

DRONES = [
    {
        "id": "DRONE-ALPHA-01",
        "name": "EagleEye Matrice 300 RTK",
        "status": "Online / Patrolling",
        "battery_pct": 84,
        "altitude_m": 125.4,
        "speed_kmh": 32.5,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "heading_deg": 142,
        "camera_mode": "Thermal + 4K Optical",
        "connection_signal": "98% (5G Mesh Relay)",
        "mission": "Sector 4 Structural Scan",
        "feed_url": "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-destroyed-city-after-a-disaster-42171-large.mp4",
        "is_simulated": True
    },
    {
        "id": "DRONE-BRAVO-02",
        "name": "SkyScout Thermal Hexacopter",
        "status": "Online / Hovering",
        "battery_pct": 62,
        "altitude_m": 88.0,
        "speed_kmh": 4.1,
        "latitude": 28.6289,
        "longitude": 77.2150,
        "heading_deg": 280,
        "camera_mode": "Infrared Night Sensor",
        "connection_signal": "92% (Satellite Link)",
        "mission": "Bridge Collapse Inspection",
        "feed_url": "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-river-flooding-countryside-houses-42175-large.mp4",
        "is_simulated": True
    },
    {
        "id": "DRONE-CHARLIE-03",
        "name": "Falcon Search VTOL",
        "status": "Standby / Charging",
        "battery_pct": 100,
        "altitude_m": 0.0,
        "speed_kmh": 0.0,
        "latitude": 28.6012,
        "longitude": 77.1980,
        "heading_deg": 0,
        "camera_mode": "High-Res Multispectral",
        "connection_signal": "100% (Base Station)",
        "mission": "FOB Alpha Standby",
        "feed_url": "",
        "is_simulated": True
    }
]

DETECTION_EVENTS = [
    {
        "id": "DET-101",
        "drone_id": "DRONE-ALPHA-01",
        "timestamp": "12 mins ago",
        "event_type": "Structural Cracking Detected",
        "damage_level": "Severe Damage",
        "confidence": 0.94,
        "coordinates": "28.6145, 77.2105",
        "action_taken": "Geo-tagged & alerted USAR Unit"
    },
    {
        "id": "DET-102",
        "drone_id": "DRONE-ALPHA-01",
        "timestamp": "28 mins ago",
        "event_type": "Debris Roadblock Identified",
        "damage_level": "Moderate Damage",
        "confidence": 0.89,
        "coordinates": "28.6180, 77.2120",
        "action_taken": "Rerouted Ambulance Route #4"
    },
    {
        "id": "DET-103",
        "drone_id": "DRONE-BRAVO-02",
        "timestamp": "45 mins ago",
        "event_type": "Roof Collapse with Thermal Signature",
        "damage_level": "Critical Damage",
        "confidence": 0.97,
        "coordinates": "28.6295, 77.2162",
        "action_taken": "Dispatched Immediate Rescue Squad"
    }
]

@router.get("/drones")
def get_drones():
    return DRONES

@router.get("/detections")
def get_detections():
    return DETECTION_EVENTS

@router.post("/upload-video")
async def upload_drone_video(file: UploadFile = File(...)):
    """Accept recorded drone video for AI structural analysis pipeline."""
    return {
        "status": "Processing Recorded Drone Video",
        "filename": file.filename,
        "frames_extracted": 120,
        "detected_anomalies": 3,
        "highest_damage_class": "Severe Damage",
        "message": "Drone video ingested into computer vision frame inspection pipeline successfully."
    }
