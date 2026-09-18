from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from database import get_database
from auth import require_admin
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["collection"])


def serialize(doc):
    if doc is None:
        return None
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


# ==================== VARIANTES ====================

@router.get("/models/{product_id}/variants")
async def get_variants(product_id: str):
    """Obtenir les variantes d'un modèle"""
    db = get_database()
    variants = await db.variants.find(
        {"product_id": product_id, "is_active": True}
    ).sort("order", 1).to_list(length=50)
    return {"success": True, "data": [serialize(v) for v in variants]}


@router.post("/admin/models/{product_id}/variants")
async def create_variant(product_id: str, variant: dict, current_user: dict = Depends(require_admin)):
    """Créer une variante pour un modèle"""
    db = get_database()
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Modèle non trouvé")

    variant_doc = {
        "product_id": product_id,
        "name": variant.get("name", ""),
        "sku": variant.get("sku", ""),
        "price": variant.get("price", product.get("price", 0)),
        "surface_area": variant.get("surface_area", ""),
        "bedrooms": variant.get("bedrooms"),
        "bathrooms": variant.get("bathrooms"),
        "description": variant.get("description", ""),
        "main_image": variant.get("main_image", ""),
        "gallery_images": variant.get("gallery_images", []),
        "characteristics": variant.get("characteristics", {}),
        "files": variant.get("files", []),
        "is_active": True,
        "order": variant.get("order", 0),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.variants.insert_one(variant_doc)
    variant_doc["id"] = str(result.inserted_id)
    variant_doc.pop("_id", None)
    return {"success": True, "data": variant_doc}


@router.put("/admin/models/variants/{variant_id}")
async def update_variant(variant_id: str, variant: dict, current_user: dict = Depends(require_admin)):
    """Modifier une variante"""
    db = get_database()
    variant["updated_at"] = datetime.now(timezone.utc)
    variant.pop("id", None)
    variant.pop("_id", None)
    await db.variants.update_one({"_id": ObjectId(variant_id)}, {"$set": variant})
    return {"success": True, "message": "Variante mise à jour"}


@router.delete("/admin/models/variants/{variant_id}")
async def delete_variant(variant_id: str, current_user: dict = Depends(require_admin)):
    """Supprimer une variante"""
    db = get_database()
    await db.variants.delete_one({"_id": ObjectId(variant_id)})
    return {"success": True, "message": "Variante supprimée"}


# ==================== OPTIONS CONFIGURABLES ====================

@router.get("/options")
async def get_options():
    """Obtenir toutes les options disponibles (public)"""
    db = get_database()
    options = await db.product_options.find(
        {"is_active": True}
    ).sort("order", 1).to_list(length=100)
    return {"success": True, "data": [serialize(o) for o in options]}


@router.get("/admin/options")
async def get_admin_options(current_user: dict = Depends(require_admin)):
    """Obtenir toutes les options (admin)"""
    db = get_database()
    options = await db.product_options.find().sort("order", 1).to_list(length=100)
    return {"success": True, "data": [serialize(o) for o in options]}


@router.post("/admin/options")
async def create_option(option: dict, current_user: dict = Depends(require_admin)):
    """Créer une option configurable"""
    db = get_database()
    option_doc = {
        "name": option.get("name", ""),
        "description": option.get("description", ""),
        "price": option.get("price", 0),
        "is_global": option.get("is_global", True),
        "product_ids": option.get("product_ids", []),
        "is_active": True,
        "order": option.get("order", 0),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.product_options.insert_one(option_doc)
    option_doc["id"] = str(result.inserted_id)
    option_doc.pop("_id", None)
    return {"success": True, "data": option_doc}


@router.put("/admin/options/{option_id}")
async def update_option(option_id: str, option: dict, current_user: dict = Depends(require_admin)):
    """Modifier une option"""
    db = get_database()
    option["updated_at"] = datetime.now(timezone.utc)
    option.pop("id", None)
    option.pop("_id", None)
    await db.product_options.update_one({"_id": ObjectId(option_id)}, {"$set": option})
    return {"success": True, "message": "Option mise à jour"}


@router.delete("/admin/options/{option_id}")
async def delete_option(option_id: str, current_user: dict = Depends(require_admin)):
    """Supprimer une option"""
    db = get_database()
    await db.product_options.delete_one({"_id": ObjectId(option_id)})
    return {"success": True, "message": "Option supprimée"}


# ==================== TAGS / FILTRES ====================

@router.get("/tags")
async def get_all_tags():
    """Obtenir tous les tags utilisés (pour les filtres publics)"""
    db = get_database()
    pipeline = [
        {"$match": {"is_active": True}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    tags = await db.products.aggregate(pipeline).to_list(length=200)
    return {
        "success": True,
        "data": [{"name": t["_id"], "count": t["count"]} for t in tags]
    }


@router.get("/filters")
async def get_filter_values():
    """Obtenir les valeurs possibles pour chaque filtre"""
    db = get_database()
    products = await db.products.find(
        {"is_active": True},
        {"tags": 1, "bedrooms": 1, "bathrooms": 1, "floors": 1,
         "foundation_type": 1, "has_garage": 1, "style": 1}
    ).to_list(length=500)

    tags = set()
    styles = set()
    foundations = set()
    bedrooms = set()
    bathrooms = set()
    floors_set = set()

    for p in products:
        for t in p.get("tags", []):
            tags.add(t)
        if p.get("style"):
            styles.add(p["style"])
        if p.get("foundation_type"):
            foundations.add(p["foundation_type"])
        if p.get("bedrooms") is not None:
            bedrooms.add(p["bedrooms"])
        if p.get("bathrooms") is not None:
            bathrooms.add(p["bathrooms"])
        if p.get("floors") is not None:
            floors_set.add(p["floors"])

    return {
        "success": True,
        "data": {
            "tags": sorted(tags),
            "styles": sorted(styles),
            "foundations": sorted(foundations),
            "bedrooms": sorted(bedrooms),
            "bathrooms": sorted(bathrooms),
            "floors": sorted(floors_set),
        }
    }


# ==================== PANIER ====================

@router.get("/cart/{session_id}")
async def get_cart(session_id: str):
    """Obtenir le panier d'un client"""
    db = get_database()
    cart = await db.carts.find_one({"session_id": session_id})
    if not cart:
        return {"success": True, "data": {"items": [], "subtotal": 0, "tps": 0, "tvq": 0, "total": 0}}

    # Enrichir les items avec les données produit
    enriched_items = []
    subtotal = 0
    for item in cart.get("items", []):
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if not product:
            continue

        variant = None
        if item.get("variant_id"):
            variant_doc = await db.variants.find_one({"_id": ObjectId(item["variant_id"])})
            if variant_doc:
                variant = serialize(variant_doc)

        # Calculer prix des options
        options_total = 0
        selected_options = []
        for opt_id in item.get("selected_option_ids", []):
            opt = await db.product_options.find_one({"_id": ObjectId(opt_id)})
            if opt:
                options_total += opt.get("price", 0)
                selected_options.append({"id": str(opt["_id"]), "name": opt["name"], "price": opt["price"]})

        unit_price = (variant or {}).get("price", product.get("price", 0))
        item_total = (unit_price + options_total) * item.get("quantity", 1)
        subtotal += item_total

        enriched_items.append({
            "cart_item_id": item.get("cart_item_id"),
            "product_id": item["product_id"],
            "product_name": product.get("name", ""),
            "product_image": product.get("main_image", ""),
            "variant_id": item.get("variant_id"),
            "variant_name": variant.get("name", "") if variant else None,
            "selected_options": selected_options,
            "unit_price": unit_price,
            "options_total": options_total,
            "quantity": item.get("quantity", 1),
            "item_total": item_total,
        })

    tps = round(subtotal * 0.05, 2)
    tvq = round(subtotal * 0.09975, 2)
    total = round(subtotal + tps + tvq, 2)

    return {
        "success": True,
        "data": {
            "items": enriched_items,
            "subtotal": subtotal,
            "tps": tps,
            "tvq": tvq,
            "total": total,
        }
    }


@router.post("/cart/{session_id}/add")
async def add_to_cart(session_id: str, item: dict):
    """Ajouter un article au panier"""
    db = get_database()
    cart_item = {
        "cart_item_id": str(uuid.uuid4()),
        "product_id": item.get("product_id"),
        "variant_id": item.get("variant_id"),
        "selected_option_ids": item.get("selected_option_ids", []),
        "quantity": item.get("quantity", 1),
    }

    existing = await db.carts.find_one({"session_id": session_id})
    if existing:
        await db.carts.update_one(
            {"session_id": session_id},
            {"$push": {"items": cart_item}, "$set": {"updated_at": datetime.now(timezone.utc)}}
        )
    else:
        await db.carts.insert_one({
            "session_id": session_id,
            "items": [cart_item],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        })

    return {"success": True, "message": "Article ajouté au panier", "cart_item_id": cart_item["cart_item_id"]}


@router.put("/cart/{session_id}/item/{cart_item_id}")
async def update_cart_item(session_id: str, cart_item_id: str, update: dict):
    """Modifier un article du panier (quantité)"""
    db = get_database()
    quantity = update.get("quantity", 1)
    if quantity < 1:
        await db.carts.update_one(
            {"session_id": session_id},
            {"$pull": {"items": {"cart_item_id": cart_item_id}}}
        )
    else:
        await db.carts.update_one(
            {"session_id": session_id, "items.cart_item_id": cart_item_id},
            {"$set": {"items.$.quantity": quantity, "updated_at": datetime.now(timezone.utc)}}
        )
    return {"success": True, "message": "Panier mis à jour"}


@router.delete("/cart/{session_id}/item/{cart_item_id}")
async def remove_from_cart(session_id: str, cart_item_id: str):
    """Retirer un article du panier"""
    db = get_database()
    await db.carts.update_one(
        {"session_id": session_id},
        {"$pull": {"items": {"cart_item_id": cart_item_id}}}
    )
    return {"success": True, "message": "Article retiré du panier"}


@router.delete("/cart/{session_id}")
async def clear_cart(session_id: str):
    """Vider le panier"""
    db = get_database()
    await db.carts.delete_one({"session_id": session_id})
    return {"success": True, "message": "Panier vidé"}
