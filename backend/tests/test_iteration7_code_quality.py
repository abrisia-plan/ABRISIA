"""
Iteration 7 - Code Quality Review Tests
Tests for:
1. Circular import fix (password_utils.py extraction)
2. ObjectId serialization in content.py
3. API endpoints returning valid JSON
4. Admin authentication
5. Public pages accessibility
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicAPIEndpoints:
    """Test public API endpoints return valid JSON without ObjectId errors"""
    
    def test_content_services(self):
        """GET /api/content/services - should return services without _id"""
        response = requests.get(f"{BASE_URL}/api/content/services")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        # Verify no _id in response
        for item in data["data"]:
            assert "_id" not in item, f"Found _id in services response: {item}"
            assert "id" in item or "name" in item
    
    def test_content_testimonials(self):
        """GET /api/content/testimonials - should return testimonials without _id"""
        response = requests.get(f"{BASE_URL}/api/content/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        # Verify no _id in response
        for item in data["data"]:
            assert "_id" not in item, f"Found _id in testimonials response: {item}"
    
    def test_content_categories(self):
        """GET /api/content/categories - should return categories without _id"""
        response = requests.get(f"{BASE_URL}/api/content/categories")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        # Verify no _id in response
        for item in data["data"]:
            assert "_id" not in item, f"Found _id in categories response: {item}"
    
    def test_plan_options(self):
        """GET /api/plan-options - should return plan options without _id"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        # Verify no _id in response
        for item in data["data"]:
            assert "_id" not in item, f"Found _id in plan-options response: {item}"
    
    def test_content_form_options(self):
        """GET /api/content/form-options - should return form options without _id"""
        response = requests.get(f"{BASE_URL}/api/content/form-options")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        # Verify no _id in nested data
        for key, items in data["data"].items():
            for item in items:
                assert "_id" not in item, f"Found _id in form-options/{key} response: {item}"


class TestAdminAuthentication:
    """Test admin login and protected endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_login_success(self):
        """POST /api/auth/login - admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data.get("user", {}).get("role") == "admin"
    
    def test_admin_login_wrong_password(self):
        """POST /api/auth/login - should fail with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 400]
    
    def test_admin_testimonials_endpoint(self, admin_token):
        """GET /api/admin/testimonials - should work with valid token"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/testimonials", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestNavigationAPI:
    """Test navigation menu API"""
    
    def test_navigation_menu(self):
        """GET /api/navigation/menu - should return navigation items"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


class TestHomepageServices:
    """Test homepage services API"""
    
    def test_homepage_services(self):
        """GET /api/homepage-services - should return homepage services"""
        response = requests.get(f"{BASE_URL}/api/homepage-services")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data


class TestProcessSteps:
    """Test process steps API"""
    
    def test_process_steps(self):
        """GET /api/content/process-steps - should return process steps"""
        response = requests.get(f"{BASE_URL}/api/content/process-steps")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "data" in data


class TestReviewsAPI:
    """Test public reviews API"""
    
    def test_public_reviews(self):
        """GET /api/reviews - should return approved reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        # Should have reviews array and stats
        assert "reviews" in data or "data" in data


class TestProjectsAPI:
    """Test projects/inspiration API"""
    
    def test_public_projects(self):
        """GET /api/projects - should return visible projects"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
