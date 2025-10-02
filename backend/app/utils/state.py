from typing import TypedDict, Optional, List, Dict, Any, Annotated
from operator import add


class ConversationState(TypedDict):
    """State object that flows through the LangGraph workflow"""

    # User input
    user_message: str
    conversation_history: List[Dict[str, Any]]

    # Requirements Analysis
    requirements: Optional[Dict[str, Any]]

    # Architecture Design
    architecture_plan: Optional[Dict[str, Any]]

    # IaC Generation
    terraform_config: Optional[Dict[str, Any]]

    # Deployment
    deployment_id: Optional[str]
    deployment_status: Optional[str]
    deployment_logs: Annotated[List[str], add]

    # Live Architecture
    gcp_architecture: Optional[Dict[str, Any]]

    # Metadata
    current_step: str
    errors: Annotated[List[str], add]
    project_id: str
    region: str
