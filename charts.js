// Initialize and render charts
function initializeCharts() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // Process data for charts
    const categoryData = processDataForPieChart(transactions);
    const monthlyData = processDataForBarChart(transactions);

    // Render charts
    renderPieChart(categoryData);
    renderBarChart(monthlyData);
    
    // Handle window resize for responsiveness
    window.addEventListener('resize', function() {
        // Destroy and recreate charts on resize for better responsiveness
        Chart.getChart('categoryChart')?.destroy();
        Chart.getChart('trendChart')?.destroy();
        renderPieChart(categoryData);
        renderBarChart(monthlyData);
    });
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

    // Sort by date
    const allLabels = [...new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyIncome)])];
    const sortedLabels = allLabels.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });

    // Only display the last 6 months if there are more than 6 months of data
    const limitedLabels = sortedLabels.length > 6 ? sortedLabels.slice(-6) : sortedLabels;

    // Map the data to match the limited labels
    const expenses = limitedLabels.map(label => monthlyExpenses[label] || 0);
    const income = limitedLabels.map(label => monthlyIncome[label] || 0);

    return {
        labels: limitedLabels,
        expenses: expenses,
        income: income
    };
}

function renderPieChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const isMobile = window.innerWidth < 576;
    
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
                    position: isMobile ? 'right' : 'bottom',
                    align: 'center',
                    labels: {
                        boxWidth: isMobile ? 10 : 20,
                        padding: isMobile ? 5 : 10,
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins',
                            size: isMobile ? 9 : 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Expense by Category',
                    color: '#f5f5f5',
                    font: {
                        family: 'Poppins',
                        size: isMobile ? 14 : 16
                    },
                    padding: {
                        bottom: isMobile ? 5 : 10
                    }
                }
            }
        }
    });
}

function renderBarChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const isMobile = window.innerWidth < 576;
    
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
                            family: 'Poppins',
                            size: isMobile ? 9 : 12
                        },
                        maxTicksLimit: isMobile ? 5 : 8
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins',
                            size: isMobile ? 9 : 12
                        },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: isMobile ? 10 : 20,
                        padding: isMobile ? 5 : 10,
                        color: '#f5f5f5',
                        font: {
                            family: 'Poppins',
                            size: isMobile ? 9 : 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Trends',
                    color: '#f5f5f5',
                    font: {
                        family: 'Poppins',
                        size: isMobile ? 14 : 16
                    },
                    padding: {
                        bottom: isMobile ? 5 : 10
                    }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCharts);