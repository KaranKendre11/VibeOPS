from typing import Optional, Dict, List, Literal, Any
from pydantic import BaseModel, Field
from datetime import datetime


class GCPServiceConfig(BaseModel):
    """Configuration details for a GCP service"""
    memory: Optional[str] = None
    cpu: Optional[str] = None
    instance_type: Optional[str] = None
    tier: Optional[str] = None
    storage_size: Optional[int] = None
    replicas: Optional[int] = None
    additional_config: Optional[Dict[str, Any]] = None


class GCPServiceMetrics(BaseModel):
    """Real-time metrics for a GCP service"""
    cpu: Optional[float] = None
    memory: Optional[float] = None
    requests: Optional[int] = None
    latency: Optional[float] = None
    errors: Optional[float] = None


class CostEstimate(BaseModel):
    """Cost estimation for a resource"""
    monthly: float
    breakdown: str
    currency: str = "USD"


class GCPService(BaseModel):
    """Represents a single GCP service/resource"""
    id: str
    name: str
    type: Literal[
        "cloud-run", "compute-engine", "cloud-sql", "cloud-storage",
        "cloud-functions", "memorystore", "gke", "cloud-load-balancer",
        "vpc", "firestore", "cloud-tasks", "cloud-scheduler"
    ]
    status: Literal["running", "stopped", "deploying", "error", "pending"]
    region: str
    project_id: str
    description: str
    configuration: Optional[GCPServiceConfig] = None
    cost_estimate: Optional[CostEstimate] = None
    metrics: Optional[GCPServiceMetrics] = None
    tags: Optional[Dict[str, str]] = None
    labels: Optional[Dict[str, str]] = None
    connections: Optional[List[str]] = Field(default_factory=list)
    health_status: Optional[Literal["healthy", "warning", "critical", "unknown"]] = "unknown"
    resource_url: Optional[str] = None
    arn: Optional[str] = None  # GCP resource name
    last_updated: Optional[datetime] = None


class ApplicationStack(BaseModel):
    """Represents a logical group of GCP services forming an application"""
    id: str
    name: str
    description: str
    services: List[GCPService]
    primary_service: str
    labels: Dict[str, str]
    total_cost: float
    health_status: Literal["healthy", "warning", "critical"]
    vpc: Optional[str] = None
    subnets: Optional[List[str]] = Field(default_factory=list)


class GCPConnection(BaseModel):
    """Represents a connection between GCP services"""
    id: str
    source: str
    target: str
    connection_type: Literal["network", "iam", "data", "api"]
    protocol: Optional[str] = None
    port: Optional[int] = None
    description: str


class GCPArchitecture(BaseModel):
    """Complete GCP architecture representation"""
    id: str
    name: str
    description: str
    project_id: str
    application_stacks: List[ApplicationStack]
    connections: List[GCPConnection]
    total_cost: float
    cost_breakdown: Dict[str, float]
    last_refresh: datetime
    has_gcp_access: bool = True


class RequirementsAnalysis(BaseModel):
    """Output from Requirements Analysis Agent"""
    services_needed: List[str]
    constraints: Dict[str, any]
    dependencies: List[Dict[str, str]]
    estimated_traffic: Optional[str] = None
    security_requirements: Optional[List[str]] = None
    compliance_needs: Optional[List[str]] = None


class ArchitecturePlan(BaseModel):
    """Output from Cloud Architecture Agent"""
    resources: List[Dict[str, any]]
    networking: Dict[str, any]
    iam_roles: List[Dict[str, str]]
    region: str
    estimated_cost: float
    deployment_order: List[str]


class TerraformConfig(BaseModel):
    """Generated Terraform configuration"""
    deployment_id: str
    files: Dict[str, str]  # filename -> content
    variables: Dict[str, any]
    outputs: Dict[str, str]


class DeploymentStatus(BaseModel):
    """Real-time deployment status"""
    deployment_id: str
    status: Literal["pending", "planning", "applying", "completed", "failed", "rolling_back"]
    progress: float  # 0-100
    current_step: str
    logs: List[str]
    resources_created: List[str]
    error: Optional[str] = None
