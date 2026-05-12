from typing import Optional
from sqlmodel import SQLModel, Field


class Expense(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    category: str
    amount: float
    date: str
    description: Optional[str] = ""


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: Optional[str] = None
    password_hash: str
    role: str = "user"


class LoginRequest(SQLModel):
    username: str
    password: str


class RegisterRequest(SQLModel):
    username: str
    email: Optional[str] = None
    password: str


class UserRead(SQLModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
