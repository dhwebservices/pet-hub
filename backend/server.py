from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import math
import base64
import logging
import secrets
import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal, Any, Dict

import bcrypt
import jwt as pyjwt
import qrcode
from io import BytesIO

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("gpr")

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

def make_access_token(uid: str, email: str, role: str) -> str:
    payload = {"sub": uid, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return pyjwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)

def make_refresh_token(uid: str) -> str:
    payload = {"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return pyjwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

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
                headers={"User-Agent": "GlobalPetRegistry/1.0"},
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
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

def require_role(*roles):
    async def dep(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(403, "Insufficient permissions")
        return user
    return dep

# ---------------- Email Client ----------------
class EmailClient:
    async def send(self, to: List[str], subject: str, html: str) -> dict:
        raise NotImplementedError

class DummyEmail(EmailClient):
    async def send(self, to, subject, html):
        rec = {"to": to, "subject": subject, "html": html, "sent_at": now_iso(), "status": "MOCKED"}
        logger.info(f"[MOCKED EMAIL] to={to} subject={subject}")
        await db.email_log.insert_one({**rec, "id": str(uuid.uuid4())})
        return {"id": "mocked", "status": "MOCKED"}

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
def tmpl_base(content: str, title: str = "Global Pet Registry") -> str:
    return f"""<!doctype html><html><body style="font-family:'IBM Plex Sans',Arial,sans-serif;background:#FDFBF7;margin:0;padding:0;color:#1C2421">
<div style="max-width:640px;margin:0 auto;padding:32px 16px">
  <div style="text-align:center;padding:16px 0 24px"><span style="font-family:'Manrope',Arial,sans-serif;font-weight:800;font-size:22px;color:#1E3F32;letter-spacing:-0.5px">Global Pet Registry</span></div>
  <div style="background:#fff;border:1px solid #E2E8E4;border-radius:12px;padding:32px">{content}</div>
  <p style="text-align:center;color:#5F736A;font-size:12px;margin-top:24px">The Modern Pet Registry &amp; Recovery Network</p>
</div></body></html>"""

def tmpl_welcome(name):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">Welcome, {name}</h1>
<p>Thanks for joining Global Pet Registry — your safety net for pet recovery.</p>
<p>Next steps: register your pet, upload a clear photo, and we'll generate a QR profile and emergency contact card you can share if your pet ever goes missing.</p>""")

def tmpl_pet_registered(pet_name):
    return tmpl_base(f"""<h1 style="font-family:'Manrope',Arial,sans-serif;color:#1E3F32;margin:0 0 12px;font-size:24px">{pet_name} is registered</h1>
<p>{pet_name} has been added to the registry. Your pet's QR profile is now live and ready to help reunite you in an emergency.</p>""")

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
<p style="color:#5F736A;font-size:13px;margin-top:24px">You're receiving this because you registered with Global Pet Registry within {os.environ.get('ALERT_RADIUS_MILES','10')} miles of this area.</p>""")

# ---------------- Models ----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = ""
    address: Optional[str] = ""
    town: Optional[str] = ""
    county: Optional[str] = ""
    postcode: Optional[str] = ""
    country: Optional[str] = "UK"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PetCreate(BaseModel):
    name: str
    species: str
    breed: Optional[str] = ""
    gender: Optional[str] = ""
    dob: Optional[str] = ""
    color: Optional[str] = ""
    weight: Optional[str] = ""
    distinguishing_features: Optional[str] = ""
    microchip: Optional[str] = ""
    medical_conditions: Optional[str] = ""
    medication: Optional[str] = ""
    neutered: Optional[bool] = False
    behaviour_notes: Optional[str] = ""
    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""
    photo_url: Optional[str] = ""

class LostReportCreate(BaseModel):
    pet_id: str
    last_seen_date: str
    last_seen_location: str
    last_seen_lat: Optional[float] = None
    last_seen_lon: Optional[float] = None
    description: str
    reward: Optional[str] = ""

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
    password: str

class RescueRegister(BaseModel):
    organisation_name: str
    contact_name: str
    email: EmailStr
    phone: str
    address: str
    postcode: str
    country: Optional[str] = "UK"
    registration_number: Optional[str] = ""
    password: str

class SupportTicket(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

# ---------------- App Setup ----------------
app = FastAPI(title="Global Pet Registry API")
api = APIRouter(prefix="/api")

# ---------------- Auth Endpoints ----------------
@api.post("/auth/register")
async def register(data: UserRegister, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
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
        "subscription_tier": "free",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    user.pop("password_hash", None); user.pop("_id", None)
    access = make_access_token(user["id"], email, "owner")
    refresh = make_refresh_token(user["id"])
    response.set_cookie("access_token", access, httponly=True, samesite="lax", max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, samesite="lax", max_age=604800, path="/")
    em = get_email_client()
    asyncio.create_task(em.send([email], "Welcome to Global Pet Registry", tmpl_welcome(data.first_name)))
    return {"user": user, "access_token": access}

@api.post("/auth/login")
async def login(data: UserLogin, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    access = make_access_token(user["id"], email, user.get("role", "owner"))
    refresh = make_refresh_token(user["id"])
    response.set_cookie("access_token", access, httponly=True, samesite="lax", max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, samesite="lax", max_age=604800, path="/")
    user.pop("password_hash", None); user.pop("_id", None)
    return {"user": user, "access_token": access}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
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
    if pet["owner_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    await db.pets.update_one({"id": pet_id}, {"$set": data.model_dump()})
    return {"ok": True}

@api.delete("/pets/{pet_id}")
async def delete_pet(pet_id: str, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    await db.pets.delete_one({"id": pet_id})
    return {"ok": True}

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
            await em.send([u["email"]], f"Lost Pet Alert: {pet['name']} near {u.get('town','your area')}", html)
            await db.notification_queue.insert_one({
                "id": str(uuid.uuid4()), "user_id": u["id"], "type": "lost_alert",
                "lost_report_id": lost["id"], "status": "sent", "created_at": now_iso(),
                "distance_miles": round(d, 2),
            })
            sent += 1
    await db.lost_reports.update_one({"id": lost["id"]}, {"$set": {"alerts_sent": sent}})
    logger.info(f"Dispatched {sent} lost alerts for pet {pet['name']}")

# ---------------- Lost Reports ----------------
@api.post("/lost")
async def report_lost(data: LostReportCreate, user: dict = Depends(get_current_user)):
    pet = await db.pets.find_one({"id": data.pet_id})
    if not pet: raise HTTPException(404, "Pet not found")
    if pet["owner_id"] != user["id"] and user.get("role") not in ("admin", "vet", "rescue"):
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
    if lost["owner_id"] != user["id"] and user.get("role") != "admin":
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
                    tmpl_base(f"<h2>Possible found-pet match</h2><p>A pet matching {pet['name']}'s microchip ({data.microchip}) was reported found at {data.location} on {now_iso()[:10]}.</p><p>{data.notes}</p><p>Contact: {data.reporter_name} — {data.reporter_email}</p>")))
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
        asyncio.create_task(em.send([owner["email"]], f"New sighting reported for {pet['name']}",
            tmpl_base(f"""<h2>New sighting reported</h2>
<p><strong>Location:</strong> {data.location}</p>
<p><strong>Notes:</strong> {data.notes}</p>
<p><strong>From:</strong> {data.reporter_name} — {data.reporter_email}{' / ' + data.reporter_phone if data.reporter_phone else ''}</p>""")))
    return rec

@api.get("/sightings/{lost_report_id}")
async def list_sightings(lost_report_id: str, user: dict = Depends(get_current_user)):
    lost = await db.lost_reports.find_one({"id": lost_report_id})
    if not lost: raise HTTPException(404, "Not found")
    if lost["owner_id"] != user["id"] and user.get("role") not in ("admin",):
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
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(400, "Email already registered")
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
        "role": "vet", "subscription_tier": "free", "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    practice = {
        "id": str(uuid.uuid4()), "user_id": user["id"], "practice_name": data.practice_name,
        "license_number": data.license_number, "verified": False, "created_at": now_iso(),
    }
    await db.veterinary_practices.insert_one(practice)
    access = make_access_token(user["id"], user["email"], "vet")
    response.set_cookie("access_token", access, httponly=True, samesite="lax", max_age=43200, path="/")
    return {"ok": True, "practice_id": practice["id"]}

@api.post("/rescue/register")
async def rescue_register(data: RescueRegister, response: Response):
    if await db.users.find_one({"email": data.email.lower()}):
        raise HTTPException(400, "Email already registered")
    coords = await geocode_postcode(data.postcode, data.country or "UK")
    user = {
        "id": str(uuid.uuid4()), "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "first_name": data.contact_name.split(" ")[0],
        "last_name": " ".join(data.contact_name.split(" ")[1:]) or "",
        "phone": data.phone, "address": data.address, "postcode": data.postcode,
        "country": data.country, "lat": coords["lat"] if coords else None,
        "lon": coords["lon"] if coords else None,
        "role": "rescue", "subscription_tier": "free", "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    org = {"id": str(uuid.uuid4()), "user_id": user["id"], "organisation_name": data.organisation_name,
           "registration_number": data.registration_number, "verified": False, "created_at": now_iso()}
    await db.rescue_organisations.insert_one(org)
    access = make_access_token(user["id"], user["email"], "rescue")
    response.set_cookie("access_token", access, httponly=True, samesite="lax", max_age=43200, path="/")
    return {"ok": True, "rescue_id": org["id"]}

# ---------------- Support ----------------
@api.post("/support")
async def support(data: SupportTicket):
    rec = {**data.model_dump(), "id": str(uuid.uuid4()), "status": "open", "created_at": now_iso()}
    await db.support_tickets.insert_one(rec)
    rec.pop("_id", None)
    return rec

# ---------------- Subscriptions (Stripe) ----------------
@api.post("/subscriptions/checkout")
async def create_subscription(user: dict = Depends(get_current_user)):
    sk = os.environ.get("STRIPE_SECRET_KEY", "")
    price_id = os.environ.get("STRIPE_PRICE_ID_PREMIUM", "")
    if not sk or not price_id:
        # MOCKED — return simulated checkout
        rec = {"id": str(uuid.uuid4()), "user_id": user["id"], "tier": "premium",
               "status": "active", "mocked": True, "started_at": now_iso(),
               "amount": 2.99, "currency": "gbp"}
        await db.subscriptions.insert_one(rec)
        await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_tier": "premium"}})
        return {"mocked": True, "url": None, "message": "Stripe not configured — premium activated in MOCKED mode."}
    import stripe
    stripe.api_key = sk
    frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user["email"],
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{frontend}/dashboard?subscription=success",
        cancel_url=f"{frontend}/subscribe?canceled=true",
        metadata={"user_id": user["id"]},
    )
    return {"url": session.url, "id": session.id}

@api.post("/subscriptions/cancel")
async def cancel_subscription(user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_tier": "free"}})
    await db.subscriptions.update_many({"user_id": user["id"], "status": "active"},
                                        {"$set": {"status": "canceled", "canceled_at": now_iso()}})
    return {"ok": True}

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
               "status": "mocked", "mocked": True, "created_at": now_iso()}
        await db.donations.insert_one(rec)
        return {"mocked": True, "order_id": rec["id"]}
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
        await db.donations.update_one({"id": order_id}, {"$set": {"status": "captured_mocked"}})
        return {"ok": True, "mocked": True}
    token, base = tok
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{base}/v2/checkout/orders/{order_id}/capture",
                          headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        await db.donations.update_one({"id": order_id}, {"$set": {"status": "captured"}})
        return r.json()

# ---------------- Admin Endpoints ----------------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_role("admin"))):
    return {
        "users": await db.users.count_documents({}),
        "pets": await db.pets.count_documents({}),
        "lost": await db.lost_reports.count_documents({"status": "active"}),
        "found": await db.found_reports.count_documents({"status": "open"}),
        "sightings": await db.sighting_reports.count_documents({}),
        "vets": await db.veterinary_practices.count_documents({}),
        "rescues": await db.rescue_organisations.count_documents({}),
        "subscriptions_active": await db.subscriptions.count_documents({"status": "active"}),
        "support_tickets_open": await db.support_tickets.count_documents({"status": "open"}),
    }

@api.get("/admin/users")
async def admin_users(user: dict = Depends(require_role("admin"))):
    return await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/pets")
async def admin_pets(user: dict = Depends(require_role("admin"))):
    return await db.pets.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/vets")
async def admin_vets(user: dict = Depends(require_role("admin"))):
    return await db.veterinary_practices.find({}, {"_id": 0}).to_list(500)

@api.get("/admin/rescues")
async def admin_rescues(user: dict = Depends(require_role("admin"))):
    return await db.rescue_organisations.find({}, {"_id": 0}).to_list(500)

@api.get("/admin/support")
async def admin_support(user: dict = Depends(require_role("admin"))):
    return await db.support_tickets.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.post("/admin/verify/{kind}/{id}")
async def admin_verify(kind: str, id: str, user: dict = Depends(require_role("admin"))):
    col = {"vet": db.veterinary_practices, "rescue": db.rescue_organisations}.get(kind)
    if not col: raise HTTPException(400, "Invalid kind")
    await col.update_one({"id": id}, {"$set": {"verified": True, "verified_at": now_iso()}})
    await db.audit_logs.insert_one({"id": str(uuid.uuid4()), "actor": user["email"],
                                      "action": f"verify_{kind}", "target": id, "at": now_iso()})
    return {"ok": True}

@api.get("/admin/donations")
async def admin_donations(user: dict = Depends(require_role("admin"))):
    return await db.donations.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.get("/admin/subscriptions")
async def admin_subs(user: dict = Depends(require_role("admin"))):
    return await db.subscriptions.find({}, {"_id": 0}).sort("started_at", -1).to_list(500)

@api.get("/admin/email-log")
async def admin_email_log(user: dict = Depends(require_role("admin"))):
    return await db.email_log.find({}, {"_id": 0}).sort("sent_at", -1).to_list(200)

# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"name": "Global Pet Registry API", "status": "ok"}

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
    email = os.environ.get("ADMIN_EMAIL", "admin@globalpetregistry.com")
    pw = os.environ.get("ADMIN_PASSWORD", "Admin@2025!")
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "email": email, "password_hash": hash_password(pw),
            "first_name": "Platform", "last_name": "Admin", "role": "admin",
            "subscription_tier": "premium", "created_at": now_iso(),
            "phone": "", "address": "", "town": "", "county": "", "postcode": "",
            "country": "UK", "lat": None, "lon": None,
        })
        logger.info(f"Admin seeded: {email}")
    elif not verify_password(pw, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pw)}})

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.pets.create_index("owner_id")
    await db.pets.create_index("microchip")
    await db.lost_reports.create_index("status")
    await db.found_reports.create_index("status")
    await seed_admin()

@app.on_event("shutdown")
async def on_shutdown():
    client.close()
