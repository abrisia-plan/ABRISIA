from fastapi import APIRouter, HTTPException, status
from models import UserLogin, LoginResponse, UserResponse, SuccessResponse
from database import get_database
from auth import verify_password, create_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: UserLogin):
    """Connexion utilisateur"""
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
        
        # Créer le token
        access_token = create_access_token(
            data={"sub": str(user["_id"]), "email": user["email"]}
        )
        
        user_response = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"]
        )
        
        logger.info(f"✅ Connexion réussie pour: {user_credentials.email}")
        
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

@router.post("/logout", response_model=SuccessResponse)
async def logout():
    """Déconnexion utilisateur (côté client principalement)"""
    return SuccessResponse(
        success=True,
        message="Déconnexion réussie"
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = None):
    """Obtenir les informations de l'utilisateur connecté"""
    # Cette route sera utilisée pour vérifier la validité du token
    from ..auth import get_current_user
    if not current_user:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"], 
        name=current_user["name"],
        role=current_user["role"]
    )