// Budget management functionality
class BudgetManager {
    constructor() {
        this.budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        
        // Get current currency or use default - only get it once at initialization
        const storedCurrency = localStorage.getItem('currency');
        this.currency = storedCurrency ? JSON.parse(storedCurrency) : { code: 'INR', symbol: '₹' };
    }
    
    // Format currency (using the cached currency object)
    formatCurrency(amount) {
        return `${this.currency.symbol}${parseFloat(amount).toFixed(2)}`;
    }

    // Add or update a budget
    setBudget(budget) {
        const existingIndex = this.budgets.findIndex(b => 
            b.category === budget.category && 
            b.year === budget.year && 
            b.month === budget.month
        );

        if (existingIndex >= 0) {
            this.budgets[existingIndex] = budget;
        } else {
            this.budgets.push(budget);
        }

        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    // Get all budgets
    getAllBudgets() {
        return this.budgets;
    }

    // Get budget by category and period
    getBudget(category, year, month) {
        return this.budgets.find(b => 
            b.category === category && 
            b.year === year && 
            b.month === month
        );
    }

    // Calculate spending for a budget
    calculateSpending(category, year, month) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        return transactions.reduce((total, transaction) => {
            const transDate = new Date(transaction.date);
            if (transaction.type === 'expense' &&
                transaction.category === category &&
                transDate.getFullYear() === year &&
                transDate.getMonth() === month) {
                return total + parseFloat(transaction.amount);
            }
            return total;
        }, 0);
    }

    // Get budget utilization percentage
    getUtilizationPercentage(category, year, month) {
        const budget = this.getBudget(category, year, month);
        if (!budget) return 0;

        const spending = this.calculateSpending(category, year, month);
        return (spending / budget.amount) * 100;
    }

    // Delete a budget
    deleteBudget(category, year, month) {
        this.budgets = this.budgets.filter(b => 
            !(b.category === category && 
              b.year === year && 
              b.month === month)
        );
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }
}

// Initialize budget manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize budget manager
    const budgetManager = new BudgetManager();
    const budgetForm = document.getElementById('budgetForm');
    const budgetList = document.getElementById('budgetList');
    
    // Function to update transaction summary
    function updateTransactionSummary() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        let totalBudget = 0;
        let totalUsed = 0;
        
        budgetManager.getAllBudgets().forEach(budget => {
            if (budget.year === currentYear && budget.month === currentMonth) {
                totalBudget += budget.amount;
                totalUsed += budgetManager.calculateSpending(budget.category, budget.year, budget.month);
            }
        });
        
        const remaining = totalBudget - totalUsed;
        
        // Use the cached currency formatter from budget manager
        document.querySelector('.summary-item.budget .amount').textContent = budgetManager.formatCurrency(totalBudget);
        document.querySelector('.summary-item.used .amount').textContent = budgetManager.formatCurrency(totalUsed);
        document.querySelector('.summary-item.remaining .amount').textContent = budgetManager.formatCurrency(remaining);
    }

    // Update budget display
    function updateBudgetDisplay() {
        const budgets = budgetManager.getAllBudgets();
        budgetList.innerHTML = '';

        budgets.forEach(budget => {
            const utilization = budgetManager.getUtilizationPercentage(
                budget.category,
                budget.year,
                budget.month
            );
            const spending = budgetManager.calculateSpending(
                budget.category,
                budget.year,
                budget.month
            );

            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            
            // Determine progress bar color based on utilization
            let progressColor = '#2ecc71'; // Green for normal
            if (utilization >= 90) {
                progressColor = '#e74c3c'; // Red for danger
            } else if (utilization >= 75) {
                progressColor = '#f1c40f'; // Yellow for warning
            }

            budgetItem.innerHTML = `
                <div class="budget-info">
                    <h3>${budget.category}</h3>
                    <p>${new Date(budget.year, budget.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    <p class="budget-amount">Budget: ${budgetManager.formatCurrency(budget.amount)}</p>
                    <p class="spending-amount">Spent: ${budgetManager.formatCurrency(spending)}</p>
                </div>
                <div class="budget-progress">
                    <div class="progress-bar" style="width: ${Math.min(utilization, 100)}%; background-color: ${progressColor}"></div>
                </div>
                <div class="budget-actions">
                    <button class="delete-budget" data-category="${budget.category}" 
                            data-year="${budget.year}" data-month="${budget.month}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            budgetList.appendChild(budgetItem);
        });

        // Add delete event listeners
        document.querySelectorAll('.delete-budget').forEach(button => {
            button.addEventListener('click', function() {
                const { category, year, month } = this.dataset;
                budgetManager.deleteBudget(category, parseInt(year), parseInt(month));
                updateBudgetDisplay();
                updateTransactionSummary();
            });
        });
    }

    // Handle form submission
    budgetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const budget = {
            category: document.getElementById('budgetCategory').value,
            amount: parseFloat(document.getElementById('budgetAmount').value),
            year: parseInt(document.getElementById('budgetYear').value),
            month: parseInt(document.getElementById('budgetMonth').value)
        };

        budgetManager.setBudget(budget);
        updateBudgetDisplay();
        updateTransactionSummary();
        budgetForm.reset();
        
        // Set default month to current month
        document.getElementById('budgetMonth').value = new Date().getMonth();
    });

    // Initial display update
    updateBudgetDisplay();
    updateTransactionSummary();
});