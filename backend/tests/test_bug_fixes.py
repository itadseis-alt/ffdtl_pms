"""
Test cases for FALINTIL-FDTL PMS Bug Fixes - Iteration 3
Tests: Profile photo, file download, dashboard navigation, dropdown visibility
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://falintil-pms.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "admin@falintil-fdtl.tl"
TEST_PASSWORD = "admin123"

# Known test data
TEST_MEMBER_ID = "5abfbe9f-8d99-4edc-8973-e301fe93a416"
TEST_FILE_ID = "5577c444-9bc6-4b2f-82a4-bc1187232d9b"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "senha": TEST_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestFileDownloadEndpoint:
    """Tests for Bug Fix #1 & #2: Profile photo and PDF download"""
    
    def test_file_download_returns_200(self):
        """Test that /api/files/{id}/download returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/files/{TEST_FILE_ID}/download")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    def test_file_download_returns_correct_content_type(self):
        """Test that file download returns correct content type (image/jpeg for photo)"""
        response = requests.get(f"{BASE_URL}/api/files/{TEST_FILE_ID}/download")
        assert response.status_code == 200
        content_type = response.headers.get("content-type", "")
        assert "image" in content_type or "application" in content_type, f"Unexpected content type: {content_type}"
    
    def test_file_download_returns_binary_content(self):
        """Test that file download returns actual binary content"""
        response = requests.get(f"{BASE_URL}/api/files/{TEST_FILE_ID}/download")
        assert response.status_code == 200
        assert len(response.content) > 0, "File content is empty"
        # Photo should be at least 1KB
        assert len(response.content) > 1000, f"File too small: {len(response.content)} bytes"
    
    def test_file_download_has_inline_disposition(self):
        """Test that file download has inline content disposition for viewing"""
        response = requests.get(f"{BASE_URL}/api/files/{TEST_FILE_ID}/download")
        assert response.status_code == 200
        disposition = response.headers.get("content-disposition", "")
        assert "inline" in disposition, f"Expected inline disposition, got: {disposition}"
    
    def test_file_metadata_endpoint(self):
        """Test that /api/files/{id} returns file metadata"""
        response = requests.get(f"{BASE_URL}/api/files/{TEST_FILE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert "file_id" in data
        assert "filename" in data
        assert "content_type" in data
    
    def test_nonexistent_file_returns_404(self):
        """Test that nonexistent file returns 404"""
        response = requests.get(f"{BASE_URL}/api/files/nonexistent-file-id/download")
        assert response.status_code == 404


class TestMemberPhotoURL:
    """Tests for Bug Fix #1: Profile photo URL in member data"""
    
    def test_member_has_photo_url(self, auth_headers):
        """Test that member data includes foto_perfil URL"""
        response = requests.get(
            f"{BASE_URL}/api/members/{TEST_MEMBER_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "foto_perfil" in data
        assert data["foto_perfil"] is not None
        assert "/api/files/" in data["foto_perfil"]
    
    def test_member_photo_url_is_accessible(self, auth_headers):
        """Test that member's photo URL is accessible when /download is appended"""
        response = requests.get(
            f"{BASE_URL}/api/members/{TEST_MEMBER_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        photo_url = data.get("foto_perfil")
        assert photo_url is not None
        
        # Frontend appends /download to the URL
        download_url = f"{photo_url}/download" if not photo_url.endswith("/download") else photo_url
        
        photo_response = requests.get(download_url)
        assert photo_response.status_code == 200, f"Photo not accessible: {photo_response.status_code}"
    
    def test_members_list_includes_photos(self, auth_headers):
        """Test that members list includes foto_perfil for each member"""
        response = requests.get(
            f"{BASE_URL}/api/members?status=Ativo",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "members" in data
        
        # Check that at least one member has a photo
        members_with_photos = [m for m in data["members"] if m.get("foto_perfil")]
        assert len(members_with_photos) > 0, "No members with photos found"


class TestMemberAttachments:
    """Tests for Bug Fix #2: PDF/attachment links working"""
    
    def test_member_has_document_attachments(self, auth_headers):
        """Test that member data includes document attachment URLs"""
        response = requests.get(
            f"{BASE_URL}/api/members/{TEST_MEMBER_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check for various attachment fields
        attachment_fields = [
            "payroll_anexo", "niss_anexo", "utente_anexo",
            "cartao_eleitoral_anexo", "bilhete_identidade_anexo",
            "certidao_rdtl_anexo", "passaporte_anexo", "informatica_anexo"
        ]
        
        attachments_found = 0
        for field in attachment_fields:
            if data.get(field) and "/api/files/" in data.get(field, ""):
                attachments_found += 1
        
        assert attachments_found > 0, "No document attachments found"
    
    def test_attachment_urls_are_accessible(self, auth_headers):
        """Test that attachment URLs are accessible when /download is appended"""
        response = requests.get(
            f"{BASE_URL}/api/members/{TEST_MEMBER_ID}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Test payroll attachment
        payroll_url = data.get("payroll_anexo")
        if payroll_url and "/api/files/" in payroll_url:
            download_url = f"{payroll_url}/download" if not payroll_url.endswith("/download") else payroll_url
            attachment_response = requests.get(download_url)
            assert attachment_response.status_code == 200, f"Attachment not accessible: {attachment_response.status_code}"


class TestDashboardStats:
    """Tests for Bug Fix #5: Dashboard cards clickable (API support)"""
    
    def test_dashboard_stats_returns_status_counts(self, auth_headers):
        """Test that dashboard stats returns counts for all statuses"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "por_status" in data
        status_data = data["por_status"]
        
        # Verify all status types are present
        expected_statuses = ["ativos", "falecidos", "separacao", "reserva", "reforma"]
        for status in expected_statuses:
            assert status in status_data, f"Missing status: {status}"
            assert isinstance(status_data[status], int), f"Status {status} should be integer"
    
    def test_members_filter_by_status(self, auth_headers):
        """Test that members can be filtered by status (for dashboard card navigation)"""
        statuses = ["Ativo", "Falecido", "Separação do Serviço", "Reserva", "Reforma"]
        
        for status in statuses:
            response = requests.get(
                f"{BASE_URL}/api/members?status={status}",
                headers=auth_headers
            )
            assert response.status_code == 200, f"Failed to filter by status: {status}"
            data = response.json()
            assert "members" in data
            assert "total" in data


class TestConstantsAPI:
    """Tests for dropdown data (Bug Fix #4: Dropdown text visibility)"""
    
    def test_postos_returns_data(self):
        """Test that postos endpoint returns data for dropdowns"""
        response = requests.get(f"{BASE_URL}/api/constants/postos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0
    
    def test_unidades_returns_data(self):
        """Test that unidades endpoint returns data for dropdowns"""
        response = requests.get(f"{BASE_URL}/api/constants/unidades")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify "Quartel General" is in the list
        assert "Quartel General" in data
    
    def test_municipios_returns_data(self):
        """Test that municipios endpoint returns data for dropdowns"""
        response = requests.get(f"{BASE_URL}/api/constants/municipios")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_member_status_returns_data(self):
        """Test that member-status endpoint returns data for dropdowns"""
        response = requests.get(f"{BASE_URL}/api/constants/member-status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        expected_statuses = ["Ativo", "Falecido", "Separação do Serviço", "Reserva", "Reforma"]
        for status in expected_statuses:
            assert status in data


class TestPrintHeaders:
    """Tests for Bug Fix #7: Print header content"""
    
    def test_unidades_includes_quartel_general(self):
        """Test that 'Quartel General' is in unidades for print header"""
        response = requests.get(f"{BASE_URL}/api/constants/unidades")
        assert response.status_code == 200
        data = response.json()
        assert "Quartel General" in data, "Quartel General should be in unidades list"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
