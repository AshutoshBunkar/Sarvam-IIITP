from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import get_settings
from app.core.database import get_db

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/health", status_code=status.HTTP_200_OK)
async def get_health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint returning application and database status."""
    db_status = "disconnected"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "sarvam_configured": bool(settings.SARVAM_API_KEY),
        "sarvam_model": settings.SARVAM_CHAT_MODEL,
    }

