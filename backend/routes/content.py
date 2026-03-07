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


# ============ CATÉGORIES D'INSPIRATION ============

DEFAULT_CATEGORIES = [
    {"id": "1", "name": "Maison unifamiliale", "description": "Inspirations pour résidences familiales complètes", "icon": "🏠", "is_visible": True, "order": 1},
    {"id": "2", "name": "Chalet", "description": "Inspirations pour chalets et maisons de campagne", "icon": "🏔️", "is_visible": True, "order": 2},
    {"id": "3", "name": "Mini-maison", "description": "Inspirations pour petits espaces optimisés", "icon": "🏡", "is_visible": True, "order": 3},
    {"id": "4", "name": "Extensions verrières solarium", "description": "Inspirations d'agrandissements lumineux", "icon": "🪟", "is_visible": True, "order": 4},
    {"id": "5", "name": "Autres dessins (ébénisterie)", "description": "Inspirations pour projets d'ébénisterie", "icon": "🪑", "is_visible": False, "order": 5},
    {"id": "6", "name": "Dessins techniques", "description": "Inspirations pour dessins techniques détaillés", "icon": "📐", "is_visible": False, "order": 6},
    {"id": "7", "name": "Dessins architecturaux", "description": "Inspirations architecturales", "icon": "🏛️", "is_visible": False, "order": 7},
]

@router.get("/content/categories")
async def get_visible_categories():
    """Obtenir les catégories visibles pour le site"""
    try:
        db = get_database()
        categories = await db.inspiration_categories.find({"is_visible": True}).sort("order", 1).to_list(length=50)
        
        if not categories:
            # Retourner seulement les catégories visibles par défaut
            return {"success": True, "data": [c for c in DEFAULT_CATEGORIES if c["is_visible"]]}
        
        return {"success": True, "data": categories}
    except Exception as e:
        logger.error(f"❌ Erreur récupération catégories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/content/categories")
async def get_all_categories_admin(current_user: dict = Depends(require_admin)):
    """Obtenir toutes les catégories pour l'admin"""
    try:
        db = get_database()
        categories = await db.inspiration_categories.find().sort("order", 1).to_list(length=50)
        
        if not categories:
            return {"success": True, "data": DEFAULT_CATEGORIES}
        
        return {"success": True, "data": categories}
    except Exception as e:
        logger.error(f"❌ Erreur récupération catégories admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/content/categories")
async def update_categories(categories: List[dict], current_user: dict = Depends(require_admin)):
    """Mettre à jour les catégories d'inspiration"""
    try:
        db = get_database()
        
        # Supprimer les anciennes
        await db.inspiration_categories.delete_many({})
        
        # Insérer les nouvelles
        for i, cat in enumerate(categories):
            cat_data = {
                "id": cat.get("id") or str(uuid.uuid4()),
                "name": cat.get("name", ""),
                "description": cat.get("description", ""),
                "icon": cat.get("icon", "📁"),
                "is_visible": cat.get("is_visible", True),
                "order": i + 1,
                "updated_at": datetime.utcnow()
            }
            await db.inspiration_categories.insert_one(cat_data)
        
        logger.info(f"✅ Catégories mises à jour par {current_user['name']}")
        return {"success": True, "message": "Catégories mises à jour"}
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour catégories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ TÉMOIGNAGES ============

DEFAULT_TESTIMONIALS = [
    {
        "id": "1",
        "client_name": "Marie Tremblay",
        "client_location": "Saguenay, QC",
        "project_type": "Mini-maison",
        "rating": 5,
        "comment": "Service exceptionnel ! Les plans étaient exactement ce que nous voulions. Très professionnel et à l'écoute.",
        "is_visible": True
    },
    {
        "id": "2", 
        "client_name": "Jean-Pierre Gagnon",
        "client_location": "Chicoutimi, QC",
        "project_type": "Chalet",
        "rating": 5,
        "comment": "Travail impeccable, les délais ont été respectés et le résultat est magnifique !",
        "is_visible": True
    },
    {
        "id": "3",
        "client_name": "Sophie Lavoie",
        "client_location": "Alma, QC", 
        "project_type": "Extension",
        "rating": 4,
        "comment": "Très satisfaite des plans pour notre solarium. Communication claire tout au long du projet.",
        "is_visible": True
    }
]

