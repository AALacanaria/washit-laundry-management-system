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
    }, 0);
    
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
    
    // Check if customer section is now complete and show Submit section
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
        autoScrollToNextSection();
    }
    
    return true;
}

function validateBookingTypeVisual() {
    const btnN = document.getElementById('btnNormal');
    const btnR = document.getElementById('btnRush');
    
    if (bookingType === CONFIG.BOOKING_TYPES.NORMAL) {
        btnN && btnN.classList.add('btn-valid'); 
        btnN && btnN.classList.remove('btn-invalid');
        btnR && btnR.classList.remove('btn-valid'); 
        btnR && btnR.classList.add('btn-invalid');
        return true;
    } else if (bookingType === CONFIG.BOOKING_TYPES.RUSH) {
        btnR && btnR.classList.add('btn-valid'); 
        btnR && btnR.classList.remove('btn-invalid');
        btnN && btnN.classList.remove('btn-valid'); 
        btnN && btnN.classList.add('btn-invalid');
        return true;
    } else {
        btnN && btnN.classList.remove('btn-valid'); 
        btnN && btnN.classList.add('btn-invalid');
        btnR && btnR.classList.remove('btn-valid'); 
        btnR && btnR.classList.add('btn-invalid');
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
    
    const ts = document.getElementById('timeSlots');
    
    // validateDateTimeVisual diagnostics removed
    
    if (!ok) {
        ts && ts.classList.add('input-invalid');
        ts && ts.classList.remove('input-valid');
        return false;
    } else {
        ts && ts.classList.remove('input-invalid'); 
        ts && ts.classList.add('input-valid');
        return true;
    }
}

function validateAll() {
    let ok = true;
    const validationResults = {};

    // Service option
    const serviceOption = document.getElementById('serviceOption');
    validationResults.serviceOption = validateSelect(serviceOption);
    if (!validationResults.serviceOption) ok = false;

    // Booking type
    validationResults.bookingType = validateBookingTypeVisual();
    if (!validationResults.bookingType) ok = false;

    // Customer info fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const contactNumber = document.getElementById('contactNumber');
    const email = document.getElementById('email');
    const barangay = document.getElementById('barangay');
    const address = document.getElementById('address');

    validationResults.firstName = validateText(firstName);
    validationResults.lastName = validateText(lastName);
    validationResults.contactNumber = validatePhone(contactNumber);
    validationResults.email = validateEmail(email);
    validationResults.barangay = validateText(barangay);
    validationResults.address = validateText(address);

    if (!validationResults.firstName) ok = false;
    if (!validationResults.lastName) ok = false;
    if (!validationResults.contactNumber) ok = false;
    if (!validationResults.email) ok = false;
    if (!validationResults.barangay) ok = false;
    if (!validationResults.address) ok = false;

    // Date & time
    validationResults.dateTime = validateDateTimeVisual();
    if (!validationResults.dateTime) ok = false;

    // validateAll results computed

    return ok;
}
