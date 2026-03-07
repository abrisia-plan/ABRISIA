"""
Test suite for Abrisia Plan Employee System
Tests: Admin login, Employee login, Employee portal, My projects API
"""

import pytest
import requests
import os

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@abrisia-plan.ca"
ADMIN_PASSWORD = "admin123"
EMPLOYEE_EMAIL = "marc@abrisia-plan.ca"
EMPLOYEE_PASSWORD = "marc123"


class TestAPIHealth:
    """Test API health and basic connectivity"""
    
    def test_api_root(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Abrisia" in data.get("message", "")
        print(f"✅ API root accessible: {data.get('message')}")


class TestAdminAuth:
    """Test admin authentication flow"""
    
    def test_admin_login_success(self):
        """Test admin can login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✅ Admin login successful: {data['user']['name']}")
    
    def test_admin_login_invalid_password(self):
        """Test admin login fails with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✅ Admin login correctly rejected with invalid password")
    
    def test_admin_login_invalid_email(self):
        """Test admin login fails with non-existent email"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "nonexistent@test.com", "password": "anypassword"}
        )
        assert response.status_code == 401
        print("✅ Admin login correctly rejected with invalid email")


class TestEmployeeAuth:
    """Test employee authentication flow"""
    
    def test_employee_login_success(self):
        """Test employee (Marc) can login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "designer"
        assert data["user"]["email"] == EMPLOYEE_EMAIL
        assert data["user"]["name"] == "Marc Dessinateur"
        assert data["user"]["is_approved"] == True
        print(f"✅ Employee login successful: {data['user']['name']} ({data['user']['role']})")
    
    def test_employee_login_invalid_credentials(self):
        """Test employee login fails with wrong credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✅ Employee login correctly rejected with invalid password")


class TestEmployeeProjects:
    """Test employee project access (my-projects endpoint)"""
    
    @pytest.fixture
    def employee_token(self):
        """Get employee authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Employee authentication failed")
    
    def test_my_projects_endpoint(self, employee_token):
        """Test employee can access their assigned projects"""
        response = requests.get(
            f"{BASE_URL}/api/employees/my-projects",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "projects" in data
        assert "total" in data
        
        # Marc should have at least 1 project (Mini-maison)
        assert data["total"] >= 1
        print(f"✅ Employee has {data['total']} project(s) assigned")
        
        # Verify Mini-maison project is present
        projects = data["projects"]
        mini_maison_found = any(p.get("projectType") == "Mini-maison" for p in projects)
        assert mini_maison_found, "Mini-maison project should be assigned to Marc"
        print("✅ Mini-maison project found in employee's projects")
    
    def test_my_projects_requires_auth(self):
        """Test my-projects endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/employees/my-projects")
        assert response.status_code in [401, 403]
        print("✅ my-projects endpoint correctly requires authentication")
    
    def test_my_projects_invalid_token(self):
        """Test my-projects endpoint rejects invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/employees/my-projects",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code in [401, 403]
        print("✅ my-projects endpoint correctly rejects invalid token")


class TestAdminEmployeeManagement:
    """Test admin employee management endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_list_employees(self, admin_token):
        """Test admin can list all employees"""
        response = requests.get(
            f"{BASE_URL}/api/employees/admin/list",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "data" in data
        assert "total" in data
        
        # Marc Dessinateur should be in the list
        employees = data["data"]
        marc_found = any(e.get("name") == "Marc Dessinateur" for e in employees)
        assert marc_found, "Marc Dessinateur should be in employee list"
        
        # Find Marc and verify his data
        marc = next((e for e in employees if e.get("name") == "Marc Dessinateur"), None)
        assert marc is not None
        assert marc.get("email") == "marc@abrisia-plan.ca"
        assert marc.get("role") == "designer"
        assert marc.get("isApproved") == True
        assert marc.get("projectsCount") >= 1
        
        print(f"✅ Admin can list employees. Found {data['total']} employees")
        print(f"✅ Marc Dessinateur found with {marc.get('projectsCount')} project(s)")
    
    def test_employee_list_requires_admin(self, employee_token=None):
        """Test employee list endpoint requires admin role"""
        # First get employee token
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
        )
        employee_token = response.json().get("token")
        
        # Try to access admin endpoint with employee token
        response = requests.get(
            f"{BASE_URL}/api/employees/admin/list",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        assert response.status_code in [401, 403]
        print("✅ Employee list endpoint correctly requires admin role")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
