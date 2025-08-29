// Form submission handler and initialization

document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar data
    initializeCalendarData();
    
    // Initialize self-claim calendar if available
    if (typeof initializeSelfClaimCalendar === 'function') {
        // Only initialize if we have the required data (guard against undefined globals)
        const rawSelectedDate = (typeof window.selectedDate !== 'undefined' && window.selectedDate) || (typeof selectedDate !== 'undefined' ? selectedDate : null);
        const rawBookingType = (typeof window.bookingType !== 'undefined' && window.bookingType) || (typeof bookingType !== 'undefined' ? bookingType : null);
        if (rawSelectedDate && rawBookingType) {
            initializeSelfClaimCalendar(rawSelectedDate, rawBookingType);
        }
    }
    
    // Initialize auto-fill system
    setTimeout(() => {
        if (typeof autoFillManager !== 'undefined') {
            autoFillManager.initializeAutoFill();
        }
    }, 500);
    
    // Find the form and set up event handlers
    const formEl = document.getElementById("bookingForm");
    if (formEl) {
        // Remove any existing listeners by cloning the form
        const newForm = formEl.cloneNode(true);
        formEl.parentNode.replaceChild(newForm, formEl);

        // Attach live validators to form inputs
        attachValidators();
        
        // Update static header on page load if service is already selected
        const serviceOption = document.getElementById('serviceOption');
        if (serviceOption && serviceOption.value) {
            updateStaticCalendarHeader(serviceOption.value);
        }

        // Set up form submission handler
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form values first
            const serviceOptionVal = document.getElementById("serviceOption").value;
            const firstNameVal = document.getElementById("firstName").value.trim();
            const lastNameVal = document.getElementById("lastName").value.trim();
            const contactNumberVal = document.getElementById("contactNumber").value.trim();
            const emailVal = document.getElementById("email").value.trim();
            const barangayVal = document.getElementById("barangay").value.trim();
            const addressVal = document.getElementById("address").value.trim();
            const specialInstructionsVal = document.getElementById("specialInstructions").value.trim();
            
            // Run full validation
            const valid = validateAll();
            
            if (!valid) {
                alert('Please complete all required fields and selections highlighted in red. The page will scroll to the first incomplete field.');
                return;
            }

            // Save user data for auto-fill before showing confirmation
            if (typeof autoFillManager !== 'undefined') {
                const userData = {
                    firstName: firstNameVal,
                    lastName: lastNameVal,
                    contactNumber: contactNumberVal,
                    email: emailVal,
                    barangay: barangayVal,
                    address: addressVal,
                    serviceOption: serviceOptionVal
                };
                autoFillManager.saveUserData(userData);
            }

            // Show confirmation
            showConfirmation(
                serviceOptionVal, 
                firstNameVal, 
                lastNameVal, 
                contactNumberVal, 
                emailVal, 
                barangayVal, 
                addressVal, 
                specialInstructionsVal
            );
        });
        
        // Debug: Add click listener to submit button
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {

                // Since natural form submission isn't working, manually trigger form submission
                e.preventDefault();
                const form = document.getElementById('bookingForm');
                if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                }
            });
        }
    }
});

