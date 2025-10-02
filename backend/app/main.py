"""FastAPI main application"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .api import router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Vibe DevOps GCP",
    description="Agentic Cloud Architect for GCP",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Vibe DevOps GCP API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "True").lower() == "true"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=debug
    )
