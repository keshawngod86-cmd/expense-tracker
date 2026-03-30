import { useEffect, useState } from "react";
import "./App.css";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import Trend from "./components/Trend";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
    const [expenses, setExpenses] = useState([]);

    const [editingExpense, setEditingExpense] = useState(null);

    async function fetchExpenses() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    }

    async function addExpense(expense) {
        console.log("addExpense called", expense);

        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expense),
            });

            console.log("POST response", response.status);

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            await fetchExpenses();
        } catch (error) {
            console.error("addExpense error:", error);
        }
    }

    async function deleteExpense(id) {
        console.log("deleteExpense called", id);

        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: "DELETE",
            });

            console.log("DELETE response", response.status);

            if (!response.ok) {
                throw new Error("Failed to delete expense");
            }

            await fetchExpenses();
        } catch (error) {
            console.error("deleteExpense error:", error);
        }
    }

    function startEditExpense(id) {
        const expenseToEdit = expenses.find((expense) => expense.id === id);
        if (!expenseToEdit) return;

        setEditingExpense(expenseToEdit);
        setExpenses(expenses.filter((expense) => expense.id !== id));
    }

    function clearEditingExpense() {
        setEditingExpense(null);
    }

    return (
        <>
            <header className="site-header">
                <h1>Expense Tracker</h1>
                <p>Track your daily spending in a simple way</p>
            </header>

            <main className="container">
                <section className="card">
                    <h2>Add New Expense</h2>
                    <ExpenseForm
                        onAddExpense={addExpense}
                        editingExpense={editingExpense}
                        onFinishEdit={clearEditingExpense}
                    />
                </section>

                <section className="card">
                    <h2>Expense List</h2>
                    <ExpenseList
                        expenses={expenses}
                        onDeleteExpense={deleteExpense}
                        onEditExpense={startEditExpense}
                    />
                </section>

                <section className="card">
                    <h2>Category Summary</h2>
                    <Summary expenses={expenses} />
                </section>

                <section className="card">
                    <h2>Monthly Trend</h2>
                    <Trend expenses={expenses} />
                </section>
            </main>

            <footer className="site-footer">
                <p>Built with React for Internet Programming practice</p>
            </footer>
        </>
    );
}

export default App;