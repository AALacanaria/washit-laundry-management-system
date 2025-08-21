// Validation Functions
function markValid(el) {
    if (!el) return;
    el.classList.remove('input-invalid');
    el.classList.add('input-valid');
}

function markInvalid(el) {
    if (!el) return;
    el.classList.remove('input-valid');
    el.classList.add('input-invalid');
}

function clearValidation(el) {
    if (!el) return;
    el.classList.remove('input-invalid', 'input-valid');
}

// Ensure form container and confirm section are visible
function ensureConfirmVisible() {
    const formSteps = document.getElementById('formSteps');
    const submitSection = document.querySelector('[data-section="confirmSection"]');
    // Don't auto-expand the main form container; only reveal confirmSection
    // when the form is already visible (user opened it) to avoid auto-fill
    // making the entire booking form appear unexpectedly.
    if (!formSteps || formSteps.classList.contains('hidden')) {
        // Form is still collapsed; do not auto-show confirm section
        return;
    }

    if (submitSection) {
        submitSection.classList.remove('hidden');
        submitSection.style.display = 'block';
    }
}

function validateText(el) {
    if (!el) return false;
    const val = (el.value || '').trim();
    if (val === '') {
        markInvalid(el);
        return false;
    }
    markValid(el);
    
    // Check if customer section is now complete and show Submit section
    // Only show the submit section if all fields are valid, but do not auto-scroll or focus
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            // Only reveal the submit section, do not scroll or focus
            const formSteps = document.getElementById('formSteps');
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (formSteps && !formSteps.classList.contains('hidden') && submitSection) {
                submitSection.classList.remove('hidden');
                submitSection.style.display = 'block';
            }
        }
    }, 100);
    
    return true;
}

function validateEmail(el) {
    if (!el) return false;
    const v = (el.value || '').trim();
    if (!CONFIG.VALIDATION.EMAIL_PATTERN.test(v)) { 
        markInvalid(el); 
        return false; 
    }
    markValid(el);
    
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (submitSection) {
                submitSection.classList.remove('hidden');
                submitSection.style.display = 'block';
            }
        }
    }, 100);
    
    return true;
}

function validatePhone(el) {
    if (!el) return false;
    const v = (el.value || '').trim();
    if (!CONFIG.VALIDATION.PHONE_PATTERN.test(v)) { 
        markInvalid(el); 
        return false; 
    }
    markValid(el);
    
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (submitSection) {
                submitSection.classList.remove('hidden');
                submitSection.style.display = 'block';
            }
        }
    }, 100);
    
    return true;
}

