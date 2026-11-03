import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class LearnerProfile(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "learner_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    preferred_language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    programming_language: Mapped[str] = mapped_column(String(50), default="python", nullable=False)
    experience_level: Mapped[str] = mapped_column(String(50), default="beginner", nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")

