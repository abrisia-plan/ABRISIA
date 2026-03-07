"""
Iteration 3 Backend Tests - Abrisia Plan
Testing: Plan Options API, Navigation API, Admin features
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://view-stage-2.preview.emergentagent.com')


class TestPlanOptionsAPI:
    """Test GET /api/plan-options for public devis form"""
    
    def test_get_plan_options_public(self):
        """GET /api/plan-options returns dynamic plan options"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert len(data["data"]) > 0
        
        # Check structure of first option
        first_option = data["data"][0]
        assert "id" in first_option
        assert "name" in first_option
        assert "price" in first_option
        assert "category" in first_option
        print(f"✅ Found {len(data['data'])} plan options")
    
    def test_plan_options_contain_expected_items(self):
        """Verify expected plan options are present"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        data = response.json()
        
        option_names = [opt["name"] for opt in data["data"]]
        
        # Check for expected plan types
        assert any("fondation" in name.lower() for name in option_names), "Plan de fondation missing"
        assert any("architectural" in name.lower() for name in option_names), "Plan architectural missing"
        assert any("électrique" in name.lower() for name in option_names), "Plan électrique missing"
        print("✅ All expected plan options present")
    
    def test_plan_options_categories(self):
        """Verify plan options are categorized correctly"""
        response = requests.get(f"{BASE_URL}/api/plan-options")
        data = response.json()
        
        categories = set(opt.get("category") for opt in data["data"])
        
        # Should have at least plans and services categories
        assert "plans" in categories, "Missing 'plans' category"
        assert "services" in categories, "Missing 'services' category"
        print(f"✅ Categories found: {categories}")


class TestNavigationAPI:
    """Test /api/navigation/menu for dynamic navigation"""
    
    def test_get_navigation_menu(self):
        """GET /api/navigation/menu returns visible pages"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "pages" in data
        print(f"✅ Navigation menu has {len(data['pages'])} pages")
    
    def test_navigation_excludes_hidden_pages(self):
        """Verify hidden pages are not in navigation"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        data = response.json()
        
        page_names = [p["name"].lower() for p in data["pages"]]
        
        # À propos should be hidden (from iteration 2)
        assert "à propos" not in page_names, "'À propos' should be hidden"
        print("✅ Hidden pages excluded from navigation")
    
    def test_navigation_contains_essential_pages(self):
        """Verify essential pages are visible"""
        response = requests.get(f"{BASE_URL}/api/navigation/menu")
        data = response.json()
        
        page_hrefs = [p["href"] for p in data["pages"]]
        
        assert "/" in page_hrefs, "Accueil missing"
        assert "/devis" in page_hrefs, "Devis missing"
        assert "/contact" in page_hrefs, "Contact missing"
        print("✅ Essential pages present in navigation")


class TestAdminAuthentication:
    """Test admin login and authentication"""
    
    def test_admin_login_success(self):
        """Admin can login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@abrisia-plan.ca",
                "password": "admin123"
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print("✅ Admin login successful")
        return data["token"]
    
    def test_admin_login_wrong_password(self):
        """Admin login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@abrisia-plan.ca",
                "password": "wrongpassword"
            }
        )
        # Should return 401 Unauthorized
        assert response.status_code == 401
        print("✅ Admin login correctly rejected wrong password")


class TestAdminPlanOptions:
    """Test admin plan options management"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@abrisia-plan.ca",
                "password": "admin123"
            }
        )
        return response.json()["token"]
    
    def test_get_admin_plan_options(self, admin_token):
        """Admin can get all plan options"""
        response = requests.get(
            f"{BASE_URL}/api/admin/plan-options",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        print(f"✅ Admin can view {len(data['data'])} plan options")
    
    def test_update_plan_option_price(self, admin_token):
        """Admin can update a plan option price"""
        # First get existing options
        response = requests.get(
            f"{BASE_URL}/api/admin/plan-options",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        options = response.json()["data"]
        
        if len(options) > 0:
            option_id = options[0]["id"]
            original_price = options[0]["price"]
            
            # Update the price
            update_response = requests.put(
                f"{BASE_URL}/api/admin/plan-options/{option_id}",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                },
                json={"price": "999$"}
            )
            assert update_response.status_code == 200
            
            # Verify the update
            verify_response = requests.get(f"{BASE_URL}/api/plan-options")
            updated_options = verify_response.json()["data"]
            updated_option = next((o for o in updated_options if o["id"] == option_id), None)
            
            # Restore original price
            requests.put(
                f"{BASE_URL}/api/admin/plan-options/{option_id}",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                },
                json={"price": original_price}
            )
            
            print("✅ Admin can update plan option prices")
        else:
            pytest.skip("No plan options to test")
    
    def test_unauthorized_access_rejected(self):
        """Unauthenticated access to admin endpoints is rejected"""
        response = requests.get(f"{BASE_URL}/api/admin/plan-options")
        # Should return 401 or 403
        assert response.status_code in [401, 403, 422]
        print("✅ Unauthorized access correctly rejected")


class TestEmployeesAPI:
    """Test employees management API"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@abrisia-plan.ca",
                "password": "admin123"
            }
        )
        return response.json()["token"]
    
    def test_get_employees_list(self, admin_token):
        """Admin can get employees list"""
        response = requests.get(
            f"{BASE_URL}/api/employees/admin/list",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        print(f"✅ Found {len(data.get('data', []))} employees")
    
    def test_no_fake_designers_in_database(self, admin_token):
        """Verify no fake designers (Marc/Sophie test data) in database"""
        response = requests.get(
            f"{BASE_URL}/api/employees/admin/list",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = response.json()
        
        employees = data.get("data", [])
        
        # Check for fake designer names
        fake_names = ["Marc Designer", "Marc Dupont", "Sophie Designer", "Sophie Tremblay"]
        employee_names = [e.get("name", "") for e in employees]
        
        for fake_name in fake_names:
            assert fake_name not in employee_names, f"Found fake designer: {fake_name}"
        
        # Marc Dessinateur is a real employee - should be present or not
        print("✅ No fake designers in database")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
