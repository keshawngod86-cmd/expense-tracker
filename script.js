const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value.trim();

    if (title === "" || category === "" || amount === "" || date === "") {
        alert("Please fill in all required fields.");
        return;
    }

    const newExpense = {
        id: Date.now().toString(),
        title: title,
        category: category,
        amount: parseFloat(amount),
        date: date,
        description: description
    };

    expenses.push(newExpense);
    saveExpenses();
    renderExpenses();
    updateSummary();
    expenseForm.reset();
});

function renderExpenses() {
    expenseList.innerHTML = "";

    if (expenses.length === 0) {
        expenseList.innerHTML = `
      <li class="expense-item placeholder-item">No expenses yet.</li>
    `;
        return;
    }

    expenses.forEach(function (expense) {
        const listItem = document.createElement("li");
        listItem.className = "expense-item";

        listItem.innerHTML = `
      <h3>${expense.title}</h3>
      <p><strong>Category:</strong> ${expense.category}</p>
      <p><strong>Amount:</strong> $${expense.amount.toFixed(2)}</p>
      <p><strong>Date:</strong> ${expense.date}</p>
      <p><strong>Description:</strong> ${expense.description || "No description"}</p>
      <button type="button" class="edit-btn" data-id="${expense.id}">Edit</button>
      <button type="button" class="delete-btn" data-id="${expense.id}">Delete</button>
    `;

        expenseList.appendChild(listItem);
    });
}

expenseList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
        const id = event.target.dataset.id;
        deleteExpense(id);
    }

    if (event.target.classList.contains("edit-btn")) {
        const id = event.target.dataset.id;
        editExpense(id);
    }
});

function deleteExpense(id) {
    expenses = expenses.filter(function (expense) {
        return expense.id !== id;
    });

    saveExpenses();
    renderExpenses();
    updateSummary();
}
function editExpense(id) {
    const expense = expenses.find(function (item) {
        return item.id === id;
    });

    if (!expense) return;

    // 把数据填回表单
    document.getElementById("title").value = expense.title;
    document.getElementById("category").value = expense.category;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("date").value = expense.date;
    document.getElementById("description").value = expense.description;

    // 删除原数据
    expenses = expenses.filter(function (item) {
        return item.id !== id;
    });

    saveExpenses();
    renderExpenses();
    updateSummary();
}
function updateSummary() {
    let total = 0;
    const categoryTotals = {};
    const monthlyTotals = {};

    expenses.forEach(function (expense) {
        // 1?? 总金额
        total += expense.amount;

        // 2?? 分类统计
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;

        // 3?? 月份统计
        const month = expense.date.slice(0, 7); // YYYY-MM
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = 0;
        }
        monthlyTotals[month] += expense.amount;
    });

    // ===== 更新总金额 =====
    document.getElementById("total-spending").textContent =
        "$" + total.toFixed(2);

    // ===== 更新分类 =====
    const categorySummary = document.getElementById("category-summary");
    categorySummary.innerHTML = "";

    for (let category in categoryTotals) {
        const p = document.createElement("p");
        p.textContent = `${category}: $${categoryTotals[category].toFixed(2)}`;
        categorySummary.appendChild(p);
    }

    // ===== 更新月份 =====
    const monthlyTrend = document.getElementById("monthly-trend");
    monthlyTrend.innerHTML = "";

    for (let month in monthlyTotals) {
        const p = document.createElement("p");
        p.textContent = `${month}: $${monthlyTotals[month].toFixed(2)}`;
        monthlyTrend.appendChild(p);
    }
}
renderExpenses();
updateSummary();
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}