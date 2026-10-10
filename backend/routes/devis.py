from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks, File, Form, UploadFile
from pydantic import ValidationError
from typing import List
import json
import os
from datetime import datetime
from models import (
    Devis, DevisCreate, DevisUpdate, DevisResponse, 
    SuccessResponse, ListResponse, SimpleStats
)
from database import get_database
from auth import require_admin
from email_service import email_service
from file_storage import file_size
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["devis"])


async def _create_zoho_lead_from_devis(devis_doc: dict):
    """Créer un lead Zoho en arrière-plan pour chaque devis"""
    try:
        from routes.zoho import save_lead
        first_name = devis_doc.get("prenom", "") or devis_doc.get("nom", "").split(" ", 1)[0] or "Visiteur"
        last_name = devis_doc.get("nom", "") or first_name

        zoho_record = {
            "First_Name": first_name,
            "Last_Name": last_name,
            "Email": devis_doc.get("email", ""),
            "Phone": devis_doc.get("telephone", ""),
            "Company": "Visiteur site web",
            "Lead_Source": "Demande de devis",
            "Description": f"Type: {devis_doc.get('project_type', 'N/A')}\n"
                           f"Plans: {', '.join(devis_doc.get('plans_choisis', []))}\n"
                           f"Notes: {devis_doc.get('notes', '')}"
                           + "".join(f"\nFichier reçu par courriel : {f['filename']}" for f in devis_doc.get('fichiers', [])),
        }
        data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": devis_doc.get("email", ""),
            "phone": devis_doc.get("telephone", ""),
        }
        await save_lead("devis", data, zoho_record)
    except Exception as e:
        logger.warning(f"Zoho lead creation échouée pour devis: {e}")

# Les fichiers des clients ne sont PAS gardés sur le site : ils partent en
# pièces jointes du courriel. Gmail refuse les courriels de plus de 25 Mo et
# l'encodage des pièces jointes ajoute environ un tiers : 18 Mo au total.
MAX_FILES = 10
MAX_TOTAL_MB = 18
MAX_TOTAL_SIZE = MAX_TOTAL_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif", ".bmp", ".tif", ".tiff",
    ".pdf", ".dwg", ".dxf", ".skp", ".rvt", ".ifc",
    ".doc", ".docx", ".xls", ".xlsx", ".odt", ".ods", ".txt", ".rtf", ".zip",
}


