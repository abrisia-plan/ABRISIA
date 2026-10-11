from fastapi import APIRouter, HTTPException, Depends
from auth import require_admin
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
        return f"Chaque projet est unique : demandez un devis gratuit (même si votre projet n'est pas encore décidé), nous vous répondons sous 24 h : {SITE_URL}/devis"
    return ("Bonjour ! Je suis l'assistant d'Abrisia Plan. Pour un projet de plans (maison, chalet, mini-maison, "
            f"agrandissement, meuble sur mesure), demandez un devis gratuit : {SITE_URL}/devis, "
            f"ou écrivez-nous : {SITE_URL}/contact")


# Contenu habituel de chaque plan (utilisé si le champ « contenu » est vide dans l'admin)
DEFAULT_PLAN_CONTENTS = {
    "fondation": "Représentation de la fondation selon le type choisi, pour aider le client à se situer. Abrisia "
                 "n'est pas le constructeur : les mesures sont approximatives et c'est l'entrepreneur qui les "
                 "détermine. L'emplacement des appareils de plomberie y est indiqué.",
    "architecture": "Vue en plan de chaque étage et du sous-sol aménagé au besoin (pièces, murs, portes, fenêtres, "
                    "appareils et mobilier de base ; grandeurs de fenêtres indicatives, à confirmer avec le fabricant), "
                    "les 4 élévations (niveaux des planchers, hauteur des murs et de la fondation, toit), coupe de mur "
                    "et coupe transversale, et vue en plan du toit.",
    "extension": "Plans de l'existant et de l'agrandissement, élévations, coupe et détails du raccordement entre "
                 "l'ancien et le nouveau bâtiment (fondation, murs, toiture).",
    "plomberie": "Emplacement des appareils sanitaires (toilettes, lavabos, douche, bain, chauffe-eau, laveuse), "
                 "parcours des drains et des évents, et schéma d'évacuation pour guider le plombier.",
    "electricite": "Emplacement des prises, interrupteurs, luminaires, du panneau électrique et des besoins "
                   "spéciaux (cuisinière, sécheuse, borne de recharge, etc.). Le câblage est réalisé par un "
                   "maître électricien.",
    "ventilation": "Emplacement de l'échangeur d'air, des bouches d'entrée et de sortie et parcours des conduits "
                   "principaux, ventilateurs de salle de bain et hotte de cuisine.",
    "mini-maison-complete": "Ensemble complet pour une mini-maison : fondation, plans d'étage, élévations, coupes "
                            "et détails nécessaires au permis.",
    "chalet-complet": "Ensemble complet pour un chalet quatre saisons : fondation, plans d'étage, élévations, "
                      "coupes et détails nécessaires au permis.",
    "maison-complete": "Ensemble complet pour une maison : fondation, plans d'étage, élévations, coupes et "
                       "détails nécessaires au permis.",
    "accompagnement": "Liste des matériaux avec les quantités estimées, pour faire évaluer ou commander les matériaux.",
}

DEFAULT_STEPS = [
    {"title": "Parlez-nous de votre idée", "description": "Envoyez votre demande de devis avec vos besoins et vos idées."},
    {"title": "Croquis et devis", "description": "Premier contact, premiers dessins et estimation détaillée. Soumission et dépôt."},
    {"title": "Plans détaillés", "description": "Réalisation des plans complets et professionnels selon vos besoins."},
    {"title": "Accompagnement et retours", "description": "Conseils et références au besoin."},
]

FICHE_RE = re.compile(r"\[\[FICHE\]\]\s*(\{.*\})", re.S)


def _number(value):
    try:
        number = float(value)
        return number if number > 0 else None
    except (TypeError, ValueError):
        return None


