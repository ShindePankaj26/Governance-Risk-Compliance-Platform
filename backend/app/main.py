from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import (
    risks, vendors, compliance, audits, policies, aigov, dashboard, auth
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Integrated GRC Platform API",
    description="Governance, Risk & Compliance Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["Auth"])
app.include_router(dashboard.router,  prefix="/api/v1/dashboard",  tags=["Dashboard"])
app.include_router(risks.router,      prefix="/api/v1/risks",       tags=["Risks"])
app.include_router(vendors.router,    prefix="/api/v1/vendors",     tags=["Vendors"])
app.include_router(compliance.router, prefix="/api/v1/compliance",  tags=["Compliance"])
app.include_router(audits.router,     prefix="/api/v1/audits",      tags=["Audits"])
app.include_router(policies.router,   prefix="/api/v1/policies",    tags=["Policies"])
app.include_router(aigov.router,      prefix="/api/v1/aigov",       tags=["AI Governance"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GRC Platform API"}
