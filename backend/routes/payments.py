from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_database
from bson import ObjectId
from email_service import email_service
import stripe
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

# Configuration Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CreateCheckoutSession(BaseModel):
    kit_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    include_materials: bool = False
    notes: Optional[str] = None
    success_url: str
    cancel_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(data: CreateCheckoutSession):
    """Créer une session de paiement Stripe"""
    try:
        db = get_database()
        
        # Vérifier que le kit existe
        if not ObjectId.is_valid(data.kit_id):
            raise HTTPException(status_code=400, detail="ID kit invalide")
        
        kit = await db.products.find_one({
            "_id": ObjectId(data.kit_id),
            "is_active": True
        })
        
        if not kit:
            raise HTTPException(status_code=404, detail="Kit non trouvé")
        
        # Calculer le prix
        base_price = kit["price"]
        materials_price = 0.0
        
        if data.include_materials and kit.get("materials_list_enabled"):
            materials_price = kit.get("materials_list_price", 0) or 0
        
        subtotal = base_price + materials_price
        tax_rate = 14.975  # TPS+TVQ
        tax_amount = round(subtotal * tax_rate / 100, 2)
        total_amount = round(subtotal + tax_amount, 2)
        
        # Générer numéro de commande
        order_count = await db.kit_orders.count_documents({})
        order_number = f"KIT-{datetime.utcnow().strftime('%Y%m')}-{(order_count + 1):04d}"
        
        # Créer la commande en base (status pending)
        order_doc = {
            "order_number": order_number,
            "kit_id": str(kit["_id"]),
            "kit_name": kit["name"],
            "designer_name": kit.get("designer_name"),
            "customer_name": data.customer_name,
            "customer_email": data.customer_email,
            "customer_phone": data.customer_phone,
            "include_materials": data.include_materials,
            "base_price": base_price,
            "materials_price": materials_price,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
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
        
        # Préparer les line items pour Stripe
        line_items = [
            {
                "price_data": {
                    "currency": "cad",
                    "product_data": {
                        "name": f"Kit: {kit['name']}",
                        "description": kit.get("description", "Plan architectural"),
                    },
                    "unit_amount": int(base_price * 100),  # Stripe utilise les cents
                },
                "quantity": 1,
            }
        ]
        
        if data.include_materials and materials_price > 0:
            line_items.append({
                "price_data": {
                    "currency": "cad",
                    "product_data": {
                        "name": "Liste des matériaux",
                        "description": "Liste complète des matériaux avec quantités",
                    },
                    "unit_amount": int(materials_price * 100),
                },
                "quantity": 1,
            })
        
        # Ajouter les taxes comme line item
        line_items.append({
            "price_data": {
                "currency": "cad",
                "product_data": {
                    "name": "Taxes (TPS + TVQ)",
                    "description": "Taxes québécoises",
                },
                "unit_amount": int(tax_amount * 100),
            },
            "quantity": 1,
        })
        
        # Créer la session Stripe (card inclut Google Pay & Apple Pay automatiquement)
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{data.success_url}?order_id={order_id}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{data.cancel_url}?order_id={order_id}",
            customer_email=data.customer_email,
            payment_intent_data={
                "description": f"Abrisia Plan - {kit['name']}"
            },
            metadata={
                "order_id": order_id,
                "order_number": order_number,
                "kit_name": kit["name"],
                "include_materials": str(data.include_materials)
            }
        )
        
        # Mettre à jour la commande avec l'ID de session Stripe
        await db.kit_orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"stripe_session_id": checkout_session.id}}
        )
        
        logger.info(f"✅ Session Stripe créée: {checkout_session.id} pour commande {order_number}")
        
        return {
            "success": True,
            "sessionId": checkout_session.id,
            "url": checkout_session.url,
            "orderNumber": order_number,
            "orderId": order_id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"❌ Erreur Stripe: {e}")
        raise HTTPException(status_code=400, detail=f"Erreur de paiement: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur création session: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création du paiement")


@router.get("/verify-payment/{order_id}")
async def verify_payment(order_id: str, session_id: Optional[str] = None):
    """Vérifier le statut d'un paiement après redirection Stripe"""
    try:
        db = get_database()
        
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="ID commande invalide")
        
        order = await db.kit_orders.find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        # Vérifier le statut avec Stripe si on a un session_id
        if session_id or order.get("stripe_session_id"):
            sid = session_id or order.get("stripe_session_id")
            try:
                session = stripe.checkout.Session.retrieve(sid)
                
                if session.payment_status == "paid" and order["status"] != "paid":
                    # Mettre à jour la commande comme payée
                    await db.kit_orders.update_one(
                        {"_id": ObjectId(order_id)},
                        {
                            "$set": {
                                "status": "paid",
                                "payment_confirmed_at": datetime.utcnow(),
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
                    
                    # Envoyer les emails de confirmation
                    order["status"] = "paid"
                    order["payment_confirmed_at"] = datetime.utcnow()
                    
                    try:
                        email_service.send_kit_order_confirmation_to_client(order)
                        email_service.send_kit_order_notification_to_admin(order)
                    except Exception as email_error:
                        logger.warning(f"⚠️ Erreur envoi email: {email_error}")
                    
                    # Créer un lead Zoho pour l'achat
                    try:
                        from routes.zoho import save_lead
                        zoho_deal = {
                            "Deal_Name": f"{order['kit_name']} - {order['customer_name']}",
                            "Stage": "Closed Won",
                            "Amount": order["total_amount"],
                            "Description": f"Achat: {order['kit_name']}\nEmail: {order['customer_email']}\nCommande: {order['order_number']}",
                        }
                        await save_lead("purchase", {
                            "first_name": order["customer_name"].split()[0],
                            "last_name": " ".join(order["customer_name"].split()[1:]) or order["customer_name"],
                            "email": order["customer_email"],
                            "phone": order.get("customer_phone", ""),
                            "model_name": order["kit_name"],
                            "amount": order["total_amount"],
                        }, zoho_deal)
                    except Exception as zoho_err:
                        logger.warning(f"⚠️ Zoho lead échoué: {zoho_err}")
                    
                    logger.info(f"✅ Paiement confirmé pour commande {order['order_number']}")
                    
                    return {
                        "success": True,
                        "status": "paid",
                        "message": "Paiement confirmé !",
                        "order": {
                            "orderNumber": order["order_number"],
                            "kitName": order["kit_name"],
                            "totalAmount": order["total_amount"],
                            "customerEmail": order["customer_email"]
                        }
                    }
                    
            except stripe.error.StripeError as e:
                logger.error(f"❌ Erreur vérification Stripe: {e}")
        
        # Retourner le statut actuel
        return {
            "success": True,
            "status": order["status"],
            "order": {
                "orderNumber": order["order_number"],
                "kitName": order["kit_name"],
                "totalAmount": order["total_amount"],
                "customerEmail": order["customer_email"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur vérification paiement: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la vérification")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Webhook Stripe pour les événements de paiement"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            # Mode test sans webhook secret
            import json
            event = json.loads(payload)
        
        # Gérer l'événement checkout.session.completed
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            order_id = session.get("metadata", {}).get("order_id")
            
            if order_id:
                db = get_database()
                await db.kit_orders.update_one(
                    {"_id": ObjectId(order_id)},
                    {
                        "$set": {
                            "status": "paid",
                            "payment_confirmed_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                logger.info(f"✅ Webhook: Paiement confirmé pour {order_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"❌ Erreur webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/config")
async def get_stripe_config():
    """Retourner la clé publique Stripe pour le frontend"""
    return {
        "publishableKey": os.getenv("STRIPE_PUBLISHABLE_KEY")
    }
