from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from ..models import Designer, DesignerCreate, DesignerUpdate, SuccessResponse, ListResponse
from ..database import get_database
from ..auth import require_admin
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["designers"])

@router.get("/designers", response_model=ListResponse)
async def get_all_designers(current_user: dict = Depends(require_admin)):
    """Obtenir tous les dessinateurs"""
    try:
        db = get_database()
        
        designers = await db.designers.find({}).sort("name", 1).to_list(length=None)
        
        formatted_designers = []
        for designer in designers:
            formatted_designers.append({
                "id": str(designer["_id"]),
                "name": designer["name"],
                "email": designer["email"],
                "specialties": designer["specialties"],
                "activeProjects": designer.get("active_projects", 0),
                "createdAt": designer["created_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_designers,
            total=len(formatted_designers)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération dessinateurs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des dessinateurs"
        )

@router.post("/designers", response_model=SuccessResponse)
async def create_designer(
    designer_data: DesignerCreate,
    current_user: dict = Depends(require_admin)
):
    """Créer un nouveau dessinateur"""
    try:
        db = get_database()
        
        # Vérifier si l'email existe déjà
        existing = await db.designers.find_one({"email": designer_data.email})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un dessinateur avec cet email existe déjà"
            )
        
        # Créer le document
        designer_doc = {
            "name": designer_data.name,
            "email": designer_data.email,
            "specialties": designer_data.specialties,
            "active_projects": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.designers.insert_one(designer_doc)
        
        logger.info(f"✅ Nouveau dessinateur créé: {designer_data.name} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Dessinateur {designer_data.name} créé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création dessinateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du dessinateur"
        )

@router.put("/designers/{designer_id}", response_model=SuccessResponse)
async def update_designer(
    designer_id: str,
    update_data: DesignerUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un dessinateur"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(designer_id):
            raise HTTPException(status_code=400, detail="ID de dessinateur invalide")
        
        # Préparer les données de mise à jour
        update_fields = {"updated_at": datetime.utcnow()}
        
        if update_data.name is not None:
            update_fields["name"] = update_data.name
        if update_data.email is not None:
            # Vérifier l'unicité de l'email
            existing = await db.designers.find_one({
                "email": update_data.email,
                "_id": {"$ne": ObjectId(designer_id)}
            })
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un dessinateur avec cet email existe déjà"
                )
            update_fields["email"] = update_data.email
        if update_data.specialties is not None:
            update_fields["specialties"] = update_data.specialties
        if update_data.active_projects is not None:
            update_fields["active_projects"] = update_data.active_projects
        
        result = await db.designers.update_one(
            {"_id": ObjectId(designer_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Dessinateur non trouvé")
        
        logger.info(f"✅ Dessinateur {designer_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Dessinateur mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour dessinateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du dessinateur"
        )

@router.delete("/designers/{designer_id}", response_model=SuccessResponse)
async def delete_designer(
    designer_id: str,
    current_user: dict = Depends(require_admin)
):
    """Supprimer un dessinateur"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(designer_id):
            raise HTTPException(status_code=400, detail="ID de dessinateur invalide")
        
        # Vérifier si le dessinateur a des projets assignés
        assigned_projects = await db.devis.count_documents({
            "assigned_to": {"$exists": True},
            "status": "En cours"
        })
        
        if assigned_projects > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer un dessinateur avec des projets en cours"
            )
        
        result = await db.designers.delete_one({"_id": ObjectId(designer_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Dessinateur non trouvé")
        
        logger.info(f"✅ Dessinateur {designer_id} supprimé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Dessinateur supprimé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression dessinateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du dessinateur"
        )

@router.get("/designers/{designer_id}/projects")
async def get_designer_projects(
    designer_id: str,
    current_user: dict = Depends(require_admin)
):
    """Obtenir les projets assignés à un dessinateur"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(designer_id):
            raise HTTPException(status_code=400, detail="ID de dessinateur invalide")
        
        # Récupérer le dessinateur
        designer = await db.designers.find_one({"_id": ObjectId(designer_id)})
        if not designer:
            raise HTTPException(status_code=404, detail="Dessinateur non trouvé")
        
        # Récupérer les devis assignés
        projects = await db.devis.find({
            "assigned_to": designer["name"]
        }).sort("created_at", -1).to_list(length=None)
        
        formatted_projects = []
        for project in projects:
            formatted_projects.append({
                "id": str(project["_id"]),
                "clientName": project["nom"],
                "projectType": project["project_type"],
                "status": project["status"],
                "createdAt": project["created_at"].isoformat()
            })
        
        return {
            "success": True,
            "designer": designer["name"],
            "projects": formatted_projects,
            "total": len(formatted_projects)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération projets dessinateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des projets"
        )