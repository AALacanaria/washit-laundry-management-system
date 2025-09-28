// Business Receipt Generator Component
class BusinessReceiptGenerator {
    constructor() {
        this.bookingRef = null;
    }

    // Generate unique booking reference
    generateBookingReference() {
        return 'WSH-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 4).toUpperCase();
    }

    // Generate complete print receipt HTML
    generatePrintReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions, selectedShop = null) {
        this.bookingRef = this.generateBookingReference();

        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        const laundryItems = this.getLaundryItems();

        // Sanitize all inputs
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });

        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const isPickupAndSelfClaim = bookingData.serviceType === 'pickup_selfclaim';

        // Format self-claim details if applicable
        let selfClaimSchedule = '';
        if (isPickupAndSelfClaim && bookingData.selfClaimDate && bookingData.selfClaimTime) {
            const selfClaimDateStr = bookingData.selfClaimDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            selfClaimSchedule = `
                <div class="receipt-line">
                    <span class="label">Self-Claim Date:</span>
                    <span class="value">${selfClaimDateStr}</span>
                </div>
                <div class="receipt-line">
                    <span class="label">Self-Claim Time:</span>
                    <span class="value">${bookingData.selfClaimTime}</span>
                </div>
            `;
        }

        const shopSection = selectedShop ? `
                <div class="receipt-section">
                    <h4 class="section-title">LAUNDRY SHOP</h4>
                    <div class="receipt-line">
                        <span class="label">Shop Name:</span>
                        <span class="value">${this.escapeHtml(selectedShop.name)}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Address:</span>
                        <span class="value">${this.escapeHtml(selectedShop.address)}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Contact:</span>
                        <span class="value">${this.escapeHtml(selectedShop.phone)}</span>
                    </div>
                </div>` : '';

        return `
            <div class="booking-receipt">
                <div class="receipt-header">
                    <div class="business-header-grid">
                        <div class="business-header-content">
                            <img src="assets/images/washit-logo.png" alt="Wash.IT Logo" class="company-logo-print">
                            <div class="business-header-center">
                                <div class="company-info">
                                    <h2>WASH.IT</h2>
                                    <h3>LAUNDRY SERVICE</h3>
                                </div>
                                <div class="receipt-info">
                                    <p>BOOKING CONFIRMATION</p>
                                    <p>Reference: ${this.bookingRef}</p>
                                    <p>Date: ${timestamps.bookingDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                ${shopSection}
                <div class="receipt-section">
                    <h4 class="section-title">SERVICE DETAILS</h4>
                    <div class="receipt-line">
                        <span class="label">Booking Type:</span>
                        <span class="value">${isRush ? "Rush Service (1.5 days)" : "Standard Service (2-3 days)"}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Service Option:</span>
                        <span class="value">${this.formatServiceOption(sanitizedData.serviceOption)}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Pickup Date:</span>
                        <span class="value">${timestamps.selectedDateStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Pickup Time:</span>
                        <span class="value">${selectedTimeStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Payment Method:</span>
                        <span class="value">${this.formatPaymentMethod(this.getPaymentMethod())}</span>
                    </div>
                    ${selfClaimSchedule}
                    ${!isPickupAndSelfClaim ? `
                    <div class="receipt-line">
                        <span class="label">Est. Completion:</span>
                        <span class="value">${timestamps.completionDateStr}</span>
                    </div>` : ''}
                </div>

                <div class="receipt-section">
                    <h4 class="section-title">LAUNDRY ITEMS</h4>
                    ${this.formatLaundryItemsForPrint(laundryItems)}
                </div>

                <div class="receipt-section">
                    <h4 class="section-title">CUSTOMER INFORMATION</h4>
                    <div class="receipt-line">
                        <span class="label">Full Name:</span>
                        <span class="value">${sanitizedData.fullName}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Contact Number:</span>
                        <span class="value">${sanitizedData.contactNumber}</span>
                    </div>
                    ${sanitizedData.email ? `
                    <div class="receipt-line">
                        <span class="label">Email:</span>
                        <span class="value">${sanitizedData.email}</span>
                    </div>` : ''}
                    ${sanitizedData.barangay ? `
                    <div class="receipt-line">
                        <span class="label">Barangay:</span>
                        <span class="value">${sanitizedData.barangay}</span>
                    </div>` : ''}
                    ${sanitizedData.address ? `
                    <div class="receipt-line">
                        <span class="label">Address Details:</span>
                        <span class="value">${sanitizedData.address}</span>
                    </div>` : ''}
                    ${sanitizedData.specialInstructions ? `
                    <div class="receipt-line">
                        <span class="label">Special Instructions:</span>
                        <span class="value">${sanitizedData.specialInstructions}</span>
                    </div>` : ''}
                </div>

                <div class="receipt-section receipt-footer">
                    <h4 class="section-title">IMPORTANT INFORMATION</h4>
                    <div class="footer-content">
                        <p>• Confirmation call within 24 hours to ${sanitizedData.contactNumber}</p>
                        <p>• Please keep this booking reference: ${this.bookingRef}</p>
                        ${isPickupAndSelfClaim ?
                            `<p>• Pickup service at scheduled time on ${timestamps.selectedDateStr}</p>
                             <p>• Item collection at shop on ${bookingData.selfClaimDate ? bookingData.selfClaimDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'selected date'}</p>
                             <p>• Payment due upon item collection</p>` :
                            `<p>• ${sanitizedData.serviceOption.includes('pickup') ? 'Pickup' : 'Drop-off'} service at scheduled time</p>
                             <p>• Payment due upon ${sanitizedData.serviceOption.includes('delivery') ? 'delivery' : 'pickup'}</p>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods (copied from booking-confirmation.js)
    getFormattedTimestamps(bookingData) {
        const now = new Date();
        const selectedDate = bookingData.selectedDate;

        let completionDate = new Date(selectedDate);
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        completionDate.setDate(completionDate.getDate() + (isRush ? 1.5 : 3));

        return {
            bookingDate: now.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
            }) + ' at ' + now.toLocaleTimeString('en-PH', {
                hour: '2-digit', minute: '2-digit'
            }),
            selectedDateStr: selectedDate.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            completionDateStr: completionDate.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        };
    }

    getSelectedTimeString(bookingData) {
        // Check multiple possible sources for time slot data
        if (bookingData.selectedTimeSlot && bookingData.selectedTimeSlot.start && bookingData.selectedTimeSlot.end) {
            const startTime = this.formatTimeTo12Hour(bookingData.selectedTimeSlot.start);
            const endTime = this.formatTimeTo12Hour(bookingData.selectedTimeSlot.end);
            return `${startTime} - ${endTime}`;
        }

        // Check if time is stored differently
        if (bookingData.selectedTime) {
            return this.formatTimeTo12Hour(bookingData.selectedTime);
        }

        // Try to get from form elements
        const timeSlotElements = document.querySelectorAll('.time-slot.selected');
        if (timeSlotElements.length > 0) {
            const selectedSlot = timeSlotElements[0];
            const timeText = selectedSlot.textContent || selectedSlot.innerText;
            return timeText.trim();
        }

        return 'Time not selected';
    }

    formatTimeTo12Hour(time24) {
        if (!time24) return time24;

        // If it's already in 12-hour format, return as is
        if (time24.includes('AM') || time24.includes('PM')) {
            return time24;
        }

        // Convert 24-hour to 12-hour format
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;

        return `${hour12}:${minutes} ${ampm}`;
    }

    getPaymentMethod() {
        // Try multiple sources for payment method
        if (window.selectedPaymentMethod) {
            return window.selectedPaymentMethod;
        }

        const paymentInput = document.getElementById('paymentMethod');
        if (paymentInput && paymentInput.value) {
            return paymentInput.value;
        }

        const selectedCard = document.querySelector('.payment-card.selected');
        if (selectedCard) {
            return selectedCard.getAttribute('data-value');
        }

        return 'Not selected';
    }

    formatPaymentMethod(method) {
        const paymentMap = {
            'cash': 'Cash on Delivery',
            'cashless': 'Cashless Payment'
        };

        return paymentMap[method] || method;
    }

    formatServiceOption(serviceOption) {
        const serviceMap = {
            'pickup_delivery': 'Pickup & Delivery',
            'pickup_selfclaim': 'Pickup & Self-Claim',
            'dropoff_delivery': 'Drop-off & Delivery'
        };

        return serviceMap[serviceOption] || serviceOption;
    }

    sanitizeInputs(data) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = value.replace(/[<>]/g, '').trim();
            } else {
                sanitized[key] = value;
            }
        }
        sanitized.fullName = `${sanitized.firstName} ${sanitized.lastName}`.trim();
        return sanitized;
    }

    // Get laundry items data from the form
    getLaundryItems() {
        // Fallback: try to get from form inputs directly (most reliable)
        const items = [];
        const qtyInputs = document.querySelectorAll('.qty-input');
        qtyInputs.forEach((input, index) => {
            const quantity = parseInt(input.value, 10) || 0;
            if (quantity > 0) {
                const categoryMap = {
                    0: { key: 'everyday', name: 'Everyday Clothing', price: 25 },
                    1: { key: 'delicates', name: 'Delicates & Small Items', price: 25 },
                    2: { key: 'bedding', name: 'Bedding & Linens', price: 35 },
                    3: { key: 'heavy', name: 'Heavy & Bulky Items', price: 35 }
                };
                const category = categoryMap[index];
                if (category) {
                    items.push({
                        category: category.key,
                        name: category.name,
                        quantity: quantity,
                        unitPrice: category.price
                    });
                }
            }
        });

        // If we got items from form inputs, return them
        if (items.length > 0) {
            return items;
        }

        // Try to get from window.laundryItems first
        if (window.laundryItems && typeof window.laundryItems.getItems === 'function') {
            const windowItems = window.laundryItems.getItems();
            if (windowItems && windowItems.some(item => item.quantity > 0)) {
                return windowItems;
            }
        }

        // Fallback: try to get from hidden input
        const hiddenInput = document.getElementById('laundryItemsInput');
        if (hiddenInput && hiddenInput.value) {
            try {
                const parsedItems = JSON.parse(hiddenInput.value);
                if (parsedItems && parsedItems.some(item => item.quantity > 0)) {
                    return parsedItems;
                }
            } catch (e) {
                // Ignore parsing issues and fall back to collected form data
            }
        }

        return items;
    }

    // Format laundry items for print receipt (without prices)
    formatLaundryItemsForPrint(items) {
        if (!items || items.length === 0) {
            return `
                <div class="receipt-line">
                    <span class="label">No items selected</span>
                    <span class="value">-</span>
                </div>
            `;
        }

        let totalItems = 0;
        let itemsHTML = '';

        items.forEach(item => {
            if (item.quantity > 0) {
                totalItems += item.quantity;

                itemsHTML += `
                    <div class="receipt-line">
                        <span class="label">${item.name}:</span>
                        <span class="value">${item.quantity} item${item.quantity > 1 ? 's' : ''}</span>
                    </div>
                `;
            }
        });

        // Add summary row
        itemsHTML += `
            <div class="receipt-line">
                <span class="label"><strong>TOTAL ITEMS:</strong></span>
                <span class="value"><strong>${totalItems} item${totalItems > 1 ? 's' : ''}</strong></span>
            </div>
        `;

        return itemsHTML;
    }

    // Generate complete print window with embedded CSS
    generatePrintWindow(printReceiptHTML) {
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Wash.IT Receipt</title>
                <style>

                    
                    @page {
                        size: A4;
                        margin: 0.5in;
                    }

                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 11px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 15px;
                        background: white;
                        color: black;
                    }

                    .booking-receipt {
                        max-width: 480px;
                        margin: 0 auto;
                        border: 2px solid #000;
                        background: white;
                        padding: 0;
                    }

                    .receipt-header {
                        padding: 15px;
                        border-bottom: 2px solid #000;
                        background: #f8f8f8;
                    }

                    .business-header-grid {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        position: relative;
                    }

                    .business-header-content {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        position: relative;
                    }

                    .company-logo-print {
                        max-width: 75px;
                        max-height: 55px;
                        height: auto;
                        width: auto;
                        object-fit: contain;
                        filter: grayscale(100%);
                        margin-top: 3px;
                        position: absolute;
                        left: 15%;
                        top: 50%;
                        transform: translateY(-50%);
                    }

                    .business-header-center {
                        text-align: center;
                        width: 100%;
                    }

                    .company-info h2 {
                        font-size: 20px;
                        font-weight: bold;
                        margin: 0;
                        letter-spacing: 2px;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .company-info h3 {
                        font-size: 12px;
                        font-weight: normal;
                        margin: 2px 0 10px 0;
                        letter-spacing: 1px;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .receipt-info {
                        font-size: 10px;
                        margin-top: 10px;
                    }

                    .receipt-info p {
                        margin: 2px 0;
                    }

                    .receipt-section {
                        padding: 12px 15px;
                        border-bottom: 1px solid #ccc;
                    }

                    .receipt-section:last-child {
                        border-bottom: none;
                    }

                    .section-title {
                        text-align: center;
                        font-size: 12px;
                        font-weight: bold;
                        margin: 0 0 10px 0;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #ddd;
                        text-decoration: underline;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .receipt-line {
                        display: flex;
                        margin: 3px 0;
                        min-height: 16px;
                    }

                    .receipt-line .label {
                        width: 140px;
                        font-weight: bold;
                        flex-shrink: 0;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .receipt-line .value {
                        flex: 1;
                        padding-left: 10px;
                        border-bottom: 1px dotted #ccc;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .receipt-footer {
                        background: #f5f5f5;
                    }

                    .footer-content {
                        text-align: left;
                    }

                    .footer-content p {
                        margin: 4px 0;
                        font-size: 10px;
                        line-height: 1.3;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    strong {
                        font-weight: bold;
                    }

                    @media print {
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                ${printReceiptHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // Escape HTML special characters to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const businessReceiptGenerator = new BusinessReceiptGenerator();

// Export for use in other modules
window.businessReceiptGenerator = businessReceiptGenerator;
