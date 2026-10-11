"""Taxes de vente (TPS 5 % + TVQ 9,975 %).

Une entreprise doit percevoir ces taxes seulement si elle est inscrite à la TPS/TVQ
(obligatoire au-delà de 30 000 $ de ventes par année ; facultatif avant).
Sur Render : CHARGE_SALES_TAX=false pour ne pas facturer de taxes.
"""
import os

TPS_RATE = 0.05
TVQ_RATE = 0.09975


def taxes_enabled() -> bool:
    return os.getenv("CHARGE_SALES_TAX", "true").strip().lower() not in ("false", "0", "non", "no")


def compute_taxes(subtotal: float) -> dict:
    if not taxes_enabled():
        return {"tps": 0.0, "tvq": 0.0, "tax_amount": 0.0, "total": round(subtotal, 2)}
    tps = round(subtotal * TPS_RATE, 2)
    tvq = round(subtotal * TVQ_RATE, 2)
    return {"tps": tps, "tvq": tvq, "tax_amount": round(tps + tvq, 2), "total": round(subtotal + tps + tvq, 2)}
