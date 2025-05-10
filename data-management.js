// ... existing code ...
        // Add summary cards (centered)
        const cardWidth = 58;
        const cardHeight = 25;
        const cardY = 45;
        const cardSpacing = 8;
        const totalCardsWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (210 - totalCardsWidth) / 2;
        
        // Income Card - Use attractive green colors
        doc.setFillColor(46, 204, 113, 0.2); // Light green with transparency
        doc.roundedRect(startX, cardY, cardWidth, cardHeight, 3, 3, 'F');
        doc.setTextColor(39, 174, 96); // Darker green for text
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('INCOME', startX + cardWidth/2, cardY + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`${safeCurrencySymbol(currency.symbol)}${totalIncome.toFixed(2)}`, startX + cardWidth/2, cardY + 18, { align: 'center' });
        
        // Expense Card - Use attractive red colors
        doc.setFillColor(231, 76, 60, 0.2); // Light red with transparency
        doc.roundedRect(startX + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, 3, 3, 'F');
        doc.setTextColor(192, 57, 43); // Darker red for text
        doc.text('EXPENSE', startX + cardWidth + cardSpacing + cardWidth/2, cardY + 8, { align: 'center' });
        doc.text(`${safeCurrencySymbol(currency.symbol)}${totalExpense.toFixed(2)}`, startX + cardWidth + cardSpacing + cardWidth/2, cardY + 18, { align: 'center' });
        
        // Balance Card - Use attractive blue colors for positive, red for negative
        const isPositiveBalance = balance >= 0;
        if (isPositiveBalance) {
            doc.setFillColor(52, 152, 219, 0.2); // Light blue with transparency
            doc.roundedRect(startX + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(41, 128, 185); // Darker blue for text
        } else {
            doc.setFillColor(231, 76, 60, 0.2); // Light red with transparency
            doc.roundedRect(startX + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(192, 57, 43); // Darker red for text
        }
        doc.text('BALANCE', startX + (cardWidth + cardSpacing) * 2 + cardWidth/2, cardY + 8, { align: 'center' });
        doc.text(`${safeCurrencySymbol(currency.symbol)}${balance.toFixed(2)}`, startX + (cardWidth + cardSpacing) * 2 + cardWidth/2, cardY + 18, { align: 'center' });
// ... existing code ...

// Export functionality
function exportData() {
    // Check if transactions exist
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length === 0) {
        showNotification('No transactions to export', 'error');
        return;
    }

    try {
        // Verify jsPDF is available
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('PDF library not loaded');
        }

        // Create and show loading popup
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
        
        // Use safePDFExport for better browser compatibility
        setTimeout(() => {
            safePDFExport(() => {
                try {
                    // Create PDF
                    const doc = createPDFReport();
                    if (!doc) {
                        throw new Error('Failed to create PDF report');
                    }

                    // Get current date for filename
                    const date = new Date();
                    const filename = `XpenseSmart_Report_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.pdf`;

                    // Remove loading popup
                    if (loadingPopup.parentNode) {
                        loadingPopup.parentNode.removeChild(loadingPopup);
                    }
                    
                    // Save the PDF
                    doc.save(filename);
                    
                    // Show success popup with OK button
                    const successPopup = document.createElement('div');
                    successPopup.className = 'confirmation-popup active';
                    
                    successPopup.innerHTML = `
                        <div class="confirmation-content">
                            <h3><i class="fas fa-check-circle" style="color: #2ecc71;"></i> Success</h3>
                            <p>Your report has been generated successfully</p>
                            <div class="confirmation-buttons">
                                <button class="confirm-btn">OK</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(successPopup);
                    
                    // Handle OK button
                    successPopup.querySelector('.confirm-btn').addEventListener('click', () => {
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
                    
                    // Log the export event
                    if (typeof logActivity === 'function') {
                        logActivity('export', {
                            filename: filename,
                            transactionCount: transactions.length
                        });
                    }
                } catch (innerError) {
                    console.error('PDF Generation Error:', innerError);
                    
                    // Remove loading popup
                    if (loadingPopup.parentNode) {
                        loadingPopup.parentNode.removeChild(loadingPopup);
                    }
                    
                    // Show error popup
                    const errorPopup = document.createElement('div');
                    errorPopup.className = 'confirmation-popup active';
                    
                    errorPopup.innerHTML = `
                        <div class="confirmation-content">
                            <h3><i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i> Error</h3>
                            <p>Failed to generate PDF: ${innerError.message}</p>
                            <div class="confirmation-buttons">
                                <button class="cancel-btn">OK</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(errorPopup);
                    
                    // Handle OK button
                    errorPopup.querySelector('.cancel-btn').addEventListener('click', () => {
                        errorPopup.remove();
                        if (fabButton) {
                            fabButton.style.opacity = '1';
                            fabButton.style.pointerEvents = 'auto';
                        }
                    });
                    
                    // Close when clicking outside
                    errorPopup.addEventListener('click', function(e) {
                        if (e.target === errorPopup) {
                            errorPopup.remove();
                            if (fabButton) {
                                fabButton.style.opacity = '1';
                                fabButton.style.pointerEvents = 'auto';
                            }
                        }
                    });
                }
            });
        }, 500); // Small delay to show loading animation
        
    } catch (error) {
        console.error('Export Error:', error);
        showNotification('Failed to export report: ' + error.message, 'error');
    }
}

