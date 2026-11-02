"""
=============================================================================
Comprehensive Automated Verification Suite for 6 Extended Features
=============================================================================
Tests:
1. Damage Severity & Priority Score Calculation (High/Medium/Low, Red/Orange/Green)
2. Interactive Folium GPS Mapping Generation
3. OpenCV Live Drone Feed Frame Processing & HUD Overlay
4. Twilio SMS Emergency Alert Dispatch (Simulation & Live modes)
5. OpenWeatherMap Early Warning & Cyclone/Rain Forecast Analysis
6. Rescue Dashboard KPI & Team Allocation Formulas
"""

import sys
from pathlib import Path
import numpy as np
from PIL import Image

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from model.cnn_model import DisasterCNNArchitecture, DisasterCNNModel, get_default_model
from utils.severity import calculate_severity
from utils.mapping import create_disaster_map, load_locations, save_location
from utils.drone_feed import process_drone_frame
from utils.sms_alert import send_sms_alert, is_twilio_configured
from utils.weather import get_weather_forecast
from utils.rescue import calculate_rescue_metrics


def test_feature1_damage_severity():
    print("\n--- [TEST 1] Damage Severity & Priority Score ---")
    # Test High Severity
    high_res = calculate_severity("Critical Damage", 0.95)
    assert high_res["severity_level"] == "High", f"Expected High, got {high_res['severity_level']}"
    assert high_res["color"] == "red", f"Expected red, got {high_res['color']}"
    assert high_res["priority_score"] >= 75.0, f"Expected score >= 75, got {high_res['priority_score']}"
    assert "#ef4444" in high_res["html_badge"]
    print(f" [PASS] High Severity: Level={high_res['severity_level']}, Color={high_res['color']}, Score={high_res['priority_score']}")

    # Test Medium Severity
    med_res = calculate_severity("Moderate Damage", 0.70)
    assert med_res["severity_level"] == "Medium", f"Expected Medium, got {med_res['severity_level']}"
    assert med_res["color"] == "orange", f"Expected orange, got {med_res['color']}"
    assert 40.0 <= med_res["priority_score"] <= 75.0
    assert "#f97316" in med_res["html_badge"]
    print(f" [PASS] Medium Severity: Level={med_res['severity_level']}, Color={med_res['color']}, Score={med_res['priority_score']}")

    # Test Low Severity
    low_res = calculate_severity("No Damage", 0.90)
    assert low_res["severity_level"] == "Low", f"Expected Low, got {low_res['severity_level']}"
    assert low_res["color"] == "green", f"Expected green, got {low_res['color']}"
    assert low_res["priority_score"] < 40.0
    assert "#22c55e" in low_res["html_badge"]
    print(f" [PASS] Low Severity: Level={low_res['severity_level']}, Color={low_res['color']}, Score={low_res['priority_score']}")


def test_feature2_gps_mapping():
    print("\n--- [TEST 2] GPS Mapping (Folium) ---")
    locations = load_locations()
    assert len(locations) > 0, "Expected seed locations in data/sample_locations.json"
    print(f" Loaded {len(locations)} locations from sample database.")

    # Generate Folium Map
    fmap = create_disaster_map(locations)
    assert fmap is not None
    # Check that map HTML can be rendered
    html = fmap._repr_html_()
    assert len(html) > 500
    assert "folium" in html.lower() or "leaflet" in html.lower()
    print(" [PASS] Folium interactive map generated successfully with markers and popups.")


def test_feature3_drone_feed():
    print("\n--- [TEST 3] Live Drone Feed (OpenCV + CNN HUD) ---")
    model = get_default_model()
    # Create test BGR frame (480, 640, 3)
    test_frame = np.full((480, 640, 3), 100, dtype=np.uint8)
    # Draw sample debris lines
    test_frame[150:250, 200:400] = (30, 40, 180)

    annotated_rgb, summary = process_drone_frame(
        frame=test_frame,
        model=model,
        altitude_m=120.0,
        battery_pct=85,
        lat=28.6185,
        lon=77.2140
    )

    assert annotated_rgb.shape == test_frame.shape
    assert "severity_level" in summary
    assert "confidence_percentage" in summary
    assert "priority_score" in summary
    assert summary["altitude_m"] == 120.0
    print(f" [PASS] Drone frame HUD processed: Severity={summary['severity_level']}, Conf={summary['confidence_percentage']}%, Class={summary['predicted_class']}")


def test_feature4_sms_alert():
    print("\n--- [TEST 4] Twilio SMS Emergency Alerts ---")
    # Test High Damage Trigger
    high_alert = send_sms_alert(
        severity_level="High",
        latitude=28.6185,
        longitude=77.2140,
        confidence_pct=96.5,
        location_name="Sector 4 Rubble Zone"
    )
    assert high_alert["sent"] is True
    assert "28.6185" in high_alert["message"]
    assert "96.5%" in high_alert["message"]
    print(f" [PASS] High Damage SMS Trigger: Mode='{high_alert['mode']}', Recipient={high_alert['recipient']}")

    # Test Low Damage Suppression
    low_alert = send_sms_alert(
        severity_level="Low",
        latitude=28.60,
        longitude=77.20,
        confidence_pct=92.0
    )
    assert low_alert["sent"] is False
    assert "reserved for 'High' damage" in low_alert["reason"]
    print(" [PASS] Low Damage correctly suppressed from emergency broadcast.")


def test_feature5_weather_warning():
    print("\n--- [TEST 5] Weather Early Warning (OpenWeatherMap) ---")
    weather = get_weather_forecast(lat=28.6139, lon=77.2090)
    assert "temperature_c" in weather
    assert "wind_speed_kmh" in weather
    assert "warning_type" in weather
    assert "drone_flight_status" in weather
    print(f" [PASS] Weather fetched: Temp={weather['temperature_c']}°C, Wind={weather['wind_speed_kmh']} km/h, Warning={weather['warning_type']}, Drone Status={weather['drone_flight_status']}")


def test_feature6_rescue_calculator():
    print("\n--- [TEST 6] Rescue Operations Dashboard Calculator ---")
    metrics = calculate_rescue_metrics()
    assert metrics["total_areas"] > 0
    assert metrics["total_damaged_buildings"] > 0
    assert metrics["estimated_teams"] >= metrics["high_count"] * 3
    assert metrics["estimated_ambulances"] >= metrics["high_count"] * 2
    assert metrics["estimated_personnel"] == metrics["estimated_teams"] * 8
    print(f" [PASS] Rescue KPIs: Areas={metrics['total_areas']}, Buildings={metrics['total_damaged_buildings']}, High={metrics['high_count']}, Teams={metrics['estimated_teams']}, Ambulances={metrics['estimated_ambulances']}")


if __name__ == "__main__":
    print("=" * 65)
    print(" EXECUTING VERIFICATION SUITE FOR 6 DISASTER EXTENSION FEATURES")
    print("=" * 65)
    test_feature1_damage_severity()
    test_feature2_gps_mapping()
    test_feature3_drone_feed()
    test_feature4_sms_alert()
    test_feature5_weather_warning()
    test_feature6_rescue_calculator()
    print("\n" + "=" * 65)
    print(" ALL 6 EXTENDED FEATURES VERIFIED AND PASSED SUCCESSFULLY!")
    print("=" * 65)
