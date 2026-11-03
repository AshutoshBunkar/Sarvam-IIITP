from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new student account."""
    auth_service = AuthService(db)
    user = await auth_service.register(user_in)
    return user


@router.post("/login", response_model=TokenResponse)
async def login_student(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate student and return JWT access token."""
    auth_service = AuthService(db)
    token = await auth_service.login(credentials.email, credentials.password)
    return token


@router.get("/me", response_model=UserResponse)
async def get_current_student_profile(
    current_user: User = Depends(get_current_user),
):
    """Get authenticated student's profile."""
    return current_user

