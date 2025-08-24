// Reports.js - Handles the functionality for the Reports section

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the reports view
    initReports();

    // Set up event listeners
    document.getElementById('backToReportsList').addEventListener('click', showReportsList);
});

// Initialize the reports view
function initReports() {
    // Generate and display available monthly reports
    generateMonthlyReports();
}

// Generate monthly reports based on available transaction data
function generateMonthlyReports() {
    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = ''; // Clear existing reports

    // Get all transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    if (transactions.length === 0) {
        reportsList.innerHTML = '<div class="empty-state">No transaction data available to generate reports.</div>';
        return;
    }

    // Group transactions by month and year
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                transactions: [],
                totalIncome: 0,
                totalExpense: 0
            };
        }
        
        monthlyData[monthYear].transactions.push(transaction);
        
        if (transaction.type === 'income') {
            monthlyData[monthYear].totalIncome += parseFloat(transaction.amount);
        } else {
            monthlyData[monthYear].totalExpense += parseFloat(transaction.amount);
        }
    });

    // Create report items for each month
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Sort by most recent month first
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    
    sortedMonths.forEach(monthYear => {
        const [year, month] = monthYear.split('-');
        const monthName = months[parseInt(month) - 1];
        const data = monthlyData[monthYear];
        const balance = data.totalIncome - data.totalExpense;
        
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.dataset.monthYear = monthYear;
        
        reportItem.innerHTML = `
            <div class="report-info">
                <div class="report-title">Report of ${monthName} ${year}</div>
                <div class="report-date">${data.transactions.length} transactions</div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        
        reportItem.addEventListener('click', () => {
            showReportDetail(monthYear, monthName, year, data);
        });
        
        reportsList.appendChild(reportItem);
    });
}

// Show detailed report for a specific month
function showReportDetail(monthYear, monthName, year, data) {
    // Hide reports list and show detail view
    document.getElementById('reportsListView').style.display = 'none';
    document.getElementById('reportDetailView').style.display = 'block';
    
    // Update report title
    document.getElementById('reportTitle').textContent = `${monthName} ${year}`;
    
    // Update summary amounts using precise currency calculations
    const balance = CurrencyUtils.preciseCurrencyCalculation(
        data.totalIncome, 
        data.totalExpense, 
        'subtract'
    );
    
    document.getElementById('reportIncome').textContent = CurrencyUtils.formatCurrency(data.totalIncome);
    document.getElementById('reportExpense').textContent = CurrencyUtils.formatCurrency(data.totalExpense);
    document.getElementById('reportBalance').textContent = CurrencyUtils.formatCurrency(balance);
    
    // Store raw values as data attributes for potential currency conversions
    document.getElementById('reportIncome').setAttribute('data-amount', data.totalIncome);
    document.getElementById('reportExpense').setAttribute('data-amount', data.totalExpense);
    document.getElementById('reportBalance').setAttribute('data-amount', balance);
    
    // Generate spending by category chart
    generateCategoryChart(data.transactions);
    
    // Display key transactions
    displayKeyTransactions(data.transactions);
}

// Show the reports list view
function showReportsList() {
    document.getElementById('reportDetailView').style.display = 'none';
    document.getElementById('reportsListView').style.display = 'block';
}

// Generate spending by category chart
function generateCategoryChart(transactions) {
    // Group expenses by category
    const categoryData = {};
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (expenseTransactions.length === 0) {
        document.getElementById('categoryPieChart').style.display = 'none';
        return;
    }
    
    expenseTransactions.forEach(transaction => {
        const category = transaction.category || 'Other';
        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += parseFloat(transaction.amount);
    });
    
    // Calculate total expense
    const totalExpense = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
    
    // Sort categories by amount (descending)
    const sortedCategories = Object.keys(categoryData).sort((a, b) => categoryData[b] - categoryData[a]);
    
    // Generate pie chart
    generatePieChart(categoryData, sortedCategories);
}

// Display key transactions
function displayKeyTransactions(transactions) {
    const transactionsList = document.getElementById('reportTransactions');
    transactionsList.innerHTML = '';
    
    // Sort transactions by amount (descending)
    const sortedTransactions = [...transactions].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    
    // Display top 5 transactions
    const topTransactions = sortedTransactions.slice(0, 5);
    
    topTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item ${transaction.type}`;
        
        const date = new Date(transaction.date);
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        // Format amount using currency utilities
        const amount = parseFloat(transaction.amount);
        const formattedAmount = CurrencyUtils.formatCurrency(amount);
        
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-category">${transaction.category || 'Uncategorized'}</div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <div class="transaction-amount ${transaction.type}" data-amount="${amount}">${formattedAmount}</div>
        `;
        
        transactionsList.appendChild(transactionItem);
    });
}

// Get currency symbol from localStorage or default to ₹
function getCurrencySymbol() {
    const currency = localStorage.getItem('currency') || 'INR';
    const currencyMap = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CNY': '¥',
        'CAD': 'C$',
        'AUD': 'A$'
    };
    
    return currencyMap[currency] || '₹';
}

// Get color for category
function getCategoryColor(category) {
    const colorMap = {
        'Food': '#FF9F43',
        'Transport': '#54A0FF',
        'Entertainment': '#FF6B6B',
        'Shopping': '#5E60CE',
        'Utilities': '#1DD1A1',
        'Housing': '#00D2FC',
        'Healthcare': '#FF6B8B',
        'Education': '#2E94B9',
        'Travel': '#F368E0',
        'Other': '#A5B1C2'
    };
    
    return colorMap[category] || colorMap['Other'];
}

// Generate interactive pie chart using Chart.js
function generatePieChart(categoryData, sortedCategories) {
    // Get the canvas element
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    
    // Prepare data for the pie chart
    const data = {
        labels: sortedCategories,
        datasets: [{
            data: sortedCategories.map(category => categoryData[category]),
            backgroundColor: sortedCategories.map(category => getCategoryColor(category)),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 10
        }]
    };
    
    // Check if a chart instance already exists and destroy it
    if (window.categoryPieChartInstance) {
        window.categoryPieChartInstance.destroy();
    }
    
    // Create the pie chart
    window.categoryPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#2c3e50',
                        font: {
                            family: 'Poppins',
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${getCurrencySymbol()}${value.toFixed(2)} (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        family: 'Poppins',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Poppins',
                        size: 13
                    },
                    padding: 10,
                    cornerRadius: 6
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Add CSS for empty state
const style = document.createElement('style');
style.textContent = `
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
        font-style: italic;
    }
`;

document.head.appendChild(style);