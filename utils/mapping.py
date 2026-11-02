"""
=============================================================================
Feature 2: GPS Geospatial Mapping (Folium)
=============================================================================
Accepts latitude and longitude coordinates with each disaster image and renders
an interactive map using Folium.

Features:
- Color-coded pin markers:
    🔴 RED: High Damage / Critical Rescue Zone
    🟠 ORANGE: Medium Damage / Caution Zone
    🟢 GREEN: Low / No Damage Zone
- Rich interactive popups detailing location name, severity, confidence,
  and emergency action instructions.
- Auto-centers on the active disaster coordinates or latest incident.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import folium

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "sample_locations.json"


def load_locations() -> List[Dict[str, Any]]:
    """Loads all logged disaster incident locations from data/sample_locations.json."""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not read sample locations: {e}")
    return []


def save_location(incident: Dict[str, Any]) -> None:
    """Appends a new disaster location record to the JSON database."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    records = load_locations()
    # Check if incident already exists by id
    exists = False
    for i, r in enumerate(records):
        if r.get("id") == incident.get("id"):
            records[i] = incident
            exists = True
            break
    if not exists:
        records.append(incident)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)


def create_disaster_map(
    locations: Optional[List[Dict[str, Any]]] = None,
    center_lat: float = 28.6139,
    center_lon: float = 77.2090,
    zoom_start: int = 13
) -> folium.Map:
    """
    Builds an interactive Folium map showing all disaster locations.

    Args:
        locations: List of location dicts. If None, loads from data/sample_locations.json.
        center_lat: Default map center latitude.
        center_lon: Default map center longitude.
        zoom_start: Initial map zoom level.

    Returns:
        folium.Map instance.
    """
    if locations is None:
        locations = load_locations()

    # If locations exist, center on the most recent location
    if locations:
        latest = locations[-1]
        center_lat = latest.get("latitude", center_lat)
        center_lon = latest.get("longitude", center_lon)

    # Initialize Folium Map with OpenStreetMap tiles
    fmap = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=zoom_start,
        tiles="OpenStreetMap"
    )

    # Color mapping for Folium icons
    folium_color_map = {
        "High": "red",
        "red": "red",
        "Medium": "orange",
        "orange": "orange",
        "Low": "green",
        "green": "green"
    }

    icon_map = {
        "High": "warning-sign",
        "Medium": "info-sign",
        "Low": "ok-sign"
    }

    # Add markers for each disaster location
    for loc in locations:
        lat = loc.get("latitude")
        lon = loc.get("longitude")
        if lat is None or lon is None:
            continue

        name = loc.get("name", "Disaster Site")
        severity = loc.get("severity_level", "Medium")
        damage_class = loc.get("damage_class", severity)
        conf = loc.get("confidence", 0.0)
        conf_pct = round(conf * 100, 1) if conf <= 1.0 else round(conf, 1)
        priority_score = loc.get("priority_score", 50.0)
        buildings = loc.get("damaged_buildings", 1)
        notes = loc.get("notes", "Damage survey recorded.")

        marker_color = folium_color_map.get(severity, "blue")
        icon_name = icon_map.get(severity, "info-sign")

        # Create styled HTML popup
        badge_bg = "#ef4444" if severity == "High" else ("#f97316" if severity == "Medium" else "#22c55e")
        popup_html = f"""
        <div style="font-family: Arial, sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="background-color: {badge_bg}; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">
                    {severity.upper()} DAMAGE
                </span>
                <span style="font-size: 11px; color: #666; font-weight: bold;">
                    Score: {priority_score}/100
                </span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #111;">{name}</h4>
            <p style="margin: 2px 0; font-size: 11px; color: #444;">
                <b>Coordinates:</b> {lat:.4f}, {lon:.4f}<br>
                <b>Classification:</b> {damage_class}<br>
                <b>CNN Confidence:</b> {conf_pct}%<br>
                <b>Damaged Buildings:</b> {buildings}
            </p>
            <p style="margin: 6px 0 0 0; font-size: 10px; color: #666; font-style: italic; border-top: 1px solid #eee; padding-top: 4px;">
                {notes}
            </p>
        </div>
        """

        folium.Marker(
            location=[lat, lon],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=f"{name} ({severity} Damage - {conf_pct}%)",
            icon=folium.Icon(color=marker_color, icon=icon_name)
        ).add_to(fmap)

        # For High damage, also draw a pulse circle zone
        if severity == "High":
            folium.Circle(
                location=[lat, lon],
                radius=150,  # 150 meters evacuation perimeter
                color="#ef4444",
                weight=2,
                fill=True,
                fill_color="#ef4444",
                fill_opacity=0.15,
                tooltip="150m High-Hazard Evacuation Cordon"
            ).add_to(fmap)

    return fmap
