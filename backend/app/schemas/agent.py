import uuid
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator

VALID_LANGUAGES = {"English", "en-IN", "Hindi", "hi-IN", "Marathi", "mr-IN", "Hinglish", "hinglish"}


class AgentState(str, Enum):
    INTAKE = "INTAKE"
    ELICIT_REASONING = "ELICIT_REASONING"
    WAITING_FOR_STUDENT = "WAITING_FOR_STUDENT"
    ANALYZE_ATTEMPT = "ANALYZE_ATTEMPT"
    GUIDED_INTERVENTION = "GUIDED_INTERVENTION"
    VALIDATE_UNDERSTANDING = "VALIDATE_UNDERSTANDING"
    COMPLETED = "COMPLETED"


class TurnRequest(BaseModel):
    user_message: str = Field(..., min_length=1, description="Student's message or explanation")
    code_snippet: Optional[str] = Field(None, description="Optional programming code pasted by student")
    programming_language: Optional[str] = Field(None, description="python or cpp")
    natural_language: Optional[str] = Field(None, description="English, Hindi, Marathi, Hinglish (also en-IN, hi-IN, mr-IN, hinglish)")

    @field_validator("natural_language")
    @classmethod
    def validate_natural_language(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_LANGUAGES:
            raise ValueError(
                f"Invalid natural_language '{v}'. Must be one of: {sorted(VALID_LANGUAGES)}"
            )
        return v

    @field_validator("programming_language")
    @classmethod
    def validate_programming_language(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in {"python", "cpp"}:
            raise ValueError(f"Invalid programming_language '{v}'. Must be 'python' or 'cpp'.")
        return v


class AgentOutputSchema(BaseModel):
    """Structured response validated from Sarvam AI."""
    assistant_message: str = Field(..., description="Socratic response or guiding question")
    agent_state: AgentState = Field(default=AgentState.ELICIT_REASONING, description="Target agent state")
    awaiting_student: bool = Field(default=True, description="Whether tutor expects student to respond")
    language: str = Field(default="English", description="Response language")
    code_blocks: List[str] = Field(default_factory=list, description="Extracted or referenced code snippets")
    session_completed: bool = Field(default=False, description="True if learning objective reached")
    diagnoses: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Extensible diagnosis fields")


class TurnResponse(BaseModel):
    session_id: uuid.UUID
    assistant_message: str
    agent_state: AgentState
    awaiting_student: bool
    language: str
    code_blocks: List[str] = []
    session_completed: bool
    user_message_id: uuid.UUID
    assistant_message_id: uuid.UUID

