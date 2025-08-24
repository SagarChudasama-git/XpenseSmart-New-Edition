// currency-utils.js - Advanced currency handling utilities for XpenseSmart

// Default exchange rates (relative to USD)
// These would ideally come from an API in a production environment
const DEFAULT_EXCHANGE_RATES = {
    'USD': 1.0,
    'EUR': 0.85,
    'GBP': 0.73,
    'JPY': 110.42,
    'INR': 74.5,
    'CNY': 6.45,
    'CAD': 1.25,
    'AUD': 1.36,
    // Add more currencies as needed
};

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹',
    'CNY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    // Add more currencies as needed
};

// Currency decimal places (some currencies like JPY don't use decimal places)
const CURRENCY_DECIMALS = {
    'JPY': 0,
    'KRW': 0,
    'IDR': 0,
    // Default for other currencies is 2
};

/**
 * Get current currency information from localStorage
 * @returns {Object} Currency object with code and symbol
 */
function getCurrentCurrency() {
    try {
        const currency = localStorage.getItem('currency');
        if (currency) {
            return JSON.parse(currency);
        }
    } catch (error) {
        console.error('Error parsing currency from localStorage:', error);
    }
    
    // Default to INR if not found or error
    return { code: 'INR', symbol: '₹' };
}

/**
 * Format amount with proper currency symbol and decimal places
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Optional currency code (defaults to current currency)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currencyCode = null) {
    // Get currency info
    const currency = currencyCode ? 
        { code: currencyCode, symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode } : 
        getCurrentCurrency();
    
    // Determine decimal places
    const decimals = CURRENCY_DECIMALS[currency.code] !== undefined ? 
        CURRENCY_DECIMALS[currency.code] : 2;
    
    // Format the amount
    return `${currency.symbol}${parseFloat(amount).toFixed(decimals)}`;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} exchangeRates - Optional custom exchange rates
 * @returns {number} Converted amount
 */
function convertCurrency(amount, fromCurrency, toCurrency, exchangeRates = DEFAULT_EXCHANGE_RATES) {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[toCurrency];
}

/**
 * Format amount with proper currency symbol after conversion
 * @param {number} amount - The amount to convert and format
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} exchangeRates - Optional custom exchange rates
 * @returns {string} Formatted currency string after conversion
 */
function formatConvertedCurrency(amount, fromCurrency, toCurrency, exchangeRates = DEFAULT_EXCHANGE_RATES) {
    const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency, exchangeRates);
    return formatCurrency(convertedAmount, toCurrency);
}

/**
 * Get decimal precision for a specific currency
 * @param {string} currencyCode - The currency code
 * @returns {number} Number of decimal places
 */
function getCurrencyPrecision(currencyCode = null) {
    const currency = currencyCode || getCurrentCurrency().code;
    return CURRENCY_DECIMALS[currency] !== undefined ? CURRENCY_DECIMALS[currency] : 2;
}

/**
 * Perform precise currency calculation (avoiding floating point errors)
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {string} operation - Operation to perform ('add', 'subtract', 'multiply', 'divide')
 * @param {number} precision - Decimal precision (defaults to currency precision)
 * @returns {number} Result of calculation
 */
function preciseCurrencyCalculation(a, b, operation, precision = null) {
    // If precision not specified, use current currency precision
    if (precision === null) {
        precision = getCurrencyPrecision();
    }
    
    // Convert to integers to avoid floating point errors
    const factor = Math.pow(10, precision);
    const aInt = Math.round(a * factor);
    const bInt = Math.round(b * factor);
    
    let result;
    switch (operation) {
        case 'add':
            result = aInt + bInt;
            break;
        case 'subtract':
            result = aInt - bInt;
            break;
        case 'multiply':
            result = (aInt * bInt) / factor;
            break;
        case 'divide':
            result = (aInt / bInt) * factor;
            break;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
    
    return result / factor;
}

// Export functions for use in other files
window.CurrencyUtils = {
    getCurrentCurrency,
    formatCurrency,
    convertCurrency,
    formatConvertedCurrency,
    getCurrencyPrecision,
    preciseCurrencyCalculation,
    CURRENCY_SYMBOLS,
    CURRENCY_DECIMALS
};