// JavaScript for sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAB button position
    initFAB();
    
    // Get the current currency or use default
    const currency = getCurrentCurrency();
    
    // Helper function to format amounts with the current currency
    function formatCurrency(amount) {
        return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
    }
    
    // Initialize transaction data from localStorage or set default values
    let transactionData = {
        expense: 0,
        income: 0,
        total: 0
    };

    // Calculate summary from stored transactions
    function calculateSummary() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactionData = transactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'expense') {
                acc.expense += amount;
                acc.total -= amount;
            } else {
                acc.income += amount;
                acc.total += amount;
            }
            return acc;
        }, { expense: 0, income: 0, total: 0 });
    }

    // Update summary display
    function updateSummary() {
        calculateSummary();
        const expenseElement = document.querySelector('.expense .amount');
        const incomeElement = document.querySelector('.income .amount');
        const totalElement = document.querySelector('.total .amount');
        
        if (expenseElement) {
            expenseElement.setAttribute('data-amount', transactionData.expense.toFixed(2));
            expenseElement.textContent = formatCurrency(transactionData.expense);
        }
        if (incomeElement) {
            incomeElement.setAttribute('data-amount', transactionData.income.toFixed(2));
            incomeElement.textContent = formatCurrency(transactionData.income);
        }
        if (totalElement) {
            totalElement.setAttribute('data-amount', transactionData.total.toFixed(2));
            totalElement.textContent = formatCurrency(transactionData.total);
        }
    }

    // Initialize summary display
    updateSummary();

    // Under construction popup handler
    function showUnderConstructionPopup() {
        const popup = document.createElement('div');
        popup.className = 'confirmation-popup under-construction-popup active';
        
        // Blur the FAB button when popup is open
        const fabButton = document.querySelector('.fab');
        if (fabButton) {
            fabButton.style.opacity = '0';
            fabButton.style.pointerEvents = 'none';
        }
        
        popup.innerHTML = `
            <div class="confirmation-content">
                <h3><i class="fas fa-tools"></i>Under Construction</h3>
                <p>This feature is currently being developed</p>
                <div class="confirmation-buttons">
                    <button class="cancel-btn">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        popup.querySelector('.cancel-btn').addEventListener('click', () => {
            popup.remove();
            
            // Restore FAB button visibility
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
        });
        
        // Also close when clicking outside the popup content
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                popup.remove();
                
                // Restore FAB button visibility
                if (fabButton) {
                    fabButton.style.opacity = '1';
                    fabButton.style.pointerEvents = 'auto';
                }
            }
        });
    }

    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // Function to update transaction history
    function updateTransactionHistory() {
        const transactionList = document.getElementById('transactionList');
        if (!transactionList) return; // Skip if not on the main page
        
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Sort transactions by date (newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Clear current list
        transactionList.innerHTML = '';

        if (transactions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'no-transactions';
            emptyState.innerHTML = `
                <div class="empty-state">
                    <p style="text-align: center; margin-top: 70px;">No recent transactions</p>
                </div>
            `;
            transactionList.appendChild(emptyState);
            return;
        }

        // Add transactions to the list - limit to 10 most recent for better performance
        const recentTransactions = transactions.slice(0, 10);
        recentTransactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = `transaction-item ${transaction.type}`;
            
            const amount = parseFloat(transaction.amount);
            
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}" data-amount="${amount.toFixed(2)}">${formatCurrency(amount)}</div>
            `;
            
            transactionList.appendChild(transactionItem);
        });
    }

    // Initialize transaction history
    updateTransactionHistory();

    // Listen for custom event from add-entry page
    window.addEventListener('transaction-added', function(e) {
        const transaction = e.detail;
        const amount = parseFloat(parseFloat(transaction.amount).toFixed(2));
        if (transaction.type === 'expense') {
            transactionData.expense += amount;
            transactionData.total -= amount;
        } else {
            transactionData.income += amount;
            transactionData.total += amount;
        }
        updateSummary();
        updateTransactionHistory();
    });

    // Listen for transaction edited event
    window.addEventListener('transaction-edited', function(e) {
        // Recalculate all transaction data from scratch since we don't know what changed
        calculateSummary();
        updateSummary();
        updateTransactionHistory();
    });

    // Listen for currency change event
    window.addEventListener('currency-changed', function() {
        updateSummary();
        updateTransactionHistory();
    });

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    

    // Open sidebar
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar is open
        
        // Completely hide FAB button when sidebar is open
        if (fab) {
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
            fab.style.visibility = 'hidden';
        }
    });

    // Close sidebar function
    function closeSidebarFunc() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
        
        // Show FAB immediately without delay
        if (fab && !searchPanel?.classList.contains('active')) {
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
            fab.style.visibility = 'visible';
        }
    }

    // Close sidebar when clicking the close button
    closeSidebar.addEventListener('click', closeSidebarFunc);

    // Close sidebar when clicking the overlay
    sidebarOverlay.addEventListener('click', closeSidebarFunc);

    // Search functionality
    const searchIcon = document.querySelector('.search-icon');
    const searchPanel = document.querySelector('.search-panel');
    
    if (searchIcon && searchPanel && fab) {
        searchIcon.addEventListener('click', function() {
            searchPanel.classList.toggle('active');
            document.body.style.overflow = searchPanel.classList.contains('active') ? 'hidden' : '';
            
            // Toggle FAB visibility based on search panel state
            if (searchPanel.classList.contains('active')) {
                fab.style.opacity = '0';
                fab.style.pointerEvents = 'none';
            } else if (!sidebarOverlay.classList.contains('active')) {
                // Only restore FAB if sidebar is not open
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'auto';
            }
        });

        // Close search panel when clicking outside
        document.addEventListener('click', function(event) {
            if (searchPanel.classList.contains('active') && 
                !event.target.closest('.search-panel') && 
                !event.target.closest('.search-icon')) {
                searchPanel.classList.remove('active');
                document.body.style.overflow = '';
                
                // Restore FAB only if sidebar is not open
                if (!sidebarOverlay.classList.contains('active')) {
                    fab.style.opacity = '1';
                    fab.style.pointerEvents = 'auto';
                }
            }
        });

        // Close search panel on ESC press
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchPanel.classList.contains('active')) {
                searchPanel.classList.remove('active');
                document.body.style.overflow = '';
                
                // Restore FAB only if sidebar is not open
                if (!sidebarOverlay.classList.contains('active')) {
                    fab.style.opacity = '1';
                    fab.style.pointerEvents = 'auto';
                }
            }
        });
    }

    // Handle sidebar toggle and FAB button visibility
    const fab = document.querySelector('.fab');

    if (sidebarOverlay && fab) {
        // Direct handling for sidebar toggle events
        sidebarToggle.addEventListener('click', function() {
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
            fab.style.visibility = 'hidden';
        });
        
        // Also restore FAB button when sidebar is closed - without delay
        closeSidebar.addEventListener('click', function() {
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
            fab.style.visibility = 'visible';
        });
        
        sidebarOverlay.addEventListener('click', function() {
            fab.style.opacity = '1';
            fab.style.pointerEvents = 'auto';
            fab.style.visibility = 'visible';
        });
        
        // Use MutationObserver as a backup
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (sidebarOverlay.classList.contains('active')) {
                        fab.style.opacity = '0';
                        fab.style.pointerEvents = 'none';
                        fab.style.visibility = 'hidden';
                    } else {
                        fab.style.opacity = '1';
                        fab.style.pointerEvents = 'auto';
                        fab.style.visibility = 'visible';
                    }
                }
            });
        });

        observer.observe(sidebarOverlay, { attributes: true });
    }

    // FAB button click handler
    const fabButton = document.querySelector('.fab-button');
    if (fabButton) {
        fabButton.addEventListener('click', function() {
            const currentPage = window.location.pathname.split('/').pop();
            let redirectTo = 'add-entry.html';
            
            // Determine redirect based on current page
            switch (currentPage) {
                case 'history.html':
                case 'analysis.html':
                case 'budgets.html':
                case 'index.html':
                    redirectTo = 'add-entry.html';
                    break;
                default:
                    redirectTo = 'index.html';
            }

            // Remove fade-out and delay for instant navigation
            window.location.href = redirectTo;
        });
    }

    // Add currency settings option to sidebar menu
    const sidebarMenu = document.querySelector('.sidebar-menu:nth-of-type(2)');
    if (sidebarMenu) {
        // No need to create the list item or add event listeners
        // as they're already defined in the HTML with onclick handler
    }
});

