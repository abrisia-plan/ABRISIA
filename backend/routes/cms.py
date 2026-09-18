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
from object_storage import put_object, get_object as storage_get_object
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/cms", tags=["content-management"])

# Configuration upload
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
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

@router.get("/settings")
async def get_site_settings(current_user: dict = Depends(require_admin)):
    """Obtenir les paramètres du site"""
    try:
        db = get_database()
        
        settings = await db.site_settings.find_one({})
        
        if not settings:
            # Créer les paramètres par défaut
            default_settings = {
                "site_name": "Abrisia Plan",
                "slogan": "Des espaces sur mesure, une vie à votre rythme",
                "hero_image": "https://images.unsplash.com/photo-1629740053362-220a869d7cc1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxmam9yZCUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3NTUwNjA0NTl8MA&ixlib=rb-4.1.0&q=85",
                "logo_url": None,
                "primary_color": "#0f766e",
                "secondary_color": "#f59e0b", 
                "accent_color": "#10b981",
                "background_color": "#fefbf4",
                "contact_email": "abrisia0plan@gmail.com",
                "contact_phone": "",
                "contact_address": "Saguenay, QC, Canada",
                "business_hours": "Lundi-Vendredi 8h-18h, Weekends sur rendez-vous",
                "facebook_url": None,
                "instagram_url": None,
                "linkedin_url": None,
                "meta_title": "Abrisia Plan - Plans sur mesure Saguenay QC",
                "meta_description": "Spécialiste en plans architecturaux sur mesure au Saguenay. Mini-maisons, chalets, extensions - Des espaces adaptés à votre rythme.",
                "meta_keywords": "plans maison, architecte saguenay, mini-maison, chalet, construction quebec",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await db.site_settings.insert_one(default_settings)
            settings = await db.site_settings.find_one({"_id": result.inserted_id})
        
        # Formater la réponse
        formatted_settings = {
            "id": str(settings["_id"]),
            **{k: v for k, v in settings.items() if k not in ["_id", "created_at", "updated_at"]},
            "updatedAt": settings["updated_at"].isoformat()
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
        
        # Mettre à jour les paramètres existants ou créer si ils n'existent pas
        result = await db.site_settings.update_one(
            {},
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
        
        # Vérifier la taille du fichier
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Fichier trop volumineux. Taille maximum: {MAX_FILE_SIZE // 1024 // 1024}MB"
            )
        
        # Générer un nom de fichier unique
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Sauvegarder dans Emergent Object Storage
        storage_path = f"abrisia-plan/media/{unique_filename}"
        result_storage = put_object(storage_path, content, file.content_type or "application/octet-stream")

        db = get_database()
        media_doc = {
            "filename": unique_filename,
            "original_name": file.filename,
            "file_path": f"/api/files/{unique_filename}",
            "storage_path": result_storage.get("path", storage_path),
            "file_size": len(content),
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
            "fileUrl": f"/api/files/{unique_filename}",
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

@router.get("/navigation")
async def get_navigation(current_user: dict = Depends(require_admin)):
    """Obtenir la configuration du menu de navigation"""
    try:
        db = get_database()
        nav = await db.site_settings.find_one({"key": "navigation"}, {"_id": 0})
        if not nav:
            default_pages = [
                {"name": "Accueil", "href": "/", "visible": True, "order": 0},
                {"name": "Inspiration", "href": "/inspiration", "visible": True, "order": 1},
                {"name": "Collection", "href": "/collection", "visible": True, "order": 2},
                {"name": "Demander un devis", "href": "/devis", "visible": True, "order": 3},
                {"name": "Contact", "href": "/contact", "visible": True, "order": 5},
            ]
            await db.site_settings.insert_one({"key": "navigation", "pages": default_pages})
            return {"success": True, "pages": default_pages}
        return {"success": True, "pages": nav.get("pages", [])}
    except Exception as e:
        logger.error(f"Erreur navigation: {e}")
        raise HTTPException(status_code=500, detail="Erreur")

@router.put("/navigation")
async def update_navigation(data: dict, current_user: dict = Depends(require_admin)):
    """Mettre à jour la configuration du menu de navigation"""
    try:
        db = get_database()
        pages = data.get("pages", [])
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

@public_router.get("/menu")
async def get_public_navigation():
    """Obtenir les pages visibles du menu (public)"""
    try:
        db = get_database()
        nav = await db.site_settings.find_one({"key": "navigation"}, {"_id": 0})
        if not nav:
            default_pages = [
                {"name": "Accueil", "href": "/", "visible": True, "order": 0},
                {"name": "Inspiration", "href": "/inspiration", "visible": True, "order": 1},
                {"name": "Collection", "href": "/collection", "visible": True, "order": 2},
                {"name": "Espace Pro", "href": "/espace-pro", "visible": True, "order": 3},
                {"name": "Demander un devis", "href": "/devis", "visible": True, "order": 4},
                {"name": "Contact", "href": "/contact", "visible": True, "order": 5},
            ]
            return {"success": True, "pages": default_pages}
        visible = [p for p in nav.get("pages", []) if p.get("visible", True)]
        visible.sort(key=lambda x: x.get("order", 99))
        return {"success": True, "pages": visible}
    except Exception as e:
        return {"success": True, "pages": [
            {"name": "Accueil", "href": "/", "visible": True},
            {"name": "Collection", "href": "/collection", "visible": True},
            {"name": "Espace Pro", "href": "/espace-pro", "visible": True},
            {"name": "Demander un devis", "href": "/devis", "visible": True},
        ]}
