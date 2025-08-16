// Booking Confirmation and Receipt Generation
class BookingConfirmation {
    constructor() {
        this.bookingRef = null;
    }

    // Main confirmation display function
    showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    // showConfirmation called
        
        // Hide the form
        const formSteps = document.getElementById("formSteps");
        if (formSteps) {
            formSteps.classList.add("hidden");
        }
        
        // Get confirmation elements
        const confirmation = document.getElementById("confirmation");
        const reviewDetails = document.getElementById("reviewDetails");
        
        if (!confirmation || !reviewDetails) {
            console.error('Confirmation elements not found!');
            return;
        }
        
        // Get booking data with fallbacks
        const bookingData = this.getBookingData();
        if (!this.validateBookingData(bookingData)) {
            return;
        }
        
        // Generate and display receipt
        const receiptHTML = this.generateReceipt(
            bookingData, serviceOption, firstName, lastName, 
            contactNumber, email, barangay, address, specialInstructions
        );
        
        reviewDetails.innerHTML = receiptHTML;

        // Ensure the form is fully removed from layout (no residual height)
        if (formSteps) {
            // Besides adding the hidden class, set display none to prevent any max-height transition gap
            formSteps.classList.add('hidden');
            formSteps.classList.remove('expanded');
            formSteps.style.display = 'none';
        }

