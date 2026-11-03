import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from app.integrations.sarvam.schemas import ChatMessage, SarvamChatResponse, SarvamChoice


@pytest.mark.asyncio
async def test_session_lifecycle_and_authorization(async_client: AsyncClient):
    # Register Student A
    reg_a = await async_client.post("/api/v1/auth/register", json={
        "email": "studentA@example.com",
        "password": "passwordA123",
        "full_name": "Student A",
    })
    assert reg_a.status_code == 201
    login_a = await async_client.post("/api/v1/auth/login", json={
        "email": "studentA@example.com",
        "password": "passwordA123",
    })
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Student B
    reg_b = await async_client.post("/api/v1/auth/register", json={
        "email": "studentB@example.com",
        "password": "passwordB123",
        "full_name": "Student B",
    })
    assert reg_b.status_code == 201
    login_b = await async_client.post("/api/v1/auth/login", json={
        "email": "studentB@example.com",
        "password": "passwordB123",
    })
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Student A creates a session
    sess_res = await async_client.post(
        "/api/v1/sessions",
        headers=headers_a,
        json={
            "title": "Recursion Doubt",
            "programming_language": "python",
            "natural_language": "English",
        },
    )
    assert sess_res.status_code == 201
    session_data = sess_res.json()
    session_id = session_data["id"]
    assert session_data["current_state"] == "INTAKE"

    # 2. Student A lists sessions
    list_res = await async_client.get("/api/v1/sessions", headers=headers_a)
    assert list_res.status_code == 200
    sessions_list = list_res.json()
    assert len(sessions_list) == 1
    assert sessions_list[0]["id"] == session_id

    # 3. Student A sends a doubt turn (mocking Sarvam response)
    mock_llm_json = """{
        "assistant_message": "Let's examine your approach. What do you think happens when factorial(0) is executed?",
        "agent_state": "ELICIT_REASONING",
        "awaiting_student": true,
        "language": "English",
        "code_blocks": [],
        "session_completed": false
    }"""
    mock_sarvam_res = SarvamChatResponse(
        choices=[SarvamChoice(index=0, message=ChatMessage(role="assistant", content=mock_llm_json))]
    )

    with patch(
        "app.integrations.sarvam.client.SarvamClient.generate_chat_completion",
        new=AsyncMock(return_value=mock_sarvam_res)
    ):
        turn_res = await async_client.post(
            f"/api/v1/sessions/{session_id}/turns",
            headers=headers_a,
            json={
                "user_message": "Why does my recursive factorial function give a recursion error?",
                "code_snippet": "def fact(n):\n    return n * fact(n - 1)",
            },
        )
        assert turn_res.status_code == 200, turn_res.text
        turn_data = turn_res.json()
        assert turn_data["agent_state"] == "ELICIT_REASONING"
        assert "factorial(0)" in turn_data["assistant_message"]

    # 4. Verify message persistence
    msg_res = await async_client.get(
        f"/api/v1/sessions/{session_id}/messages",
        headers=headers_a
    )
    assert msg_res.status_code == 200
    messages = msg_res.json()
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert "fact(n - 1)" in messages[0]["code_snippet"]
    assert messages[1]["role"] == "assistant"
    assert messages[1]["agent_state"] == "ELICIT_REASONING"

    # 5. Authorization: Student B cannot view Student A's session or messages
    b_view_res = await async_client.get(
        f"/api/v1/sessions/{session_id}",
        headers=headers_b
    )
    assert b_view_res.status_code == 403

    b_msg_res = await async_client.get(
        f"/api/v1/sessions/{session_id}/messages",
        headers=headers_b
    )
    assert b_msg_res.status_code == 403

    # Student B cannot submit turns to Student A's session
    b_turn_res = await async_client.post(
        f"/api/v1/sessions/{session_id}/turns",
        headers=headers_b,
        json={"user_message": "Sneaking into session"}
    )
    assert b_turn_res.status_code == 403

