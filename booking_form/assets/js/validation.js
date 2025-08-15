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

function validateText(el) {
    if (!el) return false;
    const val = (el.value || '').trim();
    if (val === '') {
        markInvalid(el);
        return false;
    }
    markValid(el);
    
    // Check if customer section is now complete and auto-scroll
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            autoScrollToNextSection();
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
    
    // Check if customer section is now complete and auto-scroll
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            autoScrollToNextSection();
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
    
    // Check if customer section is now complete and auto-scroll
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            autoScrollToNextSection();
        }
    }, 100);
    
    return true;
}

function validateSelect(el) {
    if (!el) return false;
    const v = (el.value || '').trim();
    if (!v) { 
        markInvalid(el); 
        return false; 
    }
    markValid(el);
    
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
    const ok = !!selectedDate && !!selectedTime;
    const ts = document.getElementById('timeSlots');
    
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

    // Service option
    const serviceOption = document.getElementById('serviceOption');
    if (!validateSelect(serviceOption)) ok = false;

    // Booking type
    if (!validateBookingTypeVisual()) ok = false;

    // Customer info fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const contactNumber = document.getElementById('contactNumber');
    const email = document.getElementById('email');
    const barangay = document.getElementById('barangay');
    const address = document.getElementById('address');

    if (!validateText(firstName)) ok = false;
    if (!validateText(lastName)) ok = false;
    if (!validatePhone(contactNumber)) ok = false;
    if (!validateEmail(email)) ok = false;
    if (!validateText(barangay)) ok = false;
    if (!validateText(address)) ok = false;

    // Date & time
    if (!validateDateTimeVisual()) ok = false;

    return ok;
}
