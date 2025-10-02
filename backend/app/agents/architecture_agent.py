"""Cloud Architecture Agent"""
from typing import Dict, Any
import json
from ..services import get_vertex_ai_service, get_gcp_client_service
from ..utils import ARCHITECTURE_DESIGN_PROMPT, ConversationState


class ArchitectureAgent:
    """Agent responsible for designing GCP architecture"""

    def __init__(self):
        self.vertex_ai = get_vertex_ai_service()
        self.gcp_client = get_gcp_client_service()
        self.name = "Cloud Architecture Agent"
        self.id = "cloud-architecture"

    async def design(self, state: ConversationState) -> Dict[str, Any]:
        """
        Design optimal GCP architecture based on requirements

        Args:
            state: Current conversation state

        Returns:
            Updated state with architecture plan
        """
        requirements = state.get("requirements")

        if not requirements:
            state["errors"].append("No requirements found for architecture design")
            state["current_step"] = "architecture_failed"
            return state

        # Create prompt with requirements
        prompt = ARCHITECTURE_DESIGN_PROMPT.format(
            requirements=json.dumps(requirements, indent=2)
        )

        try:
            # Get architecture plan from LLM
            architecture_plan = await self.vertex_ai.generate_json_response(
                prompt=prompt
            )

            # Enhance plan with cost estimates
            architecture_plan = await self._add_cost_estimates(architecture_plan)

            # Update state
            state["architecture_plan"] = architecture_plan
            state["current_step"] = "architecture_complete"
            state["region"] = architecture_plan.get("region", "us-central1")

            return state

        except Exception as e:
            state["errors"].append(f"Architecture design failed: {str(e)}")
            state["current_step"] = "architecture_failed"
            return state

    async def _add_cost_estimates(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Add cost estimates to architecture plan"""
        total_cost = 0.0

        for resource in plan.get("resources", []):
            resource_type = resource.get("type")
            config = resource.get("config", {})

            # Get cost estimate
            cost = self.gcp_client.estimate_resource_cost(resource_type, config)
            resource["estimated_monthly_cost"] = cost
            total_cost += cost

        plan["estimated_cost"] = round(total_cost, 2)
        return plan

    def validate_architecture(self, plan: Dict[str, Any]) -> tuple[bool, list[str]]:
        """
        Validate architecture plan for best practices

        Args:
            plan: Architecture plan to validate

        Returns:
            Tuple of (is_valid, list of warnings)
        """
        warnings = []
        is_valid = True

        # Check for required fields
        if not plan.get("resources"):
            warnings.append("No resources defined in architecture")
            is_valid = False

        if not plan.get("region"):
            warnings.append("No region specified")

        # Check for security best practices
        resources = plan.get("resources", [])

        # Check for databases without VPC
        db_services = ["cloud-sql", "memorystore", "firestore"]
        has_database = any(r.get("type") in db_services for r in resources)
        has_vpc = any(r.get("type") == "vpc" for r in resources) or plan.get("networking", {}).get("vpc")

        if has_database and not has_vpc:
            warnings.append("Database services should be deployed in VPC for security")

        # Check for public endpoints
        for resource in resources:
            if resource.get("type") == "compute-engine":
                if resource.get("config", {}).get("external_ip"):
                    warnings.append(f"Resource {resource.get('name')} has external IP - ensure firewall rules are restrictive")

        return is_valid, warnings
