import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_and_login(async_client: AsyncClient):
    # 1. Register student
    reg_payload = {
        "email": "student1@example.com",
        "password": "securepassword123",
        "full_name": "Arjun Sharma",
        "preferred_language": "Hindi",
        "programming_language": "python",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, reg_res.text
    user_data = reg_res.json()
    assert user_data["email"] == "student1@example.com"
    assert user_data["full_name"] == "Arjun Sharma"
    assert user_data["profile"]["preferred_language"] == "Hindi"

    # 2. Duplicate registration fails
    dup_res = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 422

    # 3. Login with correct password
    login_payload = {
        "email": "student1@example.com",
        "password": "securepassword123",
    }
    login_res = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 4. Login with incorrect password
    bad_login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "student1@example.com", "password": "wrongpassword"}
    )
    assert bad_login_res.status_code == 401

    # 5. Get /me with valid token
    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "student1@example.com"

    # 6. Get /me without token fails
    unauth_res = await async_client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401

