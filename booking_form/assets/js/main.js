// Global Variables
let bookingType = "";
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

// Form submission handler and initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar data
    initializeCalendarData();
    
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

            // Collect form values
            const serviceOptionVal = document.getElementById("serviceOption").value;
            const firstNameVal = document.getElementById("firstName").value.trim();
            const lastNameVal = document.getElementById("lastName").value.trim();
            const contactNumberVal = document.getElementById("contactNumber").value.trim();
            const emailVal = document.getElementById("email").value.trim();
            const barangayVal = document.getElementById("barangay").value.trim();
            const addressVal = document.getElementById("address").value.trim();
            const specialInstructionsVal = document.getElementById("specialInstructions").value.trim();

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
            if ((el.value || '').trim() === '') { 
                clearValidation(el); 
            } else {
                f.fn(el);
            }
        });
        
        el.addEventListener('blur', () => {
            if ((el.value || '').trim() !== '') {
                f.fn(el);
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
