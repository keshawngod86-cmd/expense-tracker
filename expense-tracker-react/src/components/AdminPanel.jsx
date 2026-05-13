import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateTime(value) {
    if (!value) return "Unknown";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function getInitials(username) {
    return username
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function getAvatarStyle(username) {
    const hue = [...username].reduce((total, char) => total + char.charCodeAt(0), 0) % 360;
    return {
        background: `linear-gradient(135deg, hsl(${hue} 84% 58%), hsl(${
            (hue + 42) % 360
        } 78% 48%))`,
    };
}

function AdminPanel({ apiBaseUrl, authToken, currentUser }) {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [activeSearchText, setActiveSearchText] = useState("");
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
            setSelectedUserId((existingId) => {
                if (usersData.some((user) => user.id === existingId)) {
                    return existingId;
                }

                return usersData[0]?.id || null;
            });
        } catch (error) {
            setErrorMessage(error.message || "Failed to load admin data.");
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl, authHeaders]);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    const selectedUser = useMemo(() => {
        return users.find((user) => user.id === selectedUserId) || users[0] || null;
    }, [users, selectedUserId]);

    const filteredUsers = useMemo(() => {
        const search = activeSearchText.trim().toLowerCase();
        if (!search) return users;

        return users.filter((user) => {
            return (
                user.username.toLowerCase().includes(search) ||
                (user.email || "").toLowerCase().includes(search) ||
                user.role.toLowerCase().includes(search)
            );
        });
    }, [users, activeSearchText]);

    const selectedUserActivities = useMemo(() => {
        if (!selectedUser) return [];

        return activities.filter((activity) => {
            return (
                activity.user_id === selectedUser.id ||
                (!activity.user_id && activity.username === selectedUser.username)
            );
        });
    }, [activities, selectedUser]);

    const selectedUserCreatedRecords = useMemo(() => {
        return selectedUserActivities.filter(
            (activity) => activity.action === "create_expense"
        );
    }, [selectedUserActivities]);

    function handleSearchSubmit(event) {
        event.preventDefault();
        setActiveSearchText(searchText);
    }

    function clearSearch() {
        setSearchText("");
        setActiveSearchText("");
    }

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
                        <h3>User List</h3>
                        <span>{filteredUsers.length} shown</span>
                    </div>

                    <form className="admin-search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="search"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search user, email or role"
                            aria-label="Search users"
                        />
                        <button type="submit" className="secondary-btn admin-search-btn">
                            Search
                        </button>
                        {activeSearchText ? (
                            <button
                                type="button"
                                className="admin-clear-search-btn"
                                onClick={clearSearch}
                            >
                                Clear
                            </button>
                        ) : null}
                    </form>

                    <div className="admin-user-list" aria-label="Registered users">
                        {filteredUsers.length === 0 ? (
                            <p className="admin-empty-text">No matching users.</p>
                        ) : (
                            filteredUsers.map((user) => {
                                const isCurrentUser = user.id === currentUser.id;
                                const isSelected = selectedUser?.id === user.id;

                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        className={`admin-user-card ${
                                            isSelected ? "is-selected" : ""
                                        }`}
                                        onClick={() => setSelectedUserId(user.id)}
                                    >
                                        <span
                                            className="admin-avatar"
                                            style={getAvatarStyle(user.username)}
                                        >
                                            {getInitials(user.username) || "U"}
                                        </span>
                                        <span className="admin-user-card-body">
                                            <strong>{user.username}</strong>
                                            <span>{user.email || "No email"}</span>
                                        </span>
                                        <span className="admin-role-pill">{user.role}</span>
                                        {isCurrentUser ? (
                                            <span className="admin-self-tag">You</span>
                                        ) : null}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {selectedUser ? (
                        <section className="admin-user-detail">
                            <div className="admin-detail-heading">
                                <span
                                    className="admin-avatar admin-avatar-large"
                                    style={getAvatarStyle(selectedUser.username)}
                                >
                                    {getInitials(selectedUser.username) || "U"}
                                </span>
                                <div>
                                    <p className="admin-kicker">Selected User</p>
                                    <h3>{selectedUser.username}</h3>
                                </div>
                            </div>

                            <div className="admin-detail-grid">
                                <div>
                                    <span>Name</span>
                                    <strong>{selectedUser.username}</strong>
                                </div>
                                <div>
                                    <span>Email</span>
                                    <strong>{selectedUser.email || "No email"}</strong>
                                </div>
                                <div>
                                    <span>Role</span>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(event) =>
                                            updateUserRole(selectedUser.id, event.target.value)
                                        }
                                        disabled={selectedUser.id === currentUser.id}
                                        aria-label={`Role for ${selectedUser.username}`}
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="admin-detail-actions">
                                <button
                                    type="button"
                                    className="danger-outline-btn"
                                    onClick={() =>
                                        deleteUser(selectedUser.id, selectedUser.username)
                                    }
                                    disabled={selectedUser.id === currentUser.id}
                                >
                                    Delete User
                                </button>
                            </div>

                            <div className="admin-user-records">
                                <div className="admin-panel-header admin-subheader">
                                    <h3>Added Information</h3>
                                    <span>{selectedUserCreatedRecords.length} records</span>
                                </div>

                                {selectedUserCreatedRecords.length === 0 ? (
                                    <p className="admin-empty-text">
                                        No added expense records for this user yet.
                                    </p>
                                ) : (
                                    selectedUserCreatedRecords.map((activity) => (
                                        <article
                                            className="activity-item user-record-item"
                                            key={activity.id}
                                        >
                                            <div>
                                                <strong>{activity.detail || "Added expense"}</strong>
                                                <p>Action: {activity.action}</p>
                                            </div>
                                            <div className="activity-meta">
                                                <span>{activity.username}</span>
                                                <time>{formatDateTime(activity.created_at)}</time>
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </section>
                    ) : null}
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h3>Recent Activity</h3>
                        <span>Latest 500</span>
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
