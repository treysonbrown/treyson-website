from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from decouple import config

from sqlalchemy.exc import OperationalError

from app.database import get_db
from models import WorkLogEntry, User
from app.auth import CurrentUser, get_current_user, get_optional_user

ALLOWED_WORKLOG_USER_ID = config(
    "ALLOWED_WORKLOG_USER_ID",
    default="5dc7d990-4e98-4e92-9033-316ad9fd9af7",
)

router = APIRouter(prefix="/work-log", tags=["work-log"])


def normalize_optional_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


class WorkLogCreate(BaseModel):
    work_date: date
    hours: float = Field(ge=0, description="Hours worked for the day")
    description: Optional[str] = None
    tag: Optional[str] = Field(
        default=None,
        description="Optional label or category for the entry",
    )


class WorkLogResponse(BaseModel):
    id: int
    work_date: date
    hours: float
    description: Optional[str]
    user_id: Optional[str]
    tag: Optional[str]


class WorkLogBulkCreate(BaseModel):
    entries: List[WorkLogCreate] = Field(
        ...,
        min_items=1,
        description="Batch of work log items to create",
    )


def ensure_user_record(db: Session, current_user: CurrentUser) -> User:
    try:
        user = db.get(User, current_user.id)
    except OperationalError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach the database. Please try again shortly.",
        ) from exc

    if user:
        return user

    user = User(
        id=current_user.id,
        email=current_user.email,
        name=current_user.email,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def apply_date_filters(statement, start_date: Optional[date], end_date: Optional[date]):
    if start_date:
        statement = statement.where(WorkLogEntry.work_date >= start_date)
    if end_date:
        statement = statement.where(WorkLogEntry.work_date <= end_date)
    return statement


@router.get("/", response_model=List[WorkLogResponse])
def list_work_log_entries(
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Optional[CurrentUser] = Depends(get_optional_user),
):
    if current_user and current_user.id == ALLOWED_WORKLOG_USER_ID:
        ensure_user_record(db, current_user)

    statement = select(WorkLogEntry).where(WorkLogEntry.user_id == ALLOWED_WORKLOG_USER_ID)
    statement = apply_date_filters(statement, start_date, end_date)
    results = db.exec(statement).all()
    return results


@router.post("/", response_model=WorkLogResponse, status_code=201)
def create_work_log_entry(
    payload: WorkLogCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    if current_user.id != ALLOWED_WORKLOG_USER_ID:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    ensure_user_record(db, current_user)
    entry = WorkLogEntry(
        work_date=payload.work_date,
        hours=payload.hours,
        description=normalize_optional_text(payload.description),
        user_id=current_user.id,
        tag=normalize_optional_text(payload.tag),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
def delete_work_log_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    if current_user.id != ALLOWED_WORKLOG_USER_ID:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    ensure_user_record(db, current_user)
    entry = db.get(WorkLogEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Work log entry not found")
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Work log entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}


@router.post("/bulk", response_model=List[WorkLogResponse], status_code=201)
def create_work_log_entries_bulk(
    payload: WorkLogBulkCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Create multiple work log entries in a single transaction."""
    if current_user.id != ALLOWED_WORKLOG_USER_ID:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    ensure_user_record(db, current_user)
    new_entries = [
        WorkLogEntry(
            work_date=entry.work_date,
            hours=entry.hours,
            description=normalize_optional_text(entry.description),
            user_id=current_user.id,
            tag=normalize_optional_text(entry.tag),
        )
        for entry in payload.entries
    ]

    try:
        db.add_all(new_entries)
        db.commit()
    except Exception as exc:  # pragma: no cover - defensive rollback
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Failed to create work log entries",
        ) from exc

    for entry in new_entries:
        db.refresh(entry)

    return new_entries
