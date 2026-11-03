import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.message import MessageResponse


# Accepted language identifiers (human-readable labels + BCP-47 locale codes)
VALID_LANGUAGES = {"English", "en-IN", "Hindi", "hi-IN", "Marathi", "mr-IN", "Hinglish", "hinglish"}


class SessionBase(BaseModel):
    title: Optional[str] = "New Doubt Session"
    programming_language: str = Field(default="python", description="python or cpp")
    natural_language: str = Field(default="English", description="English, Hindi, Marathi, or Hinglish (also accepts en-IN, hi-IN, mr-IN, hinglish)")

    @field_validator("natural_language")
    @classmethod
    def validate_natural_language(cls, v: str) -> str:
        if v not in VALID_LANGUAGES:
            raise ValueError(
                f"Invalid natural_language '{v}'. Must be one of: {sorted(VALID_LANGUAGES)}"
            )
        return v

    @field_validator("programming_language")
    @classmethod
    def validate_programming_language(cls, v: str) -> str:
        if v not in {"python", "cpp"}:
            raise ValueError(f"Invalid programming_language '{v}'. Must be 'python' or 'cpp'.")
        return v


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    programming_language: Optional[str] = None
    natural_language: Optional[str] = None
    current_state: Optional[str] = None
    is_active: Optional[bool] = None


class SessionResponse(SessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    current_state: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageResponse]] = None

    model_config = ConfigDict(from_attributes=True)


class SessionListResponse(BaseModel):
    id: uuid.UUID
    title: str
    programming_language: str
    natural_language: str
    current_state: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)

