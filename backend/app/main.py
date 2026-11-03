import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_v1_router
from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.exceptions import (
    BhashaException,
    EntityNotFoundException,
    ExternalServiceException,
    ForbiddenException,
    UnauthorizedException,
    ValidationException,
)
import app.models  # Ensure all SQLAlchemy models are registered

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bhasha")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Bhasha Doubt Solver backend...")
    # SQLite / Development: Auto-create tables for instant developer setup
    # PostgreSQL / Production: Alembic migrations are the authoritative schema source of truth
    is_sqlite = engine.url.drivername.startswith("sqlite")
    if is_sqlite:
        logger.info("SQLite database detected: Creating local schema via Base.metadata.create_all.")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        logger.info(
            "Non-SQLite/PostgreSQL database detected (%s): "
            "Skipping Base.metadata.create_all. Schema migrations must be applied via Alembic ('alembic upgrade head').",
            engine.url.drivername,
        )
    logger.info("Database schema initialized.")
    yield
    logger.info("Shutting down Bhasha Doubt Solver backend...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Adaptive Socratic AI programming tutor powered by Sarvam AI.",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(EntityNotFoundException)
async def not_found_handler(request: Request, exc: EntityNotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message, "details": exc.details},
    )


@app.exception_handler(UnauthorizedException)
async def unauthorized_handler(request: Request, exc: UnauthorizedException):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message, "details": exc.details},
    )


@app.exception_handler(ForbiddenException)
async def forbidden_handler(request: Request, exc: ForbiddenException):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message, "details": exc.details},
    )


@app.exception_handler(ValidationException)
async def validation_handler(request: Request, exc: ValidationException):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.message, "details": exc.details},
    )


@app.exception_handler(ExternalServiceException)
async def external_service_handler(request: Request, exc: ExternalServiceException):
    return JSONResponse(
        status_code=status.HTTP_502_BAD_GATEWAY,
        content={"detail": exc.message, "details": exc.details},
    )


@app.exception_handler(BhashaException)
async def generic_bhasha_handler(request: Request, exc: BhashaException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "details": exc.details},
    )


# Attach API v1 Router
app.include_router(api_v1_router)

