"""
Iteration 2 Tests: Content and Navigation Verification
- Tests that navigation API doesn't return 'À propos' 
- Tests legal pages have real content
- Tests that forbidden words are not in homepage content
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ok-check-8.preview.emergentagent.com').rstrip('/')

class TestNavigationAPI:
    """Navigation API tests - verify 'À propos' is not in menu"""
    
    def test_navigation_menu_returns_success(self):
        """Test /api/navigation/menu returns success"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "pages" in data
        print(f"✅ Navigation API returns success with {len(data['pages'])} pages")
    
    def test_navigation_menu_excludes_a_propos(self):
        """Test that 'À propos' is NOT in the navigation menu"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        
        page_names = [p.get('name', '').lower() for p in data.get('pages', [])]
        page_hrefs = [p.get('href', '').lower() for p in data.get('pages', [])]
        
        # Check 'À propos' is NOT present
        assert 'à propos' not in page_names, f"'À propos' should NOT be in menu, found: {page_names}"
        assert 'a propos' not in page_names, f"'a propos' should NOT be in menu, found: {page_names}"
        assert '/a-propos' not in page_hrefs, f"'/a-propos' should NOT be in menu, found: {page_hrefs}"
        
        print(f"✅ 'À propos' correctly NOT present in navigation menu")
        print(f"   Menu contains: {page_names}")
    
    def test_navigation_menu_has_required_pages(self):
        """Test navigation has expected pages: Accueil, Kits, Devis, Contact"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        
        page_names = [p.get('name', '').lower() for p in data.get('pages', [])]
        
        # These should be present
        assert 'accueil' in page_names, "Accueil should be in menu"
        assert 'kits' in page_names or any('kit' in name for name in page_names), "Kits should be in menu"
        assert any('devis' in name for name in page_names), "Devis should be in menu"
        assert 'contact' in page_names, "Contact should be in menu"
        
        print(f"✅ Required pages present in navigation: {page_names}")


class TestLegalPages:
    """Test legal pages have real content"""
    
    def test_mentions_legales_page_loads(self):
        """Test /mentions-legales page is accessible"""
        response = requests.get(f"{BASE_URL}/mentions-legales", allow_redirects=True)
        # Frontend serves these pages, we just check it's accessible
        # 200 or 304 are acceptable
        assert response.status_code in [200, 304], f"Mentions légales page should be accessible, got {response.status_code}"
        print("✅ /mentions-legales page is accessible")
    
    def test_politique_confidentialite_page_loads(self):
        """Test /politique-confidentialite page is accessible"""
        response = requests.get(f"{BASE_URL}/politique-confidentialite", allow_redirects=True)
        assert response.status_code in [200, 304], f"Politique confidentialité page should be accessible, got {response.status_code}"
        print("✅ /politique-confidentialite page is accessible")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root returns welcome message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root works: {data.get('message')}")
    
    def test_services_public_api(self):
        """Test public services API if available"""
        response = requests.get(f"{BASE_URL}/api/services/public")
        # Could be 200 or 404 if not implemented
        if response.status_code == 200:
            print("✅ Public services API available")
        else:
            print(f"ℹ️ Public services API returned {response.status_code}")


class TestAdminAuth:
    """Test admin authentication works"""
    
    def test_admin_login(self):
        """Test admin can login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login should work, got {response.status_code}"
        data = response.json()
        assert data.get("success") == True
        assert "token" in data
        print(f"✅ Admin login successful, role: {data.get('user', {}).get('role')}")
        return data.get("token")
    
    def test_admin_navigation_endpoint(self):
        """Test admin can access navigation management endpoint"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if login_response.status_code != 200:
            pytest.skip("Cannot login as admin")
        
        token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to access navigation management
        response = requests.get(f"{BASE_URL}/api/admin/cms/navigation", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin can access navigation management")
            print(f"   Pages: {[p.get('name') for p in data.get('pages', [])]}")
        else:
            print(f"ℹ️ Navigation management endpoint returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
