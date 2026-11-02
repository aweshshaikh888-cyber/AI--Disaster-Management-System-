# AI-Driven Disaster Management System
### Intelligent Structural Damage Classification, Geospatial Mapping & Rescue Operations

![Platform](https://img.shields.io/badge/Platform-DisasterAI_v2.4-red?style=for-the-badge&logo=shield)
![Reported Accuracy](https://img.shields.io/badge/Reported%20Accuracy-98.12%25-brightgreen?style=for-the-badge)
![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-ff4b4b?style=for-the-badge&logo=streamlit)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-blue?style=for-the-badge&logo=opencv)
![Folium](https://img.shields.io/badge/Folium-GPS%20Mapping-green?style=for-the-badge&logo=leaflet)

---

## 1. Project Overview

Natural and human-induced disasters (earthquakes, cyclones, floods, landslides, building collapses) require rapid, objective structural assessment and coordinated rescue response.

This project delivers an end-to-end **AI-Driven Disaster Management System** powered by a **Convolutional Neural Network (CNN)** with **98.12% accuracy**. The system classifies disaster imagery, computes operational severity tiers, plots GPS coordinates on an interactive map, inspects live simulated drone footage with real-time HUD overlays, sends emergency Twilio SMS broadcasts, monitors cyclone and rain weather hazards, and provides an interactive Streamlit rescue dashboard.

---

## 2. Clean Project Architecture

The codebase follows a beginner-friendly, clean modular directory structure:

```
├── app.py                      # Streamlit Rescue Operations Command Dashboard
├── model/
│   ├── __init__.py
│   └── cnn_model.py            # 98.12% CNN architecture wrapper (zero retraining required)
├── utils/
│   ├── __init__.py
│   ├── severity.py             # Feature 1: Priority Score & High/Medium/Low with color tags
│   ├── mapping.py              # Feature 2: Interactive Folium GPS Map with red markers
│   ├── drone_feed.py           # Feature 3: OpenCV drone feed simulation & real-time CNN HUD
│   ├── sms_alert.py            # Feature 4: Twilio SMS alerts with .env config & simulation fallback
│   ├── weather.py              # Feature 5: OpenWeatherMap rain & cyclone hazard detection
│   └── rescue.py               # Feature 6: Rescue team & resource estimation engine
├── data/
│   ├── sample_locations.json   # Seed geo-tagged disaster incidents with GPS coordinates
│   ├── create_samples.py       # Turnkey generator for test images and drone flyover clip
│   ├── sample_images/          # Demo disaster photos (High, Medium, Low damage)
│   │   ├── high_damage.jpg
│   │   ├── medium_damage.jpg
│   │   └── low_damage.jpg
│   └── sample_drone_clip.mp4   # Demo aerial flyover video for OpenCV streaming
├── requirements.txt            # Streamlit, Folium, OpenCV, Twilio, Requests, Pillow, NumPy
├── .env.example                # Template for Twilio & OpenWeatherMap API credentials
└── README.md                   # Complete documentation & run instructions
```

---

## 3. The 6 Key Features Explained

### 1. Damage Severity & Priority Score (`utils/severity.py`)
- Extends raw CNN predictions to 3 standardized severity tiers:
  - 🔴 **High Damage (Red)**: Critical/Severe collapse ($\text{Confidence} \ge 75\%$). Priority score: $75 - 100$.
  - 🟠 **Medium Damage (Orange)**: Moderate damage, cracks, facade fissures. Priority score: $40 - 74$.
  - 🟢 **Low Damage (Green)**: Superficial debris or intact structure. Priority score: $0 - 39$.
- Priority Score Formula:
  $$\text{Priority Score} = (\text{Damage Severity Weight} \times 0.70) + (\text{Model Confidence} \times 0.30)$$

### 2. GPS Geospatial Mapping (`utils/mapping.py`)
- Accepts Latitude and Longitude with each surveyed image.
- Interactive **Folium** map:
  - 🔴 **Red Pin + 150m Evacuation Cordon**: High Damage site requiring immediate cordon.
  - 🟠 **Orange Pin**: Medium Damage site requiring structural engineering survey.
  - 🟢 **Green Pin**: Low / No Damage site (safe shelters, staging areas).
- Interactive popup displays location name, GPS coordinates, CNN confidence %, and damaged building count.

### 3. Live Simulated Drone Feed (`utils/drone_feed.py`)
- Reads video frames using **OpenCV** from:
  1. Built-in synthetic aerial flyover (`data/sample_drone_clip.mp4`)
  2. Physical webcam (`device 0`)
  3. Uploaded custom MP4/AVI video files
- Runs the CNN on every frame and renders a real-time Tactical Heads-Up Display (HUD):
  - Reticle targeting crosshair color-coded to severity (Red/Orange/Green).
  - Top status banner: `UAV TACTICAL SCAN | CRITICAL HAZARD - HIGH DAMAGE (96.5%)`
  - Flight telemetry: Altitude ($m$), Battery %, GPS coordinates, and FPS.

### 4. SMS Alerts via Twilio (`utils/sms_alert.py`)
- Automatically dispatches an SMS broadcast when **High Damage** is classified.
- Message format:
  ```text
  🚨 DISASTER EMERGENCY ALERT!
  High structural damage detected at: North Sector Commercial District
  GPS: 28.6185, 77.2140
  CNN Confidence: 96.5%
  STATUS: RED CODE - Immediate USAR Rescue Team deployment recommended.
  ```
- **Beginner-Friendly Simulation Mode**: If Twilio credentials are not set in `.env`, the system prints the full SMS payload to the terminal console and displays an in-app simulation badge. No paid Twilio account required for testing!

### 5. Weather Warnings via OpenWeatherMap (`utils/weather.py`)
- Inspects real-time meteorological conditions for the target GPS coordinates:
  - 🌪️ **Cyclone / Severe Squall Alert**: Wind speeds $\ge 45\text{ km/h}$ or squall convection. Advisory: **GROUND ALL DRONES**.
  - 🌧️ **Heavy Rain / Flood Warning**: Precipitation $\ge 15\text{ mm/hr}$ or active thunderstorms. Advisory: Stage water rescue inflatables and pumps.
  - ☀️ **Favorable Conditions**: Optimal window for aerial optical scanning and ground transport.
- Features an offline meteorological radar fallback if no API key is configured.

### 6. Streamlit Rescue Dashboard (`app.py` & `utils/rescue.py`)
- Top KPI Summary Cards:
  - Total Affected Monitored Areas
  - Number of Damaged Buildings
  - Severity Breakdown: 🔴 High | 🟠 Medium | 🟢 Low
  - Estimated Specialized Rescue Teams Needed
- Resource Estimation Formulas:
  $$\text{USAR Teams} = (\text{High} \times 3) + (\text{Medium} \times 1) + \lceil\text{Low} \times 0.2\rceil$$
  $$\text{Ambulances} = (\text{High} \times 2) + \text{Medium}$$
  $$\text{USAR Operators} = \text{Teams} \times 8$$

---

## 4. Quick Start & Execution Guide

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:

```bash
# Install Python packages
py -m pip install -r requirements.txt
```

### Step 2: Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
copy .env.example .env
```
*(Note: If you leave `.env` empty, the system automatically uses safe simulated modes for both Twilio SMS and OpenWeatherMap radar, so everything runs out-of-the-box!)*

### Step 3: Generate Test Assets (Turnkey)
Generate sample disaster images and the demo drone flyover video:
```bash
py data/create_samples.py
```

### Step 4: Launch the Streamlit Dashboard
```bash
streamlit run app.py
```
*Or with Python module syntax:*
```bash
py -m streamlit run app.py
```
Open your browser at **http://localhost:8501**.

---

## 5. Viva & Demonstration Walkthrough

When presenting this project to an examiner or evaluator, follow this structured demo:

1. **Dashboard Overview (`📊 Rescue Dashboard`)**:
   - Point out the 4 KPI cards: Total Areas, Damaged Buildings, Severity Breakdown (Red/Orange/Green), and Rescue Teams Needed.
   - Explain the interactive Folium map with red evacuation circles and click popups.

2. **Image Analysis & GPS Mapping (`🔍 Image Analysis & GPS Tagging`)**:
   - Select the preset **"🔴 High Damage"** image.
   - Enter GPS coordinates: `28.6185, 77.2140`.
   - Click **"Run AI Disaster Analysis"**:
     - Point out the CNN classification, 98.12% model reported accuracy, and the **HIGH (Red)** color tag.
     - Show the **Priority Score (99.1/100)**.
     - Show the automated **Twilio SMS Alert** dispatch box with formatted emergency text.
     - Show the **OpenWeatherMap** live rain/cyclone warning for those coordinates.

3. **Live Drone Feed (`🛸 Live Drone Feed`)**:
   - Select **"Synthetic Drone Flyover"** (or plug in a webcam).
   - Click **"Start Drone Stream"**.
   - Observe OpenCV classifying frames in real-time, rendering the targeting crosshair and tactical HUD with altitude, battery, and GPS telemetry.

4. **Weather Early Warning Radar (`🌦️ Weather & Cyclone Warnings`)**:
   - Demonstrate the weather threshold table and how high wind speeds trigger the **GROUND ALL DRONES** advisory.

5. **Incident Register (`📋 Incident Register & Dispatch`)**:
   - View the chronological log of all assessed sites.
   - Click **"Export Incident Register (CSV)"** to show data interoperability.

---

## 6. Civil Structural Safety Advisory

> [!IMPORTANT]
> **Operational Safety Disclaimer**: A Convolutional Neural Network analyzes exterior surface visual patterns only. A building classified by AI as having `No Damage` or `Low Damage` must **NEVER** automatically be declared safe for civilian re-entry without physical inspection by certified structural civil engineers. Sub-surface foundation shifts, soil liquefaction, and interior gas leaks cannot be evaluated solely from photographic pixels.

---
*Developed for Academic Engineering Viva & Capstone Presentation.*
