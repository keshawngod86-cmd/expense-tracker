function Summary({ expenses }) {
    let total = 0;
    const categoryTotals = {};

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
                        <p key={category}>
                            {category}: ${categoryTotals[category].toFixed(2)}
                        </p>
                    ))
                )}
            </div>

            <h3>Total Spending: <span id="total-spending">${total.toFixed(2)}</span></h3>
        </>
    );
}

export default Summary;