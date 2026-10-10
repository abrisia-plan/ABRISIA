"""Stockage permanent des fichiers dans MongoDB (GridFS).

Le disque de Render s'efface à chaque déploiement : tous les fichiers
(pièces jointes des devis, photos, plans à vendre) sont donc gardés
dans la base MongoDB, qui, elle, est permanente.

Chaque fichier reçoit un jeton secret aléatoire : le lien de
téléchargement ne fonctionne qu'avec ce jeton, ce qui garde les
fichiers privés même si quelqu'un devine leur identifiant.
"""
import os
import secrets
import logging
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from database import get_database

logger = logging.getLogger(__name__)

# Adresse publique du backend, utilisée pour fabriquer les liens dans les courriels
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "https://abrisia-plan-ca.onrender.com").rstrip("/")

BUCKET_NAME = "fichiers"


def _bucket() -> AsyncIOMotorGridFSBucket:
    return AsyncIOMotorGridFSBucket(get_database(), bucket_name=BUCKET_NAME)


async def save_file(data: bytes, filename: str, content_type: str, folder: str, **extra) -> dict:
    """Enregistre un fichier et retourne ses informations (id, jeton, nom, taille)."""
    token = secrets.token_urlsafe(24)
    metadata = {"folder": folder, "content_type": content_type, "token": token, **extra}
    file_id = await _bucket().upload_from_stream(filename, data, metadata=metadata)
    return {
        "id": str(file_id),
        "token": token,
        "filename": filename,
        "content_type": content_type,
        "size": len(data),
    }


async def read_file(file_id: str, token: str = None):
    """Lit un fichier. Si un jeton est fourni, il doit correspondre.

    Retourne (contenu, type, nom) ou None si introuvable / jeton invalide.
    """
    if not ObjectId.is_valid(file_id):
        return None
    try:
        stream = await _bucket().open_download_stream(ObjectId(file_id))
    except Exception:
        return None
    metadata = stream.metadata or {}
    if token is not None and not secrets.compare_digest(token, metadata.get("token", "")):
        return None
    data = await stream.read()
    return data, metadata.get("content_type", "application/octet-stream"), stream.filename


async def delete_file(file_id: str) -> bool:
    if not ObjectId.is_valid(file_id):
        return False
    try:
        await _bucket().delete(ObjectId(file_id))
        return True
    except Exception as e:
        logger.warning(f"Suppression du fichier {file_id} impossible: {e}")
        return False


def private_url(file_info: dict) -> str:
    """Lien de téléchargement protégé par le jeton secret du fichier."""
    return f"{BACKEND_PUBLIC_URL}/api/fichiers/{file_info['id']}?t={file_info['token']}"
