from datetime import datetime, timezone

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from auth import create_access_token, decode_access_token, hash_password, verify_password
from db import engine, create_db_and_tables
from models import (
    Expense,
    LoginRequest,
    RegisterRequest,
    RoleUpdateRequest,
    TokenResponse,
    User,
    UserActivity,
    UserActivityRead,
    UserRead,
)

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


def to_activity_read(activity: UserActivity) -> UserActivityRead:
    return UserActivityRead(
        id=activity.id,
        user_id=activity.user_id,
        username=activity.username,
        action=activity.action,
        detail=activity.detail,
        created_at=activity.created_at,
    )


def log_activity(
    session: Session,
    user: User | None,
    action: str,
    detail: str = "",
    username: str | None = None,
):
    activity = UserActivity(
        user_id=user.id if user else None,
        username=user.username if user else username or "anonymous",
        action=action,
        detail=detail,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    session.add(activity)


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


def get_optional_user(authorization: str | None) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_access_token(token)

    if not payload:
        return None

    user_id = payload.get("user_id")

    with Session(engine) as session:
        return session.get(User, user_id)


def require_admin(authorization: str | None) -> User:
    user = get_current_user(authorization)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@app.post("/auth/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    with Session(engine) as session:
        statement = select(User).where(User.username == credentials.username)
        user = session.exec(statement).first()

        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        log_activity(session, user, "login", "User signed in")
        session.commit()

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

        log_activity(
            session,
            new_user,
            "register",
            f"Account created with role {new_user.role}",
        )
        session.commit()

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


@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    with Session(engine) as session:
        session_user = session.get(User, user.id)
        log_activity(session, session_user, "logout", "User signed out")
        session.commit()
    return {"message": "Logged out successfully"}


@app.get("/admin/users", response_model=list[UserRead])
def get_admin_users(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    with Session(engine) as session:
        users = session.exec(select(User).order_by(User.id)).all()
        return [to_user_read(user) for user in users]


@app.patch("/admin/users/{user_id}/role", response_model=UserRead)
def update_user_role(
    user_id: int,
    role_update: RoleUpdateRequest,
    authorization: str | None = Header(default=None),
):
    admin_user = require_admin(authorization)
    requested_role = role_update.role.strip().lower()

    if requested_role not in {"admin", "user"}:
        raise HTTPException(status_code=400, detail="Role must be admin or user")

    with Session(engine) as session:
        target_user = session.get(User, user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        if target_user.id == admin_user.id and target_user.role == "admin" and requested_role != "admin":
            raise HTTPException(status_code=400, detail="You cannot demote yourself")

        target_user.role = requested_role
        session.add(target_user)
        log_activity(
            session,
            session.get(User, admin_user.id),
            "admin_update_role",
            f"Changed {target_user.username} to {requested_role}",
        )
        session.commit()
        session.refresh(target_user)
        return to_user_read(target_user)


@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, authorization: str | None = Header(default=None)):
    admin_user = require_admin(authorization)

    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    with Session(engine) as session:
        target_user = session.get(User, user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        deleted_username = target_user.username
        session.delete(target_user)
        log_activity(
            session,
            session.get(User, admin_user.id),
            "admin_delete_user",
            f"Deleted user {deleted_username}",
        )
        session.commit()
        return {"message": "User deleted successfully"}


@app.get("/admin/activities", response_model=list[UserActivityRead])
def get_admin_activities(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    with Session(engine) as session:
        activities = session.exec(
            select(UserActivity).order_by(UserActivity.id.desc()).limit(100)
        ).all()
        return [to_activity_read(activity) for activity in activities]


@app.get("/expenses")
def get_expenses():
    with Session(engine) as session:
        statement = select(Expense)
        expenses = session.exec(statement).all()
        return expenses

@app.post("/expenses")
def create_expense(expense: Expense, authorization: str | None = Header(default=None)):
    with Session(engine) as session:
        session.add(expense)
        user = get_optional_user(authorization)
        log_activity(
            session,
            user,
            "create_expense",
            f"Created expense {expense.title} for ${expense.amount:.2f}",
        )
        session.commit()
        session.refresh(expense)
        return expense

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, authorization: str | None = Header(default=None)):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)

        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        user = get_optional_user(authorization)
        log_activity(
            session,
            user,
            "delete_expense",
            f"Deleted expense {expense.title} for ${expense.amount:.2f}",
        )
        session.delete(expense)
        session.commit()
        return {"message": "Expense deleted successfully"}

@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: str,
    updated_expense: Expense,
    authorization: str | None = Header(default=None),
):
    with Session(engine) as session:
        expense = session.get(Expense, expense_id)

        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        expense.title = updated_expense.title
        expense.category = updated_expense.category
        expense.amount = updated_expense.amount
        expense.date = updated_expense.date
        expense.description = updated_expense.description

        user = get_optional_user(authorization)
        session.add(expense)
        log_activity(
            session,
            user,
            "update_expense",
            f"Updated expense {expense.title} for ${expense.amount:.2f}",
        )
        session.commit()
        session.refresh(expense)
        return expense
