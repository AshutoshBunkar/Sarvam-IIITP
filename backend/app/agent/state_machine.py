from typing import List, Set
from app.schemas.agent import AgentState


class TutoringStateMachine:
    """Manages Socratic tutoring states and valid transitions."""

    # Valid forward/backward state transitions
    TRANSITIONS = {
        AgentState.INTAKE: {
            AgentState.ELICIT_REASONING,
            AgentState.ANALYZE_ATTEMPT,
            AgentState.WAITING_FOR_STUDENT,
        },
        AgentState.ELICIT_REASONING: {
            AgentState.WAITING_FOR_STUDENT,
            AgentState.ANALYZE_ATTEMPT,
            AgentState.GUIDED_INTERVENTION,
        },
        AgentState.WAITING_FOR_STUDENT: {
            AgentState.ANALYZE_ATTEMPT,
            AgentState.ELICIT_REASONING,
            AgentState.GUIDED_INTERVENTION,
        },
        AgentState.ANALYZE_ATTEMPT: {
            AgentState.GUIDED_INTERVENTION,
            AgentState.VALIDATE_UNDERSTANDING,
            AgentState.ELICIT_REASONING,
            AgentState.WAITING_FOR_STUDENT,
        },
        AgentState.GUIDED_INTERVENTION: {
            AgentState.WAITING_FOR_STUDENT,
            AgentState.VALIDATE_UNDERSTANDING,
            AgentState.GUIDED_INTERVENTION,
            AgentState.COMPLETED,
        },
        AgentState.VALIDATE_UNDERSTANDING: {
            AgentState.COMPLETED,
            AgentState.GUIDED_INTERVENTION,
            AgentState.WAITING_FOR_STUDENT,
        },
        AgentState.COMPLETED: {
            AgentState.INTAKE,
            AgentState.ELICIT_REASONING,
        },
    }

    @classmethod
    def can_transition(cls, current: AgentState, target: AgentState) -> bool:
        if current == target:
            return True
        allowed = cls.TRANSITIONS.get(current, set())
        return target in allowed

    @classmethod
    def validate_or_fallback(cls, current: AgentState, suggested: AgentState) -> AgentState:
        """Ensure suggested state is valid; if not, return the next logical state."""
        if cls.can_transition(current, suggested):
            return suggested

        # Default progressive state flow
        progression = [
            AgentState.INTAKE,
            AgentState.ELICIT_REASONING,
            AgentState.WAITING_FOR_STUDENT,
            AgentState.ANALYZE_ATTEMPT,
            AgentState.GUIDED_INTERVENTION,
            AgentState.VALIDATE_UNDERSTANDING,
            AgentState.COMPLETED,
        ]
        try:
            curr_idx = progression.index(current)
            if curr_idx < len(progression) - 1:
                return progression[curr_idx + 1]
        except ValueError:
            pass
        return current