        // Show confirmation and scroll to it reliably
        confirmation.classList.remove("hidden");
        // Jump to top first to avoid layout jump issues, then smooth-scroll to confirmation
        window.scrollTo({ top: 0, behavior: 'auto' });
        setTimeout(() => {
            if (typeof confirmation.scrollIntoView === 'function') {
                confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 40);
    }

    // Get booking data with fallbacks
    getBookingData() {
        const actualSelectedDate = selectedDate || window.selectedDate;
        const actualSelectedTime = selectedTime || window.selectedTime;
        const actualBookingType = bookingType || window.bookingType;
        const actualServiceType = selectedServiceType || window.selectedServiceType;
        
        // For pickup and self-claim services, also get self-claim details
        const actualSelfClaimDate = selfClaimDate || window.selfClaimDate;
        const actualSelfClaimTime = selfClaimTime || window.selfClaimTime;
        
        return {
            selectedDate: actualSelectedDate,
            selectedTime: actualSelectedTime,
            bookingType: actualBookingType,
            serviceType: actualServiceType,
            selfClaimDate: actualSelfClaimDate,
            selfClaimTime: actualSelfClaimTime
        };
    }

    // Validate booking data
    validateBookingData(bookingData) {
        if (!bookingData.selectedDate || !bookingData.selectedTime) {
            console.error('Missing selectedDate or selectedTime');
            console.error('bookingData:', bookingData);
            alert('Error: Missing booking date or time. Please complete the form properly.');
            return false;
        }
        return true;
    }

    // Generate booking receipt HTML
    generateReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        // Generate booking reference
        this.bookingRef = this.generateBookingReference();
        
        // Get formatted dates and times
        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        
        // Sanitize all inputs
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });
        
        return this.buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData);
    }

    // Generate unique booking reference
    generateBookingReference() {
        return 'WSH-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 4).toUpperCase();
    }

    // Get formatted timestamps
    getFormattedTimestamps(bookingData) {
        const bookingDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const selectedDateStr = bookingData.selectedDate.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate estimated completion
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const estimatedDays = isRush ? 1.5 : 2.5; // 1.5 days for rush, 2.5 days average for normal (2-3 days)
        const completionDate = new Date(bookingData.selectedDate);
        
        if (isRush) {
            // 1.5 days = 1 day + 12 hours
            completionDate.setDate(completionDate.getDate() + 1);
            completionDate.setHours(completionDate.getHours() + 12);
        } else {
            // 2.5 days average for 2-3 day range
            completionDate.setDate(completionDate.getDate() + 2);
            completionDate.setHours(completionDate.getHours() + 12);
        }
        
        const completionDateStr = completionDate.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            bookingDate,
            selectedDateStr,
            completionDateStr
        };
    }

    // Get selected time string with fallbacks
    getSelectedTimeString(bookingData) {
        let selectedTimeStr = 'Unknown Time';
        try {
            const timeSlots = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH ? RUSH_TIME_SLOTS : TIME_SLOTS;
            if (timeSlots && timeSlots[bookingData.selectedTime]) {
                selectedTimeStr = timeSlots[bookingData.selectedTime].label;
            } else {
                console.warn('Time slot not found:', bookingData.selectedTime, 'in', timeSlots);
                // Try ALL_TIME_SLOTS as fallback
                const allTimeSlots = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH ? ALL_RUSH_TIME_SLOTS : ALL_TIME_SLOTS;
                if (allTimeSlots && allTimeSlots[bookingData.selectedTime]) {
                    selectedTimeStr = allTimeSlots[bookingData.selectedTime].label;
                } else {
                    selectedTimeStr = bookingData.selectedTime || 'Unknown Time';
                }
            }
        } catch (error) {
            console.error('Error getting time slot label:', error);
            selectedTimeStr = bookingData.selectedTime || 'Unknown Time';
        }
        return selectedTimeStr;
    }

    // Sanitize all input data
    sanitizeInputs(data) {
        const sanitize = (str) => {
            const div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        };

        return {
            fullName: sanitize(`${data.firstName} ${data.lastName}`.trim()),
            contactNumber: sanitize(data.contactNumber),
            email: sanitize(data.email),
            barangay: sanitize(data.barangay),
            address: sanitize(data.address),
            specialInstructions: sanitize(data.specialInstructions),
            serviceOption: sanitize(this.formatService(data.serviceOption))
        };
    }

    // Build complete receipt HTML
    buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData) {
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
                <p><strong>🏪 Self-Claim Date:</strong> ${selfClaimDateStr}</p>
                <p><strong>🕐 Self-Claim Time:</strong> ${bookingData.selfClaimTime}</p>
            `;
        }
        
        return `
            <div class="booking-receipt">
                <div class="receipt-header">
                    <h4>🧺 Wash.IT Laundry Service</h4>
                    <p class="booking-ref">Booking Reference: <strong>${this.bookingRef}</strong></p>
                    <p class="booking-timestamp">Booked on: ${timestamps.bookingDate}</p>
                </div>
                
                <div class="receipt-section">
                    <h5>📋 Service Details</h5>
                    <p><strong>Booking Type:</strong> ${isRush ? "🚀 Rush Booking (1.5 days delivery)" : "⏰ Normal Booking (2-3 days delivery)"}</p>
                    <p><strong>Service Option:</strong> ${sanitizedData.serviceOption}</p>
                    <p><strong>📅 Pickup Date:</strong> ${timestamps.selectedDateStr}</p>
                    <p><strong>🕐 Pickup Time:</strong> ${selectedTimeStr}</p>
                    ${selfClaimSchedule}
                    ${!isPickupAndSelfClaim ? `<p><strong>Estimated Completion:</strong> ${timestamps.completionDateStr}</p>` : ''}
                </div>
                
                <div class="receipt-section">
                    <h5>👤 Customer Information</h5>
                    <p><strong>Full Name:</strong> ${sanitizedData.fullName}</p>
                    <p><strong>Contact Number:</strong> ${sanitizedData.contactNumber}</p>
                    ${sanitizedData.email ? `<p><strong>Email:</strong> ${sanitizedData.email}</p>` : ''}
                    ${sanitizedData.barangay ? `<p><strong>Barangay:</strong> ${sanitizedData.barangay}</p>` : ''}
                    ${sanitizedData.address ? `<p><strong>Service Address:</strong> ${sanitizedData.address}</p>` : ''}
                    ${sanitizedData.specialInstructions ? `<p><strong>Special Instructions:</strong> ${sanitizedData.specialInstructions}</p>` : ''}
                </div>
                
                <div class="receipt-section receipt-footer">
                    <h5>📞 What's Next?</h5>
                    <p>• We'll contact you at <strong>${sanitizedData.contactNumber}</strong> within 24 hours to confirm details</p>
                    <p>• Keep this booking reference: <strong>${this.bookingRef}</strong></p>
                    ${isPickupAndSelfClaim ? 
                        `<p>• Our team will arrive at your scheduled time for pickup on <strong>${timestamps.selectedDateStr}</strong></p>
                         <p>• Please collect your items at our shop on <strong>${bookingData.selfClaimDate ? bookingData.selfClaimDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'your selected date'}</strong> at <strong>${bookingData.selfClaimTime || 'your selected time'}</strong></p>
                         <p>• Payment will be collected upon pickup of items at our shop</p>` :
                        `<p>• Our team will arrive at your scheduled time for ${sanitizedData.serviceOption.includes('pickup') ? 'pickup' : 'drop-off'}</p>
                         <p>• Payment will be collected upon ${sanitizedData.serviceOption.includes('delivery') ? 'delivery' : 'pickup'}</p>`
                    }
                </div>
                
                <div class="receipt-actions">
                    <button onclick="window.print()" class="btn btn-secondary btn-sm">🖨️ Print Receipt</button>
                    <button onclick="location.reload()" class="btn btn-primary btn-sm">📝 New Booking</button>
                </div>
            </div>
        `;
    }

    // Format service option display text
    formatService(service) {
        switch (service) {
            case "pickup_delivery": return "Pickup and Delivery - We pick up and deliver your items";
            case "pickup_selfclaim": return "Pickup and Self-Claim - We pick up, you collect at shop";
            case "dropoff_delivery": return "Drop-off and Delivery - You drop off, we deliver";
            default: return service || "";
        }
    }

    // Get current booking reference
    getBookingReference() {
        return this.bookingRef;
    }
}

// Create global instance
const bookingConfirmation = new BookingConfirmation();

// Global functions for backward compatibility
function showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    bookingConfirmation.showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions);
}

function formatService(service) {
    return bookingConfirmation.formatService(service);
}

// Test function for confirmation
    window.testConfirmation = function() {
    // Set test data in both local and window variables
    selectedDate = new Date();
    selectedTime = "09:00";
    bookingType = "normal";
    
    window.selectedDate = selectedDate;
    window.selectedTime = selectedTime;
    window.bookingType = bookingType;
    
    // test confirmation invoked
    
    showConfirmation(
        "pickup_delivery",
        "John",
        "Doe", 
        "09123456789",
        "john@gmail.com",
        "Test Barangay",
        "123 Test Street",
        "Test instructions"
    );
};
