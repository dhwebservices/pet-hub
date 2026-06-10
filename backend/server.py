from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import math
import base64
import logging
import secrets
import asyncio
import httpx
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Any, Dict

import bcrypt
import jwt as pyjwt
import qrcode
from io import BytesIO

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("npw")
BRAND_NAME = "National Pet Watch"
BRAND_TAGLINE = "The UK's Pet Registry & Recovery Network"
ROLE_SLUGS = {"owner", "veterinary_practice", "rescue_organisation", "administrator"}
LEGACY_ROLE_MAP = {
    "owner": "owner",
    "vet": "veterinary_practice",
    "rescue": "rescue_organisation",
    "admin": "administrator",
}

# ---------------- MongoDB ----------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------------- Helpers ----------------
JWT_ALGORITHM = "HS256"
def jwt_secret(): return os.environ["JWT_SECRET"]

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def normalise_role(role: str) -> str:
    return LEGACY_ROLE_MAP.get(role, role)

def make_access_token(uid: str, email: str, role: str) -> str:
    payload = {"sub": uid, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return pyjwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)

def make_refresh_token(uid: str) -> str:
    payload = {"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return pyjwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def password_strength_error(password: str) -> Optional[str]:
    if len(password) < 10:
        return "Password must be at least 10 characters."
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password):
        return "Password must include upper and lower case letters."
    if not re.search(r"\d", password):
        return "Password must include a number."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password must include a symbol."
    return None

def validate_password_strength(password: str):
    message = password_strength_error(password)
    if message:
        raise HTTPException(400, message)

def csrf_token() -> str:
    return secrets.token_urlsafe(32)

def set_auth_cookies(response: Response, access: str, refresh: Optional[str] = None):
    secure = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
    response.set_cookie("access_token", access, httponly=True, secure=secure, samesite="lax", max_age=43200, path="/")
    if refresh:
        response.set_cookie("refresh_token", refresh, httponly=True, secure=secure, samesite="lax", max_age=604800, path="/")
    response.set_cookie("csrf_token", csrf_token(), httponly=False, secure=secure, samesite="lax", max_age=604800, path="/")

def haversine_miles(lat1, lon1, lat2, lon2) -> float:
    R = 3958.8
    rlat1, rlat2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(rlat1)*math.cos(rlat2)*math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

async def geocode_postcode(postcode: str, country: str = "UK") -> Optional[Dict[str, float]]:
    """Use Nominatim free geocoder (OpenStreetMap)."""
    if not postcode:
        return None
    try:
        async with httpx.AsyncClient(timeout=8) as c:
            r = await c.get(
                "https://nominatim.openstreetmap.org/search",
                params={"postalcode": postcode, "country": country, "format": "json", "limit": 1},
                headers={"User-Agent": "NationalPetWatch/1.0"},
            )
            data = r.json()
            if data:
                return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    except Exception as e:
        logger.warning(f"geocode failed: {e}")
    return None

# ---------------- Auth Dependency ----------------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = pyjwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        user["role"] = normalise_role(user.get("role", "owner"))
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

def require_role(*roles):
    async def dep(user: dict = Depends(get_current_user)):
        allowed = {normalise_role(role) for role in roles}
        if normalise_role(user.get("role")) not in allowed:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return dep

# ---------------- Email Client ----------------
class EmailClient:
    async def send(self, to: List[str], subject: str, html: str) -> dict:
        raise NotImplementedError

class DummyEmail(EmailClient):
    async def send(self, to, subject, html):
        rec = {"to": to, "subject": subject, "html": html, "sent_at": now_iso(), "status": "local"}
        logger.info(f"[LOCAL EMAIL] to={to} subject={subject}")
        await db.email_log.insert_one({**rec, "id": str(uuid.uuid4())})
        return {"id": "local", "status": "local"}

class ResendEmail(EmailClient):
    def __init__(self, key, sender):
        import resend
        resend.api_key = key
        self._resend = resend
        self.sender = sender
    async def send(self, to, subject, html):
        try:
            params = {"from": self.sender, "to": to, "subject": subject, "html": html}
            res = await asyncio.to_thread(self._resend.Emails.send, params)
            await db.email_log.insert_one({"id": str(uuid.uuid4()), "to": to, "subject": subject,
                                            "sent_at": now_iso(), "status": "sent", "provider_id": res.get("id")})
            return res
        except Exception as e:
            logger.error(f"resend failed: {e}")
            return await DummyEmail().send(to, subject, html)

