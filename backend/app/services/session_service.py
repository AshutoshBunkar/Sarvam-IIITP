import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ForbiddenException, EntityNotFoundException
from app.models.message import Message
from app.models.session import Session
from app.repositories.message_repository import MessageRepository
from app.repositories.session_repository import SessionRepository
from app.schemas.session import SessionCreate, SessionListResponse, SessionResponse


class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.message_repo = MessageRepository(db)

    async def create_session(self, user_id: uuid.UUID, session_in: SessionCreate) -> Session:
        title = session_in.title or "New Doubt Session"
        return await self.session_repo.create_session(
            user_id=user_id,
            title=title,
            programming_language=session_in.programming_language,
            natural_language=session_in.natural_language,
        )

    async def get_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> Session:
        # Check if session exists at all first
        session = await self.session_repo.get_by_id(session_id, user_id=None)
        if not session:
            raise EntityNotFoundException(f"Session with id '{session_id}' not found.")

        # Check authorization
        if session.user_id != user_id:
            raise ForbiddenException("You are not authorized to access this session.")

        return session

    async def list_sessions(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[SessionListResponse]:
        sessions = await self.session_repo.list_by_user(user_id=user_id, limit=limit, offset=offset)
        result = []
        for s in sessions:
            result.append(
                SessionListResponse(
                    id=s.id,
                    title=s.title,
                    programming_language=s.programming_language,
                    natural_language=s.natural_language,
                    current_state=s.current_state,
                    is_active=s.is_active,
                    created_at=s.created_at,
                    updated_at=s.updated_at,
                    message_count=len(s.messages) if s.messages else 0,
                )
            )
        return result

    async def get_session_messages(self, session_id: uuid.UUID, user_id: uuid.UUID) -> List[Message]:
        # Verifies access
        await self.get_session(session_id, user_id)
        return await self.message_repo.list_by_session(session_id)

