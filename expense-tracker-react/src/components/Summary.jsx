const incomeKeywords = [
    "income",
    "salary",
    "allowance",
    "refund",
    "reimbursement",
];

function formatCurrency(value) {
    return `$${Number(value).toFixed(2)}`;
}

function isIncomeEntry(expense) {
    const categoryName = expense.category.toLowerCase();
    return (
        expense.amount < 0 ||
        incomeKeywords.some((keyword) => categoryName.includes(keyword))
    );
}

function sortTotalsDescending(totals) {
    return Object.entries(totals).sort(([, amountA], [, amountB]) => amountB - amountA);
}

function Summary({ expenses }) {
    let totalSpending = 0;
    let totalIncome = 0;
    const expenseCategoryTotals = {};
    const incomeCategoryTotals = {};

    const categoryIcons = {
        Food: "🍔",
        Transport: "🚗",
        Shopping: "🛍️",
        Bills: "💡",
        Entertainment: "🎮",
        Other: "📦",
        Income: "💰",
        Salary: "💰",
        Allowance: "💰",
        Refund: "↩️",
    };

    expenses.forEach((expense) => {
        const amount = Math.abs(expense.amount);

        if (isIncomeEntry(expense)) {
            totalIncome += amount;

            if (!incomeCategoryTotals[expense.category]) {
                incomeCategoryTotals[expense.category] = 0;
            }

            incomeCategoryTotals[expense.category] += amount;
            return;
        }

        totalSpending += amount;

        if (!expenseCategoryTotals[expense.category]) {
            expenseCategoryTotals[expense.category] = 0;
        }

        expenseCategoryTotals[expense.category] += amount;
    });

    const expenseRows = sortTotalsDescending(expenseCategoryTotals);
    const incomeRows = sortTotalsDescending(incomeCategoryTotals);

    return (
        <>
            <div className="summary-box">
                <h3 className="summary-section-title">Expense Categories</h3>

                {expenseRows.length === 0 ? (
                    <p>No data yet.</p>
                ) : (
                    expenseRows.map(([category, amount]) => (
                        <div className="summary-row" key={category}>
                            <span>
                                {categoryIcons[category] || "📌"} {category}
                            </span>
                            <strong className="summary-expense-amount">
                                {formatCurrency(amount)}
                            </strong>
                        </div>
                    ))
                )}

                {incomeRows.length > 0 ? (
                    <div className="income-summary-block">
                        <h3 className="summary-section-title">Income Categories</h3>

                        {incomeRows.map(([category, amount]) => (
                            <div className="summary-row income-row" key={category}>
                                <span>
                                    {categoryIcons[category] || "💰"} {category}
                                </span>
                                <strong className="summary-income-amount">
                                    {formatCurrency(amount)}
                                </strong>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <h3 className="total-spending-text">
                Total Spending:{" "}
                <span id="total-spending">{formatCurrency(totalSpending)}</span>
            </h3>

            {incomeRows.length > 0 ? (
                <h3 className="total-income-text">
                    Total Income: <span>{formatCurrency(totalIncome)}</span>
                </h3>
            ) : null}
        </>
    );
}

export default Summary;
