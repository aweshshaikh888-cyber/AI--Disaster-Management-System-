"""
=============================================================================
Feature 3: Live Drone Feed Simulation (OpenCV & Real-Time CNN)
=============================================================================
Reads video frames from either a webcam (device index 0), a recorded video file,
or a synthetic drone flight simulation, executes CNN damage classification on
each frame, and overlays a real-time Tactical Heads-Up Display (HUD).
"""

import time
from typing import Tuple, Dict, Any, Optional
import numpy as np
import cv2

from model.cnn_model import get_default_model
from utils.severity import calculate_severity


def process_drone_frame(
    frame: np.ndarray,
    model=None,
    altitude_m: float = 112.5,
    battery_pct: int = 86,
    lat: float = 28.6139,
    lon: float = 77.2090
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Processes a single video frame:
    1. Runs the CNN damage inference.
    2. Overlays color-coded tactical bounding boxes and status banners.
    3. Displays drone telemetry (Altitude, Battery %, GPS coordinates, and FPS).

    Args:
        frame: BGR or RGB numpy image array from OpenCV.
        model: DisasterCNNModel instance (defaults to singleton if None).
        altitude_m: Simulated drone altitude in meters.
        battery_pct: Simulated drone battery percentage.
        lat: Simulated latitude coordinate.
        lon: Simulated longitude coordinate.

    Returns:
        Tuple of (annotated_rgb_frame, analysis_result_dict)
    """
    if model is None:
        model = get_default_model()

    h, w = frame.shape[:2]

    # Convert BGR to RGB for model inference if needed
    # OpenCV default is BGR
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if len(frame.shape) == 3 else frame

    # 1. Run CNN forward inference
    prediction = model.predict(rgb_frame)
    predicted_class = prediction["predicted_class"]
    confidence = prediction["confidence"]
    confidence_pct = prediction["confidence_percentage"]

    # 2. Get severity tier & colors
    severity_info = calculate_severity(predicted_class, confidence)
    severity_level = severity_info["severity_level"]
    priority_score = severity_info["priority_score"]

    # BGR colors for OpenCV drawing
    # Red: (40, 40, 235), Orange: (20, 140, 245), Green: (50, 200, 50)
    if severity_level == "High":
        bgr_color = (40, 40, 235)  # Red
        hud_tag = f"CRITICAL HAZARD - HIGH DAMAGE ({confidence_pct}%)"
    elif severity_level == "Medium":
        bgr_color = (20, 140, 245) # Orange
        hud_tag = f"CAUTION - MODERATE DAMAGE ({confidence_pct}%)"
    else:
        bgr_color = (50, 200, 50)  # Green
        hud_tag = f"CLEAR / LOW DAMAGE ({confidence_pct}%)"

    # Make a copy for annotation
    annotated = frame.copy()

    # 3. Draw Tactical HUD
    # -------------------------------------------------------------------------
    # (A) Top Banner Background
    cv2.rectangle(annotated, (0, 0), (w, 55), (20, 20, 20), -1)
    cv2.line(annotated, (0, 55), (w, 55), bgr_color, 2)

    # Top Status Text
    cv2.putText(
        annotated,
        f"UAV TACTICAL SCAN | {hud_tag}",
        (15, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        bgr_color,
        2,
        cv2.LINE_AA
    )

    # (B) Center Targeting Crosshair
    cx, cy = w // 2, h // 2
    box_size = min(w, h) // 4
    x1, y1 = cx - box_size, cy - box_size
    x2, y2 = cx + box_size, cy + box_size

    # Draw 4 corner reticles instead of solid box
    reticle_len = 25
    thickness = 2
    # Top-Left corner
    cv2.line(annotated, (x1, y1), (x1 + reticle_len, y1), bgr_color, thickness)
    cv2.line(annotated, (x1, y1), (x1, y1 + reticle_len), bgr_color, thickness)
    # Top-Right corner
    cv2.line(annotated, (x2, y1), (x2 - reticle_len, y1), bgr_color, thickness)
    cv2.line(annotated, (x2, y1), (x2, y1 + reticle_len), bgr_color, thickness)
    # Bottom-Left corner
    cv2.line(annotated, (x1, y2), (x1 + reticle_len, y2), bgr_color, thickness)
    cv2.line(annotated, (x1, y2), (x1, y2 - reticle_len), bgr_color, thickness)
    # Bottom-Right corner
    cv2.line(annotated, (x2, y2), (x2 - reticle_len, y2), bgr_color, thickness)
    cv2.line(annotated, (x2, y2), (x2, y2 - reticle_len), bgr_color, thickness)

    # Small center dot
    cv2.circle(annotated, (cx, cy), 3, bgr_color, -1)

    # (C) Bottom Telemetry Banner
    cv2.rectangle(annotated, (0, h - 45), (w, h), (20, 20, 20), -1)
    cv2.line(annotated, (0, h - 45), (w, h - 45), (70, 70, 70), 1)

    telemetry_left = f"ALT: {altitude_m:.1f}m | BAT: {battery_pct}% | SATELLITES: 14"
    telemetry_right = f"GPS: {lat:.4f}, {lon:.4f} | PRIORITY: {priority_score:.0f}/100"

    cv2.putText(
        annotated,
        telemetry_left,
        (15, h - 18),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.48,
        (220, 220, 220),
        1,
        cv2.LINE_AA
    )

    cv2.putText(
        annotated,
        telemetry_right,
        (w - 380, h - 18),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.48,
        (220, 220, 220),
        1,
        cv2.LINE_AA
    )

    # Convert back to RGB for Streamlit rendering
    final_rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)

    result_summary = {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "confidence_percentage": confidence_pct,
        "severity_level": severity_level,
        "color": severity_info["color"],
        "priority_score": priority_score,
        "altitude_m": altitude_m,
        "battery_pct": battery_pct,
        "latitude": lat,
        "longitude": lon
    }

    return final_rgb, result_summary


def create_synthetic_drone_video(output_path: str, num_frames: int = 90, width: int = 640, height: int = 480) -> str:
    """
    Generates a realistic synthetic aerial drone video clip simulating flight
    over a disaster zone (moving terrain, rubble texture, shifting perspective).
    Used as demo video source if no webcam or local video file is available.
    """
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, 20.0, (width, height))

    np.random.seed(42)

    for i in range(num_frames):
        # Base terrain background (earth tones)
        frame = np.full((height, width, 3), (90, 110, 120), dtype=np.uint8)

        # Draw shifting rubble patterns (simulating aerial flyover)
        shift_y = int((i * 4) % height)

        # Draw simulated cracked roads / rivers
        cv2.line(frame, (100, (shift_y + 50) % height), (500, (shift_y + 350) % height), (50, 50, 50), 12)
        cv2.line(frame, (105, (shift_y + 52) % height), (495, (shift_y + 348) % height), (160, 40, 30), 2)

        # Draw damaged building footprints
        for bx, by, bw, bh in [(180, 120, 90, 80), (360, 220, 110, 90), (120, 320, 80, 70)]:
            pos_y = (by + shift_y) % height
            cv2.rectangle(frame, (bx, pos_y), (bx + bw, pos_y + bh), (60, 70, 80), -1)
            # Add debris/crack texture inside
            cv2.line(frame, (bx + 10, pos_y + 10), (bx + bw - 10, pos_y + bh - 10), (180, 40, 40), 3)

        out.write(frame)

    out.release()
    return output_path
