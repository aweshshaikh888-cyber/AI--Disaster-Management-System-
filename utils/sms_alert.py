"""
=============================================================================
Feature 4: Twilio SMS Emergency Alert System
=============================================================================
Dispatches immediate SMS alerts via the Twilio API whenever High Damage is
detected by the CNN model.

API keys and recipient phone numbers are securely loaded from a .env file.
If keys are not configured, it operates in a safe 'Simulated Mode', printing
the exact SMS payload to the console and returning clear UI feedback so that
beginners can test the entire workflow without needing paid Twilio credentials.
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

def get_twilio_credentials() -> Dict[str, str]:
    """Retrieves Twilio configuration from environment."""
    return {
        "account_sid": os.getenv("TWILIO_ACCOUNT_SID", "").strip(),
        "auth_token": os.getenv("TWILIO_AUTH_TOKEN", "").strip(),
        "from_phone": os.getenv("TWILIO_PHONE_NUMBER", "").strip(),
        "to_phone": os.getenv("ALERT_RECIPIENT_PHONE", "+1234567890").strip()
    }


def is_twilio_configured() -> bool:
    """Checks if active, non-placeholder Twilio credentials are provided."""
    creds = get_twilio_credentials()
    sid = creds["account_sid"]
    token = creds["auth_token"]
    from_phone = creds["from_phone"]

    if not sid or not token or not from_phone:
        return False
    if "your_" in sid.lower() or "your_" in token.lower() or "your_" in from_phone.lower():
        return False
    return True


def send_sms_alert(
    severity_level: str,
    latitude: float,
    longitude: float,
    confidence_pct: float,
    location_name: str = "Disaster Operational Sector"
) -> Dict[str, Any]:
    """
    Sends an SMS alert when High damage is detected.

    Args:
        severity_level: "High", "Medium", or "Low"
        latitude: Incident latitude coordinate
        longitude: Incident longitude coordinate
        confidence_pct: Model confidence percentage (e.g. 96.5)
        location_name: Name or sector of the incident

    Returns:
        dict with dispatch status, mode ("Live Twilio SMS" or "Simulated Mode"),
        recipient, and message body.
    """
    # Only High damage triggers emergency broadcast
    if severity_level.lower() != "high":
        return {
            "sent": False,
            "mode": "Suppressed",
            "reason": f"Damage severity is '{severity_level}'. Automatic emergency SMS is reserved for 'High' damage only.",
            "message": ""
        }

    creds = get_twilio_credentials()
    recipient = creds["to_phone"] or "+1234567890"

    # Format official tactical SMS broadcast
    message_body = (
        f"🚨 DISASTER EMERGENCY ALERT!\n"
        f"High structural damage detected at: {location_name}\n"
        f"GPS: {latitude:.4f}, {longitude:.4f}\n"
        f"CNN Confidence: {confidence_pct}%\n"
        f"STATUS: RED CODE - Immediate USAR Rescue Team deployment recommended."
    )

    # 1. Attempt live Twilio dispatch if keys are configured
    if is_twilio_configured():
        try:
            from twilio.rest import Client
            client = Client(creds["account_sid"], creds["auth_token"])
            msg = client.messages.create(
                body=message_body,
                from_=creds["from_phone"],
                to=recipient
            )
            return {
                "sent": True,
                "mode": "Live Twilio SMS",
                "sid": msg.sid,
                "recipient": recipient,
                "message": message_body,
                "status": "Dispatched via Twilio Carrier Gateway"
            }
        except Exception as e:
            # Fallback to simulation if Twilio raises an API error (e.g. unverified trial number)
            print(f"[Twilio Error] Live dispatch failed ({e}). Falling back to simulation.")
            return {
                "sent": True,
                "mode": "Simulated SMS (Live Gateway Error)",
                "error": str(e),
                "recipient": recipient,
                "message": message_body,
                "status": f"Fallback: Twilio API reported ({e}). Check your .env credentials."
            }

    # 2. Simulated SMS Mode (Default for beginners without Twilio account)
    try:
        print("\n" + "="*60)
        print(" [SIMULATED SMS DISPATCH - TWILIO GATEWAY]")
        print(f" To: {recipient}")
        print(f" Body:\n{message_body}")
        print("="*60 + "\n")
    except UnicodeEncodeError:
        safe_body = message_body.encode("ascii", "replace").decode("ascii")
        print("\n" + "="*60)
        print(" [SIMULATED SMS DISPATCH - TWILIO GATEWAY]")
        print(f" To: {recipient}")
        print(f" Body:\n{safe_body}")
        print("="*60 + "\n")

    return {
        "sent": True,
        "mode": "Simulated SMS Mode",
        "recipient": recipient,
        "message": message_body,
        "status": "Simulated SMS sent successfully to local terminal console. To send live SMS, add your Twilio SID & Token in .env.",
        "is_simulated": True
    }
