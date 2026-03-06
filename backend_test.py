#!/usr/bin/env python3
"""
Tests complets pour l'API Abrisia Plan
Teste tous les endpoints selon les spécifications du review_request
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://web-branches.preview.emergentagent.com"  # Use external URL from frontend/.env
API_BASE = f"{BASE_URL}/api"

# Données de test
ADMIN_CREDENTIALS = {
    "email": "admin@abrisia-plan.ca",
    "password": "admin123"
}

DEVIS_TEST_DATA = {
    "nom": "Jean Tremblay",
    "email": "jean.tremblay@email.com",
    "telephone": "514-555-0123",
    "projectType": "Mini-maison sur fondations",
    "plansChoisis": ["architecture", "fondation"],
    "notes": "Projet test pour mini-maison écologique avec fondations permanentes"
}

# Nouvelles données de test pour les nouvelles options de devis
DEVIS_NEW_OPTIONS_TEST_DATA = {
    "nom": "Marie Bouchard",
    "email": "marie.bouchard@email.com",
    "telephone": "418-555-0456",
    "projectType": "Extension/Verrière",
    "plansChoisis": ["ebenisterie", "accompagnement", "extension"],
    "notes": "Projet d'extension avec verrière et ébénisterie sur mesure, avec accompagnement autoconstruction"
}

DEVIS_STRUCTURES_EXTERIEURES_TEST_DATA = {
    "nom": "Pierre Gagnon",
    "email": "pierre.gagnon@email.com",
    "telephone": "418-555-0789",
    "projectType": "Structures extérieures",
    "plansChoisis": ["abris", "garage", "gazebo", "galerie", "coin_cuisine"],
    "notes": "Projet complet de structures extérieures: abri, garage, gazebo avec galerie et coin cuisine extérieur"
}

class AbrisiaAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Enregistrer le résultat d'un test"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        if details and not success:
            print(f"   Détails: {details}")
    
    def test_health_check(self):
        """Test de santé de l'API"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"API disponible - {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Erreur de connexion: {str(e)}")
            return False
    
    def test_api_root(self):
        """Test de la route racine de l'API"""
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Root", True, f"Route racine accessible - {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("API Root", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Erreur: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test de connexion admin"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=ADMIN_CREDENTIALS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    user = data.get("user", {})
                    self.log_test(
                        "Admin Login", 
                        True, 
                        f"Connexion réussie pour {user.get('name', 'Admin')}"
                    )
                    return True
                else:
                    self.log_test("Admin Login", False, "Réponse invalide", data)
                    return False
            else:
                self.log_test("Admin Login", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Login", False, f"Erreur: {str(e)}")
            return False
    
    def test_admin_logout(self):
        """Test de déconnexion admin"""
        try:
            response = self.session.post(f"{API_BASE}/auth/logout", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Admin Logout", True, "Déconnexion réussie")
                    return True
                else:
                    self.log_test("Admin Logout", False, "Réponse invalide", data)
                    return False
            else:
                self.log_test("Admin Logout", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Admin Logout", False, f"Erreur: {str(e)}")
            return False
    
    def test_submit_devis(self):
        """Test de soumission de devis (public)"""
        try:
            response = self.session.post(
                f"{API_BASE}/devis",
                json=DEVIS_TEST_DATA,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("devis"):
                    devis_id = data["devis"].get("id")
                    self.log_test(
                        "Submit Devis", 
                        True, 
                        f"Devis soumis avec succès - ID: {devis_id}"
                    )
                    return devis_id
                else:
                    self.log_test("Submit Devis", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Submit Devis", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Submit Devis", False, f"Erreur: {str(e)}")
            return None

    def test_submit_devis_new_options(self):
        """Test de soumission de devis avec nouvelles options (ébénisterie, accompagnement, extension/verrière)"""
        try:
            response = self.session.post(
                f"{API_BASE}/devis",
                json=DEVIS_NEW_OPTIONS_TEST_DATA,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("devis"):
                    devis_id = data["devis"].get("id")
                    self.log_test(
                        "Submit Devis New Options", 
                        True, 
                        f"Devis avec nouvelles options soumis avec succès - ID: {devis_id}"
                    )
                    return devis_id
                else:
                    self.log_test("Submit Devis New Options", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Submit Devis New Options", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Submit Devis New Options", False, f"Erreur: {str(e)}")
            return None
    
    def test_submit_devis_structures_exterieures(self):
        """Test de soumission de devis avec structures extérieures (abris/garage/gazebo/galerie/coin cuisine)"""
        try:
            response = self.session.post(
                f"{API_BASE}/devis",
                json=DEVIS_STRUCTURES_EXTERIEURES_TEST_DATA,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("devis"):
                    devis_id = data["devis"].get("id")
                    self.log_test(
                        "Submit Devis Structures Extérieures", 
                        True, 
                        f"Devis structures extérieures soumis avec succès - ID: {devis_id}"
                    )
                    return devis_id
                else:
                    self.log_test("Submit Devis Structures Extérieures", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Submit Devis Structures Extérieures", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Submit Devis Structures Extérieures", False, f"Erreur: {str(e)}")
            return None
    
    def test_get_admin_devis(self):
        """Test de récupération des devis (admin)"""
        if not self.token:
            self.log_test("Get Admin Devis", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/devis",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    devis_count = len(data["data"])
                    total = data.get("total", 0)
                    self.log_test(
                        "Get Admin Devis", 
                        True, 
                        f"Récupération réussie - {devis_count} devis affichés sur {total} total"
                    )
                    return data["data"]
                else:
                    self.log_test("Get Admin Devis", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Get Admin Devis", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Admin Devis", False, f"Erreur: {str(e)}")
            return None
    
    def test_get_admin_stats(self):
        """Test de récupération des statistiques (admin)"""
        if not self.token:
            self.log_test("Get Admin Stats", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "total_devis" in data:
                    stats_summary = f"Total devis: {data.get('total_devis', 0)}, En attente: {data.get('pending_devis', 0)}, En cours: {data.get('active_devis', 0)}"
                    self.log_test(
                        "Get Admin Stats", 
                        True, 
                        f"Statistiques récupérées - {stats_summary}"
                    )
                    return data
                else:
                    self.log_test("Get Admin Stats", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Get Admin Stats", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Admin Stats", False, f"Erreur: {str(e)}")
            return None
    
    def test_update_devis_status(self, devis_id):
        """Test de mise à jour du statut d'un devis"""
        if not self.token or not devis_id:
            self.log_test("Update Devis Status", False, "Token ou ID devis manquant")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            update_data = {
                "status": "En cours",
                "assigned_designer": "Marc Dessinateur"  # Changed from assigned_to to assigned_designer
            }
            
            response = self.session.put(
                f"{API_BASE}/admin/devis/{devis_id}/status",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test(
                        "Update Devis Status", 
                        True, 
                        f"Statut mis à jour vers 'En cours' et assigné à Marc Dessinateur"
                    )
                    return True
                else:
                    self.log_test("Update Devis Status", False, "Réponse invalide", data)
                    return False
            else:
                self.log_test("Update Devis Status", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Update Devis Status", False, f"Erreur: {str(e)}")
            return False
    
    def test_get_designers(self):
        """Test de récupération des dessinateurs (admin)"""
        if not self.token:
            self.log_test("Get Designers", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/designers",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    designers_count = len(data["data"])
                    designers_names = [d.get("name", "N/A") for d in data["data"]]
                    self.log_test(
                        "Get Designers", 
                        True, 
                        f"Récupération réussie - {designers_count} dessinateurs: {', '.join(designers_names)}"
                    )
                    return data["data"]
                else:
                    self.log_test("Get Designers", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Get Designers", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Designers", False, f"Erreur: {str(e)}")
            return None
    
    def test_get_public_projects(self):
        """Test de récupération des projets publics"""
        try:
            response = self.session.get(f"{API_BASE}/projects", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    projects_count = len(data["data"])
                    total = data.get("total", 0)
                    self.log_test(
                        "Get Public Projects", 
                        True, 
                        f"Récupération réussie - {projects_count} projets affichés sur {total} total"
                    )
                    return data["data"]
                else:
                    self.log_test("Get Public Projects", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Get Public Projects", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Public Projects", False, f"Erreur: {str(e)}")
            return None
    
    def test_get_categories(self):
        """Test de récupération des catégories"""
        try:
            response = self.session.get(f"{API_BASE}/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "categories" in data:
                    categories = data["categories"]
                    self.log_test(
                        "Get Categories", 
                        True, 
                        f"Récupération réussie - Catégories: {', '.join(categories)}"
                    )
                    return categories
                else:
                    self.log_test("Get Categories", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("Get Categories", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Get Categories", False, f"Erreur: {str(e)}")
            return None
    
    # ========== TESTS CMS ==========
    
    def test_cms_site_settings(self):
        """Test de récupération des paramètres du site (CMS)"""
        if not self.token:
            self.log_test("CMS Site Settings", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/cms/settings",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "settings" in data:
                    settings = data["settings"]
                    site_name = settings.get("site_name", "N/A")
                    self.log_test(
                        "CMS Site Settings", 
                        True, 
                        f"Paramètres récupérés - Site: {site_name}"
                    )
                    return settings
                else:
                    self.log_test("CMS Site Settings", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("CMS Site Settings", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CMS Site Settings", False, f"Erreur: {str(e)}")
            return None
    
    def test_cms_services(self):
        """Test de récupération des services et prix (CMS)"""
        if not self.token:
            self.log_test("CMS Services", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/cms/services",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    services = data["data"]
                    services_count = len(services)
                    total = data.get("total", 0)
                    self.log_test(
                        "CMS Services", 
                        True, 
                        f"Services récupérés - {services_count} services sur {total} total"
                    )
                    return services
                else:
                    self.log_test("CMS Services", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("CMS Services", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CMS Services", False, f"Erreur: {str(e)}")
            return None
    
    def test_cms_upload_media(self):
        """Test d'upload de média (CMS)"""
        if not self.token:
            self.log_test("CMS Upload Media", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            
            # Créer un fichier test simple (image 1x1 pixel PNG)
            test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
            
            files = {
                'file': ('test_image.png', test_image_data, 'image/png')
            }
            data = {
                'category': 'test',
                'alt_text': 'Image de test pour CMS'
            }
            
            response = self.session.post(
                f"{API_BASE}/admin/cms/upload-media",
                headers=headers,
                files=files,
                data=data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("fileUrl"):
                    file_url = data["fileUrl"]
                    file_id = data.get("fileId", "N/A")
                    self.log_test(
                        "CMS Upload Media", 
                        True, 
                        f"Upload réussi - URL: {file_url}, ID: {file_id}"
                    )
                    return data
                else:
                    self.log_test("CMS Upload Media", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("CMS Upload Media", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CMS Upload Media", False, f"Erreur: {str(e)}")
            return None
    
    def test_cms_media_management(self):
        """Test de gestion des médias (CMS)"""
        if not self.token:
            self.log_test("CMS Media Management", False, "Token manquant")
            return None
        
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = self.session.get(
                f"{API_BASE}/admin/cms/media",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    media_files = data["data"]
                    media_count = len(media_files)
                    total = data.get("total", 0)
                    self.log_test(
                        "CMS Media Management", 
                        True, 
                        f"Médias récupérés - {media_count} fichiers sur {total} total"
                    )
                    return media_files
                else:
                    self.log_test("CMS Media Management", False, "Réponse invalide", data)
                    return None
            else:
                self.log_test("CMS Media Management", False, f"Status code: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CMS Media Management", False, f"Erreur: {str(e)}")
            return None
    
    def test_authentication_flow(self):
        """Test du flow complet d'authentification"""
        print("\n=== TEST FLOW AUTHENTIFICATION ===")
        
        # Test login
        login_success = self.test_admin_login()
        if not login_success:
            return False
        
        # Test logout
        logout_success = self.test_admin_logout()
        
        # Re-login pour les tests suivants
        if logout_success:
            self.test_admin_login()
        
        return login_success and logout_success
    
    def test_devis_flow(self):
        """Test du flow complet des devis avec nouvelles options"""
        print("\n=== TEST FLOW DEVIS AVEC NOUVELLES OPTIONS ===")
        
        # 1. Soumission de devis classique
        devis_id_1 = self.test_submit_devis()
        if not devis_id_1:
            return False
        
        # 2. Soumission de devis avec nouvelles options (ébénisterie, accompagnement, extension/verrière)
        devis_id_2 = self.test_submit_devis_new_options()
        if not devis_id_2:
            return False
        
        # 3. Soumission de devis avec structures extérieures
        devis_id_3 = self.test_submit_devis_structures_exterieures()
        if not devis_id_3:
            return False
        
        # 4. Récupération des devis (admin)
        devis_list = self.test_get_admin_devis()
        if devis_list is None:
            return False
        
        # 5. Mise à jour du statut du premier devis
        status_updated = self.test_update_devis_status(devis_id_1)
        if not status_updated:
            return False
        
        # 6. Vérification des statistiques
        stats = self.test_get_admin_stats()
        if stats is None:
            return False
        
        return True
    
    def test_admin_management_flow(self):
        """Test du flow de gestion admin"""
        print("\n=== TEST FLOW GESTION ADMIN ===")
        
        # Test récupération des dessinateurs
        designers = self.test_get_designers()
        if designers is None:
            return False
        
        return True
    
    def test_public_content_flow(self):
        """Test du flow de contenu public"""
        print("\n=== TEST FLOW CONTENU PUBLIC ===")
        
        # Test récupération des projets
        projects = self.test_get_public_projects()
        if projects is None:
            return False
        
        # Test récupération des catégories
        categories = self.test_get_categories()
        if categories is None:
            return False
        
        return True
    
    def test_cms_flow(self):
        """Test du flow CMS complet"""
        print("\n=== TEST FLOW CMS ===")
        
        # Test récupération des paramètres du site
        settings = self.test_cms_site_settings()
        if settings is None:
            return False
        
        # Test récupération des services
        services = self.test_cms_services()
        if services is None:
            return False
        
        # Test upload de média
        upload_result = self.test_cms_upload_media()
        if upload_result is None:
            return False
        
        # Test gestion des médias
        media_files = self.test_cms_media_management()
        if media_files is None:
            return False
        
        return True
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        print(f"🚀 Début des tests pour l'API Abrisia Plan")
        print(f"📍 URL de base: {BASE_URL}")
        print("=" * 60)
        
        # Tests de base
        print("\n=== TESTS DE BASE ===")
        health_ok = self.test_health_check()
        api_root_ok = self.test_api_root()
        
        if not health_ok and not api_root_ok:
            print("❌ L'API n'est pas accessible. Arrêt des tests.")
            return False
        
        # Tests des flows
        auth_ok = self.test_authentication_flow()
        devis_ok = self.test_devis_flow()
        admin_ok = self.test_admin_management_flow()
        public_ok = self.test_public_content_flow()
        cms_ok = self.test_cms_flow()
        
        # Résumé
        print("\n" + "=" * 60)
        print("📊 RÉSUMÉ DES TESTS")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total: {total_tests} tests")
        print(f"✅ Réussis: {passed_tests}")
        print(f"❌ Échoués: {failed_tests}")
        print(f"📈 Taux de réussite: {(passed_tests/total_tests)*100:.1f}%")
        
        # Tests échoués
        if failed_tests > 0:
            print(f"\n❌ TESTS ÉCHOUÉS ({failed_tests}):")
            for test in self.test_results:
                if not test["success"]:
                    print(f"  - {test['test']}: {test['message']}")
        
        # Flows principaux
        print(f"\n🔄 FLOWS PRINCIPAUX:")
        print(f"  - Authentification: {'✅' if auth_ok else '❌'}")
        print(f"  - Gestion devis: {'✅' if devis_ok else '❌'}")
        print(f"  - Gestion admin: {'✅' if admin_ok else '❌'}")
        print(f"  - Contenu public: {'✅' if public_ok else '❌'}")
        print(f"  - CMS: {'✅' if cms_ok else '❌'}")
        
        return failed_tests == 0

def main():
    """Fonction principale"""
    tester = AbrisiaAPITester()
    success = tester.run_all_tests()
    
    if success:
        print(f"\n🎉 TOUS LES TESTS SONT PASSÉS!")
        print(f"✅ L'API Abrisia Plan fonctionne correctement.")
    else:
        print(f"\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
        print(f"❌ Vérifiez les erreurs ci-dessus.")
    
    return success

if __name__ == "__main__":
    main()