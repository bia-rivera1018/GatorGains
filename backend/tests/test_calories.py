from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_empty_day():
    response = client.post("/api/calories/summary", json={"meals": [], "daily_target": 2000})
    assert response.status_code == 200
    assert response.json() == {
        "total_calories": 0,
        "daily_target": 2000,
        "remaining_calories": 2000,
    }


def test_meals_are_added_up():
    response = client.post(
        "/api/calories/summary",
        json={
            "meals": [{"name": "Breakfast", "calories": 350}, {"name": "Lunch", "calories": 600}],
            "daily_target": 2000,
        },
    )
    assert response.status_code == 200
    assert response.json()["total_calories"] == 950
    assert response.json()["remaining_calories"] == 1050


def test_over_target_is_negative_remaining():
    response = client.post(
        "/api/calories/summary",
        json={"meals": [{"name": "Dinner", "calories": 2200}], "daily_target": 2000},
    )
    assert response.status_code == 200
    assert response.json()["remaining_calories"] == -200


def test_rejects_negative_calories():
    response = client.post(
        "/api/calories/summary",
        json={"meals": [{"name": "Dinner", "calories": -5}], "daily_target": 2000},
    )
    assert response.status_code == 422


def test_rejects_invalid_target():
    response = client.post("/api/calories/summary", json={"meals": [], "daily_target": 0})
    assert response.status_code == 422
