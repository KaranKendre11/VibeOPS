"""SSE streaming utilities"""
import json
from typing import AsyncGenerator, Dict, Any


async def create_sse_stream(
    event_generator: AsyncGenerator[Dict[str, Any], None]
) -> AsyncGenerator[str, None]:
    """
    Convert event generator to SSE format

    Args:
        event_generator: Generator yielding event dictionaries

    Yields:
        SSE-formatted strings
    """
    try:
        async for event in event_generator:
            # Format as SSE
            event_json = json.dumps(event)
            yield f"data: {event_json}\n\n"

    except Exception as e:
        # Send error event
        error_event = {
            "type": "error",
            "message": str(e)
        }
        yield f"data: {json.dumps(error_event)}\n\n"

    finally:
        # Send completion signal
        yield "data: [DONE]\n\n"
