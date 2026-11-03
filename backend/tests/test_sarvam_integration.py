import pytest
from unittest.mock import AsyncMock, patch
from app.integrations.sarvam.client import SarvamClient, SAFE_ERROR_MESSAGE
from app.integrations.sarvam.config import SarvamConfig
from app.integrations.sarvam.schemas import (
    ChatMessage,
    SarvamChatResponse,
    SarvamChoice,
)


@pytest.fixture
def test_client():
    config = SarvamConfig(
        api_key="test-api-key-12345",
        base_url="https://api.sarvam.ai/v1",
        model="sarvam-105b",
        max_tokens=1000,
        temperature=0.3,
    )
    return SarvamClient(config=config)


@pytest.mark.asyncio
async def test_normal_response_with_content(test_client):
    """Test 1: Normal response returns user-facing content as expected."""
    normal_response = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content="What does your loop condition check?",
                    reasoning_content=None,
                ),
                finish_reason="stop",
            )
        ]
    )

    with patch.object(test_client, "_post_chat_completion", new=AsyncMock(return_value=normal_response)):
        res = await test_client.generate_chat_completion(
            messages=[ChatMessage(role="user", content="Help with loop")]
        )

    assert res.has_valid_content is True
    assert res.content == "What does your loop condition check?"
    assert res.finish_reason == "stop"


@pytest.mark.asyncio
async def test_null_content_with_reasoning_content(test_client):
    """Test 2: When content is null but reasoning_content is populated,
    reasoning_content is NEVER exposed as the user-facing content.
    """
    secret_thought = "INTERNAL_TRACE: The student forgot i++ in while loop."
    schema_response = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content=None,
                    reasoning_content=secret_thought,
                ),
                finish_reason="length",
            )
        ]
    )

    # 1. Directly on the schema property:
    assert schema_response.content == ""
    assert secret_thought not in schema_response.content
    assert schema_response.reasoning_content == secret_thought
    assert schema_response.has_valid_content is False


@pytest.mark.asyncio
async def test_finish_reason_length_detection(test_client):
    """Test 3: Detects when token budget was exhausted (finish_reason='length')."""
    exhausted_response = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content="",
                    reasoning_content="Drafting explanation...",
                ),
                finish_reason="length",
            )
        ]
    )

    assert exhausted_response.finish_reason == "length"
    assert exhausted_response.has_valid_content is False
    assert exhausted_response.content == ""


@pytest.mark.asyncio
async def test_retry_success(test_client):
    """Test 4: When initial attempt exhausts tokens (finish_reason='length' with null content),
    the client retries and returns the successful recovered content.
    """
    first_attempt_exhausted = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content=None,
                    reasoning_content="Ran out of tokens thinking...",
                ),
                finish_reason="length",
            )
        ]
    )

    recovered_response = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content='{"assistant_message": "What is the terminating condition?", "agent_state": "ELICIT_REASONING"}',
                    reasoning_content=None,
                ),
                finish_reason="stop",
            )
        ]
    )

    mock_post = AsyncMock(side_effect=[first_attempt_exhausted, recovered_response])
    with patch.object(test_client, "_post_chat_completion", new=mock_post):
        res = await test_client.generate_chat_completion(
            messages=[ChatMessage(role="user", content="My code crashes")]
        )

    # Should have called initial attempt + retry
    assert mock_post.call_count >= 2
    assert res.has_valid_content is True
    assert "terminating condition" in res.content
    assert "Ran out of tokens thinking" not in res.content


@pytest.mark.asyncio
async def test_retry_failure_returns_safe_error(test_client):
    """Test 5: When all recovery retries fail to produce content,
    the client returns a safe error response without exposing reasoning traces.
    """
    exhausted_attempt = SarvamChatResponse(
        choices=[
            SarvamChoice(
                index=0,
                message=ChatMessage(
                    role="assistant",
                    content=None,
                    reasoning_content="CONFIDENTIAL_MODEL_CHAIN_OF_THOUGHT",
                ),
                finish_reason="length",
            )
        ]
    )

    # All attempts return null content
    mock_post = AsyncMock(return_value=exhausted_attempt)
    with patch.object(test_client, "_post_chat_completion", new=mock_post):
        res = await test_client.generate_chat_completion(
            messages=[ChatMessage(role="user", content="Complex doubt")]
        )

    assert res.has_valid_content is True
    assert res.content == SAFE_ERROR_MESSAGE
    assert "CONFIDENTIAL_MODEL_CHAIN_OF_THOUGHT" not in res.content

