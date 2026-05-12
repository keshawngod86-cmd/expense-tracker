import { useCallback, useEffect, useState } from "react";

function formatDateTime(value) {
    if (!value) return "Unknown";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function AdminPanel({ apiBaseUrl, authToken, currentUser }) {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const authHeaders = useCallback(
        () => ({
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        }),
        [authToken]
    );

    const loadAdminData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [usersResponse, activitiesResponse] = await Promise.all([
                fetch(`${apiBaseUrl}/admin/users`, {
                    headers: authHeaders(),
                }),
                fetch(`${apiBaseUrl}/admin/activities`, {
                    headers: authHeaders(),
                }),
            ]);

            if (!usersResponse.ok || !activitiesResponse.ok) {
                throw new Error("Failed to load admin data.");
            }

            const [usersData, activitiesData] = await Promise.all([
                usersResponse.json(),
                activitiesResponse.json(),
            ]);

            setUsers(usersData);
            setActivities(activitiesData);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load admin data.");
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl, authHeaders]);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    async function updateUserRole(userId, nextRole) {
        setMessage("");
        setErrorMessage("");

        try {
            const response = await fetch(`${apiBaseUrl}/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ role: nextRole }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update user role.");
            }

            setMessage("User role updated.");
            await loadAdminData();
        } catch (error) {
            setErrorMessage(error.message || "Failed to update user role.");
        }
    }

    async function deleteUser(userId, username) {
        setMessage("");
        setErrorMessage("");

        const shouldDelete = window.confirm(`Delete user "${username}"?`);
        if (!shouldDelete) return;

        try {
            const response = await fetch(`${apiBaseUrl}/admin/users/${userId}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete user.");
            }

            setMessage("User deleted.");
            await loadAdminData();
        } catch (error) {
            setErrorMessage(error.message || "Failed to delete user.");
        }
    }

    return (
        <main className="container admin-page">
            <section className="admin-hero">
                <div>
                    <p className="admin-kicker">Admin Console</p>
                    <h2>User Management</h2>
                    <p>
                        Manage registered accounts and review recent login, logout and
                        expense activity.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-btn admin-refresh-btn"
                    onClick={loadAdminData}
                    disabled={isLoading}
                >
                    {isLoading ? "Refreshing..." : "Refresh Admin Data"}
                </button>
            </section>

            {message ? <p className="admin-success">{message}</p> : null}
            {errorMessage ? <p className="admin-error">{errorMessage}</p> : null}

            <section className="admin-layout">
                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h3>Registered Users</h3>
                        <span>{users.length} accounts</span>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => {
                                    const isCurrentUser = user.id === currentUser.id;

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <strong>{user.username}</strong>
                                                {isCurrentUser ? (
                                                    <span className="admin-self-tag">You</span>
                                                ) : null}
                                            </td>
                                            <td>{user.email || "No email"}</td>
                                            <td>
                                                <select
                                                    value={user.role}
                                                    onChange={(event) =>
                                                        updateUserRole(
                                                            user.id,
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={isCurrentUser}
                                                    aria-label={`Role for ${user.username}`}
                                                >
                                                    <option value="user">user</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="danger-outline-btn"
                                                    onClick={() =>
                                                        deleteUser(user.id, user.username)
                                                    }
                                                    disabled={isCurrentUser}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h3>Recent Activity</h3>
                        <span>Latest 100</span>
                    </div>

                    <div className="activity-list">
                        {activities.length === 0 ? (
                            <p className="admin-empty-text">No activity recorded yet.</p>
                        ) : (
                            activities.map((activity) => (
                                <article className="activity-item" key={activity.id}>
                                    <div>
                                        <strong>{activity.action}</strong>
                                        <p>{activity.detail || "No detail"}</p>
                                    </div>
                                    <div className="activity-meta">
                                        <span>{activity.username}</span>
                                        <time>{formatDateTime(activity.created_at)}</time>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AdminPanel;
