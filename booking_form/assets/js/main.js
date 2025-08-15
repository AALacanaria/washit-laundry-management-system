// Form submission handler and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar data
    initializeCalendarData();
    
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
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
                    address: addressVal
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
        });
    }

    // Booking type button validation
    const btnN = document.getElementById('btnNormal');
    const btnR = document.getElementById('btnRush');
    if (btnN) btnN.addEventListener('click', () => validateBookingTypeVisual());
    if (btnR) btnR.addEventListener('click', () => validateBookingTypeVisual());
}
