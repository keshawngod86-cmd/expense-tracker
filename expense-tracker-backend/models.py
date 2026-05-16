from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


class Expense(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    category: str
    amount: float
    date: str
    description: Optional[str] = ""
    user_id: Optional[int] = Field(default=None, index=True)
    username: Optional[str] = Field(default=None, index=True)
    created_at: str = Field(default_factory=utc_timestamp)
    updated_at: str = Field(default_factory=utc_timestamp)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: Optional[str] = None
    password_hash: str
    role: str = "user"
    created_at: str = Field(default_factory=utc_timestamp)


class UserActivity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, index=True)
    username: str
    action: str
    detail: str = ""
    created_at: str = Field(default_factory=utc_timestamp)


class LoginRequest(SQLModel):
    username: str
    password: str


class RegisterRequest(SQLModel):
    username: str
    email: Optional[str] = None
    password: str


class RoleUpdateRequest(SQLModel):
    role: str


class UserRead(SQLModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    created_at: str = ""


class UserActivityRead(SQLModel):
    id: int
    user_id: Optional[int] = None
    username: str
    action: str
    detail: str
    created_at: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
