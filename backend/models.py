from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
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
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Modèles User/Auth
class User(BaseDocument):
    email: EmailStr
    password: str  # hashé
    name: str
    role: str = "admin"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

# Modèles Devis
class Devis(BaseDocument):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    project_type: str
    plans_choisis: List[str]
    notes: str
    status: str = "En attente"  # "En attente", "En cours", "Terminé", "Rejeté"
    assigned_to: Optional[str] = None

class DevisCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: Optional[str] = ""
    projectType: str
    plansChoisis: List[str]
    notes: str

class DevisUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None

class DevisResponse(BaseModel):
    success: bool
    message: str
    devis: Optional[dict] = None

# Modèles Designer
class Designer(BaseDocument):
    name: str
    email: EmailStr
    specialties: List[str]
    active_projects: int = 0

class DesignerCreate(BaseModel):
    name: str
    email: EmailStr
    specialties: List[str]

class DesignerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    specialties: Optional[List[str]] = None
    active_projects: Optional[int] = None

# Modèles Project/Inspiration
class Project(BaseDocument):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True

class ProjectCreate(BaseModel):
    title: str
    category: str
    image: str
    description: str
    details: List[str]
    dimensions: str
    is_visible: bool = True

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    details: Optional[List[str]] = None
    dimensions: Optional[str] = None
    is_visible: Optional[bool] = None

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
    total_designers: int
    total_projects: int