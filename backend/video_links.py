"""Liens vidéo (YouTube, Vimeo) pour la Collection et les Inspirations.

Les vidéos ne sont pas stockées sur le site : elles sont trop lourdes pour la
base de données. On garde seulement le lien, et la page affiche le lecteur
YouTube ou Vimeo.
"""
import re

_YOUTUBE = re.compile(
    r"^(?:https?://)?(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/|live/)|youtu\.be/)([\w-]{11})"
)
_VIMEO = re.compile(r"^(?:https?://)?(?:www\.|player\.)?vimeo\.com/(?:video/)?(\d+)(?:/([0-9a-f]+))?")


def normalize_video_url(url: str) -> str:
    """Retourne un lien propre, ou '' si ce n'est pas un lien YouTube ou Vimeo."""
    url = (url or "").strip()
    m = _YOUTUBE.match(url)
    if m:
        return f"https://www.youtube.com/watch?v={m.group(1)}"
    m = _VIMEO.match(url)
    if m:
        return f"https://vimeo.com/{m.group(1)}" + (f"/{m.group(2)}" if m.group(2) else "")
    return ""


def clean_videos(urls) -> list:
    """Garde seulement les liens valides, sans doublons, dans l'ordre."""
    out = []
    for u in urls or []:
        n = normalize_video_url(u)
        if n and n not in out:
            out.append(n)
    return out


def invalid_videos(urls) -> list:
    """Liens fournis qui ne sont ni YouTube ni Vimeo."""
    return [u for u in (urls or []) if (u or "").strip() and not normalize_video_url(u)]
