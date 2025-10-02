"""API routes"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..models import ChatMessage
from ..agents.orchestrator import AgentOrchestrator
from .streaming import create_sse_stream
from ..services import get_gcp_client_service

router = APIRouter()

# Initialize orchestrator
orchestrator = AgentOrchestrator()


@router.post("/chat")
async def chat(message: ChatMessage):
    """
    Chat endpoint with SSE streaming

    Processes user message through agent workflow and streams updates
    """
    try:
        # Get event stream from orchestrator
        event_stream = orchestrator.process_stream(
            user_message=message.content,
            conversation_history=message.metadata.get("conversation_history", [])
            if message.metadata else []
        )

        # Convert to SSE format
        sse_stream = create_sse_stream(event_stream)

        return StreamingResponse(
            sse_stream,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "vibe-devops-backend"
    }


@router.get("/gcp/resources")
async def get_gcp_resources():
    """Get current GCP resources"""
    try:
        gcp_client = get_gcp_client_service()
        resources = await gcp_client.get_project_resources()
        return resources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
