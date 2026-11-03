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
        if self.choices and len(self.choices) > 0:
            # Sarvam may return content=None when finish_reason is "length"
            # Fall back to reasoning_content if content is None/empty
            msg = self.choices[0].message
            if msg.content:
                return msg.content
            if msg.reasoning_content:
                return msg.reasoning_content
        return ""

