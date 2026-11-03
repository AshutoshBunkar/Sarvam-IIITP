from dataclasses import dataclass
from app.core.config import get_settings


@dataclass
class SarvamConfig:
    api_key: str
    model: str
    max_tokens: int
    temperature: float
    base_url: str

    @classmethod
    def from_settings(cls) -> "SarvamConfig":
        settings = get_settings()
        return cls(
            api_key=settings.SARVAM_API_KEY,
            model=settings.SARVAM_CHAT_MODEL,
            max_tokens=settings.SARVAM_MAX_TOKENS,
            temperature=settings.SARVAM_TEMPERATURE,
            base_url=settings.SARVAM_API_BASE_URL,
        )

