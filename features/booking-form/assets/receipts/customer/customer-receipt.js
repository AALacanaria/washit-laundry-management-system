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
    generateModalReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions, selectedShop = null) {
        this.bookingRef = this.generateBookingReference();

        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        const paymentMethod = this.getPaymentMethod();
        const laundryItems = this.getLaundryItems();
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });

        const pickupLocation = this.getPickupLocationDetails();

        return this.buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData, paymentMethod, laundryItems, selectedShop, pickupLocation);
    }

    // Build receipt HTML with proper spacing
    buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData, paymentMethod, laundryItems, selectedShop = null, pickupLocation = null) {
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const isPickupAndSelfClaim = bookingData.serviceType === 'pickup_selfclaim';

        // Format service option properly
        const formattedServiceOption = this.formatServiceOption(sanitizedData.serviceOption);

    const pickupAddressHtml = this.composePickupAddressHtml(sanitizedData.address, sanitizedData.barangay, pickupLocation);

        let selfClaimSchedule = '';
        if (isPickupAndSelfClaim && bookingData.selfClaimDate && bookingData.selfClaimTime) {
            const selfClaimDateStr = bookingData.selfClaimDate.toLocaleDateString('en-PH', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            selfClaimSchedule = `
                <div class="receipt-row">
                    <span class="receipt-label">Self-Claim Date:</span>
                    <span class="receipt-value">${selfClaimDateStr}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Self-Claim Time:</span>
                    <span class="receipt-value">${bookingData.selfClaimTime}</span>
                </div>
            `;
        }

        const shopSection = selectedShop ? `
                <div class="receipt-content-section">
                    <h5>Laundry Shop</h5>
                    <div class="receipt-row">
                        <span class="receipt-label">Shop Name:</span>
                        <span class="receipt-value">${this.escapeHtml(selectedShop.name)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Address:</span>
                        <span class="receipt-value">${this.escapeHtml(selectedShop.address)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Contact:</span>
                        <span class="receipt-value">${this.escapeHtml(selectedShop.phone)}</span>
                    </div>
                </div>` : '';

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

                ${shopSection}
                <div class="receipt-content-section">
                    <h5>Service Details</h5>
                    <div class="receipt-row">
                        <span class="receipt-label">Booking Type:</span>
                        <span class="receipt-value">${isRush ? "Rush Booking (1.5 days delivery)" : "⏰ Normal Booking (2-3 days delivery)"}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Service Option:</span>
                        <span class="receipt-value">${formattedServiceOption}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Pickup Date:</span>
                        <span class="receipt-value">${timestamps.selectedDateStr}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Pickup Time:</span>
                        <span class="receipt-value">${selectedTimeStr}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Payment Method:</span>
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
                    <h5>Laundry Items</h5>
                    ${this.formatLaundryItems(laundryItems)}
                </div>
                <div class="receipt-content-section">
                    <h5>Customer Information</h5>
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
                    ${pickupAddressHtml ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Pickup Address:</span>
                        <span class="receipt-value">${pickupAddressHtml}</span>
                    </div>` : ''}
                    ${sanitizedData.specialInstructions ? `
                    <div class="receipt-row">
                        <span class="receipt-label">Special Instructions:</span>
                        <span class="receipt-value">${sanitizedData.specialInstructions}</span>
                    </div>` : ''}
                </div>

                <div class="receipt-content-section receipt-footer-section">
                    <h5>What's Next?</h5>
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
            'cash': 'Cash on Delivery - Pay when we deliver your items',
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

    getPickupLocationDetails() {
        if (typeof window.getPickupLocationDetails !== 'function') {
            return null;
        }

        try {
            const details = window.getPickupLocationDetails();
            if (!details || typeof details.lat !== 'number' || typeof details.lng !== 'number') {
                return null;
            }
            return details;
        } catch (error) {
            console.warn('Customer receipt: pickup location unavailable.', error);
            return null;
        }
    }

    composePickupAddressHtml(userAddress, barangay, pickupLocation) {
        const trimmedUserAddress = typeof userAddress === 'string' ? userAddress.trim() : '';
        const trimmedBarangay = typeof barangay === 'string' ? barangay.trim() : '';
        const mapAddress = pickupLocation && typeof pickupLocation.address === 'string'
            ? pickupLocation.address.trim()
            : '';

        const mergedAddress = this.mergeAddressDetails(trimmedUserAddress, mapAddress, trimmedBarangay);
        const segments = [];

        if (mergedAddress) {
            segments.push(this.escapeHtml(mergedAddress));
        }

        if (!mergedAddress && pickupLocation && pickupLocation.isResolving) {
            segments.push('<span class="receipt-secondary-text">Resolving pickup address…</span>');
        }

        return segments.join('<br>');
    }

    mergeAddressDetails(userAddress, mapAddress, barangay) {
        const userSegments = this.extractAddressSegments(userAddress);
        const mapSegments = this.extractAddressSegments(mapAddress);
        const normalizedBarangay = this.normalizeBarangayForComparison(barangay);
        const userHasHouseNumber = this.containsHouseNumber(userAddress);

        const cleanedUserSegments = this.cleanAddressSegments(userSegments, {
            stripLeadingHouseNumber: false,
            normalizedBarangay
        });
        const cleanedMapSegments = this.cleanAddressSegments(mapSegments, {
            stripLeadingHouseNumber: userHasHouseNumber,
            normalizedBarangay
        });
        const userDetailed = this.looksLikeDetailedAddress(userAddress);
        const mapDetailed = this.looksLikeDetailedAddress(mapAddress);

        let baseSegments = [];
        let supplementalSegments = [];

        if (userDetailed) {
            baseSegments = cleanedUserSegments;
            supplementalSegments = cleanedMapSegments;
        } else if (mapDetailed) {
            baseSegments = cleanedMapSegments;
            supplementalSegments = cleanedUserSegments;
        } else if (cleanedUserSegments.length > 0) {
            baseSegments = cleanedUserSegments;
            supplementalSegments = cleanedMapSegments;
        } else {
            baseSegments = cleanedMapSegments;
            supplementalSegments = [];
        }

        const combined = [...baseSegments];
        supplementalSegments.forEach((segment) => {
            if (!combined.some((existing) => existing.toLowerCase() === segment.toLowerCase())) {
                combined.push(segment);
            }
        });

        if (combined.length >= 2) {
            const first = combined[0];
            const second = combined[1];
            if (this.isStandaloneHouseNumberSegment(first) && this.segmentLooksLikeStreet(second)) {
                combined.splice(0, 2, `${first} ${second}`.trim());
            }
        }

        if (combined.length === 0) {
            return '';
        }

        const withBarangay = this.ensureBarangayPresence(combined, barangay);
        const truncated = this.truncateSegmentsAtBaguio(withBarangay);
        return truncated.join(', ');
    }

    extractAddressSegments(address) {
        if (!address) {
            return [];
        }

        return address
            .split(',')
            .map((segment) => segment.trim())
            .filter((segment, index, array) => segment && array.findIndex((candidate) => candidate.trim().toLowerCase() === segment.toLowerCase()) === index);
    }

    cleanAddressSegments(segments, options = {}) {
        const {
            stripLeadingHouseNumber = false,
            normalizedBarangay = ''
        } = options;

        return segments
            .map((segment) => {
                let processed = segment.replace(/\s+/g, ' ').trim();
                if (stripLeadingHouseNumber) {
                    const withoutNumber = this.removeLeadingHouseNumber(processed);
                    if (withoutNumber) {
                        processed = withoutNumber;
                    }
                }
                return processed;
            })
            .map((segment) => segment.replace(/\s+/g, ' ').trim())
            .filter((segment) => segment)
            .filter((segment) => !/\bdistrict\b/i.test(segment))
            .filter((segment) => {
                if (!normalizedBarangay) {
                    return true;
                }
                return this.normalizeBarangayForComparison(segment) !== normalizedBarangay;
            });
    }

    removeLeadingHouseNumber(segment) {
        const match = segment.match(/^(\d+[a-zA-Z0-9\-\/]*)\s+(.*)$/);
        if (match && match[2]) {
            return match[2].trim();
        }
        return segment;
    }

    normalizeBarangayForComparison(value) {
        return (value || '')
            .replace(/barangay/gi, '')
            .replace(/brgy\.?/gi, '')
            .replace(/district/gi, '')
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    containsHouseNumber(value) {
        if (!value || typeof value !== 'string') {
            return false;
        }
        return /\d/.test(value);
    }

    isStandaloneHouseNumberSegment(segment) {
        if (!segment || typeof segment !== 'string') {
            return false;
        }
        const normalized = segment.replace(/\s+/g, '').trim();
        return /^\d+[a-zA-Z0-9\-\/]*$/.test(normalized);
    }

    segmentLooksLikeStreet(segment) {
        if (!segment || typeof segment !== 'string') {
            return false;
        }
        const lower = segment.toLowerCase();
        const patterns = [
            /\bstreet\b/,
            /\bst\.?\b/,
            /\broad\b/,
            /\brd\.?\b/,
            /\bavenue\b/,
            /\bave\.?\b/,
            /\bdrive\b/,
            /\bdr\.?\b/,
            /\blane\b/,
            /\bln\.?\b/,
            /\bboulevard\b/,
            /\bblvd\.?\b/,
            /\bhighway\b/,
            /\bhwy\.?\b/,
            /\bpurok\b/,
            /\bblock\b/,
            /\bblk\.?\b/,
            /\bphase\b/,
            /\bsitio\b/,
            /\bcompound\b/
        ];
        return patterns.some((pattern) => pattern.test(lower));
    }

    ensureBarangayPresence(segments, barangay) {
        if (!Array.isArray(segments) || segments.length === 0) {
            return segments;
        }

        const cleanedBarangay = typeof barangay === 'string' ? barangay.replace(/\s+/g, ' ').trim() : '';
        if (!cleanedBarangay) {
            return segments;
        }

        const normalizedBarangay = this.normalizeBarangayForComparison(cleanedBarangay);
        if (!normalizedBarangay) {
            return segments;
        }

        const alreadyPresent = segments.some((segment) => this.normalizeBarangayForComparison(segment) === normalizedBarangay);
        if (alreadyPresent) {
            return segments;
        }

        const insertionSegments = [...segments];
        const baguioIndex = insertionSegments.findIndex((segment) => /baguio/i.test(segment));

        if (baguioIndex >= 0) {
            insertionSegments.splice(Math.max(0, baguioIndex), 0, cleanedBarangay);
        } else {
            insertionSegments.push(cleanedBarangay);
        }

        return insertionSegments;
    }

    truncateSegmentsAtBaguio(segments) {
        const result = [];
        for (let i = 0; i < segments.length; i += 1) {
            const segment = segments[i];
            if (!segment) {
                continue;
            }
            result.push(segment);
            if (/baguio/i.test(segment)) {
                break;
            }
        }

        return result.length > 0 ? result : segments;
    }

    looksLikeDetailedAddress(address) {
        if (typeof address !== 'string') {
            return false;
        }
        const trimmed = address.trim();
        if (!trimmed) {
            return false;
        }
        if (/\d/.test(trimmed)) {
            return true;
        }
        const lower = trimmed.toLowerCase();
        const keywords = ['street', 'st.', ' st ', ' st,', ' st-', 'road', 'rd', 'rd.', 'avenue', 'ave', 'ave.', 'drive', 'dr', 'dr.', 'lane', 'ln', 'ln.', 'boulevard', 'blvd', 'highway', 'hwy', 'circle', 'cir', 'purok', 'blk', 'block', 'lot', 'phase', 'sitio', 'subdivision', 'compound', 'ext.', 'extension'];
        return keywords.some((keyword) => lower.includes(keyword));
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

    // Escape HTML special characters to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
const customerReceiptGenerator = new CustomerReceiptGenerator();

// Export for use in other modules
window.customerReceiptGenerator = customerReceiptGenerator;
