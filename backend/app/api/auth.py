from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, AuditLog
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "OFFICER"
    full_name: Optional[str] = None
    agency: Optional[str] = "National Disaster Management Authority"

class LoginRequest(BaseModel):
    username: str
    password: str

class DemoLoginRequest(BaseModel):
    role: str # ADMIN, OFFICER, RESCUE, ANALYST

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered.")
    
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        role=req.role.upper(),
        full_name=req.full_name or req.username.capitalize(),
        agency=req.agency
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "agency": user.agency
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    token = create_access_token({"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "agency": user.agency
        }
    }

@router.post("/demo-login")
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    """One-click fast authentication for evaluation and presentation demonstrations."""
    role = req.role.upper()
    role_map = {
        "ADMIN": ("admin_commander", "admin@disasterai.gov", "Major General R. Sharma (HQ Commander)"),
        "OFFICER": ("officer_ops", "officer@disasterai.gov", "Captain Priya Patel (Operations Lead)"),
        "RESCUE": ("rescue_unit9", "rescue@disasterai.gov", "Lt. David Vance (USAR Strike Leader)"),
        "ANALYST": ("analyst_geoint", "analyst@disasterai.gov", "Dr. Aisha Rao (Senior Geoint Analyst)")
    }
    
    uname, email, name = role_map.get(role, role_map["OFFICER"])
    user = db.query(User).filter(User.username == uname).first()
    if not user:
        user = User(
            username=uname,
            email=email,
            hashed_password=hash_password("DemoPass2026!"),
            role=role,
            full_name=name,
            agency="National Emergency Operations Center"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token({"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name,
            "agency": user.agency
        },
        "is_demo_mode": True
    }
