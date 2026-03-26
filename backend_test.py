#!/usr/bin/env python3
"""
FALINTIL-FDTL PMS Backend API Testing
Tests all major API endpoints for the Personnel Management System
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class FalintilPMSAPITester:
    def __init__(self, base_url="https://falintil-pms.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.headers = {'Content-Type': 'application/json'}
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = self.headers.copy()
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}", {}

            success = response.status_code == expected_status
            response_data = {}
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}

            if not success:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {response_data}"
            else:
                details = "Success"

            return success, details, response_data

        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, details, data = self.make_request('GET', '')
        self.log_test("Root API Endpoint", success, details)
        return success

    def test_init_admin(self):
        """Test admin initialization"""
        success, details, data = self.make_request('POST', 'init-admin')
        # This might return 200 if admin exists or created
        if success or "Admin já existe" in str(data):
            self.log_test("Admin Initialization", True, "Admin exists or created")
            return True
        else:
            self.log_test("Admin Initialization", False, details)
            return False

    def test_login(self):
        """Test login with admin credentials"""
        login_data = {
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        }
        success, details, data = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'access_token' in data:
            self.token = data['access_token']
            self.log_test("Admin Login", True, f"Token received, user role: {data.get('user', {}).get('role', 'unknown')}")
            return True
        else:
            self.log_test("Admin Login", False, details)
            return False

    def test_get_me(self):
        """Test get current user info"""
        success, details, data = self.make_request('GET', 'auth/me')
        if success:
            self.log_test("Get Current User", True, f"User: {data.get('nome', '')} {data.get('sobrenome', '')}")
        else:
            self.log_test("Get Current User", False, details)
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, details, data = self.make_request('GET', 'dashboard/stats')
        if success:
            total = data.get('total', 0)
            por_status = data.get('por_status', {})
            self.log_test("Dashboard Stats", True, f"Total members: {total}, Active: {por_status.get('ativos', 0)}")
        else:
            self.log_test("Dashboard Stats", False, details)
        return success

    def test_constants_endpoints(self):
        """Test all constants endpoints"""
        constants = [
            'postos', 'unidades', 'municipios', 'estado-civil', 
            'tipos-sanguineos', 'graus-estudo', 'tipos-punicao', 
            'tipos-licenca', 'cartao-conducao', 'member-status'
        ]
        
        all_success = True
        for constant in constants:
            success, details, data = self.make_request('GET', f'constants/{constant}')
            if success:
                count = len(data) if isinstance(data, list) else len(data.keys()) if isinstance(data, dict) else 0
                self.log_test(f"Constants: {constant}", True, f"{count} items")
            else:
                self.log_test(f"Constants: {constant}", False, details)
                all_success = False
        
        return all_success

    def test_create_member(self):
        """Test creating a new member"""
        member_data = {
            "nome": f"Test Member {datetime.now().strftime('%H%M%S')}",
            "nim": f"TM{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "posto": "Soldado",
            "unidade": "1º Batalhão da CFT",
            "sexo": "M",
            "data_nascimento": "1990-01-01",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "status": "Ativo"
        }
        
        success, details, data = self.make_request('POST', 'members', member_data, 200)
        if success:
            member_id = data.get('member_id')
            self.test_member_id = member_id  # Store for later tests
            self.log_test("Create Member", True, f"Member created with ID: {member_id}")
        else:
            self.log_test("Create Member", False, details)
        return success

    def test_list_members(self):
        """Test listing members"""
        success, details, data = self.make_request('GET', 'members')
        if success:
            total = data.get('total', 0)
            members_count = len(data.get('members', []))
            self.log_test("List Members", True, f"Total: {total}, Retrieved: {members_count}")
        else:
            self.log_test("List Members", False, details)
        return success

    def test_get_member(self):
        """Test getting specific member"""
        if not hasattr(self, 'test_member_id'):
            self.log_test("Get Member", False, "No test member ID available")
            return False
            
        success, details, data = self.make_request('GET', f'members/{self.test_member_id}')
        if success:
            name = data.get('nome', 'Unknown')
            self.log_test("Get Member", True, f"Retrieved member: {name}")
        else:
            self.log_test("Get Member", False, details)
        return success

    def test_update_member(self):
        """Test updating member"""
        if not hasattr(self, 'test_member_id'):
            self.log_test("Update Member", False, "No test member ID available")
            return False
            
        update_data = {
            "atual_funcao": "Test Function Updated",
            "numero_contacto": "+670 123 456 789"
        }
        
        success, details, data = self.make_request('PUT', f'members/{self.test_member_id}', update_data)
        self.log_test("Update Member", success, details)
        return success

    def test_create_user(self):
        """Test creating a new user (RH role)"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "nome": "Test",
            "sobrenome": "RH User",
            "email": f"test.rh.{timestamp}@falintil-fdtl.tl",
            "senha": "testpass123",
            "confirmacao_senha": "testpass123",
            "role": "rh"
        }
        
        success, details, data = self.make_request('POST', 'users', user_data, 200)
        if success:
            user_id = data.get('user_id')
            self.test_user_id = user_id  # Store for later tests
            self.log_test("Create User", True, f"RH user created with ID: {user_id}")
        else:
            self.log_test("Create User", False, details)
        return success

    def test_list_users(self):
        """Test listing users"""
        success, details, data = self.make_request('GET', 'users')
        if success:
            users_count = len(data)
            self.log_test("List Users", True, f"Retrieved {users_count} users")
        else:
            self.log_test("List Users", False, details)
        return success

    def test_get_user(self):
        """Test getting specific user"""
        if not hasattr(self, 'test_user_id'):
            self.log_test("Get User", False, "No test user ID available")
            return False
            
        success, details, data = self.make_request('GET', f'users/{self.test_user_id}')
        if success:
            name = f"{data.get('nome', '')} {data.get('sobrenome', '')}"
            self.log_test("Get User", True, f"Retrieved user: {name}")
        else:
            self.log_test("Get User", False, details)
        return success

    def test_member_status_filtering(self):
        """Test filtering members by status"""
        statuses = ['Ativo', 'Falecido', 'Separação do Serviço', 'Reserva', 'Reforma']
        all_success = True
        
        for status in statuses:
            success, details, data = self.make_request('GET', f'members?status={status}')
            if success:
                total = data.get('total', 0)
                self.log_test(f"Filter Members: {status}", True, f"{total} members")
            else:
                self.log_test(f"Filter Members: {status}", False, details)
                all_success = False
        
        return all_success

    def test_notifications(self):
        """Test notifications system"""
        # Test getting notifications
        success, details, data = self.make_request('GET', 'notifications')
        if success:
            count = len(data)
            self.log_test("Get Notifications", True, f"{count} notifications")
        else:
            self.log_test("Get Notifications", False, details)
            return False

        # Test unread count
        success, details, data = self.make_request('GET', 'notifications/unread-count')
        if success:
            count = data.get('count', 0)
            self.log_test("Unread Notifications Count", True, f"{count} unread")
        else:
            self.log_test("Unread Notifications Count", False, details)
            return False

        return True

    def test_backup_system(self):
        """Test backup functionality"""
        success, details, data = self.make_request('POST', 'backup')
        if success:
            backup_id = data.get('backup_id')
            stats = data.get('stats', {})
            self.log_test("Create Backup", True, f"Backup ID: {backup_id}, Members: {stats.get('members_count', 0)}")
        else:
            self.log_test("Create Backup", False, details)
            return False

        # Test list backups
        success, details, data = self.make_request('GET', 'backups')
        if success:
            count = len(data)
            self.log_test("List Backups", True, f"{count} backups")
        else:
            self.log_test("List Backups", False, details)
            return False

        return True

    def cleanup_test_data(self):
        """Clean up test data"""
        # Delete test member
        if hasattr(self, 'test_member_id'):
            success, details, data = self.make_request('DELETE', f'members/{self.test_member_id}')
            self.log_test("Cleanup: Delete Test Member", success, details)

        # Delete test user
        if hasattr(self, 'test_user_id'):
            success, details, data = self.make_request('DELETE', f'users/{self.test_user_id}')
            self.log_test("Cleanup: Delete Test User", success, details)

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting FALINTIL-FDTL PMS Backend API Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)

        # Basic connectivity tests
        if not self.test_root_endpoint():
            print("❌ Cannot connect to API. Stopping tests.")
            return False

        # Authentication setup
        self.test_init_admin()
        if not self.test_login():
            print("❌ Cannot authenticate. Stopping tests.")
            return False

        # Core functionality tests
        self.test_get_me()
        self.test_dashboard_stats()
        self.test_constants_endpoints()
        
        # Member management tests
        self.test_create_member()
        self.test_list_members()
        self.test_get_member()
        self.test_update_member()
        self.test_member_status_filtering()
        
        # User management tests
        self.test_create_user()
        self.test_list_users()
        self.test_get_user()
        
        # Additional features
        self.test_notifications()
        self.test_backup_system()
        
        # Cleanup
        self.cleanup_test_data()

        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    tester = FalintilPMSAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_api_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())