"""
Test Iteration 5 - Testing specific features:
1. Login with admin credentials
2. Dashboard: 'Total Efetivos' label
3. Dashboard: Component cards (CFT, CFN, CAL, Outros)
4. Dashboard: 55 years alerts (members with 54 years)
5. Dashboard: Reforma alerts (members with 59 years)
6. Member form: 'Data Cartão Eleitoral' field
7. Member form: Language skills checkboxes (Falar, Escrever, LER, Ouvir)
8. New postos: Subtenente, Segundo Marinheiro
9. File upload in attachments
10. Attachments show 'Ver' when file exists
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://falintil-pms.preview.emergentagent.com').rstrip('/')

class TestLogin:
    """Test login with admin credentials"""
    
    def test_login_admin_success(self):
        """Test 1: Login with admin@falintil-fdtl.tl / admin123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@falintil-fdtl.tl"
        assert data["user"]["role"] == "admin"
        print(f"✓ Login successful for admin@falintil-fdtl.tl")


class TestDashboardStats:
    """Test dashboard statistics and alerts"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_dashboard_stats_structure(self, auth_token):
        """Test 2: Dashboard stats include 'total' for 'Total Efetivos'"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check total field exists (used for 'Total Efetivos')
        assert "total" in data, "Dashboard should have 'total' field for 'Total Efetivos'"
        print(f"✓ Dashboard has 'total' field: {data['total']}")
    
    def test_dashboard_component_cards(self, auth_token):
        """Test 3: Dashboard has component cards (CFT, CFN, CAL, Outros)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check por_componente exists with all required keys
        assert "por_componente" in data, "Dashboard should have 'por_componente'"
        componentes = data["por_componente"]
        assert "cft" in componentes, "Should have CFT component"
        assert "cfn" in componentes, "Should have CFN component"
        assert "cal" in componentes, "Should have CAL component"
        assert "outros" in componentes, "Should have Outros component"
        print(f"✓ Dashboard has component cards: CFT={componentes['cft']}, CFN={componentes['cfn']}, CAL={componentes['cal']}, Outros={componentes['outros']}")
    
    def test_dashboard_55_years_alerts(self, auth_token):
        """Test 4: Dashboard has 55 years alerts (members with 54 years)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check alertas_55_anos exists
        assert "alertas_55_anos" in data, "Dashboard should have 'alertas_55_anos'"
        assert "total_alertas_55" in data, "Dashboard should have 'total_alertas_55'"
        print(f"✓ Dashboard has 55 years alerts: {data['total_alertas_55']} member(s)")
    
    def test_dashboard_reforma_alerts(self, auth_token):
        """Test 5: Dashboard has Reforma alerts (members with 59 years)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check alertas_reforma exists
        assert "alertas_reforma" in data, "Dashboard should have 'alertas_reforma'"
        assert "total_alertas_reforma" in data, "Dashboard should have 'total_alertas_reforma'"
        print(f"✓ Dashboard has Reforma alerts: {data['total_alertas_reforma']} member(s)")


class TestPostosConstants:
    """Test new postos: Subtenente, Segundo Marinheiro"""
    
    def test_postos_include_subtenente(self):
        """Test 8a: Postos include 'Subtenente'"""
        response = requests.get(f"{BASE_URL}/api/constants/postos")
        assert response.status_code == 200
        data = response.json()
        
        # Flatten all postos
        all_postos = []
        for category, postos in data.items():
            all_postos.extend(postos)
        
        assert "Subtenente" in all_postos, "Postos should include 'Subtenente'"
        print(f"✓ 'Subtenente' found in postos")
    
    def test_postos_include_segundo_marinheiro(self):
        """Test 8b: Postos include 'Segundo Marinheiro'"""
        response = requests.get(f"{BASE_URL}/api/constants/postos")
        assert response.status_code == 200
        data = response.json()
        
        # Flatten all postos
        all_postos = []
        for category, postos in data.items():
            all_postos.extend(postos)
        
        assert "Segundo Marinheiro" in all_postos, "Postos should include 'Segundo Marinheiro'"
        print(f"✓ 'Segundo Marinheiro' found in postos")


class TestMemberCreationWithNewFields:
    """Test member creation with new fields"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_create_member_with_cartao_eleitoral_data(self, auth_token):
        """Test 6: Create member with 'cartao_eleitoral_data' field"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create member with cartao_eleitoral_data
        member_data = {
            "nome": "TEST_Cartao_Eleitoral",
            "nim": f"TEST_CE_{datetime.now().strftime('%H%M%S')}",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-15",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "cartao_eleitoral": "CE123456",
            "cartao_eleitoral_data": "2024-06-15"  # New field
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=headers)
        assert response.status_code == 200, f"Failed to create member: {response.text}"
        data = response.json()
        
        # Verify cartao_eleitoral_data was saved
        assert data.get("cartao_eleitoral_data") == "2024-06-15", "cartao_eleitoral_data should be saved"
        print(f"✓ Member created with cartao_eleitoral_data: {data.get('cartao_eleitoral_data')}")
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=headers)
    
    def test_create_member_with_language_skills(self, auth_token):
        """Test 7: Create member with language skills including 'ler' checkbox"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create member with habilidade_lingua including 'ler'
        member_data = {
            "nome": "TEST_Language_Skills",
            "nim": f"TEST_LS_{datetime.now().strftime('%H%M%S')}",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-15",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "habilidade_lingua": [
                {
                    "lingua": "Português",
                    "falar": True,
                    "escrever": True,
                    "ler": True,  # New checkbox
                    "ouvir": True
                },
                {
                    "lingua": "Tétum",
                    "falar": True,
                    "escrever": False,
                    "ler": True,  # New checkbox
                    "ouvir": True
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=headers)
        assert response.status_code == 200, f"Failed to create member: {response.text}"
        data = response.json()
        
        # Verify habilidade_lingua was saved with 'ler' field
        assert "habilidade_lingua" in data, "habilidade_lingua should be saved"
        assert len(data["habilidade_lingua"]) == 2, "Should have 2 languages"
        
        # Check first language has all 4 skills
        lang1 = data["habilidade_lingua"][0]
        assert lang1.get("falar") == True, "falar should be True"
        assert lang1.get("escrever") == True, "escrever should be True"
        assert lang1.get("ler") == True, "ler should be True"
        assert lang1.get("ouvir") == True, "ouvir should be True"
        
        print(f"✓ Member created with language skills including 'ler': {data['habilidade_lingua']}")
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=headers)


