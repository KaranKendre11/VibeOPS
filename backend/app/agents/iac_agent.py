"""Infrastructure as Code Generation Agent"""
from typing import Dict, Any
import json
import uuid
from ..services import get_vertex_ai_service, get_terraform_service
from ..utils import IAC_GENERATION_PROMPT, ConversationState


class IaCAgent:
    """Agent responsible for generating Terraform configurations"""

    def __init__(self):
        self.vertex_ai = get_vertex_ai_service()
        self.terraform_service = get_terraform_service()
        self.name = "IaC Generation Agent"
        self.id = "iac-generation"

    async def generate(self, state: ConversationState) -> Dict[str, Any]:
        """
        Generate Terraform configuration from architecture plan

        Args:
            state: Current conversation state

        Returns:
            Updated state with Terraform configuration
        """
        architecture_plan = state.get("architecture_plan")

        if not architecture_plan:
            state["errors"].append("No architecture plan found for IaC generation")
            state["current_step"] = "iac_failed"
            return state

        # Create prompt with architecture plan
        prompt = IAC_GENERATION_PROMPT.format(
            architecture_plan=json.dumps(architecture_plan, indent=2)
        )

        try:
            # Get Terraform configuration from LLM
            terraform_config = await self.vertex_ai.generate_json_response(
                prompt=prompt
            )

            # Generate deployment ID if not present
            if not terraform_config.get("deployment_id"):
                terraform_config["deployment_id"] = f"deploy-{uuid.uuid4().hex[:8]}"

            # Add provider configuration if not present
            terraform_config = self._add_provider_config(terraform_config, state)

            # Write Terraform files to workspace
            deployment_id = terraform_config["deployment_id"]
            workspace = self.terraform_service.write_terraform_files(
                deployment_id=deployment_id,
                files=terraform_config["files"]
            )

            # Update state
            state["terraform_config"] = terraform_config
            state["deployment_id"] = deployment_id
            state["current_step"] = "iac_complete"

            return state

        except Exception as e:
            state["errors"].append(f"IaC generation failed: {str(e)}")
            state["current_step"] = "iac_failed"
            return state

    def _add_provider_config(
        self,
        config: Dict[str, Any],
        state: ConversationState
    ) -> Dict[str, Any]:
        """Add GCP provider configuration to Terraform"""
        project_id = state.get("project_id", "")
        region = state.get("region", "us-central1")

        # Create provider.tf if not present
        if "provider.tf" not in config["files"]:
            provider_config = f'''terraform {{
  required_providers {{
    google = {{
      source  = "hashicorp/google"
      version = "~> 5.0"
    }}
  }}
}}

provider "google" {{
  project = "{project_id}"
  region  = "{region}"
}}
'''
            config["files"]["provider.tf"] = provider_config

        return config

    def validate_terraform_syntax(self, files: Dict[str, str]) -> tuple[bool, list[str]]:
        """
        Validate Terraform syntax (basic validation)

        Args:
            files: Dictionary of Terraform files

        Returns:
            Tuple of (is_valid, list of errors)
        """
        errors = []
        is_valid = True

        # Check for required files
        required_files = ["main.tf"]
        for file in required_files:
            if file not in files:
                errors.append(f"Missing required file: {file}")
                is_valid = False

        # Check for basic Terraform syntax
        for filename, content in files.items():
            if not content.strip():
                errors.append(f"File {filename} is empty")
                is_valid = False

            # Check for basic terraform blocks
            if filename == "main.tf":
                if "resource" not in content and "data" not in content:
                    errors.append("main.tf should contain resource or data blocks")
                    is_valid = False

        return is_valid, errors
