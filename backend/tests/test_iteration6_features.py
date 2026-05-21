"""
FALINTIL-FDTL PMS - Iteration 6 Feature Tests
Tests for PDF alterations and new features:
1. Total Efetivos (renamed from Total Membros)
2. Cartão de Eleitor with date field
3. Nº Irmãos, Nº Irmãs, Posição Filho(a) in Afiliação Familiar
4. Ler checkbox in Habilidade de Língua
5. New postos: Subtenente and Segundo Marinheiro
6. 55 years and Reforma alerts on Dashboard
7. Salvar Step button (frontend only)
8. Anexo Documento Familiar
9. 6 members total (1 original + 5 test)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://falintil-pms.preview.emergentagent.com')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@falintil-fdtl.tl",
        "senha": "admin123"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def auth_headers(auth_token):
    """Return headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestLogin:
    """Test 1: Login with admin credentials"""
    
    def test_admin_login_success(self):
        """Test login with admin@falintil-fdtl.tl / admin123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@falintil-fdtl.tl"
        assert data["user"]["role"] == "admin"
        print("TEST 1 PASSED: Login with admin@falintil-fdtl.tl / admin123 successful")


class TestDashboardStats:
    """Test 2-4: Dashboard stats and alerts"""
    
    def test_total_efetivos_field(self, auth_headers):
        """Test 2: Dashboard returns 'total' field (Total Efetivos)"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert isinstance(data["total"], int)
        print(f"TEST 2 PASSED: Dashboard returns 'total' field with value: {data['total']}")
    
    def test_reforma_alert_maria_fernanda(self, auth_headers):
        """Test 3: Dashboard shows Reforma alert for Maria Fernanda (59 anos)"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "alertas_reforma" in data
        assert "total_alertas_reforma" in data
        
        # Find Maria Fernanda in reforma alerts
        maria_found = False
        for alert in data["alertas_reforma"]:
            if "Maria Fernanda" in alert.get("nome", ""):
                maria_found = True
                assert alert["idade"] == 59
                assert alert["nim"] == "TEST002"
                print(f"TEST 3 PASSED: Maria Fernanda dos Santos (59 anos) found in Reforma alerts")
                break
        
        assert maria_found, "Maria Fernanda dos Santos not found in reforma alerts"
    
    def test_55_anos_alert_joao_manuel(self, auth_headers):
        """Test 4: Dashboard shows 55 anos alert for João Manuel (54 anos)"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "alertas_55_anos" in data
        assert "total_alertas_55" in data
        
        # Find João Manuel in 55 anos alerts
        joao_found = False
        for alert in data["alertas_55_anos"]:
            if "João Manuel" in alert.get("nome", ""):
                joao_found = True
                assert alert["idade"] == 54
                assert alert["nim"] == "TEST001"
                print(f"TEST 4 PASSED: João Manuel da Silva (54 anos) found in 55 anos alerts")
                break
        
        assert joao_found, "João Manuel da Silva not found in 55 anos alerts"


