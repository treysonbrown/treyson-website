from __future__ import annotations

from functools import lru_cache
from typing import Optional

from decouple import config
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel


class AuthSettings(BaseModel):
    jwt_secret: str
    jwt_audience: Optional[str] = "authenticated"
    jwt_algorithm: str = "HS256"


@lru_cache
def get_auth_settings() -> AuthSettings:
    secret = config("SUPABASE_JWT_SECRET", default=None)
    if not secret:
        raise RuntimeError("SUPABASE_JWT_SECRET is not configured")

    return AuthSettings(
        jwt_secret=secret,
        jwt_audience=config("SUPABASE_JWT_AUDIENCE", default="authenticated"),
        jwt_algorithm=config("SUPABASE_JWT_ALGORITHM", default="HS256"),
    )


bearer_scheme = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials
    settings = get_auth_settings()

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return CurrentUser(
        id=str(user_id),
        email=payload.get("email"),
        role=payload.get("role"),
    )


def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Optional[CurrentUser]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None

    token = credentials.credentials
    settings = get_auth_settings()

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
        )
    except JWTError:
        return None

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        return None

    return CurrentUser(
        id=str(user_id),
        email=payload.get("email"),
        role=payload.get("role"),
    )
