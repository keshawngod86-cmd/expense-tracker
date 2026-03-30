from typing import Optional
from sqlmodel import SQLModel, Field

class Expense(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    category: str
    amount: float
    date: str
    description: Optional[str] = ""