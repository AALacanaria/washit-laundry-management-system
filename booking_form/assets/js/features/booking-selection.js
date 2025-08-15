// Booking Type Selection Logic
class BookingSelection {
    constructor() {
        this.currentBookingType = "";
        this.previousType = null;
    }

    // Main booking type selection function
    selectBookingType(type) {
        // If clicking same option -> toggle hide/show
        const formSteps = document.getElementById("formSteps");
        const bookingIndicator = document.getElementById("bookingTypeIndicator");
        const rushFieldsEl = document.getElementById("rushFields");
        const btnNormal = document.getElementById("btnNormal");
        const btnRush = document.getElementById("btnRush");

        // If same type clicked -> collapse/hide
        if (this.currentBookingType === type) {
            this.clearSelection(formSteps, bookingIndicator, rushFieldsEl, btnNormal, btnRush);
            return;
        }

        // Selecting a (possibly different) type
        this.previousType = this.currentBookingType;
        this.currentBookingType = type;
        
        // Update global variables for backward compatibility
        window.bookingType = type;
        if (typeof bookingType !== 'undefined') {
            bookingType = type;
        }

        // Update visual states
        this.updateButtonStates(type, btnNormal, btnRush);
        this.updateBookingIndicator(type);
        this.showFormElements(formSteps, bookingIndicator, rushFieldsEl, type);

        // Reset form if switching between types
        if (this.previousType && this.previousType !== type) {
            if (typeof resetForm === 'function') {
                resetForm();
            }
        }

        // Initialize calendar after short delay
        setTimeout(() => {
            if (typeof initializeCalendarData === 'function') initializeCalendarData();
            if (typeof renderCalendar === 'function') renderCalendar();
            if (typeof renderTimeSlots === 'function') renderTimeSlots();
        }, 150);

        // Validate visual state
        if (typeof validateBookingTypeVisual === 'function') {
            validateBookingTypeVisual();
        }
        
        // Auto-scroll to service section
        this.autoScrollToService();
    }

    // Clear selection and collapse form
    clearSelection(formSteps, bookingIndicator, rushFieldsEl, btnNormal, btnRush) {
        this.currentBookingType = "";
        window.bookingType = "";
        if (typeof bookingType !== 'undefined') {
            bookingType = "";
        }

        // Collapse animated container
        if (formSteps) {
            formSteps.classList.remove("expanded");
            formSteps.classList.add("hidden");
        }
        if (bookingIndicator) bookingIndicator.classList.add("hidden");
        if (rushFieldsEl) rushFieldsEl.classList.add("hidden");
        if (btnNormal) btnNormal.classList.remove("expanded");
        if (btnRush) btnRush.classList.remove("expanded");

        // Remove visual selected classes
        const normalBtn = document.querySelector('.btn-primary');
        const rushBtn = document.querySelector('.btn-secondary');
        if (normalBtn) normalBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
        if (rushBtn) rushBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
    }

    // Update button visual states
    updateButtonStates(type, btnNormal, btnRush) {
        const normalBtn = document.querySelector('.btn-primary');
        const rushBtn = document.querySelector('.btn-secondary');

        // Clear existing states
        if (normalBtn) normalBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
        if (rushBtn) rushBtn.classList.remove('selected', 'normal-selected', 'rush-selected');

        // Add appropriate states
        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (rushBtn) rushBtn.classList.add('selected', 'rush-selected');
        } else {
            if (normalBtn) normalBtn.classList.add('selected', 'normal-selected');
        }

        // Update arrow states
        if (btnNormal) btnNormal.classList.toggle('expanded', type === CONFIG.BOOKING_TYPES.NORMAL);
        if (btnRush) btnRush.classList.toggle('expanded', type === CONFIG.BOOKING_TYPES.RUSH);
    }

    // Update booking type indicator content and styles
    updateBookingIndicator(type) {
        const indicator = document.getElementById("bookingTypeIndicator");
        const text = document.getElementById("bookingTypeText");

        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (text) text.textContent = "Rush Booking";
            if (indicator) {
                indicator.innerHTML = '<strong>Rush Booking</strong> - Same day service (limited slots)';
                indicator.style.background = "#fff5f5";
                indicator.style.borderColor = "#fed7d7";
                indicator.style.color = "#c53030";
            }
        } else {
            if (text) text.textContent = "Normal Booking";
            if (indicator) {
                indicator.innerHTML = '<strong>Normal Booking</strong> - 3-day processing time';
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

        // Handle rush-specific fields
        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (rushFieldsEl) rushFieldsEl.classList.remove("hidden");
            const addr = document.getElementById("address");
            if (addr) addr.required = true;
        } else {
            if (rushFieldsEl) rushFieldsEl.classList.add("hidden");
            const addr = document.getElementById("address");
            if (addr) addr.required = false;
        }
    }

    // Auto-scroll to service details section
    autoScrollToService() {
        if (this.currentBookingType) {
            setTimeout(() => {
                const serviceSection = document.querySelector('[data-section="serviceSection"]');
                if (serviceSection) {
                    serviceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 400);
        }
    }

    // Get current booking type
    getBookingType() {
        return this.currentBookingType;
    }
}

// Create global instance
const bookingSelection = new BookingSelection();

// Global function for backward compatibility
function selectBookingType(type) {
    bookingSelection.selectBookingType(type);
}
