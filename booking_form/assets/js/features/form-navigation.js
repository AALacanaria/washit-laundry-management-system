// Form Navigation and Auto-scroll Logic
class FormNavigation {
    constructor() {
        this.formParts = [
            {
                id: 'serviceSection', 
                isComplete: () => {
                    const svc = document.getElementById('serviceOption');
                    return svc && svc.value.trim() !== '';
                },
                elementSelector: '[data-section="scheduleSection"]'
            },
            {
                id: 'scheduleSection',
                isComplete: () => {
                    const actualSelectedDate = selectedDate || window.selectedDate;
                    const actualSelectedTime = selectedTime || window.selectedTime;
                    return !!actualSelectedDate && !!actualSelectedTime;
                },
                elementSelector: '[data-section="customerSection"]'
            },
            {
                id: 'customerSection',
                isComplete: () => {
                    const fields = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'];
                    return fields.every(id => {
                        const el = document.getElementById(id);
                        if (!el) return false;
                        const val = (el.value || '').trim();
                        if (id === 'contactNumber') return CONFIG.VALIDATION.PHONE_PATTERN.test(val);
                        if (id === 'email') return CONFIG.VALIDATION.EMAIL_PATTERN.test(val);
                        return val !== '';
                    });
                },
                elementSelector: '[data-section="confirmSection"]',
                onComplete: () => {
                    // Auto-scroll to Confirm Booking section and make button green
                    setTimeout(() => {
                        const confirmSection = document.querySelector('[data-section="confirmSection"]');
                        const submitBtn = document.querySelector('.submit-btn');
                        
                        if (submitBtn) {
                            submitBtn.style.backgroundColor = '#28a745';
                            submitBtn.style.borderColor = '#28a745';
                            submitBtn.style.color = 'white';
                            submitBtn.textContent = '✓ Ready to Book!';
                        }
                    }, 500);
                }
            }
        ];
    }

    // Auto-scroll to next incomplete section
    autoScrollToNextSection() {
        // Find the first incomplete section and scroll to its next part
        for (let i = 0; i < this.formParts.length; i++) {
            const part = this.formParts[i];
            if (!part.isComplete()) {
                // Current part is incomplete, stay here (don't scroll)
                return;
            }
            
            // Current part is complete, trigger onComplete callback if it exists
            if (part.onComplete) {
                part.onComplete();
            }
            
            // Current part is complete, check if we should move to next
            if (i < this.formParts.length - 1) {
                const nextElementSelector = part.elementSelector;
                const nextElement = document.querySelector(nextElementSelector);
                if (nextElement) {
                    setTimeout(() => {
                        // Trigger auto-fill when navigating to customer section
                        if (nextElementSelector === '[data-section="customerSection"]' && typeof autoFillManager !== 'undefined') {
                            autoFillManager.initializeAutoFill();
                        }
                    }, 300);
                    return;
                }
            }
        }
        
        // All parts complete, scroll to submit button
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            // Submit button is ready but no auto scroll
        }
    }

    // Scroll to specific section (disabled)
    scrollToSection(sectionSelector) {
        // Auto scroll disabled
    }

    // Check if section is complete
    isSectionComplete(sectionId) {
        const part = this.formParts.find(p => p.id === sectionId);
        return part ? part.isComplete() : false;
    }

    // Get next incomplete section
    getNextIncompleteSection() {
        for (const part of this.formParts) {
            if (!part.isComplete()) {
                return part.id;
            }
        }
        return null; // All sections complete
    }

    // Get form completion progress (0-100)
    getFormProgress() {
        const completedSections = this.formParts.filter(part => part.isComplete()).length;
        return Math.round((completedSections / this.formParts.length) * 100);
    }
}

// Form Reset Logic
class FormReset {
    constructor() {
        this.fieldsToReset = [
            'serviceOption', 'firstName', 'lastName', 'contactNumber', 
            'email', 'barangay', 'address', 'specialInstructions'
        ];
    }

