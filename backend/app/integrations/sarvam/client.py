import asyncio
import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.exceptions import ExternalServiceException
from app.integrations.sarvam.config import SarvamConfig
from app.integrations.sarvam.schemas import (
    ChatMessage,
    SarvamChatRequest,
    SarvamChatResponse,
    SarvamChoice,
)

logger = logging.getLogger(__name__)

SAFE_ERROR_MESSAGE = (
    "I apologize, but I could not formulate a response within the available token budget. "
    "Please rephrase your question or try sharing a smaller code snippet."
)


class SarvamClient:
    """Reusable asynchronous client for Sarvam AI Chat Completions with resilient token budget recovery."""

    def __init__(self, config: Optional[SarvamConfig] = None):
        self.config = config or SarvamConfig.from_settings()
        self._http_client: Optional[httpx.AsyncClient] = None

    async def get_http_client(self) -> httpx.AsyncClient:
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(60.0, connect=10.0),
                headers={
                    "Content-Type": "application/json",
                    "api-subscription-key": self.config.api_key,
                    "Authorization": f"Bearer {self.config.api_key}",
                },
            )
        return self._http_client

    async def close(self):
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
            self._http_client = None

    async def _post_chat_completion(
        self,
        messages: List[ChatMessage],
        model: str,
        max_tokens: int,
        temperature: float,
    ) -> SarvamChatResponse:
        """Low-level POST to Sarvam Chat endpoint."""
        base = self.config.base_url.rstrip("/")
        endpoint = f"{base}/chat/completions"

        payload = {
            "model": model,
            "messages": [
                msg.model_dump(exclude_none=True, exclude={"reasoning_content"})
                for msg in messages
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        client = await self.get_http_client()
        response = await client.post(endpoint, json=payload)

        if response.status_code == 200:
            return SarvamChatResponse.model_validate(response.json())

        if response.status_code in (401, 403):
            raise ExternalServiceException(
                f"Sarvam AI Authentication failed ({response.status_code}): {response.text}"
            )

        raise ExternalServiceException(
            f"Sarvam API returned HTTP {response.status_code}: {response.text}"
        )

    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        retries: int = 2,
    ) -> SarvamChatResponse:
        """Call Sarvam Chat Completions endpoint with retries, length exhaustion detection,
        and safe error recovery (never exposing reasoning traces).
        """
        if not self.config.api_key:
            raise ExternalServiceException(
                "SARVAM_API_KEY is not configured in backend environment."
            )

        target_model = model or self.config.model
        tokens = max_tokens if max_tokens is not None else self.config.max_tokens
        temp = temperature if temperature is not None else self.config.temperature

        # 1. Primary call with network-level retries
        parsed: Optional[SarvamChatResponse] = None
        last_error: Optional[Exception] = None

        for attempt in range(retries + 1):
            try:
                parsed = await self._post_chat_completion(
                    messages=messages,
                    model=target_model,
                    max_tokens=tokens,
                    temperature=temp,
                )
                break
            except ExternalServiceException as exc:
                if "Authentication failed" in str(exc):
                    raise
                last_error = exc
            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                last_error = ExternalServiceException(f"Sarvam AI network error: {str(exc)}")
            except Exception as exc:
                last_error = ExternalServiceException(f"Sarvam AI unexpected failure: {str(exc)}")

            if attempt < retries:
                await asyncio.sleep(1.0 * (attempt + 1))

        if parsed is None:
            if last_error:
                raise last_error
            raise ExternalServiceException("Failed to obtain response from Sarvam AI.")

        # 2. If valid user-facing content is present, return immediately
        if parsed.has_valid_content:
            return parsed

        # 3. Content is empty or null: inspect finish reason & token budget
        finish_reason = parsed.finish_reason
        is_length_exhausted = (finish_reason == "length")

        if is_length_exhausted:
            logger.warning(
                "Sarvam response exhausted token budget (finish_reason='length') with null/empty content "
                "for model '%s' (tokens=%s).",
                target_model,
                tokens,
            )

        # 4. Attempt recovery:
        # A. Retry with increased token budget if length exhausted
        # B. Retry with reasoning disabled (using conversational model)
        recovery_strategies = []
        if is_length_exhausted and tokens < 4000:
            increased_tokens = min(max(tokens * 2, 3500), 4096)
            recovery_strategies.append(
                ("increased_tokens", target_model, increased_tokens)
            )

        conversational_model = "sarvam-105b-conversations"
        if target_model != conversational_model:
            recovery_strategies.append(
                ("disable_reasoning", conversational_model, max(tokens, 2000))
            )

        for strategy_name, retry_model, retry_tokens in recovery_strategies:
            logger.info(
                "Attempting recovery strategy '%s': model='%s', max_tokens=%s",
                strategy_name,
                retry_model,
                retry_tokens,
            )
            try:
                retry_parsed = await self._post_chat_completion(
                    messages=messages,
                    model=retry_model,
                    max_tokens=retry_tokens,
                    temperature=temp,
                )
                if retry_parsed.has_valid_content:
                    logger.info("Recovery strategy '%s' succeeded.", strategy_name)
                    return retry_parsed
                logger.warning(
                    "Recovery strategy '%s' returned response without user-facing content (finish_reason='%s').",
                    strategy_name,
                    retry_parsed.finish_reason,
                )
            except Exception as exc:
                logger.warning("Recovery strategy '%s' failed: %s", strategy_name, exc)

        # 5. If no valid answer is available, return safe error response
        # NEVER expose internal reasoning traces
        logger.error(
            "All Sarvam recovery attempts failed to produce valid user-facing content. Returning safe fallback."
        )
        return SarvamChatResponse(
            id="safe-error-fallback",
            model=target_model,
            choices=[
                SarvamChoice(
                    index=0,
                    message=ChatMessage(
                        role="assistant",
                        content=SAFE_ERROR_MESSAGE,
                    ),
                    finish_reason="safe_error_fallback",
                )
            ],
        )


# Cached singleton client instance
_client_instance: Optional[SarvamClient] = None


def get_sarvam_client() -> SarvamClient:
    global _client_instance
    if _client_instance is None:
        _client_instance = SarvamClient()
    return _client_instance
