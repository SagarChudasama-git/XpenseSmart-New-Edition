// Initialize and render charts
function initializeCharts() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Process data for charts
    const categoryData = processDataForPieChart(transactions);
    const monthlyData = processDataForBarChart(transactions);

    // Render charts
    renderPieChart(categoryData);
    renderBarChart(monthlyData);
}

function processDataForPieChart(transactions) {
    const expensesByCategory = {};
    
    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + parseFloat(transaction.amount);
        }
    });

    return {
        labels: Object.keys(expensesByCategory),
        data: Object.values(expensesByCategory)
    };
}

function processDataForBarChart(transactions) {
    const monthlyExpenses = {};
    const monthlyIncome = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        
        if (transaction.type === 'expense') {
            monthlyExpenses[monthYear] = (monthlyExpenses[monthYear] || 0) + parseFloat(transaction.amount);
        } else {
            monthlyIncome[monthYear] = (monthlyIncome[monthYear] || 0) + parseFloat(transaction.amount);
        }
    });

    return {
        labels: [...new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyIncome)])].sort(),
        expenses: Object.values(monthlyExpenses),
        income: Object.values(monthlyIncome)
    };
}

function renderPieChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    '#ec6b56',
                    '#47b39c',
                    '#c6d68f',
                    '#c8afd5',
                    '#eddeca'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Expense by Category',
                    color: '#f5f5f5',
                    font: {
                        family: 'Poppins',
                        size: 16
                    }
                }
            }
        }
    });
}

function renderBarChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Expenses',
                    data: data.expenses,
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1
                },
                {
                    label: 'Income',
                    data: data.income,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins'
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Trends',
                    color: '#f5f5f5',
                    font: {
                        family: 'Poppins',
                        size: 16
                    }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCharts);