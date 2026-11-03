from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'system', 'user', or 'assistant'")
    content: Optional[str] = Field(default="", description="The message content")
    reasoning_content: Optional[str] = Field(default=None, description="Optional reasoning content")


class SarvamChatRequest(BaseModel):
    model: str
    messages: List[ChatMessage]
    max_tokens: int = 2000
    temperature: float = 0.3


class SarvamChoice(BaseModel):
    index: int = 0
    message: ChatMessage
    finish_reason: Optional[str] = None


class SarvamUsage(BaseModel):
    prompt_tokens: Optional[int] = 0
    completion_tokens: Optional[int] = 0
    total_tokens: Optional[int] = 0


class SarvamChatResponse(BaseModel):
    id: Optional[str] = None
    model: Optional[str] = None
    choices: List[SarvamChoice] = []
    usage: Optional[SarvamUsage] = None

    @property
    def content(self) -> str:
        """User-facing generated response.
        NEVER returns reasoning_content (internal reasoning trace).
        """
        if self.choices and len(self.choices) > 0:
            msg = self.choices[0].message
            if msg.content:
                return msg.content
        return ""

    @property
    def reasoning_content(self) -> Optional[str]:
        """Internal reasoning trace for diagnostic/debugging purposes only."""
        if self.choices and len(self.choices) > 0:
            return self.choices[0].message.reasoning_content
        return None

    @property
    def finish_reason(self) -> Optional[str]:
        """Finish reason reported by the model ('stop', 'length', etc.)."""
        if self.choices and len(self.choices) > 0:
            return self.choices[0].finish_reason
        return None

    @property
    def has_valid_content(self) -> bool:
        """Indicates whether a non-empty user-facing response is available."""
        return bool(self.content and self.content.strip())

