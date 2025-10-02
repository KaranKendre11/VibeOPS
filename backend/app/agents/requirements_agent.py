"""Requirements Analysis Agent"""
from typing import Dict, Any
from ..services import get_vertex_ai_service
from ..utils import REQUIREMENTS_ANALYSIS_PROMPT, ConversationState


class RequirementsAgent:
    """Agent responsible for analyzing user requirements"""

    def __init__(self):
        self.vertex_ai = get_vertex_ai_service()
        self.name = "Requirements Analysis Agent"
        self.id = "requirements-analysis"

    async def analyze(self, state: ConversationState) -> Dict[str, Any]:
        """
        Analyze user requirements and extract structured information

        Args:
            state: Current conversation state

        Returns:
            Updated state with requirements analysis
        """
        user_message = state["user_message"]
        conversation_history = state.get("conversation_history", [])

        # Format conversation history for context
        history_str = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in conversation_history[-5:]  # Last 5 messages
        ])

        # Create prompt
        prompt = REQUIREMENTS_ANALYSIS_PROMPT.format(
            user_message=user_message,
            conversation_history=history_str
        )

        try:
            # Get structured response from LLM
            requirements = await self.vertex_ai.generate_json_response(
                prompt=prompt
            )

            # Update state
            state["requirements"] = requirements
            state["current_step"] = "requirements_complete"

            return state

        except Exception as e:
            state["errors"].append(f"Requirements analysis failed: {str(e)}")
            state["current_step"] = "requirements_failed"
            return state

    def should_ask_clarification(self, requirements: Dict[str, Any]) -> bool:
        """
        Determine if clarification is needed from user

        Args:
            requirements: Analyzed requirements

        Returns:
            True if clarification needed
        """
        # Check if critical information is missing
        critical_fields = ["services_needed", "constraints"]

        for field in critical_fields:
            if not requirements.get(field):
                return True

        return False