function validateSelect(el) {
    if (!el) return false;
    const v = (el.value || '').trim();
    if (!v) { 
        // For service cards, mark all cards as invalid
        if (el.id === 'serviceOption') {
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                card.classList.add('input-invalid');
                card.classList.remove('input-valid');
            });
        } else {
            markInvalid(el);
        }
        return false; 
    }
    
    // For service cards, mark selected card as valid
    if (el.id === 'serviceOption') {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.classList.remove('input-invalid');
            if (card.dataset.value === v) {
                card.classList.add('input-valid');
            } else {
                card.classList.remove('input-valid');
            }
        });
    } else {
        markValid(el);
    }
    
    // Auto-scroll if service option is selected
    if (el.id === 'serviceOption') {
        setTimeout(() => {
            const customerSection = document.querySelector('[data-section="customerInfo"]');
            if (customerSection) {
                customerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 500);
    }
    
    return true;
}

function validateBookingTypeVisual() {
    const toggleN = document.getElementById('toggleNormal');
    const toggleR = document.getElementById('toggleRush');
    
    if (bookingType === CONFIG.BOOKING_TYPES.NORMAL) {
        toggleN && toggleN.classList.add('btn-valid'); 
        toggleN && toggleN.classList.remove('btn-invalid');
        toggleR && toggleR.classList.remove('btn-valid', 'btn-invalid'); // Remove both classes from non-selected
        return true;
    } else if (bookingType === CONFIG.BOOKING_TYPES.RUSH) {
        toggleR && toggleR.classList.add('btn-valid'); 
        toggleR && toggleR.classList.remove('btn-invalid');
        toggleN && toggleN.classList.remove('btn-valid', 'btn-invalid'); // Remove both classes from non-selected
        return true;
    } else {
        // Only mark invalid when NO booking type is selected
        toggleN && toggleN.classList.remove('btn-valid'); 
        toggleN && toggleN.classList.add('btn-invalid');
        toggleR && toggleR.classList.remove('btn-valid'); 
        toggleR && toggleR.classList.add('btn-invalid');
        return false;
    }
}

function validateDateTimeVisual() {
    // Check both local and window variables for selected date and time
    const actualSelectedDate = selectedDate || window.selectedDate;
    const actualSelectedTime = selectedTime || window.selectedTime;
    
    // Check if this is a pickup and self-claim service
    const currentServiceType = window.selectedServiceType || (document.getElementById('serviceOption') && document.getElementById('serviceOption').value);
    const isPickupAndSelfClaim = currentServiceType === 'pickup_selfclaim';
    
    let ok = !!actualSelectedDate && !!actualSelectedTime;
    
    // For pickup and self-claim, also check if self-claim date and time are selected
    if (isPickupAndSelfClaim) {
        const actualSelfClaimDate = selfClaimDate || window.selfClaimDate;
        const actualSelfClaimTime = selfClaimTime || window.selfClaimTime;
        ok = ok && !!actualSelfClaimDate && !!actualSelfClaimTime;
    }
    
    // Get specific elements to highlight
    const calendarGrid = document.getElementById('calendarGrid');
    const timeSlots = document.getElementById('timeSlots');
    const selectedTimeSlot = document.querySelector('.time-slot.selected');
    
    if (!ok) {
        // Keep both calendar and time slots containers clean - no validation styling
        return false;
    } else {
        // Both calendar and time slots containers stay completely clean
        if (calendarGrid) {
            calendarGrid.classList.remove('input-invalid');
        }
        
        if (timeSlots) {
            timeSlots.classList.remove('input-invalid');
        }
        
        // Only highlight the selected time slot specifically
        if (selectedTimeSlot) {
            selectedTimeSlot.classList.add('input-valid');
            selectedTimeSlot.classList.remove('input-invalid');
        }
        
        return true;
    }
}

function validateAll() {
    let ok = true;
    const validationResults = {};
    const invalidElements = [];

    // Service option
    const serviceOption = document.getElementById('serviceOption');
    validationResults.serviceOption = validateSelect(serviceOption);
    if (!validationResults.serviceOption) {
        ok = false;
        // Add all service cards to invalid elements for scrolling
        const serviceCards = document.querySelectorAll('.service-card');
        if (serviceCards.length > 0) {
            invalidElements.push(serviceCards[0]);
        }
    }

    // Booking type
    validationResults.bookingType = validateBookingTypeVisual();
    if (!validationResults.bookingType) {
        ok = false;
        const toggleNormal = document.getElementById('toggleNormal');
        if (toggleNormal) {
            invalidElements.push(toggleNormal);
        }
    }

    // Customer info fields
    const customerFields = [
        { id: 'firstName', validator: validateText },
        { id: 'lastName', validator: validateText },
        { id: 'contactNumber', validator: validatePhone },
        { id: 'email', validator: validateEmail },
        { id: 'barangay', validator: validateText },
        { id: 'address', validator: validateText }
    ];

    customerFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            validationResults[field.id] = field.validator(element);
            if (!validationResults[field.id]) {
                ok = false;
                invalidElements.push(element);
            }
        }
    });

    // Date & time
    validationResults.dateTime = validateDateTimeVisual();
    if (!validationResults.dateTime) {
        ok = false;
        // Add calendar grid and time slots to invalid elements for scrolling
        const calendarGrid = document.getElementById('calendarGrid');
        const timeSlots = document.getElementById('timeSlots');
        if (calendarGrid) {
            invalidElements.push(calendarGrid);
        } else if (timeSlots) {
            invalidElements.push(timeSlots);
        }
    }

    // Payment method
    if (typeof validatePaymentMethodVisual === 'function') {
        validationResults.paymentMethod = validatePaymentMethodVisual();
        if (!validationResults.paymentMethod) {
            ok = false;
            const paymentCards = document.querySelectorAll('.payment-card');
            if (paymentCards.length > 0) {
                invalidElements.push(paymentCards[0]);
            }
        }
    }

    // If validation failed, scroll to first invalid element
    if (!ok && invalidElements.length > 0) {
        scrollToFirstInvalidField(invalidElements[0]);
    }

    return ok;
}

function scrollToFirstInvalidField(element) {
    if (!element) return;
    
    // Scroll to the element with some offset from top
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const offset = 100; // 100px from top
    
    window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
    });
    
    // Focus the element if it's focusable, otherwise focus the first input in its section
    setTimeout(() => {
        if (element.focus && (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')) {
            element.focus();
        } else {
            // Find the first focusable input in the same section
            const section = element.closest('.form-section') || element.closest('[data-section]');
            if (section) {
                const firstInput = section.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        }
    }, 500);
}