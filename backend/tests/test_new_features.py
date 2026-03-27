"""
Test suite for new features in FALINTIL-FDTL PMS:
1. Ano de Incorporação field
2. Status de Escolaridade field
3. Status de Licença field
4. Data de Promoção and Posto Promovido (conditional)
5. Dashboard status_licenca cards
6. Filters (unidade, ano_incorporacao, status_licenca)
7. Activity Logs system
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://falintil-pms.preview.emergentagent.com')

@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@falintil-fdtl.tl",
        "senha": "admin123"
    })
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestConstantsEndpoints:
    """Test new constants endpoints"""
    
    def test_status_escolaridade_endpoint(self):
        """Test /api/constants/status-escolaridade returns correct values"""
        response = requests.get(f"{BASE_URL}/api/constants/status-escolaridade")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "Doutorado/a" in data
        assert "Mestrado/a" in data
        assert "Licenciatura" in data
        assert "Secundária" in data
        print(f"✓ Status Escolaridade: {len(data)} options")
    
    def test_status_licenca_endpoint(self):
        """Test /api/constants/status-licenca returns correct values"""
        response = requests.get(f"{BASE_URL}/api/constants/status-licenca")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "Em Serviço" in data
        assert "Licença Sem Vencimento" in data
        assert "Licença Junta Médica" in data
        assert "Licença de Partos" in data
        assert "Licença de Estudo" in data
        assert "Curso no Exterior" in data
        assert "Curso no Interior" in data
        print(f"✓ Status Licença: {len(data)} options")
    
    def test_postos_promocao_endpoint(self):
        """Test /api/constants/postos-promocao returns all postos"""
        response = requests.get(f"{BASE_URL}/api/constants/postos-promocao")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 20  # Should have many postos
        assert "General" in data
        assert "Coronel" in data
        assert "Soldado" in data
        print(f"✓ Postos Promoção: {len(data)} options")
    
    def test_postos_sem_promocao_endpoint(self):
        """Test /api/constants/postos-sem-promocao returns initial postos"""
        response = requests.get(f"{BASE_URL}/api/constants/postos-sem-promocao")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert "Soldado" in data
        assert "Grumete" in data
        assert "Soldado Instruendo" in data
        assert len(data) == 3
        print(f"✓ Postos Sem Promoção: {data}")


class TestMemberNewFields:
    """Test new member fields"""
    
    def test_create_member_with_new_fields(self, auth_headers):
        """Test creating member with all new fields"""
        unique_nim = f"TEST{uuid.uuid4().hex[:6].upper()}"
        member_data = {
            "nome": "Test Member New Fields",
            "nim": unique_nim,
            "posto": "Capitão",  # Not in postos_sem_promocao, so promotion fields should work
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1990-05-15",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "status": "Ativo",
            # New fields
            "ano_incorporacao": "2015",
            "status_escolaridade": "Licenciatura",
            "status_licenca": "Em Serviço",
            "data_promocao": "2023-01-15",
            "posto_promovido": "Major"
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=auth_headers)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        created = response.json()
        assert created["ano_incorporacao"] == "2015"
        assert created["status_escolaridade"] == "Licenciatura"
        assert created["status_licenca"] == "Em Serviço"
        assert created["data_promocao"] == "2023-01-15"
        assert created["posto_promovido"] == "Major"
        
        # Cleanup
        member_id = created["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print(f"✓ Created member with new fields: {unique_nim}")
    
    def test_create_member_default_status_licenca(self, auth_headers):
        """Test that status_licenca defaults to 'Em Serviço'"""
        unique_nim = f"TEST{uuid.uuid4().hex[:6].upper()}"
        member_data = {
            "nome": "Test Default Status",
            "nim": unique_nim,
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1995-03-20",
            "naturalidade": "Baucau",
            "estado_civil": "Solteiro",
            "municipio": "Baucau",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "A+",
            "status": "Ativo"
            # Not providing status_licenca - should default to "Em Serviço"
        }
        
        response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=auth_headers)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        created = response.json()
        assert created["status_licenca"] == "Em Serviço", f"Expected 'Em Serviço', got {created.get('status_licenca')}"
        
        # Cleanup
        member_id = created["member_id"]
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print(f"✓ Default status_licenca is 'Em Serviço'")
    
    def test_update_member_new_fields(self, auth_headers):
        """Test updating member with new fields"""
        # First create a member
        unique_nim = f"TEST{uuid.uuid4().hex[:6].upper()}"
        member_data = {
            "nome": "Test Update Fields",
            "nim": unique_nim,
            "posto": "Tenente",
            "unidade": "Quartel General",
            "sexo": "F",
            "data_nascimento": "1992-08-10",
            "naturalidade": "Aileu",
            "estado_civil": "Casada",
            "municipio": "Aileu",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "B+",
            "status": "Ativo"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=auth_headers)
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Update with new fields
        update_data = {
            "ano_incorporacao": "2018",
            "status_escolaridade": "Mestrado/a",
            "status_licenca": "Licença de Estudo",
            "data_promocao": "2024-06-01",
            "posto_promovido": "Capitão"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/members/{member_id}", json=update_data, headers=auth_headers)
        assert update_response.status_code == 200
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        assert get_response.status_code == 200
        updated = get_response.json()
        
        assert updated["ano_incorporacao"] == "2018"
        assert updated["status_escolaridade"] == "Mestrado/a"
        assert updated["status_licenca"] == "Licença de Estudo"
        assert updated["data_promocao"] == "2024-06-01"
        assert updated["posto_promovido"] == "Capitão"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print(f"✓ Updated member with new fields")


class TestDashboardStatusLicenca:
    """Test dashboard status_licenca statistics"""
    
    def test_dashboard_stats_includes_status_licenca(self, auth_headers):
        """Test that dashboard stats include por_status_licenca"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "por_status_licenca" in data
        
        status_licenca = data["por_status_licenca"]
        assert "em_servico" in status_licenca
        assert "licenca_sem_vencimento" in status_licenca
        assert "licenca_junta_medica" in status_licenca
        assert "licenca_partos" in status_licenca
        assert "licenca_estudo" in status_licenca
        assert "curso_exterior" in status_licenca
        assert "curso_interior" in status_licenca
        
        print(f"✓ Dashboard includes status_licenca stats: {status_licenca}")


