import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDeleteExpense, onEditExpense }) {
    if (expenses.length === 0) {
        return (
            <ul className="expense-list">
                <li className="expense-item placeholder-item">No expenses yet.</li>
            </ul>
        );
    }

    return (
        <ul className="expense-list">
            {expenses.map((expense) => (
                <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    onDeleteExpense={onDeleteExpense}
                    onEditExpense={onEditExpense}
                />
            ))}
        </ul>
    );
}

export default ExpenseList;