// Initialize FAB button position with optimized performance
function initFAB() {
    const fabButton = document.querySelector('.fab');
    if (fabButton) {
        // Show FAB only on Record section (index.html)
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
            // Show FAB on Record section - apply styles
            fabButton.style.cssText = `
                position: fixed !important;
                bottom: 80px !important;
                right: 16px !important;
                left: auto !important;
                transform: none !important;
                opacity: 1 !important;
                z-index: 1001 !important;
                pointer-events: auto !important;
                visibility: visible !important;
                transition: none !important;
                display: block !important;
                width: 56px !important;
                height: 56px !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            
            // Add visible class for CSS targeting
            fabButton.classList.add('visible');
            
            // Ensure the FAB position is not affected by other elements
            document.addEventListener('currency-changed', function() {
                // Reapply position styles after currency change
                setTimeout(function() {
                    fabButton.style.cssText = `
                        position: fixed !important;
                        bottom: 80px !important;
                        right: 16px !important;
                        left: auto !important;
                        transform: none !important;
                        opacity: 1 !important;
                        z-index: 1001 !important;
                        pointer-events: auto !important;
                        visibility: visible !important;
                        transition: none !important;
                        display: block !important;
                        width: 56px !important;
                        height: 56px !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                }, 0);
            });
        } else {
            // Hide FAB on other sections - ensure it's completely hidden
            fabButton.style.cssText = `
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            `;
            // Remove visible class
            fabButton.classList.remove('visible');
        }
    }
}

