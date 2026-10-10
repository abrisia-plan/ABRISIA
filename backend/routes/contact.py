from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_database
from auth import require_admin
from email_service import email_service
from routes.zoho import save_lead, split_name
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["contact"])


class ContactRequest(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    sujet: Optional[str] = ""
    message: str


async def _contact_to_zoho(doc: dict):
    first_name, last_name = split_name(doc["nom"])
    await save_lead("chatbot" if doc.get("source") == "chatbot" else "contact", {
        "first_name": first_name, "last_name": last_name,
        "email": doc["email"], "phone": doc["telephone"], "message": doc["message"],
    }, {
        "First_Name": first_name,
        "Last_Name": last_name,
        "Email": doc["email"],
        "Phone": doc["telephone"],
        "Company": "Visiteur site web",
        "Lead_Source": doc.get("sujet") if doc.get("source") == "chatbot" else "Formulaire de contact",
        "Description": f"Sujet: {doc['sujet'] or 'Aucun'}\n{doc['message']}",
    })


@router.post("/contact")
async def submit_contact(data: ContactRequest, background_tasks: BackgroundTasks):
    """Formulaire de contact public : enregistré en base, courriel et Zoho"""
    doc = {
        "nom": data.nom,
        "email": data.email,
        "telephone": data.telephone or "",
        "sujet": data.sujet or "",
        "message": data.message,
        "status": "Nouveau",
        "created_at": datetime.utcnow(),
    }
    try:
        await get_database().contacts.insert_one(doc)
    except Exception as e:
        logger.error(f"❌ Erreur enregistrement contact: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du message")
    background_tasks.add_task(email_service.send_contact_notification, doc)
    background_tasks.add_task(_contact_to_zoho, doc)
    return {"success": True, "message": "Message envoyé. Nous vous répondrons dans les plus brefs délais."}


@router.get("/admin/contacts")
async def list_contacts(current_user: dict = Depends(require_admin)):
    contacts = await get_database().contacts.find().sort("created_at", -1).to_list(length=500)
    return {"success": True, "data": [
        {
            "id": str(c["_id"]), "nom": c.get("nom", ""), "email": c.get("email", ""),
            "telephone": c.get("telephone", ""), "sujet": c.get("sujet", ""),
            "message": c.get("message", ""), "status": c.get("status", "Nouveau"),
            "created_at": c["created_at"].isoformat() if c.get("created_at") else "",
        } for c in contacts
    ]}


@router.delete("/admin/contacts/{contact_id}")
async def delete_contact(contact_id: str, current_user: dict = Depends(require_admin)):
    if not ObjectId.is_valid(contact_id):
        raise HTTPException(status_code=400, detail="ID invalide")
    await get_database().contacts.delete_one({"_id": ObjectId(contact_id)})
    return {"success": True}