    // Reset entire form
    resetForm() {
        // Reset global variables
        selectedDate = null;
        selectedTime = null;
        window.selectedDate = null;
        window.selectedTime = null;
        
        // Reset form fields
        setTimeout(() => {
            this.clearFormFields();
            this.clearSelectedElements();
            this.resetTimeSlots();
        }, 0);
        
        // Reset calendar to current month
        currentDate = new Date();
        window.currentDate = currentDate;
        
        // Clear calendar data to force re-initialization
        if (typeof CALENDAR_DATA !== 'undefined') {
            CALENDAR_DATA.available = [];
            CALENDAR_DATA.unavailable = [];
        }
        
        // Force re-render calendar
        setTimeout(() => {
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
        }, 10);

        // Clear validation styles
        this.clearValidationStyles();
    }

    // Reset scheduling only (keeps customer fields intact)
    resetScheduling() {
        // Clear global scheduling variables
        selectedDate = null;
        selectedTime = null;
        window.selectedDate = null;
        window.selectedTime = null;
        selfClaimDate = null;
        selfClaimTime = null;
        window.selfClaimDate = null;
        window.selfClaimTime = null;

        // Clear selected UI elements
        document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));

        // Reset time slots placeholders
        const timeSlotsContainer = document.getElementById('timeSlots');
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = "<p class='time-slots-placeholder'>Please select a date first</p>";
            timeSlotsContainer.classList.remove('input-valid','input-invalid');
        }

        const selfSlots = document.getElementById('selfClaimTimeSlots');
        if (selfSlots) {
            selfSlots.innerHTML = "<p class='time-slots-placeholder'>Please select a claim date first</p>";
            selfSlots.classList.remove('input-valid','input-invalid');
        }

        // Clear calendar grids
        const calGrid = document.getElementById('calendarGrid');
        if (calGrid) calGrid.innerHTML = '';
        const selfGrid = document.getElementById('selfClaimCalendarGrid');
        if (selfGrid) selfGrid.innerHTML = '';

        // Hide self-claim section
        const selfClaimSection = document.getElementById('selfClaimSection');
        if (selfClaimSection) selfClaimSection.classList.add('hidden');

        // Reset booking indicator state if present
        const serviceIndicator = document.getElementById('serviceOptionIndicator');
        if (serviceIndicator) {
            // keep it hidden until a valid selection is made
            serviceIndicator.classList.add('hidden');
        }

        // Restore calendar state and re-render so the calendar shows dates immediately
        try {
            const start = new Date();
            if (typeof currentDate !== 'undefined') currentDate = start;
            window.currentDate = start;

            if (typeof initializeCalendarData === 'function') {
                initializeCalendarData();
            }
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
        } catch (e) {
            // non-fatal
        }
    }

    // Clear all form fields
    clearFormFields() {
        this.fieldsToReset.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = "";
            }
        });
    }

    // Clear selected elements
    clearSelectedElements() {
        // Clear selected time slots
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Clear selected calendar days
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    // Reset time slots display
    resetTimeSlots() {
        const timeSlotsContainer = document.getElementById("timeSlots");
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = "<p style='text-align: center; color: #666; font-style: italic; padding: 20px;'>Please select a date first</p>";
        }
    }

    // Clear validation styles
    clearValidationStyles() {
        setTimeout(() => {
            this.fieldsToReset.forEach(id => {
                const el = document.getElementById(id);
                if (el && typeof clearValidation === 'function') {
                    clearValidation(el);
                }
            });
            
            const timeSlots = document.getElementById('timeSlots'); 
            if (timeSlots) { 
                timeSlots.classList.remove('input-invalid', 'input-valid'); 
            }
            
            const btnNormal = document.getElementById('btnNormal');
            const btnRush = document.getElementById('btnRush');
            if (btnNormal) btnNormal.classList.remove('btn-invalid', 'btn-valid');
            if (btnRush) btnRush.classList.remove('btn-invalid', 'btn-valid');
        }, 0);
    }
}

// Create global instances
const formNavigation = new FormNavigation();
const formReset = new FormReset();

// Global functions for backward compatibility
function autoScrollToNextSection() {
    formNavigation.autoScrollToNextSection();
}

function resetForm() {
    formReset.resetForm();
}
