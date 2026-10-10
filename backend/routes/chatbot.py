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
import re
from starlette.concurrency import run_in_threadpool

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


DEFAULT_STEPS = [
    {"title": "Parlez-nous de votre idée", "description": "Envoyez votre demande de devis avec vos besoins et vos idées."},
    {"title": "Croquis et devis", "description": "Premier contact, premiers dessins et estimation détaillée. Soumission et dépôt."},
    {"title": "Plans détaillés", "description": "Réalisation des plans complets et professionnels selon vos besoins."},
    {"title": "Accompagnement et retours", "description": "Conseils et références au besoin."},
]

FICHE_RE = re.compile(r"\[\[FICHE\]\]\s*(\{.*\})", re.S)


async def save_chat_contact(fiche: dict, session_id: str):
    """Coordonnées données au chatbot : base, courriel à Abrisia et fiche Zoho"""
    from email_service import email_service
    from routes.contact import _contact_to_zoho
    kind = (fiche.get("type") or "question").lower()
    labels = {"plainte": "Plainte", "question": "Question", "projet": "Projet", "rappel": "Demande de rappel"}
    doc = {
        "nom": (fiche.get("nom") or "Visiteur").strip()[:200],
        "email": (fiche.get("courriel") or "").strip()[:200],
        "telephone": (fiche.get("telephone") or "").strip()[:50],
        "sujet": f"Chatbot - {labels.get(kind, 'Message')}",
        "message": (fiche.get("message") or "").strip()[:3000],
        "type": kind,
        "source": "chatbot",
        "chat_session_id": session_id,
        "status": "Nouveau",
        "created_at": datetime.utcnow(),
    }
    await get_database().contacts.insert_one(doc)
    await run_in_threadpool(email_service.send_contact_notification, doc)
    if doc["email"]:
        await _contact_to_zoho(doc)


def extract_fiche(answer: str):
    """Sépare la réponse visible de la fiche cachée [[FICHE]] {...}"""
    match = FICHE_RE.search(answer)
    if not match:
        return answer, None
    visible = answer[:match.start()].rstrip()
    try:
        fiche = json.loads(match.group(1))
    except ValueError:
        logger.warning("Fiche du chatbot illisible")
        return visible, None
    if not fiche.get("nom") or not (fiche.get("courriel") or fiche.get("telephone")):
        return visible, None
    return visible, fiche


async def build_site_knowledge(db) -> str:
    """Infos à jour tirées de l'admin : services, prix « à partir de », Collection."""
    parts = []
    try:
        services = await db.homepage_services.find({"is_active": True}).sort("order", 1).to_list(length=30)
        if services:
            parts.append("SERVICES (page d'accueil) :\n" + "\n".join(
                f"- {s.get('name')} : {s.get('description', '')} {s.get('price', '')}".strip() for s in services))

        steps = await db.process_steps.find({"is_active": True}).sort("order", 1).to_list(length=10)
        if not steps:
            steps = DEFAULT_STEPS
        parts.append("COMMENT ÇA FONCTIONNE (étapes d'un mandat) :\n" + "\n".join(
            f"{i}. {st.get('title')} : {st.get('description', '')}" for i, st in enumerate(steps, 1)))

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
4. Pour un projet concret, propose le formulaire de devis (on peut y joindre photos et plans), ou propose de
   prendre ses coordonnées ici pour qu'Abrisia le rappelle.
5. Mets le lien de la bonne page quand c'est utile.
6. Tu peux expliquer comment fonctionne un mandat (voir les étapes plus bas), décrire les offres et répondre aux
   questions fréquentes sur les plans, les permis et la Collection.

PRISE DE COORDONNÉES, QUESTIONS ET PLAINTES :
- Si la personne veut être rappelée, laisser un message, poser une question à laquelle tu ne peux pas répondre,
  ou faire une plainte, recueille poliment, une question à la fois : son nom, son courriel ou son téléphone,
  et son message (pour une plainte : ce qui s'est passé, avec empathie, sans promettre de compensation).
- Demande la permission avant de prendre ses coordonnées, et précise qu'elles servent seulement à la recontacter.
- Quand tu as au minimum le nom, un moyen de contact (courriel ou téléphone) et le message, résume-les et
  demande de confirmer. Une fois confirmé, réponds que c'est transmis à l'équipe, qui fera un suivi rapidement,
  puis ajoute À LA FIN de ta réponse, sur une ligne seule, exactement :
  [[FICHE]] {"type": "plainte" ou "question" ou "projet" ou "rappel", "nom": "...", "courriel": "...", "telephone": "...", "message": "..."}
  (JSON valide, chaînes vides si inconnu). N'écris cette ligne qu'une seule fois par demande et jamais avant la confirmation."""



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

        answer, fiche = extract_fiche(answer)
        if fiche:
            try:
                await save_chat_contact(fiche, session_id)
            except Exception as e:
                logger.error(f"Fiche du chatbot non enregistrée: {e}")

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