def get_email_client() -> EmailClient:
    backend = os.environ.get("EMAIL_BACKEND", "dummy")
    key = os.environ.get("RESEND_API_KEY", "")
    if backend == "resend" and key:
        return ResendEmail(key, os.environ.get("RESEND_FROM", "alerts@example.com"))
    return DummyEmail()

# ---------------- Email Templates ----------------
def tmpl_base(content: str, title: str = "National Pet Watch") -> str:
    return f"""<!doctype html><html><body style="font-family:'IBM Plex Sans',Arial,sans-serif;background:#FDFBF7;margin:0;padding:0;color:#1C2421">
<div style="max-width:640px;margin:0 auto;padding:32px 16px">
  <div style="text-align:center;padding:16px 0 24px"><span style="font-family:'Manrope',Arial,sans-serif;font-weight:800;font-size:22px;color:#1E3F32;letter-spacing:-0.5px">National Pet Watch</span></div>
  <div style="background:#fff;border:1px solid #E2E8E4;border-radius:12px;padding:32px">{content}</div>
  <p style="text-align:center;color:#5F736A;font-size:12px;margin-top:24px">{BRAND_TAGLINE}</p>
</div></body></html>"""

def tmpl_welcome(name):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">Welcome, {name}</h1>
<p>Thanks for joining National Pet Watch — your safety net for pet recovery.</p>
<p>Next steps: register your pet, upload a clear photo, and we'll generate a QR profile and emergency contact card you can share if your pet ever goes missing.</p>""")

def tmpl_pet_registered(pet_name):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">{pet_name} is registered</h1>
<p>{pet_name} has been added to the registry. Your pet's QR profile is now live and ready to help reunite you in an emergency.</p>""")

def tmpl_found_alert(pet_name, location, notes):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">Possible found-pet match for {pet_name}</h1>
<p>A found-pet report may match your pet.</p>
<p><strong>Location:</strong> {location}</p>
<p><strong>Notes:</strong> {notes}</p>""")

def tmpl_sighting_alert(location, notes, reporter):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">New sighting reported</h1>
<p><strong>Location:</strong> {location}</p>
<p><strong>Notes:</strong> {notes}</p>
<p><strong>Reporter:</strong> {reporter}</p>""")

def tmpl_password_reset(reset_link):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">Reset your password</h1>
<p>Use the secure link below to reset your National Pet Watch password.</p>
<p><a href="{reset_link}" style="display:inline-block;background:#1E3F32;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Reset password</a></p>""")

def tmpl_account_verification(verify_link):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">Verify your account</h1>
<p>Please verify your email address to help keep National Pet Watch safe and trustworthy.</p>
<p><a href="{verify_link}" style="display:inline-block;background:#1E3F32;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Verify account</a></p>""")

def tmpl_lost_alert(pet, last_seen, link):
    img = pet.get("photo_url") or ""
    img_html = f'<img src="{img}" alt="{pet["name"]}" style="width:100%;max-width:480px;border-radius:8px;margin:16px 0"/>' if img else ""
    return tmpl_base(f"""<div style="display:inline-block;background:#FDF2F0;color:#C85A40;border:1px solid #FADCD5;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase">Lost Pet Alert</div>
<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:12px 0 8px;font-size:24px">{pet['name']} is missing near you</h1>
{img_html}
<p><strong>Breed:</strong> {pet.get('breed','—')} &nbsp;·&nbsp; <strong>Species:</strong> {pet.get('species','—')}</p>
<p><strong>Last seen:</strong> {last_seen.get('location','—')} on {last_seen.get('date','—')}</p>
<p><strong>Description:</strong> {last_seen.get('description','—')}</p>
<p style="margin-top:24px"><a href="{link}" style="display:inline-block;background:#C85A40;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600">Submit a Sighting</a></p>
<p style="color:#5F736A;font-size:13px;margin-top:24px">You're receiving this because you registered with National Pet Watch within {os.environ.get('ALERT_RADIUS_MILES','10')} miles of this area.</p>""")

# ---------------- Models ----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    phone: Optional[str] = Field(default="", max_length=40)
    address: Optional[str] = Field(default="", max_length=240)
    town: Optional[str] = Field(default="", max_length=120)
    county: Optional[str] = Field(default="", max_length=120)
    postcode: Optional[str] = Field(default="", max_length=16)
    country: Optional[str] = "UK"

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        message = password_strength_error(value)
        if message:
            raise ValueError(message)
        return value

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class PetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    species: str = Field(min_length=1, max_length=80)
    breed: Optional[str] = Field(default="", max_length=120)
    gender: Optional[str] = Field(default="", max_length=40)
    dob: Optional[str] = Field(default="", max_length=32)
    color: Optional[str] = Field(default="", max_length=120)
    weight: Optional[str] = Field(default="", max_length=40)
    distinguishing_features: Optional[str] = Field(default="", max_length=1000)
    microchip: Optional[str] = Field(default="", max_length=40)
    medical_conditions: Optional[str] = Field(default="", max_length=1000)
    medication: Optional[str] = Field(default="", max_length=1000)
    neutered: Optional[bool] = False
    behaviour_notes: Optional[str] = ""
    emergency_contact_name: Optional[str] = Field(default="", max_length=120)
    emergency_contact_phone: Optional[str] = Field(default="", max_length=40)
    photo_url: Optional[str] = ""

