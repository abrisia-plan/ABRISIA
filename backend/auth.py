from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import logging

logger = logging.getLogger(__name__)

# Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "abrisia-secret-key-very-secure-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 jours

# Contexte de chiffrement des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifier un mot de passe"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Erreur vérification mot de passe: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hasher un mot de passe"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Créer un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Vérifier un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        return payload
    except JWTError as e:
        logger.error(f"Erreur JWT: {e}")
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Middleware pour obtenir l'utilisateur courant"""
    from .database import get_database
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_email = payload.get("email")
        
        if not user_email:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        # Récupérer l'utilisateur depuis la DB
        db = get_database()
        user = await db.users.find_one({"email": user_email})
        
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user["role"]
        }
        
    except Exception as e:
        logger.error(f"Erreur authentification: {e}")
        raise HTTPException(status_code=401, detail="Non autorisé")

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Middleware pour les routes admin seulement"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return current_user