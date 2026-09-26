from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from database import get_database
from auth import require_admin
import httpx
import os
import logging
import time

logger = logging.getLogger(__name__)
router = APIRouter(tags=["zoho"])

# Zoho OAuth config
ZOHO_CLIENT_ID = os.environ.get("ZOHO_CLIENT_ID", "")
ZOHO_CLIENT_SECRET = os.environ.get("ZOHO_CLIENT_SECRET", "")
ZOHO_REFRESH_TOKEN = os.environ.get("ZOHO_REFRESH_TOKEN", "")
ZOHO_ACCOUNTS_URL = os.environ.get("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.com")
ZOHO_API_DOMAIN = os.environ.get("ZOHO_API_DOMAIN", "https://www.zohoapis.com")

_access_token = None
_token_expires_at = 0.0


async def get_zoho_token() -> str:
    global _access_token, _token_expires_at
    if _access_token and time.time() < _token_expires_at - 60:
        return _access_token

    if not all([ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN]):
        raise Exception("Zoho CRM non configuré (credentials manquantes)")

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            f"{ZOHO_ACCOUNTS_URL}/oauth/v2/token",
            data={
                "grant_type": "refresh_token",
                "client_id": ZOHO_CLIENT_ID,
                "client_secret": ZOHO_CLIENT_SECRET,
                "refresh_token": ZOHO_REFRESH_TOKEN,
            },
        )
        r.raise_for_status()
        body = r.json()
        _access_token = body["access_token"]
        _token_expires_at = time.time() + int(body.get("expires_in", 3600))
        return _access_token


async def create_zoho_lead(record: dict) -> dict:
    token = await get_zoho_token()
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            f"{ZOHO_API_DOMAIN}/crm/v7/Leads/upsert",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={
                "data": [record],
                "duplicate_check_fields": ["Email"],
            },
        )
        if r.status_code == 401:
            global _access_token
            _access_token = None
        r.raise_for_status()
        return r.json()


async def create_zoho_deal(record: dict) -> dict:
    token = await get_zoho_token()
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            f"{ZOHO_API_DOMAIN}/crm/v7/Deals",
            headers={"Authorization": f"Zoho-oauthtoken {token}"},
            json={"data": [record]},
        )
        r.raise_for_status()
        return r.json()


async def save_lead(kind: str, data: dict, zoho_record: dict):
    """Sauvegarde le lead en base + tente l'envoi Zoho"""
    db = get_database()
    lead_doc = {
        "kind": kind,
        "data": data,
        "zoho_record": zoho_record,
        "zoho_status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.crm_leads.insert_one(lead_doc)
    lead_id = result.inserted_id

    # Tenter l'envoi Zoho
    try:
        if kind == "purchase":
            response = await create_zoho_deal(zoho_record)
        else:
            response = await create_zoho_lead(zoho_record)
        await db.crm_leads.update_one(
            {"_id": lead_id},
            {"$set": {"zoho_status": "sent", "zoho_response": str(response)}},
        )
        return {"synced": True}
    except Exception as e:
        logger.warning(f"Zoho sync échoué pour {kind}: {e}")
        await db.crm_leads.update_one(
            {"_id": lead_id},
            {"$set": {"zoho_status": "failed", "zoho_error": str(e)}},
        )
        return {"synced": False, "reason": "Zoho non configuré ou indisponible"}


class LeadRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    model_name: Optional[str] = None
    amount: Optional[float] = None
    source: Optional[str] = "Site Web"


@router.post("/lead/customize")
async def create_customize_lead(data: LeadRequest):
    """Créer un lead quand un visiteur veut personnaliser un modèle"""
    zoho_record = {
        "First_Name": data.first_name,
        "Last_Name": data.last_name,
        "Email": data.email,
        "Phone": data.phone,
        "Company": "Visiteur site web",
        "Lead_Source": "Personnalisation modèle",
        "Description": f"Modèle: {data.model_name or 'Non spécifié'}\n{data.message or ''}",
    }
    result = await save_lead("customize", data.dict(), zoho_record)
    return {"success": True, "message": "Demande de personnalisation enregistrée", **result}


@router.post("/lead/devis")
async def create_devis_lead(data: LeadRequest):
    """Créer un lead quand un visiteur demande un devis"""
    zoho_record = {
        "First_Name": data.first_name,
        "Last_Name": data.last_name,
        "Email": data.email,
        "Phone": data.phone,
        "Company": "Visiteur site web",
        "Lead_Source": "Demande de devis",
        "Description": data.message or "",
    }
    result = await save_lead("devis", data.dict(), zoho_record)
    return {"success": True, "message": "Lead devis créé", **result}


@router.post("/lead/purchase")
async def create_purchase_lead(data: LeadRequest):
    """Créer un lead/affaire quand un visiteur achète un modèle"""
    zoho_record = {
        "Deal_Name": f"{data.model_name or 'Modèle'} - {data.first_name} {data.last_name}",
        "Stage": "Qualification",
        "Amount": data.amount or 0,
        "Description": f"Achat: {data.model_name}\nEmail: {data.email}\nTél: {data.phone or 'N/A'}",
    }
    result = await save_lead("purchase", data.dict(), zoho_record)
    return {"success": True, "message": "Affaire d'achat enregistrée", **result}


@router.get("/leads")
async def get_leads(admin=Depends(require_admin)):
    """Obtenir tous les leads (admin)"""
    db = get_database()
    leads = await db.crm_leads.find().sort("created_at", -1).to_list(length=200)
    return {
        "success": True,
        "data": [
            {
                "id": str(lead["_id"]),
                "kind": lead.get("kind"),
                "data": lead.get("data", {}),
                "zoho_status": lead.get("zoho_status", "pending"),
                "created_at": lead.get("created_at", "").isoformat() if lead.get("created_at") else "",
            }
            for lead in leads
        ],
    }