class EmergencyContactCreate(BaseModel):
    pet_id: str
    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=1, max_length=40)
    email: Optional[EmailStr] = None
    relationship: Optional[str] = Field(default="", max_length=80)
    priority: int = Field(default=1, ge=1, le=10)

class PetDocumentCreate(BaseModel):
    pet_id: str
    document_type: Literal["vaccination", "insurance", "vet", "other"]
    filename: str = Field(min_length=1, max_length=180)
    url: str = Field(min_length=1)

class LostReportCreate(BaseModel):
    pet_id: str
    last_seen_date: str = Field(min_length=1, max_length=32)
    last_seen_location: str = Field(min_length=1, max_length=240)
    last_seen_lat: Optional[float] = None
    last_seen_lon: Optional[float] = None
    description: str = Field(min_length=1, max_length=2000)
    reward: Optional[str] = Field(default="", max_length=80)

class FoundReportCreate(BaseModel):
    species: str
    breed: Optional[str] = ""
    color: Optional[str] = ""
    location: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: Optional[str] = ""
    microchip: Optional[str] = ""
    photo_url: Optional[str] = ""
    reporter_name: str
    reporter_email: EmailStr
    reporter_phone: Optional[str] = ""

class SightingCreate(BaseModel):
    lost_report_id: str
    location: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    notes: str
    photo_url: Optional[str] = ""
    reporter_name: str
    reporter_email: EmailStr
    reporter_phone: Optional[str] = ""

class VetRegister(BaseModel):
    practice_name: str
    contact_name: str
    email: EmailStr
    phone: str
    address: str
    postcode: str
    country: Optional[str] = "UK"
    license_number: Optional[str] = ""
    password: str = Field(max_length=128)

class RescueRegister(BaseModel):
    organisation_name: str
    contact_name: str
    email: EmailStr
    phone: str
    address: str
    postcode: str
    country: Optional[str] = "UK"
    registration_number: Optional[str] = ""
    password: str = Field(max_length=128)

class SupportTicket(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ---------------- App Setup ----------------
app = FastAPI(title="National Pet Watch API")
api = APIRouter(prefix="/api")
rate_limit_hits = defaultdict(deque)

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()
    window_seconds = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "60"))
    max_requests = int(os.environ.get("RATE_LIMIT_MAX_REQUESTS", "120"))
    now = datetime.now(timezone.utc).timestamp()
    hits = rate_limit_hits[client_ip]
    while hits and hits[0] < now - window_seconds:
        hits.popleft()
    if len(hits) >= max_requests:
        return JSONResponse({"detail": "Too many requests"}, status_code=429)
    hits.append(now)

    mutating = request.method in {"POST", "PUT", "PATCH", "DELETE"}
    bearer_auth = request.headers.get("Authorization", "").startswith("Bearer ")
    cookie_auth = bool(request.cookies.get("access_token"))
    exempt_paths = {"/api/auth/login", "/api/auth/register", "/api/vet/register", "/api/rescue/register"}
    if mutating and cookie_auth and not bearer_auth and request.url.path not in exempt_paths:
        if request.headers.get("x-csrf-token") != request.cookies.get("csrf_token"):
            return JSONResponse({"detail": "Invalid CSRF token"}, status_code=403)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
    return response

