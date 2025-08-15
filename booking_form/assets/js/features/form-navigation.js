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
                        
                        if (confirmSection) {
                            confirmSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        
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
                        nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Trigger auto-fill when scrolling to customer section
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
            setTimeout(() => {
                submitBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    // Scroll to specific section
    scrollToSection(sectionSelector) {
        const element = document.querySelector(sectionSelector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