// Attach event listeners for live validation
function attachValidators() {
    const fields = [
        { id: 'firstName', fn: validateText },
        { id: 'lastName', fn: validateText },
        { id: 'contactNumber', fn: validatePhone },
        { id: 'email', fn: validateEmail },
        { id: 'barangay', fn: validateText },
        { id: 'address', fn: validateText }
    ];
    
    fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        
        el.addEventListener('input', () => {
            // Special handling for contact number - filter to numbers only and limit to 11 digits
            if (f.id === 'contactNumber') {
                let value = el.value.replace(/\D/g, ''); // Remove non-digits
                if (value.length > 11) {
                    value = value.substring(0, 11); // Limit to 11 digits
                }
                el.value = value;
            }
            
            if ((el.value || '').trim() === '') { 
                clearValidation(el); 
            } else {
                f.fn(el);
            }
        });
        
        el.addEventListener('blur', () => {
            if ((el.value || '').trim() !== '') {
                f.fn(el);
                
                // Save field data for auto-fill
                if (typeof autoFillManager !== 'undefined') {
                    autoFillManager.saveFieldData(f.id, el.value.trim());
                }
            }
        });
    });

    // Initialize quantity input validation
    initQuantityValidation();

    // Service option validation
    const svc = document.getElementById('serviceOption');
    if (svc) {
        svc.addEventListener('change', () => {
            validateSelect(svc);
            resetScheduleOnServiceChange();
            updateServiceIndicator(svc.value);
            updateStaticCalendarHeader(svc.value);
        });
    }

    // When the user switches service options, reset scheduling-specific selections
    if (svc) {
        svc.addEventListener('change', () => {
            try {
                if (typeof formReset !== 'undefined' && formReset && typeof formReset.resetScheduling === 'function') {
                    formReset.resetScheduling();
                } else if (typeof formNavigation !== 'undefined' && formNavigation && typeof formNavigation.resetScheduling === 'function') {
                    formNavigation.resetScheduling();
                }
            } catch (e) {
                // non-fatal
            }
        });
    }

    // Booking type toggle validation
    const toggleN = document.getElementById('toggleNormal');
    const toggleR = document.getElementById('toggleRush');
    if (toggleN) toggleN.addEventListener('click', () => {
        // Reset self-claim calendar when booking type changes
        if (typeof resetSelfClaimCalendar === 'function') {
            resetSelfClaimCalendar();
        }
        validateBookingTypeVisual();
    });
    if (toggleR) toggleR.addEventListener('click', () => {
        // Reset self-claim calendar when booking type changes
        if (typeof resetSelfClaimCalendar === 'function') {
            resetSelfClaimCalendar();
        }
        validateBookingTypeVisual();
    });
}

// Initialize quantity input validation
function initQuantityValidation() {
    const qtyInputs = document.querySelectorAll('.qty-input');
    qtyInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Same approach as contact number: filter to numbers only and limit to 3 digits
            let value = this.value.replace(/\D/g, ''); // Remove non-digits
            if (value.length > 3) {
                value = value.substring(0, 3); // Limit to 3 digits
            }
            this.value = value;

            // Validate and provide visual feedback
            const numericValue = parseInt(value, 10);
            if (value === '' || isNaN(numericValue) || numericValue < 0 || numericValue > 999) {
                markInvalid(this);
            } else {
                markValid(this);
            }
        });

        input.addEventListener('blur', function() {
            // Ensure value is valid on blur
            const value = parseInt(this.value, 10);
            if (this.value === '' || isNaN(value) || value < 0 || value > 999) {
                markInvalid(this);
            } else {
                markValid(this);
            }
        });
    });
}

// Update static calendar header based on service selection
function updateStaticCalendarHeader(serviceValue) {
    const header = document.getElementById('calendarHeader');
    const subtext = document.getElementById('calendarSubtext');
    
    if (!header || !subtext) return;
    
    if (serviceValue === 'dropoff_delivery') {
        header.textContent = '📅 Choose Drop-off Schedule';
        subtext.textContent = 'Select your preferred drop-off date and time:';
    } else {
        header.textContent = '📅 Choose Pickup Schedule';
        subtext.textContent = 'Select your preferred pickup date and time:';
    }
}

