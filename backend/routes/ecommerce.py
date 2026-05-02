from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from models import (
    Product, ProductCreate, ProductUpdate,
    Order, OrderCreate, OrderItem,
    Comment, CommentCreate, CommentResponse,
    SuccessResponse, ListResponse, PaginatedResponse
)
from database import get_database
from auth import require_admin, get_current_user
from bson import ObjectId
from email_service import email_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ecommerce"])

# ========== PRODUITS (PLANS À VENDRE) ==========

@router.get("/products", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",  # "price", "popularity", "rating", "created_at"
    sort_order: str = "desc"  # "asc", "desc"
):
    """Obtenir les produits avec filtres et pagination (public)"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {"is_active": True}
        
        if category:
            filter_query["category"] = category
        if featured is not None:
            filter_query["is_featured"] = featured
        if min_price is not None:
            filter_query["price"] = {"$gte": min_price}
        if max_price is not None:
            if "price" in filter_query:
                filter_query["price"]["$lte"] = max_price
            else:
                filter_query["price"] = {"$lte": max_price}
        
        # Recherche textuelle
        if search:
            filter_query["$text"] = {"$search": search}
        
        # Tri
        sort_direction = 1 if sort_order == "asc" else -1
        sort_field = sort_by
        if sort_by == "popularity":
            sort_field = "sales_count"
        elif sort_by == "rating":
            sort_field = "rating"
        
        # Pagination
        skip = (page - 1) * per_page
        
        # Récupérer les produits
        cursor = db.products.find(filter_query).sort(sort_field, sort_direction).skip(skip).limit(per_page)
        products = await cursor.to_list(length=per_page)
        
        # Compter le total
        total = await db.products.count_documents(filter_query)
        total_pages = (total + per_page - 1) // per_page
        
        # Formater les résultats
        formatted_products = []
        for product in products:
            # Calculer le prix final avec discount
            final_price = product["price"]
            if product.get("discount_percentage"):
                final_price = product["price"] * (1 - product["discount_percentage"] / 100)
            
            formatted_products.append({
                "id": str(product["_id"]),
                "name": product["name"],
                "description": product["description"],
                "category": product["category"],
                "subcategory": product.get("subcategory", ""),
                "price": product["price"],
                "finalPrice": final_price,
                "originalPrice": product.get("original_price"),
                "discountPercentage": product.get("discount_percentage"),
                "currency": product.get("currency", "CAD"),
                "surfaceArea": product.get("surface_area", ""),
                "dimensions": product.get("dimensions", ""),
                "rooms": product.get("rooms", ""),
                "mainImage": product["main_image"],
                "galleryImages": product.get("gallery_images", []),
                "slug": product["slug"],
                "isFeatured": product.get("is_featured", False),
                "difficultyLevel": product.get("difficulty_level", "intermediate"),
                "rating": product.get("rating", 0.0),
                "reviewsCount": product.get("reviews_count", 0),
                "salesCount": product.get("sales_count", 0),
                "includes": product.get("includes", []),
                "fileFormats": product.get("file_formats", ["PDF"]),
                "tags": product.get("tags", []),
                # Nouveaux champs Kits
                "designerName": product.get("designer_name"),
                "materialsListEnabled": product.get("materials_list_enabled", False),
                "materialsListPrice": product.get("materials_list_price"),
            })
        
        return PaginatedResponse(
            success=True,
            data=formatted_products,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération produits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des produits"
        )

@router.get("/products/{product_slug}")
async def get_product_by_slug(product_slug: str):
    """Obtenir un produit par son slug (public)"""
    try:
        db = get_database()
        
        product = await db.products.find_one({
            "slug": product_slug,
            "is_active": True
        })
        
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        # Incrémenter le compteur de vues
        await db.products.update_one(
            {"_id": product["_id"]},
            {"$inc": {"views_count": 1}}
        )
        
        # Calculer le prix final
        final_price = product["price"]
        if product.get("discount_percentage"):
            final_price = product["price"] * (1 - product["discount_percentage"] / 100)
        
        # Récupérer les avis approuvés pour ce produit
        reviews = await db.comments.find({
            "product_id": str(product["_id"]),
            "comment_type": "review",
            "is_approved": True,
            "rating": {"$exists": True}
        }).sort("created_at", -1).limit(10).to_list(length=10)
        
        formatted_reviews = []
        for review in reviews:
            formatted_reviews.append({
                "id": str(review["_id"]),
                "customerName": review["customer_name"],
                "rating": review["rating"],
                "message": review["message"],
                "createdAt": review["created_at"].isoformat(),
                "adminResponse": review.get("admin_response")
            })
        
        formatted_product = {
            "id": str(product["_id"]),
            "name": product["name"],
            "description": product["description"],
            "longDescription": product.get("long_description", ""),
            "category": product["category"],
            "subcategory": product.get("subcategory", ""),
            "price": product["price"],
            "finalPrice": final_price,
            "originalPrice": product.get("original_price"),
            "discountPercentage": product.get("discount_percentage"),
            "currency": product.get("currency", "CAD"),
            "surfaceArea": product.get("surface_area", ""),
            "dimensions": product.get("dimensions", ""),
            "rooms": product.get("rooms", ""),
            "buildingType": product.get("building_type", "residential"),
            "mainImage": product["main_image"],
            "galleryImages": product.get("gallery_images", []),
            "videoUrl": product.get("video_url"),
            "slug": product["slug"],
            "includes": product.get("includes", []),
            "fileFormats": product.get("file_formats", ["PDF"]),
            "pagesCount": product.get("pages_count"),
            "difficultyLevel": product.get("difficulty_level", "intermediate"),
            "stockStatus": product.get("stock_status", "in_stock"),
            "rating": product.get("rating", 0.0),
            "reviewsCount": product.get("reviews_count", 0),
            "salesCount": product.get("sales_count", 0),
            "viewsCount": product.get("views_count", 0),
            "tags": product.get("tags", []),
            "metaTitle": product.get("meta_title", ""),
            "metaDescription": product.get("meta_description", ""),
            "reviews": formatted_reviews,
            # Nouveaux champs Kits
            "designerName": product.get("designer_name"),
            "materialsListEnabled": product.get("materials_list_enabled", False),
            "materialsListPrice": product.get("materials_list_price"),
            "planFileUrl": product.get("plan_file_url"),
            "materialsListFileUrl": product.get("materials_list_file_url"),
        }
        
        return {
            "success": True,
            "product": formatted_product
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur récupération produit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération du produit"
        )

@router.get("/categories")
async def get_product_categories():
    """Obtenir toutes les catégories de produits (public)"""
    try:
        db = get_database()
        
        # Récupérer les catégories avec comptage
        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "subcategories": {"$addToSet": "$subcategory"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        categories = await db.products.aggregate(pipeline).to_list(length=None)
        
        formatted_categories = []
        for cat in categories:
            subcats = [sub for sub in cat["subcategories"] if sub]  # Filtrer les subcategories vides
            formatted_categories.append({
                "name": cat["_id"],
                "count": cat["count"],
                "subcategories": subcats
            })
        
        return {
            "success": True,
            "categories": formatted_categories
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération catégories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des catégories"
        )

# ========== GESTION ADMIN DES PRODUITS ==========

@router.get("/admin/products", response_model=PaginatedResponse)
async def get_admin_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,  # "active", "inactive", "featured"
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les produits (admin)"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {}
        if category:
            filter_query["category"] = category
        if status == "active":
            filter_query["is_active"] = True
        elif status == "inactive":
            filter_query["is_active"] = False
        elif status == "featured":
            filter_query["is_featured"] = True
        
        # Pagination
        skip = (page - 1) * per_page
        
        # Récupérer les produits
        cursor = db.products.find(filter_query).sort("created_at", -1).skip(skip).limit(per_page)
        products = await cursor.to_list(length=per_page)
        
        total = await db.products.count_documents(filter_query)
        total_pages = (total + per_page - 1) // per_page
        
        # Formater pour admin
        formatted_products = []
        for product in products:
            formatted_products.append({
                "id": str(product["_id"]),
                "name": product["name"],
                "category": product["category"],
                "price": product["price"],
                "isActive": product.get("is_active", True),
                "isFeatured": product.get("is_featured", False),
                "salesCount": product.get("sales_count", 0),
                "viewsCount": product.get("views_count", 0),
                "rating": product.get("rating", 0.0),
                "reviewsCount": product.get("reviews_count", 0),
                "createdAt": product["created_at"].isoformat(),
                "updatedAt": product["updated_at"].isoformat(),
                # Nouveaux champs admin
                "mainImage": product.get("main_image"),
                "designerName": product.get("designer_name"),
                "materialsListEnabled": product.get("materials_list_enabled", False),
                "materialsListPrice": product.get("materials_list_price"),
            })
        
        return PaginatedResponse(
            success=True,
            data=formatted_products,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération produits admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des produits"
        )

@router.post("/admin/products", response_model=SuccessResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(require_admin)
):
    """Créer un nouveau produit (admin)"""
    try:
        db = get_database()
        
        # Vérifier l'unicité du slug
        existing = await db.products.find_one({"slug": product_data.slug})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un produit avec ce slug existe déjà"
            )
        
        # Créer le produit
        product_doc = {
            **product_data.dict(),
            "views_count": 0,
            "sales_count": 0,
            "rating": 0.0,
            "reviews_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.products.insert_one(product_doc)
        
        logger.info(f"✅ Nouveau produit créé: {product_data.name} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message=f"Produit '{product_data.name}' créé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création produit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du produit"
        )

@router.put("/admin/products/{product_id}", response_model=SuccessResponse)
async def update_product(
    product_id: str,
    update_data: ProductUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour un produit (admin)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="ID produit invalide")
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        # Include ALL explicitly set fields, even if None (to allow clearing values)
        for field, value in update_data.dict(exclude_unset=True).items():
            update_fields[field] = value
        
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Produit non trouve")
        
        logger.info(f"Produit {product_id} mis a jour par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Produit mis a jour avec succes"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise a jour produit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise a jour du produit"
        )

@router.delete("/admin/products/{product_id}", response_model=SuccessResponse)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_admin)
):
    """Supprimer un produit (admin)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="ID produit invalide")
        
        # Vérifier s'il y a des commandes pour ce produit
        orders_count = await db.orders.count_documents({
            "items.product_id": product_id,
            "status": {"$ne": "cancelled"}
        })
        
        if orders_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Impossible de supprimer un produit avec des commandes existantes"
            )
        
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        logger.info(f"✅ Produit {product_id} supprimé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Produit supprimé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur suppression produit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la suppression du produit"
        )

