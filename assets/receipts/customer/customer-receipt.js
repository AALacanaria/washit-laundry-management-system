// Customer Receipt Generator Component
class CustomerReceiptGenerator {
    constructor() {
        this.bookingRef = null;
    }

    // Generate unique booking reference
    generateBookingReference() {
        return 'WSH-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 4).toUpperCase();
    }

    // Generate complete receipt HTML for modal display
    generateModalReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        this.bookingRef = this.generateBookingReference();

        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        const paymentMethod = this.getPaymentMethod();
        const laundryItems = this.getLaundryItems();
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });

        return this.buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData, paymentMethod, laundryItems);
    }

    // Build receipt HTML with proper spacing
    buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData, paymentMethod, laundryItems) {
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const isPickupAndSelfClaim = bookingData.serviceType === 'pickup_selfclaim';

        // Format service option properly
        const formattedServiceOption = this.formatServiceOption(sanitizedData.serviceOption);

        let selfClaimSchedule = '';
        if (isPickupAndSelfClaim && bookingData.selfClaimDate && bookingData.selfClaimTime) {
            const selfClaimDateStr = bookingData.selfClaimDate.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            selfClaimSchedule = `
                <div class="receipt-row">
                    <span class="receipt-label">🏪 Self-Claim Date:</span>
                    <span class="receipt-value">${selfClaimDateStr}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">🕐 Self-Claim Time:</span>
                    <span class="receipt-value">${bookingData.selfClaimTime}</span>
                </div>
            `;
        }

        return `
            <div class="receipt-container">
                <div class="receipt-header-section">
                    <div class="receipt-header-grid">
                        <div class="receipt-header-content">
                            <img src="assets/images/washit-logo.png" alt="Wash.IT Logo" class="company-logo">
                            <div class="receipt-header-center">
                                <h4>Wash.IT Laundry Service</h4>
                                <p class="booking-reference">Booking Reference: <strong>${this.bookingRef}</strong></p>
                                <p class="booking-time">Booked on: ${timestamps.bookingDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="receipt-content-section">
                    <h5>📋 Service Details</h5>
                    <div class="receipt-row">
                        <span class="receipt-label">Booking Type:</span>
                        <span class="receipt-value">${isRush ? "🚀 Rush Booking (1.5 days delivery)" : "⏰ Normal Booking (2-3 days delivery)"}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Service Option:</span>
                        <span class="receipt-value">${formattedServiceOption}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">📅 Pickup Date:</span>
                        <span class="receipt-value">${timestamps.selectedDateStr}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">🕐 Pickup Time:</span>
                        <span class="receipt-value">${selectedTimeStr}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">💳 Payment Method:</span>
                        <span class="receipt-value">${this.formatPaymentMethod(paymentMethod)}</span>
                    </div>
                    ${selfClaimSchedule}
                    ${!isPickupAndSelfClaim ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Estimated Completion:</span>
                        <span class="receipt-value">${timestamps.completionDateStr}</span>
                    </div>` : ''}
                </div>
                <div class="receipt-content-section">
                    <h5>🧺 Laundry Items</h5>
                    ${this.formatLaundryItems(laundryItems)}
                </div>
                <div class="receipt-content-section">
                    <h5>👤 Customer Information</h5>
                    <div class="receipt-row">
                        <span class="receipt-label">Full Name:</span>
                        <span class="receipt-value">${sanitizedData.fullName}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Contact Number:</span>
                        <span class="receipt-value">${sanitizedData.contactNumber}</span>
                    </div>
                    ${sanitizedData.email ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Email:</span>
                        <span class="receipt-value">${sanitizedData.email}</span>
                    </div>` : ''}
                    ${sanitizedData.barangay ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Barangay:</span>
                        <span class="receipt-value">${sanitizedData.barangay}</span>
                    </div>` : ''}
                    ${sanitizedData.address ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Address Details:</span>
                        <span class="receipt-value">${sanitizedData.address}</span>
                    </div>` : ''}
                    ${sanitizedData.specialInstructions ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Special Instructions:</span>
                        <span class="receipt-value">${sanitizedData.specialInstructions}</span>
                    </div>` : ''}
                </div>

                <div class="receipt-content-section receipt-footer-section">
                    <h5>📞 What's Next?</h5>
                    <div class="receipt-row">
                        <span class="receipt-label">• Confirmation Call:</span>
                        <span class="receipt-value">Within 24 hours to ${sanitizedData.contactNumber}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">• Reference:</span>
                        <span class="receipt-value">${this.bookingRef}</span>
                    </div>
                    ${isPickupAndSelfClaim ?
                        `<div class="receipt-row">
                            <span class="receipt-label">• Arrival:</span>
                            <span class="receipt-value">Pickup on ${timestamps.selectedDateStr}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">• Item Collection:</span>
                            <span class="receipt-value">At shop on ${bookingData.selfClaimDate ? bookingData.selfClaimDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'your selected date'}</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">• Payment Due:</span>
                            <span class="receipt-value">Upon item collection at shop</span>
                        </div>` :
                        `<div class="receipt-row">
                            <span class="receipt-label">• Arrival:</span>
                            <span class="receipt-value">${sanitizedData.serviceOption.includes('pickup') ? 'Pickup' : 'Drop-off'} at scheduled time</span>
                        </div>
                        <div class="receipt-row">
                            <span class="receipt-label">• Payment Due:</span>
                            <span class="receipt-value">Upon ${sanitizedData.serviceOption.includes('delivery') ? 'delivery' : 'pickup'}</span>
                        </div>`
                    }
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

    formatServiceOption(serviceOption) {
        const serviceMap = {
            'pickup_delivery': 'Pickup and Delivery - We pick up your items and deliver them back to you',
            'pickup_selfclaim': 'Pickup and Self-Claim - We pick up your items, you collect them at our shop',
            'dropoff_delivery': 'Drop-off and Delivery - You bring items to us, we deliver them back',
            'dropoff_selfclaim': 'Drop-off and Self-Claim - You bring items to us and collect them at our shop'
        };

        return serviceMap[serviceOption] || serviceOption;
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
            'cash': '💵 Cash on Delivery - Pay when we deliver your items',
            'cashless': '📱 Cashless Payment - Digital payment required before confirmation'
        };

        return paymentMap[method] || method;
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
                console.warn('Failed to parse laundry items from hidden input:', e);
            }
        }

        return items;
    }

    // Format laundry items for receipt display (without prices)
    formatLaundryItems(items) {
        if (!items || items.length === 0) {
            return `
                <div class="receipt-row">
                    <span class="receipt-label">No items selected</span>
                    <span class="receipt-value">-</span>
                </div>
            `;
        }

        let totalItems = 0;
        let itemsHTML = '';

        items.forEach(item => {
            if (item.quantity > 0) {
                totalItems += item.quantity;

                itemsHTML += `
                    <div class="receipt-row">
                        <span class="receipt-label">${item.name}:</span>
                        <span class="receipt-value">${item.quantity} item${item.quantity > 1 ? 's' : ''}</span>
                    </div>
                `;
            }
        });

        // Add summary row
        itemsHTML += `
            <div class="receipt-row receipt-total-row">
                <span class="receipt-label"><strong>Total Items:</strong></span>
                <span class="receipt-value"><strong>${totalItems} item${totalItems > 1 ? 's' : ''}</strong></span>
            </div>
        `;

        return itemsHTML;
    }
}

// Create global instance
const customerReceiptGenerator = new CustomerReceiptGenerator();

// Export for use in other modules
window.customerReceiptGenerator = customerReceiptGenerator;
