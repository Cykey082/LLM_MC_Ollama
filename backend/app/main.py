from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.bot.client import bot_client
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    print("🚀 Starting LLM-MC Backend...")
    await bot_client.init()
    
    # Start WebSocket listener for bot events
    await bot_client.start_ws_listener()
    print("✅ Backend ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")
    await bot_client.close()


app = FastAPI(
    title="LLM-MC API",
    description="API for LLM-powered Minecraft bot",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "name": "LLM-MC API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )