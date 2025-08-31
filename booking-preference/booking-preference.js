// Booking Type Selection Logic
// This class manages the toggle behavior for booking preference buttons.
// Key behaviors:
// - Only one option can be selected at a time
// - Clicking an already selected button has no effect
// - Users can switch between options freely
// - Maintains visual state and accessibility features
class BookingSelection {
    constructor() {
        this.currentBookingType = ""; // No initial selection
        this.previousType = null;
        this.initializeKeyboardNavigation();
    }

    // Initialize keyboard navigation for toggle buttons
    initializeKeyboardNavigation() {
        const toggleContainer = document.querySelector('.toggle-container');
        if (!toggleContainer) return;

        // Add touch event support for mobile devices
        const toggles = document.querySelectorAll('.toggle-option');
        toggles.forEach(toggle => {
            toggle.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Only proceed if this toggle is not already active
                if (!toggle.classList.contains('active')) {
                    const type = toggle.id === 'toggleNormal' ? 'normal' : 'rush';
                    this.selectBookingType(type);
                }
            }, { passive: false });
        });

        toggleContainer.addEventListener('keydown', (e) => {
            const toggles = [document.getElementById('toggleNormal'), document.getElementById('toggleRush')].filter(Boolean);
            const currentIndex = toggles.findIndex(toggle => toggle.getAttribute('tabindex') === '0');

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : toggles.length - 1;
                    this.focusToggle(toggles[prevIndex]);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex < toggles.length - 1 ? currentIndex + 1 : 0;
                    this.focusToggle(toggles[nextIndex]);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const currentToggle = toggles[currentIndex];
                    if (currentToggle) {
                        const type = currentToggle.id === 'toggleNormal' ? 'normal' : 'rush';
                        // Only proceed if this toggle is not already active
                        if (!currentToggle.classList.contains('active')) {
                            this.selectBookingType(type);
                        }
                    }
                    break;
            }
        });
    }

    // Focus a specific toggle button
    focusToggle(toggle) {
        if (!toggle) return;

        // Update tabindex
        document.querySelectorAll('.toggle-option').forEach(t => {
            t.setAttribute('tabindex', '-1');
        });
        toggle.setAttribute('tabindex', '0');
        toggle.focus();
    }

    // Main booking type selection function
    // Behavior: Clicking already selected button has no effect
    // Switching to different option works normally
    selectBookingType(type) {
        // If clicking the same option that's already selected, do nothing
        if (this.currentBookingType === type) {
            return; // No effect when clicking already selected button
        }

        // Reset service selection immediately when switching booking types
        if (typeof resetServiceSelection === 'function') {
            resetServiceSelection();
        }
        
        const formSteps = document.getElementById("formSteps");
        const bookingIndicator = document.getElementById("bookingTypeIndicator");
        const rushFieldsEl = document.getElementById("rushFields");
        const toggleNormal = document.getElementById("toggleNormal");
        const toggleRush = document.getElementById("toggleRush");

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
        
        // Always show loading animation for visual feedback
        this.showLoadingState(type);
        setTimeout(() => {
            this.updateBookingUI(type, formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush);
            this.hideLoadingState();
        }, 400);
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

        // Remove toggle visual states and ARIA attributes
        if (toggleNormal) {
            toggleNormal.classList.remove("active");
            toggleNormal.setAttribute('aria-checked', 'false');
            toggleNormal.setAttribute('tabindex', '0');
        }
        if (toggleRush) {
            toggleRush.classList.remove("active");
            toggleRush.setAttribute('aria-checked', 'false');
            toggleRush.setAttribute('tabindex', '-1');
        }

        // Hide booking details section
        const bookingDetails = document.getElementById('bookingDetails');
        if (bookingDetails) {
            bookingDetails.classList.add('hidden');
        }

        // Reset booking details to default (Normal)
        this.updateBookingDetails(CONFIG.BOOKING_TYPES.NORMAL);
    }

    // Update toggle visual states (simple button-like behavior)
    updateToggleStates(type, toggleNormal, toggleRush) {
        // Clear existing states
        if (toggleNormal) {
            toggleNormal.classList.remove('active');
            toggleNormal.setAttribute('aria-checked', 'false');
            toggleNormal.setAttribute('tabindex', '-1');
        }
        if (toggleRush) {
            toggleRush.classList.remove('active');
            toggleRush.setAttribute('aria-checked', 'false');
            toggleRush.setAttribute('tabindex', '-1');
        }

        // Add appropriate states
        if (type === CONFIG.BOOKING_TYPES.RUSH) {
            if (toggleRush) {
                toggleRush.classList.add('active');
                toggleRush.setAttribute('aria-checked', 'true');
                toggleRush.setAttribute('tabindex', '0');
            }
        } else {
            if (toggleNormal) {
                toggleNormal.classList.add('active');
                toggleNormal.setAttribute('aria-checked', 'true');
                toggleNormal.setAttribute('tabindex', '0');
            }
        }

        // Show booking details section
        const bookingDetails = document.getElementById('bookingDetails');
        if (bookingDetails) {
            bookingDetails.classList.remove('hidden');
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

            // Initialize map if needed when form becomes visible
            if (typeof initializeMapIfNeeded === 'function') {
                initializeMapIfNeeded();
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

    // Reset selection (for cases where users want to start over)
    resetSelection() {
        const formSteps = document.getElementById("formSteps");
        const bookingIndicator = document.getElementById("bookingTypeIndicator");
        const rushFieldsEl = document.getElementById("rushFields");
        const toggleNormal = document.getElementById("toggleNormal");
        const toggleRush = document.getElementById("toggleRush");
        
        this.clearSelection(formSteps, bookingIndicator, rushFieldsEl, toggleNormal, toggleRush);
    }

    // Show loading state for visual feedback
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
                        <div class="loading-text">Updating form...</div>
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

// Global function to reset booking selection
function resetBookingSelection() {
    bookingSelection.resetSelection();
}