// Update service option indicator
function updateServiceIndicator(serviceValue) {
    const indicator = document.getElementById('serviceOptionIndicator');
    const description = document.getElementById('serviceDescription');
    const selfClaimSection = document.getElementById('selfClaimSection');
    const selfClaimTimeSlots = document.getElementById('selfClaimTimeSlots');
    window.selectedServiceType = serviceValue;

    if (!indicator || !description) return;

    // Base indicator styling
    indicator.className = 'service-option-indicator';

    if (!serviceValue) {
        indicator.classList.add('hidden');
        return;
    }

    // Booking type influences wording only
    const currentBookingType = window.bookingType || bookingType;
    const deliveryPeriod = currentBookingType === 'rush' ? '1.5 days' : '2-3 days';

    indicator.classList.remove('hidden');
    indicator.classList.add(serviceValue.replace('_', '-'));

    // Visibility rules for self-claim calendar section
    const wantsSelfClaim = serviceValue === 'pickup_selfclaim';
    if (wantsSelfClaim) {
        // Defer showing self-claim calendar until user re-selects date & time under new service
        if (selfClaimSection) {
            selfClaimSection.classList.add('hidden');
            selfClaimSection.style.display = 'none';
        }
        updateScheduleTitle('pickup');
        // Any prior initialization will happen later via time slot selection logic (time-slots.js)
    } else {
        // Non self-claim service: hide and hard clear any residual UI
        if (selfClaimSection) {
            selfClaimSection.classList.add('hidden');
            selfClaimSection.style.display = 'none';
        }
        if (selfClaimTimeSlots) selfClaimTimeSlots.innerHTML = '';
        window.selfClaimDate = null;
        updateScheduleTitle('default');
    }

    // Service description content
    let descriptionHTML = '';
    switch (serviceValue) {
        case 'pickup_delivery':
            descriptionHTML = `
                <strong>🚚 Pickup and Delivery</strong><br>
                The laundry shop will pick up the item and also deliver it back to you.<br>
                <em style="color: #6c757d; font-size: 0.9rem;">Delivery period: ${deliveryPeriod}</em>
            `;
            break;
        case 'pickup_selfclaim':
            descriptionHTML = `
                <strong>🏪 Pickup and Self-Claim</strong><br>
                The laundry shop will pick up the item, and you will pick it up on your own at the shop.<br>
                <em style="color: #6c757d; font-size: 0.9rem;">Items ready for self-claim in ${deliveryPeriod} from today | Shop hours: Mon-Sat, 6:00 AM - 5:00 PM</em>
            `;
            break;
        case 'dropoff_delivery':
            descriptionHTML = `
                <strong>📦 Drop-off and Delivery</strong><br>
                You will drop off the item at the shop within a specified time, and the laundry shop will deliver it back to you.<br>
                <em style="color: #6c757d; font-size: 0.9rem;">Delivery period: ${deliveryPeriod}</em>
            `;
            break;
        default:
            indicator.classList.add('hidden');
            return;
    }

    // (Removed duplicate description block that incorrectly redefined descriptionHTML)
    description.innerHTML = descriptionHTML;
}

// Update schedule section title based on service type
function updateScheduleTitle(mode) {
    const scheduleTitle = document.querySelector('[data-section="scheduleSection"] h3');
    if (!scheduleTitle) return;
    
    switch (mode) {
        case 'pickup':
            scheduleTitle.textContent = 'Book Pick-up and Self-claim Schedule';
            break;
        case 'claim':
            scheduleTitle.textContent = 'Book Pick-up and Self-claim Schedule';
            break;
        default:
            scheduleTitle.textContent = 'Book a Schedule';
            break;
    }
}

// Utility: close/clear time slots UI explicitly
function closeTimeSlots() {
    const ts = document.getElementById('timeSlots');
    if (ts) {
        ts.innerHTML = '';
    }
    // Remove any selected time state
    window.selectedTime = null;
    if (typeof selectedTime !== 'undefined') {
        try { selectedTime = null; } catch(e) { /* ignore */ }
    }
}

function hideTimeSlots() { closeTimeSlots(); }

// Minimal reset used when switching service types
function resetScheduleOnServiceChange() {
    // Clear core state
    window.selectedDate = null;
    window.selectedTime = null;
    window.selfClaimDate = null;
    try { if (typeof selectedDate !== 'undefined') selectedDate = null; } catch(e) {}
    try { if (typeof selectedTime !== 'undefined') selectedTime = null; } catch(e) {}

    // Clear visual selections
    document.querySelectorAll('#calendarGrid .calendar-day.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));

    // Hide/clear time slots
    const ts = document.getElementById('timeSlots');
    if (ts) { ts.innerHTML = ''; ts.classList.add('hidden'); ts.style.display = 'none'; }

    // Reset self-claim calendar/section
    if (typeof resetSelfClaimCalendar === 'function') resetSelfClaimCalendar();
    const sc = document.getElementById('selfClaimSection');
    if (sc) { sc.classList.add('hidden'); sc.style.display = 'none'; }
    const scSlots = document.getElementById('selfClaimTimeSlots');
    if (scSlots) scSlots.innerHTML = '';

    // Re-render main calendar (blank state)
    if (typeof calendarRenderer !== 'undefined') calendarRenderer.renderCalendar();
    else if (typeof renderCalendar === 'function') renderCalendar();

    if (typeof validateDateTimeVisual === 'function') validateDateTimeVisual();
}

