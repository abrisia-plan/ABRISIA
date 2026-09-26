from fastapi import APIRouter, HTTPException, Depends, status, Request
from models import (
    UserLogin, UserRegister, UserResponse, LoginResponse, 
    SuccessResponse, ListResponse, UserUpdate
)
from database import get_database
from auth import verify_password, create_access_token, get_password_hash, require_admin, get_current_user
from bson import ObjectId
from datetime import datetime
from collections import defaultdict
import time
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

# Simple in-memory rate limiter for login
_login_attempts = defaultdict(list)
_MAX_ATTEMPTS = 10
_WINDOW_SECONDS = 300  # 5 minutes

def _check_rate_limit(ip: str):
    now = time.time()
    _login_attempts[ip] = [t for t in _login_attempts[ip] if now - t < _WINDOW_SECONDS]
    if len(_login_attempts[ip]) >= _MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Trop de tentatives. Réessayez dans quelques minutes.")
    _login_attempts[ip].append(now)

@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin, request: Request):
    """Connexion utilisateur (tous rôles)"""
    _check_rate_limit(request.client.host if request.client else "unknown")
    try:
        db = get_database()
        
        # Chercher l'utilisateur
        user = await db.users.find_one({"email": user_credentials.email})
        
        if not user:
            logger.warning(f"Tentative de connexion avec email inexistant: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        # Vérifier le mot de passe
        if not verify_password(user_credentials.password, user["password"]):
            logger.warning(f"Mot de passe incorrect pour: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )
        
        # Vérifier si l'utilisateur est actif
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte désactivé. Contactez l'administrateur."
            )
        
        # Vérifier si l'utilisateur est approuvé (sauf admin)
        if user.get("role") != "admin" and not user.get("is_approved", False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Compte en attente d'approbation. Vous serez notifié une fois approuvé."
            )
        
        # Créer le token
        access_token = create_access_token(
            data={"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
        )
        
        user_response = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"],
            is_active=user.get("is_active", True),
            is_approved=user.get("is_approved", False),
            phone=user.get("phone"),
            company=user.get("company"),
            specialties=user.get("specialties", [])
        )
        
        logger.info(f"✅ Connexion réussie pour: {user_credentials.email} ({user['role']})")
        
        return LoginResponse(
            success=True,
            token=access_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de la connexion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur interne du serveur"
        )

@router.post("/register", response_model=SuccessResponse)
async def register(user_data: UserRegister):
    """Inscription nouveau utilisateur (designer/constructor)"""
    try:
        db = get_database()
        
        # Vérifier si l'email existe déjà
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà"
            )
        
        # Vérifier que les mots de passe correspondent
        if user_data.password != user_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Les mots de passe ne correspondent pas"
            )
        
        # Vérifier le rôle
        if user_data.role not in ["designer", "constructor"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rôle invalide. Seuls 'designer' et 'constructor' sont autorisés."
            )
        
        # Créer l'utilisateur
        user_doc = {
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
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.users.insert_one(user_doc)
        
        # Créer une notification pour l'admin
        admin_notification = {
            "user_id": "admin",  # Sera associé à tous les admins
            "title": "Nouvelle demande d'inscription",
            "message": f"{user_data.name} ({user_data.role}) souhaite rejoindre l'équipe",
            "type": "info",
            "is_read": False,
            "action_url": f"/admin/users/{str(result.inserted_id)}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.notifications.insert_one(admin_notification)
        
        logger.info(f"✅ Nouvelle inscription: {user_data.name} ({user_data.role}) - {user_data.email}")
        
        return SuccessResponse(
            success=True,
            message="Inscription réussie ! Votre compte sera activé après validation par l'administrateur."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'inscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'inscription"
        )

@router.post("/logout", response_model=SuccessResponse)
async def logout():
    """Déconnexion utilisateur (côté client principalement)"""
    return SuccessResponse(
        success=True,
        message="Déconnexion réussie"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Obtenir les informations de l'utilisateur connecté"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"], 
        name=current_user["name"],
        role=current_user["role"],
        is_active=current_user.get("is_active", True),
        is_approved=current_user.get("is_approved", False),
        phone=current_user.get("phone"),
        company=current_user.get("company"),
        specialties=current_user.get("specialties", [])
    )

# ========== ROUTES ADMIN - GESTION DES UTILISATEURS ==========

@router.get("/admin/users", response_model=ListResponse)
async def get_all_users(
    role: str = None,
    status: str = None,  # "pending", "approved", "active", "inactive"
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les utilisateurs (admin seulement)"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {"role": {"$ne": "admin"}}  # Exclure les autres admins
        
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
        
        users = await db.users.find(filter_query).sort("created_at", -1).to_list(length=None)
        
        formatted_users = []
        for user in users:
            formatted_users.append({
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "isActive": user.get("is_active", True),
                "isApproved": user.get("is_approved", False),
                "phone": user.get("phone"),
                "company": user.get("company"),
                "specialties": user.get("specialties", []),
                "createdAt": user["created_at"].isoformat()
            })
        
        return ListResponse(
            success=True,
            data=formatted_users,
            total=len(formatted_users)
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération utilisateurs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des utilisateurs"
        )

@router.put("/admin/users/{user_id}", response_model=SuccessResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un utilisateur (admin seulement)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="ID utilisateur invalide")
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                update_fields[field] = value
        
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Si l'utilisateur est approuvé, créer une notification
        if update_data.is_approved:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                notification = {
                    "user_id": str(user["_id"]),
                    "title": "Compte approuvé !",
                    "message": "Votre compte a été approuvé par l'administrateur. Vous pouvez maintenant vous connecter.",
                    "type": "success",
                    "is_read": False,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                await db.notifications.insert_one(notification)
        
        logger.info(f"✅ Utilisateur {user_id} mis à jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Utilisateur mis à jour avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour utilisateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour de l'utilisateur"
        )

@router.delete("/admin/users/{user_id}", response_model=SuccessResponse)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """Supprimer un utilisateur (admin seulement)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="ID utilisateur invalide")
        
        # Vérifier que ce n'est pas un admin
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        if user.get("role") == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer un administrateur"
            )
        
        # Vérifier si l'utilisateur a des projets en cours
        active_projects = await db.devis.count_documents({
            "$or": [
                {"assigned_designer": user["name"]},
                {"assigned_constructor": user["name"]}
            ],
            "status": {"$in": ["En cours", "En construction"]}
        })
        
        if active_projects > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer un utilisateur avec des projets en cours"
            )
        
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        
        logger.info(f"✅ Utilisateur {user_id} supprimé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Utilisateur supprimé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression utilisateur: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression de l'utilisateur"
        )