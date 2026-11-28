import random
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from app.config import settings
from app.services.supabase_service import supabase

router = APIRouter()
JWT_ALGO = "HS256"

class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGO)

@router.post("/signup")
def signup(req: SignupRequest):
    email = req.email.lower().strip()
    existing = supabase.table("users").select("id").eq("email", email).execute().data
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = supabase.table("users").insert({
        "full_name": req.full_name.strip(),
        "email": email,
        "password_hash": hash_password(req.password),
    }).execute().data[0]

    token = create_token(user["id"], user["email"])
    return {
        "access_token": token,
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]},
    }

@router.post("/login")
def login(req: LoginRequest):
    email = req.email.lower().strip()
    rows = supabase.table("users").select("*").eq("email", email).execute().data
    if not rows or not verify_password(req.password, rows[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = rows[0]
    token = create_token(user["id"], user["email"])
    return {
        "access_token": token,
        "user": {"id": user["id"], "full_name": user["full_name"], "email": user["email"]},
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    email = req.email.lower().strip()
    rows = supabase.table("users").select("id").eq("email", email).execute().data
    if not rows:
        # Generic response so attackers can't enumerate emails
        return {"message": "If that email exists, a 6-digit reset code has been sent."}

    otp = f"{random.randint(100000, 999999)}"
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

    supabase.table("password_resets").insert({
        "user_id": rows[0]["id"],
        "otp_code": otp,
        "expires_at": expires_at,
    }).execute()

    # Dev-mode delivery (swap with Brevo/SMTP email send in production)
    print(f"\n[PASSWORD RESET OTP] {email} -> {otp} (valid 15 mins)\n")
    return {"message": "If that email exists, a 6-digit reset code has been sent."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    email = req.email.lower().strip()
    users = supabase.table("users").select("id").eq("email", email).execute().data
    if not users:
        raise HTTPException(status_code=400, detail="Invalid reset request")

    user_id = users[0]["id"]
    resets = (
        supabase.table("password_resets")
        .select("*")
        .eq("user_id", user_id)
        .eq("otp_code", req.otp_code.strip())
        .eq("used", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
        .data
    )

    if not resets:
        raise HTTPException(status_code=400, detail="Invalid or already used OTP code")

    reset_row = resets[0]
    if datetime.fromisoformat(reset_row["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP code has expired")

    supabase.table("users").update({"password_hash": hash_password(req.new_password)}).eq("id", user_id).execute()
    supabase.table("password_resets").update({"used": True}).eq("id", reset_row["id"]).execute()
    return {"message": "Password updated successfully. You can now log in."}

@router.get("/me")
def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGO])
        rows = supabase.table("users").select("id, full_name, email").eq("id", payload["sub"]).execute().data
        if not rows:
            raise HTTPException(status_code=401, detail="User not found")
        return rows[0]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")