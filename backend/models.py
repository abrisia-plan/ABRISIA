from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import uuid

# Helper pour ObjectId
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

# Modèles de base
class BaseDocument(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modèles User/Auth - SYSTÈME MULTI-RÔLES
class User(BaseDocument):
    email: EmailStr
    password: str  # hashé
    name: str
    role: str  # "admin", "designer", "constructor", "pending"
    is_active: bool = True
    is_approved: bool = False  # Validation admin requise
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []
    profile_image: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "pending"  # Par défaut en attente
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    role: str  # "designer" ou "constructor"
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    is_approved: bool
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    role: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

# Modèles Devis - ENRICHI POUR MULTI-RÔLES
class Devis(BaseDocument):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    project_type: str
    plans_choisis: List[str]
    notes: str
    status: str = "En attente"  # "En attente", "En cours", "En construction", "Terminé", "Rejeté"
    assigned_designer: Optional[str] = None
    assigned_constructor: Optional[str] = None
    priority: str = "normal"  # "low", "normal", "high", "urgent"
    estimated_budget: Optional[str] = None
    actual_budget: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    progress_notes: List[dict] = []  # Notes de progression
    construction_photos: List[str] = []  # Photos de chantier

class DevisCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    projectType: str
    plansChoisis: List[str]
    notes: str

class DevisUpdate(BaseModel):
    status: Optional[str] = None
    assigned_designer: Optional[str] = None
    assigned_constructor: Optional[str] = None
    priority: Optional[str] = None
    estimated_budget: Optional[str] = None
    actual_budget: Optional[str] = None
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None

class ProgressNote(BaseModel):
    note: str
    added_by: str
    note_type: str = "general"  # "general", "technical", "issue", "milestone"

class DevisResponse(BaseModel):
    success: bool
    message: str
    devis: Optional[dict] = None

# Modèles Designer/Constructor - FUSIONNÉ EN USER
class TeamMember(BaseDocument):
    user_id: str  # Référence vers User
    specialties: List[str]
    active_projects: int = 0
    completed_projects: int = 0
    rating: float = 0.0
    availability: str = "available"  # "available", "busy", "unavailable"

# Modèles Project/Inspiration - ENRICHI
class Project(BaseDocument):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True
    project_status: str = "completed"  # "planning", "in_progress", "completed"
    created_by: Optional[str] = None
    assigned_team: List[str] = []  # IDs des membres assignés
    budget_range: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    client_testimonial: Optional[str] = None

class ProjectCreate(BaseModel):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True
    project_status: str = "completed"
    budget_range: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    details: Optional[List[str]] = None
    dimensions: Optional[str] = None
    is_visible: Optional[bool] = None
    project_status: Optional[str] = None
    budget_range: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None

# Modèles CMS (Content Management System)
class SiteContent(BaseDocument):
    key: str  # Identifiant unique du contenu
    value: str  # Valeur du contenu
    type: str  # "text", "html", "url", "number", "json"
    category: str  # "hero", "services", "contact", "pricing", etc.
    description: Optional[str] = None  # Description pour l'admin

class SiteContentCreate(BaseModel):
    key: str
    value: str
    type: str = "text"
    category: str
    description: Optional[str] = None

class SiteContentUpdate(BaseModel):
    value: str
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

# Modèle pour les paramètres globaux du site
class SiteSettings(BaseDocument):
    site_name: str = "Abrisia Plan"
    slogan: str = "Des espaces sur mesure, une vie à votre rythme"
    hero_image: str = ""
    logo_url: Optional[str] = None
    primary_color: str = "#0f766e"  # teal-800
    secondary_color: str = "#f59e0b"  # amber-500
    accent_color: str = "#10b981"  # emerald-500
    background_color: str = "#fefbf4"  # warm beige
    
    # Informations de contact - Saguenay
    contact_email: str = "abrisia0plan@gmail.com"
    contact_phone: str = ""
    contact_address: str = "Saguenay, QC, Canada"
    business_hours: str = "Lundi-Vendredi 8h-18h, Weekends sur rendez-vous"
    service_area: str = "Saguenay-Lac-Saint-Jean et environs"
    
    # Réseaux sociaux
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    
    # SEO
    meta_title: str = "Abrisia Plan - Plans sur mesure Saguenay QC"
    meta_description: str = "Spécialiste en plans architecturaux sur mesure au Saguenay. Mini-maisons, chalets, extensions - Des espaces adaptés à votre rythme."
    meta_keywords: str = "plans maison, architecte saguenay, mini-maison, chalet, construction quebec"

class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    slogan: Optional[str] = None
    hero_image: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    business_hours: Optional[str] = None
    service_area: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

# Modèle pour les services et prix
class Service(BaseDocument):
    name: str
    description: str
    price: str
    icon: str = "Home"
    category: str = "construction"
    is_active: bool = True
    order: int = 0

class ServiceCreate(BaseModel):
    name: str
    description: str
    price: str
    icon: str = "Home"
    category: str = "construction"
    is_active: bool = True
    order: int = 0

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

# Modèles de réponse génériques
class SuccessResponse(BaseModel):
    success: bool
    message: str

class ListResponse(BaseModel):
    success: bool
    data: List[dict]
    total: int

# Modèles de statistiques pour le dashboard
class DashboardStats(BaseModel):
    total_devis: int
    pending_devis: int
    active_devis: int
    completed_devis: int
    total_users: int
    pending_users: int
    total_projects: int
    total_services: int

# Modèle pour la gestion des médias
class MediaFile(BaseDocument):
    filename: str
    original_name: str
    file_path: str
    file_size: int
    mime_type: str
    category: str  # "hero", "project", "logo", "construction", "general"
    alt_text: Optional[str] = None
    uploaded_by: str
    project_id: Optional[str] = None  # Lié à un projet spécifique

class MediaFileCreate(BaseModel):
    filename: str
    original_name: str
    file_path: str
    file_size: int
    mime_type: str
    category: str = "general"
    alt_text: Optional[str] = None
    project_id: Optional[str] = None

# Modèles pour les notifications
class Notification(BaseDocument):
    user_id: str
    title: str
    message: str
    type: str = "info"  # "info", "success", "warning", "error"
    is_read: bool = False
    action_url: Optional[str] = None

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"
    action_url: Optional[str] = None