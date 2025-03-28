// Currency management for XpenseSmart
let isPopupShowing = false;

// Import hideFAB and showFAB functions if not already available in this scope
// Since they're defined in data-management.js, we need to check if they exist
if (typeof hideFAB !== 'function') {
    function hideFAB() {
        const fabButton = document.querySelector('.fab');
        if (fabButton) {
            fabButton.style.opacity = '0';
            fabButton.style.pointerEvents = 'none';
            fabButton.style.transform = 'translateX(-50%) scale(0.8)';
            fabButton.style.visibility = 'hidden';
        }
    }
}

if (typeof showFAB !== 'function') {
    function showFAB() {
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const searchPanel = document.querySelector('.search-panel');
        
        if ((!sidebarOverlay || !sidebarOverlay.classList.contains('active')) && 
            (!searchPanel || !searchPanel.classList.contains('active'))) {
            
            const fabButton = document.querySelector('.fab');
            if (fabButton) {
                fabButton.style.opacity = '1';
                fabButton.style.pointerEvents = 'auto';
                fabButton.style.transform = 'translateX(-50%) scale(1)';
                fabButton.style.visibility = 'visible';
            }
        }
    }
}

// Function to show currency selection popup
function showCurrencySelectionPopup() {
    // Prevent multiple popups
    if (isPopupShowing) return;
    isPopupShowing = true;
    
    // Close sidebar if it's open
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Hide FAB button completely
    hideFAB();
    
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'currencyPopupOverlay';
    overlay.style.display = 'block';
    
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
    
    const popup = document.createElement('div');
    popup.className = 'popup currency-popup';
    popup.id = 'currencyPopup';
    popup.innerHTML = `
        <div class="popup-icon">
            <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="popup-title">Select Currency</div>
        <div class="popup-message">Choose your preferred currency for the app</div>
        <div class="currency-options">
            ${currencyOptionsHTML}
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Add event listeners to currency options after popup is in DOM
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
            closeCurrencyPopup();
            
            // Update all currency displays
            updateAllCurrencyDisplays();
        });
    });
    
    // Add a close handler for clicking outside the popup
    overlay.addEventListener('click', function(e) {
        // Only close if clicking directly on the overlay (not on the popup content)
        if (e.target === overlay) {
            closeCurrencyPopup();
        }
    });
}

// Function to close currency popup
function closeCurrencyPopup() {
    const overlay = document.getElementById('currencyPopupOverlay');
    if (overlay) {
        overlay.remove();
    }
    isPopupShowing = false;
    
    // Show FAB button if appropriate (with a slight delay for animation)
    setTimeout(showFAB, 100);
}

// Function to get current currency from localStorage
function getCurrentCurrency() {
    const currency = localStorage.getItem('currency');
    return currency ? JSON.parse(currency) : { code: 'INR', symbol: '₹' }; // Default to INR
}

// Update currency display in header
function updateCurrencyDisplay() {
    const currency = getCurrentCurrency();
    const currencyDisplay = document.getElementById('currencyDisplay');
    
    if (currencyDisplay) {
        // Check if tooltip already exists
        let tooltip = currencyDisplay.querySelector('.currency-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'currency-tooltip';
            currencyDisplay.appendChild(tooltip);
        }
        
        tooltip.textContent = `${currency.code} (${currency.symbol})`;
        
        // Add click event to change currency
        if (!currencyDisplay.hasAttribute('data-has-click-handler')) {
            currencyDisplay.addEventListener('click', function() {
                showCurrencySelectionPopup();
            });
            currencyDisplay.setAttribute('data-has-click-handler', 'true');
        }
    }
}

// Format amount with current currency
function formatCurrencyAmount(amount) {
    const currency = getCurrentCurrency();
    return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
}

// Update all currency displays on the page
function updateAllCurrencyDisplays() {
    // Update currency display in header
    updateCurrencyDisplay();
    
    // Update transaction summary if on main page
    const expenseElement = document.querySelector('.expense .amount');
    const incomeElement = document.querySelector('.income .amount');
    const totalElement = document.querySelector('.total .amount');
    
    if (expenseElement || incomeElement || totalElement) {
        // Update data-amount attributes with current values
        if (expenseElement) {
            const amount = expenseElement.getAttribute('data-amount');
            expenseElement.textContent = formatCurrencyAmount(amount);
        }
        
        if (incomeElement) {
            const amount = incomeElement.getAttribute('data-amount');
            incomeElement.textContent = formatCurrencyAmount(amount);
        }
        
        if (totalElement) {
            const amount = totalElement.getAttribute('data-amount');
            totalElement.textContent = formatCurrencyAmount(amount);
        }
    }
    
    // Update other currency displays - find all elements with 'data-amount' attribute
    const amountElements = document.querySelectorAll('[data-amount]');
    amountElements.forEach(element => {
        const amount = element.getAttribute('data-amount');
        if (amount) {
            element.textContent = formatCurrencyAmount(amount);
        }
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if it's the first time user is visiting the app
    const isFirstVisit = !localStorage.getItem('currency');
    
    // If first visit, show currency selection popup
    if (isFirstVisit) {
        // Delay showing the popup to ensure the page is fully loaded
        setTimeout(() => {
            showCurrencySelectionPopup();
        }, 500);
    }
    
    // Set up the currency display in the header
    updateCurrencyDisplay();
});

// Add a function to change currency (for external calls)
function changeCurrency() {
    showCurrencySelectionPopup();
} 