function ExpenseItem({ expense, onDeleteExpense, onEditExpense }) {
    return (
        <li className="expense-item">
            <h3>{expense.title}</h3>
            <p><strong>Category:</strong> {expense.category}</p>
            <p><strong>Amount:</strong> ${expense.amount.toFixed(2)}</p>
            <p><strong>Date:</strong> {expense.date}</p>
            <p><strong>Description:</strong> {expense.description || "No description"}</p>

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
        </li>
    );
}

export default ExpenseItem;