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

# ========== MODÈLES USER/AUTH - SYSTÈME MULTI-RÔLES ==========
class User(BaseDocument):
    email: EmailStr
    password: str  # hashé
    name: str
    role: str  # "admin", "designer", "constructor", "customer", "pending"
    is_active: bool = True
    is_approved: bool = False
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []
    profile_image: Optional[str] = None
    bio: Optional[str] = None  # Bio pour profil admin public
    social_links: Dict[str, str] = {}  # LinkedIn, etc.

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "pending"
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: List[str] = []

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    name: str
    role: str
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
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    specialties: Optional[List[str]] = None
    bio: Optional[str] = None
    is_active: Optional[bool] = None
    is_approved: Optional[bool] = None
    role: Optional[str] = None

class AdminProfile(BaseModel):
    name: str
    bio: str
    profile_image: Optional[str] = None
    phone: Optional[str] = None
    email: str
    social_links: Dict[str, str] = {}
    specialties: List[str] = []
    experience_years: Optional[int] = None

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

# ========== MODÈLES DESIGNERS ==========
class Designer(BaseDocument):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str] = []
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: bool = True
    portfolio_items: List[str] = []  # URLs vers portfolio
    hourly_rate: Optional[float] = None
    availability_status: str = "available"  # "available", "busy", "unavailable"

class DesignerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    specialties: List[str] = []
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability_status: str = "available"

class DesignerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    specialties: Optional[List[str]] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: Optional[bool] = None
    hourly_rate: Optional[float] = None
    availability_status: Optional[str] = None

# ========== MODÈLES CMS ==========
class SiteContent(BaseDocument):
    key: str  # Clé unique pour identifier le contenu
    value: str  # Valeur du contenu (texte, URL, etc.)
    type: str  # "text", "html", "image", "number", "json"
    category: str  # "hero", "services", "about", "contact", etc.
    description: Optional[str] = ""
    is_active: bool = True

class SiteContentCreate(BaseModel):
    key: str
    value: str
    type: str
    category: str
    description: Optional[str] = ""

class SiteContentUpdate(BaseModel):
    value: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

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
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

class Service(BaseDocument):
    name: str
    description: str
    price: float
    icon: Optional[str] = None
    category: str  # "plans", "technical", "carpentry"
    is_active: bool = True
    order: int = 0

class ServiceCreate(BaseModel):
    name: str
    description: str
    price: float
    icon: Optional[str] = None
    category: str
    is_active: bool = True
    order: int = 0

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class MediaFile(BaseDocument):
    filename: str
    original_name: str
    file_path: str
    file_size: int
    mime_type: str
    category: str
    alt_text: Optional[str] = None
    uploaded_by: str

class MediaFileCreate(BaseModel):
    filename: str
    original_name: str
    file_path: str
    file_size: int
    mime_type: str
    category: str
    alt_text: Optional[str] = None

# ========== MODÈLES E-COMMERCE - PLANS À VENDRE ==========
class Product(BaseDocument):
    name: str
    description: str
    long_description: Optional[str] = ""
    category: str  # "mini-maison", "maison-familiale", "chalet", "ebenisterie", "extension"
    subcategory: Optional[str] = ""
    price: float
    original_price: Optional[float] = None  # Prix barré
    currency: str = "CAD"
    
    # Détails techniques
    surface_area: Optional[str] = ""  # Ex: "25m²"
    dimensions: Optional[str] = ""    # Ex: "6m x 4m"
    rooms: Optional[str] = ""         # Ex: "2 chambres, 1 salle de bain"
    building_type: str = "residential"  # "residential", "commercial", "mixed"
    
    # Fichiers inclus
    includes: List[str] = []  # Ex: ["Plans architecturaux", "Liste matériaux", "Guide construction"]
    file_formats: List[str] = ["PDF", "DWG"]
    pages_count: Optional[int] = None
    
    # Images et médias
    main_image: str
    gallery_images: List[str] = []
    video_url: Optional[str] = None
    
    # SEO et marketing
    slug: str  # URL friendly
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    tags: List[str] = []
    
    # État et disponibilité
    is_active: bool = True
    is_featured: bool = False
    stock_status: str = "in_stock"  # "in_stock", "limited", "out_of_stock"
    difficulty_level: str = "intermediate"  # "beginner", "intermediate", "advanced"
    
    # Statistiques
    views_count: int = 0
    sales_count: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    
    # Prix dynamique
    discount_percentage: Optional[float] = None
    promotion_end_date: Optional[datetime] = None
    
    # ========== NOUVEAUX CHAMPS SYSTÈME KITS ==========
    # Dessinatrice/Designer
    designer_name: Optional[str] = None  # Nom de la dessinatrice
    
    # Fichiers téléchargeables
    plan_file_url: Optional[str] = None  # Fichier PDF/AutoCAD du plan
    
    # Option liste matériaux
    materials_list_enabled: bool = False  # Activer l'option liste matériaux
    materials_list_price: Optional[float] = None  # Prix additionnel pour la liste
    materials_list_file_url: Optional[str] = None  # Fichier PDF de la liste matériaux

