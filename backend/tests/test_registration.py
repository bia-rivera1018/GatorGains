from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_registration_validation_accepts_basic_college_email():
    response = client.post(
        "/api/registration/validate",
        json={"email": "student@ufl.edu", "password": "example-password"},
    )
    assert response.status_code == 200
    assert response.json() == {"valid": True, "errors": {}}


def test_registration_validation_rejects_non_college_email():
    response = client.post(
        "/api/registration/validate",
        json={"email": "student@gmail.com", "password": "example-password"},
    )
    assert response.status_code == 200
    assert response.json()["errors"]["email"]


def test_registration_validation_rejects_short_password():
    response = client.post(
        "/api/registration/validate",
        json={"email": "student@ufl.edu", "password": "abc"},
    )
    assert response.status_code == 200
    assert response.json()["errors"]["password"]


def test_registration_validation_reports_required_fields():
    response = client.post("/api/registration/validate", json={})
    assert response.status_code == 200
    assert set(response.json()["errors"]) == {"email", "password"}
