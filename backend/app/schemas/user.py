import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LearnerProfileBase(BaseModel):
    preferred_language: str = Field(default="English", description="English, Hindi, Marathi, or Hinglish")
    programming_language: str = Field(default="python", description="python or cpp")
    experience_level: str = Field(default="beginner", description="beginner, intermediate, advanced")


class LearnerProfileCreate(LearnerProfileBase):
    pass


class LearnerProfileResponse(LearnerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")
    full_name: str = Field(..., min_length=2, max_length=255)
    preferred_language: Optional[str] = "English"
    programming_language: Optional[str] = "python"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
    profile: Optional[LearnerProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)

