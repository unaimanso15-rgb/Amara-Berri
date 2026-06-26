from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
CLUB_EMAIL = os.environ.get("CLUB_EMAIL", "")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("amaraberri")

app = FastAPI(title="Amara Berri K.E. API")
api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def serialize(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        user = serialize(user)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


async def send_club_email(submission: dict) -> bool:
    if not RESEND_API_KEY or not CLUB_EMAIL:
        logger.warning("Resend no configurado: se omite el envío de email (la solicitud se guardó en la base de datos).")
        return False
    type_label = "Inscripción" if submission.get("type") == "inscription" else "Información general"
    html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f4f6fb;padding:24px">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden">
          <tr><td style="background:#0C1527;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:bold">
            Amara Berri K.E. — Nueva solicitud
          </td></tr>
          <tr><td style="padding:24px 32px;color:#0C1527;font-size:15px;line-height:1.7">
            <p style="margin:0 0 16px"><strong>Tipo:</strong> {type_label}</p>
            <p style="margin:0 0 8px"><strong>Nombre:</strong> {submission.get('name','')}</p>
            <p style="margin:0 0 8px"><strong>Email:</strong> {submission.get('email','')}</p>
            <p style="margin:0 0 8px"><strong>Teléfono:</strong> {submission.get('phone','') or '-'}</p>
            <p style="margin:16px 0 8px"><strong>Mensaje:</strong></p>
            <p style="margin:0;padding:16px;background:#f4f6fb;border-radius:8px">{submission.get('message','')}</p>
          </td></tr>
          <tr><td style="background:#38BDF8;height:6px"></td></tr>
        </table>
      </td></tr>
    </table>
    """
    params = {
        "from": SENDER_EMAIL,
        "to": [CLUB_EMAIL],
        "reply_to": submission.get("email"),
        "subject": f"[{type_label}] Nueva solicitud de {submission.get('name','')}",
        "html": html,
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as e:
        logger.error(f"Error enviando email con Resend: {e}")
        return False


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TeamBase(BaseModel):
    name_es: str
    name_eu: str
    category: str
    description_es: str = ""
    description_eu: str = ""
    coach: str = ""
    schedule: str = ""
    image_url: str = ""
    order: int = 0


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    type: str = "info"  # "info" | "inscription"
    message: str


# ---------------------------------------------------------------------------
# Public routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Amara Berri K.E. API", "status": "ok"}


@api_router.get("/teams")
async def list_teams():
    teams = await db.teams.find().sort("order", 1).to_list(200)
    return [serialize(t) for t in teams]


@api_router.post("/contact")
async def create_contact(payload: ContactCreate):
    doc = payload.model_dump()
    doc["is_read"] = False
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.contact_submissions.insert_one(doc)
    doc["_id"] = result.inserted_id
    email_sent = await send_club_email(doc)
    return {"success": True, "email_sent": email_sent, "id": str(result.inserted_id)}


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    user = serialize(user)
    token = create_access_token(user["id"], user["email"])
    user.pop("password_hash", None)
    return {"token": token, "user": user}


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return current


# ---------------------------------------------------------------------------
# Admin routes (protected)
# ---------------------------------------------------------------------------
@api_router.post("/admin/teams")
async def create_team(payload: TeamBase, current=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.teams.insert_one(doc)
    created = await db.teams.find_one({"_id": result.inserted_id})
    return serialize(created)


@api_router.put("/admin/teams/{team_id}")
async def update_team(team_id: str, payload: TeamBase, current=Depends(get_current_user)):
    result = await db.teams.update_one({"_id": ObjectId(team_id)}, {"$set": payload.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    updated = await db.teams.find_one({"_id": ObjectId(team_id)})
    return serialize(updated)


@api_router.delete("/admin/teams/{team_id}")
async def delete_team(team_id: str, current=Depends(get_current_user)):
    result = await db.teams.delete_one({"_id": ObjectId(team_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return {"success": True}


@api_router.get("/admin/submissions")
async def list_submissions(current=Depends(get_current_user)):
    subs = await db.contact_submissions.find().sort("created_at", -1).to_list(500)
    return [serialize(s) for s in subs]


@api_router.put("/admin/submissions/{sub_id}/read")
async def mark_read(sub_id: str, current=Depends(get_current_user)):
    await db.contact_submissions.update_one({"_id": ObjectId(sub_id)}, {"$set": {"is_read": True}})
    return {"success": True}


@api_router.delete("/admin/submissions/{sub_id}")
async def delete_submission(sub_id: str, current=Depends(get_current_user)):
    result = await db.contact_submissions.delete_one({"_id": ObjectId(sub_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return {"success": True}


@api_router.get("/admin/stats")
async def stats(current=Depends(get_current_user)):
    teams = await db.teams.count_documents({})
    subs = await db.contact_submissions.count_documents({})
    unread = await db.contact_submissions.count_documents({"is_read": False})
    return {"teams": teams, "submissions": subs, "unread": unread}


# ---------------------------------------------------------------------------
# Seeding & startup
# ---------------------------------------------------------------------------
DEFAULT_TEAMS = [
    {"name_es": "Fútbol Escuela", "name_eu": "Futbol Eskola", "category": "Eskola", "description_es": "Primeros pasos en el fútbol para los más pequeños (5-7 años), centrados en el juego y la diversión.", "description_eu": "Txikienen lehen urratsak futbolean (5-7 urte), jolasari eta dibertsioari begira.", "coach": "Mikel Etxeberria", "schedule": "Ma. y Ju. 17:00-18:00", "image_url": "https://images.pexels.com/photos/7307392/pexels-photo-7307392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 1},
    {"name_es": "Benjamín", "name_eu": "Kimuak", "category": "Benjamín", "description_es": "Categoría benjamín (8-9 años). Fundamentos técnicos y trabajo en equipo.", "description_eu": "Kimuen maila (8-9 urte). Oinarri teknikoak eta talde lana.", "coach": "Ane Agirre", "schedule": "Lu. y Mi. 17:30-19:00", "image_url": "https://images.pexels.com/photos/26283685/pexels-photo-26283685.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 2},
    {"name_es": "Alevín", "name_eu": "Haurrak", "category": "Alevín", "description_es": "Categoría alevín (10-11 años). Desarrollo táctico y competición federada.", "description_eu": "Haurren maila (10-11 urte). Garapen taktikoa eta lehiaketa federatua.", "coach": "Jon Sánchez", "schedule": "Lu. y Mi. 18:00-19:30", "image_url": "https://images.pexels.com/photos/34970425/pexels-photo-34970425.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 3},
    {"name_es": "Infantil", "name_eu": "Infantilak", "category": "Infantil", "description_es": "Categoría infantil (12-13 años). Intensidad y compromiso en cada entrenamiento.", "description_eu": "Infantilen maila (12-13 urte). Intentsitatea eta konpromisoa entrenamendu bakoitzean.", "coach": "Maite Lizarralde", "schedule": "Ma. y Ju. 18:30-20:00", "image_url": "https://images.pexels.com/photos/10347869/pexels-photo-10347869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 4},
    {"name_es": "Cadete", "name_eu": "Kadeteak", "category": "Cadete", "description_es": "Categoría cadete (14-15 años). Competición y formación en valores.", "description_eu": "Kadete maila (14-15 urte). Lehiaketa eta balioetan oinarritutako prestakuntza.", "coach": "Iker Goikoetxea", "schedule": "Lu., Mi. y Vi. 19:00-20:30", "image_url": "https://images.pexels.com/photos/7307392/pexels-photo-7307392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 5},
    {"name_es": "Juvenil", "name_eu": "Gazteak", "category": "Juvenil", "description_es": "Categoría juvenil (16-18 años). El paso previo al fútbol senior.", "description_eu": "Gazte maila (16-18 urte). Senior futbolerako aurreko urratsa.", "coach": "Unai Mendizabal", "schedule": "Ma., Ju. y Vi. 20:00-21:30", "image_url": "https://images.pexels.com/photos/34970425/pexels-photo-34970425.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 6},
    {"name_es": "Senior", "name_eu": "Senior", "category": "Senior", "description_es": "Primer equipo del club. Representación de Amara Berri en la competición regional.", "description_eu": "Klubeko lehen taldea. Amara Berriren ordezkaritza eskualdeko lehiaketan.", "coach": "Gorka Arregi", "schedule": "Lu., Mi. y Vi. 20:30-22:00", "image_url": "https://images.pexels.com/photos/26283685/pexels-photo-26283685.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 7},
    {"name_es": "Femenino", "name_eu": "Emakumezkoak", "category": "Femenino", "description_es": "Equipo femenino del club, impulsando el fútbol femenino en Amara Berri.", "description_eu": "Klubeko emakumezkoen taldea, Amara Berrin emakumezkoen futbola bultzatuz.", "coach": "Nerea Otxoa", "schedule": "Ma. y Ju. 19:30-21:00", "image_url": "https://images.pexels.com/photos/10347869/pexels-photo-10347869.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "order": 8},
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Usuario admin creado.")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Contraseña de admin actualizada.")


async def seed_teams():
    if await db.teams.count_documents({}) == 0:
        for team in DEFAULT_TEAMS:
            team["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.teams.insert_many(DEFAULT_TEAMS)
        logger.info("Equipos por defecto creados.")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_teams()


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
