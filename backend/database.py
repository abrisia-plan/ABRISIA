from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

# Instance globale
db = Database()

async def connect_to_mongo():
    """Créer connexion à MongoDB"""
    try:
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'abrisia_plan')
        
        logger.info(f"Connexion à MongoDB: {mongo_url}")
        db.client = AsyncIOMotorClient(mongo_url)
        db.database = db.client[db_name]
        
        # Test de connexion
        await db.client.admin.command('ping')
        logger.info("✅ Connexion MongoDB réussie")
        
        # Initialiser les collections et données de base
        await init_collections()
        
    except Exception as e:
        logger.error(f"❌ Erreur connexion MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Fermer connexion MongoDB"""
    if db.client:
        db.client.close()
        logger.info("Connexion MongoDB fermée")

async def init_collections():
    """Initialiser les collections et créer les données de base"""
    try:
        # Créer les index
        await db.database.devis.create_index("email")
        await db.database.devis.create_index("status") 
        await db.database.devis.create_index("created_at")
        
        await db.database.users.create_index("email", unique=True)
        await db.database.projects.create_index("category")
        await db.database.projects.create_index("is_visible")
        
        # Créer utilisateur admin par défaut s'il n'existe pas
        from auth import get_password_hash
        
        existing_admin = await db.database.users.find_one({"email": "admin@abrisia-plan.ca"})
        if not existing_admin:
            admin_user = {
                "email": "admin@abrisia-plan.ca",
                "password": get_password_hash("admin123"),
                "name": "Administrateur Abrisia",
                "role": "admin",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.database.users.insert_one(admin_user)
            logger.info("✅ Utilisateur admin créé")
        
        # Créer projets d'inspiration par défaut
        existing_projects = await db.database.projects.count_documents({})
        if existing_projects == 0:
            projects = [
                {
                    "title": "Mini-maison sur fondations",
                    "category": "Mini-maison",
                    "image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
                    "description": "Habitation compacte 35m² sur fondations permanentes",
                    "details": [
                        "Fondations en béton permanentes",
                        "Isolation supérieure aux normes",
                        "Matériaux locaux québécois", 
                        "Chauffage électrique efficace"
                    ],
                    "dimensions": "6m x 6m sur fondations béton",
                    "is_visible": True,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "title": "Chalet familial quatre saisons",
                    "category": "Chalet",
                    "image": "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
                    "description": "Refuge permanent pour toute la famille",
                    "details": [
                        "3 chambres avec vue sur forêt",
                        "Salon avec foyer en pierre naturelle",
                        "Cuisine en bois massif québécois",
                        "Terrasse couverte orientée sud"
                    ],
                    "dimensions": "12m x 8m, plain-pied sur fondations",
                    "is_visible": True,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                },
                {
                    "title": "Garage avec atelier",
                    "category": "Abris",
                    "image": "https://images.unsplash.com/photo-1549517045-bc93de075e53",
                    "description": "Structure utilitaire multifonction",
                    "details": [
                        "Fondations béton avec drain français",
                        "Espace véhicules + coin atelier",
                        "Éclairage naturel par fenêtres",
                        "Ventilation pour séchage équipements"
                    ],
                    "dimensions": "8m x 6m sur dalle béton",
                    "is_visible": True,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            ]
            await db.database.projects.insert_many(projects)
            logger.info("✅ Projets d'inspiration par défaut créés")
            
        logger.info("✅ Initialisation des collections terminée")
        
    except Exception as e:
        logger.error(f"❌ Erreur initialisation collections: {e}")
        raise

def get_database():
    """Obtenir l'instance de la base de données"""
    return db.database