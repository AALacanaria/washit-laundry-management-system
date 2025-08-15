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
    
    // Check if customer section is now complete and auto-scroll to Submit section
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            // Directly scroll to Submit section
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (submitSection) {
                submitSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add highlight effect to submit button
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';
                    submitBtn.style.transform = 'scale(1.02)';
                    
                    // Remove highlight after a few seconds
                    setTimeout(() => {
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.transform = '';
                    }, 3000);
                }
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
    
    // Check if customer section is now complete and auto-scroll to Submit section
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            // Directly scroll to Submit section
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (submitSection) {
                submitSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add highlight effect to submit button
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';
                    submitBtn.style.transform = 'scale(1.02)';
                    
                    // Remove highlight after a few seconds
                    setTimeout(() => {
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.transform = '';
                    }, 3000);
                }
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
    
    // Check if customer section is now complete and auto-scroll to Submit section
    setTimeout(() => {
        const customerComplete = ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address'].every(id => {
            const field = document.getElementById(id);
            return field && field.classList.contains('input-valid');
        });
        if (customerComplete) {
            // Directly scroll to Submit section
            const submitSection = document.querySelector('[data-section="confirmSection"]');
            if (submitSection) {
                submitSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add highlight effect to submit button
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';
                    submitBtn.style.transform = 'scale(1.02)';
                    
                    // Remove highlight after a few seconds
                    setTimeout(() => {
                        submitBtn.style.boxShadow = '';
                        submitBtn.style.transform = '';
                    }, 3000);
                }
            }
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
    // Check both local and window variables for selected date and time
    const actualSelectedDate = selectedDate || window.selectedDate;
    const actualSelectedTime = selectedTime || window.selectedTime;
    const ok = !!actualSelectedDate && !!actualSelectedTime;
    const ts = document.getElementById('timeSlots');
    
    console.log('validateDateTimeVisual:', {
        selectedDate,
        'window.selectedDate': window.selectedDate,
        actualSelectedDate,
        selectedTime,
        'window.selectedTime': window.selectedTime,
        actualSelectedTime,
        ok
    });
    
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

    console.log('validateAll results:', validationResults);
    console.log('Overall validation:', ok);

    return ok;
}
