function Trend({ expenses }) {
    const monthlyTotals = {};

    expenses.forEach((expense) => {
        const month = expense.date.slice(0, 7);

        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }

        monthlyTotals[month] += expense.amount;
    });

    return (
        <div className="trend-box">
            {Object.keys(monthlyTotals).length === 0 ? (
                <p>No data yet.</p>
            ) : (
                Object.keys(monthlyTotals).map((month) => (
                    <p key={month}>
                        {month}: ${monthlyTotals[month].toFixed(2)}
                    </p>
                ))
            )}
        </div>
    );
}

export default Trend;