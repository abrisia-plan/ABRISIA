"""Textes des courriels automatiques, modifiables dans l'admin (page « Courriels »).

Les textes sont gardés dans la collection `settings` (document `email_texts`) et
gardés en mémoire pour l'envoi des courriels. Un texte vide reprend sa valeur
par défaut. Deux mots entre accolades sont remplacés à l'envoi : {prenom} et
{moyen} (le moyen de communication choisi par le client).
"""
import html
import logging
from database import get_database

logger = logging.getLogger(__name__)

_TEXTE_COMPLET = ("Nous commençons dès maintenant vos plans techniques. Pour la suite, voici la liste des dimensions "
                  "standards des appareils que nous utilisons. Faites vos choix selon vos besoins : chaque appareil "
                  "existe en version mini, standard ou grand, et en différents types.")

# Textes de Noémie (résumé du 3 novembre 2026)
DEFAULTS = {
    "confirmation_rappel": "Nous communiquerons avec vous selon le moyen de communication que vous préférez. "
                           "Les messages de suivi de votre projet vous sont envoyés automatiquement par courriel.",
    "depot_objet": "Dépôt reçu – votre projet est lancé !",
    "depot_intro": "Bonjour {prenom}, merci pour votre confiance ! Nous avons bien reçu votre dépôt. Pour la suite, "
                   "nous restons en contact par {moyen}, et vous recevrez par courriel les messages de suivi de votre projet.",
    "depot_permis": "Nous commençons dès maintenant vos plans pour permis, et nous vous revenons très bientôt avec une première version.",
    "depot_complet": _TEXTE_COMPLET,
    "depot_sur_mesure": _TEXTE_COMPLET + "\n\nVous trouverez aussi votre fiche de choix. Nous vous accompagnerons dans le choix de vos appareils.",
}

# Libellés de la page « Courriels » de l'admin, dans l'ordre d'affichage
LABELS = {
    "confirmation_rappel": "Demande de devis : rappel de communication",
    "depot_objet": "Dépôt reçu : objet du courriel",
    "depot_intro": "Dépôt reçu : début commun",
    "depot_permis": "Dépôt reçu : Plan pour permis",
    "depot_complet": "Dépôt reçu : Plan complet",
    "depot_sur_mesure": "Dépôt reçu : Sur mesure",
}

MAX_LENGTH = 5000
_current = dict(DEFAULTS)


def get(key: str) -> str:
    return _current.get(key) or DEFAULTS[key]


def as_html(text: str, **values) -> str:
    """Texte -> paragraphes HTML ; une ligne vide sépare deux paragraphes.
    {prenom} et {moyen} sont remplacés par leurs valeurs (échappées)."""
    escaped = html.escape(text)
    for key, value in values.items():
        escaped = escaped.replace("{" + key + "}", html.escape(str(value or "")))
    paragraphs = [p.strip() for p in escaped.split("\n\n") if p.strip()]
    return "".join(f"<p>{p.replace(chr(10), '<br>')}</p>" for p in paragraphs)


def fill(text: str, **values) -> str:
    """Le même texte, en texte simple (objet du courriel)."""
    for key, value in values.items():
        text = text.replace("{" + key + "}", str(value or ""))
    return text


async def load():
    """Au démarrage : textes enregistrés dans l'admin, sinon ceux par défaut."""
    try:
        doc = await get_database().settings.find_one({"_id": "email_texts"}) or {}
        for key in DEFAULTS:
            if doc.get(key):
                _current[key] = doc[key]
    except Exception as e:
        logger.warning(f"Textes des courriels non chargés, valeurs par défaut utilisées : {e}")


async def save(values: dict) -> dict:
    """Enregistre les textes connus ; un texte vide revient à sa valeur par défaut."""
    clean = {key: str(values.get(key) or "").strip()[:MAX_LENGTH] for key in DEFAULTS if key in values}
    await get_database().settings.update_one({"_id": "email_texts"}, {"$set": clean}, upsert=True)
    for key, value in clean.items():
        _current[key] = value or DEFAULTS[key]
    return all_texts()


def all_texts() -> list:
    return [{"key": key, "label": LABELS[key], "value": get(key), "default": DEFAULTS[key]} for key in LABELS]