class ProductCreate(BaseModel):
    name: str
    description: str
    long_description: Optional[str] = ""
    category: str
    subcategory: Optional[str] = ""
    price: float
    original_price: Optional[float] = None
    surface_area: Optional[str] = ""
    dimensions: Optional[str] = ""
    rooms: Optional[str] = ""
    building_type: str = "residential"
    includes: List[str] = []
    file_formats: List[str] = ["PDF", "DWG"]
    pages_count: Optional[int] = None
    main_image: str = ""
    gallery_images: List[str] = []
    video_url: Optional[str] = None
    slug: str = ""
    meta_title: Optional[str] = ""
    meta_description: Optional[str] = ""
    tags: List[str] = []
    is_active: bool = True
    is_featured: bool = False
    difficulty_level: str = "intermediate"
    discount_percentage: Optional[float] = None
    # Nouveaux champs Kits
    designer_name: Optional[str] = None
    plan_file_url: Optional[str] = None
    materials_list_enabled: bool = False
    materials_list_price: Optional[float] = None
    materials_list_file_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    surface_area: Optional[str] = None
    dimensions: Optional[str] = None
    rooms: Optional[str] = None
    building_type: Optional[str] = None
    includes: Optional[List[str]] = None
    file_formats: Optional[List[str]] = None
    pages_count: Optional[int] = None
    main_image: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    video_url: Optional[str] = None
    slug: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    difficulty_level: Optional[str] = None
    discount_percentage: Optional[float] = None
    designer_name: Optional[str] = None
    plan_file_url: Optional[str] = None
    materials_list_enabled: Optional[bool] = None
    materials_list_price: Optional[float] = None
    materials_list_file_url: Optional[str] = None

# ========== MODÈLES COMMANDES ==========
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int = 1
    include_materials: bool = False  # Option liste matériaux
    materials_price: float = 0.0  # Prix de la liste matériaux

class Order(BaseDocument):
    order_number: str  # Numéro de commande unique
    customer_email: EmailStr
    customer_name: str
    customer_phone: Optional[str] = None
    
    # Articles commandés
    items: List[OrderItem]
    subtotal: float
    tax_amount: float = 0.0
    total_amount: float
    currency: str = "CAD"
    
    # Status et paiement
    status: str = "pending"  # "pending", "paid", "delivered", "cancelled", "refunded"
    payment_status: str = "pending"  # "pending", "completed", "failed", "refunded"
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None  # ID transaction Stripe/PayPal
    
    # Download et livraison
    download_links: List[Dict[str, str]] = []  # [{"product_id": "xxx", "download_url": "xxx"}]
    download_expires_at: Optional[datetime] = None
    downloads_count: int = 0
    max_downloads: int = 3
    
    # Notes
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None

class OrderCreate(BaseModel):
    customer_email: EmailStr
    customer_name: str
    customer_phone: Optional[str] = None
    items: List[OrderItem]
    customer_notes: Optional[str] = None

# ========== MODÈLES COMMENTAIRES/QUESTIONS ==========
class Comment(BaseDocument):
    product_id: Optional[str] = None  # Si lié à un produit
    page_url: Optional[str] = None    # Si commentaire général
    customer_name: str
    customer_email: EmailStr
    message: str
    rating: Optional[int] = None  # 1-5 étoiles pour les avis produits
    
    # Modération
    is_approved: bool = False
    is_public: bool = True
    
    # Réponse admin
    admin_response: Optional[str] = None
    responded_by: Optional[str] = None
    responded_at: Optional[datetime] = None
    
    # Type
    comment_type: str = "general"  # "review", "question", "general", "support"

class CommentCreate(BaseModel):
    product_id: Optional[str] = None
    page_url: Optional[str] = None
    customer_name: str
    customer_email: EmailStr
    message: str
    rating: Optional[int] = None
    comment_type: str = "general"

class CommentResponse(BaseModel):
    comment_id: str
    admin_response: str

# ========== MODÈLES ANALYTICS ==========
class PageView(BaseDocument):
    page_url: str
    page_title: Optional[str] = None
    user_ip: str
    user_agent: str
    referrer: Optional[str] = None
    session_id: str
    country: Optional[str] = None
    city: Optional[str] = None
    device_type: str = "desktop"  # "desktop", "mobile", "tablet"
    browser: Optional[str] = None
    is_bot: bool = False
    visit_duration: Optional[int] = None  # en secondes

class Analytics(BaseDocument):
    date: datetime
    page_views: int = 0
    unique_visitors: int = 0
    bounce_rate: float = 0.0
    average_session_duration: float = 0.0
    top_pages: List[Dict[str, Any]] = []
    top_referrers: List[Dict[str, Any]] = []
    device_breakdown: Dict[str, int] = {}
    location_breakdown: Dict[str, int] = {}

