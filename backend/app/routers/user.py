from uuid import uuid4
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.database import get_db
from models import User

router = APIRouter(prefix="/users", tags=["users"])


class UserCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: str
    name: Optional[str]
    email: Optional[str]

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users."""
    statement = select(User)
    users = db.exec(statement).all()
    return users


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Retrieve a single user by ID."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Create a new user.

    If you don't care about multiple identities yet, you can create a single user
    record and reuse its ID whenever you associate work log entries.
    """
    user = User(
        id=str(uuid4()),
        name=payload.name,
        email=str(payload.email) if payload.email is not None else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """Delete a user.

    Existing work log entries will remain, but their user_id will be set to NULL
    because of the foreign key definition.
    """
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
