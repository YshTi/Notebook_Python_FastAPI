from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.tasks import router as tasks_router
from app.routers.auth import router as auth_router
from app.config import settings


app = FastAPI(
    title="TODO API",
    description="Backend API for the full-stack TODO application",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)
app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "TODO API is running"}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