// Actual PDF export implementation
function createPDFReport() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    if (transactions.length === 0) {
        return null;
    }

    try {
        // Create a new jsPDF instance in portrait mode
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Define colors
        const primaryColor = [44, 62, 80]; // Dark blue
        const accentColor = [52, 152, 219]; // Lighter blue
        const expenseColor = [231, 76, 60]; // Red for expenses
        const incomeColor = [46, 204, 113]; // Green for income
        
        // Add a header background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 25, 'F');
        
        // Add logo/title (centered)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('XpenseSmart', 105, 12, { align: 'center' });
        
        // Add subtitle (centered)
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Transaction Report', 105, 19, { align: 'center' });
        
        // Get current currency for formatting
        const currency = getCurrentCurrency();
        
        // Function to safely encode currency symbol
        function safeCurrencySymbol(symbol) {
            const symbolMap = {
                '₹': 'Rs', // Indian Rupee
                '€': 'EUR', // Euro
                '£': 'GBP', // British Pound
                '¥': 'JPY', // Japanese Yen/Chinese Yuan
                '₽': 'RUB', // Russian Ruble
                '₩': 'KRW', // Korean Won
                '₴': 'UAH', // Ukrainian Hryvnia
                '₦': 'NGN', // Nigerian Naira
                '฿': 'THB', // Thai Baht
                '₫': 'VND'  // Vietnamese Dong
            };
            return symbolMap[symbol] || symbol;
        }
        
        // Add report info section
        doc.setFillColor(245, 245, 245); // Light gray background
        doc.rect(0, 25, 210, 15, 'F');
        
        // Add timestamp and currency info (centered)
        const now = new Date();
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.text(`Generated on: ${now.toLocaleString()}`, 105, 32, { align: 'center' });
        doc.text(`Currency: ${currency.code} (${safeCurrencySymbol(currency.symbol)})`, 105, 38, { align: 'center' });
        
        // Calculate financial summary
        const totalExpense = transactions.reduce((sum, t) => t.type === 'expense' ? sum + parseFloat(t.amount) : sum, 0);
        const totalIncome = transactions.reduce((sum, t) => t.type === 'income' ? sum + parseFloat(t.amount) : sum, 0);
        const balance = totalIncome - totalExpense;
        
        // Add summary cards (centered)
        const cardWidth = 58;
        const cardHeight = 25;
        const cardY = 45;
        const cardSpacing = 8;
        const totalCardsWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (210 - totalCardsWidth) / 2;
        
        // Income Card - Use attractive green colors
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(startX, cardY, cardWidth, cardHeight, 3, 3, 'F');
        doc.setTextColor(39, 174, 96); // Darker green for text
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('INCOME', startX + cardWidth/2, cardY + 8, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`${safeCurrencySymbol(currency.symbol)}${totalIncome.toFixed(2)}`, startX + cardWidth/2, cardY + 18, { align: 'center' });
        
        // Expense Card - Use attractive red colors
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(startX + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, 3, 3, 'F');
        doc.setTextColor(192, 57, 43); // Darker red for text
        doc.text('EXPENSE', startX + cardWidth + cardSpacing + cardWidth/2, cardY + 8, { align: 'center' });
        doc.text(`${safeCurrencySymbol(currency.symbol)}${totalExpense.toFixed(2)}`, startX + cardWidth + cardSpacing + cardWidth/2, cardY + 18, { align: 'center' });
        
        // Balance Card - Use attractive blue colors for positive, red for negative
        const isPositiveBalance = balance >= 0;
        if (isPositiveBalance) {
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(startX + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(41, 128, 185); // Darker blue for text
        } else {
            doc.setFillColor(245, 245, 245); 
            doc.roundedRect(startX + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, 3, 3, 'F');
            doc.setTextColor(192, 57, 43); // Darker red for text
        }
        doc.text('BALANCE', startX + (cardWidth + cardSpacing) * 2 + cardWidth/2, cardY + 8, { align: 'center' });
        doc.text(`${safeCurrencySymbol(currency.symbol)}${balance.toFixed(2)}`, startX + (cardWidth + cardSpacing) * 2 + cardWidth/2, cardY + 18, { align: 'center' });
        
        // Format date for the report
        function formatDateForReport(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }
        
        // Section title for transactions (centered)
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Transaction Details', 105, cardY + cardHeight + 15, { align: 'center' });
        
        // Add horizontal line (centered)
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(15, cardY + cardHeight + 17, 195, cardY + cardHeight + 17);
        
        // Prepare data for table with safe currency symbol
        const tableData = transactions.map(transaction => [
            transaction.type.toUpperCase(),
            transaction.category,
            `${safeCurrencySymbol(currency.symbol)}${parseFloat(transaction.amount).toFixed(2)}`,
            formatDateForReport(transaction.date)
        ]);
        
        // Customize table (centered)
        doc.autoTable({
            head: [['Type', 'Category', 'Amount', 'Date']],
            body: tableData,
            startY: cardY + cardHeight + 20,
            margin: { left: 15, right: 15 },
            headStyles: { 
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            bodyStyles: {
                fontSize: 10,
                lineWidth: 0.5,
                lineColor: [220, 220, 220],
                halign: 'center'
            },
            columnStyles: {
                0: { // Type column
                    cellWidth: 30,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                1: { // Category column
                    halign: 'center'
                },
                2: { // Amount column
                    halign: 'center'
                },
                3: { // Date column
                    halign: 'center'
                }
            },
            didDrawCell: function(data) {
                // Color the type cell based on transaction type
                if (data.section === 'body' && data.column.index === 0) {
                    const type = data.cell.raw;
                    if (type === 'EXPENSE') {
                        doc.setTextColor(expenseColor[0], expenseColor[1], expenseColor[2]);
                    } else if (type === 'INCOME') {
                        doc.setTextColor(incomeColor[0], incomeColor[1], incomeColor[2]);
                    }
                }
            },
            didParseCell: function(data) {
                // Return text to normal color after coloring
                if (data.section === 'body') {
                    doc.setTextColor(0, 0, 0);
                }
            }
        });
        
        // Add footer (centered)
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Footer with page number
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount} | XpenseSmart © ${new Date().getFullYear()}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            
            // Add a footer line (centered)
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(15, doc.internal.pageSize.height - 15, 195, doc.internal.pageSize.height - 15);
        }
        
        return doc;
    } catch (error) {
        console.error('PDF Creation Error:', error);
        return null;
    }
}

// Safely generate PDF (handles browser quirks)
function safePDFExport(callback) {
    // For browsers that might struggle with PDF generation
    try {
        // Check if jsPDF is available
        if (!window.jspdf || !window.jspdf.jsPDF) {
            console.error('jsPDF library not found');
            showNotification('PDF library not loaded. Please refresh the page.', 'error');
            return;
        }
        
        // Execute callback safely
        if (typeof callback === 'function') {
            callback();
        }
    } catch (error) {
        console.error('PDF Export Error:', error);
        showNotification('PDF generation failed: ' + error.message, 'error');
    }
}