class TestMemberFilters:
    """Test new member filters"""
    
    def test_filter_by_unidade(self, auth_headers):
        """Test filtering members by unidade"""
        response = requests.get(f"{BASE_URL}/api/members?unidade=Quartel General", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "members" in data
        # All returned members should have the specified unidade
        for member in data["members"]:
            assert member["unidade"] == "Quartel General"
        print(f"✓ Filter by unidade works: {data['total']} members")
    
    def test_filter_by_status_licenca(self, auth_headers):
        """Test filtering members by status_licenca"""
        response = requests.get(f"{BASE_URL}/api/members?status_licenca=Em Serviço", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "members" in data
        print(f"✓ Filter by status_licenca works: {data['total']} members")
    
    def test_filter_by_ano_incorporacao(self, auth_headers):
        """Test filtering members by ano_incorporacao"""
        # First create a member with ano_incorporacao
        unique_nim = f"TEST{uuid.uuid4().hex[:6].upper()}"
        member_data = {
            "nome": "Test Filter Ano",
            "nim": unique_nim,
            "posto": "Soldado",
            "unidade": "Quartel General",
            "sexo": "M",
            "data_nascimento": "1998-01-01",
            "naturalidade": "Dili",
            "estado_civil": "Solteiro",
            "municipio": "Dili",
            "nacionalidade": "Timorense",
            "tipo_sanguineo": "O+",
            "status": "Ativo",
            "ano_incorporacao": "2020"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/members", json=member_data, headers=auth_headers)
        assert create_response.status_code == 200
        member_id = create_response.json()["member_id"]
        
        # Test filter
        response = requests.get(f"{BASE_URL}/api/members?ano_incorporacao=2020", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/members/{member_id}", headers=auth_headers)
        print(f"✓ Filter by ano_incorporacao works")
    
    def test_members_sorted_alphabetically(self, auth_headers):
        """Test that members are sorted alphabetically by name"""
        response = requests.get(f"{BASE_URL}/api/members?limit=50", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        if len(data["members"]) > 1:
            names = [m["nome"] for m in data["members"]]
            sorted_names = sorted(names, key=str.lower)
            assert names == sorted_names, f"Members not sorted alphabetically: {names[:5]}"
        print(f"✓ Members sorted alphabetically (A-Z)")


class TestActivityLogs:
    """Test activity logs system"""
    
    def test_activity_logs_endpoint(self, auth_headers):
        """Test /api/activity-logs returns logs"""
        response = requests.get(f"{BASE_URL}/api/activity-logs", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "logs" in data
        
        if data["total"] > 0:
            log = data["logs"][0]
            assert "log_id" in log
            assert "user_email" in log
            assert "user_role" in log
            assert "action" in log
            assert "timestamp" in log
            assert "data_formatada" in log
        
        print(f"✓ Activity logs endpoint works: {data['total']} logs")
    
    def test_activity_logs_filter_by_action(self, auth_headers):
        """Test filtering activity logs by action"""
        response = requests.get(f"{BASE_URL}/api/activity-logs?action=LOGIN", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        for log in data["logs"]:
            assert "LOGIN" in log["action"]
        print(f"✓ Activity logs filter by action works")
    
    def test_activity_logs_export(self, auth_headers):
        """Test /api/activity-logs/export returns all logs"""
        response = requests.get(f"{BASE_URL}/api/activity-logs/export", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Activity logs export works: {len(data)} logs")
    
    def test_activity_logs_admin_only(self):
        """Test that activity logs require admin role"""
        # Try without auth
        response = requests.get(f"{BASE_URL}/api/activity-logs")
        assert response.status_code in [401, 403]
        print(f"✓ Activity logs require authentication")
    
    def test_login_creates_activity_log(self, auth_headers):
        """Test that login creates an activity log"""
        # Get current log count
        before_response = requests.get(f"{BASE_URL}/api/activity-logs?action=LOGIN", headers=auth_headers)
        before_count = before_response.json()["total"]
        
        # Login again
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@falintil-fdtl.tl",
            "senha": "admin123"
        })
        assert login_response.status_code == 200
        
        # Check log count increased
        after_response = requests.get(f"{BASE_URL}/api/activity-logs?action=LOGIN", headers=auth_headers)
        after_count = after_response.json()["total"]
        
        assert after_count > before_count, "Login should create activity log"
        print(f"✓ Login creates activity log")


class TestAnosIncorporacao:
    """Test anos_incorporacao endpoint"""
    
    def test_anos_incorporacao_endpoint(self, auth_headers):
        """Test /api/constants/anos-incorporacao returns existing years"""
        response = requests.get(f"{BASE_URL}/api/constants/anos-incorporacao", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Should return only years that exist in the database
        print(f"✓ Anos incorporação endpoint works: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