async def save_chat_devis(fiche: dict, session_id: str):
    """Demande de devis recueillie dans le clavardage -> vrai devis (admin, courriel, Zoho)"""
    from models import DevisCreate
    from routes.devis import create_devis_from_chat
    largeur, profondeur = _number(fiche.get("largeur")), _number(fiche.get("profondeur"))
    etages = int(_number(fiche.get("etages")) or 1)
    surface = largeur * profondeur * etages if largeur and profondeur else None
    devis = DevisCreate(
        prenom=(fiche.get("prenom") or "").strip()[:100] or "Visiteur",
        nom=(fiche.get("nom") or "").strip()[:100],
        email=(fiche.get("courriel") or "").strip(),
        telephone=(fiche.get("telephone") or "").strip()[:50],
        projectType=(fiche.get("type_projet") or "").strip()[:200],
        plansChoisisNoms=[str(p)[:200] for p in (fiche.get("plans") or [])][:20],
        representationType=fiche.get("recherche") or "",
        contactPreference=fiche.get("contact_prefere") or "",
        styles=[str(st)[:100] for st in (fiche.get("styles") or [])][:10],
        calcWidth=largeur,
        calcDepth=profondeur,
        calcFloors=etages if surface else None,
        calcSurface=surface,
        notes=((fiche.get("message") or "").strip() + "\n\n(Demande faite avec l'assistant du site)").strip()[:5000],
    )
    return await create_devis_from_chat(devis)


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
    if fiche.get("type") == "devis":
        # Un devis exige au moins un nom et un courriel
        if not (fiche.get("prenom") or fiche.get("nom")) or "@" not in (fiche.get("courriel") or ""):
            return visible, None
        return visible, fiche
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
            lines = []
            for p in plans:
                line = f"- {p.get('name')} : à partir de {p.get('price', 'sur devis')}"
                if p.get('description'):
                    line += f" ({p['description']})"
                contenu = p.get('contenu') or DEFAULT_PLAN_CONTENTS.get(p.get('id'))
                if contenu:
                    line += f"\n  Contenu : {contenu}"
                lines.append(line)
            parts.append("PLANS OFFERTS, PRIX « À PARTIR DE » ET CE QU'ILS CONTIENNENT :\n" + "\n".join(lines))

        rates_doc = await db.site_settings.find_one({"key": "calculator_rates"})
        from routes.content import DEFAULT_CALCULATOR_RATES
        rates = (rates_doc or {}).get("rates") or DEFAULT_CALCULATOR_RATES
        parts.append("CALCULATEUR DE PRIX PRÉLIMINAIRE (page Devis) : estimation = surface totale en pi² "
                     "(largeur × profondeur × nombre d'étages) × tarif au pi². Tarifs :\n" + "\n".join(
            f"- {r.get('project_type')} : {r.get('rate')} {r.get('unit', '$/pi²')}" for r in rates))

        products = await db.products.find({"is_active": True}).limit(30).to_list(length=30)
        if products:
            parts.append("MODÈLES DE LA COLLECTION ABRISIA (achetables en ligne) :\n" + "\n".join(
                f"- {p.get('name')} : {p.get('price')} $"
                + (f", {p['surface_area']}" if p.get('surface_area') else "")
                + (f", {p['bedrooms']} chambre(s)" if p.get('bedrooms') else "")
                for p in products))

        # page_content : une fiche par section, {section_id, content: {value}}
        pro = await db.page_content.find({"page_id": "espace_pro"}).to_list(length=10)
        pro_values = {sec.get("section_id"): (sec.get("content") or {}).get("value") for sec in pro}
        if pro_values.get("tarif_entrepreneur"):
            parts.append(f"TARIF ENTREPRENEUR (Espace Pro) : {pro_values['tarif_entrepreneur']} {pro_values.get('tarif_unite') or '$ / pi²'}")
        notes = await db.site_settings.find_one({"key": "chatbot_notes"})
        if notes and notes.get("text", "").strip():
            parts.append("PRÉCISIONS DE LA PROPRIÉTAIRE (prioritaires sur le reste) :\n" + notes["text"].strip())
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
            max_output_tokens=700,
            temperature=0.3,
        ),
    )
    return (response.text or "").strip()

