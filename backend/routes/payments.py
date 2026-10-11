from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_database
from bson import ObjectId
from email_service import email_service
from sales_tax import compute_taxes
import stripe
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

# Configuration Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CreateCheckoutSession(BaseModel):
    # Tout le panier (recommandé) ; kit_id reste accepté pour un achat d'un seul plan
    cart_session_id: Optional[str] = None
    kit_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    include_materials: bool = False
    notes: Optional[str] = None
    success_url: str
    cancel_url: str


def _with_params(url: str, params: str) -> str:
    """Ajoute des paramètres à une adresse qui en a peut-être déjà (?a=1 -> ?a=1&b=2)"""
    return url + ("&" if "?" in url else "?") + params


async def _items_from_kit(db, data: CreateCheckoutSession) -> dict:
    if not data.kit_id or not ObjectId.is_valid(data.kit_id):
        raise HTTPException(status_code=400, detail="Panier vide")
    kit = await db.products.find_one({"_id": ObjectId(data.kit_id), "is_active": True})
    if not kit:
        raise HTTPException(status_code=404, detail="Plan introuvable")
    items = [{"product_id": str(kit["_id"]), "product_name": kit["name"], "variant_name": None,
              "selected_options": [], "unit_price": kit["price"], "options_total": 0,
              "quantity": 1, "item_total": kit["price"]}]
    subtotal = kit["price"]
    if data.include_materials and kit.get("materials_list_enabled") and kit.get("materials_list_price"):
        items.append({"product_id": str(kit["_id"]), "product_name": "Liste des matériaux", "variant_name": None,
                      "selected_options": [], "unit_price": kit["materials_list_price"], "options_total": 0,
                      "quantity": 1, "item_total": kit["materials_list_price"]})
        subtotal += kit["materials_list_price"]
    return {"items": items, "subtotal": subtotal, **compute_taxes(subtotal)}


@router.post("/create-checkout-session")
async def create_checkout_session(data: CreateCheckoutSession):
    """Créer une session de paiement Stripe pour tout le panier (prix calculés par le serveur)"""
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=503, detail="Le paiement par carte n'est pas encore activé")
        db = get_database()

        if data.cart_session_id:
            from routes.collection import compute_cart
            cart = await compute_cart(db, data.cart_session_id)
        else:
            cart = await _items_from_kit(db, data)
        if not cart["items"] or cart["subtotal"] <= 0:
            raise HTTPException(status_code=400, detail="Panier vide")

        def label(it):
            parts = [it["product_name"]]
            if it.get("variant_name"):
                parts.append(it["variant_name"])
            return " – ".join(parts)

        kit_name = ", ".join(label(it) for it in cart["items"])
        order_count = await db.kit_orders.count_documents({})
        order_number = f"KIT-{datetime.utcnow().strftime('%Y%m')}-{(order_count + 1):04d}"

        order_doc = {
            "order_number": order_number,
            "kit_id": cart["items"][0]["product_id"],
            "kit_name": kit_name,
            "items": cart["items"],
            "cart_session_id": data.cart_session_id,
            "customer_name": data.customer_name,
            "customer_email": data.customer_email,
            "customer_phone": data.customer_phone,
            "include_materials": False,
            "base_price": cart["subtotal"],
            "materials_price": 0.0,
            "subtotal": cart["subtotal"],
            "tax_amount": cart["tax_amount"],
            "total_amount": cart["total"],
            "currency": "CAD",
            "status": "pending",
            "payment_method": "stripe",
            "payment_confirmed_at": None,
            "stripe_session_id": None,
            "files_sent": False,
            "files_sent_at": None,
            "notes": data.notes,
            "admin_notes": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await db.kit_orders.insert_one(order_doc)
        order_id = str(result.inserted_id)

        line_items = []
        for it in cart["items"]:
            options = ", ".join(o["name"] for o in it.get("selected_options", []))
            product_data = {"name": label(it)}
            if options:
                product_data["description"] = f"Options : {options}"
            line_items.append({
                "price_data": {
                    "currency": "cad",
                    "product_data": product_data,
                    "unit_amount": int(round((it["unit_price"] + it.get("options_total", 0)) * 100)),
                },
                "quantity": it.get("quantity", 1),
            })
        for name, amount in (("TPS (5 %)", cart["tps"]), ("TVQ (9,975 %)", cart["tvq"])):
            if amount > 0:
                line_items.append({
                    "price_data": {"currency": "cad", "product_data": {"name": name}, "unit_amount": int(round(amount * 100))},
                    "quantity": 1,
                })

        # « card » inclut Google Pay et Apple Pay
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=_with_params(data.success_url, f"order_id={order_id}&session_id={{CHECKOUT_SESSION_ID}}"),
            cancel_url=_with_params(data.cancel_url, f"order_id={order_id}"),
            customer_email=data.customer_email,
            payment_intent_data={"description": f"Abrisia Plan - {order_number}"},
            metadata={"order_id": order_id, "order_number": order_number},
        )
        await db.kit_orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"stripe_session_id": checkout_session.id}})

        logger.info(f"✅ Session Stripe créée pour la commande {order_number} ({len(cart['items'])} article(s))")
        return {"success": True, "sessionId": checkout_session.id, "url": checkout_session.url,
                "orderNumber": order_number, "orderId": order_id}

    except stripe.error.StripeError as e:
        logger.error(f"❌ Erreur Stripe: {e}")
        raise HTTPException(status_code=400, detail="Le paiement n'a pas pu démarrer. Réessayez plus tard.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création session: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du paiement")


