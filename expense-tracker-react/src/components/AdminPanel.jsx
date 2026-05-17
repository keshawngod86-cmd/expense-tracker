import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateTime(value) {
    if (!value) return "Unknown";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function formatCurrency(value) {
    return Number(value || 0).toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
    });
}

function formatAction(action) {
    return action
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
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
    const [userDetailsById, setUserDetailsById] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [activeSearchText, setActiveSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingUserId, setLoadingUserId] = useState(null);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [mobileDetailTab, setMobileDetailTab] = useState("records");

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
            const usersResponse = await fetch(`${apiBaseUrl}/admin/users`, {
                headers: authHeaders(),
            });

            if (!usersResponse.ok) {
                throw new Error("Failed to load admin data.");
            }

            const usersData = await usersResponse.json();

            setUsers(usersData);
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

    const selectedUserDetails = selectedUser
        ? userDetailsById[selectedUser.id]
        : null;
    const selectedUserExpenses = selectedUserDetails?.expenses || [];
    const selectedUserActivities = selectedUserDetails?.activities || [];
    const isLoadingSelectedUser = selectedUser?.id === loadingUserId;

    useEffect(() => {
        let shouldIgnore = false;

        async function loadSelectedUserDetails() {
            if (!selectedUser) {
                return;
            }

            setLoadingUserId(selectedUser.id);

            try {
                const [expensesResponse, activitiesResponse] = await Promise.all([
                    fetch(`${apiBaseUrl}/admin/users/${selectedUser.id}/expenses`, {
                        headers: authHeaders(),
                    }),
                    fetch(`${apiBaseUrl}/admin/users/${selectedUser.id}/activities`, {
                        headers: authHeaders(),
                    }),
                ]);

                if (!expensesResponse.ok || !activitiesResponse.ok) {
                    throw new Error("Failed to load selected user details.");
                }

                const [expenses, activities] = await Promise.all([
                    expensesResponse.json(),
                    activitiesResponse.json(),
                ]);

                if (!shouldIgnore) {
                    setUserDetailsById((existingDetails) => ({
                        ...existingDetails,
                        [selectedUser.id]: {
                            expenses,
                            activities,
                        },
                    }));
                }
            } catch (error) {
                if (!shouldIgnore) {
                    setErrorMessage(
                        error.message || "Failed to load selected user details."
                    );
                }
            } finally {
                if (!shouldIgnore) {
                    setLoadingUserId(null);
                }
            }
        }

        loadSelectedUserDetails();

        return () => {
            shouldIgnore = true;
        };
    }, [apiBaseUrl, authHeaders, selectedUser]);

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
                <div className="admin-panel admin-users-panel">
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
                                        onClick={() => {
                                            setSelectedUserId(user.id);
                                            setMobileDetailTab("records");
                                        }}
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
                </div>

                <div className="admin-panel admin-detail-panel">
                    {selectedUser ? (
                        <>
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
                                    {isLoadingSelectedUser ? (
                                        <span className="admin-inline-loading">
                                            Updating records...
                                        </span>
                                    ) : null}
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

                            <div
                                className="admin-mobile-detail-tabs"
                                aria-label="Selected user sections"
                            >
                                <button
                                    type="button"
                                    className={mobileDetailTab === "records" ? "is-active" : ""}
                                    aria-pressed={mobileDetailTab === "records"}
                                    onClick={() => setMobileDetailTab("records")}
                                >
                                    Added
                                </button>
                                <button
                                    type="button"
                                    className={mobileDetailTab === "activity" ? "is-active" : ""}
                                    aria-pressed={mobileDetailTab === "activity"}
                                    onClick={() => setMobileDetailTab("activity")}
                                >
                                    Activity
                                </button>
                            </div>

                            <div
                                className={`admin-selected-content admin-mobile-tab-${mobileDetailTab}`}
                            >
                                <section className="admin-user-records">
                                    <div className="admin-panel-header admin-subheader">
                                        <h3>Added Information</h3>
                                        <span>{selectedUserExpenses.length} records</span>
                                    </div>

                                    {!selectedUserDetails && isLoadingSelectedUser ? (
                                        <p className="admin-empty-text">
                                            Loading this user's expense records...
                                        </p>
                                    ) : selectedUserExpenses.length === 0 ? (
                                        <p className="admin-empty-text">
                                            No added expense records for this user yet.
                                        </p>
                                    ) : (
                                        selectedUserExpenses.map((expense) => (
                                            <article
                                                className="activity-item user-record-item"
                                                key={expense.id}
                                            >
                                                <div>
                                                    <strong>
                                                        {expense.title} -{" "}
                                                        {formatCurrency(expense.amount)}
                                                    </strong>
                                                    <p>
                                                        {expense.category} on {expense.date}
                                                        {expense.description
                                                            ? ` - ${expense.description}`
                                                            : ""}
                                                    </p>
                                                </div>
                                                <div className="activity-meta">
                                                    <span>
                                                        {expense.username ||
                                                            selectedUser.username}
                                                    </span>
                                                    <time>
                                                        {formatDateTime(expense.created_at)}
                                                    </time>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </section>

                                <section className="admin-user-activity">
                                    <div className="admin-panel-header admin-subheader">
                                        <h3>User Activity</h3>
                                        <span>{selectedUserActivities.length} events</span>
                                    </div>

                                    {!selectedUserDetails && isLoadingSelectedUser ? (
                                        <p className="admin-empty-text">
                                            Loading this user's activity...
                                        </p>
                                    ) : selectedUserActivities.length === 0 ? (
                                        <p className="admin-empty-text">
                                            No activity recorded for this user yet.
                                        </p>
                                    ) : (
                                        <div className="activity-list user-activity-list">
                                            {selectedUserActivities.map((activity) => (
                                                <article
                                                    className="activity-item"
                                                    key={activity.id}
                                                >
                                                    <div>
                                                        <strong>
                                                            {formatAction(activity.action)}
                                                        </strong>
                                                        <p>{activity.detail || "No detail"}</p>
                                                    </div>
                                                    <div className="activity-meta">
                                                        <span>{activity.username}</span>
                                                        <time>
                                                            {formatDateTime(
                                                                activity.created_at
                                                            )}
                                                        </time>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </>
                    ) : (
                        <p className="admin-empty-text">Select a user to review details.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default AdminPanel;
