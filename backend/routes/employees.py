from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from models import (
    User, UserCreate, UserUpdate, UserResponse,
    SuccessResponse, ListResponse, PaginatedResponse
)
from database import get_database
from auth import get_current_user, require_admin, get_password_hash
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/employees", tags=["employees"])

# ========== INSCRIPTION EMPLOYÉ ==========

@router.post("/register", response_model=SuccessResponse)
async def employee_register(user_data: UserCreate):
    """Inscription employé (designer, constructor, employee)"""
    try:
        db = get_database()
        
        # Vérifier si l'email existe déjà
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà"
            )
        
        # Vérifier le rôle autorisé
        allowed_roles = ["designer", "constructor", "employee", "pending"]
        if user_data.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rôle invalide. Rôles autorisés: {', '.join(allowed_roles)}"
            )
        
        # Créer l'employé
        employee_doc = {
            "email": user_data.email,
            "password": get_password_hash(user_data.password),
            "name": user_data.name,
            "role": user_data.role,
            "is_active": True,
            "is_approved": False,  # En attente d'approbation admin
            "phone": user_data.phone,
            "company": user_data.company,
            "specialties": user_data.specialties,
            "profile_image": None,
            "bio": "",
            "social_links": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(employee_doc)
        
        # Créer notification pour admin
        admin_notification = {
            "user_id": "admin",
            "title": "Nouvelle demande d'employé",
            "message": f"{user_data.name} ({user_data.role}) souhaite rejoindre l'équipe",
            "type": "info",
            "is_read": False,
            "action_url": f"/admin/employees/{str(result.inserted_id)}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.notifications.insert_one(admin_notification)
        
        logger.info(f"✅ Nouveau employé inscrit: {user_data.name} ({user_data.role})")
        
        return SuccessResponse(
            success=True,
            message="Inscription réussie ! Votre compte sera activé après validation par l'administrateur."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur inscription employé: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'inscription"
        )

# ========== PROFIL EMPLOYÉ ==========

@router.get("/profile", response_model=UserResponse)
async def get_employee_profile(current_user: dict = Depends(get_current_user)):
    """Obtenir le profil de l'employé connecté"""
    try:
        db = get_database()
        
        # Récupérer les données complètes depuis la DB
        user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
        
        if not user:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
        
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"],
            is_active=user.get("is_active", True),
            is_approved=user.get("is_approved", False),
            phone=user.get("phone"),
            company=user.get("company"),
            specialties=user.get("specialties", []),
            bio=user.get("bio", "")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération profil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du profil"
        )

@router.put("/profile", response_model=SuccessResponse)
async def update_employee_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le profil de l'employé"""
    try:
        db = get_database()
        
        # Préparer les champs modifiables par l'employé
        allowed_fields = ["name", "phone", "company", "specialties", "bio"]
        update_fields = {"updated_at": datetime.utcnow()}
        
        for field, value in update_data.dict(exclude_unset=True).items():
            if field in allowed_fields and value is not None:
                update_fields[field] = value
        
        result = await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Profil non trouvé")
        
        logger.info(f"✅ Profil mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Profil mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour profil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du profil"
        )

# ========== PROJETS ASSIGNÉS À L'EMPLOYÉ ==========

@router.get("/my-projects")
async def get_employee_projects(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtenir les projets assignés à l'employé connecté"""
    try:
        db = get_database()
        
        # Construire le filtre selon le rôle
        filter_query = {"assigned_to": current_user["name"]}
        
        # Filtre par statut si spécifié
        if status_filter:
            filter_query["status"] = status_filter
        
        # Récupérer les projets
        projects = await db.devis.find(filter_query).sort("created_at", -1).to_list(length=None)
        
        formatted_projects = []
        for project in projects:
            formatted_projects.append({
                "id": str(project["_id"]),
                "clientName": project["nom"],
                "clientEmail": project["email"],
                "clientPhone": project.get("telephone", ""),
                "projectType": project["project_type"],
                "plansChoisis": project["plans_choisis"],
                "description": project["notes"],
                "status": project["status"],
                "priority": project.get("priority", "normal"),
                "assignedDesigner": project.get("assigned_to"),
                "assignedConstructor": project.get("assigned_to"),
                "startDate": project.get("start_date"),
                "estimatedBudget": project.get("estimated_budget"),
                "actualBudget": project.get("actual_budget"),
                "progressNotes": project.get("progress_notes", []),
                "constructionPhotos": project.get("construction_photos", []),
                "createdAt": project["created_at"].isoformat(),
                "updatedAt": project["updated_at"].isoformat()
            })
        
        return {
            "success": True,
            "projects": formatted_projects,
            "total": len(formatted_projects)
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération projets employé: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des projets"
        )

@router.post("/projects/{project_id}/update-status")
async def update_project_status(
    project_id: str,
    status: str,
    note: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour le statut d'un projet (employé)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="ID projet invalide")
        
        # Vérifier que l'employé a accès à ce projet
        project = await db.devis.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        # Vérifier les permissions
        has_access = False
        if current_user["role"] == "designer" and project.get("assigned_to") == current_user["name"]:
            has_access = True
        elif current_user["role"] == "constructor" and project.get("assigned_to") == current_user["name"]:
            has_access = True
        elif current_user["role"] == "admin":
            has_access = True
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas accès à ce projet"
            )
        
        # Statuts autorisés selon le rôle
        allowed_statuses = {
            "designer": ["En cours", "Plans terminés", "En attente validation"],
            "constructor": ["En construction", "En pause", "Terminé"],
            "admin": ["En attente", "En cours", "En construction", "Terminé", "Rejeté"]
        }
        
        if status not in allowed_statuses.get(current_user["role"], []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Statut non autorisé pour votre rôle"
            )
        
        # Préparer la mise à jour
        update_fields = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        # Ajouter une note de progression si fournie
        if note:
            progress_note = {
                "note": note,
                "added_by": current_user["name"],
                "added_at": datetime.utcnow(),
                "note_type": "status_update"
            }
            
            # Ajouter à la liste des notes de progression
            await db.devis.update_one(
                {"_id": ObjectId(project_id)},
                {"$push": {"progress_notes": progress_note}}
            )
        
        # Mettre à jour le statut
        result = await db.devis.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": update_fields}
        )
        
        logger.info(f"✅ Statut projet {project_id} mis à jour vers '{status}' par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Statut du projet mis à jour vers '{status}' avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour statut projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour du statut"
        )

@router.post("/projects/{project_id}/add-note")
async def add_project_note(
    project_id: str,
    note: str,
    note_type: str = "general",
    current_user: dict = Depends(get_current_user)
):
    """Ajouter une note à un projet (employé)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="ID projet invalide")
        
        # Vérifier l'accès au projet
        project = await db.devis.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        # Vérifier les permissions (même logique que update_status)
        has_access = False
        if current_user["role"] == "designer" and project.get("assigned_to") == current_user["name"]:
            has_access = True
        elif current_user["role"] == "constructor" and project.get("assigned_to") == current_user["name"]:
            has_access = True
        elif current_user["role"] == "admin":
            has_access = True
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas accès à ce projet"
            )
        
        # Créer la note
        progress_note = {
            "note": note,
            "added_by": current_user["name"],
            "added_at": datetime.utcnow(),
            "note_type": note_type  # "general", "technical", "issue", "milestone"
        }
        
        # Ajouter la note au projet
        result = await db.devis.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$push": {"progress_notes": progress_note},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        logger.info(f"✅ Note ajoutée au projet {project_id} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Note ajoutée avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur ajout note projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'ajout de la note"
        )

# ========== UPLOAD PHOTOS DE CHANTIER ==========

@router.post("/projects/{project_id}/upload-photo")
async def upload_construction_photo(
    project_id: str,
    photo_url: str,
    description: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Ajouter une photo de chantier à un projet (employé)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="ID projet invalide")
        
        # Vérifier l'accès au projet
        project = await db.devis.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        # Vérifier les permissions
        has_access = False
        if current_user["role"] in ["constructor", "designer"] and project.get("assigned_to") == current_user["name"]:
            has_access = True
        elif current_user["role"] == "admin":
            has_access = True
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas accès à ce projet"
            )
        
        # Créer l'objet photo
        photo_data = {
            "url": photo_url,
            "description": description or "",
            "uploaded_by": current_user["name"],
            "uploaded_at": datetime.utcnow()
        }
        
        # Ajouter la photo au projet
        result = await db.devis.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$push": {"construction_photos": photo_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Projet non trouvé")
        
        logger.info(f"✅ Photo ajoutée au projet {project_id} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Photo ajoutée avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur upload photo projet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'upload de la photo"
        )

# ========== STATISTIQUES EMPLOYÉ ==========

@router.get("/stats")
async def get_employee_stats(current_user: dict = Depends(get_current_user)):
    """Obtenir les statistiques de l'employé"""
    try:
        db = get_database()
        
        # Construire le filtre selon le rôle
        filter_query = {"assigned_to": current_user["name"]}
        
        # Compter les projets par statut
        total_projects = await db.devis.count_documents(filter_query)
        
        active_projects = await db.devis.count_documents({
            **filter_query,
            "status": {"$in": ["En cours", "En construction"]}
        })
        
        completed_projects = await db.devis.count_documents({
            **filter_query,
            "status": "Terminé"
        })
        
        # Projets du mois
        this_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        projects_this_month = await db.devis.count_documents({
            **filter_query,
            "created_at": {"$gte": this_month_start}
        })
        
        return {
            "success": True,
            "stats": {
                "totalProjects": total_projects,
                "activeProjects": active_projects,
                "completedProjects": completed_projects,
                "projectsThisMonth": projects_this_month,
                "role": current_user["role"],
                "employeeName": current_user["name"]
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur statistiques employé: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des statistiques"
        )

# ========== GESTION ADMIN DES EMPLOYÉS ==========

@router.get("/admin/list", response_model=ListResponse)
async def get_all_employees(
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les employés (admin seulement)"""
    try:
        db = get_database()
        
        # Construire le filtre (exclure les admins et clients)
        filter_query = {"role": {"$in": ["designer", "constructor", "employee", "pending"]}}
        
        if role:
            filter_query["role"] = role
        if status == "pending":
            filter_query["is_approved"] = False
        elif status == "approved":
            filter_query["is_approved"] = True
        elif status == "active":
            filter_query["is_active"] = True
        elif status == "inactive":
            filter_query["is_active"] = False
        
        employees = await db.users.find(filter_query).sort("created_at", -1).to_list(length=None)
        
        formatted_employees = []
        for employee in employees:
            # Compter les projets assignés
            projects_count = await db.devis.count_documents({
                "assigned_to": employee["name"]
            })
            
            formatted_employees.append({
                "id": str(employee["_id"]),
                "name": employee["name"],
                "email": employee["email"],
                "role": employee["role"],
                "isActive": employee.get("is_active", True),
                "isApproved": employee.get("is_approved", False),
                "phone": employee.get("phone"),
                "company": employee.get("company"),
                "specialties": employee.get("specialties", []),
                "bio": employee.get("bio", ""),
                "projectsCount": projects_count,
                "createdAt": employee["created_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_employees,
            total=len(formatted_employees)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération employés: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des employés"
        )

@router.put("/admin/{employee_id}/approve", response_model=SuccessResponse)
async def approve_employee(
    employee_id: str,
    current_user: dict = Depends(require_admin)
):
    """Approuver un employé (admin seulement)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(employee_id):
            raise HTTPException(status_code=400, detail="ID employé invalide")
        
        result = await db.users.update_one(
            {"_id": ObjectId(employee_id)},
            {"$set": {
                "is_approved": True,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employé non trouvé")
        
        # Créer notification pour l'employé
        employee = await db.users.find_one({"_id": ObjectId(employee_id)})
        if employee:
            notification = {
                "user_id": str(employee["_id"]),
                "title": "Compte approuvé !",
                "message": "Votre compte employé a été approuvé. Vous pouvez maintenant accéder à vos projets.",
                "type": "success",
                "is_read": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.notifications.insert_one(notification)
        
        logger.info(f"✅ Employé {employee_id} approuvé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Employé approuvé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur approbation employé: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'approbation de l'employé"
        )


# ========== CANDIDATURES (CV) ==========

from fastapi import UploadFile, File, Form
import base64

@router.post("/candidature")
async def submit_candidature(
    nom: str = Form(...),
    email: str = Form(...),
    telephone: str = Form(""),
    message: str = Form(""),
    cv: UploadFile = File(...)
):
    """Soumettre une candidature avec CV"""
    try:
        db = get_database()
        
        # Lire le fichier CV
        cv_content = await cv.read()
        cv_base64 = base64.b64encode(cv_content).decode('utf-8')
        
        candidature = {
            "nom": nom,
            "email": email,
            "telephone": telephone,
            "message": message,
            "cv_filename": cv.filename,
            "cv_content_type": cv.content_type,
            "cv_base64": cv_base64,
            "cv_size": len(cv_content),
            "status": "nouvelle",
            "created_at": datetime.utcnow().isoformat(),
        }
        
        result = await db.candidatures.insert_one(candidature)
        
        # Envoyer notification par courriel
        try:
            from services.email_service import send_email_notification
            await send_email_notification(
                subject=f"Nouvelle candidature - {nom}",
                body=f"""
                <h2>Nouvelle candidature reçue</h2>
                <p><strong>Nom:</strong> {nom}</p>
                <p><strong>Courriel:</strong> {email}</p>
                <p><strong>Téléphone:</strong> {telephone}</p>
                <p><strong>Message:</strong> {message}</p>
                <p><strong>CV:</strong> {cv.filename}</p>
                <br>
                <p>Consultez le panneau admin pour voir le CV complet.</p>
                """,
            )
        except Exception as email_err:
            logger.warning(f"Email notification failed: {email_err}")
        
        return {"success": True, "message": "Candidature envoyée avec succès"}
    except Exception as e:
        logger.error(f"Erreur candidature: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi de la candidature")


@router.get("/admin/candidatures")
async def get_candidatures(current_user: dict = Depends(require_admin)):
    """Obtenir toutes les candidatures (admin)"""
    try:
        db = get_database()
        candidatures = []
        async for c in db.candidatures.find().sort("created_at", -1):
            candidatures.append({
                "id": str(c["_id"]),
                "nom": c.get("nom"),
                "email": c.get("email"),
                "telephone": c.get("telephone"),
                "message": c.get("message"),
                "cv_filename": c.get("cv_filename"),
                "cv_size": c.get("cv_size", 0),
                "status": c.get("status", "nouvelle"),
                "created_at": c.get("created_at"),
            })
        return {"success": True, "data": candidatures, "total": len(candidatures)}
    except Exception as e:
        logger.error(f"Erreur liste candidatures: {e}")
        raise HTTPException(status_code=500, detail="Erreur")


@router.get("/admin/candidatures/{candidature_id}/cv")
async def download_cv(candidature_id: str, current_user: dict = Depends(require_admin)):
    """Télécharger le CV d'une candidature"""
    try:
        from fastapi.responses import Response
        db = get_database()
        c = await db.candidatures.find_one({"_id": ObjectId(candidature_id)})
        if not c:
            raise HTTPException(status_code=404, detail="Candidature non trouvée")
        
        cv_bytes = base64.b64decode(c["cv_base64"])
        return Response(
            content=cv_bytes,
            media_type=c.get("cv_content_type", "application/pdf"),
            headers={"Content-Disposition": f'attachment; filename="{c.get("cv_filename", "cv.pdf")}"'}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur download CV: {e}")
        raise HTTPException(status_code=500, detail="Erreur")


@router.put("/admin/candidatures/{candidature_id}/status")
async def update_candidature_status(candidature_id: str, data: dict, current_user: dict = Depends(require_admin)):
    """Mettre à jour le statut d'une candidature"""
    try:
        db = get_database()
        await db.candidatures.update_one(
            {"_id": ObjectId(candidature_id)},
            {"$set": {"status": data.get("status", "nouvelle")}}
        )
        return {"success": True, "message": "Statut mis à jour"}
    except Exception as e:
        logger.error(f"Erreur update candidature: {e}")
        raise HTTPException(status_code=500, detail="Erreur")