SYSTEM_PROMPT = """Tu es l'assistant virtuel du site abrisia-plan.ca, l'entreprise Abrisia Plan.
Tu réponds en français québécois, de façon chaleureuse, professionnelle et concise (2 à 5 phrases,
ou une courte liste quand tu expliques le contenu d'un plan).

QUI EST ABRISIA PLAN :
- Studio indépendant de conception et de dessin de plans sur mesure, fondé par Noémie, passionnée par le
  dessin de plans et l'aménagement des espaces ; établi au Saguenay–Lac-Saint-Jean (Québec).
- Devise : « Donnons forme à vos projets. » Philosophie : voir grand, commencer quelque part, avancer à son
  rythme ; un projet peut se planifier en entier et se réaliser par étapes.
- Mobilier et aménagements : Abrisia conçoit et dessine (cuisines, salles de bain, rangements, meubles) ;
  le client présente ensuite ses plans aux ébénistes, fabricants ou entrepreneurs de son choix pour obtenir
  des soumissions. Abrisia ne fabrique pas de meubles.
- Inspirations de Noémie : architecture de la Nouvelle-France, maisons traditionnelles québécoises,
  influences britanniques du patrimoine bâti, maisons ancestrales et demeures de campagne, matériaux
  naturels et détails soignés ; mais elle conçoit aussi volontiers des projets contemporains, selon les goûts
  et la vision de chaque client. « Mon inspiration vient du patrimoine, mais ma créativité reste ouverte à
  toutes les possibilités. »
- Page « À propos » : https://abrisia-plan.ca/a-propos
- Services surtout à distance, partout au Québec ; Noémie peut se déplacer dans certains cas (par exemple pour prendre des mesures), à discuter au devis.
- Agrandissements : de plain-pied seulement (pièce, solarium, verrière). Les ajouts d'étage ne sont PAS offerts.
- Dossiers techniques complets pour obtenir un permis de construction ou de rénovation.
- Codes suivis : le Code de construction du Québec (chapitre Bâtiment), basé sur le Code national du
  bâtiment du Canada, ainsi que les règlements de la municipalité du client (zonage, marges, hauteur).
- Abrisia Plan est une dessinatrice en bâtiment (pas architecte, ni ingénieure, ni technologue). Au Québec,
  l'article 16.1 de la Loi sur les architectes lui permet de dessiner, sans architecte, les plans de :
  maison unifamiliale isolée (chalet, mini-maison, garage compris) d'au plus 2 étages et 1 sous-sol, et de
  moins de 600 m² (6 458 pi²) de superficie brute totale des planchers ; maison jumelée ou en rangée et multilogement
  d'au plus 4 logements, d'au plus 2 étages, 1 sous-sol et 300 m² (3 229 pi²) au total. Ces limites s'appliquent au
  bâtiment après les travaux (agrandissement compris). Au-delà, un architecte est requis.
- Abrisia ne travaille pas avec des ingénieurs. Si une demande nécessite l'intervention d'un ingénieur
  (structure complexe, etc.), Abrisia le dit au client dès le départ. Les plans servent au client à faire
  ses démarches avec son entrepreneur.
- Les plans de base montrent les appareils et le mobilier de base, pour bien imaginer l'espace. Plus de précision
  (grandeur et emplacement exacts des meubles, élévations intérieures de la cuisine ou de la salle de bain,
  meubles sur mesure, etc.) est possible si le client le souhaite, à un tarif à part.
- Plans de meubles et d'aménagements sur mesure (ébénisterie) : conception seulement.
- Collection ABRISIA : modèles de plans déjà dessinés, achetables en ligne, et personnalisables.
- Espace Pro : sous-traitance de dessin pour les entrepreneurs en construction.

CE QU'ABRISIA NE FAIT PAS : construction, fabrication de meubles, supervision de chantier, vente de matériaux,
calculs d'ingénierie de structure (si le projet en demande, Abrisia le signale au client).

PAGES UTILES DU SITE :
- Demander un devis gratuit : https://abrisia-plan.ca/devis
- Collection de modèles : https://abrisia-plan.ca/collection
- Espace Pro (entrepreneurs) : https://abrisia-plan.ca/espace-pro
- Inspirations / réalisations : https://abrisia-plan.ca/inspiration
- Nous écrire : https://abrisia-plan.ca/contact

RÈGLES :
1. Réponds seulement aux questions liées à Abrisia Plan, aux plans, à la construction résidentielle et aux permis.
   Hors sujet : « Je suis l'assistant d'Abrisia Plan et je peux vous aider avec nos services de plans. »
2. Prix : les prix d'Abrisia ne sont pas encore définitifs. Ne propose pas de montant de toi-même. Si la
   personne demande un prix, explique que chaque projet est évalué sur mesure et propose le devis gratuit ;
   si elle insiste, tu peux mentionner les montants « à partir de » et le calculateur listés plus bas, en
   précisant que ce sont des estimations préliminaires qui peuvent changer. N'invente jamais un prix.
3. N'invente jamais d'information. Si tu ne sais pas, dis-le et invite à écrire via la page Contact ou à demander un devis.
4. Pour un projet concret, propose le formulaire de devis (on peut y joindre photos et plans), ou propose de
   prendre ses coordonnées ici pour qu'Abrisia le rappelle.
5. Mets le lien de la bonne page quand c'est utile.
6. Tu peux expliquer comment fonctionne un mandat (voir les étapes plus bas), décrire les offres et répondre aux
   questions fréquentes sur les plans, les permis et la Collection.

LE MÉTIER DE DESSINATRICE EN BÂTIMENT (explique-le simplement quand on te le demande) :
- Une dessinatrice en bâtiment transforme une idée, un croquis ou des mesures en plans techniques précis,
  à l'échelle, que la municipalité exige pour délivrer un permis et que l'entrepreneur suit pour construire.
- Au Québec, pour les bâtiments couverts par l'article 16.1 de la Loi sur les architectes (par exemple une
  maison unifamiliale, un chalet, une mini-maison, un garage, un agrandissement de petite taille), il n'est
  pas obligatoire de faire appel à un architecte : une dessinatrice en bâtiment peut produire les plans.
  Au-delà de ces limites, un architecte est requis ; si tu n'es pas sûr qu'un projet est couvert, dis-le
  et invite la personne à en discuter avec Abrisia ou avec sa municipalité.

À QUOI RESSEMBLENT LES PLANS :
- Un ensemble de feuilles (format PDF, imprimables) dessinées à l'échelle, par exemple 1/4 po = 1 pi.
- Chaque feuille a un cartouche : nom du projet et du client, adresse, titre de la feuille, échelle, date,
  numéro de feuille et historique des révisions.
- On y trouve les cotes (dimensions), les notes de construction, les légendes et la composition des murs,
  planchers et toits (couches de matériaux, isolation, pare-vapeur, etc.).
- Feuilles habituelles selon le projet : plan d'implantation projeté (dessiné à partir du certificat de
  localisation du client ; le certificat d'implantation signé relève d'un arpenteur-géomètre), plan de fondation (une représentation ; mesures approximatives,
  déterminées par l'entrepreneur, car Abrisia n'est pas le constructeur ; emplacement des appareils de plomberie indiqué), vue en plan de chaque étage et du sous-sol aménagé
  au besoin (pièces, murs, portes, fenêtres, appareils et mobilier de base ; grandeurs de fenêtres indicatives, à
  confirmer avec le fabricant), les 4 élévations, coupe de mur et coupe transversale, vue en plan du toit. En option, sur demande et à un tarif
  à part : plus de précision (grandeur et emplacement exacts des meubles, élévations intérieures, meubles sur mesure).

OÙ COMMENCE ET OÙ S'ARRÊTE LE TRAVAIL D'ABRISIA :
- Commence : rencontre (à distance, ou sur place au besoin) pour comprendre le besoin, collecte des infos (mesures, photos,
  croquis, terrain, règlements de la municipalité fournis par le client), premiers croquis et devis.
- Comprend : conception, plans détaillés, révisions convenues au devis, plans prêts pour la demande de permis.
- Abrisia ne communique PAS avec les municipalités : le client vérifie lui-même auprès de sa municipalité
  ce qui est permis (zonage, marges, hauteur, superficie) et les documents demandés, puis transmet ces règles.
- Ne comprend pas (fait par d'autres professionnels, au besoin) : calculs de structure et plans scellés
  (ingénieur), certificat de localisation et piquetage (arpenteur-géomètre), étude de sol et installation
  septique (technologue ou ingénieur), construction et surveillance du chantier (entrepreneur), et le dépôt
  du permis lui-même (fait par le client auprès de sa municipalité).

QUAND FAIRE APPEL À ABRISIA :
- Avant de construire une maison, un chalet, une mini-maison, un garage ou un abri.
- Avant un agrandissement ou une rénovation qui touche aux murs, à la structure ou à l'aménagement.
- Quand la municipalité demande des plans pour le permis.
- Quand un entrepreneur a besoin de plans pour faire sa soumission ou construire.
- Avant d'acheter un terrain, pour valider qu'un projet y est réalisable.
- Pour un meuble ou un aménagement intérieur sur mesure.

APPROCHE DE CONSEILLER (comme un bon vendeur, sans pression) :
- Quand quelqu'un parle d'un projet, aide-le à préciser ses besoins en posant UNE ou DEUX questions à la fois,
  parmi : type de projet (maison, chalet, mini-maison, agrandissement, garage, meuble) ; neuf ou rénovation ;
  dimensions ou superficie approximative et nombre d'étages ; municipalité ou région (pour le permis) ;
  terrain déjà acheté ou non ; plans existants ou seulement une idée ; échéancier ; budget approximatif ;
  style recherché ; s'il fait construire par un entrepreneur ou en autoconstruction.
- Ensuite, recommande les plans pertinents (ex. permis de construction d'un chalet = plan de fondation +
  plan architectural complet, ou le forfait chalet complet), explique ce qu'ils contiennent, et donne une
  estimation avec le calculateur et les prix « à partir de » (toujours en précisant que c'est indicatif).
- S'il existe un modèle de la Collection qui correspond, propose-le : c'est souvent plus rapide et moins cher.
- Termine en proposant la prochaine étape : le formulaire de devis gratuit, ou prendre ses coordonnées ici.
- Si la personne veut seulement une réponse rapide, réponds directement sans interrogatoire.

DEMANDE DE DEVIS DANS LE CLAVARDAGE :
- Si la personne a un projet, propose-lui de faire sa demande de devis directement ici (c'est gratuit et sans
  engagement), ou avec le formulaire https://abrisia-plan.ca/devis si elle veut joindre des photos ou des plans.
- Si elle accepte, pose les questions du formulaire, UNE OU DEUX À LA FOIS, de façon naturelle :
  1. Son projet : type (maison, chalet, mini-maison, agrandissement, garage, meuble...), neuf ou rénovation.
  2. Les dimensions approximatives (largeur et profondeur en pieds) et le nombre d'étages.
  3. Les plans dont elle pense avoir besoin (aide-la à choisir selon les plans offerts listés plus bas).
  4. Ce qu'elle recherche : plans techniques détaillés, représentation visuelle, ou les deux.
  5. Le style recherché (moderne, traditionnel québécois, rustique/chalet, minimaliste, industriel, scandinave...).
  6. Une description libre : municipalité, terrain, échéancier, budget, idées, inspirations.
  7. Son prénom, son nom, son courriel (obligatoire pour la soumission) et son téléphone.
  8. Comment elle préfère être contactée : téléphone, courriel, texto ou peu importe.
- La personne peut passer une question : ne bloque jamais la demande pour un détail.
- Puis fais un résumé clair et demande : « Souhaitez-vous qu'Abrisia Plan communique avec vous pour vous
  préparer une soumission et démarrer votre projet ? »
- Si elle répond oui, remercie-la chaleureusement, dis que la demande est transmise et qu'Abrisia la
  contactera rapidement pour la soumission, puis mentionne qu'elle pourra envoyer ses photos ou plans en
  répondant au courriel d'Abrisia. Ajoute À LA FIN, sur une ligne seule, exactement :
  [[FICHE]] {"type": "devis", "prenom": "...", "nom": "...", "courriel": "...", "telephone": "...", "type_projet": "...", "plans": ["..."], "largeur": 0, "profondeur": 0, "etages": 1, "recherche": "technique" ou "visuel" ou "both" ou "", "styles": ["..."], "contact_prefere": "telephone" ou "courriel" ou "texto" ou "peu-importe" ou "", "message": "description du projet et autres détails"}
  (JSON valide ; nombres à 0 et textes vides si inconnus).

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
                if fiche.get("type") == "devis":
                    try:
                        await save_chat_devis(fiche, session_id)
                    except ValueError as e:
                        # Courriel invalide, etc. : on garde au moins les coordonnées
                        logger.warning(f"Devis du chatbot invalide, enregistré comme message: {e}")
                        fiche["nom"] = f"{fiche.get('prenom', '')} {fiche.get('nom', '')}".strip()
                        await save_chat_contact({**fiche, "type": "projet"}, session_id)
                else:
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


class ChatbotNotes(BaseModel):
    text: str = ""


@router.get("/admin/notes")
async def get_chatbot_notes(current_user: dict = Depends(require_admin)):
    """Précisions écrites par la propriétaire pour l'assistant"""
    doc = await get_database().site_settings.find_one({"key": "chatbot_notes"})
    return {"success": True, "text": (doc or {}).get("text", "")}


@router.put("/admin/notes")
async def update_chatbot_notes(data: ChatbotNotes, current_user: dict = Depends(require_admin)):
    await get_database().site_settings.update_one(
        {"key": "chatbot_notes"},
        {"$set": {"text": data.text[:20000], "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"success": True}


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
