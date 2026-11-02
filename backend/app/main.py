import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.seed_data import seed_database
from app.database.session import engine, Base

# Import all routers
from app.api import (
    auth,
    dashboard,
    incidents,
    ai,
    drone,
    map as map_api,
    priority,
    rescue,
    notifications,
    weather,
    resources,
    facilities,
    reports,
    copilot,
    admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Operational API for DisasterAI – Intelligent Disaster Response & Management Platform"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOADS_DIR)), name="uploads")

# Include Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(incidents.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(drone.router, prefix=api_prefix)
app.include_router(map_api.router, prefix=api_prefix)
app.include_router(priority.router, prefix=api_prefix)
app.include_router(rescue.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(weather.router, prefix=api_prefix)
app.include_router(resources.router, prefix=api_prefix)
app.include_router(facilities.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(copilot.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

@app.on_event("startup")
def on_startup():
    # Ensure database tables exist and seed default disaster records
    seed_database()

@app.get("/")
def root():
    return {
        "platform": "DisasterAI – Intelligent Disaster Response & Management Platform",
        "status": "Operational",
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
