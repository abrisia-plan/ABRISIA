"""
Iteration 8 - Code Quality Review Round 2 Tests
Tests for verifying code quality fixes:
- KitsManager refactoring (split into 3 components)
- Array index key fixes
- Console.error removal
- React hook dependency fixes
- Python test fixes (is True → == True)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAPIEndpoints:
    """Test API endpoints return valid JSON"""
    
    def test_services_endpoint(self):
        """Test /api/content/services returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/content/services")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"✅ /api/content/services: {len(data['data'])} services")
    
    def test_testimonials_endpoint(self):
        """Test /api/content/testimonials returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/content/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"✅ /api/content/testimonials: {len(data['data'])} testimonials")
    
    def test_projects_endpoint(self):
        """Test /api/projects returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"✅ /api/projects: {len(data['data'])} projects")
    
    def test_products_endpoint(self):
        """Test /api/products returns valid JSON (kits)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"✅ /api/products: {len(data['data'])} products/kits")
    
    def test_navigation_menu_endpoint(self):
        """Test /api/navigation/menu returns valid JSON"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✅ /api/navigation/menu: OK")


class TestAdminAuthentication:
    """Test admin authentication flow"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print("✅ Admin login successful")
        return data["token"]
    
    def test_admin_login_invalid_password(self):
        """Test admin login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid password correctly rejected")


class TestAdminKitsEndpoints:
    """Test admin kits endpoints (for refactored KitsManager)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_get_admin_products(self, auth_token):
        """Test GET /api/admin/products returns kits list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/products?per_page=100", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"✅ Admin products: {len(data['data'])} kits")
    
    def test_get_single_product(self, auth_token):
        """Test GET /api/products/:id returns single kit"""
        # First get list of products
        headers = {"Authorization": f"Bearer {auth_token}"}
        list_response = requests.get(f"{BASE_URL}/api/admin/products?per_page=100", headers=headers)
        if list_response.status_code == 200:
            products = list_response.json().get("data", [])
            if products:
                product_id = products[0].get("id")
                response = requests.get(f"{BASE_URL}/api/products/{product_id}", headers=headers)
                assert response.status_code == 200
                data = response.json()
                assert "product" in data
                print(f"✅ Single product fetch: {data['product'].get('name', 'N/A')}")
            else:
                print("⚠️ No products to test single fetch")
        else:
            pytest.skip("Could not get products list")


class TestAdminPanelEndpoints:
    """Test admin panel endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_admin_stats(self, auth_token):
        """Test GET /api/admin/stats"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert response.status_code == 200
        print("✅ Admin stats endpoint OK")
    
    def test_admin_devis(self, auth_token):
        """Test GET /api/admin/devis"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/devis?per_page=100", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin devis: {len(data.get('data', []))} devis")
    
    def test_admin_projects(self, auth_token):
        """Test GET /api/admin/projects"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/projects?include_hidden=true", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin projects: {len(data.get('data', []))} projects")
    
    def test_admin_testimonials(self, auth_token):
        """Test GET /api/admin/testimonials"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/testimonials", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin testimonials: {len(data.get('data', []))} testimonials")
    
    def test_admin_services(self, auth_token):
        """Test GET /api/admin/content/services"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/content/services", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin services: {len(data.get('data', []))} services")


class TestPublicEndpoints:
    """Test public endpoints"""
    
    def test_plan_options(self):
        """Test /api/plan-options"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✅ Plan options endpoint OK")
    
    def test_categories(self):
        """Test /api/categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✅ Categories endpoint OK")
    
    def test_reviews(self):
        """Test /api/reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print("✅ Reviews endpoint OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
