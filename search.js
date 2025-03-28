// Search functionality for XpenseSmart

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-page-input');
    const searchResults = document.querySelector('.search-results');
    const backButton = document.querySelector('.back-button');

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

    // Function to perform search
    function performSearch(query) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        query = query.toLowerCase().trim();

        if (!query) {
            searchResults.innerHTML = '<div class="no-results">Enter a search term to find transactions</div>';
            return;
        }

        const filteredTransactions = transactions.filter(transaction => {
            const amount = transaction.amount.toString();
            const category = transaction.category.toLowerCase();
            const date = formatDate(transaction.date).toLowerCase();
            const type = transaction.type.toLowerCase();

            return amount.includes(query) ||
                   category.includes(query) ||
                   date.includes(query) ||
                   type.includes(query);
        });

        displaySearchResults(filteredTransactions);
    }

    // Function to display search results
    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No transactions found</div>';
            return;
        }

        const resultsHTML = results.map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-category">${transaction.category}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">₹${parseFloat(transaction.amount).toFixed(2)}</div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Initialize empty search state
    searchResults.innerHTML = '<div class="no-results">Enter a search term to find transactions</div>';
});