@router.get("/content/testimonials")
async def get_visible_testimonials():
    """Obtenir les témoignages visibles pour le site"""
    try:
        db = get_database()
        testimonials = await db.testimonials.find({"is_visible": True}).to_list(length=20)
        
        if not testimonials:
            return {"success": True, "data": DEFAULT_TESTIMONIALS}
        
        return {"success": True, "data": testimonials}
    except Exception as e:
        logger.error(f"❌ Erreur récupération témoignages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/testimonials")
async def get_all_testimonials_admin(current_user: dict = Depends(require_admin)):
    """Obtenir tous les témoignages pour l'admin"""
    try:
        db = get_database()
        testimonials = await db.testimonials.find().to_list(length=100)
        
        if not testimonials:
            return {"success": True, "data": DEFAULT_TESTIMONIALS}
        
        return {"success": True, "data": testimonials}
    except Exception as e:
        logger.error(f"❌ Erreur récupération témoignages admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/testimonials")
async def create_testimonial(testimonial: dict, current_user: dict = Depends(require_admin)):
    """Créer un nouveau témoignage"""
    try:
        db = get_database()
        
        testimonial_data = {
            "id": str(uuid.uuid4()),
            "client_name": testimonial.get("client_name", ""),
            "client_location": testimonial.get("client_location", ""),
            "project_type": testimonial.get("project_type", ""),
            "rating": testimonial.get("rating", 5),
            "comment": testimonial.get("comment", ""),
            "is_visible": testimonial.get("is_visible", True),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.testimonials.insert_one(testimonial_data)
        logger.info(f"✅ Témoignage créé par {current_user['name']}")
        
        return {"success": True, "data": testimonial_data, "message": "Témoignage créé"}
    except Exception as e:
        logger.error(f"❌ Erreur création témoignage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/testimonials/{testimonial_id}")
async def update_testimonial(testimonial_id: str, testimonial: dict, current_user: dict = Depends(require_admin)):
    """Modifier un témoignage"""
    try:
        db = get_database()
        
        update_data = {
            "client_name": testimonial.get("client_name"),
            "client_location": testimonial.get("client_location"),
            "project_type": testimonial.get("project_type"),
            "rating": testimonial.get("rating"),
            "comment": testimonial.get("comment"),
            "is_visible": testimonial.get("is_visible"),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            # Essayer de mettre à jour un témoignage par défaut
            update_data["id"] = testimonial_id
            update_data["created_at"] = datetime.utcnow()
            await db.testimonials.insert_one(update_data)
        
        logger.info(f"✅ Témoignage modifié: {testimonial_id}")
        return {"success": True, "message": "Témoignage modifié"}
    except Exception as e:
        logger.error(f"❌ Erreur modification témoignage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/admin/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str, current_user: dict = Depends(require_admin)):
    """Supprimer un témoignage"""
    try:
        db = get_database()
        await db.testimonials.delete_one({"id": testimonial_id})
        
        logger.info(f"✅ Témoignage supprimé: {testimonial_id}")
        return {"success": True, "message": "Témoignage supprimé"}
    except Exception as e:
        logger.error(f"❌ Erreur suppression témoignage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ PAGES LÉGALES ============

DEFAULT_LEGAL_PAGES = {
    "mentions-legales": {
        "title": "Mentions légales",
        "content": """
# Mentions légales

## Éditeur du site
**Abrisia Plan**
Service de dessin de plans architecturaux
Saguenay, Québec, Canada

## Contact
Pour toute question, veuillez nous contacter via le formulaire de contact du site.

## Hébergement
Ce site est hébergé par Emergent.

## Propriété intellectuelle
L'ensemble du contenu de ce site (textes, images, vidéos, logos) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.

## Responsabilité
Les informations fournies sur ce site le sont à titre indicatif. Abrisia Plan ne saurait être tenu responsable des erreurs ou omissions.
"""
    },
    "politique-confidentialite": {
        "title": "Politique de confidentialité",
        "content": """
# Politique de confidentialité

## Collecte des données
Nous collectons les informations que vous nous fournissez volontairement via nos formulaires :
- Nom et prénom
- Adresse email
- Numéro de téléphone
- Informations sur votre projet

## Utilisation des données
Vos données sont utilisées uniquement pour :
- Répondre à vos demandes de devis
- Vous contacter concernant votre projet
- Améliorer nos services

## Protection des données
Nous ne vendons ni ne partageons vos informations personnelles avec des tiers, sauf si requis par la loi.

## Cookies
Ce site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez les désactiver dans les paramètres de votre navigateur.

## Vos droits
Vous avez le droit d'accéder, de rectifier ou de supprimer vos données personnelles. Contactez-nous pour exercer ces droits.

## Contact
Pour toute question concernant cette politique, contactez-nous via notre formulaire.
"""
    }
}

@router.get("/content/legal/{page_id}")
async def get_legal_page(page_id: str):
    """Obtenir le contenu d'une page légale"""
    try:
        db = get_database()
        page = await db.legal_pages.find_one({"page_id": page_id})
        
        if not page and page_id in DEFAULT_LEGAL_PAGES:
            return {"success": True, "data": DEFAULT_LEGAL_PAGES[page_id]}
        
        if not page:
            raise HTTPException(status_code=404, detail="Page non trouvée")
        
        return {"success": True, "data": {"title": page["title"], "content": page["content"]}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération page légale: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/legal-pages")
async def get_all_legal_pages_admin(current_user: dict = Depends(require_admin)):
    """Obtenir toutes les pages légales pour l'admin"""
    try:
        db = get_database()
        pages = await db.legal_pages.find().to_list(length=10)
        
        # Fusionner avec les défauts
        result = {}
        for page_id, default_content in DEFAULT_LEGAL_PAGES.items():
            db_page = next((p for p in pages if p.get("page_id") == page_id), None)
            if db_page:
                result[page_id] = {"title": db_page["title"], "content": db_page["content"]}
            else:
                result[page_id] = default_content
        
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"❌ Erreur récupération pages légales admin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/legal-pages/{page_id}")
async def update_legal_page(page_id: str, content: dict, current_user: dict = Depends(require_admin)):
    """Mettre à jour une page légale"""
    try:
        db = get_database()
        
        await db.legal_pages.update_one(
            {"page_id": page_id},
            {
                "$set": {
                    "title": content.get("title", ""),
                    "content": content.get("content", ""),
                    "updated_at": datetime.utcnow(),
                    "updated_by": current_user["name"]
                },
                "$setOnInsert": {
                    "page_id": page_id,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        logger.info(f"✅ Page légale {page_id} mise à jour par {current_user['name']}")
        return {"success": True, "message": "Page mise à jour"}
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour page légale: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ============ PLAN OPTIONS (Prix du Devis) ============

DEFAULT_PLAN_OPTIONS = [
    {"id": "fondation", "name": "Plan de fondation", "price": "300$", "description": "", "category": "plans", "is_active": True, "order": 0},
    {"id": "architecture", "name": "Plan architectural complet", "price": "800$", "description": "", "category": "plans", "is_active": True, "order": 1},
    {"id": "extension", "name": "Plan d'extension/verrière", "price": "600$", "description": "", "category": "plans", "is_active": True, "order": 2},
    {"id": "plomberie", "name": "Plan de plomberie (inclut évacuation)", "price": "400$", "description": "", "category": "plans", "is_active": True, "order": 3},
    {"id": "electricite", "name": "Plan électrique", "price": "450$", "description": "", "category": "plans", "is_active": True, "order": 4},
    {"id": "ventilation", "name": "Plan de ventilation", "price": "350$", "description": "", "category": "plans", "is_active": True, "order": 5},
    {"id": "mini-maison-complete", "name": "Mini-maison complète (plans + détails)", "price": "800$", "description": "Plans architecturaux et techniques pour mini-maison", "category": "projets", "is_active": True, "order": 6},
    {"id": "chalet-complet", "name": "Chalet complet (plans + détails)", "price": "1200$", "description": "Plans architecturaux et techniques pour chalet quatre saisons", "category": "projets", "is_active": True, "order": 7},
    {"id": "maison-complete", "name": "Maison résidentielle complète", "price": "1500$", "description": "Plans architecturaux et techniques pour maison familiale", "category": "projets", "is_active": True, "order": 8},
    {"id": "abri-garage", "name": "Abris/garage/gazebo/galerie/coin cuisine extérieur", "price": "400$", "description": "Plans pour structures extérieures et espaces de vie outdoor", "category": "projets", "is_active": True, "order": 9},
    {"id": "accompagnement", "name": "Calculs de matériaux", "price": "Sur devis", "description": "Liste de matériaux et estimation des quantités pour votre projet", "category": "services", "is_active": True, "order": 10},
    {"id": "ebenisterie", "name": "Ébénisterie sur mesure", "price": "Sur devis", "description": "Conception et plans pour meubles et aménagements personnalisés", "category": "services", "is_active": True, "order": 11},
    {"id": "autre", "name": "Autre (à préciser dans les notes)", "price": "Sur devis", "description": "Projet spécialisé ou besoins particuliers - décrivez vos besoins", "category": "services", "is_active": True, "order": 12},
]


@router.get("/plan-options")
async def get_plan_options_public():
    """Obtenir les options de plans (public - pour le formulaire de devis)"""
    try:
        db = get_database()
        options = await db.plan_options.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(length=None)
        if not options:
            # Seed defaults
            await db.plan_options.insert_many([dict(o) for o in DEFAULT_PLAN_OPTIONS])
            options = DEFAULT_PLAN_OPTIONS
        return {"success": True, "data": options}
    except Exception as e:
        logger.error(f"Erreur plan options: {e}")
        return {"success": True, "data": DEFAULT_PLAN_OPTIONS}


@router.get("/admin/plan-options")
async def get_plan_options_admin(current_user: dict = Depends(require_admin)):
    """Obtenir toutes les options de plans (admin)"""
    try:
        db = get_database()
        options = await db.plan_options.find({}, {"_id": 0}).sort("order", 1).to_list(length=None)
        if not options:
            await db.plan_options.insert_many([dict(o) for o in DEFAULT_PLAN_OPTIONS])
            options = DEFAULT_PLAN_OPTIONS
        return {"success": True, "data": options}
    except Exception as e:
        logger.error(f"Erreur admin plan options: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/admin/plan-options/{option_id}")
async def update_plan_option(option_id: str, data: dict, current_user: dict = Depends(require_admin)):
    """Modifier une option de plan (admin)"""
    try:
        db = get_database()
        update_fields = {}
        for key in ["name", "price", "description", "category", "is_active", "order"]:
            if key in data:
                update_fields[key] = data[key]
        
        result = await db.plan_options.update_one(
            {"id": option_id},
            {"$set": update_fields}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Option non trouvée")
        return {"success": True, "message": "Option mise à jour"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur update plan option: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/plan-options")
async def create_plan_option(data: dict, current_user: dict = Depends(require_admin)):
    """Créer une nouvelle option de plan (admin)"""
    try:
        db = get_database()
        option_id = data.get("id") or str(uuid.uuid4())[:8]
        new_option = {
            "id": option_id,
            "name": data.get("name", ""),
            "price": data.get("price", "Sur devis"),
            "description": data.get("description", ""),
            "category": data.get("category", "plans"),
            "is_active": data.get("is_active", True),
            "order": data.get("order", 99),
        }
        await db.plan_options.insert_one(new_option)
        return {"success": True, "message": "Option créée", "id": option_id}
    except Exception as e:
        logger.error(f"Erreur create plan option: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/plan-options/{option_id}")
async def delete_plan_option(option_id: str, current_user: dict = Depends(require_admin)):
    """Supprimer une option de plan (admin)"""
    try:
        db = get_database()
        result = await db.plan_options.delete_one({"id": option_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Option non trouvée")
        return {"success": True, "message": "Option supprimée"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur delete plan option: {e}")
        raise HTTPException(status_code=500, detail=str(e))
