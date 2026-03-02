from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
import uuid
from database import get_database
from auth import require_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["content"])

# ============ MODÈLES ============

class ServicePrice(BaseModel):
    name: str
    description: Optional[str] = None
    price: str  # "600$" ou "Sur devis"
    category: Optional[str] = None
    is_active: bool = True
    order: int = 0

class FormOption(BaseModel):
    id: Optional[str] = None
    label: str
    description: Optional[str] = None
    is_active: bool = True
    order: int = 0

class PageContent(BaseModel):
    page_id: str  # "home", "about", "devis", etc.
    section_id: str  # "hero", "services", "process", etc.
    content: dict  # Contenu flexible (titre, texte, image, etc.)

# ============ SERVICES / PRIX ============

@router.get("/content/services")
async def get_services():
    """Obtenir tous les services/prix"""
    try:
        db = get_database()
        services = await db.services.find({"is_active": True}).sort("order", 1).to_list(length=100)
        
        # Si pas de services en DB, retourner les services par défaut
        if not services:
            default_services = [
                {"id": "plan-archi", "name": "Plans architecturaux", "description": "Plans de construction détaillés", "price": "600$", "category": "plans", "is_active": True, "order": 1},
                {"id": "plan-elect", "name": "Plans électriques", "description": "Schémas électriques complets", "price": "400$", "category": "plans", "is_active": True, "order": 2},
                {"id": "plan-3d", "name": "Modélisation 3D", "description": "Visualisation 3D de votre projet", "price": "500$", "category": "visuel", "is_active": True, "order": 3},
                {"id": "croquis", "name": "Croquis préliminaires", "description": "Premiers dessins de concept", "price": "200$", "category": "croquis", "is_active": True, "order": 4},
                {"id": "accompagnement", "name": "Accompagnement projet", "description": "Conseils et suivi personnalisé", "price": "Sur devis", "category": "service", "is_active": True, "order": 5},
            ]
            return {"success": True, "data": default_services}
        
        return {"success": True, "data": services}
    except Exception as e:
        logger.error(f"❌ Erreur récupération services: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/content/services")
async def get_all_services_admin(current_user: dict = Depends(require_admin)):
    """Obtenir tous les services (admin) - incluant inactifs"""
    try:
        db = get_database()
        services = await db.services.find().sort("order", 1).to_list(length=100)
        return {"success": True, "data": services}
    except Exception as e:
        logger.error(f"❌ Erreur récupération services admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/content/services")
