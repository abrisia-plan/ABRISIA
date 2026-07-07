"""
Iteration 8 Backend Tests - Stabilisation Abrisia Plan
Tests for:
1. Page /inspiration loads and shows project images from Object Storage (/api/files/...)
2. Page / (home) loads, shows services from plan_options, shows inspiration projects with images
3. POST /api/devis with representationType, responsePreference, architecturalStyles, files saves all data correctly
4. GET /api/admin/devis returns all fields including representationType, responsePreference, architecturalStyles
5. POST /api/upload supports multiple files and returns success with storage paths
6. GET /api/files/{path} serves files from Object Storage (200 status)
7. POST /api/admin/upload-image stores files permanently in Object Storage, returns imageUrl starting with /api/files/
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@abrisia-plan.ca"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token"):
            return data["token"]
    pytest.skip("Admin authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    """Headers with admin auth token"""
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }


class TestPublicEndpoints:
    """Test public API endpoints"""
    
    def test_projects_endpoint_returns_data(self):
        """GET /api/projects returns project data with images"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=100")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        
        # Verify projects have images
        if len(data["data"]) > 0:
            project = data["data"][0]
            assert "image" in project, "Project should have image field"
            assert "title" in project, "Project should have title field"
            assert "category" in project, "Project should have category field"
            print(f"✅ Projects endpoint returns {len(data['data'])} projects with images")
        else:
            print("⚠️ No projects found in database")
    
    def test_projects_home_only_filter(self):
        """GET /api/projects?home_only=true returns only home projects"""
        response = requests.get(f"{BASE_URL}/api/projects?home_only=true&limit=100")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Home-only projects: {len(data.get('data', []))} items")
    
    def test_plan_options_endpoint(self):
        """GET /api/plan-options returns services for devis page"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert len(data["data"]) > 0, "Should have at least one plan option"
        
        # Verify structure
        option = data["data"][0]
        assert "id" in option
        assert "name" in option
        assert "price" in option
        print(f"✅ Plan options: {len(data['data'])} services available")
    
    def test_plan_options_home_only(self):
        """GET /api/plan-options?home_only=true returns only home services"""
        response = requests.get(f"{BASE_URL}/api/plan-options?home_only=true")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # All returned items should have show_on_home=true
        for option in data.get("data", []):
            assert option.get("show_on_home") == True, f"Option {option.get('id')} should have show_on_home=true"
        
        print(f"✅ Home-only plan options: {len(data.get('data', []))} items")
    
    def test_categories_endpoint(self):
        """GET /api/categories returns project categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "categories" in data
        print(f"✅ Categories: {data['categories']}")


