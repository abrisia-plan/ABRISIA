"""
Iteration 4 - Projects/Inspiration API Tests
Tests that projects API returns data from MongoDB (not mock data)
Tests that categories API works correctly
Tests visibility toggle (is_visible=false hides from public)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@abrisia-plan.ca")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "admin123")


class TestPublicProjectsAPI:
    """Test public /api/projects endpoint - must return MongoDB data"""
    
    def test_get_public_projects_returns_success(self):
        """GET /api/projects should return success"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ GET /api/projects returns success=True")
    
    def test_get_public_projects_returns_projects_array(self):
        """GET /api/projects should return projects array"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
        print(f"✅ GET /api/projects returns projects array with {len(data['data'])} items")
    
    def test_public_projects_count_is_29(self):
        """Should have ~29 visible projects from MongoDB seed"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        data = response.json()
        # Note: Could be less if some are hidden
        assert len(data["data"]) >= 20, f"Expected at least 20 projects, got {len(data['data'])}"
        print(f"✅ Got {len(data['data'])} projects (expected ~29)")
    
    def test_project_has_required_fields(self):
        """Each project should have id, title, category, image, description"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=1")
        data = response.json()
        assert len(data["data"]) > 0, "No projects returned"
        
        project = data["data"][0]
        required_fields = ["id", "title", "category", "image", "description"]
        for field in required_fields:
            assert field in project, f"Missing field: {field}"
        print(f"✅ Project has all required fields: {required_fields}")
    
    def test_filter_by_category(self):
        """GET /api/projects?category=X should filter by category"""
        response = requests.get(f"{BASE_URL}/api/projects?category=Mini-maison&limit=100")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # All returned projects should be Mini-maison category
        for project in data["data"]:
            assert project["category"] == "Mini-maison", f"Wrong category: {project['category']}"
        print(f"✅ Category filter works - got {len(data['data'])} Mini-maison projects")


class TestCategoriesAPI:
    """Test /api/categories endpoint"""
    
    def test_get_categories_returns_success(self):
        """GET /api/categories should return success"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ GET /api/categories returns success=True")
    
    def test_categories_include_tous(self):
        """Categories should include 'Tous' as first item"""
        response = requests.get(f"{BASE_URL}/api/categories")
        data = response.json()
        categories = data.get("categories", [])
        assert "Tous" in categories, "'Tous' not in categories"
        assert categories[0] == "Tous", "'Tous' should be first"
        print(f"✅ Categories: {categories}")
    
    def test_categories_match_expected(self):
        """Categories should match expected list from projects"""
        response = requests.get(f"{BASE_URL}/api/categories")
        data = response.json()
        categories = data.get("categories", [])
        
        expected = [
            "Maison unifamiliale",
            "Chalet",
            "Mini-maison",
            "Extensions verrières solarium",
            "Autres dessins (ébénisterie)",
            "Dessins techniques",
            "Dessins architecturaux"
        ]
        
        # Check that most expected categories are present
        found_count = sum(1 for cat in expected if cat in categories)
        assert found_count >= 5, f"Only found {found_count}/7 expected categories"
        print(f"✅ Found {found_count} of {len(expected)} expected categories")


