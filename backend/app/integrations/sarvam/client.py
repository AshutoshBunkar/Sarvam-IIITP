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


class SarvamClient:
    """Reusable asynchronous client for Sarvam AI Chat Completions."""

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

    async def generate_chat_completion(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        retries: int = 2,
    ) -> SarvamChatResponse:
        """Call Sarvam Chat Completions endpoint with retries and structured validation."""
        if not self.config.api_key:
            raise ExternalServiceException(
                "SARVAM_API_KEY is not configured in backend environment."
            )

        target_model = model or self.config.model
        tokens = max_tokens if max_tokens is not None else self.config.max_tokens
        temp = temperature if temperature is not None else self.config.temperature

        # Support both standard endpoint and fallback URL
        base = self.config.base_url.rstrip("/")
        endpoint = f"{base}/chat/completions"

        payload = {
            "model": target_model,
            "messages": [msg.model_dump(exclude_none=True, exclude={"reasoning_content"}) for msg in messages],
            "max_tokens": tokens,
            "temperature": temp,
        }

        last_error = None
        for attempt in range(retries + 1):
            try:
                client = await self.get_http_client()
                response = await client.post(endpoint, json=payload)

                if response.status_code == 200:
                    data = response.json()
                    parsed = SarvamChatResponse.model_validate(data)
                    # Detect truncated response (finish_reason=length with null content)
                    if parsed.choices and parsed.choices[0].finish_reason == "length" and not parsed.content:
                        logger.warning(
                            "Sarvam returned finish_reason='length' with null content — "
                            "max_tokens (%s) may be insufficient for the reasoning model.",
                            tokens,
                        )
                    return parsed

                # If 401 or 403, do not retry
                if response.status_code in (401, 403):
                    raise ExternalServiceException(
                        f"Sarvam AI Authentication failed ({response.status_code}): {response.text}"
                    )

                logger.warning(
                    "Sarvam API call failed with status %s: %s (attempt %s/%s)",
                    response.status_code,
                    response.text,
                    attempt + 1,
                    retries + 1,
                )
                last_error = ExternalServiceException(
                    f"Sarvam API returned HTTP {response.status_code}: {response.text}"
                )

            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                logger.warning(
                    "Sarvam API network/timeout error (attempt %s/%s): %s",
                    attempt + 1,
                    retries + 1,
                    exc,
                )
                last_error = ExternalServiceException(f"Sarvam AI service timeout or network error: {str(exc)}")

            except ExternalServiceException:
                raise

            except Exception as exc:
                logger.error("Unexpected error contacting Sarvam AI: %s", exc, exc_info=True)
                last_error = ExternalServiceException(f"Sarvam AI unexpected failure: {str(exc)}")

            if attempt < retries:
                await asyncio.sleep(1.0 * (attempt + 1))

        if last_error:
            raise last_error
        raise ExternalServiceException("Failed to obtain response from Sarvam AI.")


# Cached singleton client instance
_client_instance: Optional[SarvamClient] = None


def get_sarvam_client() -> SarvamClient:
    global _client_instance
    if _client_instance is None:
        _client_instance = SarvamClient()
    return _client_instance

