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
from database import connect_to_mongo, close_mongo_connection
from routes import auth, devis, designers, projects, cms, ecommerce, employees, reviews, content, payments

# Lifespan manager pour la DB
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    logger.info("🚀 Application démarrée")
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

# Inclure le router principal dans l'app
app.include_router(api_router)

# Servir les fichiers statiques (images uploadées)
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Route de santé
@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "ok",
        "message": "Abrisia Plan API is running",
        "version": "1.0.0"
    }

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