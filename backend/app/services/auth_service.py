from datetime import timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException, ValidationException
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate

settings = get_settings()


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, user_in: UserCreate) -> User:
        existing = await self.user_repo.get_by_email(user_in.email)
        if existing:
            raise ValidationException(f"User with email '{user_in.email}' already exists.")

        hashed = hash_password(user_in.password)
        user = await self.user_repo.create_user(
            email=user_in.email,
            hashed_password=hashed,
            full_name=user_in.full_name,
            preferred_language=user_in.preferred_language or "English",
            programming_language=user_in.programming_language or "python",
        )
        return user

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("User account is deactivated.")

        access_token = create_access_token(
            subject=str(user.id),
            claims={"email": user.email, "name": user.full_name},
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

