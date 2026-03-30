function ExpenseItem({ expense, onDeleteExpense, onEditExpense }) {
    const categoryConfig = {
        Food: { icon: "🍔", className: "tag-food" },
        Transport: { icon: "🚗", className: "tag-transport" },
        Shopping: { icon: "🛍️", className: "tag-shopping" },
        Bills: { icon: "💡", className: "tag-bills" },
        Entertainment: { icon: "🎮", className: "tag-entertainment" },
        Other: { icon: "📦", className: "tag-other" },
    };

    const currentCategory = categoryConfig[expense.category] || {
        icon: "📌",
        className: "tag-other",
    };

    return (
        <li className="expense-item modern-item">
            <div className="expense-top">
                <div>
                    <h3>{expense.title}</h3>
                    <span className={`category-tag ${currentCategory.className}`}>
                        {currentCategory.icon} {expense.category}
                    </span>
                </div>

                <div className="expense-amount">${expense.amount.toFixed(2)}</div>
            </div>

            <div className="expense-meta">
                <p><strong>Date:</strong> {expense.date}</p>
                <p><strong>Description:</strong> {expense.description || "No description"}</p>
            </div>

            <div className="action-row">
                <button
                    type="button"
                    className="edit-btn"
                    onClick={() => onEditExpense(expense.id)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    className="delete-btn"
                    onClick={() => onDeleteExpense(expense.id)}
                >
                    Delete
                </button>
            </div>
        </li>
    );
}

export default ExpenseItem;