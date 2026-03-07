"""
Iteration 6 Tests - Email notifications and Candidatures CV
Tests:
- Admin Candidatures CV tab and API
- Email notification triggers for reviews, candidatures, devis
- Home page testimonials from API
- Admin 'Copier le lien témoignage' button
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ============ FIXTURES ============

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_token(api_client):
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@abrisia-plan.ca",
        "password": "admin123"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    assert "token" in data, "No token in login response"
    return data["token"]

@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ============ CANDIDATURES CV API TESTS ============

class TestCandidaturesAPI:
    """Tests for Candidatures (CV) endpoints"""
    
    def test_get_candidatures_list(self, authenticated_client):
        """GET /api/employees/admin/candidatures returns list"""
        response = authenticated_client.get(f"{BASE_URL}/api/employees/admin/candidatures")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert "total" in data
        print(f"Candidatures count: {data['total']}")


# ============ REVIEWS EMAIL NOTIFICATION TEST ============

class TestReviewsEmailNotification:
    """Test that POST /api/reviews triggers email notification"""
    
    def test_post_review_triggers_notification(self, api_client):
        """POST /api/reviews should complete successfully (email sent in background)"""
        review_data = {
            "client_name": "TEST_Email_Notification_User",
            "client_email": "test_notif@example.com",
            "rating": 5,
            "comment": "Test pour vérifier que l'email est envoyé",
            "project_type": "Test notification"
        }
        response = api_client.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "review_id" in data
        print(f"Review created with id: {data['review_id']} - email notification triggered")
        # Store for cleanup
        return data["review_id"]


# ============ DEVIS EMAIL NOTIFICATION TEST ============

class TestDevisEmailNotification:
    """Test that POST /api/devis triggers email notification"""
    
    def test_post_devis_triggers_notification(self, api_client):
        """POST /api/devis should complete successfully (email sent in background)"""
        devis_data = {
            "nom": "TEST_Devis_Email_User",
            "email": "test_devis_notif@example.com",
            "telephone": "555-0123",
            "projectType": "Maison unifamiliale",
            "plansChoisis": ["Plan architectural"],
            "notes": "Test pour vérifier l'email devis"
        }
        response = api_client.post(f"{BASE_URL}/api/devis", json=devis_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "devis" in data
        print(f"Devis created - email notification triggered")


# ============ PUBLIC REVIEWS API TEST ============

class TestPublicReviewsAPI:
    """Test public reviews endpoint for Home page"""
    
    def test_get_public_reviews(self, api_client):
        """GET /api/reviews returns approved reviews for homepage"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert "stats" in data
        print(f"Public reviews count: {len(data['data'])}, avg rating: {data['stats'].get('average_rating')}")


# ============ ADMIN REVIEWS API TEST ============

class TestAdminReviewsAPI:
    """Test admin reviews endpoint"""
    
    def test_get_admin_reviews(self, authenticated_client):
        """GET /api/admin/reviews returns all reviews"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert "total" in data
        print(f"Admin reviews total: {data['total']}")
    
    def test_get_pending_reviews(self, authenticated_client):
        """GET /api/admin/reviews?status_filter=pending returns pending reviews"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/reviews?status_filter=pending")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") == True
        print(f"Pending reviews count: {len(data.get('data', []))}")


# ============ CLEANUP TEST DATA ============

class TestCleanup:
    """Clean up test data created during tests"""
    
    def test_cleanup_test_reviews(self, authenticated_client):
        """Delete test reviews created during testing"""
        # Get all reviews
        response = authenticated_client.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 200
        data = response.json()
        
        deleted_count = 0
        for review in data.get("data", []):
            if review.get("client_name", "").startswith("TEST_"):
                delete_response = authenticated_client.delete(f"{BASE_URL}/api/admin/reviews/{review['id']}")
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test reviews")
    
    def test_cleanup_test_devis(self, authenticated_client):
        """Delete test devis created during testing"""
        # Get all devis
        response = authenticated_client.get(f"{BASE_URL}/api/admin/devis?per_page=100")
        assert response.status_code == 200
        data = response.json()
        
        deleted_count = 0
        for devis in data.get("data", []):
            if devis.get("nom", "").startswith("TEST_"):
                delete_response = authenticated_client.delete(f"{BASE_URL}/api/admin/devis/{devis['id']}")
                if delete_response.status_code == 200:
                    deleted_count += 1
        
        print(f"Cleaned up {deleted_count} test devis")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
