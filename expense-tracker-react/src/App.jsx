import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Summary from "./components/Summary";
import Trend from "./components/Trend";
import CategoryPieChart from "./components/CategoryPieChart";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminPanel from "./components/AdminPanel";
import logoSrc from "./assets/bubble-bill-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const TOKEN_STORAGE_KEY = "expenseTrackerToken";
const USER_STORAGE_KEY = "expenseTrackerUser";
const dashboardTabs = [
    { key: "add", label: "Add" },
    { key: "records", label: "Records" },
    { key: "insights", label: "Insights" },
];

function loadStoredUser() {
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

function App() {
    const [authToken, setAuthToken] = useState(
        () => localStorage.getItem(TOKEN_STORAGE_KEY) || ""
    );
    const [currentUser, setCurrentUser] = useState(loadStoredUser);
    const [authMode, setAuthMode] = useState("login");
    const [activeView, setActiveView] = useState("dashboard");
    const [mobileTab, setMobileTab] = useState("add");
    const [expenses, setExpenses] = useState([]);
    const [isRefreshingExpenses, setIsRefreshingExpenses] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const getAuthHeaders = useCallback(() => {
        return authToken ? { Authorization: `Bearer ${authToken}` } : {};
    }, [authToken]);

    async function handleLogin(credentials) {
        await submitAuthRequest("login", credentials);
    }

    async function handleRegister(account) {
        await submitAuthRequest("register", account);
    }

    async function submitAuthRequest(authPath, payload) {
        const response = await fetch(`${API_BASE_URL}/auth/${authPath}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let message =
                authPath === "register"
                    ? "Registration failed. Please check your details."
                    : "Login failed. Please check your username and password.";

            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    message = errorData.detail;
                }
            } catch {
                // Keep the default message if the API returns non-JSON text.
            }

            throw new Error(message);
        }

        const data = await response.json();
        setAuthToken(data.access_token);
        setCurrentUser(data.user);
        setActiveView("dashboard");
        setMobileTab("add");
        localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }

    async function handleLogout() {
        if (authToken) {
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                });
            } catch (error) {
                console.error("Logout activity was not recorded:", error);
            }
        }

        setAuthToken("");
        setCurrentUser(null);
        setActiveView("dashboard");
        setMobileTab("add");
        setExpenses([]);
        setEditingExpense(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    }

    const fetchExpenses = useCallback(async function fetchExpenses() {
        setIsRefreshingExpenses(true);

        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch expenses");
            }

            const data = await response.json();
            setExpenses(data);
            setLastUpdatedAt(new Date());
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setIsRefreshingExpenses(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        if (currentUser) {
            fetchExpenses();
        }
    }, [currentUser, fetchExpenses]);

    async function addExpense(expense) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(expense),
            });

            if (!response.ok) {
                throw new Error("Failed to add expense");
            }

            await fetchExpenses();
            setMobileTab("records");
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
                        ...getAuthHeaders(),
                    },
                    body: JSON.stringify(updatedExpense),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update expense");
            }

            setEditingExpense(null);
            await fetchExpenses();
            setMobileTab("records");
        } catch (error) {
            console.error("updateExpense error:", error);
            throw error;
        }
    }

    async function deleteExpense(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
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
        setMobileTab("add");
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

    const canViewAdmin = currentUser?.role === "admin";

    if (!currentUser) {
        if (authMode === "register") {
            return (
                <RegisterPage
                    onRegister={handleRegister}
                    onShowLogin={() => setAuthMode("login")}
                    logoSrc={logoSrc}
                />
            );
        }

        return (
            <LoginPage
                onLogin={handleLogin}
                onShowRegister={() => setAuthMode("register")}
                logoSrc={logoSrc}
            />
        );
    }

    return (
        <>
            <header className="site-header">
                <div className="header-content">
                    <div className="brand-lockup">
                        <img src={logoSrc} alt="Bubble Bill logo" className="brand-logo" />
                        <div>
                            <p className="brand-kicker">Track / Manage / Save</p>
                            <h1>Bubble Bill</h1>
                        </div>
                    </div>
                    <p>Track your daily spending in a smarter and cleaner way</p>
                    <div className="header-account">
                        <span>
                            Signed in as <strong>{currentUser.username}</strong>
                            {canViewAdmin ? " (admin)" : ""}
                        </span>
                        <button
                            type="button"
                            className={`header-nav-btn ${
                                activeView === "dashboard" ? "is-active" : ""
                            }`}
                            onClick={() => setActiveView("dashboard")}
                        >
                            Dashboard
                        </button>
                        {canViewAdmin ? (
                            <button
                                type="button"
                                className={`header-nav-btn ${
                                    activeView === "admin" ? "is-active" : ""
                                }`}
                                onClick={() => setActiveView("admin")}
                            >
                                Admin
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {activeView === "admin" && canViewAdmin ? (
                <AdminPanel
                    apiBaseUrl={API_BASE_URL}
                    authToken={authToken}
                    currentUser={currentUser}
                />
            ) : (
                <main className="container dashboard-layout">
                    <div
                        className={`mobile-tab-panel mobile-tab-add ${
                            mobileTab === "add" ? "is-active" : ""
                        }`}
                    >
                        <section className="card card-highlight form-card">
                            <h2>{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
                            <ExpenseForm
                                key={editingExpense ? editingExpense.id : "new-expense"}
                                onAddExpense={addExpense}
                                onUpdateExpense={updateExpense}
                                editingExpense={editingExpense}
                                onFinishEdit={clearEditingExpense}
                            />
                        </section>
                    </div>

                    <div
                        className={`mobile-tab-panel mobile-tab-records ${
                            mobileTab === "records" ? "is-active" : ""
                        }`}
                    >
                        <section className="card filter-card">
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

                        <section className="card list-card">
                            <h2>Expense List</h2>
                            <ExpenseList
                                expenses={filteredExpenses}
                                onDeleteExpense={deleteExpense}
                                onEditExpense={startEditExpense}
                            />
                        </section>
                    </div>

                    <div
                        className={`mobile-tab-panel mobile-tab-insights ${
                            mobileTab === "insights" ? "is-active" : ""
                        }`}
                    >
                        <section className="card summary-card">
                            <h2>Category Summary</h2>
                            <Summary expenses={filteredExpenses} />
                        </section>

                        <section className="card pie-card">
                            <h2>Spending Share</h2>
                            <CategoryPieChart expenses={filteredExpenses} />
                        </section>

                        <section className="card trend-card">
                            <h2>Spending Statistics</h2>
                            <Trend
                                expenses={filteredExpenses}
                                onRefresh={fetchExpenses}
                                isRefreshing={isRefreshingExpenses}
                                lastUpdatedAt={lastUpdatedAt}
                            />
                        </section>
                    </div>
                </main>
            )}

            {activeView === "dashboard" ? (
                <nav className="mobile-bottom-nav" aria-label="Dashboard sections">
                    {dashboardTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`mobile-bottom-btn ${
                                mobileTab === tab.key ? "is-active" : ""
                            }`}
                            onClick={() => setMobileTab(tab.key)}
                            aria-pressed={mobileTab === tab.key}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            ) : null}

            <footer className="site-footer">
                <p>Built with React, FastAPI and MySQL for Internet Programming practice</p>
            </footer>
        </>
    );
}

export default App;
