from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from models import (
    Devis, DevisCreate, DevisUpdate, DevisResponse, 
    SuccessResponse, ListResponse, SimpleStats
)
from database import get_database
from auth import require_admin
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["devis"])

@router.post("/devis", response_model=DevisResponse)
async def submit_devis(devis_data: DevisCreate):
    """Soumettre une demande de devis (public)"""
    try:
        db = get_database()
        
        # Créer le document devis
        devis_doc = {
            "nom": devis_data.nom,
            "email": devis_data.email,
            "telephone": devis_data.telephone or "",
            "project_type": devis_data.projectType,
            "plans_choisis": devis_data.plansChoisis,
            "notes": devis_data.notes,
            "status": "En attente",
            "assigned_to": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insérer en base
        result = await db.devis.insert_one(devis_doc)
        
        # Envoyer notification email (optionnel - à implémenter plus tard)
        # await send_notification_email(devis_data)
        
        logger.info(f"✅ Nouveau devis soumis par {devis_data.nom} ({devis_data.email})")
        
        return DevisResponse(
            success=True,
            message="Devis soumis avec succès. Nous vous contacterons sous 24h.",
            devis={
                "id": str(result.inserted_id),
                "status": "En attente",
                "createdAt": devis_doc["created_at"].isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur soumission devis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la soumission du devis"
        )

@router.get("/admin/devis", response_model=ListResponse)
async def get_all_devis(
    status_filter: str = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les devis (admin seulement)"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {}
        if status_filter:
            filter_query["status"] = status_filter
        
        # Récupérer les devis avec pagination
        cursor = db.devis.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        devis_list = await cursor.to_list(length=limit)
        
        # Compter le total
        total = await db.devis.count_documents(filter_query)
        
        # Formater les résultats
        formatted_devis = []
        for devis in devis_list:
            formatted_devis.append({
                "id": str(devis["_id"]),
                "nom": devis["nom"],
                "email": devis["email"],
                "telephone": devis.get("telephone", ""),
                "projectType": devis["project_type"],
                "plansChoisis": devis["plans_choisis"],
                "notes": devis["notes"],
                "status": devis["status"],
                "assignedTo": devis.get("assigned_to"),
                "createdAt": devis["created_at"].isoformat(),
                "updatedAt": devis["updated_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_devis,
            total=total
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération devis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des devis"
        )

@router.put("/admin/devis/{devis_id}/status", response_model=SuccessResponse)
async def update_devis_status(
    devis_id: str,
    update_data: DevisUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour le statut d'un devis"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(devis_id):
            raise HTTPException(status_code=400, detail="ID de devis invalide")
        
        # Préparer les données de mise à jour
        update_fields = {"updated_at": datetime.utcnow()}
        
        if update_data.status:
            update_fields["status"] = update_data.status
        
        if update_data.assigned_designer is not None:
            update_fields["assigned_to"] = update_data.assigned_designer
            
        # Mettre à jour en base
        result = await db.devis.update_one(
            {"_id": ObjectId(devis_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Devis non trouvé")
        
        # Mettre à jour le compteur de projets actifs du dessinateur
        if update_data.assigned_designer:
            await update_designer_active_projects()
        
        logger.info(f"✅ Devis {devis_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Statut du devis mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour devis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du devis"
        )

@router.delete("/admin/devis/{devis_id}", response_model=SuccessResponse)
async def delete_devis(
    devis_id: str,
    current_user: dict = Depends(require_admin)
):
    """Supprimer un devis"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(devis_id):
            raise HTTPException(status_code=400, detail="ID de devis invalide")
        
        result = await db.devis.delete_one({"_id": ObjectId(devis_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Devis non trouvé")
        
        logger.info(f"✅ Devis {devis_id} supprimé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Devis supprimé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression devis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du devis"
        )

@router.get("/admin/stats", response_model=SimpleStats)
async def get_dashboard_stats(current_user: dict = Depends(require_admin)):
    """Obtenir les statistiques pour le dashboard"""
    try:
        db = get_database()
        
        # Compter les devis par statut
        total_devis = await db.devis.count_documents({})
        pending_devis = await db.devis.count_documents({"status": "En attente"})
        active_devis = await db.devis.count_documents({"status": "En cours"})
        completed_devis = await db.devis.count_documents({"status": "Terminé"})
        
        # Compter les autres entités
        total_designers = await db.designers.count_documents({})
        total_projects = await db.projects.count_documents({"is_visible": True})
        
        return SimpleStats(
            total_devis=total_devis,
            pending_devis=pending_devis,
            active_devis=active_devis,
            completed_devis=completed_devis,
            total_designers=total_designers,
            total_projects=total_projects
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération statistiques: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des statistiques"
        )

async def update_designer_active_projects():
    """Mettre à jour le compteur de projets actifs des dessinateurs"""
    try:
        db = get_database()
        
        # Récupérer tous les dessinateurs
        designers = await db.designers.find({}).to_list(length=None)
        
        for designer in designers:
            # Compter les devis actifs assignés à ce dessinateur
            active_count = await db.devis.count_documents({
                "assigned_to": designer["name"],
                "status": "En cours"
            })
            
            # Mettre à jour le compteur
            await db.designers.update_one(
                {"_id": designer["_id"]},
                {"$set": {"active_projects": active_count}}
            )
            
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour compteurs: {e}")