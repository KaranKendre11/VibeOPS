"""LangGraph Orchestrator for coordinating agents"""
import os
from typing import AsyncGenerator, Dict, Any
import json
from datetime import datetime
from langgraph.graph import StateGraph, END
from ..utils import ConversationState
from . import (
    RequirementsAgent,
    ArchitectureAgent,
    IaCAgent,
    DeploymentAgent
)
from ..models import (
    AgentStatusEvent,
    TextChunkEvent,
    ArchitectureEvent,
    DeploymentStatusEvent
)


class AgentOrchestrator:
    """Orchestrates the multi-agent workflow using LangGraph"""

    def __init__(self):
        # Initialize agents
        self.requirements_agent = RequirementsAgent()
        self.architecture_agent = ArchitectureAgent()
        self.iac_agent = IaCAgent()
        self.deployment_agent = DeploymentAgent()

        # Build workflow graph
        self.workflow = self._build_workflow()

        self.project_id = os.getenv("GCP_PROJECT_ID", "")
        self.region = os.getenv("GCP_REGION", "us-central1")

    def _build_workflow(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(ConversationState)

        # Add nodes for each agent
        workflow.add_node("requirements", self._requirements_node)
        workflow.add_node("architecture", self._architecture_node)
        workflow.add_node("iac_generation", self._iac_node)
        workflow.add_node("deployment", self._deployment_node)

        # Define edges (workflow sequence)
        workflow.set_entry_point("requirements")
        workflow.add_edge("requirements", "architecture")
        workflow.add_edge("architecture", "iac_generation")
        workflow.add_edge("iac_generation", "deployment")
        workflow.add_edge("deployment", END)

        return workflow.compile()

    async def _requirements_node(self, state: ConversationState) -> ConversationState:
        """Requirements analysis node"""
        return await self.requirements_agent.analyze(state)

    async def _architecture_node(self, state: ConversationState) -> ConversationState:
        """Architecture design node"""
        return await self.architecture_agent.design(state)

    async def _iac_node(self, state: ConversationState) -> ConversationState:
        """IaC generation node"""
        return await self.iac_agent.generate(state)

    async def _deployment_node(self, state: ConversationState) -> ConversationState:
        """Deployment node - special handling for streaming"""
        # This will be called synchronously by langgraph
        # Actual streaming happens in process_stream
        state["current_step"] = "deployment_started"
        return state

    async def process_stream(
        self,
        user_message: str,
        conversation_history: list = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process user message through agent workflow with streaming updates

        Args:
            user_message: User's message
            conversation_history: Previous conversation messages

        Yields:
            Stream events (agent status, text, architecture, deployment updates)
        """
        # Initialize state
        state: ConversationState = {
            "user_message": user_message,
            "conversation_history": conversation_history or [],
            "requirements": None,
            "architecture_plan": None,
            "terraform_config": None,
            "deployment_id": None,
            "deployment_status": None,
            "deployment_logs": [],
            "gcp_architecture": None,
            "current_step": "started",
            "errors": [],
            "project_id": self.project_id,
            "region": self.region
        }

        try:
            # Step 1: Requirements Analysis
            yield self._create_agent_status_event(
                self.requirements_agent.id,
                self.requirements_agent.name,
                "working",
                "Analyzing your requirements..."
            )

            state = await self._requirements_node(state)

            if state.get("errors"):
                yield self._create_error_event("\n".join(state["errors"]))
                return

            requirements = state.get("requirements", {})
            summary = requirements.get("summary", "Requirements analyzed")

            yield self._create_text_event(
                f"✓ **Requirements Analysis Complete**\n\n{summary}\n\n",
                self.requirements_agent.id
            )

            yield self._create_agent_status_event(
                self.requirements_agent.id,
                self.requirements_agent.name,
                "completed",
                None
            )

            # Step 2: Architecture Design
            yield self._create_agent_status_event(
                self.architecture_agent.id,
                self.architecture_agent.name,
                "working",
                "Designing optimal GCP architecture..."
            )

            state = await self._architecture_node(state)

            if state.get("errors"):
                yield self._create_error_event("\n".join(state["errors"]))
                return

            architecture_plan = state.get("architecture_plan", {})
            explanation = architecture_plan.get("explanation", "Architecture designed")
            estimated_cost = architecture_plan.get("estimated_cost", 0)

            yield self._create_text_event(
                f"✓ **Architecture Design Complete**\n\n{explanation}\n\n"
                f"**Estimated Monthly Cost:** ${estimated_cost:.2f}\n\n",
                self.architecture_agent.id
            )

            yield self._create_agent_status_event(
                self.architecture_agent.id,
                self.architecture_agent.name,
                "completed",
                None
            )

            # Step 3: IaC Generation
            yield self._create_agent_status_event(
                self.iac_agent.id,
                self.iac_agent.name,
                "working",
                "Generating Terraform configuration..."
            )

            state = await self._iac_node(state)

            if state.get("errors"):
                yield self._create_error_event("\n".join(state["errors"]))
                return

            terraform_config = state.get("terraform_config", {})
            deployment_id = state.get("deployment_id")

            yield self._create_text_event(
                f"✓ **Terraform Configuration Generated**\n\n"
                f"**Deployment ID:** `{deployment_id}`\n\n"
                f"Generated {len(terraform_config.get('files', {}))} Terraform files\n\n",
                self.iac_agent.id
            )

            yield self._create_agent_status_event(
                self.iac_agent.id,
                self.iac_agent.name,
                "completed",
                None
            )

            # Step 4: Deployment
            yield self._create_agent_status_event(
                self.deployment_agent.id,
                self.deployment_agent.name,
                "working",
                "Deploying infrastructure to GCP..."
            )

            yield self._create_text_event(
                f"🚀 **Starting Deployment**\n\nDeploying infrastructure to GCP...\n\n",
                self.deployment_agent.id
            )

            # Stream deployment updates
            async for deployment_update in self.deployment_agent.deploy(state):
                # Send deployment status event
                yield self._create_deployment_status_event(deployment_update)

                # If deployment completed, send architecture
                if deployment_update.get("status") == "completed":
                    if deployment_update.get("architecture"):
                        yield self._create_architecture_event(
                            deployment_update["architecture"]
                        )

                    yield self._create_text_event(
                        f"\n\n✅ **Deployment Complete!**\n\n"
                        f"Your infrastructure is now live on GCP.\n"
                        f"Check the Architecture Dashboard to view your resources.\n",
                        self.deployment_agent.id
                    )

            yield self._create_agent_status_event(
                self.deployment_agent.id,
                self.deployment_agent.name,
                "completed",
                None
            )

        except Exception as e:
            yield self._create_error_event(f"Orchestration error: {str(e)}")

    def _create_agent_status_event(
        self,
        agent_id: str,
        agent_name: str,
        status: str,
        current_task: str = None
    ) -> Dict[str, Any]:
        """Create an agent status event"""
        return {
            "type": "agent_status",
            "agent_id": agent_id,
            "agent_name": agent_name,
            "status": status,
            "current_task": current_task,
            "activity": current_task,
            "timestamp": datetime.now().isoformat()
        }

    def _create_text_event(
        self,
        content: str,
        agent: str = None
    ) -> Dict[str, Any]:
        """Create a text chunk event"""
        return {
            "type": "text",
            "content": content,
            "agent": agent,
            "timestamp": datetime.now().isoformat()
        }

    def _create_architecture_event(
        self,
        architecture: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create an architecture update event"""
        return {
            "type": "architecture",
            "data": architecture,
            "timestamp": datetime.now().isoformat()
        }

    def _create_deployment_status_event(
        self,
        deployment_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a deployment status event"""
        return {
            "type": "deployment_status",
            "data": deployment_data,
            "timestamp": datetime.now().isoformat()
        }

    def _create_error_event(
        self,
        message: str
    ) -> Dict[str, Any]:
        """Create an error event"""
        return {
            "type": "error",
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
