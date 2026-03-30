import { useEffect, useState } from "react";
import "./App.css";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import Trend from "./components/Trend";

function App() {
    const [expenses, setExpenses] = useState(() => {
        return JSON.parse(localStorage.getItem("expenses")) || [];
    });

    const [editingExpense, setEditingExpense] = useState(null);

    useEffect(() => {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }, [expenses]);

    function addExpense(expense) {
        setExpenses([...expenses, expense]);
    }

    function deleteExpense(id) {
        const updatedExpenses = expenses.filter((expense) => expense.id !== id);
        setExpenses(updatedExpenses);
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