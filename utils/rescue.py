"""
=============================================================================
Feature 6: Rescue Operations & Resource Allocation Calculator
=============================================================================
Calculates tactical metrics for the Rescue Dashboard:
1. Total affected operational areas
2. Total damaged structures / buildings
3. Severity breakdown counts: High (Red), Medium (Orange), Low (Green)
4. Estimated number of specialized rescue teams (USAR, Medical, K9) needed
5. Estimated medical ambulances and personnel deployment
"""

import math
from typing import List, Dict, Any, Optional
from utils.mapping import load_locations


def calculate_rescue_metrics(locations: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Computes emergency response metrics across all recorded disaster sites.

    Args:
        locations: Optional list of location dictionaries. Defaults to loading from data/sample_locations.json.

    Returns:
        dict:
            - total_areas: int (total operational sectors)
            - total_damaged_buildings: int
            - high_count: int
            - medium_count: int
            - low_count: int
            - estimated_teams: int (USAR / rescue squads required)
            - estimated_ambulances: int
            - estimated_personnel: int
            - average_priority_score: float
            - readiness_status: str
    """
    if locations is None:
        locations = load_locations()

    if not locations:
        return {
            "total_areas": 0,
            "total_damaged_buildings": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "estimated_teams": 0,
            "estimated_ambulances": 0,
            "estimated_personnel": 0,
            "average_priority_score": 0.0,
            "readiness_status": "No Active Incidents"
        }

    total_areas = len(locations)
    total_buildings = 0
    high_count = 0
    medium_count = 0
    low_count = 0
    total_score = 0.0

    for loc in locations:
        sev = str(loc.get("severity_level", "Low")).capitalize()
        bldgs = int(loc.get("damaged_buildings", 1 if sev != "Low" else 0))
        total_buildings += bldgs

        if sev == "High":
            high_count += 1
        elif sev == "Medium":
            medium_count += 1
        else:
            low_count += 1

        total_score += float(loc.get("priority_score", 40.0))

    # Standard humanitarian disaster estimation formula:
    # Each High damage site requires 3 specialized USAR units
    # Each Medium damage site requires 1 rescue / engineering team
    # Each Low damage site requires light perimeter checks (0.2 team equivalent)
    raw_teams = (high_count * 3) + (medium_count * 1) + (low_count * 0.2)
    estimated_teams = math.ceil(raw_teams) if (high_count + medium_count) > 0 else 0

    # Ambulances: 2 per High damage site + 1 per Medium site
    estimated_ambulances = (high_count * 2) + medium_count

    # 8 USAR specialist personnel per squad
    estimated_personnel = estimated_teams * 8

    avg_score = round(total_score / max(1, total_areas), 1)

    if high_count > 0:
        readiness_status = "CRITICAL MOBILIZATION ACTIVE (Red Code)"
    elif medium_count > 0:
        readiness_status = "ELEVATED ALERT (Orange Code)"
    else:
        readiness_status = "STANDBY / ROUTINE PATROL (Green Code)"

    return {
        "total_areas": total_areas,
        "total_damaged_buildings": total_buildings,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "estimated_teams": estimated_teams,
        "estimated_ambulances": estimated_ambulances,
        "estimated_personnel": estimated_personnel,
        "average_priority_score": avg_score,
        "readiness_status": readiness_status
    }
