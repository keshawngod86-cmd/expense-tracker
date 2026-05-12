from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from auth import create_access_token, decode_access_token, hash_password, verify_password
from db import engine, create_db_and_tables
from models import Expense, LoginRequest, RegisterRequest, TokenResponse, User, UserRead

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Expense Tracker API is running"}


def to_user_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
    )


def get_current_user(authorization: str | None) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")

    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    with Session(engine) as session:
        statement = select(User).where(User.username == credentials.username)
        user = session.exec(statement).first()

        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        token = create_access_token(
            {
                "sub": user.username,
                "user_id": user.id,
                "role": user.role,
            }
        )
        return TokenResponse(access_token=token, user=to_user_read(user))


@app.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(account: RegisterRequest):
    username = account.username.strip()
    email = account.email.strip() if account.email else None

    if len(username) < 3:
        raise HTTPException(
            status_code=400,
            detail="Username must be at least 3 characters long",
        )

    if len(account.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long",
        )

    with Session(engine) as session:
        existing_user = session.exec(
            select(User).where(User.username == username)
        ).first()

        if existing_user:
            raise HTTPException(status_code=409, detail="Username already exists")

        user_count = len(session.exec(select(User)).all())
        new_user = User(
            username=username,
            email=email,
            password_hash=hash_password(account.password),
            role="admin" if user_count == 0 else "user",
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        token = create_access_token(
            {
                "sub": new_user.username,
                "user_id": new_user.id,
                "role": new_user.role,
            }
        )
        return TokenResponse(access_token=token, user=to_user_read(new_user))


@app.get("/auth/me", response_model=UserRead)
def read_current_user(authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    return to_user_read(user)

@app.get("/expenses")
def get_expenses():
    with Session(engine) as session:
        statement = select(Expense)
        expenses = session.exec(statement).all()
        return expenses

@app.post("/expenses")
def create_expense(expense: Expense):
    with Session(engine) as session:
        session.add(expense)
        session.commit()
        session.refresh(expense)
        return expense

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)

        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        session.delete(expense)
        session.commit()
        return {"message": "Expense deleted successfully"}

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: str, updated_expense: Expense):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)

        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        expense.title = updated_expense.title
        expense.category = updated_expense.category
        expense.amount = updated_expense.amount
        expense.date = updated_expense.date
        expense.description = updated_expense.description

        session.add(expense)
        session.commit()
        session.refresh(expense)
        return expense