// Export Reports functionality - DEPRECATED - Using exportData() from data-management.js instead
/*
function exportReports() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length === 0) {
        showNotification('No transactions to export', 'warning');
        return;
    }

    // Show loading popup
    const loadingPopup = document.createElement('div');
    loadingPopup.className = 'confirmation-popup active';
    
    // Blur the FAB button when popup is open
    const fabButton = document.querySelector('.fab');
    if (fabButton) {
        fabButton.style.opacity = '0';
        fabButton.style.pointerEvents = 'none';
    }
    
    loadingPopup.innerHTML = `
        <div class="confirmation-content">
            <h3><i class="fas fa-spinner fa-spin"></i> Generating PDF</h3>
            <p>Please wait while we generate your report...</p>
        </div>
    `;
    
    document.body.appendChild(loadingPopup);

    // Use the safe PDF export function from data-management.js
    setTimeout(() => {
        safePDFExport(function() {
            try {
                const doc = createPDFReport();
                if (doc) {
                    // Remove loading popup
                    loadingPopup.remove();
                    
                    // Save the PDF
                    doc.save('xpensesmart_report.pdf');
                    
                    // Show success popup
                    const successPopup = document.createElement('div');
                    successPopup.className = 'confirmation-popup active';
                    
                    successPopup.innerHTML = `
                        <div class="confirmation-content">
                            <h3><i class="fas fa-check-circle" style="color: #00b894;"></i> Success</h3>
                            <p>Your report has been generated successfully</p>
                            <div class="confirmation-buttons">
                                <button class="cancel-btn">OK</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(successPopup);
                    
                    // Handle OK button
                    successPopup.querySelector('.cancel-btn').addEventListener('click', () => {
                        successPopup.remove();
                        if (fabButton) {
                            fabButton.style.opacity = '1';
                            fabButton.style.pointerEvents = 'auto';
                        }
                    });
                    
                    // Close when clicking outside
                    successPopup.addEventListener('click', function(e) {
                        if (e.target === successPopup) {
                            successPopup.remove();
                            if (fabButton) {
                                fabButton.style.opacity = '1';
                                fabButton.style.pointerEvents = 'auto';
                            }
                        }
                    });
                } else {
                    loadingPopup.remove();
                    showNotification('Failed to create PDF', 'error');
                    if (fabButton) {
                        fabButton.style.opacity = '1';
                        fabButton.style.pointerEvents = 'auto';
                    }
                }
            } catch (error) {
                console.error('PDF Export Error:', error);
                loadingPopup.remove();
                showNotification('Failed to export report. Please try again.', 'error');
                if (fabButton) {
                    fabButton.style.opacity = '1';
                    fabButton.style.pointerEvents = 'auto';
                }
            }
        });
    }, 800); // Small delay to show loading popup
}
*/

