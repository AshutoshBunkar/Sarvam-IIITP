import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.learner_profile import LearnerProfile
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.profile))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = (
            select(User)
            .where(User.email == email.lower().strip())
            .options(selectinload(User.profile))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        hashed_password: str,
        full_name: str,
        preferred_language: str = "English",
        programming_language: str = "python",
    ) -> User:
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            full_name=full_name.strip(),
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()

        profile = LearnerProfile(
            user_id=user.id,
            preferred_language=preferred_language,
            programming_language=programming_language,
            experience_level="beginner",
        )
        self.db.add(profile)
        await self.db.flush()
        await self.db.refresh(user, attribute_names=["profile"])
        return user

