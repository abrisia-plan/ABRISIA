from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from database import get_database
import os
import logging
import uuid
import json

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chatbot"])

# Google Gemini (forfait gratuit). Sans clé, l'assistant donne des réponses simples.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

SITE_URL = os.environ.get("APP_URL", "https://abrisia-plan.ca").rstrip("/")


def fallback_answer(message: str) -> str:
    """Réponse simple quand l'IA n'est pas disponible : on dirige vers la bonne page."""
    text = message.lower()
    if any(w in text for w in ("collection", "modèle", "modele", "kit", "acheter", "prêt")):
        return f"Nos modèles prêts à construire sont dans la Collection ABRISIA : {SITE_URL}/collection"
    if any(w in text for w in ("entrepreneur", "pro", "sous-traitance", "sous traitance")):
        return f"Pour les entrepreneurs, consultez notre Espace Pro : {SITE_URL}/espace-pro"
    if any(w in text for w in ("prix", "coût", "cout", "combien", "tarif", "devis", "soumission", "plan")):
        return f"Chaque projet est unique : demandez un devis gratuit et sans engagement, nous vous répondons sous 24 h : {SITE_URL}/devis"
    return ("Bonjour ! Je suis l'assistant d'Abrisia Plan. Pour un projet de plans (maison, chalet, mini-maison, "
            f"agrandissement, meuble sur mesure), demandez un devis gratuit : {SITE_URL}/devis, "
            f"ou écrivez-nous : {SITE_URL}/contact")


async def ask_gemini(history: list, message: str) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_API_KEY)
    contents = [
        types.Content(role="user" if m.get("role") == "user" else "model", parts=[types.Part(text=m.get("content", ""))])
        for m in history
    ]
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))
    response = await client.aio.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, max_output_tokens=400, temperature=0.4),
    )
    return (response.text or "").strip()

SYSTEM_PROMPT = """Tu es l'assistant virtuel d'Abrisia Plan. Tu dois être STRICT et PROFESSIONNEL.

QUI EST ABRISIA :
- Entreprise spécialisée dans la CONCEPTION et le DESSIN de plans architecturaux
- Située au Saguenay-Lac-Saint-Jean, Québec, Canada
- Plans conformes au Code du bâtiment du Québec et du Canada
- Capacité : jusqu'à 600 m² de plancher (6000 pi²)

CE QUE FAIT ABRISIA :
- Plans de maisons unifamiliales, mini-maisons, chalets
- Plans d'agrandissement et rénovation
- Plans de meubles sur mesure (ébénisterie)
- Dessins techniques de fabrication
- Accompagnement de permis de construction
- Collection ABRISIA : modèles pré-dessinés achetables en ligne
- Personnalisation de modèles existants

CE QUE ABRISIA NE FAIT PAS :
- PAS de construction
- PAS de fabrication de meubles
- PAS de supervision de chantiers
- PAS de fourniture de matériaux
- PAS d'ingénierie en structure

TARIF ENTREPRENEUR : 1,50$/pi² (Espace Pro)

RÈGLES STRICTES :
1. Réponds UNIQUEMENT en français québécois professionnel
2. Parle SEULEMENT des services et du mandat d'Abrisia
3. Si la question est hors sujet, dis poliment : "Je suis l'assistant Abrisia et je peux vous aider uniquement avec nos services de dessin de plans."
4. Ne donne JAMAIS de prix précis — invite à demander un devis ou visiter la Collection
5. Sois concis (2-3 phrases maximum)
6. Pour toute demande concrète, COLLECTE les informations du client : nom, courriel, téléphone, description du projet
7. Quand un client veut un devis, redirige vers la page Demander un devis
8. Quand un client veut un modèle prêt, redirige vers la Collection ABRISIA
9. Ne réponds JAMAIS à des questions personnelles, politiques, ou sans rapport avec l'architecture"""


class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/chat")
async def chat(data: ChatMessage):
    """Chat avec l'assistant IA - flux SSE (chaque morceau est encodé en JSON)"""
    session_id = data.session_id or str(uuid.uuid4())
    db = get_database()
    message = data.message.strip()[:2000]

    # Historique récent (avant ce message)
    history = await db.chat_messages.find(
        {"session_id": session_id}
    ).sort("created_at", -1).limit(8).to_list(length=8)
    history.reverse()

    await db.chat_messages.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": message,
        "created_at": datetime.now(timezone.utc),
    })

    async def event_generator():
        answer = ""
        if GEMINI_API_KEY:
            try:
                answer = await ask_gemini(history, message)
            except Exception as e:
                logger.error(f"Erreur chatbot (Gemini): {e}")
        if not answer:
            answer = fallback_answer(message)

        # Envoi par petits morceaux pour l'effet « en train d'écrire »
        for i in range(0, len(answer), 20):
            yield f"data: {json.dumps(answer[i:i + 20])}\n\n"
        yield "data: [DONE]\n\n"

        await db.chat_messages.insert_one({
            "session_id": session_id,
            "role": "assistant",
            "content": answer,
            "created_at": datetime.now(timezone.utc),
        })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Obtenir l'historique du chat"""
    db = get_database()
    messages = await db.chat_messages.find(
        {"session_id": session_id}
    ).sort("created_at", 1).limit(50).to_list(length=50)

    return {
        "success": True,
        "data": [
            {
                "role": msg["role"],
                "content": msg["content"],
                "created_at": msg["created_at"].isoformat(),
            }
            for msg in messages
        ],
    }
