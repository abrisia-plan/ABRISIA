"""Envoi de textos (SMS) par Twilio, seulement si le compte est configuré.

Variables d'environnement (sur Render) :
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (numéro Twilio, ex. +14185550123)
Sans elles, aucun texto n'est envoyé et le site fonctionne normalement.
"""
import os
import re
import logging

import requests

logger = logging.getLogger(__name__)


def sms_configured() -> bool:
    return all(os.getenv(k) for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM"))


def normalize_phone(phone: str) -> str:
    """418 555-0123 -> +14185550123 (numéros canadiens et américains)"""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        return "+1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return ""


def send_sms(phone: str, message: str) -> bool:
    if not sms_configured():
        return False
    to = normalize_phone(phone)
    if not to:
        logger.warning("Texto non envoyé : numéro invalide")
        return False
    sid = os.environ["TWILIO_ACCOUNT_SID"]
    try:
        resp = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            auth=(sid, os.environ["TWILIO_AUTH_TOKEN"]),
            data={"From": os.environ["TWILIO_FROM"], "To": to, "Body": message},
            timeout=30,
        )
        if resp.status_code >= 300:
            logger.error(f"Twilio a refusé le texto : {resp.status_code} {resp.text[:200]}")
            return False
        logger.info("✅ Texto envoyé")
        return True
    except Exception as e:
        logger.error(f"Erreur texto : {e}")
        return False
