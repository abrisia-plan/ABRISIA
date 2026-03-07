"""
Backend API tests for Abrisia Plan - Testing Login, Employees, and Projects
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://kit-system-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@abrisia-plan.ca"
ADMIN_PASSWORD = "admin123"
EMPLOYEE_EMAIL = "marc@abrisia-plan.ca"
EMPLOYEE_PASSWORD = "marc123"

class TestAPIHealth:
    """API health and basic endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Bienvenue sur l'API Abrisia Plan"
        assert data["version"] == "1.0.0"
        print("✅ API root endpoint working")


class TestAdminLogin:
    """Admin login and authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✅ Admin login successful - name: {data['user']['name']}")
        return data["token"]

    def test_admin_login_invalid_password(self):
        """Test admin login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Admin login with wrong password rejected correctly")


class TestEmployeeLogin:
    """Employee login and authentication tests"""
    
    def test_employee_login_success(self):
        """Test employee (Marc) can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["role"] == "designer"
        assert data["user"]["name"] == "Marc Dessinateur"
        assert data["user"]["is_approved"] == True
        print(f"✅ Employee login successful - name: {data['user']['name']}, role: {data['user']['role']}")
        return data["token"]

    def test_employee_login_invalid_credentials(self):
        """Test employee login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Employee login with wrong password rejected correctly")


class TestEmployeesList:
    """Admin employee management tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get admin token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.admin_token = response.json()["token"]
    
    def test_get_employees_list_as_admin(self):
        """Test admin can get employees list - should show Marc Dessinateur"""
        response = requests.get(
            f"{BASE_URL}/api/employees/admin/list",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Check Marc Dessinateur is in the list
        employees = data["data"]
        marc = next((e for e in employees if e["email"] == EMPLOYEE_EMAIL), None)
        assert marc is not None, "Marc Dessinateur should be in employees list"
        assert marc["name"] == "Marc Dessinateur"
        assert marc["role"] == "designer"
        assert marc["isApproved"] == True
        print(f"✅ Employees list contains Marc Dessinateur - total employees: {data['total']}")


class TestEmployeeProjects:
    """Employee projects tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get employee token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": EMPLOYEE_EMAIL,
            "password": EMPLOYEE_PASSWORD
        })
        self.employee_token = response.json()["token"]
    
    def test_get_employee_projects(self):
        """Test employee can see assigned projects - Marc should see Mini-maison project"""
        response = requests.get(
            f"{BASE_URL}/api/employees/my-projects",
            headers={"Authorization": f"Bearer {self.employee_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        projects = data["projects"]
        # Marc should have at least one project assigned
        assert len(projects) >= 1, "Marc should have at least one project assigned"
        
        # Check for Mini-maison project
        mini_maison = next((p for p in projects if "Mini-maison" in p["projectType"]), None)
        assert mini_maison is not None, "Marc should have Mini-maison project assigned"
        print(f"✅ Marc has {len(projects)} projects assigned, including Mini-maison")


class TestDevisStats:
    """Devis statistics tests"""
    
    @pytest.fixture(autouse=True)
    def setup_auth(self):
        """Get admin token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.admin_token = response.json()["token"]
    
    def test_get_devis_stats(self):
        """Test admin can get devis statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        # Check stats have expected fields
        assert "total_devis" in data
        assert "pending_devis" in data
        print(f"✅ Devis stats endpoint working - total: {data['total_devis']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
