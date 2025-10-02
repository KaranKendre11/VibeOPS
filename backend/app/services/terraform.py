"""Terraform service for IaC generation and deployment"""
import os
import subprocess
import asyncio
from typing import Dict, List, Optional, AsyncGenerator
from pathlib import Path
import json


class TerraformService:
    """Service for generating and applying Terraform configurations"""

    def __init__(self, workspace_dir: str = "./terraform/outputs"):
        self.workspace_dir = Path(workspace_dir)
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

    def create_deployment_workspace(self, deployment_id: str) -> Path:
        """Create a workspace directory for a deployment"""
        deployment_path = self.workspace_dir / deployment_id
        deployment_path.mkdir(parents=True, exist_ok=True)
        return deployment_path

    def write_terraform_files(
        self,
        deployment_id: str,
        files: Dict[str, str]
    ) -> Path:
        """
        Write Terraform configuration files to deployment workspace

        Args:
            deployment_id: Unique deployment identifier
            files: Dictionary of filename -> content

        Returns:
            Path to deployment workspace
        """
        workspace = self.create_deployment_workspace(deployment_id)

        for filename, content in files.items():
            file_path = workspace / filename
            with open(file_path, 'w') as f:
                f.write(content)

        return workspace

    async def terraform_init(
        self,
        workspace: Path
    ) -> AsyncGenerator[str, None]:
        """Initialize Terraform workspace"""
        process = await asyncio.create_subprocess_exec(
            'terraform', 'init',
            cwd=str(workspace),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        async for line in self._stream_process_output(process):
            yield line

    async def terraform_plan(
        self,
        workspace: Path
    ) -> AsyncGenerator[str, None]:
        """Run terraform plan"""
        process = await asyncio.create_subprocess_exec(
            'terraform', 'plan', '-out=tfplan',
            cwd=str(workspace),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        async for line in self._stream_process_output(process):
            yield line

    async def terraform_apply(
        self,
        workspace: Path
    ) -> AsyncGenerator[str, None]:
        """Apply Terraform configuration"""
        process = await asyncio.create_subprocess_exec(
            'terraform', 'apply', '-auto-approve', 'tfplan',
            cwd=str(workspace),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        async for line in self._stream_process_output(process):
            yield line

    async def terraform_destroy(
        self,
        workspace: Path
    ) -> AsyncGenerator[str, None]:
        """Destroy Terraform-managed infrastructure"""
        process = await asyncio.create_subprocess_exec(
            'terraform', 'destroy', '-auto-approve',
            cwd=str(workspace),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        async for line in self._stream_process_output(process):
            yield line

    async def get_terraform_outputs(
        self,
        workspace: Path
    ) -> Dict[str, any]:
        """Get Terraform outputs as JSON"""
        try:
            process = await asyncio.create_subprocess_exec(
                'terraform', 'output', '-json',
                cwd=str(workspace),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return json.loads(stdout.decode())
            else:
                raise Exception(f"Failed to get outputs: {stderr.decode()}")

        except Exception as e:
            raise Exception(f"Error getting Terraform outputs: {str(e)}")

    async def _stream_process_output(
        self,
        process: asyncio.subprocess.Process
    ) -> AsyncGenerator[str, None]:
        """Stream output from a subprocess"""
        if process.stdout:
            async for line in process.stdout:
                yield line.decode().strip()

        await process.wait()

    def validate_terraform_installed(self) -> bool:
        """Check if Terraform is installed"""
        try:
            result = subprocess.run(
                ['terraform', 'version'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False


# Singleton instance
_terraform_service: Optional[TerraformService] = None


def get_terraform_service() -> TerraformService:
    """Get or create the Terraform service singleton"""
    global _terraform_service
    if _terraform_service is None:
        _terraform_service = TerraformService()
    return _terraform_service