# ---------------- Auth Endpoints ----------------
@api.post("/auth/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    role = await db.roles.find_one({"slug": "owner"}, {"_id": 0})
    coords = await geocode_postcode(data.postcode, data.country or "UK") if data.postcode else None
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(data.password),
        "first_name": data.first_name,
        "last_name": data.last_name,
        "phone": data.phone,
        "address": data.address,
        "town": data.town,
        "county": data.county,
        "postcode": data.postcode,
        "country": data.country,
        "lat": coords["lat"] if coords else None,
        "lon": coords["lon"] if coords else None,
        "role": "owner",
        "role_id": role["id"] if role else None,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    user.pop("password_hash", None); user.pop("_id", None)
    access = make_access_token(user["id"], email, "owner")
    refresh = make_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    em = get_email_client()
    asyncio.create_task(em.send([email], "Welcome to National Pet Watch", tmpl_welcome(data.first_name)))
    return {"user": user, "access_token": access}

@api.post("/auth/login")
async def login(data: UserLogin, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    access = make_access_token(user["id"], email, normalise_role(user.get("role", "owner")))
    refresh = make_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    user["role"] = normalise_role(user.get("role", "owner"))
    user.pop("password_hash", None); user.pop("_id", None)
    return {"user": user, "access_token": access}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("csrf_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    user.pop("_id", None)
    return user

# ---------------- Pets ----------------
@api.post("/pets")
async def create_pet(data: PetCreate, user: dict = Depends(get_current_user)):
    pet = {**data.model_dump(), "id": str(uuid.uuid4()), "owner_id": user["id"], "status": "registered",
           "created_at": now_iso()}
    await db.pets.insert_one(pet)
    pet.pop("_id", None)
    em = get_email_client()
    asyncio.create_task(em.send([user["email"]], f"{pet['name']} registered", tmpl_pet_registered(pet["name"])))
    return pet

@api.get("/pets/mine")
async def my_pets(user: dict = Depends(get_current_user)):
    pets = await db.pets.find({"owner_id": user["id"]}, {"_id": 0}).to_list(500)
    return pets

@api.get("/pets/{pet_id}")
async def get_pet(pet_id: str):
    pet = await db.pets.find_one({"id": pet_id}, {"_id": 0})
    if not pet:
        raise HTTPException(404, "Pet not found")
    # Public version: hide owner info
    owner = await db.users.find_one({"id": pet["owner_id"]}, {"_id": 0, "password_hash": 0,
                                                                "address": 0, "lat": 0, "lon": 0})
    pet["owner_public"] = {
        "first_name": owner["first_name"] if owner else "",
        "town": owner.get("town", "") if owner else "",
        "county": owner.get("county", "") if owner else "",
    }
    return pet

@api.put("/pets/{pet_id}")
async def update_pet(pet_id: str, data: PetCreate, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    await db.pets.update_one({"id": pet_id}, {"$set": data.model_dump()})
    return {"ok": True}

@api.delete("/pets/{pet_id}")
async def delete_pet(pet_id: str, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    await db.pets.delete_one({"id": pet_id})
    return {"ok": True}

@api.post("/pets/{pet_id}/mark-found")
async def mark_pet_found_by_pet_id(pet_id: str, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet:
        raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")

    result = await db.lost_reports.update_many(
        {"pet_id": pet_id, "status": "active"},
        {"$set": {"status": "found", "resolved_at": now_iso(), "resolved_by": user["id"]}},
    )
    await db.pets.update_one({"id": pet_id}, {"$set": {"status": "registered"}})
    return {"ok": True, "resolved_reports": result.modified_count}

@api.post("/emergency-contacts")
async def create_emergency_contact(data: EmergencyContactCreate, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": data.pet_id})
    if not pet:
        raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "owner_id": pet["owner_id"], "created_at": now_iso()}
    await db.emergency_contacts.insert_one(rec)
    rec.pop("_id", None)
    return rec

@api.get("/pets/{pet_id}/emergency-contacts")
async def list_emergency_contacts(pet_id: str, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet:
        raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    return await db.emergency_contacts.find({"pet_id": pet_id}, {"_id": 0}).sort("priority", 1).to_list(100)

@api.post("/pet-documents")
async def create_pet_document(data: PetDocumentCreate, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": data.pet_id})
    if not pet:
        raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "owner_id": pet["owner_id"], "created_at": now_iso()}
    await db.pet_documents.insert_one(rec)
    rec.pop("_id", None)
    return rec

@api.get("/pets/{pet_id}/documents")
async def list_pet_documents(pet_id: str, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet:
        raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    return await db.pet_documents.find({"pet_id": pet_id}, {"_id": 0}).sort("created_at", -1).to_list(100)

@api.get("/pets/{pet_id}/qr")
async def pet_qr(pet_id: str):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    url = f"{frontend}/p/{pet_id}"
    img = qrcode.make(url)
    buf = BytesIO(); img.save(buf, format="PNG"); buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

# ---------------- Photo Upload (base64 inline storage) ----------------
@api.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images allowed")
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 5 MB)")
    b64 = base64.b64encode(contents).decode()
    data_url = f"data:{file.content_type};base64,{b64}"
    rec = {"id": str(uuid.uuid4()), "owner_id": user["id"], "filename": file.filename,
           "content_type": file.content_type, "size": len(contents), "data_url": data_url,
           "uploaded_at": now_iso()}
    await db.pet_photos.insert_one(rec)
    return {"id": rec["id"], "url": data_url}

# Public image upload (anonymous found/sighting reports) — limited size
@api.post("/upload/public-image")
async def upload_public_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images allowed")
    contents = await file.read()
    if len(contents) > 3 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 3 MB)")
    b64 = base64.b64encode(contents).decode()
    data_url = f"data:{file.content_type};base64,{b64}"
    return {"url": data_url}

# ---------------- Alert Engine ----------------
async def dispatch_lost_alerts(lost: dict, pet: dict):
    radius = float(os.environ.get("ALERT_RADIUS_MILES", "10"))
    lat, lon = lost.get("last_seen_lat"), lost.get("last_seen_lon")
    if lat is None or lon is None:
        logger.info("No coordinates for lost report; skipping radius alerts")
        return
    cursor = db.users.find({"lat": {"$ne": None}, "lon": {"$ne": None}}, {"_id": 0, "password_hash": 0})
    em = get_email_client()
    frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    link = f"{frontend}/report-sighting/{lost['id']}"
    sent = 0
    async for u in cursor:
        if u["id"] == pet["owner_id"]:
            continue
        d = haversine_miles(lat, lon, u["lat"], u["lon"])
        if d <= radius:
            html = tmpl_lost_alert(pet,
                {"location": lost["last_seen_location"], "date": lost["last_seen_date"],
                 "description": lost["description"]}, link)
            notification_id = str(uuid.uuid4())
            notification = {
                "id": notification_id,
                "user_id": u["id"],
                "type": "lost_pet_alert",
                "channel": "in_app",
                "title": f"Lost pet near {u.get('town') or 'your area'}",
                "body": f"{pet['name']} was reported missing nearby.",
                "lost_report_id": lost["id"],
                "read": False,
                "created_at": now_iso(),
            }
            await db.notifications.insert_one(notification)
            queue_id = str(uuid.uuid4())
            await db.notification_queue.insert_one({
                "id": queue_id, "notification_id": notification_id, "user_id": u["id"],
                "type": "lost_pet_alert", "channel": "email", "status": "queued",
                "lost_report_id": lost["id"], "created_at": now_iso(),
                "distance_miles": round(d, 2),
            })
            await em.send([u["email"]], f"Lost Pet Alert: {pet['name']} near {u.get('town','your area')}", html)
            await db.notification_queue.update_one({"id": queue_id}, {"$set": {"status": "sent", "sent_at": now_iso()}})
            sent += 1
    await db.lost_reports.update_one({"id": lost["id"]}, {"$set": {"alerts_sent": sent}})
    logger.info(f"Dispatched {sent} lost alerts for pet {pet['name']}")

# ---------------- Lost Reports ----------------
@api.post("/lost")
async def report_lost(data: LostReportCreate, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": data.pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") not in ("administrator", "veterinary_practice", "rescue_organisation"):
        raise HTTPException(403, "Not allowed")
    lat, lon = data.last_seen_lat, data.last_seen_lon
    if (lat is None or lon is None) and data.last_seen_location:
        coords = await geocode_postcode(data.last_seen_location, "UK")
        if coords:
            lat, lon = coords["lat"], coords["lon"]
    lost = {
        "id": str(uuid.uuid4()),
        "pet_id": data.pet_id,
        "owner_id": pet["owner_id"],
        "last_seen_date": data.last_seen_date,
        "last_seen_location": data.last_seen_location,
        "last_seen_lat": lat,
        "last_seen_lon": lon,
        "description": data.description,
        "reward": data.reward,
        "status": "active",
        "created_at": now_iso(),
        "alerts_sent": 0,
    }
    await db.lost_reports.insert_one(lost)
    await db.pets.update_one({"id": data.pet_id}, {"$set": {"status": "lost"}})
    pet_clean = {k: v for k, v in pet.items() if k != "_id"}
    asyncio.create_task(dispatch_lost_alerts(lost, pet_clean))
    lost.pop("_id", None)
    return lost

@api.get("/lost")
async def list_lost():
    items = await db.lost_reports.find({"status": "active"}, {"_id": 0}).sort("created_at", -1).to_list(200)
    for it in items:
        pet = await db.pets.find_one({"id": it["pet_id"]}, {"_id": 0})
        it["pet"] = pet
    return items

@api.get("/lost/{report_id}")
async def get_lost(report_id: str):
    it = await db.lost_reports.find_one({"id": report_id}, {"_id": 0})
    if not it: raise HTTPException(404, "Not found")
    pet = await db.pets.find_one({"id": it["pet_id"]}, {"_id": 0})
    it["pet"] = pet
    return it

@api.post("/lost/{report_id}/found")
async def mark_pet_found(report_id: str, user: dict = Depends(get_current_user)):
    lost = await db.lost_reports.find_one({"id": report_id})
    if not lost: raise HTTPException(404, "Not found")
    if lost["owner_id"] != user["id"] and user.get("role") != "administrator":
        raise HTTPException(403, "Not allowed")
    await db.lost_reports.update_one({"id": report_id}, {"$set": {"status": "found", "resolved_at": now_iso()}})
    await db.pets.update_one({"id": lost["pet_id"]}, {"$set": {"status": "registered"}})
    return {"ok": True}

# ---------------- Found Reports ----------------
@api.post("/found")
async def report_found(data: FoundReportCreate):
    lat, lon = data.lat, data.lon
    if (lat is None or lon is None) and data.location:
        coords = await geocode_postcode(data.location, "UK")
        if coords: lat, lon = coords["lat"], coords["lon"]
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "lat": lat, "lon": lon,
           "status": "open", "created_at": now_iso()}
    await db.found_reports.insert_one(rec)
    rec.pop("_id", None)
    # If microchip provided, try to notify owner
    if data.microchip:
        pet = await db.pets.find_one({"microchip": data.microchip})
        if pet:
            owner = await db.users.find_one({"id": pet["owner_id"]})
            if owner:
                em = get_email_client()
                asyncio.create_task(em.send([owner["email"]], f"Possible match for {pet['name']}",
                    tmpl_found_alert(pet["name"], data.location, data.notes)))
    return rec

@api.get("/found")
async def list_found():
    items = await db.found_reports.find({"status": "open"}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

# ---------------- Sighting Reports ----------------
@api.post("/sightings")
async def report_sighting(data: SightingCreate):
    lost = await db.lost_reports.find_one({"id": data.lost_report_id})
    if not lost: raise HTTPException(404, "Lost report not found")
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "status": "new", "created_at": now_iso()}
    await db.sighting_reports.insert_one(rec)
    rec.pop("_id", None)
    pet = await db.pets.find_one({"id": lost["pet_id"]}, {"_id": 0})
    owner = await db.users.find_one({"id": lost["owner_id"]})
    if owner and pet:
        em = get_email_client()
        asyncio.create_task(em.send(
            [owner["email"]],
            f"New sighting reported for {pet['name']}",
            tmpl_sighting_alert(data.location, data.notes, f"{data.reporter_name} - {data.reporter_email}"),
        ))
    return rec

@api.get("/sightings/{lost_report_id}")
async def list_sightings(lost_report_id: str, user: dict = Depends(get_current_user)):
    lost = await db.lost_reports.find_one({"id": lost_report_id})
    if not lost: raise HTTPException(404, "Not found")
    if lost["owner_id"] != user["id"] and user.get("role") not in ("administrator",):
        raise HTTPException(403, "Not allowed")
    items = await db.sighting_reports.find({"lost_report_id": lost_report_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

# ---------------- Public Map ----------------
@api.get("/map/markers")
async def map_markers():
    lost = await db.lost_reports.find({"status": "active",
                                        "last_seen_lat": {"$ne": None}}, {"_id": 0}).to_list(500)
    found = await db.found_reports.find({"status": "open",
                                          "lat": {"$ne": None}}, {"_id": 0}).to_list(500)
    out = []
    for l in lost:
        pet = await db.pets.find_one({"id": l["pet_id"]}, {"_id": 0})
        out.append({"type": "lost", "id": l["id"], "lat": l["last_seen_lat"], "lon": l["last_seen_lon"],
                    "title": pet["name"] if pet else "Lost pet",
                    "breed": pet.get("breed", "") if pet else "",
                    "photo": pet.get("photo_url") if pet else "",
                    "location": l["last_seen_location"], "date": l["last_seen_date"]})
    for f in found:
        out.append({"type": "found", "id": f["id"], "lat": f["lat"], "lon": f["lon"],
                    "title": f"Found {f['species']}", "breed": f.get("breed", ""),
                    "photo": f.get("photo_url", ""), "location": f["location"],
                    "date": f["created_at"][:10]})
    return out

# ---------------- Search ----------------
@api.get("/search")
async def search(q: str = "", species: str = "", status: str = ""):
    flt: Dict[str, Any] = {}
    if species: flt["species"] = species
    if status: flt["status"] = status
    if q:
        flt["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"breed": {"$regex": q, "$options": "i"}},
            {"microchip": {"$regex": q, "$options": "i"}},
        ]
    items = await db.pets.find(flt, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

# ---------------- Vet / Rescue Registration ----------------
@api.post("/vet/register")
async def vet_register(data: VetRegister, response: Response):
    validate_password_strength(data.password)
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(400, "Email already registered")
    role = await db.roles.find_one({"slug": "veterinary_practice"}, {"_id": 0})
    coords = await geocode_postcode(data.postcode, data.country or "UK")
    user = {
        "id": str(uuid.uuid4()),
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "first_name": data.contact_name.split(" ")[0],
        "last_name": " ".join(data.contact_name.split(" ")[1:]) or "",
        "phone": data.phone, "address": data.address, "postcode": data.postcode,
        "country": data.country, "lat": coords["lat"] if coords else None,
        "lon": coords["lon"] if coords else None,
        "role": "veterinary_practice", "role_id": role["id"] if role else None,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    practice = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "practice_name": data.practice_name,
        "license_number": data.license_number, "verified": False, "created_at": now_iso(),
    }
    await db.veterinary_practices.insert_one(practice)
    access = make_access_token(user["id"], user["email"], "veterinary_practice")
    set_auth_cookies(response, access)
    return {"ok": True, "practice_id": practice["id"]}

@api.post("/rescue/register")
async def rescue_register(data: RescueRegister, response: Response):
    validate_password_strength(data.password)
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(400, "Email already registered")
    role = await db.roles.find_one({"slug": "rescue_organisation"}, {"_id": 0})
    coords = await geocode_postcode(data.postcode, data.country or "UK")
    user = {
        "id": str(uuid.uuid4()), "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "first_name": data.contact_name.split(" ")[0],
        "last_name": " ".join(data.contact_name.split(" ")[1:]) or "",
        "phone": data.phone, "address": data.address, "postcode": data.postcode,
        "country": data.country, "lat": coords["lat"] if coords else None,
        "lon": coords["lon"] if coords else None,
        "role": "rescue_organisation", "role_id": role["id"] if role else None,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    org = {"id": str(uuid.uuid4()), "user_id": user["id"], "organisation_name": data.organisation_name,
           "registration_number": data.registration_number, "verified": False, "created_at": now_iso()}
    await db.rescue_organisations.insert_one(org)
    access = make_access_token(user["id"], user["email"], "rescue_organisation")
    set_auth_cookies(response, access)
    return {"ok": True, "rescue_id": org["id"]}

# ---------------- Support ----------------
@api.post("/support")
async def support(data: SupportTicket):
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "status": "open", "created_at": now_iso()}
    await db.support_tickets.insert_one(rec)
    rec.pop("_id", None)
    return rec

# ---------------- PayPal Donations ----------------
async def paypal_token():
    cid = os.environ.get("PAYPAL_CLIENT_ID", "")
    sec = os.environ.get("PAYPAL_CLIENT_SECRET", "")
    if not cid or not sec: return None
    base = "https://api-m.sandbox.paypal.com" if os.environ.get("PAYPAL_ENV", "sandbox") == "sandbox" else "https://api-m.paypal.com"
    auth = base64.b64encode(f"{cid}:{sec}".encode()).decode()
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.post(f"{base}/v1/oauth2/token", headers={"Authorization": f"Basic {auth}"},
                          data={"grant_type": "client_credentials"})
        return r.json().get("access_token"), base

@api.post("/donations/create")
async def create_donation(amount: float = 10.0, currency: str = "GBP"):
    tok = await paypal_token()
    if not tok:
        rec = {"id": str(uuid.uuid4()), "amount": amount, "currency": currency,
               "status": "recorded", "provider": "paypal-hosted-button", "created_at": now_iso()}
        await db.donations.insert_one(rec)
        return {"order_id": rec["id"], "donation_url": os.environ.get("PAYPAL_DONATE_URL", "https://www.paypal.com/donate/?hosted_button_id=FN55GF47FEC4J")}
    token, base = tok
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{base}/v2/checkout/orders",
                          headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                          json={"intent": "CAPTURE", "purchase_units": [{"amount": {"currency_code": currency, "value": f"{amount:.2f}"}}]})
        data = r.json()
        rec = {"id": data.get("id"), "amount": amount, "currency": currency,
               "status": "created", "created_at": now_iso()}
        await db.donations.insert_one(rec)
        return {"order_id": data.get("id")}

@api.post("/donations/capture/{order_id}")
async def capture_donation(order_id: str):
    tok = await paypal_token()
    if not tok:
        await db.donations.update_one({"id": order_id}, {"$set": {"status": "recorded"}})
        return {"ok": True}
    token, base = tok
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{base}/v2/checkout/orders/{order_id}/capture",
                          headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        await db.donations.update_one({"id": order_id}, {"$set": {"status": "captured"}})
        return r.json()

# ---------------- Admin Endpoints ----------------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("administrator"))):
    return {
        "users": await db.users.count_documents({}),
        "pets": await db.pets.count_documents({}),
        "lost": await db.lost_reports.count_documents({"status": "active"}),
        "found": await db.found_reports.count_documents({"status": "open"}),
        "sightings": await db.sighting_reports.count_documents({}),
        "vets": await db.veterinary_practices.count_documents({}),
        "rescues": await db.rescue_organisations.count_documents({}),
        "support_tickets_open": await db.support_tickets.count_documents({"status": "open"}),
    }

@api.get("/admin/users")
async def admin_users(user: dict = Depends(require_role("administrator"))):
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/pets")
async def admin_pets(user: dict = Depends(require_role("administrator"))):
    return await db.pets.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/vets")
async def admin_vets(user: dict = Depends(require_role("administrator"))):
    return await db.veterinary_practices.find({}, {"_id": 0}).to_list(500)

@api.get("/admin/rescues")
async def admin_rescues(user: dict = Depends(require_role("administrator"))):
    return await db.rescue_organisations.find({}, {"_id": 0}).to_list(500)

@api.get("/admin/support")
async def admin_support(user: dict = Depends(require_role("administrator"))):
    return await db.support_tickets.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.post("/admin/verify/{kind}/{id}")
async def admin_verify(kind: str, id: str, user: dict = Depends(require_role("administrator"))):
    col = {"vet": db.veterinary_practices, "rescue": db.rescue_organisations}.get(kind)
    if not col: raise HTTPException(400, "Invalid kind")
    await col.update_one({"id": id}, {"$set": {"verified": True, "verified_at": now_iso()}})
    await db.audit_logs.insert_one({"id": str(uuid.uuid4()), "actor": user["email"],
                                      "action": f"verify_{kind}", "target": id, "at": now_iso()})
    return {"ok": True}

@api.get("/admin/donations")
async def admin_donations(user: dict = Depends(require_role("administrator"))):
    return await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/email-log")
async def admin_email_log(user: dict = Depends(require_role("administrator"))):
    return await db.email_log.find({}, {"_id": 0}).sort("sent_at", -1).to_list(200)

# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"name": "National Pet Watch API", "status": "ok"}

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Startup ----------------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@nationalpetwatch.co.uk")
    pw = os.environ.get("ADMIN_PASSWORD", "ChangeMe-Admin-2026!")
    role = await db.roles.find_one({"slug": "administrator"}, {"_id": 0})
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "password_hash": hash_password(pw),
            "first_name": "Platform", "last_name": "Admin", "role": "administrator",
            "role_id": role["id"] if role else None,
            "created_at": now_iso(),
            "phone": "", "address": "", "town": "", "county": "", "postcode": "",
            "country": "UK", "lat": None, "lon": None,
        })
        logger.info(f"Admin seeded: {email}")
    elif not verify_password(pw, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pw)}})

async def seed_roles():
    roles = [
        ("owner", "Owner"),
        ("veterinary_practice", "Veterinary Practice"),
        ("rescue_organisation", "Rescue Organisation"),
        ("administrator", "Administrator"),
    ]
    for slug, name in roles:
        await db.roles.update_one(
            {"slug": slug},
            {"$setOnInsert": {"id": str(uuid.uuid4()), "slug": slug, "name": name, "created_at": now_iso()}},
            upsert=True,
        )

async def migrate_legacy_roles():
    role_docs = await db.roles.find({}, {"_id": 0}).to_list(50)
    role_ids = {r["slug"]: r["id"] for r in role_docs}
    async for user in db.users.find({}, {"_id": 0, "id": 1, "role": 1}):
        slug = normalise_role(user.get("role", "owner"))
        await db.users.update_one({"id": user["id"]}, {"$set": {"role": slug, "role_id": role_ids.get(slug)}})

@app.on_event("startup")
async def on_startup():
    await seed_roles()
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role_id")
    await db.pets.create_index("owner_id")
    await db.pets.create_index("microchip")
    await db.pet_photos.create_index("owner_id")
    await db.pet_documents.create_index("pet_id")
    await db.emergency_contacts.create_index("pet_id")
    await db.lost_reports.create_index("status")
    await db.lost_reports.create_index("pet_id")
    await db.found_reports.create_index("status")
    await db.sighting_reports.create_index("lost_report_id")
    await db.notifications.create_index("user_id")
    await db.notification_queue.create_index("status")
    await migrate_legacy_roles()
    await seed_admin()

@app.on_event("shutdown")
async def on_shutdown():
    client.close()
