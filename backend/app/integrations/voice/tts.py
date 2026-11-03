from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel


class SynthesisResult(BaseModel):
    audio_bytes: bytes
    mime_type: str = "audio/wav"
    sampling_rate: int = 22050


class BaseTextToSpeech(ABC):
    """Abstract interface for Text-to-Speech providers (e.g. Sarvam Bulbul)."""

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        target_language_code: str = "en-IN",
        speaker: Optional[str] = None,
    ) -> SynthesisResult:
        """Synthesize text into speech audio bytes."""
        pass


class BulbulTTSStub(BaseTextToSpeech):
    """Stub implementation ready for future Bulbul TTS integration."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key

    async def synthesize(
        self,
        text: str,
        target_language_code: str = "en-IN",
        speaker: Optional[str] = None,
    ) -> SynthesisResult:
        raise NotImplementedError(
            "Bulbul TTS audio pipeline is scheduled for Phase 2. Audio playback is disabled in Phase 1."
        )

