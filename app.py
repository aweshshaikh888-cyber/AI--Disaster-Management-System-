"""
=============================================================================
AI-Driven Disaster Management System
Rescue Operations Command Dashboard (Streamlit)
=============================================================================
Features:
1. Damage Severity & Priority Score (High / Medium / Low with Red/Orange/Green tags)
2. GPS Mapping (Interactive Folium map with red pins for High damage)
3. Live Drone Feed Simulation (OpenCV real-time CNN overlay HUD)
4. SMS Alerting (Twilio API integration with .env configuration)
5. Weather Warning (OpenWeatherMap rain / cyclone forecasting)
6. Rescue Dashboard (KPI metrics, damage distribution, team estimation)
"""

import os
import sys
import time
import json
from pathlib import Path
from typing import Dict, Any, List

import streamlit as st
import numpy as np
import pandas as pd
from PIL import Image

# Add current directory to path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Import modular features
from model.cnn_model import get_default_model
from utils.severity import calculate_severity
from utils.mapping import create_disaster_map, load_locations, save_location
from utils.drone_feed import process_drone_frame
from utils.sms_alert import send_sms_alert, is_twilio_configured, get_twilio_credentials
from utils.weather import get_weather_forecast
from utils.rescue import calculate_rescue_metrics

# -----------------------------------------------------------------------------
# Streamlit Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="AI Disaster Management System",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -----------------------------------------------------------------------------
# Custom CSS Styling
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    /* Global Styling */
    .main-header {
        font-size: 2.1rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.0rem;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .metric-number {
        font-size: 1.9rem;
        font-weight: 800;
        color: #0f172a;
        margin: 4px 0;
    }
    .metric-label {
        font-size: 0.82rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .status-badge-high {
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #f87171;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.85rem;
    }
    .status-badge-med {
        background-color: #fff7ed;
        color: #ea580c;
        border: 1px solid #fb923c;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.85rem;
    }
    .status-badge-low {
        background-color: #f0fdf4;
        color: #16a34a;
        border: 1px solid #4ade80;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Sidebar Navigation & Settings
# -----------------------------------------------------------------------------
with st.sidebar:
    st.image("https://img.shields.io/badge/DisasterAI-CNN_v2.4-red?style=for-the-badge&logo=shield", use_container_width=True)
    st.title("🚨 Emergency Command")
    st.markdown("**AI-Driven Disaster Management System**\n*98.12% Accuracy CNN Model*")
    st.divider()

    navigation = st.radio(
        "Select Operations Module:",
        [
            "📊 Rescue Dashboard",
            "🔍 Image Analysis & GPS Tagging",
            "🛸 Live Drone Feed (Simulated)",
            "🌦️ Weather & Cyclone Warnings",
            "📋 Incident Register & Dispatch"
        ],
        index=0
    )

    st.divider()
    st.markdown("### ⚙️ System Status")

    # Twilio SMS Status
    twilio_ready = is_twilio_configured()
    if twilio_ready:
        st.success("🟢 Twilio SMS: Gateway Online")
    else:
        st.info("🟡 Twilio SMS: Simulation Mode (Console Active)")

    # OpenWeather Status
    weather_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if weather_key and "your_" not in weather_key.lower():
        st.success("🟢 Weather API: Live Connection")
    else:
        st.info("🟡 Weather API: Radar Simulation Active")

    st.caption("v2.4.0 • Academic Viva & Portfolio Edition")


# -----------------------------------------------------------------------------
# Helper: Render Folium Map Safely
# -----------------------------------------------------------------------------
def render_folium_map(fmap, height=500):
    """Renders a Folium map using streamlit-folium if available, else html iframe."""
    try:
        from streamlit_folium import st_folium
        return st_folium(fmap, width="100%", height=height)
    except Exception:
        # Fallback to direct HTML component
        import streamlit.components.v1 as components
        html_str = fmap._repr_html_()
        return components.html(html_str, height=height)


# =============================================================================
# MODULE 1: RESCUE DASHBOARD (Feature 6 & Feature 2)
# =============================================================================
if navigation == "📊 Rescue Dashboard":
    st.markdown('<div class="main-header">Rescue Command Operations Dashboard</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Unified situational awareness, structural damage metrics, interactive GPS map, and resource allocation.</div>', unsafe_allow_html=True)

    # 1. Compute Rescue Metrics
    locations = load_locations()
    metrics = calculate_rescue_metrics(locations)

    # Emergency Readiness Alert Banner
    if metrics["high_count"] > 0:
        st.error(f"🚨 **{metrics['readiness_status']}** — {metrics['high_count']} high-hazard sector(s) require immediate USAR squad dispatch.")
    else:
        st.success(f"✅ **{metrics['readiness_status']}** — All monitored sectors currently within stable parameters.")

    # 2. Top KPI Metric Cards
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Total Affected Areas</div>
            <div class="metric-number">{metrics['total_areas']}</div>
            <div style="font-size: 0.78rem; color: #64748b;">Monitored GPS Sectors</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Damaged Buildings</div>
            <div class="metric-number">{metrics['total_damaged_buildings']}</div>
            <div style="font-size: 0.78rem; color: #64748b;">Structures Evaluated</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-label">Severity Breakdown</div>
            <div style="margin-top: 6px;">
                <span class="status-badge-high">🔴 {metrics['high_count']} High</span>
                <span class="status-badge-med" style="margin-left: 4px;">🟠 {metrics['medium_count']} Med</span>
                <span class="status-badge-low" style="margin-left: 4px;">🟢 {metrics['low_count']} Low</span>
            </div>
            <div style="font-size: 0.78rem; color: #64748b; margin-top: 8px;">Triaged by CNN Model</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="metric-card" style="border-left: 4px solid #ef4444;">
            <div class="metric-label">Rescue Teams Needed</div>
            <div class="metric-number" style="color: #dc2626;">{metrics['estimated_teams']}</div>
            <div style="font-size: 0.78rem; color: #64748b;">{metrics['estimated_personnel']} USAR Specialists ({metrics['estimated_ambulances']} Ambulances)</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # 3. Interactive GPS Map (Feature 2)
    st.markdown("### 🗺️ Interactive Disaster Geospatial Map (Folium)")
    st.caption("Red markers designate High Damage evacuation zones. Orange designates Medium Damage, and Green designates Low/Safe sectors.")

    fmap = create_disaster_map(locations)
    render_folium_map(fmap, height=520)

    # 4. Resource Allocation Breakdown Table
    st.markdown("### 🚒 Operational Resource Allocation Formula")
    r_col1, r_col2 = st.columns([2, 1])

    with r_col1:
        st.markdown("""
        **Resource Calculation Principles:**
        - **High Damage Sites**: $\\text{3 USAR Teams} + \\text{2 ALS Ambulances}$ per site (Structural shoring, heavy hydraulic cutters, K9 search).
        - **Medium Damage Sites**: $\\text{1 Engineer Team} + \\text{1 Ambulance}$ per site (Debris removal, structural assessment).
        - **Low / No Damage Sites**: Periodic perimeter security patrol.
        """)

    with r_col2:
        st.info(f"""
        **Current Operational Demand:**
        - 👥 **USAR Personnel:** {metrics['estimated_personnel']} Operators
        - 🚑 **Ambulance Fleet:** {metrics['estimated_ambulances']} Units
        - ⚡ **Average Priority Index:** {metrics['average_priority_score']} / 100
        """)


# =============================================================================
# MODULE 2: IMAGE ANALYSIS & GPS MAPPING (Features 1, 2, 4, 5)
# =============================================================================
elif navigation == "🔍 Image Analysis & GPS Tagging":
    st.markdown('<div class="main-header">AI Disaster Image Classification & GPS Tagging</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Classify disaster structural damage using the 98% accurate CNN model, compute Priority Score (High/Medium/Low), check live weather, and dispatch SMS alerts.</div>', unsafe_allow_html=True)

    col_input, col_meta = st.columns([1, 1])

    with col_input:
        st.markdown("#### 1. Input Disaster Image")
        input_choice = st.radio("Select Image Source:", ["Upload My Image", "Choose Sample Disaster Preset"], horizontal=True)

        selected_image = None
        if input_choice == "Upload My Image":
            uploaded_file = st.file_uploader("Upload Drone or Ground Photo (JPG, PNG):", type=["jpg", "jpeg", "png"])
            if uploaded_file:
                selected_image = Image.open(uploaded_file)
        else:
            sample_preset = st.selectbox(
                "Choose Sample Preset Image:",
                [
                    "🔴 High Damage (Structural Collapse & Rubble)",
                    "🟠 Medium Damage (Wall Fractures & Surface Debris)",
                    "🟢 Low Damage (Intact Facade / No Collapse)"
                ]
            )
            # Find sample image path
            samples_dir = BASE_DIR / "data" / "sample_images"
            if "High" in sample_preset:
                sample_file = samples_dir / "high_damage.jpg"
            elif "Medium" in sample_preset:
                sample_file = samples_dir / "medium_damage.jpg"
            else:
                sample_file = samples_dir / "low_damage.jpg"

            if sample_file.exists():
                selected_image = Image.open(sample_file)
            else:
                st.warning("Sample images not yet generated. Click button below to create sample data.")
                if st.button("Generate Sample Images & Drone Clip"):
                    from data.create_samples import create_sample_images, create_sample_drone_video
                    create_sample_images()
                    create_sample_drone_video()
                    st.rerun()

        if selected_image:
            st.image(selected_image, caption="Survey Input Image", use_container_width=True)

    with col_meta:
        st.markdown("#### 2. GPS Coordinates & Sector Metadata")
        location_name = st.text_input("Location / Sector Name:", value="North Sector Commercial District")

        c_lat, c_lon = st.columns(2)
        with c_lat:
            latitude = st.number_input("Latitude (°N):", value=28.6185, format="%.5f")
        with c_lon:
            longitude = st.number_input("Longitude (°E):", value=77.2140, format="%.5f")

        disaster_type = st.selectbox(
            "Disaster Category:",
            ["Earthquake", "Building Collapse", "Flood", "Cyclone", "Fire", "Landslide"]
        )
        damaged_buildings_input = st.number_input("Estimated Damaged Structures in Sector:", min_value=0, max_value=200, value=3)
        notes_input = st.text_area("Field Notes / Observations:", value="Heavy debris observed; potential structural integrity compromise.")

        analyze_btn = st.button("🚀 Run AI Disaster Analysis", type="primary", use_container_width=True)

    if analyze_btn and selected_image:
        st.divider()
        st.markdown("### 📊 AI Assessment Results")

        with st.spinner("Executing Convolutional Neural Network forward pass..."):
            model = get_default_model()
            prediction = model.predict(selected_image, disaster_category=disaster_type)

            pred_class = prediction["predicted_class"]
            conf = prediction["confidence"]
            conf_pct = prediction["confidence_percentage"]

            # 1. Feature 1: Damage Severity & Priority Score
            severity_info = calculate_severity(pred_class, conf)
            sev_level = severity_info["severity_level"]
            priority_score = severity_info["priority_score"]
            color_tag = severity_info["color"]
            hex_color = severity_info["hex_color"]

            # Save assessed location to database
            new_incident = {
                "id": f"INC-{int(time.time()) % 10000}",
                "name": location_name,
                "latitude": float(latitude),
                "longitude": float(longitude),
                "damage_class": pred_class,
                "severity_level": sev_level,
                "confidence": float(conf),
                "priority_score": float(priority_score),
                "color": color_tag,
                "damaged_buildings": int(damaged_buildings_input),
                "estimated_teams": 3 if sev_level == "High" else (1 if sev_level == "Medium" else 0),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "notes": notes_input
            }
            save_location(new_incident)

        # Display Results Columns
        res_col1, res_col2, res_col3 = st.columns(3)

        with res_col1:
            st.markdown(f"""
            <div class="metric-card" style="border-top: 4px solid {hex_color};">
                <div class="metric-label">Damage Severity Tier</div>
                <div style="margin: 8px 0;">{severity_info['html_badge']}</div>
                <div style="font-size: 0.82rem; color: #475569;">CNN Class: <b>{pred_class}</b></div>
            </div>
            """, unsafe_allow_html=True)

        with res_col2:
            st.markdown(f"""
            <div class="metric-card" style="border-top: 4px solid {hex_color};">
                <div class="metric-label">Model Confidence</div>
                <div class="metric-number">{conf_pct}%</div>
                <div style="font-size: 0.82rem; color: #475569;">Reported Accuracy: <b>98.12%</b></div>
            </div>
            """, unsafe_allow_html=True)

        with res_col3:
            st.markdown(f"""
            <div class="metric-card" style="border-top: 4px solid {hex_color};">
                <div class="metric-label">Priority Score (0-100)</div>
                <div class="metric-number" style="color: {hex_color};">{priority_score}</div>
                <div style="font-size: 0.82rem; color: #475569;">Category: <b>{severity_info['priority_category']}</b></div>
            </div>
            """, unsafe_allow_html=True)

        st.info(f"📋 **Action Protocol:** {severity_info['action_summary']}")

        # ---------------------------------------------------------------------
        # Feature 5: Weather Forecast & Cyclone/Rain Warning
        # ---------------------------------------------------------------------
        st.markdown("#### 🌦️ Real-Time Meteorological Assessment (OpenWeatherMap)")
        weather_info = get_weather_forecast(latitude, longitude)

        w_col1, w_col2 = st.columns([1, 2])
        with w_col1:
            st.markdown(f"""
            <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
                <div style="font-size: 1.8rem; font-weight: 800;">{weather_info['icon']} {weather_info['temperature_c']}°C</div>
                <div style="font-size: 0.85rem; color: #475569;"><b>{weather_info['condition_desc']}</b></div>
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">
                    💨 Wind: {weather_info['wind_speed_kmh']} km/h | 💧 Humidity: {weather_info['humidity_pct']}%
                </div>
            </div>
            """, unsafe_allow_html=True)

        with w_col2:
            if weather_info["has_warning"]:
                if weather_info["warning_type"] == "CYCLONE_ALERT":
                    st.error(f"🌪️ **CYCLONE / STORM WARNING**: {weather_info['warning_message']}")
                else:
                    st.warning(f"🌧️ **HEAVY RAIN WARNING**: {weather_info['warning_message']}")
            else:
                st.success(f"☀️ **FAVORABLE WEATHER**: {weather_info['warning_message']}")

            st.caption(f"Drone Flight Feasibility: **{weather_info['drone_flight_status']}** • Source: {'Simulated Meteorological Radar' if weather_info['is_simulated'] else 'Live OpenWeatherMap API'}")

        # ---------------------------------------------------------------------
        # Feature 4: SMS Alert (Twilio API)
        # ---------------------------------------------------------------------
        st.markdown("#### 📲 Emergency SMS Alert Dispatch (Twilio)")
        if sev_level == "High":
            st.error("🚨 **High Damage Threshold Detected**: Triggering emergency SMS broadcast...")
            sms_res = send_sms_alert(
                severity_level=sev_level,
                latitude=latitude,
                longitude=longitude,
                confidence_pct=conf_pct,
                location_name=location_name
            )

            st.success(f"✅ **SMS Dispatch Status ({sms_res['mode']}):**\n\nRecipient: `{sms_res['recipient']}`\n\n```\n{sms_res['message']}\n```")
            if sms_res.get("is_simulated"):
                st.caption("ℹ️ *Twilio SMS was executed in safe Simulation Mode because active credentials are not set in .env. To receive real text messages on your mobile, configure your Twilio keys in `.env`.*")
        else:
            st.info(f"ℹ️ Automatic SMS broadcast is reserved for **High** damage events. Current damage level is **{sev_level}**, so no SMS was dispatched.")


# =============================================================================
# MODULE 3: LIVE DRONE FEED SIMULATION (Feature 3)
# =============================================================================
elif navigation == "🛸 Live Drone Feed (Simulated)":
    st.markdown('<div class="main-header">Live Drone Aerial Feed (Simulated)</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Streams simulated drone video or webcam frames with OpenCV, executing real-time CNN damage classification and overlaying Tactical HUD telemetry.</div>', unsafe_allow_html=True)

    d_col1, d_col2 = st.columns([1, 2])

    with d_col1:
        st.markdown("#### Feed Configuration")
        feed_source = st.selectbox(
            "Video Source:",
            [
                "✈️ Synthetic Drone Flyover (Built-In Simulation)",
                "🎥 Physical Webcam (Device 0)",
                "📁 Upload Custom MP4 Video"
            ]
        )

        custom_video_file = None
        if "Upload" in feed_source:
            custom_video_file = st.file_uploader("Upload MP4 / AVI Drone Video:", type=["mp4", "avi"])

        st.markdown("##### Simulated Flight Telemetry")
        drone_alt = st.slider("Simulated Altitude (meters):", min_value=30.0, max_value=300.0, value=115.0, step=5.0)
        drone_bat = st.slider("Drone Battery Level (%):", min_value=10, max_value=100, value=84)
        stream_frames = st.slider("Frames to Inspect:", min_value=20, max_value=200, value=60, step=10)

        start_stream = st.button("▶️ Start Drone Stream", type="primary", use_container_width=True)

    with d_col2:
        st.markdown("#### Real-Time Drone Tactical View (OpenCV + CNN)")
        video_placeholder = st.empty()
        status_placeholder = st.empty()

        if not start_stream:
            # Display standby banner
            video_placeholder.info("Click **'Start Drone Stream'** to initiate live computer vision frame processing.")

        if start_stream:
            # Determine OpenCV capture source
            import cv2
            cap = None
            sample_clip_path = BASE_DIR / "data" / "sample_drone_clip.mp4"

            if "Webcam" in feed_source:
                cap = cv2.VideoCapture(0)
                if not cap.isOpened():
                    st.warning("Webcam device 0 not accessible. Switching to synthetic drone clip.")
                    cap = cv2.VideoCapture(str(sample_clip_path))
            elif "Upload" in feed_source and custom_video_file:
                # Save temp video
                temp_video_path = BASE_DIR / "data" / "temp_upload.mp4"
                with open(temp_video_path, "wb") as f:
                    f.write(custom_video_file.read())
                cap = cv2.VideoCapture(str(temp_video_path))
            else:
                # Synthetic Drone Flyover clip
                if not sample_clip_path.exists():
                    from data.create_samples import create_sample_drone_video
                    create_sample_drone_video()
                cap = cv2.VideoCapture(str(sample_clip_path))

            if cap and cap.isOpened():
                frame_count = 0
                model = get_default_model()

                for _ in range(stream_frames):
                    ret, frame = cap.read()
                    if not ret:
                        # Loop video if reached end
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, frame = cap.read()
                        if not ret:
                            break

                    frame_count += 1

                    # Process frame through OpenCV & CNN
                    annotated_rgb, summary = process_drone_frame(
                        frame=frame,
                        model=model,
                        altitude_m=drone_alt,
                        battery_pct=drone_bat,
                        lat=28.6139,
                        lon=77.2090
                    )

                    # Display frame in Streamlit
                    video_placeholder.image(annotated_rgb, channels="RGB", use_container_width=True)

                    status_placeholder.markdown(f"""
                    **Frame #{frame_count}** | Status: **{summary['severity_level']} Damage** ({summary['confidence_percentage']}%) | Class: `{summary['predicted_class']}` | Priority Score: **{summary['priority_score']}/100**
                    """)

                    time.sleep(0.04)  # ~25 FPS

                cap.release()
                st.success("✅ Drone stream frame inspection completed.")


# =============================================================================
# MODULE 4: WEATHER & CYCLONE WARNINGS (Feature 5)
# =============================================================================
elif navigation == "🌦️ Weather & Cyclone Warnings":
    st.markdown('<div class="main-header">Meteorological Early Warning System</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Monitors rain, storm, and cyclone threats via OpenWeatherMap API to ensure field responder safety and drone flight feasibility.</div>', unsafe_allow_html=True)

    w_input1, w_input2 = st.columns(2)
    with w_input1:
        w_lat = st.number_input("Target Latitude:", value=28.6139, format="%.4f")
    with w_input2:
        w_lon = st.number_input("Target Longitude:", value=77.2090, format="%.4f")

    weather_data = get_weather_forecast(w_lat, w_lon)

    # Hazard Banner
    if weather_data["has_warning"]:
        if weather_data["warning_type"] == "CYCLONE_ALERT":
            st.error(f"🌪️ **HIGH SEVERITY ALERT**: {weather_data['warning_message']}")
        else:
            st.warning(f"🌧️ **ELEVATED HAZARD**: {weather_data['warning_message']}")
    else:
        st.success(f"☀️ **STABLE CONDITIONS**: {weather_data['warning_message']}")

    col_m1, col_m2, col_m3, col_m4 = st.columns(4)
    with col_m1:
        st.metric("Temperature", f"{weather_data['temperature_c']} °C")
    with col_m2:
        st.metric("Wind Speed", f"{weather_data['wind_speed_kmh']} km/h")
    with col_m3:
        st.metric("Precipitation", f"{weather_data['rain_mm']} mm/hr")
    with col_m4:
        st.metric("Drone Feasibility", weather_data["drone_flight_status"])

    st.markdown("---")
    st.markdown("#### 🚨 Early Warning Threshold Reference")
    st.markdown("""
    | Hazard Condition | Threshold Metric | Tactical Impact & Recommended Action |
    |---|---|---|
    | **Cyclone / Severe Squall** | Wind Speed $\ge$ 45 km/h or Storm Convection | **GROUND ALL DRONES**. Severe danger of projectile debris and progressive building collapse. |
    | **Heavy Rain / Flash Flood** | Precipitation $\ge$ 15 mm/hr or Active Thunderstorm | **FLOOD ALERT**. Low-lying evacuation required. Stage water rescue inflatables and pumps. |
    | **Favorable Conditions** | Wind < 35 km/h, Clear or Light Clouds | **OPTIMAL WINDOW**. Deploy optical drone flyovers and rapid civil engineering surveys. |
    """)


# =============================================================================
# MODULE 5: INCIDENT REGISTER & DISPATCH
# =============================================================================
elif navigation == "📋 Incident Register & Dispatch":
    st.markdown('<div class="main-header">Incident Register & Squad Dispatch Ledger</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Comprehensive ledger of all AI-classified disaster sites with GPS coordinates, damage severity, and dispatch actions.</div>', unsafe_allow_html=True)

    locations = load_locations()

    if locations:
        df = pd.DataFrame(locations)
        # Reorder columns for presentation
        cols = ["id", "name", "severity_level", "damage_class", "confidence", "priority_score", "damaged_buildings", "latitude", "longitude", "timestamp"]
        available_cols = [c for c in cols if c in df.columns]
        st.dataframe(df[available_cols], use_container_width=True)

        col_d1, col_d2 = st.columns(2)
        with col_d1:
            csv_data = df.to_csv(index=False).encode('utf-8')
            st.download_button(
                "📥 Export Incident Register (CSV)",
                data=csv_data,
                file_name="disaster_incidents_register.csv",
                mime="text/csv",
                use_container_width=True
            )
        with col_d2:
            if st.button("🔄 Reset Sample Incident Data", use_container_width=True):
                from data.create_samples import create_sample_images
                create_sample_images()
                st.success("Incident data refreshed!")
                st.rerun()
    else:
        st.info("No incidents logged yet. Navigate to 'Image Analysis & GPS Tagging' to assess your first disaster site.")