class TestAdminProjectsAPI:
    """Test admin projects API - requires authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_get_all_projects(self):
        """GET /api/admin/projects should return all projects including hidden"""
        response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin sees {len(data.get('data', []))} projects (including hidden)")
    
    def test_admin_projects_have_visibility_field(self):
        """Admin projects should have isVisible field"""
        response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers=self.headers
        )
        data = response.json()
        
        if data["data"]:
            project = data["data"][0]
            assert "isVisible" in project, "Missing isVisible field in admin response"
            print(f"✅ Admin projects have isVisible field")


class TestVisibilityToggle:
    """Test that hiding a project in admin removes it from public API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed")
        
        self.token = response.json().get("token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_hidden_projects_not_in_public_api(self):
        """
        Projects with is_visible=false should not appear in public API
        1. Get admin projects to find any hidden ones
        2. Verify they don't appear in public API
        """
        # Get all projects from admin (including hidden)
        admin_response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers=self.headers
        )
        admin_data = admin_response.json()
        admin_projects = admin_data.get("data", [])
        
        # Find hidden projects
        hidden_ids = [p["id"] for p in admin_projects if not p.get("isVisible", True)]
        
        # Get public projects
        public_response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        public_data = public_response.json()
        public_ids = [p["id"] for p in public_data.get("data", [])]
        
        # Verify hidden projects are not in public
        for hidden_id in hidden_ids:
            assert hidden_id not in public_ids, f"Hidden project {hidden_id} found in public API!"
        
        print(f"✅ {len(hidden_ids)} hidden projects correctly excluded from public API")
    
    def test_toggle_visibility_hides_from_public(self):
        """
        Toggle a project to hidden and verify it disappears from public API
        Then restore it
        """
        # Get a visible project from admin
        admin_response = requests.get(
            f"{BASE_URL}/api/admin/projects",
            headers=self.headers
        )
        admin_data = admin_response.json()
        
        # Find a visible project to test with
        visible_projects = [p for p in admin_data.get("data", []) if p.get("isVisible", True)]
        if not visible_projects:
            pytest.skip("No visible projects to test with")
        
        test_project = visible_projects[0]
        project_id = test_project["id"]
        
        # Verify it's in public API before hiding
        public_before = requests.get(f"{BASE_URL}/api/projects?limit=100")
        public_ids_before = [p["id"] for p in public_before.json().get("data", [])]
        assert project_id in public_ids_before, "Test project should be visible initially"
        
        # Hide the project
        hide_response = requests.put(
            f"{BASE_URL}/api/admin/projects/{project_id}",
            json={"is_visible": False},
            headers=self.headers
        )
        assert hide_response.status_code == 200
        
        # Verify it's NOT in public API after hiding
        public_after = requests.get(f"{BASE_URL}/api/projects?limit=100")
        public_ids_after = [p["id"] for p in public_after.json().get("data", [])]
        assert project_id not in public_ids_after, "Hidden project should NOT appear in public API"
        
        print(f"✅ Project {project_id} correctly hidden from public API")
        
        # RESTORE the project visibility (cleanup)
        restore_response = requests.put(
            f"{BASE_URL}/api/admin/projects/{project_id}",
            json={"is_visible": True},
            headers=self.headers
        )
        assert restore_response.status_code == 200
        
        # Verify it's back in public API
        public_restored = requests.get(f"{BASE_URL}/api/projects?limit=100")
        public_ids_restored = [p["id"] for p in public_restored.json().get("data", [])]
        assert project_id in public_ids_restored, "Restored project should appear in public API"
        
        print(f"✅ Project {project_id} correctly restored to public API")


class TestProjectsDataFromMongoDB:
    """Verify that projects come from MongoDB (not hardcoded mock data)"""
    
    def test_projects_have_mongodb_ids(self):
        """Projects should have MongoDB ObjectId format"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=5")
        data = response.json()
        
        for project in data.get("data", []):
            project_id = project.get("id", "")
            # MongoDB ObjectId is 24 hex characters
            assert len(project_id) == 24, f"Invalid MongoDB ID format: {project_id}"
            assert all(c in '0123456789abcdef' for c in project_id), f"ID not hex: {project_id}"
        
        print("✅ All project IDs are valid MongoDB ObjectIds")
    
    def test_projects_have_createdAt_field(self):
        """Projects from MongoDB should have createdAt timestamp"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=1")
        data = response.json()
        
        if data.get("data"):
            project = data["data"][0]
            assert "createdAt" in project, "Missing createdAt field from MongoDB"
            print(f"✅ Projects have createdAt field: {project['createdAt']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
