import { useMemo, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const categoryClasses = {
    Food: "trend-tag-food",
    Transport: "trend-tag-transport",
    Shopping: "trend-tag-shopping",
    Bills: "trend-tag-bills",
    Entertainment: "trend-tag-entertainment",
    Other: "trend-tag-other",
};

const timeDimensionOptions = [
    {
        key: "daily",
        label: "Daily",
        chartLabel: "Daily Spending",
        chartTitle: "Daily Expense Overview",
        xAxisTitle: "Date",
        getPeriodKey: (expense) => expense.date,
    },
    {
        key: "monthly",
        label: "Monthly",
        chartLabel: "Monthly Spending",
        chartTitle: "Monthly Expense Overview",
        xAxisTitle: "Month",
        getPeriodKey: (expense) => expense.date.slice(0, 7),
    },
    {
        key: "yearly",
        label: "Annual",
        chartLabel: "Annual Spending",
        chartTitle: "Annual Expense Overview",
        xAxisTitle: "Year",
        getPeriodKey: (expense) => expense.date.slice(0, 4),
    },
];

function getHeatColor(value, min, max) {
    if (max === min) {
        return {
            background: "rgba(37, 99, 235, 0.72)",
            border: "rgba(29, 78, 216, 1)",
        };
    }

    const ratio = (value - min) / (max - min);

    if (ratio <= 0.25) {
        return {
            background: "rgba(34, 197, 94, 0.72)",
            border: "rgba(22, 163, 74, 1)",
        };
    }

    if (ratio <= 0.5) {
        return {
            background: "rgba(59, 130, 246, 0.72)",
            border: "rgba(37, 99, 235, 1)",
        };
    }

    if (ratio <= 0.75) {
        return {
            background: "rgba(245, 158, 11, 0.74)",
            border: "rgba(217, 119, 6, 1)",
        };
    }

    return {
        background: "rgba(239, 68, 68, 0.78)",
        border: "rgba(220, 38, 38, 1)",
    };
}

function formatCurrency(value) {
    return `$${Number(value).toFixed(2)}`;
}

function Trend({ expenses, onRefresh, isRefreshing, lastUpdatedAt }) {
    const [timeDimension, setTimeDimension] = useState("monthly");
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const activeOption =
        timeDimensionOptions.find((option) => option.key === timeDimension) ||
        timeDimensionOptions[1];

    const periodTotals = useMemo(() => {
        const totals = {};

        expenses.forEach((expense) => {
            const periodKey = activeOption.getPeriodKey(expense);
            totals[periodKey] = (totals[periodKey] || 0) + expense.amount;
        });

        return totals;
    }, [expenses, activeOption]);

    const selectedPeriodExpenses = useMemo(() => {
        if (!selectedPeriod) return [];

        return expenses
            .filter((expense) => activeOption.getPeriodKey(expense) === selectedPeriod)
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, activeOption, selectedPeriod]);

    const categoryTotalsForSelectedPeriod = useMemo(() => {
        const totals = {};

        selectedPeriodExpenses.forEach((expense) => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });

        return totals;
    }, [selectedPeriodExpenses]);

    const periodLabels = Object.keys(periodTotals).sort();
    const periodValues = periodLabels.map((period) => periodTotals[period]);
    const periodMin = periodValues.length ? Math.min(...periodValues) : 0;
    const periodMax = periodValues.length ? Math.max(...periodValues) : 0;

    const barColors = periodValues.map(
        (value) => getHeatColor(value, periodMin, periodMax).background
    );
    const barBorderColors = periodValues.map(
        (value) => getHeatColor(value, periodMin, periodMax).border
    );

    const barData = {
        labels: periodLabels,
        datasets: [
            {
                label: activeOption.chartLabel,
                data: periodValues,
                borderWidth: 1.5,
                borderRadius: 8,
                backgroundColor: barColors,
                borderColor: barBorderColors,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                setSelectedPeriod(periodLabels[index]);
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
                text: activeOption.chartTitle,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatCurrency(context.raw);
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
                    display: false,
                    text: activeOption.xAxisTitle,
                },
            },
        },
    };

    const lastUpdatedText = lastUpdatedAt
        ? lastUpdatedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "Not refreshed yet";

    const totalForActiveRange = periodValues.reduce((total, value) => total + value, 0);
    const averageForActiveRange =
        periodValues.length > 0 ? totalForActiveRange / periodValues.length : 0;

    function handleDimensionChange(nextDimension) {
        setTimeDimension(nextDimension);
        setSelectedPeriod(null);
    }

    return (
        <div className="trend-chart-section">
            <div className="trend-toolbar">
                <div className="time-toggle-group" aria-label="Choose chart time range">
                    {timeDimensionOptions.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            className={`time-toggle-btn ${
                                option.key === timeDimension ? "is-active" : ""
                            }`}
                            aria-pressed={option.key === timeDimension}
                            onClick={() => handleDimensionChange(option.key)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="refresh-panel">
                    <span className="last-updated-text">Last update: {lastUpdatedText}</span>
                    <button
                        type="button"
                        className="secondary-btn refresh-btn"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? "Refreshing..." : "Refresh Data"}
                    </button>
                </div>
            </div>

            <div className="trend-quick-stats" aria-label="Spending statistics summary">
                <div className="trend-stat-chip trend-stat-total">
                    <span>Total</span>
                    <strong>{formatCurrency(totalForActiveRange)}</strong>
                </div>
                <div className="trend-stat-chip trend-stat-periods">
                    <span>{activeOption.xAxisTitle}s</span>
                    <strong>{periodLabels.length}</strong>
                </div>
                <div className="trend-stat-chip trend-stat-average">
                    <span>Average</span>
                    <strong>{formatCurrency(averageForActiveRange)}</strong>
                </div>
            </div>

            {periodLabels.length === 0 ? (
                <div className="trend-box">
                    <p>No data yet.</p>
                </div>
            ) : (
                <>
                    <div className="trend-visual-panel">
                        <div className="trend-chart-title">
                            <span>{activeOption.chartTitle}</span>
                            <strong>Tap a bar</strong>
                        </div>
                        <div className="chart-wrapper large-chart">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>

                    {selectedPeriod ? (
                        <div className="period-detail-grid">
                            <div className="trend-category-panel">
                                <h3>Category Breakdown in {selectedPeriod}</h3>

                                {Object.keys(categoryTotalsForSelectedPeriod).length === 0 ? (
                                    <p>No category data for this period.</p>
                                ) : (
                                    <div className="trend-category-grid">
                                        {Object.keys(categoryTotalsForSelectedPeriod).map(
                                            (category) => (
                                                <div
                                                    key={category}
                                                    className={`trend-category-card ${
                                                        categoryClasses[category] ||
                                                        categoryClasses.Other
                                                    }`}
                                                >
                                                    <div className="trend-category-top">
                                                        <span className="trend-category-name">
                                                            {category}
                                                        </span>
                                                    </div>
                                                    <strong className="trend-category-amount">
                                                        {formatCurrency(
                                                            categoryTotalsForSelectedPeriod[
                                                                category
                                                            ]
                                                        )}
                                                    </strong>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="daily-detail-panel">
                                <h3>Expense Details for {selectedPeriod}</h3>

                                {selectedPeriodExpenses.length > 0 ? (
                                    <div className="daily-expense-list">
                                        {selectedPeriodExpenses.map((expense) => (
                                            <div
                                                className="daily-expense-card"
                                                key={expense.id}
                                            >
                                                <div className="daily-expense-left">
                                                    <div className="daily-expense-title-row">
                                                        <strong>{expense.title}</strong>
                                                    </div>
                                                    <span
                                                        className={`mini-category-tag ${
                                                            categoryClasses[expense.category] ||
                                                            categoryClasses.Other
                                                        }`}
                                                    >
                                                        {expense.category}
                                                    </span>
                                                    <p className="daily-expense-desc">
                                                        {expense.description || "No description"}
                                                    </p>
                                                </div>

                                                <div className="daily-expense-right">
                                                    {formatCurrency(expense.amount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No expense records for this period.</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default Trend;
