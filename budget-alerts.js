// Budget Alert System
class BudgetAlertSystem {
    constructor() {
        this.alertShown = false;
        this.alertTimeoutId = null;
        this.alertsHistory = JSON.parse(localStorage.getItem('budget_alerts_history') || '{}');
    }

    // Check if budget is exceeded for any category in the current month
    checkBudgetExceeded() {
        const budgetManager = new BudgetManager();
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        // Get all budgets for the current month
        const currentBudgets = budgetManager.getAllBudgets().filter(budget => 
            budget.year === currentYear && budget.month === currentMonth
        );
        
        // Check each budget
        for (const budget of currentBudgets) {
            const spending = budgetManager.calculateSpending(
                budget.category, 
                budget.year, 
                budget.month
            );
            
            // If spending exceeds budget and alert hasn't been shown for this category this month
            if (spending > budget.amount) {
                const budgetKey = `${budget.category}-${budget.year}-${budget.month}`;
                
                // Only show alert if it hasn't been shown for this specific budget in this period
                if (!this.alertsHistory[budgetKey]) {
                    const exceedAmount = spending - budget.amount;
                    const message = `You've spent ${budgetManager.formatCurrency(exceedAmount)} over your ${budget.category} budget.`;
                    
                    // Show the alert
                    this.showBudgetAlert('Budget Limit Exceeded!', message);
                    
                    // Mark this alert as shown
                    this.alertsHistory[budgetKey] = Date.now();
                    localStorage.setItem('budget_alerts_history', JSON.stringify(this.alertsHistory));
                    
                    // Only show one alert at a time
                    break;
                }
            }
        }
        
        // Also check total budget if it exists
        const totalBudget = currentBudgets.reduce((sum, budget) => sum + budget.amount, 0);
        if (totalBudget > 0) {
            let totalSpending = 0;
            
            // Calculate total spending across all categories
            currentBudgets.forEach(budget => {
                totalSpending += budgetManager.calculateSpending(
                    budget.category, 
                    budget.year, 
                    budget.month
                );
            });
            
            // Check if total spending exceeds total budget
            if (totalSpending > totalBudget) {
                const budgetKey = `total-${currentYear}-${currentMonth}`;
                
                // Only show alert if it hasn't been shown for the total budget this period
                if (!this.alertsHistory[budgetKey]) {
                    const exceedAmount = totalSpending - totalBudget;
                    const message = `Your total spending has exceeded your monthly budget by ${budgetManager.formatCurrency(exceedAmount)}.`;
                    
                    // Show the alert
                    this.showBudgetAlert('Total Budget Exceeded!', message);
                    
                    // Mark this alert as shown
                    this.alertsHistory[budgetKey] = Date.now();
                    localStorage.setItem('budget_alerts_history', JSON.stringify(this.alertsHistory));
                }
            }
        }
    }

    // Show budget alert
    showBudgetAlert(title, message) {
        // If an alert is already showing, clear its timeout
        if (this.alertTimeoutId) {
            clearTimeout(this.alertTimeoutId);
            this.removeExistingAlert();
        }
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = 'budget-alert';
        alertElement.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
            </div>
            <button class="close-alert">&times;</button>
        `;
        
        // Add to DOM
        document.body.appendChild(alertElement);
        
        // Add close button event listener
        alertElement.querySelector('.close-alert').addEventListener('click', () => {
            this.removeAlert(alertElement);
        });
        
        // Show the alert with animation
        setTimeout(() => {
            alertElement.classList.add('show');
        }, 10);
        
        // Auto-dismiss after 5 seconds
        this.alertTimeoutId = setTimeout(() => {
            this.removeAlert(alertElement);
        }, 5000);
        
        this.alertShown = true;
    }
    
    // Remove an alert with animation
    removeAlert(alertElement) {
        alertElement.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
            this.alertShown = false;
            this.alertTimeoutId = null;
        }, 300);
    }
    
    // Remove any existing alerts
    removeExistingAlert() {
        const existingAlert = document.querySelector('.budget-alert');
        if (existingAlert) {
            existingAlert.parentNode.removeChild(existingAlert);
        }
        this.alertShown = false;
    }
}

// Initialize the budget alert system
document.addEventListener('DOMContentLoaded', function() {
    const budgetAlertSystem = new BudgetAlertSystem();
    
    // Check for budget alerts on page load
    budgetAlertSystem.checkBudgetExceeded();
    
    // Listen for transaction added event
    window.addEventListener('transaction-added', function() {
        // Check for budget alerts whenever a new transaction is added
        budgetAlertSystem.checkBudgetExceeded();
    });
    
    // Listen for transaction edited event if it exists
    window.addEventListener('transaction-edited', function() {
        // Check for budget alerts whenever a transaction is edited
        budgetAlertSystem.checkBudgetExceeded();
    });
}); 