// Reset confirmation popup
function showResetConfirmationPopup() {
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup active';
    
    // Blur the FAB button when popup is open
    const fabButton = document.querySelector('.fab');
    if (fabButton) {
        fabButton.style.opacity = '0';
        fabButton.style.pointerEvents = 'none';
    }
    
    popup.innerHTML = `
        <div class="confirmation-content">
            <h3><i class="fas fa-exclamation-triangle"></i>Reset All Data</h3>
            <p>Are you sure you want to delete all transactions? This action cannot be undone.</p>
            <div class="confirmation-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="delete-btn">Delete All</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Handle cancel button
    popup.querySelector('.cancel-btn').addEventListener('click', () => {
        popup.remove();
        if (fabButton) {
            fabButton.style.opacity = '1';
            fabButton.style.pointerEvents = 'auto';
        }
    });
    
    // Handle delete button
    popup.querySelector('.delete-btn').addEventListener('click', () => {
        // Remove transactions from local storage
        localStorage.removeItem('transactions');
        
        // Reset UI
        const expenseElement = document.querySelector('.expense .amount');
        const incomeElement = document.querySelector('.income .amount');
        const totalElement = document.querySelector('.total .amount');
        
        if (expenseElement) {
            expenseElement.setAttribute('data-amount', '0.00');
            expenseElement.textContent = formatCurrency(0);
        }
        if (incomeElement) {
            incomeElement.setAttribute('data-amount', '0.00');
            incomeElement.textContent = formatCurrency(0);
        }
        if (totalElement) {
            totalElement.setAttribute('data-amount', '0.00');
            totalElement.textContent = formatCurrency(0);
        }
        
        // Update transaction history
        const transactionList = document.getElementById('transactionList');
        if (transactionList) {
            transactionList.innerHTML = `
                <div class="no-transactions">
                    <div class="empty-state">
                        <p style="text-align: center; margin-top: 70px;">No recent transactions</p>
                    </div>
                </div>
            `;
        }
        
        popup.remove();
        if (fabButton) {
            fabButton.style.opacity = '1';
            fabButton.style.pointerEvents = 'auto';
        }
        showNotification('All data has been reset', 'success');
    });
    
    // Close when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
        }
    });
}

// Notification system
function showNotification(message, type = 'info', persistent = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    const icon = document.createElement('i');
    icon.className = 'fas';
    
    // Set icon based on type
    switch (type) {
        case 'success':
            icon.className += ' fa-check-circle';
            break;
        case 'error':
            icon.className += ' fa-exclamation-circle';
            break;
        case 'warning':
            icon.className += ' fa-exclamation-triangle';
            break;
        default:
            icon.className += ' fa-info-circle';
    }
    
    // Create message element
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    
    // Add loading spinner for persistent notifications
    if (persistent) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        notification.appendChild(spinner);
    }
    
    // Add icon and message to notification
    notification.appendChild(icon);
    notification.appendChild(messageEl);
    
    // Add close button if not persistent
    if (!persistent) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-notification';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            // Remove immediately without fade animation
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        notification.appendChild(closeBtn);
    }
    
    // Add notification to document
    document.body.appendChild(notification);
    
    // Auto-remove non-persistent notifications after 4 seconds
    if (!persistent) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
    
    // Return notification element so it can be removed later
    return notification;
}

// Currency Selection Popup
function showCurrencySelectionPopup() {
    const popup = document.createElement('div');
    popup.className = 'confirmation-popup active';
    
    // Blur the FAB button when popup is open
    const fabButton = document.querySelector('.fab');
    if (fabButton) {
        fabButton.style.opacity = '0';
        fabButton.style.pointerEvents = 'none';
    }
    
    const popularCurrencies = [
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' }
    ];
    
    let currencyOptionsHTML = '';
    popularCurrencies.forEach(currency => {
        currencyOptionsHTML += `
            <div class="currency-option" data-code="${currency.code}" data-symbol="${currency.symbol}">
                <span class="currency-symbol">${currency.symbol}</span>
                <span class="currency-details">
                    <span class="currency-code">${currency.code}</span>
                    <span class="currency-name">${currency.name}</span>
                </span>
            </div>
        `;
    });
    
    popup.innerHTML = `
        <div class="confirmation-content currency-popup">
            <h3><i class="fas fa-money-bill-wave"></i> Select Currency</h3>
            <p>Choose your preferred currency for the app</p>
            <div class="currency-options">
                ${currencyOptionsHTML}
            </div>
            <div class="confirmation-buttons">
                <button class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Add event listeners to currency options
    const options = popup.querySelectorAll('.currency-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const symbol = this.getAttribute('data-symbol');
            
            // Save to localStorage
            localStorage.setItem('currency', JSON.stringify({
                code: code,
                symbol: symbol
            }));
            
            // Close popup
            popup.remove();
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
            
            // Update currency displays
            const event = new CustomEvent('currency-changed');
            window.dispatchEvent(event);
            
            showNotification(`Currency changed to ${code}`, 'success');
        });
    });
    
    // Handle cancel button
    popup.querySelector('.cancel-btn').addEventListener('click', () => {
        popup.remove();
        if (fabButton) {
            fabButton.style.opacity = '1';
            fabButton.style.pointerEvents = 'auto';
        }
    });
    
    // Close when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
            }
        }
    });
}

// Get current currency from localStorage
function getCurrentCurrency() {
    const currency = localStorage.getItem('currency');
    return currency ? JSON.parse(currency) : { code: 'INR', symbol: '₹' }; // Default to INR
}

// Format currency with the current currency symbol
function formatCurrency(amount) {
    const currency = getCurrentCurrency();
    return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
}

// Activity logging function
function logActivity(action, details = {}) {
    try {
        // Get existing logs
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        
        // Create new log entry
        const log = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details
        };
        
        // Add to logs array (limit to 100 most recent)
        logs.unshift(log);
        if (logs.length > 100) {
            logs.length = 100; // Truncate to 100 entries
        }
        
        // Save back to localStorage
        localStorage.setItem('activity_logs', JSON.stringify(logs));
        
        // Optionally, you could send logs to a server here
        console.log(`Activity logged: ${action}`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
