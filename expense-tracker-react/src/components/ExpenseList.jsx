import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expenses, onDeleteExpense, onEditExpense }) {
    const sortedExpenses = [...expenses].sort((a, b) => {
        if (b.date !== a.date) {
            return b.date.localeCompare(a.date);
        }
        return String(b.id).localeCompare(String(a.id));
    });

    if (sortedExpenses.length === 0) {
        return (
            <div className="expense-list-wrapper">
                <ul className="expense-list">
                    <li className="expense-item placeholder-item">No expenses yet.</li>
                </ul>
            </div>
        );
    }

    return (
        <div className="expense-list-wrapper">
            <ul className="expense-list">
                {sortedExpenses.map((expense) => (
                    <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onDeleteExpense={onDeleteExpense}
                        onEditExpense={onEditExpense}
                    />
                ))}
            </ul>
        </div>
    );
}

export default ExpenseList;