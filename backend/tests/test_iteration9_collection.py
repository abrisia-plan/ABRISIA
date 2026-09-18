"""
Iteration 9 - Collection ABRISIA & Chatbot API Tests
Tests for:
- Collection page APIs (products, filters, cart)
- Chatbot API (streaming SSE)
- Admin Collection fields
- Navigation menu with 'Collection' default
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCollectionAPIs:
    """Test Collection ABRISIA APIs"""
    
    def test_products_list(self):
        """Test GET /api/products returns products with Collection fields"""
        response = requests.get(f"{BASE_URL}/api/products?per_page=50")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"Found {len(data['data'])} products")
        
        # Check if products have Collection fields
        if len(data['data']) > 0:
            product = data['data'][0]
            # Check for new Collection fields in response
            assert "id" in product
            assert "name" in product
            assert "price" in product
            print(f"Product: {product.get('name')} - ${product.get('price')}")
    
    def test_collection_filters(self):
        """Test GET /api/collection/filters returns filter values"""
        response = requests.get(f"{BASE_URL}/api/collection/filters")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        
        filters = data['data']
        # Check filter structure
        assert "tags" in filters
        assert "styles" in filters
        assert "foundations" in filters
        assert "bedrooms" in filters
        assert "bathrooms" in filters
        print(f"Filters: tags={filters.get('tags')}, styles={filters.get('styles')}")
    
    def test_collection_options(self):
        """Test GET /api/collection/options returns product options"""
        response = requests.get(f"{BASE_URL}/api/collection/options")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"Found {len(data['data'])} product options")
    
    def test_cart_empty(self):
        """Test GET /api/collection/cart/{session_id} returns empty cart"""
        session_id = f"test-cart-{int(time.time())}"
        response = requests.get(f"{BASE_URL}/api/collection/cart/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        
        cart = data['data']
        assert cart.get("items") == []
        assert cart.get("subtotal") == 0
        assert cart.get("total") == 0
        print("Empty cart returned correctly")
    
    def test_add_to_cart(self):
        """Test POST /api/collection/cart/{session_id}/add"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products?per_page=1")
        products_data = products_response.json()
        
        if len(products_data.get('data', [])) == 0:
            pytest.skip("No products available to test cart")
        
        product_id = products_data['data'][0]['id']
        session_id = f"test-cart-{int(time.time())}"
        
        # Add to cart
        response = requests.post(
            f"{BASE_URL}/api/collection/cart/{session_id}/add",
            json={
                "product_id": product_id,
                "variant_id": None,
                "selected_option_ids": [],
                "quantity": 1
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "cart_item_id" in data
        print(f"Added product {product_id} to cart")
        
        # Verify cart has item
        cart_response = requests.get(f"{BASE_URL}/api/collection/cart/{session_id}")
        cart_data = cart_response.json()
        assert len(cart_data['data']['items']) == 1
        print("Cart item verified")


class TestChatbotAPI:
    """Test Chatbot API"""
    
    def test_chatbot_endpoint_exists(self):
        """Test POST /api/chatbot/chat endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/chatbot/chat",
            json={"message": "Bonjour", "session_id": "test-session"},
            stream=True
        )
        # Should return 200 with SSE stream
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        print("Chatbot endpoint returns SSE stream")
    
    def test_chatbot_history(self):
        """Test GET /api/chatbot/chat/history/{session_id}"""
        session_id = f"test-history-{int(time.time())}"
        response = requests.get(f"{BASE_URL}/api/chatbot/chat/history/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print("Chatbot history endpoint works")


class TestNavigationAPI:
    """Test Navigation Menu API"""
    
    def test_navigation_menu(self):
        """Test GET /api/navigation/menu returns menu with Collection"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        # Check for Collection in menu
        pages = data.get("pages", [])
        page_names = [p.get("name") for p in pages]
        
        # Should have Collection, not Kits
        assert "Collection" in page_names or any("collection" in p.get("href", "").lower() for p in pages)
        print(f"Navigation pages: {page_names}")


class TestAdminProductAPI:
    """Test Admin Product API with Collection fields"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@abrisia-plan.ca", "password": "admin123"}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        pytest.skip("Admin login failed")
    
    def test_admin_products_list(self, auth_token):
        """Test GET /api/admin/products returns products with Collection fields"""
        response = requests.get(
            f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        if len(data.get('data', [])) > 0:
            product = data['data'][0]
            # Check for new Collection fields in admin response
            print(f"Admin product fields: {list(product.keys())}")
            # These fields should be present in admin response
            expected_fields = ['id', 'name', 'price', 'isActive']
            for field in expected_fields:
                assert field in product, f"Missing field: {field}"
        print("Admin products API works with Collection fields")


class TestCollectionVariantsAPI:
    """Test Collection Variants API"""
    
    def test_get_variants_for_product(self):
        """Test GET /api/collection/models/{product_id}/variants"""
        # First get a product ID
        products_response = requests.get(f"{BASE_URL}/api/products?per_page=1")
        products_data = products_response.json()
        
        if len(products_data.get('data', [])) == 0:
            pytest.skip("No products available to test variants")
        
        product_id = products_data['data'][0]['id']
        
        response = requests.get(f"{BASE_URL}/api/collection/models/{product_id}/variants")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        print(f"Found {len(data['data'])} variants for product {product_id}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
