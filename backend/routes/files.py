from fastapi import APIRouter, UploadFile, File, HTTPException, Response, Query
from fastapi.responses import StreamingResponse
from typing import List
from datetime import datetime, timezone
from database import get_database
from storage_service import upload_file, get_object, init_storage
import uuid
import logging
import io

logger = logging.getLogger(__name__)
router = APIRouter(tags=["files"])

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_files(files: List[UploadFile] = File(...), folder: str = "uploads", linked_to: str = None, linked_type: str = None):
    """Upload un ou plusieurs fichiers vers le stockage permanent"""
    try:
        db = get_database()
        uploaded = []

        for file in files:
            data = await file.read()
            if len(data) > MAX_FILE_SIZE:
                raise HTTPException(status_code=413, detail=f"Fichier {file.filename} trop volumineux (max 50 MB)")

            result = upload_file(data, file.filename, folder=folder)

            file_doc = {
                "id": str(uuid.uuid4()),
                "storage_path": result["storage_path"],
                "original_filename": result["original_filename"],
                "content_type": result["content_type"],
                "size": result["size"],
                "folder": folder,
                "linked_to": linked_to,
                "linked_type": linked_type,
                "is_deleted": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            await db.files.insert_one(file_doc)
            uploaded.append({
                "id": file_doc["id"],
                "storage_path": result["storage_path"],
                "original_filename": result["original_filename"],
                "content_type": result["content_type"],
                "size": result["size"]
            })

        return {"success": True, "files": uploaded}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur upload: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur upload: {str(e)}")


@router.get("/files/{file_path:path}")
async def download_file(file_path: str):
    """Télécharger un fichier depuis le stockage permanent"""
    try:
        db = get_database()
        record = await db.files.find_one({"storage_path": file_path, "is_deleted": False}, {"_id": 0})

        if not record:
            record = await db.files.find_one({"id": file_path, "is_deleted": False}, {"_id": 0})
            if record:
                file_path = record["storage_path"]
            else:
                data, content_type = get_object(file_path)
                return Response(content=data, media_type=content_type)

        data, content_type = get_object(file_path)
        return Response(
            content=data,
            media_type=record.get("content_type", content_type),
            headers={"Content-Disposition": f"inline; filename=\"{record.get('original_filename', 'file')}\""}
        )

    except Exception as e:
        logger.error(f"Erreur téléchargement: {e}")
        raise HTTPException(status_code=404, detail="Fichier non trouvé")


@router.get("/files-by-ref/{linked_type}/{linked_id}")
async def get_files_by_reference(linked_type: str, linked_id: str):
    """Obtenir tous les fichiers liés à une entité (devis, kit, etc.)"""
    try:
        db = get_database()
        files = await db.files.find(
            {"linked_to": linked_id, "linked_type": linked_type, "is_deleted": False},
            {"_id": 0}
        ).to_list(length=100)
        return {"success": True, "files": files}
    except Exception as e:
        logger.error(f"Erreur récupération fichiers: {e}")
        return {"success": True, "files": []}
