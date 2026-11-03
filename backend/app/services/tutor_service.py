import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.agent.orchestrator import SocraticOrchestrator
from app.core.exceptions import ForbiddenException, EntityNotFoundException
from app.models.message import Message
from app.models.session import Session
from app.repositories.message_repository import MessageRepository
from app.repositories.session_repository import SessionRepository
from app.schemas.agent import AgentState, TurnRequest, TurnResponse


class TutorService:
    def __init__(self, db: AsyncSession, orchestrator: Optional[SocraticOrchestrator] = None):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.message_repo = MessageRepository(db)
        self.orchestrator = orchestrator or SocraticOrchestrator()

    async def process_turn(
        self,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        turn_in: TurnRequest,
    ) -> TurnResponse:
        # Verify session ownership
        session = await self.session_repo.get_by_id(session_id, user_id=None, load_messages=True)
        if not session:
            raise EntityNotFoundException(f"Session '{session_id}' not found.")
        if session.user_id != user_id:
            raise ForbiddenException("You cannot interact with another student's session.")

        # Update language/prog_lang preferences if specified in turn
        if turn_in.programming_language:
            session.programming_language = turn_in.programming_language
        if turn_in.natural_language:
            session.natural_language = turn_in.natural_language

        # Auto-generate meaningful session title from first question if default
        if session.title in ("New Doubt Session", "Untitled Session"):
            clean_text = turn_in.user_message.strip()
            summary = clean_text[:45] + ("..." if len(clean_text) > 45 else "")
            await self.session_repo.update_title(session, summary)

        # 1. Persist student's message
        user_msg = await self.message_repo.create_message(
            session_id=session.id,
            role="user",
            content=turn_in.user_message,
            code_snippet=turn_in.code_snippet,
            agent_state=session.current_state,
        )

        # 2. Parse current state enum
        try:
            current_state = AgentState(session.current_state)
        except ValueError:
            current_state = AgentState.INTAKE

        # 3. Retrieve prior messages (excluding the one just inserted if desired, or all)
        history = list(session.messages)

        # 4. Execute Socratic orchestration with Sarvam
        agent_output = await self.orchestrator.execute_turn(
            history=history,
            current_state=current_state,
            user_message=turn_in.user_message,
            code_snippet=turn_in.code_snippet,
            programming_language=session.programming_language,
            natural_language=session.natural_language,
        )

        # 5. Persist updated session state
        await self.session_repo.update_state(session, agent_output.agent_state.value)

        # 6. Persist assistant's response
        assistant_msg = await self.message_repo.create_message(
            session_id=session.id,
            role="assistant",
            content=agent_output.assistant_message,
            code_snippet="\n\n".join(agent_output.code_blocks) if agent_output.code_blocks else None,
            agent_state=agent_output.agent_state.value,
            metadata={
                "code_blocks": agent_output.code_blocks,
                "awaiting_student": agent_output.awaiting_student,
                "session_completed": agent_output.session_completed,
                "diagnoses": agent_output.diagnoses,
            },
        )

        return TurnResponse(
            session_id=session.id,
            assistant_message=agent_output.assistant_message,
            agent_state=agent_output.agent_state,
            awaiting_student=agent_output.awaiting_student,
            language=agent_output.language,
            code_blocks=agent_output.code_blocks,
            session_completed=agent_output.session_completed,
            user_message_id=user_msg.id,
            assistant_message_id=assistant_msg.id,
        )

