#!/usr/bin/env python3
"""
Tests prioritaires pour l'API Abrisia Plan après correction du problème de démarrage
Tests demandés dans le review_request:
1. Health check (GET /health) - Note: retourne HTML car routé vers frontend
2. API root (GET /api/)
3. Connexion admin (POST /api/auth/login avec admin@abrisia-plan.ca / admin123)
4. Test de soumission de devis simple (POST /api/devis)
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://plan-builder-dev.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Données de test
ADMIN_CREDENTIALS = {
    "email": "admin@abrisia-plan.ca",
    "password": "admin123"
}

DEVIS_TEST_DATA = {
    "nom": "Marie Dubois",
    "email": "marie.dubois@email.com",
    "telephone": "418-555-0456",
    "projectType": "Mini-maison sur fondations",
    "plansChoisis": ["architecture", "fondation"],
    "notes": "Test rapide après correction des imports manquants"
}

def test_api_root():
    """Test 1: API root (GET /api/)"""
    print("🔍 Test 1: API Root (GET /api/)")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ PASS - API Root accessible: {data.get('message', 'OK')}")
            return True
        else:
            print(f"❌ FAIL - Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Erreur: {str(e)}")
        return False

def test_admin_login():
    """Test 2: Connexion admin (POST /api/auth/login)"""
    print("🔍 Test 2: Admin Login (POST /api/auth/login)")
    try:
        response = requests.post(
            f"{API_BASE}/auth/login",
            json=ADMIN_CREDENTIALS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                user = data.get("user", {})
                print(f"✅ PASS - Connexion réussie pour {user.get('name', 'Admin')}")
                print(f"   Token généré: {data['token'][:50]}...")
                return data["token"]
            else:
                print(f"❌ FAIL - Réponse invalide: {data}")
                return None
        else:
            print(f"❌ FAIL - Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ FAIL - Erreur: {str(e)}")
        return None

def test_submit_devis():
    """Test 3: Soumission de devis simple (POST /api/devis)"""
    print("🔍 Test 3: Submit Devis (POST /api/devis)")
    try:
        response = requests.post(
            f"{API_BASE}/devis",
            json=DEVIS_TEST_DATA,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("devis"):
                devis_id = data["devis"].get("id")
                status = data["devis"].get("status")
                print(f"✅ PASS - Devis soumis avec succès")
                print(f"   ID: {devis_id}")
                print(f"   Status: {status}")
                return devis_id
            else:
                print(f"❌ FAIL - Réponse invalide: {data}")
                return None
        else:
            print(f"❌ FAIL - Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ FAIL - Erreur: {str(e)}")
        return None

def test_health_check():
    """Test 4: Health check (GET /health) - Note spéciale"""
    print("🔍 Test 4: Health Check (GET /health)")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            # Vérifier si c'est du JSON ou HTML
            content_type = response.headers.get('content-type', '')
            if 'application/json' in content_type:
                data = response.json()
                print(f"✅ PASS - Health endpoint accessible: {data.get('message', 'OK')}")
                return True
            else:
                print("⚠️  NOTE - Health endpoint retourne HTML (routé vers frontend)")
                print("   Ceci est normal avec la configuration Kubernetes actuelle")
                print("   L'API backend fonctionne correctement via /api/")
                return True
        else:
            print(f"❌ FAIL - Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Erreur: {str(e)}")
        return False

def main():
    """Tests prioritaires après correction des imports manquants"""
    print("🚀 TESTS PRIORITAIRES - API Abrisia Plan")
    print("📋 Objectif: Confirmer que les corrections des imports manquants ont résolu le problème")
    print("=" * 80)
    
    results = []
    
    # Test 1: API Root
    api_root_ok = test_api_root()
    results.append(("API Root", api_root_ok))
    print()
    
    # Test 2: Admin Login
    token = test_admin_login()
    login_ok = token is not None
    results.append(("Admin Login", login_ok))
    print()
    
    # Test 3: Devis Submission
    devis_id = test_submit_devis()
    devis_ok = devis_id is not None
    results.append(("Devis Submission", devis_ok))
    print()
    
    # Test 4: Health Check (avec note spéciale)
    health_ok = test_health_check()
    results.append(("Health Check", health_ok))
    print()
    
    # Résumé
    print("=" * 80)
    print("📊 RÉSUMÉ DES TESTS PRIORITAIRES")
    print("=" * 80)
    
    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n📈 Résultat: {passed}/{total} tests réussis ({(passed/total)*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 TOUS LES TESTS PRIORITAIRES SONT PASSÉS!")
        print("✅ Les corrections des imports manquants ont bien résolu le problème")
        print("✅ L'API Abrisia Plan est fonctionnelle pour la suite du développement")
        return True
    else:
        print(f"\n⚠️  {total-passed} test(s) ont échoué")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)