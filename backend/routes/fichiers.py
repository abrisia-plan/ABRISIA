from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, RedirectResponse
from typing import Optional
from urllib.parse import quote
import file_storage

router = APIRouter(tags=["fichiers"])


@router.get("/fichiers/{file_id}")
async def download_file(file_id: str, t: Optional[str] = None):
    """Télécharge un fichier. Un fichier privé exige son jeton secret (?t=...)."""
    doc = await file_storage.get_file_doc(file_id)
    if not doc or not file_storage.token_ok(doc, t):
        raise HTTPException(status_code=404, detail="Fichier introuvable ou lien invalide")

    if doc["backend"] == "r2":
        return RedirectResponse(file_storage.r2_download_url(doc), status_code=302)

    data = await file_storage.read_gridfs(doc)
    headers = {"Content-Disposition": f"inline; filename*=UTF-8''{quote(doc['filename'])}"}
    if doc.get("public"):
        headers["Cache-Control"] = "public, max-age=86400"
    return Response(content=data, media_type=doc["content_type"], headers=headers)
