import { useMemo } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const incomeKeywords = [
    "income",
    "salary",
    "allowance",
    "refund",
    "reimbursement",
];

const categoryColors = {
    Food: "#ef4444",
    Transport: "#2563eb",
    Shopping: "#db2777",
    Bills: "#d97706",
    Entertainment: "#7c3aed",
    Other: "#64748b",
};

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

function CategoryPieChart({ expenses }) {
    const categoryRows = useMemo(() => {
        const totals = {};

        expenses.forEach((expense) => {
            if (isIncomeEntry(expense)) return;

            if (!totals[expense.category]) {
                totals[expense.category] = 0;
            }

            totals[expense.category] += Math.abs(expense.amount);
        });

        return Object.entries(totals).sort(([, amountA], [, amountB]) => amountB - amountA);
    }, [expenses]);

    const totalSpending = categoryRows.reduce((total, [, amount]) => total + amount, 0);

    if (categoryRows.length === 0 || totalSpending === 0) {
        return (
            <div className="pie-empty-state">
                <p>No spending data yet.</p>
            </div>
        );
    }

    const labels = categoryRows.map(([category]) => category);
    const values = categoryRows.map(([, amount]) => amount);
    const colors = labels.map((category) => categoryColors[category] || categoryColors.Other);

    const pieData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderColor: "#ffffff",
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    boxWidth: 14,
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const amount = Number(context.raw);
                        const percentage = ((amount / totalSpending) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(amount)} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="pie-chart-section">
            <div className="pie-chart-wrapper">
                <Pie data={pieData} options={pieOptions} />
            </div>

            <div className="pie-breakdown-list" aria-label="Spending share by category">
                {categoryRows.map(([category, amount]) => {
                    const percentage = ((amount / totalSpending) * 100).toFixed(1);
                    const color = categoryColors[category] || categoryColors.Other;

                    return (
                        <div className="pie-breakdown-row" key={category}>
                            <span className="pie-category-label">
                                <span
                                    className="pie-color-swatch"
                                    style={{ backgroundColor: color }}
                                    aria-hidden="true"
                                />
                                {category}
                            </span>
                            <span className="pie-category-value">
                                {formatCurrency(amount)} · {percentage}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CategoryPieChart;
