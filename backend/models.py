from datetime import UTC, date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
  return datetime.now(tz=UTC)


class User(SQLModel, table=True):
    """Represents a single human tracking work."""

    id: str | None = Field(default=None, primary_key=True)
    name: Optional[str] = None
    email: Optional[str] = None


class WorkLogEntry(SQLModel, table=True):
    """Tracks an amount of time worked on a specific date with optional notes."""

    id: int | None = Field(default=None, primary_key=True)
    work_date: date = Field(index=True)
    hours: float = Field(ge=0)
    description: str | None = None
    user_id: Optional[str] = Field(default=None, foreign_key="user.id", index=True)
    tag: str | None = None
