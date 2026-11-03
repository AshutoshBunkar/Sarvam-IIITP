import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class MessageBase(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str
    code_snippet: Optional[str] = None
    agent_state: Optional[str] = None
    message_metadata: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    session_id: uuid.UUID


class MessageResponse(MessageBase):
    id: uuid.UUID
    session_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

