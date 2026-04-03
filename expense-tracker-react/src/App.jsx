import { useEffect, useMemo, useState } from "react";
import "./App.css";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import Trend from "./components/Trend";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

    async function fetchExpenses() {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`);

            if (!response.ok) {
                throw new Error("Failed to fetch expenses");
            }

            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        }
    }

    async function addExpense(expense) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expense),
            });

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            await fetchExpenses();
        } catch (error) {
            console.error("addExpense error:", error);
            throw error;
        }
    }

    async function updateExpense(updatedExpense) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/expenses/${updatedExpense.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedExpense),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update expense");
            }

            setEditingExpense(null);
            await fetchExpenses();
        } catch (error) {
            console.error("updateExpense error:", error);
            throw error;
        }
    }

    async function deleteExpense(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete expense");
            }

            await fetchExpenses();
        } catch (error) {
            console.error("deleteExpense error:", error);
            throw error;
        }
    }

    function startEditExpense(id) {
        const expenseToEdit = expenses.find((expense) => expense.id === id);
        if (!expenseToEdit) return;

        setEditingExpense(expenseToEdit);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function clearEditingExpense() {
        setEditingExpense(null);
    }

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const matchesSearch =
                expense.title.toLowerCase().includes(searchText.toLowerCase()) ||
                expense.description.toLowerCase().includes(searchText.toLowerCase());

            const matchesCategory =
                categoryFilter === "All" || expense.category === categoryFilter;

            const matchesStartDate =
                !startDateFilter || expense.date >= startDateFilter;

            const matchesEndDate = !endDateFilter || expense.date <= endDateFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [expenses, searchText, categoryFilter, startDateFilter, endDateFilter]);

    return (
        <>
            <header className="site-header">
                <div className="header-content">
                    <h1>Expense Tracker</h1>
                    <p>Track your daily spending in a smarter and cleaner way</p>
                </div>
            </header>

            <main className="container">
                <section className="card card-highlight">
                    <h2>{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
                    <ExpenseForm
                        onAddExpense={addExpense}
                        onUpdateExpense={updateExpense}
                        editingExpense={editingExpense}
                        onFinishEdit={clearEditingExpense}
                    />
                </section>

                <section className="card">
                    <h2>Search & Filter</h2>

                    <div className="filter-grid">
                        <div className="form-group">
                            <label htmlFor="searchText">Search</label>
                            <input
                                id="searchText"
                                type="text"
                                placeholder="Search title or description"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoryFilter">Category</label>
                            <select
                                id="categoryFilter"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Bills">Bills</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="startDateFilter">Start Date</label>
                            <input
                                id="startDateFilter"
                                type="date"
                                value={startDateFilter}
                                onChange={(e) => setStartDateFilter(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDateFilter">End Date</label>
                            <input
                                id="endDateFilter"
                                type="date"
                                value={endDateFilter}
                                onChange={(e) => setEndDateFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                            setSearchText("");
                            setCategoryFilter("All");
                            setStartDateFilter("");
                            setEndDateFilter("");
                        }}
                    >
                        Clear Filters
                    </button>
                </section>

                <section className="card">
                    <h2>Expense List</h2>
                    <ExpenseList
                        expenses={filteredExpenses}
                        onDeleteExpense={deleteExpense}
                        onEditExpense={startEditExpense}
                    />
                </section>

                <section className="card">
                    <h2>Category Summary</h2>
                    <Summary expenses={filteredExpenses} />
                </section>

                <section className="card">
                    <h2>Monthly Trend</h2>
                    <Trend expenses={filteredExpenses} />
                </section>
            </main>

            <footer className="site-footer">
                <p>Built with React, FastAPI and MySQL for Internet Programming practice</p>
            </footer>
        </>
    );
}

export default App;