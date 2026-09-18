from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Imports des modules
from database import connect_to_mongo, close_mongo_connection, get_database
from routes import auth, devis, designers, projects, cms, ecommerce, employees, reviews, content, payments, collection, chatbot, zoho
from object_storage import init_storage

# Lifespan manager pour la DB
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    try:
        init_storage()
    except Exception as e:
        logger.warning(f"Object storage init failed (will retry on first upload): {e}")
    logger.info("Application demarree")
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("🛑 Application arrêtée")

# Créer l'application FastAPI
app = FastAPI(
    title="Abrisia Plan API",
    description="API pour le site web Abrisia Plan - Services de dessin architectural",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Créer le router principal avec préfixe /api
api_router = APIRouter(prefix="/api")

# Routes d'authentification
api_router.include_router(auth.router)

# Routes des devis
api_router.include_router(devis.router)

# Routes des dessinateurs
api_router.include_router(designers.router)

# Routes des projets
api_router.include_router(projects.router)

# Routes CMS (Content Management System)
api_router.include_router(cms.router)

# Routes navigation publique
api_router.include_router(cms.public_router)

# Routes e-commerce
api_router.include_router(ecommerce.router)

# Routes employés
api_router.include_router(employees.router)

# Routes avis/reviews
api_router.include_router(reviews.router)

# Routes contenu/CMS
api_router.include_router(content.router)

# Routes paiements Stripe
api_router.include_router(payments.router)
api_router.include_router(collection.router, prefix="/collection")

# Routes chatbot IA
api_router.include_router(chatbot.router, prefix="/chatbot")

# Routes Zoho CRM
api_router.include_router(zoho.router, prefix="/zoho")

# Inclure le router principal dans l'app
app.include_router(api_router)

# Servir les fichiers statiques (images uploadées - rétrocompatibilité)
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Endpoint pour servir les fichiers depuis Emergent Object Storage
from fastapi.responses import Response as FastAPIResponse
from object_storage import get_object as storage_get_object

@app.get("/api/files/{filename}")
async def serve_file(filename: str):
    """Sert un fichier depuis le cloud storage, avec fallback local"""
    # D'abord essayer le cloud storage
    for prefix in ["abrisia-plan/images/", "abrisia-plan/media/"]:
        try:
            data, content_type = storage_get_object(f"{prefix}{filename}")
            return FastAPIResponse(content=data, media_type=content_type)
        except Exception:
            continue
    
    # Fallback: fichier local
    local_path = uploads_dir / filename
    if local_path.exists():
        import mimetypes
        mime = mimetypes.guess_type(str(local_path))[0] or "application/octet-stream"
        return FastAPIResponse(content=local_path.read_bytes(), media_type=mime)
    
    from fastapi import HTTPException as HTTPExc
    raise HTTPExc(status_code=404, detail="Fichier non trouvé")

# Route de santé
@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "ok",
        "message": "Abrisia Plan API is running",
        "version": "1.0.0"
    }

# Sitemap dynamique
@app.get("/api/sitemap.xml")
async def dynamic_sitemap():
    """Générer un sitemap XML dynamique avec tous les kits actifs"""
    from datetime import datetime
    db = get_database()
    
    static_pages = [
        {"loc": "/", "changefreq": "weekly", "priority": "1.0"},
        {"loc": "/collection", "changefreq": "weekly", "priority": "0.9"},
        {"loc": "/devis", "changefreq": "monthly", "priority": "0.9"},
        {"loc": "/inspiration", "changefreq": "weekly", "priority": "0.8"},
        {"loc": "/about", "changefreq": "monthly", "priority": "0.7"},
        {"loc": "/contact", "changefreq": "monthly", "priority": "0.7"},
        {"loc": "/temoignage", "changefreq": "weekly", "priority": "0.6"},
        {"loc": "/feedback", "changefreq": "monthly", "priority": "0.5"},
        {"loc": "/mentions-legales", "changefreq": "yearly", "priority": "0.3"},
        {"loc": "/politique-confidentialite", "changefreq": "yearly", "priority": "0.3"},
    ]
    
    base_url = "https://abrisia-plan.ca"
    today = datetime.now().strftime("%Y-%m-%d")
    
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for page in static_pages:
        xml += f'  <url>\n'
        xml += f'    <loc>{base_url}{page["loc"]}</loc>\n'
        xml += f'    <lastmod>{today}</lastmod>\n'
        xml += f'    <changefreq>{page["changefreq"]}</changefreq>\n'
        xml += f'    <priority>{page["priority"]}</priority>\n'
        xml += f'  </url>\n'
    
    # Ajouter les kits dynamiquement
    try:
        products = await db.products.find(
            {"is_active": True}, 
            {"slug": 1, "updated_at": 1}
        ).to_list(length=500)
        
        for product in products:
            slug = product.get("slug", "")
            if slug:
                updated = product.get("updated_at", today)
                if hasattr(updated, 'strftime'):
                    updated = updated.strftime("%Y-%m-%d")
                xml += f'  <url>\n'
                xml += f'    <loc>{base_url}/collection?product={slug}</loc>\n'
                xml += f'    <lastmod>{updated}</lastmod>\n'
                xml += f'    <changefreq>monthly</changefreq>\n'
                xml += f'    <priority>0.8</priority>\n'
                xml += f'  </url>\n'
    except Exception:
        pass
    
    xml += '</urlset>'
    
    return FastAPIResponse(content=xml, media_type="application/xml")

# Route racine de l'API
@app.get("/api")
@app.get("/api/")
async def api_root():
    """Route racine de l'API"""
    return {
        "message": "Bienvenue sur l'API Abrisia Plan",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Gestion des erreurs globales
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erreur non gérée: {exc}")
    return {
        "success": False,
        "message": "Une erreur interne s'est produite",
        "detail": str(exc) if os.getenv("DEBUG") else "Erreur interne"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )