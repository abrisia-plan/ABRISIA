from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from database import get_database
import os
import logging
import uuid

logger = logging.getLogger(__name__)
router = APIRouter(tags=["chatbot"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

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
    """Chat avec l'assistant IA - streaming SSE"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="Clé LLM non configurée")

    session_id = data.session_id or str(uuid.uuid4())
    db = get_database()

    # Sauvegarder le message utilisateur
    await db.chat_messages.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": data.message,
        "created_at": datetime.now(timezone.utc),
    })

    # Charger l'historique récent (dernier 10 messages)
    history = await db.chat_messages.find(
        {"session_id": session_id}
    ).sort("created_at", -1).limit(10).to_list(length=10)
    history.reverse()

    async def event_generator():
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage

            chat_instance = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"abrisia-chat-{session_id}",
                system_message=SYSTEM_PROMPT,
            ).with_model("openai", "gpt-4o-mini")

            # Envoyer l'historique comme contexte
            context_messages = []
            for msg in history[:-1]:  # Tout sauf le dernier (qu'on envoie comme message)
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    context_messages.append(f"Utilisateur: {content}")
                else:
                    context_messages.append(f"Assistant: {content}")

            full_text = data.message
            if context_messages:
                context = "\n".join(context_messages[-6:])
                full_text = f"[Historique récent]\n{context}\n\n[Message actuel]\n{data.message}"

            user_msg = UserMessage(text=full_text)
            
            # Use send_message (non-streaming) and simulate streaming by sending chunks
            full_response = await chat_instance.send_message(user_msg)
            
            # Send response in chunks to simulate streaming
            chunk_size = 10
            for i in range(0, len(full_response), chunk_size):
                chunk = full_response[i:i+chunk_size]
                yield f"data: {chunk}\n\n"

            yield "data: [DONE]\n\n"

            # Sauvegarder la réponse
            await db.chat_messages.insert_one({
                "session_id": session_id,
                "role": "assistant",
                "content": full_response,
                "created_at": datetime.now(timezone.utc),
            })

        except Exception as e:
            logger.error(f"Erreur chatbot: {e}")
            yield f"data: Désolé, une erreur s'est produite. Veuillez réessayer.\n\n"
            yield "data: [DONE]\n\n"

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
