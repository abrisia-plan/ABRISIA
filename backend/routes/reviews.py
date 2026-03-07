from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
import uuid
from database import get_database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["reviews"])

class ReviewCreate(BaseModel):
    devis_id: Optional[str] = None
    client_name: str
    client_email: str
    rating: int = Field(..., ge=1, le=5)
    comment: str
    project_type: Optional[str] = None
    would_recommend: bool = True

class ReviewResponse(BaseModel):
    id: str
    client_name: str
    rating: int
    comment: str
    project_type: Optional[str]
    would_recommend: bool
    created_at: datetime
    is_visible: bool

@router.post("/reviews")
async def create_review(review: ReviewCreate):
    """Créer un nouvel avis client"""
    try:
        db = get_database()
        
        review_data = {
            "id": str(uuid.uuid4()),
            "devis_id": review.devis_id,
            "client_name": review.client_name,
            "client_email": review.client_email,
            "rating": review.rating,
            "comment": review.comment,
            "project_type": review.project_type,
            "would_recommend": review.would_recommend,
            "is_visible": False,  # Doit être approuvé par l'admin
            "is_approved": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.reviews.insert_one(review_data)
        
        # Envoyer notification par courriel
        try:
            from email_service import email_service
            email_service.send_review_notification({
                "client_name": review.client_name,
                "client_email": review.client_email,
                "rating": review.rating,
                "comment": review.comment,
                "project_type": review.project_type
            })
        except Exception as email_err:
            logger.warning(f"Email review notification failed: {email_err}")
        
        logger.info(f"✅ Nouvel avis créé par {review.client_name} - {review.rating} étoiles")
        
        return {
            "success": True,
            "message": "Merci pour votre avis ! Il sera publié après validation.",
            "review_id": review_data["id"]
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur création avis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'enregistrement de votre avis"
        )

@router.get("/reviews")
async def get_public_reviews(
    limit: int = 10,
    skip: int = 0
):
    """Obtenir les avis approuvés pour affichage public"""
    try:
        db = get_database()
        
        reviews = await db.reviews.find(
            {"is_visible": True, "is_approved": True}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Calculer la moyenne
        all_ratings = await db.reviews.find(
            {"is_visible": True, "is_approved": True}
        ).to_list(length=1000)
        
        avg_rating = 0
        if all_ratings:
            avg_rating = sum(r.get("rating", 0) for r in all_ratings) / len(all_ratings)
        
        return {
            "success": True,
            "data": [{
                "id": r["id"],
                "client_name": r["client_name"],
                "rating": r["rating"],
                "comment": r["comment"],
                "project_type": r.get("project_type"),
                "would_recommend": r.get("would_recommend", True),
                "created_at": r["created_at"]
            } for r in reviews],
            "stats": {
                "average_rating": round(avg_rating, 1),
                "total_reviews": len(all_ratings)
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération avis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des avis"
        )

@router.get("/admin/reviews")
async def get_all_reviews_admin(
    limit: int = 50,
    skip: int = 0,
    status_filter: Optional[str] = None
):
    """Obtenir tous les avis pour l'admin"""
    try:
        db = get_database()
        
        query = {}
        if status_filter == "pending":
            query["is_approved"] = False
        elif status_filter == "approved":
            query["is_approved"] = True
        
        reviews = await db.reviews.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        total = await db.reviews.count_documents(query)
        
        # Format reviews to exclude MongoDB _id and ensure JSON serializable
        formatted_reviews = []
        for r in reviews:
            formatted_reviews.append({
                "id": r.get("id", str(r.get("_id", ""))),
                "client_name": r.get("client_name", ""),
                "client_email": r.get("client_email", ""),
                "rating": r.get("rating", 0),
                "comment": r.get("comment", ""),
                "project_type": r.get("project_type"),
                "would_recommend": r.get("would_recommend", True),
                "is_visible": r.get("is_visible", False),
                "is_approved": r.get("is_approved", False),
                "created_at": r.get("created_at").isoformat() if r.get("created_at") else None
            })
        
        return {
            "success": True,
            "data": formatted_reviews,
            "total": total
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération avis admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des avis"
        )

@router.put("/admin/reviews/{review_id}/approve")
async def approve_review(review_id: str):
    """Approuver un avis"""
    try:
        db = get_database()
        
        result = await db.reviews.update_one(
            {"id": review_id},
            {"$set": {
                "is_approved": True,
                "is_visible": True,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Avis non trouvé")
        
        logger.info(f"✅ Avis {review_id} approuvé")
        
        return {"success": True, "message": "Avis approuvé et visible"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur approbation avis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'approbation"
        )

@router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str):
    """Supprimer un avis"""
    try:
        db = get_database()
        
        result = await db.reviews.delete_one({"id": review_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Avis non trouvé")
        
        logger.info(f"✅ Avis {review_id} supprimé")
        
        return {"success": True, "message": "Avis supprimé"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression avis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression"
        )
