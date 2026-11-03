from abc import ABC, abstractmethod
from typing import BinaryIO, Optional
from pydantic import BaseModel


class TranscriptionResult(BaseModel):
    transcript: str
    language_code: Optional[str] = None
    confidence: Optional[float] = None


class BaseSpeechToText(ABC):
    """Abstract interface for Speech-to-Text providers (e.g. Sarvam Saaras)."""

    @abstractmethod
    async def transcribe(
        self,
        audio_data: bytes,
        language_code: Optional[str] = "en-IN",
    ) -> TranscriptionResult:
        """Transcribe raw audio bytes into text."""
        pass


class SaarasSTTStub(BaseSpeechToText):
    """Stub implementation ready for future Saaras STT integration."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    async def transcribe(
        self,
        audio_data: bytes,
        language_code: Optional[str] = "en-IN",
    ) -> TranscriptionResult:
        raise NotImplementedError(
            "Saaras STT audio pipeline is scheduled for Phase 2. Use text input for Phase 1."
        )

