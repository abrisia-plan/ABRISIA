"""Stockage permanent des fichiers (pièces jointes, photos, plans à vendre).

Le disque de Render s'efface à chaque déploiement, donc les fichiers sont
gardés ailleurs :
- Cloudflare R2, si les variables R2_* sont configurées (gros fichiers, 10 Go gratuits);
- sinon MongoDB (GridFS), limité à 10 Mo par fichier (base gratuite de 512 Mo).

Chaque fichier a une fiche dans la collection `stored_files` avec un jeton
secret. Un fichier privé ne se télécharge qu'avec ce jeton (ou par un admin);
un fichier public (photo du site) se télécharge sans jeton.
"""
import os
import secrets
import logging
from datetime import datetime, timezone
from urllib.parse import quote
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from starlette.concurrency import run_in_threadpool
from database import get_database

logger = logging.getLogger(__name__)

# Adresse publique du backend, utilisée pour fabriquer les liens dans les courriels
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "https://abrisia-plan-ca.onrender.com").rstrip("/")

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET = os.getenv("R2_BUCKET", "")
USE_R2 = all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET])

# Taille maximale d'un fichier selon le stockage disponible
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "100" if USE_R2 else "10"))
MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024

GRIDFS_BUCKET = "fichiers"
_r2_client = None


class FileTooLarge(Exception):
    pass


def _r2():
    global _r2_client
    if _r2_client is None:
        import boto3
        _r2_client = boto3.client(
            "s3",
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            region_name="auto",
        )
    return _r2_client


def _gridfs() -> AsyncIOMotorGridFSBucket:
    return AsyncIOMotorGridFSBucket(get_database(), bucket_name=GRIDFS_BUCKET)


def file_size(fileobj) -> int:
    fileobj.seek(0, os.SEEK_END)
    size = fileobj.tell()
    fileobj.seek(0)
    return size


async def save_file(fileobj, filename: str, content_type: str, folder: str, public: bool = False, **extra) -> dict:
    """Enregistre un fichier (objet fichier ou bytes) et retourne sa fiche.

    Lève FileTooLarge si le fichier dépasse MAX_FILE_SIZE.
    """
    if isinstance(fileobj, (bytes, bytearray)):
        import io
        fileobj = io.BytesIO(fileobj)
    size = file_size(fileobj)
    if size > MAX_FILE_SIZE:
        raise FileTooLarge(filename)

    file_id = ObjectId()
    filename = os.path.basename(filename or "fichier")
    content_type = content_type or "application/octet-stream"

    if USE_R2:
        key = f"{folder}/{file_id}/{filename}"
        await run_in_threadpool(
            _r2().upload_fileobj, fileobj, R2_BUCKET, key, ExtraArgs={"ContentType": content_type}
        )
        backend = "r2"
    else:
        key = str(file_id)
        await _gridfs().upload_from_stream_with_id(file_id, filename, fileobj.read())
        backend = "gridfs"

    doc = {
        "_id": file_id,
        "backend": backend,
        "key": key,
        "filename": filename,
        "content_type": content_type,
        "size": size,
        "folder": folder,
        "public": public,
        "token": secrets.token_urlsafe(24),
        "created_at": datetime.now(timezone.utc),
        **extra,
    }
    await get_database().stored_files.insert_one(doc)
    return file_info(doc)


def file_info(doc: dict) -> dict:
    """Informations utiles d'un fichier, avec son lien de téléchargement."""
    url = f"{BACKEND_PUBLIC_URL}/api/fichiers/{doc['_id']}"
    if not doc.get("public"):
        url += f"?t={doc['token']}"
    return {
        "id": str(doc["_id"]),
        "filename": doc["filename"],
        "content_type": doc["content_type"],
        "size": doc["size"],
        "public": doc.get("public", False),
        "url": url,
    }


async def get_file_doc(file_id: str):
    if not ObjectId.is_valid(file_id):
        return None
    return await get_database().stored_files.find_one({"_id": ObjectId(file_id)})


def token_ok(doc: dict, token) -> bool:
    if doc.get("public"):
        return True
    return bool(token) and secrets.compare_digest(str(token), doc.get("token", ""))


def r2_download_url(doc: dict, expires: int = 3600) -> str:
    """Lien temporaire vers le fichier chez R2 (le fichier ne transite pas par Render)."""
    return _r2().generate_presigned_url(
        "get_object",
        Params={
            "Bucket": R2_BUCKET,
            "Key": doc["key"],
            "ResponseContentType": doc["content_type"],
            "ResponseContentDisposition": f"inline; filename*=UTF-8''{quote(doc['filename'])}",
        },
        ExpiresIn=expires,
    )


async def read_gridfs(doc: dict) -> bytes:
    stream = await _gridfs().open_download_stream(doc["_id"])
    return await stream.read()


async def delete_file(file_id: str) -> bool:
    doc = await get_file_doc(file_id)
    if not doc:
        return False
    try:
        if doc["backend"] == "r2":
            await run_in_threadpool(_r2().delete_object, Bucket=R2_BUCKET, Key=doc["key"])
        else:
            await _gridfs().delete(doc["_id"])
    except Exception as e:
        logger.warning(f"Suppression du fichier {file_id} impossible: {e}")
    await get_database().stored_files.delete_one({"_id": doc["_id"]})
    return True
