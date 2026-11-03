import json
import logging
import re
from typing import List, Optional
from app.agent.prompts import build_system_prompt, format_user_turn
from app.agent.state_machine import TutoringStateMachine
from app.integrations.sarvam.client import SarvamClient, get_sarvam_client
from app.integrations.sarvam.schemas import ChatMessage
from app.models.message import Message
from app.schemas.agent import AgentOutputSchema, AgentState

logger = logging.getLogger(__name__)


class SocraticOrchestrator:
    """Orchestrates multi-turn Socratic tutoring conversations with Sarvam AI."""

    def __init__(self, sarvam_client: Optional[SarvamClient] = None):
        self.client = sarvam_client or get_sarvam_client()

    def _parse_llm_json(self, raw_text: str, default_state: AgentState, language: str) -> AgentOutputSchema:
        """Robustly extracts and validates JSON from model output."""
        cleaned = raw_text.strip()
        # Remove markdown code block fences if present
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(1).strip()
        elif cleaned.startswith("{") and cleaned.endswith("}"):
            cleaned = cleaned
        else:
            # Search for first '{' and last '}'
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                cleaned = cleaned[start:end+1]

        try:
            data = json.loads(cleaned)
            # Ensure valid state
            suggested_state_str = data.get("agent_state", default_state.value)
            try:
                suggested_state = AgentState(suggested_state_str)
            except ValueError:
                suggested_state = default_state

            valid_state = TutoringStateMachine.validate_or_fallback(default_state, suggested_state)

            return AgentOutputSchema(
                assistant_message=data.get("assistant_message", raw_text),
                agent_state=valid_state,
                awaiting_student=data.get("awaiting_student", True),
                language=data.get("language", language),
                code_blocks=data.get("code_blocks", []),
                session_completed=data.get("session_completed", False),
                diagnoses=data.get("diagnoses", {}),
            )
        except Exception as exc:
            logger.warning("Failed to parse JSON from Sarvam response: %s. Using raw text fallback.", exc)
            # Fallback to wrapping the raw text into our schema
            next_state = TutoringStateMachine.validate_or_fallback(
                default_state, AgentState.WAITING_FOR_STUDENT
            )
            return AgentOutputSchema(
                assistant_message=raw_text,
                agent_state=next_state,
                awaiting_student=True,
                language=language,
                code_blocks=[],
                session_completed=False,
            )

    async def execute_turn(
        self,
        history: List[Message],
        current_state: AgentState,
        user_message: str,
        code_snippet: Optional[str] = None,
        programming_language: str = "python",
        natural_language: str = "English",
    ) -> AgentOutputSchema:
        """Executes a single Socratic dialogue turn with Sarvam AI."""
        # Build system message
        sys_prompt = build_system_prompt(
            natural_language=natural_language,
            programming_language=programming_language,
            current_state=current_state,
        )

        chat_messages: List[ChatMessage] = [
            ChatMessage(role="system", content=sys_prompt)
        ]

        # Append last 10 turns of history for context
        relevant_history = history[-10:] if len(history) > 10 else history
        for msg in relevant_history:
            content = msg.content
            if msg.code_snippet and msg.code_snippet.strip():
                content = f"```\n{msg.code_snippet}\n```\n{content}"
            chat_messages.append(ChatMessage(role=msg.role, content=content))

        # Format current user turn
        current_turn_content = format_user_turn(
            message=user_message,
            code_snippet=code_snippet,
            current_state=current_state,
        )
        chat_messages.append(ChatMessage(role="user", content=current_turn_content))

        # Call Sarvam AI
        response = await self.client.generate_chat_completion(messages=chat_messages)
        raw_content = response.content

        # Parse & validate structured output
        agent_output = self._parse_llm_json(
            raw_text=raw_content,
            default_state=current_state,
            language=natural_language,
        )

        return agent_output

