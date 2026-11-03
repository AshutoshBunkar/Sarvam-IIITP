import uuid
from typing import TYPE_CHECKING, List
from sqlalchemy import Boolean, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.message import Message
    from app.models.user import User


class Session(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), default="New Doubt Session", nullable=False)
    programming_language: Mapped[str] = mapped_column(String(50), default="python", nullable=False)
    natural_language: Mapped[str] = mapped_column(String(50), default="English", nullable=False)
    current_state: Mapped[str] = mapped_column(String(50), default="INTAKE", index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_sessions_user_created", "user_id", "created_at"),
    )

