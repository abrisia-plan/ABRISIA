from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from typing import List, Optional
from datetime import datetime
import os
import uuid
import shutil
from pathlib import Path
from models import Project, ProjectCreate, ProjectUpdate, SuccessResponse, ListResponse
from database import get_database
from auth import require_admin
from bson import ObjectId
import file_storage
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["projects"])

# Configuration upload
UPLOAD_DIR = Path("/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".dwg", ".dxf", ".skp", ".doc", ".docx"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# URL de base pour les uploads (utiliser l'env si disponible)
BACKEND_URL = os.environ.get("BACKEND_PUBLIC_URL", "")

@router.get("/projects", response_model=ListResponse)
async def get_public_projects(
    category: Optional[str] = None,
    limit: int = 20,
    skip: int = 0,
    home_only: bool = False
):
    """Obtenir les projets publics pour la galerie d'inspiration"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {"is_visible": True}
        if home_only:
            filter_query["show_on_home"] = True
        if category and category != "Tous":
            filter_query["category"] = category
        
        # Récupérer les projets
        cursor = db.projects.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        projects = await cursor.to_list(length=limit)
        
        # Formater les résultats
        formatted_projects = []
        for project in projects:
            formatted_projects.append({
                "id": str(project["_id"]),
                "title": project["title"],
                "category": project["category"],
                "image": project["image"],
                "description": project["description"],
                "details": project["details"],
                "dimensions": project["dimensions"],
                "createdAt": project["created_at"].isoformat()
            })
        
        total = await db.projects.count_documents(filter_query)
        
        return ListResponse(
            success=True,
            data=formatted_projects,
            total=total
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération projets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des projets"
        )

@router.get("/admin/projects", response_model=ListResponse)
async def get_all_projects(
    current_user: dict = Depends(require_admin),
    include_hidden: bool = True
):
    """Obtenir tous les projets (admin)"""
    try:
        db = get_database()
        
        filter_query = {} if include_hidden else {"is_visible": True}
        projects = await db.projects.find(filter_query).sort("created_at", -1).to_list(length=None)
        
        formatted_projects = []
        for project in projects:
            formatted_projects.append({
                "id": str(project["_id"]),
                "title": project["title"],
                "category": project["category"],
                "image": project["image"],
                "description": project["description"],
                "details": project["details"],
                "dimensions": project["dimensions"],
                "isVisible": project["is_visible"],
                "showOnHome": project.get("show_on_home", False),
                "createdAt": project["created_at"].isoformat(),
                "updatedAt": project["updated_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_projects,
            total=len(formatted_projects)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération projets admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des projets"
        )

@router.post("/admin/projects", response_model=SuccessResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(require_admin)
):
    """Créer un nouveau projet"""
    try:
        db = get_database()
        
        project_doc = {
            "title": project_data.title,
            "category": project_data.category,
            "image": project_data.image,
            "description": project_data.description,
            "details": project_data.details,
            "dimensions": project_data.dimensions,
            "is_visible": project_data.is_visible,
            "show_on_home": project_data.show_on_home,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.projects.insert_one(project_doc)
        
        logger.info(f"✅ Nouveau projet créé: {project_data.title} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Projet '{project_data.title}' créé avec succès"
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur création projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du projet"
        )

@router.put("/admin/projects/{project_id}", response_model=SuccessResponse)
async def update_project(
    project_id: str,
    update_data: ProjectUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un projet"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="ID de projet invalide")
        
        # Préparer les données de mise à jour
        update_fields = {"updated_at": datetime.utcnow()}
        
        if update_data.title is not None:
            update_fields["title"] = update_data.title
        if update_data.category is not None:
            update_fields["category"] = update_data.category
        if update_data.image is not None:
            update_fields["image"] = update_data.image
        if update_data.description is not None:
            update_fields["description"] = update_data.description
        if update_data.details is not None:
            update_fields["details"] = update_data.details
        if update_data.dimensions is not None:
            update_fields["dimensions"] = update_data.dimensions
        if update_data.is_visible is not None:
            update_fields["is_visible"] = update_data.is_visible
        if update_data.show_on_home is not None:
            update_fields["show_on_home"] = update_data.show_on_home
        
        result = await db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        logger.info(f"✅ Projet {project_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Projet mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du projet"
        )

@router.delete("/admin/projects/{project_id}", response_model=SuccessResponse)
async def delete_project(
    project_id: str,
    current_user: dict = Depends(require_admin)
):
    """Supprimer un projet"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="ID de projet invalide")
        
        # Récupérer le projet pour supprimer l'image associée
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        # Supprimer l'image du serveur si c'est une image locale
        if project["image"].startswith("/uploads/"):
            image_path = UPLOAD_DIR / project["image"].replace("/uploads/", "")
            if image_path.exists():
                image_path.unlink()
        
        # Supprimer le projet de la base
        result = await db.projects.delete_one({"_id": ObjectId(project_id)})
        
        logger.info(f"✅ Projet {project_id} supprimé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Projet supprimé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du projet"
        )

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"}
PRIVATE_EXTENSIONS = {".pdf", ".dwg", ".dxf", ".skp", ".rvt", ".ifc", ".zip", ".doc", ".docx", ".xls", ".xlsx",
                      ".jpg", ".jpeg", ".png"}


async def _admin_upload(file: UploadFile, allowed: set, public: bool, folder: str, user: dict) -> dict:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Type de fichier non autorisé. Acceptés : {', '.join(sorted(allowed))}")
    try:
        info = await file_storage.save_file(file.file, file.filename, file.content_type, folder=folder,
                                            public=public, uploaded_by=user.get("name"))
    except file_storage.FileTooLarge:
        raise HTTPException(status_code=413, detail=f"Fichier trop volumineux. Maximum : {file_storage.MAX_FILE_MB} Mo")
    logger.info(f"✅ Fichier {'public' if public else 'privé'} {info['filename']} ({info['id']}) par {user.get('name')}")
    return info


@router.post("/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin)
):
    """Upload d'une image PUBLIQUE (photos du site, projets, collection)"""
    try:
        info = await _admin_upload(file, IMAGE_EXTENSIONS, True, "images", current_user)
        return {"success": True, "imageUrl": info["url"], "file": info, "message": "Image téléversée avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur upload image: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du téléversement de l'image")


@router.post("/admin/upload-private")
async def upload_private_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin)
):
    """Upload d'un fichier PRIVÉ (plans à vendre) : jamais visible du public"""
    try:
        info = await _admin_upload(file, PRIVATE_EXTENSIONS, False, "collection-prive", current_user)
        return {"success": True, "file": info, "message": "Fichier privé téléversé avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur upload fichier privé: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du téléversement du fichier")

@router.get("/categories")
async def get_project_categories():
    """Obtenir toutes les catégories de projets disponibles"""
    try:
        db = get_database()
        
        # Récupérer les catégories distinctes des projets visibles
        categories = await db.projects.distinct("category", {"is_visible": True})
        
        return {
            "success": True,
            "categories": ["Tous"] + sorted(categories)
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération catégories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des catégories"
        )