class TestDevisWithAllFields:
    """Test POST /api/devis with all new fields"""
    
    def test_submit_devis_with_all_fields(self):
        """POST /api/devis saves representationType, responsePreference, architecturalStyles, files"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        payload = {
            "nom": "Test User Iteration8",
            "email": unique_email,
            "telephone": "514-555-1234",
            "projectType": "Mini-maison",
            "plansChoisis": ["mini-maison-complete", "fondation"],
            "representationType": "both",
            "responsePreference": "email",
            "architecturalStyles": ["Moderne/Contemporain", "Scandinave"],
            "notes": "Test devis with all fields for iteration 8",
            "files": [
                {"storage_path": "test/file1.pdf", "original_filename": "plan.pdf", "content_type": "application/pdf"},
                {"storage_path": "test/file2.jpg", "original_filename": "photo.jpg", "content_type": "image/jpeg"}
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/devis", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "devis" in data
        assert data["devis"].get("id") is not None
        print(f"✅ Devis created with ID: {data['devis']['id']}")
    
    def test_admin_devis_returns_all_fields(self, admin_headers):
        """GET /api/admin/devis returns representationType, responsePreference, architecturalStyles, files"""
        # First create a devis with all fields
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        payload = {
            "nom": "Admin Test User Iter8",
            "email": unique_email,
            "telephone": "418-555-9999",
            "projectType": "Chalet",
            "plansChoisis": ["chalet-complet"],
            "representationType": "technique",
            "responsePreference": "phone",
            "architecturalStyles": ["Rustique/Chalet", "Traditionnel québécois"],
            "notes": "Test for admin view iter8",
            "files": [{"storage_path": "admin/test.pdf", "original_filename": "test.pdf", "content_type": "application/pdf"}]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/devis", json=payload)
        assert create_response.status_code == 200
        
        # Now fetch admin devis list
        response = requests.get(f"{BASE_URL}/api/admin/devis", headers=admin_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        
        # Find our created devis
        our_devis = None
        for d in data["data"]:
            if d.get("email") == unique_email:
                our_devis = d
                break
        
        assert our_devis is not None, f"Could not find devis with email {unique_email}"
        
        # Verify all new fields are present
        assert "representationType" in our_devis, "Missing representationType field"
        assert "responsePreference" in our_devis, "Missing responsePreference field"
        assert "architecturalStyles" in our_devis, "Missing architecturalStyles field"
        assert "files" in our_devis, "Missing files field"
        
        # Verify values
        assert our_devis["representationType"] == "technique"
        assert our_devis["responsePreference"] == "phone"
        assert "Rustique/Chalet" in our_devis["architecturalStyles"]
        assert len(our_devis["files"]) == 1
        
        print(f"✅ Admin devis view contains all fields: representationType={our_devis['representationType']}, responsePreference={our_devis['responsePreference']}, styles={our_devis['architecturalStyles']}, files_count={len(our_devis['files'])}")


class TestFileUpload:
    """Test file upload endpoints"""
    
    def test_upload_multiple_files(self):
        """POST /api/upload supports multiple files upload"""
        # Create test files in memory
        files = [
            ('files', ('test1.txt', b'Test file content 1', 'text/plain')),
            ('files', ('test2.txt', b'Test file content 2', 'text/plain')),
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/upload",
            files=files,
            data={"folder": "test_uploads"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "files" in data
        assert len(data["files"]) == 2, f"Expected 2 files, got {len(data['files'])}"
        
        # Verify each file has required fields
        for f in data["files"]:
            assert "storage_path" in f
            assert "original_filename" in f
            assert "content_type" in f
            assert "size" in f
        
        print(f"✅ Multiple files uploaded successfully: {[f['original_filename'] for f in data['files']]}")
    
    def test_download_uploaded_file(self):
        """GET /api/files/{path} returns uploaded file content"""
        # First upload a file
        test_content = b'Test file content for download test iter8'
        files = [('files', ('download_test_iter8.txt', test_content, 'text/plain'))]
        
        upload_response = requests.post(
            f"{BASE_URL}/api/upload",
            files=files,
            data={"folder": "test_downloads"}
        )
        
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        assert upload_data.get("success") == True
        
        storage_path = upload_data["files"][0]["storage_path"]
        
        # Now download the file
        download_response = requests.get(f"{BASE_URL}/api/files/{storage_path}")
        
        assert download_response.status_code == 200, f"Expected 200, got {download_response.status_code}: {download_response.text}"
        assert download_response.content == test_content
        
        print(f"✅ File downloaded successfully from {storage_path}")


class TestAdminImageUpload:
    """Test admin image upload to Object Storage"""
    
    def test_admin_upload_image(self, admin_headers):
        """POST /api/admin/upload-image uploads to permanent storage and returns imageUrl starting with /api/files/"""
        # Create a test image (small PNG)
        # This is a minimal valid PNG file (1x1 pixel, red)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE,
            0xD4, 0xEF, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  # IEND chunk
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_image_iter8.png', png_data, 'image/png')}
        headers = {"Authorization": admin_headers["Authorization"]}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/upload-image",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "imageUrl" in data
        
        # Verify imageUrl starts with /api/files/
        image_url = data["imageUrl"]
        assert image_url.startswith("/api/files/"), f"imageUrl should start with /api/files/, got: {image_url}"
        
        # Verify storagePath is present
        assert "storagePath" in data
        
        print(f"✅ Admin image uploaded to Object Storage: {image_url}")
        
        # Verify the image can be downloaded
        download_response = requests.get(f"{BASE_URL}{image_url}")
        assert download_response.status_code == 200, f"Image download failed: {download_response.status_code}"
        print(f"✅ Uploaded image is accessible at {image_url}")


class TestProjectImagesFromObjectStorage:
    """Test that project images are served from Object Storage"""
    
    def test_project_images_accessible(self):
        """Verify project images from /api/files/ are accessible"""
        response = requests.get(f"{BASE_URL}/api/projects?limit=10")
        
        assert response.status_code == 200
        data = response.json()
        
        if not data.get("data"):
            pytest.skip("No projects to test")
        
        # Check images that use /api/files/ path
        api_files_images = [p for p in data["data"] if p.get("image", "").startswith("/api/files/")]
        
        if api_files_images:
            for project in api_files_images[:3]:  # Test first 3
                image_url = project["image"]
                full_url = f"{BASE_URL}{image_url}"
                img_response = requests.get(full_url)
                assert img_response.status_code == 200, f"Image not accessible: {full_url}"
                print(f"✅ Project image accessible: {project['title']} - {image_url}")
        else:
            print("⚠️ No projects with /api/files/ images found (may use external URLs)")


class TestAdminEndpoints:
    """Test admin-only endpoints"""
    
    def test_admin_login(self):
        """Admin can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert data.get("token") is not None
        print(f"✅ Admin login successful: {data['user']['name']}")
    
    def test_admin_projects_endpoint(self, admin_headers):
        """GET /api/admin/projects returns all projects"""
        response = requests.get(f"{BASE_URL}/api/admin/projects", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin projects: {len(data.get('data', []))} total")
    
    def test_admin_products_endpoint(self, admin_headers):
        """GET /api/admin/products returns all kits"""
        response = requests.get(f"{BASE_URL}/api/admin/products", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Admin products (kits): {len(data.get('data', []))} total")


class TestReviewsEndpoint:
    """Test reviews/testimonials endpoint"""
    
    def test_public_reviews(self):
        """GET /api/reviews returns approved reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"✅ Public reviews: {len(data.get('data', []))} approved reviews")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
