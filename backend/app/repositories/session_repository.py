import uuid
from typing import List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.message import Message
from app.models.session import Session


class SessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(
        self,
        session_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
        load_messages: bool = True,
    ) -> Optional[Session]:
        stmt = select(Session).where(Session.id == session_id)
        if user_id is not None:
            stmt = stmt.where(Session.user_id == user_id)

        if load_messages:
            stmt = stmt.options(selectinload(Session.messages))

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Session]:
        stmt = (
            select(Session)
            .where(Session.user_id == user_id)
            .order_by(desc(Session.updated_at))
            .limit(limit)
            .offset(offset)
            .options(selectinload(Session.messages))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_session(
        self,
        user_id: uuid.UUID,
        title: str = "New Doubt Session",
        programming_language: str = "python",
        natural_language: str = "English",
    ) -> Session:
        session = Session(
            user_id=user_id,
            title=title,
            programming_language=programming_language,
            natural_language=natural_language,
            current_state="INTAKE",
            is_active=True,
        )
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session, attribute_names=["messages"])
        return session

    async def update_state(self, session: Session, new_state: str) -> Session:
        session.current_state = new_state
        self.db.add(session)
        await self.db.flush()
        return session

    async def update_title(self, session: Session, new_title: str) -> Session:
        session.title = new_title
        self.db.add(session)
        await self.db.flush()
        return session

