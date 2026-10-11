from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from typing import List, Optional
from datetime import datetime
import os
import uuid
from pathlib import Path
from models import (
    SiteContent, SiteContentCreate, SiteContentUpdate,
    SiteSettings, SiteSettingsUpdate,
    Service, ServiceCreate, ServiceUpdate,
    MediaFile, MediaFileCreate,
    SuccessResponse, ListResponse
)
from database import get_database
from auth import require_admin
from bson import ObjectId
import file_storage
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/cms", tags=["content-management"])

# Configuration upload
UPLOAD_DIR = Path("/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# ========== GESTION DU CONTENU ==========

@router.get("/content", response_model=ListResponse)
async def get_all_content(
    category: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Obtenir tout le contenu du site"""
    try:
        db = get_database()
        
        filter_query = {}
        if category:
            filter_query["category"] = category
        
        content_list = await db.site_content.find(filter_query).sort("category", 1).to_list(length=None)
        
        formatted_content = []
        for content in content_list:
            formatted_content.append({
                "id": str(content["_id"]),
                "key": content["key"],
                "value": content["value"],
                "type": content["type"],
                "category": content["category"],
                "description": content.get("description", ""),
                "updatedAt": content["updated_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_content,
            total=len(formatted_content)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération contenu: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du contenu"
        )

@router.post("/content", response_model=SuccessResponse)
async def create_content(
    content_data: SiteContentCreate,
    current_user: dict = Depends(require_admin)
):
    """Créer un nouveau contenu"""
    try:
        db = get_database()
        
        # Vérifier si la clé existe déjà
        existing = await db.site_content.find_one({"key": content_data.key})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un contenu avec cette clé existe déjà"
            )
        
        content_doc = {
            "key": content_data.key,
            "value": content_data.value,
            "type": content_data.type,
            "category": content_data.category,
            "description": content_data.description,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.site_content.insert_one(content_doc)
        
        logger.info(f"✅ Nouveau contenu créé: {content_data.key} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Contenu '{content_data.key}' créé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création contenu: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du contenu"
        )

@router.put("/content/{content_id}", response_model=SuccessResponse)
async def update_content(
    content_id: str,
    update_data: SiteContentUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un contenu"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(content_id):
            raise HTTPException(status_code=400, detail="ID de contenu invalide")
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        if update_data.value is not None:
            update_fields["value"] = update_data.value
        if update_data.type is not None:
            update_fields["type"] = update_data.type
        if update_data.category is not None:
            update_fields["category"] = update_data.category
        if update_data.description is not None:
            update_fields["description"] = update_data.description
        
        result = await db.site_content.update_one(
            {"_id": ObjectId(content_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Contenu non trouvé")
        
        logger.info(f"✅ Contenu {content_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Contenu mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour contenu: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du contenu"
        )

# ========== PARAMÈTRES DU SITE ==========

HERO_IMAGE_DEFAULT = "https://customer-assets.emergentagent.com/job_c939612f-c018-47c9-949a-bf666b73ec90/artifacts/s0baspap_Copie%20de%20Copie%20de%20Abrisia.jpg"
OLD_DEFAULT_HERO = "https://images.unsplash.com/photo-1629740053362-220a869d7cc1"
OLD_DEFAULT_HOURS = "Lundi-Vendredi 8h-18h, Weekends sur rendez-vous"
SITE_KEY = {"key": "site"}
# Champs que le site public peut lire (rien de secret)
PUBLIC_SETTINGS = ("logo_url", "hero_image", "contact_email", "contact_phone",
                   "contact_address", "business_hours", "facebook_url", "instagram_url", "linkedin_url")


async def _load_site_settings(db):
    """Fiche des paramètres du site. site_settings contient aussi le menu, les tarifs
    et les notes de l'assistant : on cible toujours la fiche {"key": "site"}."""
    settings = await db.site_settings.find_one(SITE_KEY)
    if not settings:
        # Ancienne fiche sans clé (créée avant) : on la marque
        legacy = await db.site_settings.find_one({"key": {"$exists": False}, "site_name": {"$exists": True}})
        if legacy:
            await db.site_settings.update_one({"_id": legacy["_id"]}, {"$set": SITE_KEY})
            settings = await db.site_settings.find_one({"_id": legacy["_id"]})
    if settings and str(settings.get("hero_image") or "").startswith(OLD_DEFAULT_HERO):
        # L'ancienne image par défaut n'a jamais été celle du site
        settings["hero_image"] = HERO_IMAGE_DEFAULT
    if settings and settings.get("business_hours") == OLD_DEFAULT_HOURS:
        # Anciennes heures par défaut, jamais affichées : la page Contact garde les siennes
        settings["business_hours"] = ""
    return settings


@router.get("/settings")
async def get_site_settings(current_user: dict = Depends(require_admin)):
    """Obtenir les paramètres du site"""
    try:
        db = get_database()
        
        settings = await _load_site_settings(db)
        
        if not settings:
            # Créer les paramètres par défaut
            default_settings = {
                **SITE_KEY,
                "site_name": "Abrisia Plan",
                "hero_image": HERO_IMAGE_DEFAULT,
                "logo_url": "/logo-abrisia.jpg",
                "contact_email": "abrisia0plan@gmail.com",
                "contact_phone": "",
                "contact_address": "Saguenay–Lac-Saint-Jean, Québec",
                "business_hours": "",
                "facebook_url": None,
                "instagram_url": None,
                "linkedin_url": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await db.site_settings.insert_one(default_settings)
            settings = await db.site_settings.find_one({"_id": result.inserted_id})
        
        # Formater la réponse
        formatted_settings = {
            "id": str(settings["_id"]),
            **{k: v for k, v in settings.items() if k not in ["_id", "created_at", "updated_at", "key"]},
            "updatedAt": settings["updated_at"].isoformat() if settings.get("updated_at") else None
        }
        
        return {
            "success": True,
            "settings": formatted_settings
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération paramètres: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des paramètres"
        )

@router.put("/settings", response_model=SuccessResponse)
async def update_site_settings(
    update_data: SiteSettingsUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour les paramètres du site"""
    try:
        db = get_database()
        
        # Préparer les champs à mettre à jour
        update_fields = {"updated_at": datetime.utcnow()}
        
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields[field] = value
        
        # Mettre à jour la fiche du site (jamais celle du menu ou des tarifs)
        await _load_site_settings(db)  # marque une ancienne fiche si besoin
        result = await db.site_settings.update_one(
            SITE_KEY,
            {"$set": update_fields},
            upsert=True
        )
        
        logger.info(f"✅ Paramètres du site mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Paramètres du site mis à jour avec succès"
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour paramètres: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour des paramètres"
        )

# ========== GESTION DES SERVICES ET PRIX ==========

@router.get("/services", response_model=ListResponse)
async def get_all_services(current_user: dict = Depends(require_admin)):
    """Obtenir tous les services"""
    try:
        db = get_database()
        
        services = await db.services.find({}).sort("order", 1).to_list(length=None)
        
        formatted_services = []
        for service in services:
            formatted_services.append({
                "id": str(service["_id"]),
                "name": service["name"],
                "description": service["description"],
                "price": service["price"],
                "icon": service["icon"],
                "category": service["category"],
                "isActive": service["is_active"],
                "order": service["order"],
                "updatedAt": service["updated_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_services,
            total=len(formatted_services)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération services: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des services"
        )

@router.post("/services", response_model=SuccessResponse)
async def create_service(
    service_data: ServiceCreate,
    current_user: dict = Depends(require_admin)
):
    """Créer un nouveau service"""
    try:
        db = get_database()
        
        service_doc = {
            "name": service_data.name,
            "description": service_data.description,
            "price": service_data.price,
            "icon": service_data.icon,
            "category": service_data.category,
            "is_active": service_data.is_active,
            "order": service_data.order,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.services.insert_one(service_doc)
        
        logger.info(f"✅ Nouveau service créé: {service_data.name} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Service '{service_data.name}' créé avec succès"
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur création service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du service"
        )

@router.put("/services/{service_id}", response_model=SuccessResponse)
async def update_service(
    service_id: str,
    update_data: ServiceUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un service"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(service_id):
            raise HTTPException(status_code=400, detail="ID de service invalide")
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields[field] = value
        
        result = await db.services.update_one(
            {"_id": ObjectId(service_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Service non trouvé")
        
        logger.info(f"✅ Service {service_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Service mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du service"
        )

# ========== GESTION DES MÉDIAS ==========

@router.post("/upload-media")
async def upload_media_file(
    file: UploadFile = File(...),
    category: str = "general",
    alt_text: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Upload d'un fichier média"""
    try:
        # Vérifier l'extension du fichier
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Type de fichier non autorisé. Extensions autorisées: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Stockage permanent (public : ces médias s'affichent sur le site)
        try:
            info = await file_storage.save_file(file.file, file.filename, file.content_type,
                                                folder="media", public=True, uploaded_by=current_user["name"])
        except file_storage.FileTooLarge:
            raise HTTPException(status_code=413, detail=f"Fichier trop volumineux. Maximum : {file_storage.MAX_FILE_MB} Mo")
        unique_filename = info["id"]

        db = get_database()
        media_doc = {
            "filename": info["filename"],
            "original_name": file.filename,
            "file_path": info["url"],
            "storage_file_id": info["id"],
            "file_size": info["size"],
            "mime_type": file.content_type,
            "category": category,
            "alt_text": alt_text,
            "uploaded_by": current_user["name"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.media_files.insert_one(media_doc)
        
        logger.info(f"✅ Fichier uploadé: {unique_filename} par {current_user['name']}")
        
        return {
            "success": True,
            "fileUrl": info["url"],
            "fileId": str(result.inserted_id),
            "message": "Fichier uploadé avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur upload fichier: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload du fichier"
        )

@router.get("/media", response_model=ListResponse)
async def get_all_media(
    category: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les fichiers média"""
    try:
        db = get_database()
        
        filter_query = {}
        if category:
            filter_query["category"] = category
        
        media_files = await db.media_files.find(filter_query).sort("created_at", -1).to_list(length=None)
        
        formatted_files = []
        for media in media_files:
            formatted_files.append({
                "id": str(media["_id"]),
                "filename": media["filename"],
                "originalName": media["original_name"],
                "filePath": media["file_path"],
                "fileSize": media["file_size"],
                "mimeType": media["mime_type"],
                "category": media["category"],
                "altText": media.get("alt_text"),
                "uploadedBy": media["uploaded_by"],
                "createdAt": media["created_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_files,
            total=len(formatted_files)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération médias: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des médias"
        )


# ========== GESTION DU MENU DE NAVIGATION ==========

# Toutes les pages qu'on peut mettre dans le menu. Celles absentes de la configuration
# enregistrée y sont ajoutées (masquées, sauf « À propos »), pour pouvoir les afficher depuis l'admin.
ALL_MENU_PAGES = [
    {"name": "Accueil", "href": "/", "visible": True, "order": 0},
    {"name": "Inspiration", "href": "/inspiration", "visible": True, "order": 1},
    {"name": "Collection", "href": "/collection", "visible": True, "order": 2},
    {"name": "Espace Pro", "href": "/espace-pro", "visible": True, "order": 3},
    {"name": "À propos", "href": "/a-propos", "visible": True, "order": 4},
    {"name": "Demander un devis", "href": "/devis", "visible": True, "order": 5},
    {"name": "Contact", "href": "/contact", "visible": True, "order": 6},
    {"name": "Questions fréquentes", "href": "/faq", "visible": False, "order": 7},
    {"name": "Plans de maison", "href": "/plan-de-maison", "visible": False, "order": 8},
]


def _merge_menu(pages: list) -> list:
    """Configuration enregistrée + pages manquantes (masquées), triée par ordre."""
    merged = [dict(p) for p in pages]
    known = {p.get("href") for p in merged}
    next_order = max([p.get("order", 0) for p in merged] or [0]) + 1
    for page in ALL_MENU_PAGES:
        if page["href"] not in known:
            extra = dict(page)
            # « À propos » est apparu plus tard dans le menu : visible par défaut
            extra["visible"] = page["href"] == "/a-propos"
            extra["order"] = next_order
            next_order += 1
            merged.append(extra)
    merged.sort(key=lambda x: x.get("order", 99))
    return merged


@router.get("/navigation")
async def get_navigation(current_user: dict = Depends(require_admin)):
    """Obtenir la configuration du menu de navigation"""
    try:
        db = get_database()
        nav = await db.site_settings.find_one({"key": "navigation"}, {"_id": 0})
        pages = _merge_menu(nav.get("pages", [])) if nav else [dict(p) for p in ALL_MENU_PAGES]
        return {"success": True, "pages": pages}
    except Exception as e:
        logger.error(f"Erreur navigation: {e}")
        raise HTTPException(status_code=500, detail="Erreur")

@router.put("/navigation")
async def update_navigation(data: dict, current_user: dict = Depends(require_admin)):
    """Mettre à jour la configuration du menu de navigation"""
    try:
        db = get_database()
        pages = data.get("pages", [])
        # L'accueil reste toujours dans le menu
        for p in pages:
            if p.get("href") == "/":
                p["visible"] = True
        await db.site_settings.update_one(
            {"key": "navigation"},
            {"$set": {"pages": pages}},
            upsert=True
        )
        return {"success": True, "message": "Navigation mise à jour", "pages": pages}
    except Exception as e:
        logger.error(f"Erreur update navigation: {e}")
        raise HTTPException(status_code=500, detail="Erreur")


# Route publique pour obtenir le menu (sans auth)
public_router = APIRouter(prefix="/navigation", tags=["navigation"])
site_public_router = APIRouter(tags=["site"])


@site_public_router.get("/site-settings")
async def get_public_site_settings():
    """Logo, image d'accueil et coordonnées choisis dans l'admin (Design & Images)"""
    try:
        db = get_database()
        settings = await _load_site_settings(db) or {}
        return {"success": True, "settings": {k: settings.get(k) for k in PUBLIC_SETTINGS if settings.get(k)}}
    except Exception as e:
        logger.error(f"Erreur paramètres publics: {e}")
        return {"success": True, "settings": {}}

@public_router.get("/menu")
async def get_public_navigation():
    """Obtenir les pages visibles du menu (public)"""
    try:
        db = get_database()
        nav = await db.site_settings.find_one({"key": "navigation"}, {"_id": 0})
        pages = _merge_menu(nav.get("pages", [])) if nav else [dict(p) for p in ALL_MENU_PAGES]
        return {"success": True, "pages": [p for p in pages if p.get("visible", True)]}
    except Exception as e:
        return {"success": True, "pages": [
            {"name": "Accueil", "href": "/", "visible": True},
            {"name": "Collection", "href": "/collection", "visible": True},
            {"name": "Espace Pro", "href": "/espace-pro", "visible": True},
            {"name": "Demander un devis", "href": "/devis", "visible": True},
        ]}
