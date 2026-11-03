import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.agent import TurnRequest, TurnResponse
from app.schemas.message import MessageResponse
from app.schemas.session import SessionCreate, SessionListResponse, SessionResponse
from app.services.session_service import SessionService
from app.services.tutor_service import TutorService

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_in: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tutoring session."""
    service = SessionService(db)
    session = await service.create_session(user_id=current_user.id, session_in=session_in)
    return session


@router.get("", response_model=List[SessionListResponse])
async def list_sessions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List sessions belonging to the authenticated student."""
    service = SessionService(db)
    sessions = await service.list_sessions(user_id=current_user.id, limit=limit, offset=offset)
    return sessions


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session_details(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific session."""
    service = SessionService(db)
    session = await service.get_session(session_id=session_id, user_id=current_user.id)
    return session


@router.get("/{session_id}/messages", response_model=List[MessageResponse])
async def get_session_messages(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve message history for a specific session."""
    service = SessionService(db)
    messages = await service.get_session_messages(session_id=session_id, user_id=current_user.id)
    return messages


@router.post("/{session_id}/turns", response_model=TurnResponse)
async def submit_turn(
    session_id: uuid.UUID,
    turn_in: TurnRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a student doubt or response turn to the Socratic agent."""
    tutor_service = TutorService(db)
    response = await tutor_service.process_turn(
        session_id=session_id,
        user_id=current_user.id,
        turn_in=turn_in,
    )
    return response

