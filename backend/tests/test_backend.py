import sys
from pathlib import Path
import io
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.session import SessionLocal
from app.database.models import User, Incident, RescueTeam
from app.priority.priority_engine import priority_engine
from app.ai.predict import analyze_disaster_image
from app.ai.evaluation import get_model_evaluation_metrics
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_security():
    pwd = "EmergencySecurePass2026!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("WrongPass", hashed)
    
    token = create_access_token({"sub": "admin_test", "role": "ADMIN"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "admin_test"
    assert payload["role"] == "ADMIN"
    print("[PASS] Security & Auth Token Test")

def test_priority_engine():
    res_crit = priority_engine.calculate_priority(
        severity="Critical Damage",
        affected_people=150,
        critical_infra=True,
        medical_emergency=True
    )
    assert res_crit["priority_score"] >= 80.0
    assert res_crit["category"] == "Critical"
    
    res_low = priority_engine.calculate_priority(
        severity="No Damage",
        affected_people=0,
        critical_infra=False,
        medical_emergency=False
    )
    assert res_low["priority_score"] < 40.0
    assert res_low["category"] == "Low"
    print("[PASS] Priority Engine Multi-Factor Test")

def test_ai_inference_and_gradcam():
    # Create test synthetic disaster image (250x250 RGB)
    img = Image.new("RGB", (250, 250), color=(140, 120, 100))
    # Draw some debris/edges
    for i in range(50, 200, 10):
        for j in range(50, 200, 10):
            img.putpixel((i, j), (220, 40, 30))
            
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()
    
    result = analyze_disaster_image(
        image_bytes=img_bytes,
        original_filename="test_rubble_scan.jpg",
        disaster_category="Building Collapse",
        location_name="Test Sector"
    )
    
    assert "predicted_class" in result
    assert "confidence" in result
    assert "gradcam_url" in result
    assert "class_probabilities" in result
    assert "structural_safety_disclaimer" in result
    print(f"[PASS] AI Inference & Grad-CAM: Class='{result['predicted_class']}', Confidence={result['confidence_percentage']}%, Grad-CAM={result['gradcam_url']}")

def test_database_records():
    db = SessionLocal()
    users_cnt = db.query(User).count()
    incidents_cnt = db.query(Incident).count()
    teams_cnt = db.query(RescueTeam).count()
    db.close()
    
    assert users_cnt >= 4
    assert incidents_cnt >= 6
    assert teams_cnt >= 6
    print(f"[PASS] Database Verification: {users_cnt} users, {incidents_cnt} incidents, {teams_cnt} teams seeded.")

if __name__ == "__main__":
    test_security()
    test_priority_engine()
    test_ai_inference_and_gradcam()
    test_database_records()
    print("\nALL BACKEND SUITE TESTS PASSED SUCCESSFULLY!")
