import { useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const categoryConfig = {
    Food: { icon: "🍔", bgClass: "trend-tag-food" },
    Transport: { icon: "🚗", bgClass: "trend-tag-transport" },
    Shopping: { icon: "🛍️", bgClass: "trend-tag-shopping" },
    Bills: { icon: "💡", bgClass: "trend-tag-bills" },
    Entertainment: { icon: "🎮", bgClass: "trend-tag-entertainment" },
    Other: { icon: "📦", bgClass: "trend-tag-other" },
};

function getHeatColor(value, min, max) {
    if (max === min) {
        return {
            background: "rgba(251, 191, 36, 0.65)",
            border: "rgba(217, 119, 6, 1)",
        };
    }

    const ratio = (value - min) / (max - min);

    if (ratio <= 0.2) {
        return {
            background: "rgba(187, 247, 208, 0.85)",
            border: "rgba(34, 197, 94, 1)",
        };
    }
    if (ratio <= 0.4) {
        return {
            background: "rgba(134, 239, 172, 0.85)",
            border: "rgba(22, 163, 74, 1)",
        };
    }
    if (ratio <= 0.6) {
        return {
            background: "rgba(253, 224, 71, 0.85)",
            border: "rgba(202, 138, 4, 1)",
        };
    }
    if (ratio <= 0.8) {
        return {
            background: "rgba(251, 146, 60, 0.85)",
            border: "rgba(234, 88, 12, 1)",
        };
    }

    return {
        background: "rgba(248, 113, 113, 0.9)",
        border: "rgba(220, 38, 38, 1)",
    };
}

function Trend({ expenses }) {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const monthlyTotals = useMemo(() => {
        const totals = {};

        expenses.forEach((expense) => {
            const month = expense.date.slice(0, 7);
            if (!totals[month]) totals[month] = 0;
            totals[month] += expense.amount;
        });

        return totals;
    }, [expenses]);

    const selectedMonthExpenses = useMemo(() => {
        if (!selectedMonth) return [];
        return expenses.filter((expense) => expense.date.startsWith(selectedMonth));
    }, [expenses, selectedMonth]);

    const dailyTotals = useMemo(() => {
        const totals = {};

        selectedMonthExpenses.forEach((expense) => {
            if (!totals[expense.date]) totals[expense.date] = 0;
            totals[expense.date] += expense.amount;
        });

        return totals;
    }, [selectedMonthExpenses]);

    const categoryTotalsForSelectedMonth = useMemo(() => {
        const totals = {};

        selectedMonthExpenses.forEach((expense) => {
            if (!totals[expense.category]) totals[expense.category] = 0;
            totals[expense.category] += expense.amount;
        });

        return totals;
    }, [selectedMonthExpenses]);

    const selectedDayExpenses = useMemo(() => {
        if (!selectedDay) return [];
        return selectedMonthExpenses
            .filter((expense) => expense.date === selectedDay)
            .sort((a, b) => b.amount - a.amount);
    }, [selectedMonthExpenses, selectedDay]);

    const monthlyLabels = Object.keys(monthlyTotals).sort();
    const monthlyValues = monthlyLabels.map((month) => monthlyTotals[month]);

    const dailyDates = Object.keys(dailyTotals).sort();
    const dailyLabels = dailyDates.map((day) => day.slice(8, 10));
    const dailyValues = dailyDates.map((day) => dailyTotals[day]);

    if (monthlyLabels.length === 0) {
        return (
            <div className="trend-box">
                <p>No data yet.</p>
            </div>
        );
    }

    const monthMin = Math.min(...monthlyValues);
    const monthMax = Math.max(...monthlyValues);

    const monthlyBackgroundColors = monthlyValues.map(
        (value) => getHeatColor(value, monthMin, monthMax).background
    );
    const monthlyBorderColors = monthlyValues.map(
        (value) => getHeatColor(value, monthMin, monthMax).border
    );

    const dayMin = dailyValues.length ? Math.min(...dailyValues) : 0;
    const dayMax = dailyValues.length ? Math.max(...dailyValues) : 0;

    const dailyPointBackground = dailyValues.map(
        (value) => getHeatColor(value, dayMin, dayMax).background
    );
    const dailyPointBorder = dailyValues.map(
        (value) => getHeatColor(value, dayMin, dayMax).border
    );

    const monthlyBarData = {
        labels: monthlyLabels,
        datasets: [
            {
                label: "Monthly Spending",
                data: monthlyValues,
                borderWidth: 1.5,
                borderRadius: 8,
                backgroundColor: monthlyBackgroundColors,
                borderColor: monthlyBorderColors,
            },
        ],
    };

    const monthlyBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const clickedMonth = monthlyLabels[index];
                setSelectedMonth(clickedMonth);
                setSelectedDay(null);
            }
        },
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: "Monthly Expense Overview",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `$${Number(context.raw).toFixed(2)}`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return `$${value}`;
                    },
                },
            },
        },
    };

    const dailyLineData = {
        labels: dailyLabels,
        datasets: [
            {
                label: `Daily Spending in ${selectedMonth}`,
                data: dailyValues,
                fill: true,
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: dailyPointBackground,
                pointBorderColor: dailyPointBorder,
                pointBorderWidth: 2,
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(147, 197, 253, 0.25)",
            },
        ],
    };

    const dailyLineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const clickedDate = dailyDates[index];
                setSelectedDay(clickedDate);
            }
        },
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: `Daily Expense Overview - ${selectedMonth}`,
            },
            tooltip: {
                callbacks: {
                    title: function (tooltipItems) {
                        const dayIndex = tooltipItems[0].dataIndex;
                        return dailyDates[dayIndex];
                    },
                    label: function (context) {
                        return `$${Number(context.raw).toFixed(2)}`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return `$${value}`;
                    },
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Day of Month",
                },
            },
        },
    };

    return (
        <div className="trend-chart-section">
            {!selectedMonth ? (
                <>
                    <div className="trend-header-row">
                        <p className="trend-helper-text">
                            Click a month bar to view daily spending. Color goes from light green to deep red based on spending level.
                        </p>
                    </div>

                    <div className="chart-wrapper large-chart">
                        <Bar data={monthlyBarData} options={monthlyBarOptions} />
                    </div>
                </>
            ) : (
                <>
                    <div className="trend-header-row">
                        <p className="trend-helper-text">
                            Click a point on the daily line chart to view detailed expenses for that day.
                        </p>

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => {
                                setSelectedMonth(null);
                                setSelectedDay(null);
                            }}
                        >
                            Back to Monthly View
                        </button>
                    </div>

                    <div className="chart-wrapper large-chart">
                        <Line data={dailyLineData} options={dailyLineOptions} />
                    </div>

                    <div className="trend-category-panel">
                        <h3>Category Breakdown in {selectedMonth}</h3>

                        {Object.keys(categoryTotalsForSelectedMonth).length === 0 ? (
                            <p>No category data for this month.</p>
                        ) : (
                            <div className="trend-category-grid">
                                {Object.keys(categoryTotalsForSelectedMonth).map((category) => {
                                    const config = categoryConfig[category] || {
                                        icon: "📌",
                                        bgClass: "trend-tag-other",
                                    };

                                    return (
                                        <div
                                            key={category}
                                            className={`trend-category-card ${config.bgClass}`}
                                        >
                                            <div className="trend-category-top">
                                                <span className="trend-category-icon">{config.icon}</span>
                                                <span className="trend-category-name">{category}</span>
                                            </div>
                                            <strong className="trend-category-amount">
                                                ${categoryTotalsForSelectedMonth[category].toFixed(2)}
                                            </strong>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="daily-detail-panel">
                        <h3>
                            {selectedDay
                                ? `Expense Details for ${selectedDay}`
                                : "Select a day point to view expense details"}
                        </h3>

                        {selectedDay ? (
                            selectedDayExpenses.length > 0 ? (
                                <div className="daily-expense-list">
                                    {selectedDayExpenses.map((expense) => {
                                        const config = categoryConfig[expense.category] || {
                                            icon: "📌",
                                            bgClass: "trend-tag-other",
                                        };

                                        return (
                                            <div className="daily-expense-card" key={expense.id}>
                                                <div className="daily-expense-left">
                                                    <div className="daily-expense-title-row">
                                                        <span className="daily-expense-icon">{config.icon}</span>
                                                        <strong>{expense.title}</strong>
                                                    </div>
                                                    <span className={`mini-category-tag ${config.bgClass}`}>
                                                        {expense.category}
                                                    </span>
                                                    <p className="daily-expense-desc">
                                                        {expense.description || "No description"}
                                                    </p>
                                                </div>

                                                <div className="daily-expense-right">
                                                    ${expense.amount.toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No expense records for this day.</p>
                            )
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
}

export default Trend;