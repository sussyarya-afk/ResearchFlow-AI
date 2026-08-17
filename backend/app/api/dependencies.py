"""
API dependencies.

Provides get_current_user (Bearer token) and get_current_user_ws (query param token).
The query param variant is required for SSE and WebSocket connections where
the browser EventSource API cannot set Authorization headers.
"""
import logging
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Optional
import jwt
from pydantic import ValidationError

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import TokenPayload
from app.repositories.user import UserRepository

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def _user_from_token(token: str, session: AsyncSession) -> User:
    """Shared token → User lookup. Raises 401 on any failure."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        if token_data.sub is None:
            raise credentials_exception
    except (jwt.PyJWTError, ValidationError):
        raise credentials_exception

    user = await UserRepository.get_by_email(session, email=token_data.sub)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Standard Bearer-token auth for normal HTTP endpoints."""
    return await _user_from_token(token, session)


async def get_current_user_ws(
    session: Annotated[AsyncSession, Depends(get_db)],
    token: Optional[str] = Query(default=None, alias="token"),
) -> User:
    """
    Phase 12: Token-via-query-param auth for SSE endpoints.

    EventSource in browsers cannot set custom headers, so the JWT is passed
    as ?token=<jwt> in the query string. The backend validates it identically
    to Bearer auth.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token. Pass ?token=<jwt> for SSE connections.",
        )
    return await _user_from_token(token, session)
