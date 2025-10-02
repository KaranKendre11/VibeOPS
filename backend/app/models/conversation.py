from typing import Optional, Dict, List, Literal, Any
from pydantic import BaseModel
from datetime import datetime


class ChatMessage(BaseModel):
    """Chat message from user"""
    content: str
    type: Literal["text", "file"] = "text"
    metadata: Optional[Dict[str, Any]] = None


class ConversationHistory(BaseModel):
    """Full conversation history"""
    messages: List[Dict[str, Any]]


class StreamEvent(BaseModel):
    """Base model for streaming events"""
    type: str
    timestamp: datetime = datetime.now()


class AgentStatusEvent(StreamEvent):
    """Agent status update event"""
    type: Literal["agent_status"] = "agent_status"
    agent_id: str
    agent_name: str
    status: Literal["idle", "working", "completed", "error"]
    current_task: Optional[str] = None
    activity: Optional[str] = None


class TextChunkEvent(StreamEvent):
    """Text response chunk"""
    type: Literal["text"] = "text"
    content: str
    agent: Optional[str] = None


class ArchitectureEvent(StreamEvent):
    """Architecture update event"""
    type: Literal["architecture"] = "architecture"
    data: Dict[str, Any]


class DeploymentStatusEvent(StreamEvent):
    """Deployment status update"""
    type: Literal["deployment_status"] = "deployment_status"
    data: Dict[str, Any]


class ErrorEvent(StreamEvent):
    """Error event"""
    type: Literal["error"] = "error"
    message: str
    details: Optional[str] = None
