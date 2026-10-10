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
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

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


async def build_site_knowledge(db) -> str:
    """Infos à jour tirées de l'admin : services, prix « à partir de », Collection."""
    parts = []
    try:
        services = await db.homepage_services.find({"is_active": True}).sort("order", 1).to_list(length=30)
        if services:
            parts.append("SERVICES (page d'accueil) :\n" + "\n".join(
                f"- {s.get('name')} : {s.get('description', '')} {s.get('price', '')}".strip() for s in services))

        plans = await db.plan_options.find({"is_active": True}).sort("order", 1).to_list(length=50)
        if plans:
            parts.append("PLANS ET PRIX « À PARTIR DE » (formulaire de devis) :\n" + "\n".join(
                f"- {p.get('name')} : {p.get('price', 'sur devis')}" + (f" ({p['description']})" if p.get('description') else "")
                for p in plans))

        rates_doc = await db.site_settings.find_one({"key": "calculator_rates"})
        if rates_doc and rates_doc.get("rates"):
            parts.append("TARIFS DU CALCULATEUR DE PRIX PRÉLIMINAIRE :\n" + "\n".join(
                f"- {r.get('project_type')} : {r.get('rate')} {r.get('unit', '$/pi²')}" for r in rates_doc["rates"]))

        products = await db.products.find({"is_active": True}).limit(30).to_list(length=30)
        if products:
            parts.append("MODÈLES DE LA COLLECTION ABRISIA (achetables en ligne) :\n" + "\n".join(
                f"- {p.get('name')} : {p.get('price')} $"
                + (f", {p['surface_area']}" if p.get('surface_area') else "")
                + (f", {p['bedrooms']} chambre(s)" if p.get('bedrooms') else "")
                for p in products))

        pro = await db.page_content.find({"page_id": "espace_pro"}).to_list(length=10)
        for section in pro:
            content = section.get("content") or {}
            if content.get("tarif_entrepreneur"):
                parts.append(f"TARIF ENTREPRENEUR (Espace Pro) : {content['tarif_entrepreneur']} {content.get('tarif_unite', '$ / pi²')}")
    except Exception as e:
        logger.warning(f"Infos du site non chargées pour le chatbot: {e}")
    return "\n\n".join(parts)


async def ask_gemini(history: list, message: str, knowledge: str = "") -> str:
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
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + ("\n\nINFORMATIONS À JOUR DU SITE :\n" + knowledge if knowledge else ""),
            max_output_tokens=500,
            temperature=0.3,
        ),
    )
    return (response.text or "").strip()

SYSTEM_PROMPT = """Tu es l'assistant virtuel du site abrisia-plan.ca, l'entreprise Abrisia Plan.
Tu réponds en français québécois, de façon chaleureuse, professionnelle et concise (2 à 4 phrases).

QUI EST ABRISIA PLAN :
- Entreprise de dessin en bâtiment et de conception de plans, établie au Saguenay–Lac-Saint-Jean (Québec).
- Services offerts 100 % à distance, partout au Québec (et ailleurs).
- Dossiers techniques complets, conformes au Code de construction du Québec et du Canada, pour obtenir
  un permis de construction ou de rénovation.
- Au Québec, Abrisia Plan conçoit et signe de façon autonome les plans permis par l'article 16.1 de la
  Loi sur les architectes (habitations unifamiliales, chalets, mini-maisons, agrandissements, garages, etc.),
  jusqu'à environ 600 m² (6 000 pi²) de plancher.
- Pour les éléments de structure complexes, Abrisia collabore avec des ingénieurs en structure et intègre
  leurs plans scellés au dossier.
- Les plans intérieurs positionnent appareils sanitaires, drains, panneau électrique, prises et ventilation.
- Plans de meubles et d'aménagements sur mesure (ébénisterie) : conception seulement.
- Collection ABRISIA : modèles de plans déjà dessinés, achetables en ligne, et personnalisables.
- Espace Pro : sous-traitance de dessin pour les entrepreneurs en construction.

CE QU'ABRISIA NE FAIT PAS : construction, fabrication de meubles, supervision de chantier, vente de matériaux,
calculs d'ingénierie de structure (faits par un ingénieur partenaire au besoin).

PAGES UTILES DU SITE :
- Demander un devis gratuit : https://abrisia-plan.ca/devis
- Collection de modèles : https://abrisia-plan.ca/collection
- Espace Pro (entrepreneurs) : https://abrisia-plan.ca/espace-pro
- Inspirations / réalisations : https://abrisia-plan.ca/inspiration
- Nous écrire : https://abrisia-plan.ca/contact

RÈGLES :
1. Réponds seulement aux questions liées à Abrisia Plan, aux plans, à la construction résidentielle et aux permis.
   Hors sujet : « Je suis l'assistant d'Abrisia Plan et je peux vous aider avec nos services de plans. »
2. Prix : tu peux donner les prix « à partir de » et le tarif du calculateur listés plus bas (ce sont ceux
   affichés sur le site), en précisant toujours que c'est une estimation et que le prix final est confirmé
   dans un devis gratuit et personnalisé. N'invente jamais un prix qui n'est pas dans la liste.
3. N'invente jamais d'information. Si tu ne sais pas, dis-le et invite à écrire via la page Contact ou à demander un devis.
4. Pour un projet concret, invite la personne à remplir le formulaire de devis (elle peut y joindre photos et plans).
   Ne demande pas de renseignements personnels dans le clavardage.
5. Mets le lien de la bonne page quand c'est utile."""



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
                answer = await ask_gemini(history, message, await build_site_knowledge(db))
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
