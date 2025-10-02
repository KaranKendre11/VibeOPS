"""Vertex AI service for LLM interactions"""
import os
from typing import AsyncGenerator, Optional
import json
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage


class VertexAIService:
    """Service for interacting with Google Vertex AI"""

    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        self.model_name = os.getenv("VERTEX_AI_MODEL", "gemini-1.5-pro")

        self.llm = ChatVertexAI(
            model_name=self.model_name,
            project=self.project_id,
            location=self.location,
            temperature=0.7,
            max_output_tokens=2048,
        )

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        response_format: str = "text"
    ) -> str:
        """
        Generate a response from Vertex AI

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt for context
            response_format: 'text' or 'json'

        Returns:
            Generated response as string
        """
        messages = []

        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))

        messages.append(HumanMessage(content=prompt))

        try:
            response = await self.llm.ainvoke(messages)
            content = response.content

            if response_format == "json":
                # Try to extract JSON from markdown code blocks
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()

            return content

        except Exception as e:
            raise Exception(f"Error generating response from Vertex AI: {str(e)}")

    async def generate_json_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> dict:
        """
        Generate a JSON response from Vertex AI

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt

        Returns:
            Parsed JSON response as dict
        """
        response = await self.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            response_format="json"
        )

        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # If JSON parsing fails, try to extract JSON from text
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            raise Exception(f"Failed to parse JSON response: {str(e)}\nResponse: {response}")

    async def stream_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response from Vertex AI token by token

        Args:
            prompt: The user prompt
            system_prompt: Optional system prompt

        Yields:
            Response tokens as they are generated
        """
        messages = []

        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))

        messages.append(HumanMessage(content=prompt))

        try:
            async for chunk in self.llm.astream(messages):
                if hasattr(chunk, 'content'):
                    yield chunk.content
        except Exception as e:
            raise Exception(f"Error streaming from Vertex AI: {str(e)}")


# Singleton instance
_vertex_ai_service: Optional[VertexAIService] = None


def get_vertex_ai_service() -> VertexAIService:
    """Get or create the Vertex AI service singleton"""
    global _vertex_ai_service
    if _vertex_ai_service is None:
        _vertex_ai_service = VertexAIService()
    return _vertex_ai_service
