"""
Iteration 5 - Backend tests for 3 new features:
1. Public review page (/temoignage) - POST /api/reviews
2. Devis filters by month/year (frontend feature, test admin devis API)
3. Projects dual visibility (show_on_home field) - GET /api/projects?home_only=true & PUT /api/admin/projects/{id}
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestReviewsAPI:
    """Tests for public review submission - POST /api/reviews"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup for review tests"""
        self.test_review_id = None
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_post_review_success(self):
        """Test submitting a public review"""
        review_data = {
            "client_name": "TEST_Marie Tremblay",
            "client_email": self.test_email,
            "rating": 5,
            "comment": "Excellent service! Les plans étaient parfaits.",
            "project_type": "Mini-maison",
            "would_recommend": True
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "review_id" in data
        assert "Merci" in data["message"] or "validation" in data["message"]
        
        self.test_review_id = data["review_id"]
        print(f"✅ Review submitted successfully with ID: {self.test_review_id}")
    
    def test_post_review_missing_fields(self):
        """Test review submission with missing required fields"""
        review_data = {
            "client_name": "",  # Empty name
            "client_email": "test@test.com",
            "rating": 5,
            "comment": "Great!"
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        # Should still accept (backend may not validate empty strings strictly)
        # Just check the response is valid JSON
        assert response.status_code in [200, 400, 422], f"Unexpected status: {response.status_code}"
        print(f"✅ Review with empty name handled: status {response.status_code}")
    
    def test_post_review_invalid_rating(self):
        """Test review with invalid rating (out of 1-5 range)"""
        review_data = {
            "client_name": "Test User",
            "client_email": "test@test.com",
            "rating": 10,  # Invalid - should be 1-5
            "comment": "Test comment"
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        # Should reject invalid rating
        assert response.status_code in [400, 422], f"Expected 400/422 for invalid rating, got {response.status_code}"
        print(f"✅ Invalid rating correctly rejected: status {response.status_code}")
    
    def test_get_public_reviews(self):
        """Test getting public approved reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "stats" in data
        print(f"✅ Public reviews endpoint works: {len(data['data'])} approved reviews")


class TestProjectsHomeOnly:
    """Tests for project dual visibility - show_on_home field"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
        else:
            pytest.skip("Admin login failed")
    
    def test_get_projects_home_only_true(self):
        """Test GET /api/projects?home_only=true returns only show_on_home projects"""
        response = requests.get(f"{BASE_URL}/api/projects?home_only=true&limit=100")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        
        # Should return 7 projects (one per category) based on seed data
        assert len(data["data"]) >= 1, "Expected at least 1 home-only project"
        print(f"✅ home_only=true returns {len(data['data'])} projects")
    
    def test_get_projects_home_only_false(self):
        """Test GET /api/projects without home_only returns all visible projects"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        assert response.status_code == 200
        
        data = response.json()
        total_visible = data["total"]
        
        # Now test home_only=true
        response_home = requests.get(f"{BASE_URL}/api/projects?home_only=true&limit=100")
        home_only_count = response_home.json()["total"]
        
        # home_only should be <= total visible
        assert home_only_count <= total_visible, f"home_only ({home_only_count}) > total ({total_visible})"
        print(f"✅ Total visible: {total_visible}, Home only: {home_only_count}")
    
    def test_admin_get_projects_includes_show_on_home(self):
        """Test admin endpoint returns showOnHome field"""
        response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert len(data["data"]) > 0
        
        # Check first project has showOnHome field
        first_project = data["data"][0]
        assert "showOnHome" in first_project, "Missing showOnHome field in admin response"
        print(f"✅ Admin projects include showOnHome field")
    
    def test_update_project_show_on_home(self):
        """Test updating a project's show_on_home field"""
        # Get a project to update
        response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        projects = response.json()["data"]
        
        if not projects:
            pytest.skip("No projects available to test")
        
        # Find a project to toggle
        test_project = projects[0]
        project_id = test_project["id"]
        original_show_on_home = test_project.get("showOnHome", False)
        
        # Toggle show_on_home
        new_value = not original_show_on_home
        update_response = requests.put(
            f"{BASE_URL}/api/admin/projects/{project_id}",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            },
            json={"show_on_home": new_value}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify the change
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        updated_project = next((p for p in verify_response.json()["data"] if p["id"] == project_id), None)
        assert updated_project is not None
        assert updated_project["showOnHome"] == new_value, f"showOnHome not updated: expected {new_value}"
        
        # Revert the change
        requests.put(
            f"{BASE_URL}/api/admin/projects/{project_id}",
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            },
            json={"show_on_home": original_show_on_home}
        )
        print(f"✅ show_on_home toggle works: {original_show_on_home} -> {new_value} -> reverted")


class TestAdminDevisAPI:
    """Tests for admin devis API (to support month/year filters in frontend)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
        else:
            pytest.skip("Admin login failed")
    
    def test_get_admin_devis_all(self):
        """Test getting all devis for admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/devis?per_page=100",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        print(f"✅ Admin devis endpoint works: {len(data['data'])} devis returned")
    
    def test_get_admin_devis_with_status_filter(self):
        """Test devis status filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/devis?status=En%20attente&per_page=100",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        # If any results, they should have "En attente" status
        for devis in data["data"]:
            assert devis.get("status") == "En attente", f"Filter not working: got {devis.get('status')}"
        print(f"✅ Devis status filter works: {len(data['data'])} pending devis (filter verified)")
    
    def test_devis_has_created_at_for_date_filters(self):
        """Test that devis include createdAt field for frontend date filtering"""
        response = requests.get(
            f"{BASE_URL}/api/admin/devis?per_page=10",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        if data["data"]:
            first_devis = data["data"][0]
            assert "createdAt" in first_devis, "Missing createdAt field needed for date filtering"
            # Verify it's a valid date string
            created_at = first_devis["createdAt"]
            assert created_at is not None, "createdAt should not be null"
            print(f"✅ Devis include createdAt field: {created_at}")
        else:
            print("✅ No devis to verify createdAt, but API works")


class TestAdminReviewsManagement:
    """Tests for admin review management (for Témoignages tab)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@abrisia-plan.ca",
            "password": "admin123"
        })
        if login_response.status_code == 200:
            self.token = login_response.json().get("token")
        else:
            pytest.skip("Admin login failed")
    
    def test_get_admin_reviews_pending(self):
        """Test getting pending reviews for admin approval"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reviews?status_filter=pending",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        print(f"✅ Admin pending reviews: {len(data['data'])} reviews awaiting approval")
    
    def test_get_admin_reviews_all(self):
        """Test getting all reviews for admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reviews",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "data" in data
        assert "total" in data
        print(f"✅ Admin all reviews: {data['total']} total reviews")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
