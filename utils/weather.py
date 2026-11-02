"""
=============================================================================
Feature 5: OpenWeatherMap Early Warning & Cyclone/Rain Forecast
=============================================================================
Queries the OpenWeatherMap API for a target coordinate (latitude, longitude)
to inspect current meteorological conditions and evaluate early warnings for:
1. Cyclone / High-Wind Storm Hazards (flight grounding, structural destabilization)
2. Heavy Rainfall / Flood Warnings (flash floods, landslide risks)

Keys are loaded from .env. If an API key is not present or offline,
the module falls back gracefully to realistic simulated radar observations
so beginners can test all weather warnings immediately.
"""

import os
from typing import Dict, Any, List
import requests
from dotenv import load_dotenv

load_dotenv()


def get_weather_forecast(lat: float, lon: float) -> Dict[str, Any]:
    """
    Retrieves weather forecast for given GPS coordinates and analyzes
    for rain or cyclone hazards.

    Args:
        lat: Latitude coordinate
        lon: Longitude coordinate

    Returns:
        dict:
            - temperature_c: float
            - wind_speed_kmh: float
            - humidity_pct: int
            - condition_title: str
            - condition_desc: str
            - has_warning: bool
            - warning_type: str ("CYCLONE_ALERT", "HEAVY_RAIN_ALERT", or "NONE")
            - warning_level: str ("Critical", "Warning", or "Favorable")
            - warning_message: str
            - drone_flight_status: str ("Grounded", "Caution", "Clear")
            - is_simulated: bool
    """
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()

    # Attempt live API call if key is provided and not a placeholder
    if api_key and "your_" not in api_key.lower():
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                temp = data.get("main", {}).get("temp", 25.0)
                humidity = data.get("main", {}).get("humidity", 60)
                # m/s to km/h: multiply by 3.6
                wind_mps = data.get("wind", {}).get("speed", 5.0)
                wind_kmh = round(wind_mps * 3.6, 1)

                weather_items = data.get("weather", [{}])
                main_condition = weather_items[0].get("main", "Clear")
                desc_condition = weather_items[0].get("description", "clear sky")

                # Rain volume
                rain_data = data.get("rain", {})
                rain_mm = rain_data.get("1h", 0.0) or rain_data.get("3h", 0.0)

                return _evaluate_weather_hazards(
                    temp=temp,
                    humidity=humidity,
                    wind_kmh=wind_kmh,
                    rain_mm=rain_mm,
                    condition=main_condition,
                    description=desc_condition,
                    location_name=data.get("name", f"{lat:.2f}, {lon:.2f}"),
                    is_simulated=False
                )
        except Exception as e:
            print(f"Warning: OpenWeatherMap API request failed ({e}). Using radar simulation.")

    # Offline / Simulated Meteorological Radar Fallback
    # Creates realistic conditions for testing (slight variation based on coords)
    simulated_temp = round(26.5 + ((lat + lon) % 4) * 0.5, 1)
    simulated_wind = round(42.0 + ((lat * 10) % 15), 1)
    simulated_humidity = 88
    simulated_rain = 34.5

    return _evaluate_weather_hazards(
        temp=simulated_temp,
        humidity=simulated_humidity,
        wind_kmh=simulated_wind,
        rain_mm=simulated_rain,
        condition="Rain / Squall",
        description="heavy convective storm cells with gusting squalls",
        location_name="Operational Disaster Radar Grid",
        is_simulated=True
    )


def _evaluate_weather_hazards(
    temp: float,
    humidity: int,
    wind_kmh: float,
    rain_mm: float,
    condition: str,
    description: str,
    location_name: str,
    is_simulated: bool
) -> Dict[str, Any]:
    """Evaluates meteorology metrics for Cyclone and Rain safety warnings."""

    desc_lower = description.lower()
    cond_lower = condition.lower()

    # 1. Check Cyclone / High-Wind Squall Threat
    is_cyclone = (
        wind_kmh >= 45.0
        or "cyclone" in desc_lower
        or "tornado" in desc_lower
        or "squall" in desc_lower
        or "gale" in desc_lower
        or "storm" in desc_lower and wind_kmh >= 38.0
    )

    # 2. Check Heavy Rain / Flash Flood Threat
    is_heavy_rain = (
        rain_mm >= 15.0
        or "heavy" in desc_lower and "rain" in desc_lower
        or "thunderstorm" in cond_lower
        or "flood" in desc_lower
        or "monsoon" in desc_lower
    )

    if is_cyclone:
        warning_type = "CYCLONE_ALERT"
        warning_level = "Critical"
        icon = "🌪️"
        warning_message = (
            f"CYCLONE / SEVERE SQUALL WARNING: Wind speeds reaching {wind_kmh} km/h! "
            f"Severe risk of secondary debris collapse. GROUND ALL AERIAL DRONES IMMEDIATELY."
        )
        drone_flight_status = "GROUNDED (High Wind Risk)"
        badge_color = "#ef4444"

    elif is_heavy_rain:
        warning_type = "HEAVY_RAIN_ALERT"
        warning_level = "Warning"
        icon = "🌧️"
        warning_message = (
            f"HEAVY RAIN & FLOOD WARNING: Active heavy rainfall ({rain_mm:.1f} mm/hr) detected. "
            f"Flash flood risk in low-lying relief sectors. Stage water rescue boats and pumps."
        )
        drone_flight_status = "CAUTION (Rain Degradation)"
        badge_color = "#f97316"

    else:
        warning_type = "NONE"
        warning_level = "Favorable"
        icon = "☀️"
        warning_message = (
            "Atmospheric conditions are stable. Favorable for UAV optical scanning and ground rescue transport."
        )
        drone_flight_status = "OPTIMAL (Flight Permitted)"
        badge_color = "#22c55e"

    return {
        "location_name": location_name,
        "temperature_c": temp,
        "humidity_pct": humidity,
        "wind_speed_kmh": wind_kmh,
        "rain_mm": rain_mm,
        "condition_title": condition,
        "condition_desc": description.title(),
        "icon": icon,
        "has_warning": (warning_type != "NONE"),
        "warning_type": warning_type,
        "warning_level": warning_level,
        "warning_message": warning_message,
        "drone_flight_status": drone_flight_status,
        "badge_color": badge_color,
        "is_simulated": is_simulated
    }
