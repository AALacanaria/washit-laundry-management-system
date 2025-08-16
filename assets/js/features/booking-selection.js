// Booking Type Selection Logic
class BookingSelection {
    constructor() {
        this.currentBookingType = "";
        this.previousType = null;
    }

    // Main booking type selection function
    selectBookingType(type) {
        // Reset service selection immediately when any booking button is clicked
        if (typeof resetServiceSelection === 'function') {
            resetServiceSelection();
        }
        
        const formSteps = document.getElementById("formSteps");
        const bookingIndicator = document.getElementById("bookingTypeIndicator");
        const rushFieldsEl = document.getElementById("rushFields");
        const toggleNormal = document.getElementById("toggleNormal");
        const toggleRush = document.getElementById("toggleRush");

        // If clicking same option -> toggle hide/show
        if (this.currentBookingType === type) {
            this.clearSelection(formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush);
            return;
        }

        // Store previous and current type
        this.previousType = this.currentBookingType;
        this.currentBookingType = type;
        
        // Update global variables
        window.bookingType = type;
        if (typeof bookingType !== 'undefined') {
            bookingType = type;
        }

        // Reset form if switching between types
        if (this.previousType && this.previousType !== type) {
            if (typeof resetForm === 'function') {
                resetForm();
            }
        }

        // Determine if we need loading animation
        const isChangingType = this.previousType && this.previousType !== type;
        
        if (isChangingType) {
            // Show loading for type changes - shorter duration
            this.showLoadingState(type);
            setTimeout(() => {
                this.updateBookingUI(type, formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush);
                this.hideLoadingState();
            }, 400); // Reduced from 1000ms to 400ms
        } else {
            // Immediate update for initial selection
            this.updateBookingUI(type, formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush);
        }
    }

    // Separated UI update logic
    updateBookingUI(type, formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush) {
        // Update visual states
        this.updateToggleStates(type, toggleNormal, toggleRush);
        this.updateBookingIndicator(type);
        this.showFormElements(formSteps, bookingIndicator, rushFieldsEl, type);

        // Initialize calendar
        setTimeout(() => {
            if (typeof initializeCalendarData === 'function') initializeCalendarData();
            if (typeof renderCalendar === 'function') renderCalendar();
            if (typeof renderTimeSlots === 'function') renderTimeSlots();
        }, 150);

        // Validate and post-load actions
        if (typeof validateBookingTypeVisual === 'function') {
            validateBookingTypeVisual();
        }
        
        this.autoScrollToService();
    }

    // Clear selection and collapse form
    clearSelection(formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush) {
        this.currentBookingType = "";
        window.bookingType = "";
        if (typeof bookingType !== 'undefined') {
            bookingType = "";
        }

        // Reset service selection
        if (typeof resetServiceSelection === 'function') {
            resetServiceSelection();
        }

        // Collapse animated container
        if (formSteps) {
            formSteps.classList.remove("expanded");
            formSteps.classList.add("hidden");
        }
        if (bookingIndicator) bookingIndicator.classList.add("hidden");
        if (rushFieldsEl) rushFieldsEl.classList.add("hidden");

        // Remove toggle visual states
        if (toggleNormal) toggleNormal.classList.remove("active");
        if (toggleRush) toggleRush.classList.remove("active");

        // Reset booking details to default (Normal)
        this.updateBookingDetails(CONFIG.BOOKING_TYPES.NORMAL);
    }

    // Update toggle visual states
    updateToggleStates(type, toggleNormal, toggleRush) {
        // Clear existing states
        if (toggleNormal) toggleNormal.classList.remove('active');
        if (toggleRush) toggleRush.classList.remove('active');

        // Add appropriate states
        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (toggleRush) toggleRush.classList.add('active');
        } else {
            if (toggleNormal) toggleNormal.classList.add('active');
        }

