import pytest
from app.agent.orchestrator import SocraticOrchestrator
from app.agent.state_machine import TutoringStateMachine
from app.schemas.agent import AgentState


def test_valid_state_transitions():
    assert TutoringStateMachine.can_transition(AgentState.INTAKE, AgentState.ELICIT_REASONING)
    assert TutoringStateMachine.can_transition(AgentState.ELICIT_REASONING, AgentState.WAITING_FOR_STUDENT)
    assert TutoringStateMachine.can_transition(AgentState.ANALYZE_ATTEMPT, AgentState.GUIDED_INTERVENTION)
    assert TutoringStateMachine.can_transition(AgentState.GUIDED_INTERVENTION, AgentState.VALIDATE_UNDERSTANDING)
    assert TutoringStateMachine.can_transition(AgentState.VALIDATE_UNDERSTANDING, AgentState.COMPLETED)


def test_invalid_transition_fallback():
    # INTAKE directly to COMPLETED is not a direct valid transition
    assert not TutoringStateMachine.can_transition(AgentState.INTAKE, AgentState.COMPLETED)
    fallback = TutoringStateMachine.validate_or_fallback(AgentState.INTAKE, AgentState.COMPLETED)
    # Should fallback to the next logical progression state
    assert fallback == AgentState.ELICIT_REASONING


def test_orchestrator_json_parsing_clean():
    orchestrator = SocraticOrchestrator()
    sample_json = """{
        "assistant_message": "What is the base case of your recursion?",
        "agent_state": "ELICIT_REASONING",
        "awaiting_student": true,
        "language": "English",
        "code_blocks": ["int fact(int n);"],
        "session_completed": false
    }"""
    parsed = orchestrator._parse_llm_json(sample_json, default_state=AgentState.INTAKE, language="English")
    assert parsed.agent_state == AgentState.ELICIT_REASONING
    assert parsed.assistant_message == "What is the base case of your recursion?"
    assert parsed.code_blocks == ["int fact(int n);"]
    assert parsed.awaiting_student is True
    assert parsed.session_completed is False


def test_orchestrator_json_with_markdown_fence():
    orchestrator = SocraticOrchestrator()
    fenced_json = """```json
    {
        "assistant_message": "क्या आपको लगता है कि n == 0 पर फंक्शन रुकना चाहिए?",
        "agent_state": "ELICIT_REASONING",
        "awaiting_student": true,
        "language": "Hindi",
        "code_blocks": [],
        "session_completed": false
    }
    ```"""
    parsed = orchestrator._parse_llm_json(fenced_json, default_state=AgentState.INTAKE, language="Hindi")
    assert parsed.agent_state == AgentState.ELICIT_REASONING
    assert "फंक्शन रुकना चाहिए" in parsed.assistant_message
    assert parsed.language == "Hindi"


def test_orchestrator_malformed_json_fallback():
    orchestrator = SocraticOrchestrator()
    malformed_text = "Here is some free-form explanation without JSON."
    parsed = orchestrator._parse_llm_json(malformed_text, default_state=AgentState.INTAKE, language="English")
    assert parsed.assistant_message == malformed_text
    assert parsed.agent_state == AgentState.ELICIT_REASONING or parsed.agent_state == AgentState.WAITING_FOR_STUDENT
    assert parsed.awaiting_student is True

