from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from urllib.parse import quote
from file_storage import read_file

router = APIRouter(tags=["fichiers"])


@router.get("/fichiers/{file_id}")
async def download_file(file_id: str, t: str):
    """Télécharge un fichier privé. Le lien doit contenir le jeton secret du fichier (?t=...)."""
    result = await read_file(file_id, token=t)
    if result is None:
        raise HTTPException(status_code=404, detail="Fichier introuvable ou lien invalide")
    data, content_type, filename = result
    return Response(
        content=data,
        media_type=content_type,
        headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(filename)}"},
    )
