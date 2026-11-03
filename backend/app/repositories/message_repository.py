import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.message import Message


class MessageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_message(
        self,
        session_id: uuid.UUID,
        role: str,
        content: str,
        code_snippet: Optional[str] = None,
        agent_state: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Message:
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            code_snippet=code_snippet,
            agent_state=agent_state,
            message_metadata=metadata or {},
        )
        self.db.add(message)
        await self.db.flush()
        return message

    async def list_by_session(
        self,
        session_id: uuid.UUID,
        limit: int = 100,
    ) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

