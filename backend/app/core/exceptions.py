from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class BhashaException(Exception):
    """Base exception for Bhasha domain errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class EntityNotFoundException(BhashaException):
    """Raised when an entity is not found."""
    pass


class UnauthorizedException(BhashaException):
    """Raised when authentication fails."""
    pass


class ForbiddenException(BhashaException):
    """Raised when user lacks permission to access an entity."""
    pass


class ValidationException(BhashaException):
    """Raised when input validation fails."""
    pass


class ExternalServiceException(BhashaException):
    """Raised when an external service (e.g. Sarvam AI) fails."""
    pass

