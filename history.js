// Get transactions from localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Cache currency object to avoid repeated localStorage access
let cachedCurrency = null;

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Get currency once and cache it
function getCurrency() {
    if (!cachedCurrency) {
        const storedCurrency = localStorage.getItem('currency');
        cachedCurrency = storedCurrency ? JSON.parse(storedCurrency) : { code: 'INR', symbol: '₹' };
    }
    return cachedCurrency;
}

// Format amount with currency
function formatAmount(amount) {
    const currency = getCurrency();
    return currency.symbol + parseFloat(amount).toFixed(2);
}

// Group transactions by month
function groupTransactionsByMonth(transactions) {
    const grouped = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        
        if (!grouped[monthYear]) {
            grouped[monthYear] = [];
        }
        grouped[monthYear].push(transaction);
    });
    
    return grouped;
}

// Create transaction element
function createTransactionElement(transaction, index) {
    const transactionEl = document.createElement('div');
    transactionEl.className = `transaction ${transaction.type}`;
    transactionEl.innerHTML = `
        <div class="transaction-info">
            <h3>${transaction.category || 'Uncategorized'}</h3>
            <div class="transaction-details">
                <p class="date">${formatDate(transaction.date)}</p>
                <p class="category">${transaction.category}</p>
                ${transaction.notes ? `<p class="notes">${transaction.notes}</p>` : ''}
            </div>
        </div>
        <div class="transaction-actions">
            <div class="amount ${transaction.type}">${formatAmount(transaction.amount)}</div>
            <div class="action-buttons">
                <button onclick="editTransaction(${index})" class="edit-btn"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTransaction(${index})" class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
    return transactionEl;
}

// Edit transaction
function editTransaction(index) {
    // Get the transaction from the array using the index
    const transactions = getTransactions();
    const transaction = transactions[index];
    
    // Store the transaction in localStorage for editing
    localStorage.setItem('editTransaction', JSON.stringify({
        index: index,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        category: transaction.category,
        notes: transaction.notes || ''
    }));
    window.location.href = 'add-entry.html?edit=true';
}

// Delete transaction
function deleteTransaction(index) {
    // Create confirmation popup
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup';
    
    // Blur the FAB button when popup is open
    const fabButton = document.querySelector('.fab');
    if (fabButton) {
        fabButton.style.opacity = '0';
        fabButton.style.pointerEvents = 'none';
    }
    
    popup.innerHTML = `
        <div class="confirmation-content">
            <h3><i class="fas fa-exclamation-triangle"></i> Confirm Deletion</h3>
            <p>Are you sure you want to delete this transaction?</p>
            <p>This action cannot be undone.</p>
            <div class="confirmation-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    
    // Add animation class after a small delay to trigger the animation
    setTimeout(() => {
        popup.classList.add('active');
    }, 10);
    
    // Handle button clicks
    const cancelBtn = popup.querySelector('.cancel-btn');
    const deleteBtn = popup.querySelector('.delete-btn');
    
    cancelBtn.addEventListener('click', () => {
        // Remove popup with animation
        popup.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(popup);
            
            // Restore FAB button visibility
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
        }, 300); // Match the CSS transition duration
    });
    
    deleteBtn.addEventListener('click', () => {
        // Perform deletion
        let transactions = getTransactions();
        transactions.splice(index, 1); // Remove the transaction at the specified index
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Remove popup with animation
        popup.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(popup);
            
            // Restore FAB button visibility
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
            
            displayTransactions();
        }, 300); // Match the CSS transition duration
    });
    
    // Close when clicking outside the popup content
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(popup);
                
                // Restore FAB button visibility
                if (fabButton) {
                    fabButton.style.opacity = '1';
                    fabButton.style.pointerEvents = 'auto';
                }
            }, 300);
        }
    });
}

// Display all transactions
function displayTransactions() {
    const transactionsContainer = document.getElementById('transactionList');
    transactionsContainer.innerHTML = '';
    
    const transactions = getTransactions();
    
    if (transactions.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="no-transactions">
                <i class="fas fa-history"></i>
                <p>No transactions found</p>
            </div>
        `;
        return;
    }
    
    const groupedTransactions = groupTransactionsByMonth(transactions);
    
    // Sort months in reverse chronological order
    const sortedMonths = Object.keys(groupedTransactions).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
    });
    
    sortedMonths.forEach(month => {
        const monthSection = document.createElement('div');
        monthSection.className = 'month-section';
        monthSection.innerHTML = `<h2 class="month-header">${month}</h2>`;
        
        const monthTransactions = groupedTransactions[month];
        monthTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const transactionsList = document.createElement('div');
        transactionsList.className = 'transactions-list';
        
        // Find the original indices of these transactions in the main transactions array
        const allTransactions = getTransactions();
        
        monthTransactions.forEach(transaction => {
            // Find the index of this transaction in the main array
            const index = allTransactions.findIndex(t => 
                t.amount === transaction.amount && 
                t.date === transaction.date && 
                t.type === transaction.type && 
                t.category === transaction.category
            );
            
            if (index !== -1) {
                transactionsList.appendChild(createTransactionElement(transaction, index));
            }
        });
        
        monthSection.appendChild(transactionsList);
        transactionsContainer.appendChild(monthSection);
    });
    
    // Update summary after displaying transactions
    updateTransactionSummary();
}

// Update transaction summary
function updateTransactionSummary() {
    const transactions = getTransactions();
    let totalExpense = 0;
    let totalIncome = 0;

    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'expense') {
            totalExpense += amount;
        } else {
            totalIncome += amount;
        }
    });

    const total = totalIncome - totalExpense;

    // Update the summary with proper currency formatting
    document.querySelector('.summary-item.expense .amount').textContent = 
        formatAmount(totalExpense);
    document.querySelector('.summary-item.income .amount').textContent = 
        formatAmount(totalIncome);
    document.querySelector('.summary-item.total .amount').textContent = 
        formatAmount(total);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayTransactions();
    updateTransactionSummary();
});