class TestMemberFormFields:
    """Test 5-8: New form fields"""
    
    def test_cartao_eleitoral_data_field(self, auth_headers):
        """Test 5: Member creation accepts cartao_eleitoral_data field"""
        # Create a test member with cartao_eleitoral_data
        test_member = {
            "nome": "TEST_CartaoEleitor",
            "nim": "TEST_CE001",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-01",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "cartao_eleitoral": "CE123456",
            "cartao_eleitoral_data": "2020-05-15"
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=test_member, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["cartao_eleitoral"] == "CE123456"
        assert data["cartao_eleitoral_data"] == "2020-05-15"
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print("TEST 5 PASSED: cartao_eleitoral_data field accepted and stored")
    
    def test_ler_checkbox_in_habilidade_lingua(self, auth_headers):
        """Test 6: Member creation accepts 'ler' field in habilidade_lingua"""
        test_member = {
            "nome": "TEST_LerCheckbox",
            "nim": "TEST_LER001",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-01",
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
                    "ler": True,
                    "ouvir": True
                }
            ]
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=test_member, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["habilidade_lingua"]) == 1
        assert data["habilidade_lingua"][0]["ler"] == True
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print("TEST 6 PASSED: 'ler' checkbox field accepted in habilidade_lingua")
    
    def test_afiliacao_familiar_new_fields(self, auth_headers):
        """Test 7: Member creation accepts num_irmaos, num_irmas, posicao_filho"""
        test_member = {
            "nome": "TEST_AfiliacaoFamiliar",
            "nim": "TEST_AF001",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-01",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "nome_pai": "José da Silva",
            "nome_mae": "Maria da Silva",
            "num_irmaos": "3",
            "num_irmas": "2",
            "posicao_filho": "2"
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=test_member, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["num_irmaos"] == "3"
        assert data["num_irmas"] == "2"
        assert data["posicao_filho"] == "2"
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print("TEST 7 PASSED: num_irmaos, num_irmas, posicao_filho fields accepted")
    
    def test_familia_anexo_field(self, auth_headers):
        """Test 8: Member creation accepts familia_anexo field"""
        test_member = {
            "nome": "TEST_FamiliaAnexo",
            "nim": "TEST_FA001",
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-01-01",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "familia_anexo": "https://example.com/documento.pdf",
            "familia_anexo_nome": "documento_familiar.pdf"
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=test_member, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["familia_anexo"] == "https://example.com/documento.pdf"
        
        # Cleanup
        member_id = data["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print("TEST 8 PASSED: familia_anexo field accepted")


class TestNewPostos:
    """Test 10: New postos Subtenente and Segundo Marinheiro"""
    
    def test_postos_include_subtenente(self):
        """Test that postos include Subtenente"""
        response = requests.get(f"{BASE_URL}/api/constants/postos")
        assert response.status_code == 200
        data = response.json()
        
        # Subtenente should be in "Oficiais Capitães e Subalternos"
        assert "Oficiais Capitães e Subalternos" in data
        assert "Subtenente" in data["Oficiais Capitães e Subalternos"]
        print("TEST 10a PASSED: Subtenente found in postos")
    
    def test_postos_include_segundo_marinheiro(self):
        """Test that postos include Segundo Marinheiro"""
        response = requests.get(f"{BASE_URL}/api/constants/postos")
        assert response.status_code == 200
        data = response.json()
        
        # Segundo Marinheiro should be in "Praças"
        assert "Praças" in data
        assert "Segundo Marinheiro" in data["Praças"]
        print("TEST 10b PASSED: Segundo Marinheiro found in postos")


class TestMemberCount:
    """Test 11: Verify 6 members total"""
    
    def test_total_members_count(self, auth_headers):
        """Test 11: Verify 6 members in total (1 original + 5 test)"""
        response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 6
        print(f"TEST 11 PASSED: Total members count is {data['total']} (expected 6)")
    
    def test_test_members_exist(self, auth_headers):
        """Verify test members TEST001-TEST005 exist"""
        response = requests.get(f"{BASE_URL}/api/members?limit=20", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        test_nims = ["TEST001", "TEST002", "TEST003", "TEST004", "TEST005"]
        found_nims = [m["nim"] for m in data["members"]]
        
        for nim in test_nims:
            assert nim in found_nims, f"Test member {nim} not found"
        
        print("TEST 11b PASSED: All test members TEST001-TEST005 exist")
    
    def test_subtenente_member_exists(self, auth_headers):
        """Verify António (TEST003) is Subtenente"""
        response = requests.get(f"{BASE_URL}/api/members?nim=TEST003", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["members"]) == 1
        assert data["members"][0]["posto"] == "Subtenente"
        print("TEST 11c PASSED: António José Guterres (TEST003) is Subtenente")
    
    def test_segundo_marinheiro_member_exists(self, auth_headers):
        """Verify Isabel (TEST004) is Segundo Marinheiro"""
        response = requests.get(f"{BASE_URL}/api/members?nim=TEST004", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["members"]) == 1
        assert data["members"][0]["posto"] == "Segundo Marinheiro"
        print("TEST 11d PASSED: Isabel Cristina Amaral (TEST004) is Segundo Marinheiro")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
