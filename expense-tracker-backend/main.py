from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from db import engine, create_db_and_tables
from models import Expense

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