"""
=============================================================================
Feature 1: Damage Severity & Priority Score Engine
=============================================================================
Extends the CNN classification output to:
- High Damage (Red 🔴)
- Medium Damage (Orange 🟠)
- Low Damage (Green 🟢)

Calculates an operational Priority Score (0-100) using the model's confidence
score and structural damage assessment, providing color tags and action advisories.
"""

from typing import Dict, Any


def calculate_severity(predicted_class: str, confidence: float) -> Dict[str, Any]:
    """
    Maps CNN predicted class and confidence score to standardized
    High / Medium / Low damage levels with color tags and a 0-100 Priority Score.

    Args:
        predicted_class: Raw CNN class name ("No Damage", "Low Damage", "Moderate Damage", "Severe Damage", "Critical Damage")
        confidence: Float confidence between 0.0 and 1.0 (e.g., 0.95)

    Returns:
        dict:
            - severity_level: "High", "Medium", or "Low"
            - color: "red", "orange", or "green"
            - hex_color: CSS hex color code
            - priority_score: Float between 0.0 and 100.0
            - priority_category: "Immediate USAR / Critical", "Urgent Assistance", or "Routine / Low Risk"
            - action_summary: Brief recommended field action
            - html_badge: Renderable HTML string for Streamlit display
    """
    # Normalize inputs
    cls_lower = predicted_class.lower()
    conf = max(0.0, min(1.0, float(confidence)))

    # Determine severity tier and color tag
    if "critical" in cls_lower or "severe" in cls_lower or ("moderate" in cls_lower and conf >= 0.85):
        # 1. HIGH DAMAGE (Red)
        severity_level = "High"
        color = "red"
        hex_color = "#ef4444"
        # Priority score between 75 and 100 based on confidence
        priority_score = round(75.0 + (conf * 25.0), 1)
        priority_category = "Immediate USAR / Critical"
        action_summary = "Deploy Urban Search & Rescue (USAR) team and medical triage immediately."

    elif "moderate" in cls_lower or ("low" in cls_lower and conf < 0.60):
        # 2. MEDIUM DAMAGE (Orange)
        severity_level = "Medium"
        color = "orange"
        hex_color = "#f97316"
        # Priority score between 40 and 74.9
        priority_score = round(40.0 + (conf * 34.0), 1)
        priority_category = "Urgent Assessment / Caution"
        action_summary = "Dispatch structural engineers for on-site assessment and shore unstable walls."

    else:
        # 3. LOW DAMAGE (Green)
        # Includes "Low Damage" and "No Damage"
        severity_level = "Low"
        color = "green"
        hex_color = "#22c55e"
        # Priority score between 0 and 39.9
        if "no damage" in cls_lower:
            priority_score = round(max(5.0, (1.0 - conf) * 20.0), 1)
            action_summary = "No visible exterior collapse; routine monitoring and secondary checks."
        else:
            priority_score = round(15.0 + (conf * 20.0), 1)
            action_summary = "Minor superficial debris; monitor perimeter and check utility connections."
        priority_category = "Routine / Low Risk"

    # HTML badge string with inline styles for clean Streamlit rendering
    html_badge = (
        f'<span style="background-color: {hex_color}22; color: {hex_color}; '
        f'border: 1px solid {hex_color}; padding: 4px 12px; border-radius: 9999px; '
        f'font-weight: 700; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase;">'
        f'{severity_level} Damage</span>'
    )

    return {
        "severity_level": severity_level,
        "color": color,
        "hex_color": hex_color,
        "priority_score": min(100.0, priority_score),
        "priority_category": priority_category,
        "action_summary": action_summary,
        "html_badge": html_badge
    }
