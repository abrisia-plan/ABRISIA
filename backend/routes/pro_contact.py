from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from database import get_database
from email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["pro-contact"])


class ProContactRequest(BaseModel):
    company: str
    contact_name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: Optional[str] = ""


@router.post("/pro-contact")
async def submit_pro_contact(data: ProContactRequest):
    """Soumettre une demande entrepreneur (Espace Pro) — sauvegarde en DB + email"""
    try:
        db = get_database()

        contact_doc = {
            "company": data.company,
            "contact_name": data.contact_name,
            "email": data.email,
            "phone": data.phone or "",
            "message": data.message or "",
            "source": "Espace Pro",
            "status": "Nouveau",
            "created_at": datetime.utcnow(),
        }
        await db.pro_contacts.insert_one(contact_doc)

        # Envoyer l'email de notification
        try:
            email_service.send_pro_contact_notification(contact_doc)
            logger.info(f"Email entrepreneur envoyé pour {data.company} ({data.email})")
        except Exception as e:
            logger.error(f"Erreur email entrepreneur: {e}")

        # Sauvegarder aussi comme lead Zoho (fallback local)
        try:
            from routes.zoho import save_lead
            first_name = data.contact_name.split(" ", 1)[0]
            last_name = data.contact_name.split(" ", 1)[1] if " " in data.contact_name else first_name
            zoho_record = {
                "First_Name": first_name,
                "Last_Name": last_name,
                "Email": data.email,
                "Phone": data.phone,
                "Company": data.company,
                "Lead_Source": "Espace Pro",
                "Description": f"Entreprise: {data.company}\n{data.message or ''}",
            }
            await save_lead("pro_contact", {
                "first_name": first_name,
                "last_name": last_name,
                "email": data.email,
                "phone": data.phone,
                "message": f"[ESPACE PRO] Entreprise: {data.company}\n{data.message}",
                "source": "Espace Pro",
            }, zoho_record)
        except Exception as e:
            logger.warning(f"Zoho lead pro non créé: {e}")

        return {"success": True, "message": "Demande envoyée avec succès. Nous vous contacterons dans les 24h."}
    except Exception as e:
        logger.error(f"Erreur soumission pro-contact: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de la demande")