async def _create_devis(devis_data: DevisCreate, fichiers: list, background_tasks: BackgroundTasks, attachments=None):
    db = get_database()
    devis_doc = {
        "prenom": devis_data.prenom,
        "nom": devis_data.nom,
        "email": devis_data.email,
        "telephone": devis_data.telephone or "",
        "project_type": devis_data.projectType or "",
        "plans_choisis": devis_data.plansChoisis,
        "notes": devis_data.notes,
        "fichiers": fichiers,
        "status": "En attente",
        "assigned_to": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Le devis est d'abord enregistré en base : il n'est jamais perdu,
    # même si le courriel ou Zoho échoue ensuite.
    result = await db.devis.insert_one(devis_doc)

    background_tasks.add_task(email_service.send_devis_notification, devis_doc, attachments)
    background_tasks.add_task(_create_zoho_lead_from_devis, devis_doc)

    logger.info(f"✅ Nouveau devis soumis par {devis_data.prenom} {devis_data.nom} ({devis_data.email}), {len(fichiers)} fichier(s)")

    return DevisResponse(
        success=True,
        message="Devis soumis avec succès. Nous vous contacterons sous 24h.",
        devis={
            "id": str(result.inserted_id),
            "status": "En attente",
            "createdAt": devis_doc["created_at"].isoformat()
        }
    )


@router.get("/devis/limites")
async def get_upload_limits():
    """Limites des pièces jointes, affichées par le formulaire"""
    return {
        "max_file_mb": MAX_TOTAL_MB,
        "max_total_mb": MAX_TOTAL_MB,
        "max_files": MAX_FILES,
        "extensions": sorted(ALLOWED_EXTENSIONS),
    }


@router.post("/devis", response_model=DevisResponse)
async def submit_devis(devis_data: DevisCreate, background_tasks: BackgroundTasks):
    """Soumettre une demande de devis sans fichiers (public)"""
    try:
        return await _create_devis(devis_data, [], background_tasks)
    except Exception as e:
        logger.error(f"❌ Erreur soumission devis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la soumission du devis"
        )


@router.post("/devis/avec-fichiers", response_model=DevisResponse)
async def submit_devis_with_files(
    background_tasks: BackgroundTasks,
    data: str = Form(...),
    files: List[UploadFile] = File(default=[]),
):
    """Soumettre une demande de devis avec pièces jointes (public).

    `data` contient les champs du formulaire en JSON, `files` les fichiers.
    """
    try:
        devis_data = DevisCreate(**json.loads(data))
    except (ValueError, ValidationError):
        raise HTTPException(status_code=422, detail="Informations du formulaire invalides. Vérifiez votre courriel.")

    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} fichiers par demande.")

    total = 0
    for upload in files:
        name = os.path.basename(upload.filename or "fichier")
        ext = os.path.splitext(name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Le type de fichier « {name} » n'est pas accepté.")
        total += file_size(upload.file)
    if total > MAX_TOTAL_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Vos fichiers dépassent {MAX_TOTAL_MB} Mo au total. Retirez-en quelques-uns : vous pourrez nous les envoyer par courriel après votre demande.",
        )

    try:
        attachments = []
        fichiers = []  # seulement le nom et la taille : le contenu n'est pas gardé
        for upload in files:
            name = os.path.basename(upload.filename or "fichier")
            content = await upload.read()
            attachments.append((name, content))
            fichiers.append({"filename": name, "size": len(content)})
        return await _create_devis(devis_data, fichiers, background_tasks, attachments)
    except Exception as e:
        logger.error(f"❌ Erreur soumission devis avec fichiers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la soumission du devis"
        )

@router.get("/admin/devis", response_model=ListResponse)
async def get_all_devis(
    status: str = None,
    status_filter: str = None,
    limit: int = 50,
    skip: int = 0,
    per_page: int = None,
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les devis (admin seulement)"""
    try:
        db = get_database()
        
        # Support both 'status' and 'status_filter' params
        effective_status = status or status_filter
        
        # Use per_page if provided, otherwise use limit
        effective_limit = per_page if per_page is not None else limit
        
        # Construire le filtre
        filter_query = {}
        if effective_status:
            filter_query["status"] = effective_status
        
        # Récupérer les devis avec pagination
        cursor = db.devis.find(filter_query).sort("created_at", -1).skip(skip).limit(effective_limit)
        devis_list = await cursor.to_list(length=effective_limit)
        
        # Compter le total
        total = await db.devis.count_documents(filter_query)
        
        # Formater les résultats
        formatted_devis = []
        for devis in devis_list:
            formatted_devis.append({
                "id": str(devis["_id"]),
                "prenom": devis.get("prenom", ""),
                "nom": devis.get("nom", ""),
                "email": devis["email"],
                "telephone": devis.get("telephone", ""),
                "projectType": devis.get("project_type", ""),
                "plansChoisis": devis.get("plans_choisis", []),
                "notes": devis.get("notes", ""),
                "fichiers": devis.get("fichiers", []),
                "status": devis["status"],
                "assignedTo": devis.get("assigned_to"),
                "assignedDesigner": devis.get("assigned_to"),
                "priority": devis.get("priority", "normal"),
                "estimatedBudget": devis.get("estimated_budget"),
                "adminNotes": devis.get("admin_notes", ""),
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

@router.put("/admin/devis/{devis_id}", response_model=SuccessResponse)
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
            # « non-assigne » = choix « Non assigné » dans l'admin
            update_fields["assigned_to"] = None if update_data.assigned_designer in ("", "non-assigne") else update_data.assigned_designer

        for field in ("priority", "estimated_budget", "admin_notes"):
            value = getattr(update_data, field)
            if value is not None:
                update_fields[field] = value
            
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