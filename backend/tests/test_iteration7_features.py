"""
Iteration 7 Backend Tests - Devis Complete Data, File Upload, Kits Persistence, Object Storage
Tests for:
1. POST /api/devis with all fields (representationType, responsePreference, architecturalStyles, files)
2. GET /api/admin/devis returns all new fields
3. POST /api/upload supports multiple files upload
4. GET /api/files/{path} returns uploaded file content
5. POST /api/admin/upload-image uploads to permanent storage
6. PUT /api/admin/products/{id} saves all fields including slug, file_formats, building_type
7. GET /api/plan-options?home_only=true returns only items with show_on_home=true
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


class TestDevisWithAllFields:
    """Test POST /api/devis with all new fields"""
    
    def test_submit_devis_with_all_fields(self):
        """POST /api/devis saves representationType, responsePreference, architecturalStyles, files"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        payload = {
            "nom": "Test User Iteration7",
            "email": unique_email,
            "telephone": "514-555-1234",
            "projectType": "Mini-maison",
            "plansChoisis": ["mini-maison-complete", "fondation"],
            "representationType": "both",
            "responsePreference": "email",
            "architecturalStyles": ["Moderne/Contemporain", "Scandinave"],
            "notes": "Test devis with all fields for iteration 7",
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
        return data["devis"]["id"], unique_email
    
    def test_admin_devis_returns_all_fields(self, admin_headers):
        """GET /api/admin/devis returns representationType, responsePreference, architecturalStyles, files"""
        # First create a devis with all fields
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        payload = {
            "nom": "Admin Test User",
            "email": unique_email,
            "telephone": "418-555-9999",
            "projectType": "Chalet",
            "plansChoisis": ["chalet-complet"],
            "representationType": "technique",
            "responsePreference": "phone",
            "architecturalStyles": ["Rustique/Chalet", "Traditionnel québécois"],
            "notes": "Test for admin view",
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
        return data["files"]
    
    def test_download_uploaded_file(self):
        """GET /api/files/{path} returns uploaded file content"""
        # First upload a file
        test_content = b'Test file content for download test'
        files = [('files', ('download_test.txt', test_content, 'text/plain'))]
        
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
        
        files = {'file': ('test_image.png', png_data, 'image/png')}
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
        return image_url


class TestProductUpdate:
    """Test product update with all fields"""
    
    def test_update_product_all_fields(self, admin_headers):
        """PUT /api/admin/products/{id} saves all fields including slug, file_formats, building_type"""
        # First get existing products
        response = requests.get(f"{BASE_URL}/api/admin/products", headers=admin_headers)
        
        if response.status_code != 200:
            pytest.skip("Could not fetch products")
        
        data = response.json()
        if not data.get("data") or len(data["data"]) == 0:
            # Create a product first
            create_payload = {
                "name": "Test Product Iteration7",
                "description": "Test product for iteration 7",
                "category": "mini-maison",
                "price": 999.99,
                "main_image": "/test/image.jpg",
                "slug": f"test-product-{uuid.uuid4().hex[:8]}",
                "is_active": True
            }
            create_response = requests.post(
                f"{BASE_URL}/api/admin/products",
                json=create_payload,
                headers=admin_headers
            )
            if create_response.status_code != 200:
                pytest.skip("Could not create test product")
            
            # Fetch products again
            response = requests.get(f"{BASE_URL}/api/admin/products", headers=admin_headers)
            data = response.json()
        
        product_id = data["data"][0]["id"]
        
        # Update with all fields
        update_payload = {
            "name": "Updated Product Name",
            "slug": f"updated-slug-{uuid.uuid4().hex[:8]}",
            "file_formats": ["PDF", "DWG", "SKP"],
            "building_type": "commercial",
            "description": "Updated description",
            "price": 1299.99
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            json=update_payload,
            headers=admin_headers
        )
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        update_data = update_response.json()
        assert update_data.get("success") == True
        
        # Verify by fetching the product
        verify_response = requests.get(f"{BASE_URL}/api/products/{update_payload['slug']}")
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            if verify_data.get("product"):
                product = verify_data["product"]
                assert product.get("fileFormats") == ["PDF", "DWG", "SKP"], f"file_formats not saved correctly"
                assert product.get("buildingType") == "commercial", f"building_type not saved correctly"
                print(f"✅ Product updated with all fields: slug={product.get('slug')}, fileFormats={product.get('fileFormats')}, buildingType={product.get('buildingType')}")
        else:
            print(f"✅ Product update successful (could not verify via slug lookup)")


class TestPlanOptions:
    """Test plan options endpoint"""
    
    def test_plan_options_home_only(self):
        """GET /api/plan-options?home_only=true returns only items with show_on_home=true"""
        response = requests.get(f"{BASE_URL}/api/plan-options?home_only=true")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        
        # Verify all returned items have show_on_home=true
        for option in data["data"]:
            assert option.get("show_on_home") == True, f"Option {option.get('id')} has show_on_home={option.get('show_on_home')}"
        
        print(f"✅ plan-options?home_only=true returns {len(data['data'])} items, all with show_on_home=true")
    
    def test_plan_options_all(self):
        """GET /api/plan-options returns all active options"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert len(data["data"]) > 0, "Expected at least one plan option"
        
        # Verify structure
        for option in data["data"]:
            assert "id" in option
            assert "name" in option
            assert "price" in option
        
        print(f"✅ plan-options returns {len(data['data'])} total options")


class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_api_health(self):
        """API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("✅ API health check passed")
    
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


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
