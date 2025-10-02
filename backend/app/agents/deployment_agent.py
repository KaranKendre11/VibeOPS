"""Deployment Agent"""
from typing import Dict, Any, AsyncGenerator
from pathlib import Path
from ..services import get_terraform_service, get_gcp_client_service
from ..utils import ConversationState
from ..models import DeploymentStatus


class DeploymentAgent:
    """Agent responsible for deploying infrastructure"""

    def __init__(self):
        self.terraform_service = get_terraform_service()
        self.gcp_client = get_gcp_client_service()
        self.name = "Deployment Agent"
        self.id = "deployment"

    async def deploy(
        self,
        state: ConversationState
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Deploy infrastructure using Terraform

        Args:
            state: Current conversation state

        Yields:
            Deployment status updates
        """
        deployment_id = state.get("deployment_id")
        terraform_config = state.get("terraform_config")

        if not deployment_id or not terraform_config:
            yield {
                "status": "failed",
                "error": "Missing deployment configuration",
                "progress": 0
            }
            return

        workspace = Path(self.terraform_service.workspace_dir) / deployment_id

        try:
            # Step 1: Initialize Terraform
            yield {
                "status": "planning",
                "progress": 10,
                "current_step": "Initializing Terraform workspace...",
                "logs": []
            }

            init_logs = []
            async for log_line in self.terraform_service.terraform_init(workspace):
                init_logs.append(log_line)
                yield {
                    "status": "planning",
                    "progress": 20,
                    "current_step": "Initializing Terraform workspace...",
                    "logs": init_logs[-10:]  # Last 10 lines
                }

            # Step 2: Run terraform plan
            yield {
                "status": "planning",
                "progress": 30,
                "current_step": "Creating deployment plan...",
                "logs": []
            }

            plan_logs = []
            async for log_line in self.terraform_service.terraform_plan(workspace):
                plan_logs.append(log_line)
                yield {
                    "status": "planning",
                    "progress": 50,
                    "current_step": "Creating deployment plan...",
                    "logs": plan_logs[-10:]
                }

            # Step 3: Apply infrastructure
            yield {
                "status": "applying",
                "progress": 60,
                "current_step": "Applying infrastructure changes...",
                "logs": []
            }

            apply_logs = []
            resources_created = []

            async for log_line in self.terraform_service.terraform_apply(workspace):
                apply_logs.append(log_line)

                # Track resource creation
                if "Creating..." in log_line or "Creation complete" in log_line:
                    resources_created.append(log_line)

                progress = min(60 + (len(apply_logs) / 10), 90)

                yield {
                    "status": "applying",
                    "progress": progress,
                    "current_step": "Applying infrastructure changes...",
                    "logs": apply_logs[-10:],
                    "resources_created": resources_created
                }

            # Step 4: Get outputs and verify
            yield {
                "status": "applying",
                "progress": 95,
                "current_step": "Verifying deployment...",
                "logs": apply_logs[-10:]
            }

            outputs = await self.terraform_service.get_terraform_outputs(workspace)

            # Step 5: Build architecture visualization
            gcp_architecture = await self._build_architecture_from_deployment(
                state,
                outputs
            )

            state["gcp_architecture"] = gcp_architecture

            # Final status
            yield {
                "status": "completed",
                "progress": 100,
                "current_step": "Deployment completed successfully!",
                "logs": apply_logs[-20:],
                "resources_created": resources_created,
                "outputs": outputs,
                "architecture": gcp_architecture
            }

            state["deployment_status"] = "completed"
            state["current_step"] = "deployment_complete"

        except Exception as e:
            error_msg = str(e)
            yield {
                "status": "failed",
                "progress": 0,
                "current_step": "Deployment failed",
                "error": error_msg,
                "logs": []
            }

            state["errors"].append(f"Deployment failed: {error_msg}")
            state["deployment_status"] = "failed"
            state["current_step"] = "deployment_failed"

    async def _build_architecture_from_deployment(
        self,
        state: ConversationState,
        outputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build architecture visualization from deployed resources"""
        architecture_plan = state.get("architecture_plan", {})
        deployment_id = state.get("deployment_id")
        project_id = state.get("project_id")

        # Build application stack from architecture plan
        services = []
        total_cost = 0.0

        for resource in architecture_plan.get("resources", []):
            service = {
                "id": f"{resource.get('name', 'resource')}-{deployment_id[:8]}",
                "name": resource.get("name", "Unknown Resource"),
                "type": resource.get("type"),
                "status": "running",
                "region": resource.get("region", state.get("region", "us-central1")),
                "project_id": project_id,
                "description": f"Deployed {resource.get('type')} resource",
                "configuration": resource.get("config", {}),
                "cost_estimate": {
                    "monthly": resource.get("estimated_monthly_cost", 0.0),
                    "breakdown": f"{resource.get('type')} monthly cost",
                    "currency": "USD"
                },
                "health_status": "healthy",
                "labels": {
                    "deployment_id": deployment_id,
                    "managed_by": "vibe-devops"
                }
            }
            services.append(service)
            total_cost += resource.get("estimated_monthly_cost", 0.0)

        application_stack = {
            "id": deployment_id,
            "name": architecture_plan.get("name", "Deployed Application"),
            "description": "Application deployed by Vibe DevOps",
            "services": services,
            "primary_service": services[0]["id"] if services else "",
            "labels": {
                "deployment_id": deployment_id,
                "managed_by": "vibe-devops",
                "environment": "production"
            },
            "total_cost": round(total_cost, 2),
            "health_status": "healthy",
            "vpc": architecture_plan.get("networking", {}).get("vpc")
        }

        architecture = {
            "id": deployment_id,
            "name": f"GCP Architecture - {deployment_id}",
            "description": "Live GCP architecture deployed by Vibe DevOps",
            "project_id": project_id,
            "application_stacks": [application_stack],
            "connections": [],
            "total_cost": round(total_cost, 2),
            "cost_breakdown": {
                application_stack["name"]: round(total_cost, 2)
            },
            "last_refresh": state.get("current_step"),
            "has_gcp_access": True
        }

        return architecture
