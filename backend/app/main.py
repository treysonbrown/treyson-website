from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from decouple import config

from app.routers import work_log, user

API_PREFIX = "/api/v1"


def build_allowed_origins() -> list[str]:
    """Parse CORS origins from env and fallback to local dev defaults."""
    raw_value = config(
        "CORS_ORIGINS",
        default="http://localhost:5173,http://localhost:8081",
    )
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]


app = FastAPI(
    title="FastAPI Project",
    description="A FastAPI project with PostgreSQL and Alembic",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(work_log.router, prefix=API_PREFIX)
app.include_router(user.router, prefix=API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to FastAPI!"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
