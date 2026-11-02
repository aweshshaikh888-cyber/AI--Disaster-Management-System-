import hashlib
import hmac
import base64
import json
import time
from typing import Optional, Dict, Any
from app.core.config import settings

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash a password using PBKDF2 HMAC-SHA256 with a salt."""
    if not salt:
        salt = base64.b64encode(hashlib.sha256(str(time.time()).encode()).digest()[:16]).decode()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${base64.b64encode(key).decode()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salt$hash string."""
    try:
        salt, key_b64 = hashed_password.split("$", 1)
        expected_key = base64.b64decode(key_b64.encode())
        new_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return hmac.compare_digest(expected_key, new_key)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Create a lightweight signed JWT-compatible token."""
    to_encode = data.copy()
    expire_time = time.time() + (expires_delta or (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60))
    to_encode.update({"exp": expire_time})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a signed token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        actual_sig = base64.urlsafe_b64decode(sig_b64 + "=" * (-len(sig_b64) % 4))
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * (-len(payload_b64) % 4)).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp") and time.time() > payload["exp"]:
            return None
            
        return payload
    except Exception:
        return None
