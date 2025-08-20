// Booking Confirmation and Receipt Generation
class BookingConfirmation {
    constructor() {
        this.bookingRef = null;
    }

    // Main confirmation display function
    showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    // showConfirmation called
        
        // Get confirmation modal elements
        const modal = document.getElementById("booking-modal");
        const reviewDetails = document.getElementById("reviewDetails");
        
        if (!modal || !reviewDetails) {
            console.error('Modal elements not found!');
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

        // Force modal to be in the exact center of current viewport
        this.centerModalInViewport(modal);
        
        // Add click outside to close
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        };
    }

    // Force modal to center of current viewport
    centerModalInViewport(modal) {
        // FORCE immediate viewport reset - no smooth scrolling
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Lock the page completely
        const currentScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        
        // Force modal to display immediately - no transitions
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = '999999';
        modal.classList.remove("hidden");
        modal.classList.add("show");
        
        // Force immediate focus and viewport centering
        modal.focus();
        
        // Double-check modal is visible
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
        }, 10);
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

// Modal Control Functions
function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    if (modal) {
        // Get the stored scroll position
        const scrollTop = parseInt(document.body.style.top || '0') * -1;
        
        // Hide modal immediately
        modal.classList.remove("show");
        modal.classList.add("hidden");
        modal.style.display = 'none';
        
        // Restore body scroll and position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollTop);
    }
}

function printReceipt() {
    // Hide modal temporarily for printing
    const modal = document.getElementById("booking-modal");
    if (modal) {
        modal.classList.add("print-mode");
        window.print();
        modal.classList.remove("print-mode");
    }
}

function startNewBooking() {
    // Close modal
    closeBookingModal();
    
    // Reset form and reload page
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

// Global functions for modal
window.closeBookingModal = closeBookingModal;
window.printReceipt = printReceipt;
window.startNewBooking = startNewBooking;
