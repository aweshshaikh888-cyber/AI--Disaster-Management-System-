import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="OFFICER") # ADMIN, OFFICER, RESCUE, ANALYST
    full_name = Column(String(100), nullable=True)
    agency = Column(String(100), default="National Disaster Management Authority")
    phone = Column(String(30), nullable=True)
    badge_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    audit_logs = relationship("AuditLog", back_populates="user")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String(30), unique=True, index=True) # e.g. DIS-2026-001
    title = Column(String(200), nullable=False)
    disaster_type = Column(String(50), index=True) # Earthquake, Flood, Cyclone, Landslide, Fire, Building Collapse
    severity = Column(String(50), index=True) # No Damage, Low Damage, Moderate Damage, Severe Damage, Critical Damage
    status = Column(String(50), default="Reported", index=True) # Reported, Under Review, Confirmed, Response Initiated, Resolved, Closed
    description = Column(Text, nullable=True)
    location_name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Priority Engine factors (0 to 100)
    priority_score = Column(Float, default=50.0)
    priority_category = Column(String(20), default="Medium") # Low, Medium, High, Critical
    affected_people_est = Column(Integer, default=0)
    critical_infra_affected = Column(Boolean, default=False)
    medical_emergency = Column(Boolean, default=False)
    
    # Media & AI
    image_url = Column(String(255), nullable=True)
    gradcam_url = Column(String(255), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    
    reported_by = Column(String(100), default="Citizen Report")
    reporter_contact = Column(String(50), nullable=True)
    assigned_officer = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    timeline = relationship("IncidentTimeline", back_populates="incident", cascade="all, delete-orphan")
    analyses = relationship("AIAnalysis", back_populates="incident")
    assignments = relationship("Assignment", back_populates="incident")

class IncidentTimeline(Base):
    __tablename__ = "incident_timelines"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    author = Column(String(100), default="System")
    action = Column(String(100), nullable=False)
    notes = Column(Text, nullable=True)
    
    incident = relationship("Incident", back_populates="timeline")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    image_path = Column(String(255), nullable=False)
    gradcam_path = Column(String(255), nullable=True)
    
    # Prediction details
    predicted_class = Column(String(50), nullable=False) # No Damage, Low Damage, Moderate Damage, Severe Damage, Critical Damage
    confidence_score = Column(Float, nullable=False)
    severity_level = Column(String(50), nullable=False)
    disaster_type = Column(String(50), default="Unknown")
    
    location_name = Column(String(200), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    class_probabilities = Column(JSON, nullable=True) # {"No Damage": 0.02, "Low Damage": 0.05, ...}
    feature_metrics = Column(JSON, nullable=True)
    recommended_actions = Column(JSON, nullable=True)
    
    model_version = Column(String(50), default="DisasterCNN-v2.4-Augmented")
    is_demo = Column(Boolean, default=False)
    execution_time_ms = Column(Float, default=120.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    incident = relationship("Incident", back_populates="analyses")

class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), default="Urban Search and Rescue (USAR)") # USAR, Medical First Response, Hazmat, K9 Search, Flood & Water Rescue
    lead_name = Column(String(100), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    member_count = Column(Integer, default=8)
    status = Column(String(50), default="Available") # Available, Assigned, En Route, On Site, Completed
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    equipment_summary = Column(Text, nullable=True)
    vehicle_info = Column(String(200), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    assignments = relationship("Assignment", back_populates="team")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    assigned_by = Column(String(100), default="Command Center Officer")
    status = Column(String(50), default="Dispatched") # Dispatched, En Route, On Scene, Completed
    task_instructions = Column(Text, nullable=True)
    dispatched_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    team = relationship("RescueTeam", back_populates="assignments")
    incident = relationship("Incident", back_populates="assignments")

class HospitalShelter(Base):
    __tablename__ = "facilities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    facility_type = Column(String(50), nullable=False) # Hospital, Emergency Clinic, Temporary Shelter, Relief Camp
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_phone = Column(String(50), nullable=False)
    total_capacity = Column(Integer, default=200)
    available_capacity = Column(Integer, default=75) # Available beds or shelter spaces
    services = Column(String(255), default="ICU, Trauma Center, Ambulance Bay")
    is_verified = Column(Boolean, default=True)
    status = Column(String(50), default="Operational") # Operational, Crowded, Over Capacity

class EmergencyResource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # Medical, Vehicles, Rescue Gear, Food & Water, Shelter
    total_quantity = Column(Integer, default=100)
    available_quantity = Column(Integer, default=70)
    unit = Column(String(30), default="units") # units, kits, vehicles, cartons, liters
    warehouse_location = Column(String(150), default="Central Emergency Depot")
    min_threshold = Column(Integer, default=20)
    status = Column(String(30), default="Adequate") # Adequate, Low Stock, Critical

class ResourceRequest(Base):
    __tablename__ = "resource_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    requested_quantity = Column(Integer, default=10)
    urgency = Column(String(30), default="High") # Low, Medium, High, Critical
    status = Column(String(30), default="Pending") # Pending, Approved, In Transit, Delivered, Rejected
    requested_by = Column(String(100), default="Field Commander")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class EmergencyNotification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(30), default="Warning") # Information, Advisory, Warning, Critical Evacuation
    target_channel = Column(String(50), default="Multi-Channel (In-App + SMS + Email)")
    target_region = Column(String(100), default="All Operational Sectors")
    is_test_mode = Column(Boolean, default=False)
    sent_by = Column(String(100), default="Operations Director")
    acknowledged = Column(Boolean, default=False)
    recipients_count = Column(Integer, default=450)
    delivery_status = Column(String(50), default="Sent")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WeatherAlert(Base):
    __tablename__ = "weather_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False)
    weather_condition = Column(String(100), default="Heavy Rainfall")
    temperature = Column(Float, default=28.5)
    wind_speed_kmh = Column(Float, default=45.0)
    humidity = Column(Float, default=88.0)
    rainfall_mm = Column(Float, default=65.0)
    risk_level = Column(String(50), default="High Risk") # Low, Moderate, High, Extreme
    warning_title = Column(String(200), nullable=False)
    official_advisory = Column(Text, nullable=True)
    is_authoritative = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(50), default="System")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False) # Incident, AIAnalysis, Team, Resource, Alert
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")

class ModelMetrics(Base):
    __tablename__ = "model_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), default="DisasterAI CNN ResNet50-V2")
    version = Column(String(50), default="v2.4-Augmented")
    reported_accuracy = Column(Float, default=98.12)
    baseline_accuracy = Column(Float, default=90.10)
    augmentation_uplift = Column(Float, default=8.02)
    validation_loss = Column(Float, default=0.084)
    precision_macro = Column(Float, default=0.978)
    recall_macro = Column(Float, default=0.975)
    f1_macro = Column(Float, default=0.976)
    roc_auc = Column(Float, default=0.992)
    training_samples = Column(Integer, default=12450)
    validation_samples = Column(Integer, default=2650)
    test_samples = Column(Integer, default=3100)
    confusion_matrix_data = Column(JSON, nullable=True)
    epoch_history = Column(JSON, nullable=True)
    class_metrics = Column(JSON, nullable=True)
    training_date = Column(String(50), default="2026-09-15")
    is_active = Column(Boolean, default=True)
