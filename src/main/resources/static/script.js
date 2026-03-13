const API_URL = "http://localhost:9090/expenses";
const SCRIPT_AUTH_SESSION_KEY = "expense_tracker_session";
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
});

let lineChartInstance = null;
let pieChartInstance = null;
let currentExpenses = [];

function goToDashboard() {
    window.location.href = "dashboard.html";
}

function goToAddExpense() {
    window.location.href = "add-expense.html";
}

function goToAnalytics() {
    window.location.href = "analytics.html";
}

function goToViewExpenses() {
    window.location.href = "view-expenses.html";
}

function logoutUser() {
    if (typeof window.doLogout === "function") {
        window.doLogout();
        return;
    }

    window.location.href = "login.html";
}

function toggleIncomePopup(event) {
    event.stopPropagation();
    const popup = document.getElementById("incomePopup");
    const monthInput = document.getElementById("incomeMonth");
    if (!popup) {
        return;
    }

    if (monthInput && !monthInput.value) {
        const now = new Date();
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    if (popup.hidden) {
        popup.hidden = false;
        requestAnimationFrame(() => popup.classList.add("open"));
        return;
    }

    closeIncomePopup();
}

function closeIncomePopup() {
    const popup = document.getElementById("incomePopup");
    if (!popup) {
        return;
    }

    popup.classList.remove("open");
    window.setTimeout(() => {
        if (!popup.classList.contains("open")) {
            popup.hidden = true;
        }
    }, 220);
}

function formatCurrency(amount) {
    return CURRENCY_FORMATTER.format(amount || 0);
}

function getLoggedInUser() {
    let raw = null;
    try {
        raw = localStorage.getItem(SCRIPT_AUTH_SESSION_KEY);
    } catch (_error) {
        return null;
    }

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (_error) {
        return null;
    }
}

function getLoggedInUserEmail() {
    return getLoggedInUser()?.email || "";
}

function withUserQuery(url) {
    const userEmail = getLoggedInUserEmail();
    if (!userEmail) {
        return url;
    }

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}userEmail=${encodeURIComponent(userEmail)}`;
}

function formatDate(value) {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value || "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function isIncomeCategory(category) {
    const normalized = (category || "").toLowerCase();
    return normalized.includes("income") || normalized.includes("salary") || normalized.includes("bonus");
}

async function fetchAllExpenses(size = 1000) {
    const response = await fetch(withUserQuery(`${API_URL}?page=0&size=${size}`));
    if (!response.ok) {
        throw new Error(`Unable to fetch expenses. Status: ${response.status}`);
    }

    const data = await response.json();
    const expenses = Array.isArray(data.content) ? data.content : [];
    return expenses.map(expense => ({
        ...expense,
        amount: Number(expense.amount || 0)
    }));
}

function calculateSummary(expenses) {
    const income = expenses
        .filter(expense => isIncomeCategory(expense.category))
        .reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpense = expenses
        .filter(expense => !isIncomeCategory(expense.category))
        .reduce((sum, expense) => sum + expense.amount, 0);

    return {
        income,
        totalExpense,
        totalTransactions: expenses.length,
        balance: income - totalExpense
    };
}

function renderSummaryCards(summary) {
    const balanceEl = document.getElementById("balance");
    const incomeEl = document.getElementById("income");
    const expenseEl = document.getElementById("expense");
    const transactionsEl = document.getElementById("transactions");

    if (balanceEl) {
        balanceEl.textContent = formatCurrency(summary.balance);
    }
    if (incomeEl) {
        incomeEl.textContent = formatCurrency(summary.income);
    }
    if (expenseEl) {
        expenseEl.textContent = formatCurrency(summary.totalExpense);
    }
    if (transactionsEl) {
        transactionsEl.textContent = String(summary.totalTransactions);
    }
}

function renderExpenseTable(expenses, { recentOnly = false, allowEdit = false } = {}) {
    const table = document.getElementById("expenseTable");
    if (!table) {
        return;
    }

    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    const rows = recentOnly ? sorted.slice(0, 5) : sorted;

    if (rows.length === 0) {
        table.innerHTML = `
        <tr>
            <td colspan="5">No expenses found.</td>
        </tr>`;
        return;
    }

    table.innerHTML = rows.map(expense => {
        const title = expense.title || expense.category || "-";
        const actions = allowEdit
            ? `<button class="edit-btn" onclick="startEditExpense(${expense.id})">Edit</button>
               <button class="delete" onclick="deleteExpense(${expense.id})">Delete</button>`
            : `<button class="delete" onclick="deleteExpense(${expense.id})">Delete</button>`;

        return `
        <tr data-expense-id="${expense.id}">
            <td>${formatDate(expense.date)}</td>
            <td>${title}</td>
            <td>${expense.category || "-"}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td class="action-cell">${actions}</td>
        </tr>`;
    }).join("");
}

function filterExpenses(expenses, term) {
    const query = (term || "").trim().toLowerCase();
    if (!query) {
        return expenses;
    }

    return expenses.filter(expense => {
        const title = (expense.title || "").toLowerCase();
        const category = (expense.category || "").toLowerCase();
        const date = formatDate(expense.date).toLowerCase();
        const amount = String(expense.amount || "").toLowerCase();
        return title.includes(query) || category.includes(query) || date.includes(query) || amount.includes(query);
    });
}

function rerenderViewTable() {
    const searchInput = document.getElementById("searchInput");
    const filtered = filterExpenses(currentExpenses, searchInput?.value || "");
    renderExpenseTable(filtered, { recentOnly: false, allowEdit: true });
}

function setupSearchFilter() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    if (!searchInput) {
        return;
    }

    if (!searchInput.dataset.bound) {
        searchInput.addEventListener("input", rerenderViewTable);
        searchInput.dataset.bound = "1";
    }

    if (searchBtn && !searchBtn.dataset.bound) {
        searchBtn.addEventListener("click", rerenderViewTable);
        searchBtn.dataset.bound = "1";
    }
}

function getBudgetStorageKey() {
    const user = getLoggedInUserEmail();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return `budget_${user}_${monthKey}`;
}

function getCurrentMonthSpent(expenses) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return expenses
        .filter(expense => !isIncomeCategory(expense.category))
        .filter(expense => {
            const dt = new Date(expense.date);
            return dt.getMonth() === month && dt.getFullYear() === year;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
}

function renderBudgetInsights(expenses) {
    const budgetInput = document.getElementById("monthlyBudgetInput");
    const budgetStatus = document.getElementById("budgetStatus");
    const overspendAlert = document.getElementById("overspendAlert");

    if (!budgetInput || !budgetStatus || !overspendAlert) {
        return;
    }

    const key = getBudgetStorageKey();
    const monthlyBudget = Number(localStorage.getItem(key) || 0);
    const spent = getCurrentMonthSpent(expenses);

    if (!budgetInput.dataset.bound) {
        budgetInput.value = monthlyBudget > 0 ? String(monthlyBudget) : "";
        budgetInput.dataset.bound = "1";
    }

    if (monthlyBudget <= 0) {
        budgetStatus.textContent = `This month spent: ${formatCurrency(spent)}. Set a budget to track limit.`;
        budgetStatus.className = "budget-status no-budget";
        overspendAlert.hidden = true;
        return;
    }

    const remaining = monthlyBudget - spent;
    if (remaining >= 0) {
        budgetStatus.textContent = `Spent ${formatCurrency(spent)} out of ${formatCurrency(monthlyBudget)}. Remaining ${formatCurrency(remaining)}.`;
        budgetStatus.className = "budget-status within";
        overspendAlert.hidden = true;
    } else {
        budgetStatus.textContent = `Spent ${formatCurrency(spent)} out of ${formatCurrency(monthlyBudget)}.`;
        budgetStatus.className = "budget-status over";
        overspendAlert.hidden = false;
        overspendAlert.textContent = `Alert: You are over budget by ${formatCurrency(Math.abs(remaining))}.`;
    }
}

function setupBudgetControls() {
    const saveBtn = document.getElementById("saveBudgetBtn");
    const budgetInput = document.getElementById("monthlyBudgetInput");

    if (!saveBtn || !budgetInput || saveBtn.dataset.bound) {
        return;
    }

    saveBtn.addEventListener("click", () => {
        const value = Number(budgetInput.value || 0);
        if (value <= 0) {
            alert("Please enter a valid monthly budget amount.");
            return;
        }

        localStorage.setItem(getBudgetStorageKey(), String(value));
        renderBudgetInsights(currentExpenses);
    });

    saveBtn.dataset.bound = "1";
}

function startEditExpense(id) {
    const row = document.querySelector(`tr[data-expense-id="${id}"]`);
    const expense = currentExpenses.find(item => item.id === id);
    if (!row || !expense) {
        return;
    }

    row.innerHTML = `
        <td><input class="inline-input" type="date" id="edit-date-${id}" value="${expense.date || ""}"></td>
        <td><input class="inline-input" type="text" id="edit-title-${id}" value="${expense.title || ""}"></td>
        <td><input class="inline-input" type="text" id="edit-category-${id}" value="${expense.category || ""}"></td>
        <td><input class="inline-input" type="number" min="1" step="0.01" id="edit-amount-${id}" value="${expense.amount || 0}"></td>
        <td class="action-cell">
            <button class="save-btn" onclick="saveEditedExpense(${id})">Save</button>
            <button class="cancel-btn" onclick="cancelEditExpense()">Cancel</button>
        </td>
    `;
}

function cancelEditExpense() {
    rerenderViewTable();
}

async function saveEditedExpense(id) {
    const title = document.getElementById(`edit-title-${id}`)?.value?.trim() || "";
    const category = document.getElementById(`edit-category-${id}`)?.value?.trim() || "";
    const date = document.getElementById(`edit-date-${id}`)?.value || "";
    const amount = Number(document.getElementById(`edit-amount-${id}`)?.value || 0);

    if (!category || !date || amount <= 0) {
        alert("Please enter valid category, date and amount.");
        return;
    }

    const payload = {
        title,
        category,
        amount,
        date,
        createdBy: getLoggedInUserEmail()
    };

    try {
        const response = await fetch(withUserQuery(`${API_URL}/${id}`), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Unable to update expense.");
        }

        await loadPageData();
    } catch (error) {
        alert("Update failed. Please try again.");
        console.error("Error updating expense:", error);
    }
}

function buildMonthlySeries(expenses, monthsToShow = 6) {
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const now = new Date();

    for (let i = monthsToShow - 1; i >= 0; i -= 1) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
        labels.push(monthDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }));

        const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
            return key === expenseKey;
        });

        incomeData.push(monthExpenses
            .filter(expense => isIncomeCategory(expense.category))
            .reduce((sum, expense) => sum + expense.amount, 0));

        expenseData.push(monthExpenses
            .filter(expense => !isIncomeCategory(expense.category))
            .reduce((sum, expense) => sum + expense.amount, 0));
    }

    return { labels, incomeData, expenseData };
}

function buildCategoryBreakdown(expenses) {
    const totalsByCategory = {};

    expenses
        .filter(expense => !isIncomeCategory(expense.category))
        .forEach(expense => {
            const category = expense.category || "Other";
            totalsByCategory[category] = (totalsByCategory[category] || 0) + expense.amount;
        });

    return totalsByCategory;
}

function renderCharts(expenses) {
    const lineCanvas = document.getElementById("lineChart");
    const pieCanvas = document.getElementById("pieChart");

    if (typeof Chart === "undefined") {
        return;
    }

    if (lineCanvas) {
        const { labels, incomeData, expenseData } = buildMonthlySeries(expenses);
        if (lineChartInstance) {
            lineChartInstance.destroy();
        }

        lineChartInstance = new Chart(lineCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Income",
                        data: incomeData,
                        borderColor: "#3498db",
                        backgroundColor: "rgba(52, 152, 219, 0.2)",
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: "Expense",
                        data: expenseData,
                        borderColor: "#ff6b6b",
                        backgroundColor: "rgba(255, 107, 107, 0.2)",
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2
            }
        });
    }

    if (pieCanvas) {
        const categoryTotals = buildCategoryBreakdown(expenses);
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        if (pieChartInstance) {
            pieChartInstance.destroy();
        }

        pieChartInstance = new Chart(pieCanvas, {
            type: "pie",
            data: {
                labels: labels.length ? labels : ["No Data"],
                datasets: [{
                    data: data.length ? data : [1],
                    backgroundColor: [
                        "#7b5cff",
                        "#ff6b6b",
                        "#3498db",
                        "#ff9f43",
                        "#2ecc71",
                        "#f1c40f"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1
            }
        });
    }
}

function renderAnalyticsCategoryTable(expenses) {
    const summaryBody = document.querySelector(".table-section tbody:not([id])");
    if (!summaryBody) {
        return;
    }

    const categoryTotals = buildCategoryBreakdown(expenses);
    const rows = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    if (!rows.length) {
        summaryBody.innerHTML = `
        <tr>
            <td colspan="2">No expense data available.</td>
        </tr>`;
        return;
    }

    summaryBody.innerHTML = rows
        .map(([category, total]) => `
        <tr>
            <td>${category}</td>
            <td>${formatCurrency(total)}</td>
        </tr>`)
        .join("");
}

async function loadPageData() {
    try {
        if (!getLoggedInUserEmail()) {
            window.location.href = "login.html";
            return;
        }

        const expenses = await fetchAllExpenses();
        currentExpenses = expenses;

        const hasDashboardCards = Boolean(document.getElementById("balance"));
        const isViewPage = Boolean(document.getElementById("searchInput"));

        renderSummaryCards(calculateSummary(expenses));
        renderCharts(expenses);
        renderAnalyticsCategoryTable(expenses);

        if (document.getElementById("expenseTable")) {
            if (hasDashboardCards) {
                renderExpenseTable(expenses, { recentOnly: true, allowEdit: false });
            } else if (isViewPage) {
                rerenderViewTable();
            } else {
                renderExpenseTable(expenses, { recentOnly: false, allowEdit: false });
            }
        }

        setupSearchFilter();
        setupBudgetControls();
        renderBudgetInsights(expenses);
    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

const incomeForm = document.getElementById("incomeForm");
if (incomeForm) {
    incomeForm.addEventListener("click", event => event.stopPropagation());

    incomeForm.addEventListener("submit", async event => {
        event.preventDefault();

        const amount = Number(document.getElementById("incomeAmount").value);
        const monthValue = document.getElementById("incomeMonth").value;

        if (!monthValue) {
            alert("Please select a month.");
            return;
        }

        const [yearText, monthText] = monthValue.split("-");

        const payload = {
            amount,
            month: Number(monthText),
            year: Number(yearText),
            userEmail: getLoggedInUserEmail()
        };

        try {
            const response = await fetch(withUserQuery(`${API_URL}/income`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Unable to add income.");
            }

            incomeForm.reset();
            closeIncomePopup();
            await loadPageData();
        } catch (error) {
            alert("Income save failed. Please login again and retry.");
            console.error("Error adding income:", error);
        }
    });
}

const expenseForm = document.getElementById("expenseForm");
if (expenseForm) {
    expenseForm.addEventListener("submit", async event => {
        event.preventDefault();

        const expense = {
            title: document.getElementById("title")?.value?.trim() || "",
            category: document.getElementById("category").value,
            amount: Number(document.getElementById("amount").value),
            date: document.getElementById("date").value,
            createdBy: getLoggedInUserEmail()
        };

        try {
            const response = await fetch(withUserQuery(API_URL), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            });

            if (!response.ok) {
                throw new Error("Unable to add expense.");
            }

            alert("Expense added successfully.");
            expenseForm.reset();
        } catch (error) {
            alert("Expense add failed. Please login again and retry.");
            console.error("Error adding expense:", error);
        }
    });
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const response = await fetch(withUserQuery(`${API_URL}/${id}`), {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete expense.");
        }

        await loadPageData();
    } catch (error) {
        alert("Delete failed. Please refresh and try again.");
        console.error("Error deleting expense:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPageData);
document.addEventListener("click", event => {
    const incomeCard = document.querySelector(".income-card");
    const popup = document.getElementById("incomePopup");
    if (!incomeCard || !popup) {
        return;
    }

    if (!incomeCard.contains(event.target)) {
        closeIncomePopup();
    }
});
