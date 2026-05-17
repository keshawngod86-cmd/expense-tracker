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

function Trend({ expenses }) {
    const [timeDimension, setTimeDimension] = useState("monthly");
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [detailMode, setDetailMode] = useState("categories");

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

    const periodLabels = useMemo(() => Object.keys(periodTotals).sort(), [periodTotals]);
    const effectiveSelectedPeriod =
        selectedPeriod && periodLabels.includes(selectedPeriod)
            ? selectedPeriod
            : periodLabels[periodLabels.length - 1] || null;

    const selectedPeriodExpenses = useMemo(() => {
        if (!effectiveSelectedPeriod) return [];

        return expenses
            .filter((expense) => activeOption.getPeriodKey(expense) === effectiveSelectedPeriod)
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, activeOption, effectiveSelectedPeriod]);

    const categoryTotalsForSelectedPeriod = useMemo(() => {
        const totals = {};

        selectedPeriodExpenses.forEach((expense) => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });

        return totals;
    }, [selectedPeriodExpenses]);

    const periodValues = periodLabels.map((period) => periodTotals[period]);
    const chartPeriodLabels =
        timeDimension === "daily" && periodLabels.length > 18
            ? periodLabels.slice(-18)
            : periodLabels;
    const chartPeriodValues = chartPeriodLabels.map((period) => periodTotals[period]);
    const chartPeriodMin = chartPeriodValues.length ? Math.min(...chartPeriodValues) : 0;
    const chartPeriodMax = chartPeriodValues.length ? Math.max(...chartPeriodValues) : 0;

    const barColors = chartPeriodValues.map(
        (value) => getHeatColor(value, chartPeriodMin, chartPeriodMax).background
    );
    const barBorderColors = chartPeriodValues.map(
        (value) => getHeatColor(value, chartPeriodMin, chartPeriodMax).border
    );

    const barData = {
        labels: chartPeriodLabels,
        datasets: [
            {
                label: activeOption.chartLabel,
                data: chartPeriodValues,
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
                setSelectedPeriod(chartPeriodLabels[index]);
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
                ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0,
                },
                title: {
                    display: false,
                    text: activeOption.xAxisTitle,
                },
            },
        },
    };

    const totalForActiveRange = periodValues.reduce((total, value) => total + value, 0);
    const averageForActiveRange =
        periodValues.length > 0 ? totalForActiveRange / periodValues.length : 0;
    const selectedPeriodTotal = effectiveSelectedPeriod
        ? periodTotals[effectiveSelectedPeriod] || 0
        : 0;
    const visiblePeriodLabels = periodLabels.slice(-8);

    function handleDimensionChange(nextDimension) {
        setTimeDimension(nextDimension);
        setSelectedPeriod(null);
    }

    return (
        <div className={`trend-chart-section trend-detail-mode-${detailMode}`}>
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
                    <div className="trend-period-strip" aria-label="Choose period">
                        {visiblePeriodLabels.map((period) => (
                            <button
                                key={period}
                                type="button"
                                className={`trend-period-pill ${
                                    period === effectiveSelectedPeriod ? "is-active" : ""
                                }`}
                                onClick={() => setSelectedPeriod(period)}
                                aria-pressed={period === effectiveSelectedPeriod}
                            >
                                <span>{period}</span>
                                <strong>{formatCurrency(periodTotals[period])}</strong>
                            </button>
                        ))}
                    </div>

                    <div className="trend-visual-panel">
                        <div className="trend-chart-title">
                            <span>{activeOption.chartTitle}</span>
                            <strong>{chartPeriodLabels.length} points</strong>
                        </div>
                        <div className="chart-wrapper large-chart">
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>

                    {effectiveSelectedPeriod ? (
                        <>
                            <div className="trend-selected-summary">
                                <span>{activeOption.xAxisTitle}</span>
                                <strong>{effectiveSelectedPeriod}</strong>
                                <em>
                                    {formatCurrency(selectedPeriodTotal)} /{" "}
                                    {selectedPeriodExpenses.length} records
                                </em>
                            </div>

                            <div className="trend-detail-toggle" aria-label="Choose detail panel">
                                <button
                                    type="button"
                                    className={detailMode === "categories" ? "is-active" : ""}
                                    aria-pressed={detailMode === "categories"}
                                    onClick={() => setDetailMode("categories")}
                                >
                                    Categories
                                </button>
                                <button
                                    type="button"
                                    className={detailMode === "records" ? "is-active" : ""}
                                    aria-pressed={detailMode === "records"}
                                    onClick={() => setDetailMode("records")}
                                >
                                    Records
                                </button>
                                <button
                                    type="button"
                                    className={detailMode === "chart" ? "is-active" : ""}
                                    aria-pressed={detailMode === "chart"}
                                    onClick={() => setDetailMode("chart")}
                                >
                                    Chart
                                </button>
                            </div>

                            <div className={`period-detail-grid trend-detail-mode-${detailMode}`}>
                                <div className="trend-category-panel">
                                    <h3>Categories</h3>

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
                                    <h3>Records</h3>

                                    {selectedPeriodExpenses.length > 0 ? (
                                        <div className="daily-expense-list">
                                            {selectedPeriodExpenses.map((expense) => (
                                                <div
                                                    className="daily-expense-card"
                                                    key={expense.id}
                                                >
                                                    <div className="daily-expense-left">
                                                        <div className="daily-expense-title-row">
                                                            <strong>
                                                                {expense.title || expense.category}
                                                            </strong>
                                                        </div>
                                                        <div className="daily-expense-meta-row">
                                                            <span
                                                                className={`mini-category-tag ${
                                                                    categoryClasses[
                                                                        expense.category
                                                                    ] || categoryClasses.Other
                                                                }`}
                                                            >
                                                                {expense.category}
                                                            </span>
                                                            {expense.description ? (
                                                                <p className="daily-expense-desc">
                                                                    {expense.description}
                                                                </p>
                                                            ) : null}
                                                        </div>
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
                        </>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default Trend;