async def _mark_order_paid(db, order: dict) -> bool:
    """Passe la commande à « payée » une seule fois, puis envoie courriels et Zoho.
    Retourne False si elle était déjà payée (pas de doublon de courriels)."""
    res = await db.kit_orders.update_one(
        {"_id": order["_id"], "status": {"$ne": "paid"}},
        {"$set": {"status": "paid", "payment_confirmed_at": datetime.utcnow(), "updated_at": datetime.utcnow()}},
    )
    if res.modified_count == 0:
        return False
    order["status"] = "paid"
    if order.get("cart_session_id"):
        await db.carts.delete_one({"session_id": order["cart_session_id"]})
    try:
        email_service.send_kit_order_confirmation_to_client(order)
        email_service.send_kit_order_notification_to_admin(order)
    except Exception as email_error:
        logger.warning(f"⚠️ Erreur envoi email: {email_error}")
    try:
        from routes.zoho import save_lead
        name_parts = (order.get("customer_name") or "Client").split()
        await save_lead("purchase", {
            "first_name": name_parts[0],
            "last_name": " ".join(name_parts[1:]) or name_parts[0],
            "email": order["customer_email"],
            "phone": order.get("customer_phone", ""),
            "model_name": order["kit_name"],
            "amount": order["total_amount"],
        }, {
            "Deal_Name": f"{order['kit_name']} - {order.get('customer_name', '')}",
            "Stage": "Closed Won",
            "Amount": order["total_amount"],
            "Description": f"Achat: {order['kit_name']}\nEmail: {order['customer_email']}\nCommande: {order['order_number']}",
        })
    except Exception as zoho_err:
        logger.warning(f"⚠️ Zoho lead échoué: {zoho_err}")
    logger.info(f"✅ Paiement confirmé pour commande {order['order_number']}")
    return True


def _order_summary(order: dict) -> dict:
    return {
        "orderNumber": order["order_number"],
        "kitName": order["kit_name"],
        "totalAmount": order["total_amount"],
        "customerEmail": order["customer_email"],
    }


@router.get("/verify-payment/{order_id}")
async def verify_payment(order_id: str, session_id: Optional[str] = None):
    """Vérifier le paiement auprès de Stripe au retour du client"""
    try:
        db = get_database()
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="ID commande invalide")
        order = await db.kit_orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Commande non trouvée")

        # On ne se fie qu'à la session enregistrée : impossible de « prouver » un paiement avec une autre
        sid = order.get("stripe_session_id")
        if sid and order["status"] != "paid" and stripe.api_key:
            try:
                session = stripe.checkout.Session.retrieve(sid)
                if session.payment_status == "paid":
                    await _mark_order_paid(db, order)
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erreur vérification Stripe: {e}")

        return {"success": True, "status": order["status"], "order": _order_summary(order)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur vérification paiement: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la vérification")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Avis de paiement envoyé par Stripe (seulement s'il est signé par Stripe)"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret or not sig_header:
        # Sans signature vérifiable, on ignore : la vérification au retour du client suffit
        raise HTTPException(status_code=400, detail="Webhook non configuré")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        logger.warning(f"Webhook Stripe refusé : {e}")
        raise HTTPException(status_code=400, detail="Signature invalide")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = (session.get("metadata") or {}).get("order_id")
        if order_id and ObjectId.is_valid(order_id) and session.get("payment_status") == "paid":
            db = get_database()
            order = await db.kit_orders.find_one({"_id": ObjectId(order_id)})
            if order:
                await _mark_order_paid(db, order)
    return {"status": "success"}


@router.get("/config")
async def get_stripe_config():
    """Retourner la clé publique Stripe pour le frontend"""
    return {
        "publishableKey": os.getenv("STRIPE_PUBLISHABLE_KEY")
    }