# ========== MODÈLES SEO ==========
class SEOSettings(BaseDocument):
    # Mots-clés principaux
    primary_keywords: List[str] = []
    secondary_keywords: List[str] = []
    
    # Meta tags globaux
    global_title_suffix: str = " | Abrisia Plan - Saguenay QC"
    global_description: str = ""
    canonical_domain: str = "https://abrisia-plan.ca"
    
    # Schema.org
    business_name: str = "Abrisia Plan"
    business_type: str = "ArchitecturalService"
    business_description: str = ""
    business_address: Dict[str, str] = {}
    business_hours: List[Dict[str, str]] = []
    
    # Google Services
    google_analytics_id: Optional[str] = None
    google_tag_manager_id: Optional[str] = None
    google_search_console_verified: bool = False
    
    # Réseaux sociaux
    facebook_pixel_id: Optional[str] = None
    og_image: Optional[str] = None

# ========== MODÈLES EXISTANTS AMÉLIORÉS ==========
class SiteSettings(BaseDocument):
    site_name: str = "Abrisia Plan"
    slogan: str = "Des espaces sur mesure, une vie à votre rythme"
    hero_image: str = ""
    logo_url: Optional[str] = None
    
    # Couleurs personnalisables
    primary_color: str = "#0f766e"
    secondary_color: str = "#f59e0b"
    accent_color: str = "#10b981"
    background_color: str = "#fefbf4"
    
    # Contact Saguenay
    contact_email: str = "abrisia0plan@gmail.com"
    contact_phone: str = ""
    contact_address: str = "Saguenay, QC, Canada"
    business_hours: str = "Lundi-Vendredi 8h-18h, Weekends sur rendez-vous"
    service_area: str = "Saguenay-Lac-Saint-Jean et environs"
    
    # E-commerce
    currency: str = "CAD"
    tax_rate: float = 14.975  # TPS+TVQ Québec
    free_shipping_threshold: Optional[float] = None
    
    # Réseaux sociaux
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    youtube_url: Optional[str] = None
    
    # SEO avancé
    meta_title: str = "Abrisia Plan - Plans sur mesure Saguenay QC"
    meta_description: str = "Spécialiste en plans architecturaux sur mesure au Saguenay. Mini-maisons, chalets, ébénisterie - Achetez vos plans en ligne!"
    meta_keywords: str = "plans maison, architecte saguenay, mini-maison, chalet, ébénisterie, construction quebec"
    
    # Cookies et tracking
    cookie_consent_required: bool = True
    google_analytics_enabled: bool = False
    facebook_pixel_enabled: bool = False
    marketing_cookies_enabled: bool = False

# ========== MODÈLES DE RÉPONSE ==========
class SuccessResponse(BaseModel):
    success: bool
    message: str

class ListResponse(BaseModel):
    success: bool
    data: List[dict]
    total: int

class PaginatedResponse(BaseModel):
    success: bool
    data: List[dict]
    total: int
    page: int
    per_page: int
    total_pages: int

class DashboardStats(BaseModel):
    # E-commerce
    total_products: int
    active_products: int
    total_orders: int
    pending_orders: int
    revenue_today: float
    revenue_month: float
    
    # Engagement
    total_comments: int
    pending_comments: int
    total_reviews: int
    average_rating: float
    
    # Traffic
    visitors_today: int
    visitors_month: int
    page_views_today: int
    top_products: List[Dict[str, Any]]
    
    # Système
    total_users: int
    pending_users: int

# Simple stats model for the current devis dashboard
class SimpleStats(BaseModel):
    total_devis: int
    pending_devis: int
    active_devis: int
    completed_devis: int
    total_designers: int
    total_projects: int

# ========== MODÈLES HÉRITÉS (pour compatibilité) ==========
class Devis(BaseDocument):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    project_type: str
    plans_choisis: List[str]
    notes: str
    status: str = "En attente"
    assigned_designer: Optional[str] = None
    assigned_constructor: Optional[str] = None
    priority: str = "normal"
    progress_notes: List[dict] = []

class DevisCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    projectType: str
    plansChoisis: List[str]
    representationType: Optional[str] = ""
    responsePreference: Optional[str] = ""
    architecturalStyles: Optional[List[str]] = []
    notes: str
    files: Optional[List[dict]] = []

class DevisUpdate(BaseModel):
    status: Optional[str] = None
    assigned_designer: Optional[str] = None
    assigned_constructor: Optional[str] = None
    priority: Optional[str] = None

class DevisResponse(BaseModel):
    success: bool
    message: str
    devis: Optional[dict] = None

class Project(BaseDocument):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True
    show_on_home: bool = False

class ProjectCreate(BaseModel):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True
    show_on_home: bool = False

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    details: Optional[List[str]] = None
    dimensions: Optional[str] = None
    is_visible: Optional[bool] = None
    show_on_home: Optional[bool] = None