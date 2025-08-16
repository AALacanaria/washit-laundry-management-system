// Form submission handler and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar data
    initializeCalendarData();
    
    // Initialize self-claim calendar if available
    if (typeof initializeSelfClaimCalendar === 'function') {
        // Only initialize if we have the required data
        const hasPickupData = (window.selectedDate || selectedDate) && (window.bookingType || bookingType);
        if (hasPickupData) {
            const pickupDate = window.selectedDate || selectedDate;
            const bookingType = window.bookingType || bookingType;
            initializeSelfClaimCalendar(pickupDate, bookingType);
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
                // Focus first invalid element
                const firstInvalid = document.querySelector('.input-invalid, .btn-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                alert('Please complete all required fields and selections highlighted in red.');
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

    // Service option validation
    const svc = document.getElementById('serviceOption');
    if (svc) {
        svc.addEventListener('change', () => {
            validateSelect(svc);
            updateServiceIndicator(svc.value);
            updateStaticCalendarHeader(svc.value);
            if (typeof renderTimeSlots === 'function') {
                renderTimeSlots();
            }
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
    if (toggleN) toggleN.addEventListener('click', () => validateBookingTypeVisual());
    if (toggleR) toggleR.addEventListener('click', () => validateBookingTypeVisual());
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
    
    // Set global service type for validation
    window.selectedServiceType = serviceValue;
    
    if (!indicator || !description) return;
    
    // Clear existing classes
    indicator.className = 'service-option-indicator';
    
    // Always hide self-claim section initially
    if (selfClaimSection) {
        selfClaimSection.classList.add('hidden');
    }
    
    if (!serviceValue || serviceValue === '') {
        indicator.classList.add('hidden');
        return;
    }
    
    // Get current booking type for delivery period
    const currentBookingType = window.bookingType || bookingType;
    const deliveryPeriod = currentBookingType === 'rush' ? '1.5 days' : '2-3 days';
    
    // Show indicator and add appropriate class
    indicator.classList.remove('hidden');
    indicator.classList.add(serviceValue.replace('_', '-'));
    
    // Handle self-claim section visibility - only show for pickup_selfclaim
    if (serviceValue === 'pickup_selfclaim') {
        updateScheduleTitle('pickup');
    } else {
        // For all other service types, ensure self-claim is hidden
        if (selfClaimSection) {
            selfClaimSection.classList.add('hidden');
        }
        updateScheduleTitle('default');
    }
    
    // Set description based on service type
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