async def create_service(service: ServicePrice, current_user: dict = Depends(require_admin)):
    """Créer un nouveau service/prix"""
    try:
        db = get_database()
        
        service_data = {
            "id": str(uuid.uuid4()),
            "name": service.name,
            "description": service.description,
            "price": service.price,
            "category": service.category,
            "is_active": service.is_active,
            "order": service.order,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.services.insert_one(service_data)
        logger.info(f"✅ Service créé: {service.name}")
        
        return {"success": True, "data": service_data, "message": "Service créé"}
    except Exception as e:
        logger.error(f"❌ Erreur création service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/content/services/{service_id}")
async def update_service(service_id: str, service: ServicePrice, current_user: dict = Depends(require_admin)):
    """Modifier un service/prix"""
    try:
        db = get_database()
        
        update_data = {
            "name": service.name,
            "description": service.description,
            "price": service.price,
            "category": service.category,
            "is_active": service.is_active,
            "order": service.order,
            "updated_at": datetime.utcnow()
        }
        
        result = await db.services.update_one(
            {"id": service_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        logger.info(f"✅ Service modifié: {service.name}")
        return {"success": True, "message": "Service modifié"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur modification service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/content/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(require_admin)):
    """Supprimer un service/prix"""
    try:
        db = get_database()
        result = await db.services.delete_one({"id": service_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        logger.info(f"✅ Service supprimé: {service_id}")
        return {"success": True, "message": "Service supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ CONTENU DES PAGES ============

@router.get("/content/pages/{page_id}")
async def get_page_content(page_id: str):
    """Obtenir le contenu d'une page"""
    try:
        db = get_database()
        sections = await db.page_content.find({"page_id": page_id}).to_list(length=50)
        
        # Convertir en dictionnaire par section
        content = {}
        for section in sections:
            content[section["section_id"]] = section.get("content", {})
        
        return {"success": True, "page_id": page_id, "content": content}
    except Exception as e:
        logger.error(f"❌ Erreur récupération contenu page: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/content/pages/{page_id}/{section_id}")
async def update_page_section(
    page_id: str, 
    section_id: str, 
    content: dict,
    current_user: dict = Depends(require_admin)
):
    """Modifier une section d'une page"""
    try:
        db = get_database()
        
        await db.page_content.update_one(
            {"page_id": page_id, "section_id": section_id},
            {
                "$set": {
                    "content": content,
                    "updated_at": datetime.utcnow(),
                    "updated_by": current_user["name"]
                },
                "$setOnInsert": {
                    "page_id": page_id,
                    "section_id": section_id,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        logger.info(f"✅ Contenu modifié: {page_id}/{section_id}")
        return {"success": True, "message": "Contenu mis à jour"}
    except Exception as e:
        logger.error(f"❌ Erreur modification contenu: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ ÉTAPES DU PROCESSUS ============

@router.get("/content/process-steps")
async def get_process_steps():
    """Obtenir les étapes du processus"""
    try:
        db = get_database()
        steps = await db.process_steps.find({"is_active": True}).sort("order", 1).to_list(length=10)
        
        if not steps:
            # Retourner les étapes par défaut
            default_steps = [
                {"id": "1", "order": 1, "title": "Parlez-nous de votre idée", "description": "Envoyez-nous votre demande de devis avec vos besoins et vos idées.", "is_active": True},
                {"id": "2", "order": 2, "title": "Croquis & devis", "description": "Premier contact, premiers dessins et estimation détaillée. Soumission et dépôt.", "is_active": True},
                {"id": "3", "order": 3, "title": "Plans détaillés", "description": "Réalisation des plans complets et professionnels selon vos besoins.", "is_active": True},
                {"id": "4", "order": 4, "title": "Accompagnement & retours", "description": "Conseils et références si besoin. Partagez-nous vos commentaires ! ⭐", "is_active": True},
            ]
            return {"success": True, "data": default_steps}
        
        return {"success": True, "data": steps}
    except Exception as e:
        logger.error(f"❌ Erreur récupération étapes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/content/process-steps")
async def update_process_steps(steps: List[dict], current_user: dict = Depends(require_admin)):
    """Mettre à jour toutes les étapes du processus"""
    try:
        db = get_database()
        
        # Supprimer les anciennes étapes
        await db.process_steps.delete_many({})
        
        # Insérer les nouvelles
        for i, step in enumerate(steps):
            step_data = {
                "id": str(i + 1),
                "order": i + 1,
                "title": step.get("title", ""),
                "description": step.get("description", ""),
                "is_active": step.get("is_active", True),
                "updated_at": datetime.utcnow()
            }
            await db.process_steps.insert_one(step_data)
        
        logger.info(f"✅ Étapes mises à jour par {current_user['name']}")
        return {"success": True, "message": "Étapes mises à jour"}
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour étapes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ OPTIONS DU FORMULAIRE DE DEVIS ============

# Valeurs par défaut
DEFAULT_FORM_OPTIONS = {
    "plan_types": [
        {"id": "1", "label": "Plans techniques détaillés", "description": "Dimensions précises, détails construction, matériaux spécifiés", "is_active": True, "order": 1},
        {"id": "2", "label": "Représentation visuelle/esthétique", "description": "Images 3D, croquis, visualisation de votre maison de rêve", "is_active": True, "order": 2},
        {"id": "3", "label": "Les deux (technique + visuel)", "description": "Plans de construction ET visualisations", "is_active": True, "order": 3},
    ],
    "contact_methods": [
        {"id": "1", "label": "Appel téléphonique", "description": "Discussion directe pour répondre à vos questions", "is_active": True, "order": 1},
        {"id": "2", "label": "Par courriel écrit", "description": "Devis détaillé par écrit avec documents joints", "is_active": True, "order": 2},
        {"id": "3", "label": "Vidéoconférence", "description": "Présentation visuelle avec partage d'écran (Zoom, Teams, etc.)", "is_active": True, "order": 3},
        {"id": "4", "label": "À votre convenance", "description": "Nous vous contacterons selon vos disponibilités", "is_active": True, "order": 4},
    ],
    "architectural_styles": [
        {"id": "1", "label": "Moderne/Contemporain", "description": "", "is_active": True, "order": 1},
        {"id": "2", "label": "Traditionnel québécois", "description": "", "is_active": True, "order": 2},
        {"id": "3", "label": "Rustique/Chalet", "description": "", "is_active": True, "order": 3},
        {"id": "4", "label": "Minimaliste", "description": "", "is_active": True, "order": 4},
        {"id": "5", "label": "Industriel", "description": "", "is_active": True, "order": 5},
        {"id": "6", "label": "Scandinave", "description": "", "is_active": True, "order": 6},
        {"id": "7", "label": "Autre (à préciser)", "description": "", "is_active": True, "order": 7},
    ]
}

@router.get("/content/form-options")
async def get_form_options():
    """Obtenir les options du formulaire de devis"""
    try:
        db = get_database()
        
        result = {}
        for option_type in ["plan_types", "contact_methods", "architectural_styles"]:
            options = await db.form_options.find({
                "option_type": option_type, 
                "is_active": True
            }).sort("order", 1).to_list(length=50)
            
            if not options:
                result[option_type] = DEFAULT_FORM_OPTIONS[option_type]
            else:
                result[option_type] = options
        
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"❌ Erreur récupération options formulaire: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/content/form-options/{option_type}")
async def get_form_options_admin(option_type: str, current_user: dict = Depends(require_admin)):
    """Obtenir les options d'un type pour l'admin"""
    try:
        db = get_database()
        options = await db.form_options.find({"option_type": option_type}).sort("order", 1).to_list(length=50)
        
        if not options and option_type in DEFAULT_FORM_OPTIONS:
            return {"success": True, "data": DEFAULT_FORM_OPTIONS[option_type]}
        
        return {"success": True, "data": options}
    except Exception as e:
        logger.error(f"❌ Erreur récupération options admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/content/form-options/{option_type}")
async def update_form_options(
    option_type: str, 
    options: List[dict],
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour les options d'un type de formulaire"""
    try:
        db = get_database()
        
        # Supprimer les anciennes options de ce type
        await db.form_options.delete_many({"option_type": option_type})
        
        # Insérer les nouvelles
        for i, opt in enumerate(options):
            option_data = {
                "id": opt.get("id") or str(uuid.uuid4()),
                "option_type": option_type,
                "label": opt.get("label", ""),
                "description": opt.get("description", ""),
                "is_active": opt.get("is_active", True),
                "order": i + 1,
                "updated_at": datetime.utcnow()
            }
            await db.form_options.insert_one(option_data)
        
        logger.info(f"✅ Options {option_type} mises à jour par {current_user['name']}")
        return {"success": True, "message": f"Options {option_type} mises à jour"}
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour options: {e}")
        raise HTTPException(status_code=500, detail=str(e))