class TestFileUpload:
    """Test file upload functionality"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_file_upload(self, auth_token):
        """Test 9: File upload in attachments"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Create a simple test file
        files = {
            'file': ('test_document.txt', b'Test content for file upload', 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/upload", files=files, headers=headers)
        assert response.status_code == 200, f"File upload failed: {response.text}"
        data = response.json()
        
        assert "file_id" in data, "Response should contain file_id"
        assert "filename" in data, "Response should contain filename"
        assert data["filename"] == "test_document.txt"
        
        print(f"✓ File uploaded successfully: file_id={data['file_id']}")
        
        # Test 10: Verify file can be downloaded (shows 'Ver' when file exists)
        file_id = data["file_id"]
        download_response = requests.get(f"{BASE_URL}/api/files/{file_id}/download")
        assert download_response.status_code == 200, "File download should work"
        assert download_response.content == b'Test content for file upload'
        
        print(f"✓ File download works (shows 'Ver' when file exists)")


class TestRetirementAlerts:
    """Test retirement alerts endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_retirement_alerts_endpoint(self, auth_token):
        """Test retirement alerts endpoint returns proper structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/members/retirement-alerts", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total" in data, "Should have total count"
        assert "alerts" in data, "Should have alerts list"
        print(f"✓ Retirement alerts endpoint works: {data['total']} alerts")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
