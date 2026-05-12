import { useState } from "react";

function LoginPage({ onLogin, onShowRegister }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await onLogin({
                username: username.trim(),
                password,
            });
        } catch (error) {
            setErrorMessage(error.message || "Login failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-intro">
                    <p className="auth-kicker">Expense Tracker</p>
                    <h1>Welcome back</h1>
                    <p>
                        Sign in to manage expenses, review category summaries and view
                        spending statistics.
                    </p>
                </div>

                <form className="auth-card" onSubmit={handleSubmit}>
                    <div>
                        <h2>Login</h2>
                        <p className="auth-muted">
                            Sign in with an existing account or create a new one.
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="loginUsername">Username</label>
                        <input
                            id="loginUsername"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="Enter username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="loginPassword">Password</label>
                        <input
                            id="loginPassword"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {errorMessage ? (
                        <p className="auth-error" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        className="primary-btn auth-submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>

                    <p className="auth-switch-text">
                        New to the tracker?{" "}
                        <button
                            type="button"
                            className="auth-link-btn"
                            onClick={onShowRegister}
                        >
                            Create account
                        </button>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default LoginPage;