        // Update booking details section
        this.updateBookingDetails(type);
    }

    // Update booking details section
    updateBookingDetails(type) {
        const processingTimeEl = document.getElementById('processingTime');
        const pricingEl = document.getElementById('pricing');
        const availabilityEl = document.getElementById('availability');

        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (processingTimeEl) processingTimeEl.textContent = '1.5 days';
            if (pricingEl) pricingEl.textContent = 'Rush rate (+50%)';
            if (availabilityEl) availabilityEl.textContent = 'Limited slots';
        } else {
            if (processingTimeEl) processingTimeEl.textContent = '2-3 days';
            if (pricingEl) pricingEl.textContent = 'Standard rate';
            if (availabilityEl) availabilityEl.textContent = 'All time slots';
        }
    }

    // Update booking type indicator content and styles
    updateBookingIndicator(type) {
        const indicator = document.getElementById("bookingTypeIndicator");
        const text = document.getElementById("bookingTypeText");

        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (text) text.textContent = "Rush Booking";
            if (indicator) {
                indicator.innerHTML = '<strong>Rush Booking</strong> - 1.5 days delivery (limited slots)';
                indicator.style.background = "#fff5f5";
                indicator.style.borderColor = "#fed7d7";
                indicator.style.color = "#c53030";
            }
        } else {
            if (text) text.textContent = "Normal Booking";
            if (indicator) {
                indicator.innerHTML = '<strong>Normal Booking</strong> - 2-3 days delivery';
                indicator.style.background = "#fff3cd";
                indicator.style.borderColor = "#ffeaa7";
                indicator.style.color = "#856404";
            }
        }
    }

    // Show form elements based on booking type
    showFormElements(formSteps, bookingIndicator, rushFieldsEl, type) {
        // Show main form elements
        if (formSteps) {
            formSteps.classList.remove("hidden");
            formSteps.classList.add("expanded");
        }
        if (bookingIndicator) bookingIndicator.classList.remove("hidden");

        // If the user already filled customer fields or selected times while the
        // form was collapsed, ensure the Confirm section becomes visible now
        // that the form is expanded. This fixes the case where validators ran
        // earlier but could not reveal the submit section because `formSteps`
        // was hidden.
        setTimeout(() => {
            try {
                const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address']
                    .every(id => {
                        const field = document.getElementById(id);
                        return field && field.classList.contains('input-valid');
                    });

                const dateTimeOk = (typeof validateDateTimeVisual === 'function') ? validateDateTimeVisual() : false;

                if (customerComplete && dateTimeOk && typeof ensureConfirmVisible === 'function') {
                    ensureConfirmVisible();
                }
            } catch (e) {
                // swallow any errors - defensive
            }
        }, 120);

        // Handle rush-specific fields - address is always required
        const addr = document.getElementById("address");
        if (addr) addr.required = true;
        
        // Trigger auto-fill after DOM changes
        setTimeout(() => {
            if (typeof autoFillManager !== 'undefined') {
                const savedData = autoFillManager.loadUserData();
                if (savedData && Object.keys(savedData).length > 0) {
                    autoFillManager.fillFormSilently(savedData);
                }
            }
        }, 300);
    }

    // Auto-scroll to service details section
    autoScrollToService() {
        // Empty method - can be implemented if needed
    }

    // Get current booking type
    getBookingType() {
        return this.currentBookingType;
    }

    // Show loading state
    showLoadingState(selectedType) {
        // Add loading class to clicked toggle
        const toggleNormal = document.getElementById("toggleNormal");
        const toggleRush = document.getElementById("toggleRush");
        
        if (selectedType === 'normal' && toggleNormal) {
            toggleNormal.classList.add('loading');
        } else if (selectedType === 'rush' && toggleRush) {
            toggleRush.classList.add('loading');
        }

        // Disable service cards during loading
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => card.classList.add('disabled'));

        // Add loading overlay to form if it exists
        const formSteps = document.getElementById("formSteps");
        if (formSteps && !formSteps.classList.contains('hidden')) {
            const container = formSteps.parentElement;
            if (container) {
                container.classList.add('form-steps-container', 'loading');
                
                // Create loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'booking-loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="booking-loading-content">
                        <div class="loading-spinner"></div>
                        <div class="loading-text">Resetting form...</div>
                    </div>
                `;
                container.appendChild(loadingOverlay);
            }
        }
    }

    // Hide loading state
    hideLoadingState() {
        // Remove loading class from toggles
        const toggleNormal = document.getElementById("toggleNormal");
        const toggleRush = document.getElementById("toggleRush");
        
        if (toggleNormal) toggleNormal.classList.remove('loading');
        if (toggleRush) toggleRush.classList.remove('loading');

        // Re-enable service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => card.classList.remove('disabled'));

        // Remove loading overlay
        const loadingOverlay = document.querySelector('.booking-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.remove();
                const container = document.querySelector('.form-steps-container');
                if (container) {
                    container.classList.remove('loading');
                }
            }, 300);
        }
    }
}

// Create global instance
const bookingSelection = new BookingSelection();

// Global function for backward compatibility
function selectBookingType(type) {
    bookingSelection.selectBookingType(type);
}
