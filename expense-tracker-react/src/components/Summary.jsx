function Summary({ expenses }) {
    let total = 0;
    const categoryTotals = {};

    const categoryIcons = {
        Food: "🍔",
        Transport: "🚗",
        Shopping: "🛍️",
        Bills: "💡",
        Entertainment: "🎮",
        Other: "📦",
    };

    expenses.forEach((expense) => {
        total += expense.amount;

        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += expense.amount;
    });

    return (
        <>
            <div className="summary-box">
                {Object.keys(categoryTotals).length === 0 ? (
                    <p>No data yet.</p>
                ) : (
                    Object.keys(categoryTotals).map((category) => (
                        <div className="summary-row" key={category}>
                            <span>
                                {categoryIcons[category] || "📌"} {category}
                            </span>
                            <strong>${categoryTotals[category].toFixed(2)}</strong>
                        </div>
                    ))
                )}
            </div>

            <h3 className="total-spending-text">
                Total Spending: <span id="total-spending">${total.toFixed(2)}</span>
            </h3>
        </>
    );
}

export default Summary;