# ========== COMMANDES DE KITS (PAIEMENT MANUEL) ==========

from pydantic import BaseModel as PydanticBaseModel

class KitOrderCreate(PydanticBaseModel):
    """Modèle pour créer une commande de kit"""
    kit_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    include_materials: bool = False
    notes: Optional[str] = None

@router.post("/kits/order")
async def create_kit_order(order_data: KitOrderCreate):
    """Créer une commande de kit (paiement manuel/Interac)"""
    try:
        db = get_database()
        
        # Vérifier que le kit existe
        if not ObjectId.is_valid(order_data.kit_id):
            raise HTTPException(status_code=400, detail="ID kit invalide")
        
        kit = await db.products.find_one({
            "_id": ObjectId(order_data.kit_id),
            "is_active": True
        })
        
        if not kit:
            raise HTTPException(status_code=404, detail="Kit non trouvé")
        
        # Calculer le prix total
        base_price = kit["price"]
        materials_price = 0.0
        
        if order_data.include_materials and kit.get("materials_list_enabled"):
            materials_price = kit.get("materials_list_price", 0) or 0
        
        subtotal = base_price + materials_price
        tax_rate = 14.975  # TPS+TVQ Québec
        tax_amount = round(subtotal * tax_rate / 100, 2)
        total_amount = round(subtotal + tax_amount, 2)
        
        # Générer numéro de commande
        order_count = await db.kit_orders.count_documents({})
        order_number = f"KIT-{datetime.utcnow().strftime('%Y%m')}-{(order_count + 1):04d}"
        
        # Créer la commande
        order_doc = {
            "order_number": order_number,
            "kit_id": str(kit["_id"]),
            "kit_name": kit["name"],
            "designer_name": kit.get("designer_name"),
            "customer_name": order_data.customer_name,
            "customer_email": order_data.customer_email,
            "customer_phone": order_data.customer_phone,
            "include_materials": order_data.include_materials,
            "base_price": base_price,
            "materials_price": materials_price,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "currency": "CAD",
            "status": "pending",  # pending, paid, cancelled
            "payment_method": None,  # interac, stripe, paypal
            "payment_confirmed_at": None,
            "files_sent": False,
            "files_sent_at": None,
            "notes": order_data.notes,
            "admin_notes": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.kit_orders.insert_one(order_doc)
        
        logger.info(f"✅ Nouvelle commande kit: {order_number} - {kit['name']} par {order_data.customer_email}")
        
        # Envoyer les emails de confirmation
        try:
            # Email au client
            email_service.send_kit_order_confirmation_to_client(order_doc)
            # Email notification à l'admin
            email_service.send_kit_order_notification_to_admin(order_doc)
        except Exception as email_error:
            logger.warning(f"⚠️ Erreur envoi email pour commande {order_number}: {email_error}")
        
        return {
            "success": True,
            "message": "Commande créée avec succès",
            "order": {
                "id": str(result.inserted_id),
                "orderNumber": order_number,
                "kitName": kit["name"],
                "includeMaterials": order_data.include_materials,
                "basePrice": base_price,
                "materialsPrice": materials_price,
                "subtotal": subtotal,
                "taxAmount": tax_amount,
                "totalAmount": total_amount,
                "status": "pending"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création commande kit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de la commande"
        )

@router.get("/admin/kit-orders")
async def get_kit_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Obtenir toutes les commandes de kits (admin)"""
    try:
        db = get_database()
        
        filter_query = {}
        if status:
            filter_query["status"] = status
        
        skip = (page - 1) * per_page
        
        cursor = db.kit_orders.find(filter_query).sort("created_at", -1).skip(skip).limit(per_page)
        orders = await cursor.to_list(length=per_page)
        
        total = await db.kit_orders.count_documents(filter_query)
        total_pages = (total + per_page - 1) // per_page
        
        formatted_orders = []
        for order in orders:
            formatted_orders.append({
                "id": str(order["_id"]),
                "orderNumber": order["order_number"],
                "kitId": order["kit_id"],
                "kitName": order["kit_name"],
                "designerName": order.get("designer_name"),
                "customerName": order["customer_name"],
                "customerEmail": order["customer_email"],
                "customerPhone": order.get("customer_phone"),
                "includeMaterials": order["include_materials"],
                "basePrice": order["base_price"],
                "materialsPrice": order["materials_price"],
                "subtotal": order["subtotal"],
                "taxAmount": order["tax_amount"],
                "totalAmount": order["total_amount"],
                "status": order["status"],
                "paymentMethod": order.get("payment_method"),
                "paymentConfirmedAt": order.get("payment_confirmed_at").isoformat() if order.get("payment_confirmed_at") else None,
                "filesSent": order.get("files_sent", False),
                "filesSentAt": order.get("files_sent_at").isoformat() if order.get("files_sent_at") else None,
                "notes": order.get("notes"),
                "adminNotes": order.get("admin_notes"),
                "createdAt": order["created_at"].isoformat(),
            })
        
        return {
            "success": True,
            "data": formatted_orders,
            "total": total,
            "page": page,
            "perPage": per_page,
            "totalPages": total_pages
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération commandes kit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des commandes"
        )

class KitOrderUpdate(PydanticBaseModel):
    status: Optional[str] = None
    payment_method: Optional[str] = None
    files_sent: Optional[bool] = None
    admin_notes: Optional[str] = None

@router.put("/admin/kit-orders/{order_id}")
async def update_kit_order(
    order_id: str,
    update_data: KitOrderUpdate,
    current_user: dict = Depends(require_admin)
):
    """Mettre à jour une commande de kit (admin)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="ID commande invalide")
        
        update_fields = {"updated_at": datetime.utcnow()}
        
        if update_data.status:
            update_fields["status"] = update_data.status
            if update_data.status == "paid":
                update_fields["payment_confirmed_at"] = datetime.utcnow()
        
        if update_data.payment_method:
            update_fields["payment_method"] = update_data.payment_method
        
        if update_data.files_sent is not None:
            update_fields["files_sent"] = update_data.files_sent
            if update_data.files_sent:
                update_fields["files_sent_at"] = datetime.utcnow()
        
        if update_data.admin_notes:
            update_fields["admin_notes"] = update_data.admin_notes
        
        result = await db.kit_orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        logger.info(f"✅ Commande kit {order_id} mise à jour par {current_user['name']}")
        
        return {
            "success": True,
            "message": "Commande mise à jour avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour commande kit: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la mise à jour de la commande"
        )

# ========== COMMENTAIRES ET AVIS ==========

@router.post("/comments", response_model=SuccessResponse)
async def create_comment(comment_data: CommentCreate):
    """Créer un commentaire/avis (public)"""
    try:
        db = get_database()
        
        comment_doc = {
            **comment_data.dict(),
            "is_approved": False,  # Modération requise
            "is_public": True,
            "admin_response": None,
            "responded_by": None,
            "responded_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.comments.insert_one(comment_doc)
        
        logger.info(f"✅ Nouveau commentaire de {comment_data.customer_name} ({comment_data.comment_type})")
        
        return SuccessResponse(
            success=True,
            message="Commentaire soumis avec succès. Il sera visible après modération."
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur création commentaire: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du commentaire"
        )

@router.get("/admin/comments", response_model=PaginatedResponse)
async def get_admin_comments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    comment_type: Optional[str] = None,
    status: Optional[str] = None,  # "pending", "approved", "responded"
    current_user: dict = Depends(require_admin)
):
    """Obtenir tous les commentaires (admin)"""
    try:
        db = get_database()
        
        # Construire le filtre
        filter_query = {}
        if comment_type:
            filter_query["comment_type"] = comment_type
        if status == "pending":
            filter_query["is_approved"] = False
        elif status == "approved":
            filter_query["is_approved"] = True
        elif status == "responded":
            filter_query["admin_response"] = {"$ne": None}
        
        # Pagination
        skip = (page - 1) * per_page
        
        cursor = db.comments.find(filter_query).sort("created_at", -1).skip(skip).limit(per_page)
        comments = await cursor.to_list(length=per_page)
        
        total = await db.comments.count_documents(filter_query)
        total_pages = (total + per_page - 1) // per_page
        
        formatted_comments = []
        for comment in comments:
            formatted_comments.append({
                "id": str(comment["_id"]),
                "customerName": comment["customer_name"],
                "customerEmail": comment["customer_email"],
                "message": comment["message"],
                "rating": comment.get("rating"),
                "commentType": comment["comment_type"],
                "isApproved": comment["is_approved"],
                "productId": comment.get("product_id"),
                "pageUrl": comment.get("page_url"),
                "adminResponse": comment.get("admin_response"),
                "respondedBy": comment.get("responded_by"),
                "respondedAt": comment.get("responded_at"),
                "createdAt": comment["created_at"].isoformat()
            })
        
        return PaginatedResponse(
            success=True,
            data=formatted_comments,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur récupération commentaires: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la récupération des commentaires"
        )

@router.post("/admin/comments/respond", response_model=SuccessResponse)
async def respond_to_comment(
    response_data: CommentResponse,
    current_user: dict = Depends(require_admin)
):
    """Répondre à un commentaire (admin)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(response_data.comment_id):
            raise HTTPException(status_code=400, detail="ID commentaire invalide")
        
        update_fields = {
            "admin_response": response_data.admin_response,
            "responded_by": current_user["name"],
            "responded_at": datetime.utcnow(),
            "is_approved": True,  # Approuver automatiquement quand on répond
            "updated_at": datetime.utcnow()
        }
        
        result = await db.comments.update_one(
            {"_id": ObjectId(response_data.comment_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Commentaire non trouvé")
        
        logger.info(f"✅ Réponse ajoutée au commentaire {response_data.comment_id} par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Réponse ajoutée avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur réponse commentaire: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'ajout de la réponse"
        )

@router.put("/admin/comments/{comment_id}/approve", response_model=SuccessResponse)
async def approve_comment(
    comment_id: str,
    current_user: dict = Depends(require_admin)
):
    """Approuver un commentaire (admin)"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(comment_id):
            raise HTTPException(status_code=400, detail="ID commentaire invalide")
        
        result = await db.comments.update_one(
            {"_id": ObjectId(comment_id)},
            {"$set": {"is_approved": True, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Commentaire non trouvé")
        
        # Mettre à jour les statistiques du produit si c'est un avis
        comment = await db.comments.find_one({"_id": ObjectId(comment_id)})
        if comment and comment.get("rating") and comment.get("product_id"):
            await update_product_rating(comment["product_id"])
        
        logger.info(f"✅ Commentaire {comment_id} approuvé par {current_user['name']}")
        
        return SuccessResponse(
            success=True,
            message="Commentaire approuvé avec succès"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur approbation commentaire: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'approbation du commentaire"
        )

# ========== FONCTIONS UTILITAIRES ==========

async def update_product_rating(product_id: str):
    """Mettre à jour la note moyenne d'un produit"""
    try:
        db = get_database()
        
        # Calculer la moyenne des avis approuvés
        pipeline = [
            {"$match": {
                "product_id": product_id,
                "comment_type": "review",
                "is_approved": True,
                "rating": {"$exists": True, "$ne": None}
            }},
            {"$group": {
                "_id": None,
                "avgRating": {"$avg": "$rating"},
                "count": {"$sum": 1}
            }}
        ]
        
        result = await db.comments.aggregate(pipeline).to_list(length=1)
        
        if result:
            avg_rating = round(result[0]["avgRating"], 1)
            reviews_count = result[0]["count"]
        else:
            avg_rating = 0.0
            reviews_count = 0
        
        # Mettre à jour le produit
        await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {
                "rating": avg_rating,
                "reviews_count": reviews_count,
                "updated_at": datetime.utcnow()
            }}
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur mise à jour rating produit {product_id}: {e}")