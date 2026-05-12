import { useState } from "react";

function RegisterPage({ onRegister, onShowLogin }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            await onRegister({
                username: username.trim(),
                email: email.trim(),
                password,
            });
        } catch (error) {
            setErrorMessage(error.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-shell">
                <div className="auth-intro">
                    <p className="auth-kicker">Expense Tracker</p>
                    <h1>Create your account</h1>
                    <p>
                        Register to save expenses, compare spending categories and access
                        your dashboard from one secure account.
                    </p>
                </div>

                <form className="auth-card" onSubmit={handleSubmit}>
                    <div>
                        <h2>Register</h2>
                        <p className="auth-muted">
                            The first registered account becomes the admin account for this
                            project.
                        </p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="registerUsername">Username</label>
                        <input
                            id="registerUsername"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="At least 3 characters"
                            autoComplete="username"
                            required
                            minLength="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="registerEmail">Email</label>
                        <input
                            id="registerEmail"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="name@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="registerPassword">Password</label>
                        <input
                            id="registerPassword"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            required
                            minLength="6"
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
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </button>

                    <p className="auth-switch-text">
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="auth-link-btn"
                            onClick={onShowLogin}
                        >
                            Sign in
                        </button>
                    </p>
                </form>
            </section>
        </main>
    );
}

export default RegisterPage;
