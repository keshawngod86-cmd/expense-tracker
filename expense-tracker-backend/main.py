from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    id: str
    title: str
    category: str
    amount: float
    date: str
    description: str = ""

expenses = []

@app.get("/")
def read_root():
    return {"message": "Expense Tracker API is running"}

@app.get("/expenses")
def get_expenses():
    return expenses

@app.post("/expenses")
def create_expense(expense: Expense):
    expenses.append(expense)
    return expense

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    global expenses
    original_length = len(expenses)
    expenses = [expense for expense in expenses if expense.id != expense_id]

    if len(expenses) == original_length:
        raise HTTPException(status_code=404, detail="Expense not found")

    return {"message": "Expense deleted successfully"}

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: str, updated_expense: Expense):
    for index, expense in enumerate(expenses):
        if expense.id == expense_id:
            expenses[index] = updated_expense
            return updated_expense

    raise HTTPException(status_code=404, detail="Expense not found")