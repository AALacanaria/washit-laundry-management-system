// Booking Logic Functions
function selectBookingType(type) {
    // If clicking same option -> toggle hide/show
    const formSteps = document.getElementById("formSteps");
    const bookingIndicator = document.getElementById("bookingTypeIndicator");
    const rushFieldsEl = document.getElementById("rushFields");
    const btnNormal = document.getElementById("btnNormal");
    const btnRush = document.getElementById("btnRush");

    // If same type clicked -> collapse/hide
    if (bookingType === type) {
        // clear selection
        bookingType = "";
        // collapse animated container and hide for accessibility
        if (formSteps) {
            formSteps.classList.remove("expanded");
            formSteps.classList.add("hidden");
        }
        if (bookingIndicator) bookingIndicator.classList.add("hidden");
        if (rushFieldsEl) rushFieldsEl.classList.add("hidden");
        if (btnNormal) btnNormal.classList.remove("expanded");
        if (btnRush) btnRush.classList.remove("expanded");

        // Remove visual selected classes on buttons but leave inputs intact
        const normalBtn = document.querySelector('.btn-primary');
        const rushBtn = document.querySelector('.btn-secondary');
        if (normalBtn) normalBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
        if (rushBtn) rushBtn.classList.remove('selected', 'normal-selected', 'rush-selected');

        return;
    }

    // Selecting a (possibly different) type -> keep previous behavior but also show/hide properly
    const previousType = bookingType;
    bookingType = type;

    // Update visual button states (existing logic)
    const normalBtn = document.querySelector('.btn-primary');
    const rushBtn = document.querySelector('.btn-secondary');

    if (normalBtn) normalBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
    if (rushBtn) rushBtn.classList.remove('selected', 'normal-selected', 'rush-selected');

    if (type === CONFIG.BOOKING_TYPES.RUSH) {
        if (rushBtn) rushBtn.classList.add('selected', 'rush-selected');
    } else {
        if (normalBtn) normalBtn.classList.add('selected', 'normal-selected');
    }

    // rotate arrows: add 'expanded' to clicked booking-toggle button, remove from the other
    if (btnNormal) btnNormal.classList.toggle('expanded', type === CONFIG.BOOKING_TYPES.NORMAL);
    if (btnRush) btnRush.classList.toggle('expanded', type === CONFIG.BOOKING_TYPES.RUSH);

    // Update booking type indicator content & styles (existing logic)
    const indicator = document.getElementById("bookingTypeIndicator");
    const text = document.getElementById("bookingTypeText");

    if (type === CONFIG.BOOKING_TYPES.RUSH) {
        if (text) text.textContent = "Rush Booking";
        if (indicator) {
            indicator.innerHTML = '<strong>Rush Booking</strong> - Same day service (limited slots)';
            indicator.style.background = "#fff5f5";
            indicator.style.borderColor = "#fed7d7";
            indicator.style.color = "#c53030";
        }
        if (rushFieldsEl) rushFieldsEl.classList.remove("hidden");
        const addr = document.getElementById("address");
        if (addr) addr.required = true;
    } else {
        if (text) text.textContent = "Normal Booking";
        if (indicator) {
            indicator.innerHTML = '<strong>Normal Booking</strong> - 3-day processing time';
            indicator.style.background = "#fff3cd";
            indicator.style.borderColor = "#ffeaa7";
            indicator.style.color = "#856404";
        }
        if (rushFieldsEl) rushFieldsEl.classList.add("hidden");
        const addr = document.getElementById("address");
        if (addr) addr.required = false;
    }

    // Show form steps and booking indicator
    if (formSteps) {
        formSteps.classList.remove("hidden");
        formSteps.classList.add("expanded");
    }
    if (bookingIndicator) bookingIndicator.classList.remove("hidden");

    // If switching between two different types (not initial open), reset form to clear previous selections
    if (previousType && previousType !== type) {
        resetForm();
    }

    // Initialize calendar and render
    setTimeout(() => {
        initializeCalendarData();
        renderCalendar();
        renderTimeSlots();
    }, 150);

    // Ensure visual validation state is updated for booking type buttons
    validateBookingTypeVisual();
    
    // After selecting booking type, scroll to Service Details section
    if (bookingType) {
        setTimeout(() => {
            const serviceSection = document.querySelector('[data-section="serviceSection"]');
            if (serviceSection) {
                serviceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 400);
    }
}

// Auto-scroll helper: moves to next incomplete section
function autoScrollToNextSection() {
    // Define the form parts in order with their validation checks
    const formParts = [
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
            isComplete: () => !!selectedDate && !!selectedTime,
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
            elementSelector: '[data-section="confirmSection"]'
        }
    ];
    
    // Find the first incomplete section and scroll to its next part
    for (let i = 0; i < formParts.length; i++) {
        const part = formParts[i];
        if (!part.isComplete()) {
            // Current part is incomplete, stay here (don't scroll)
            return;
        }
        
        // Current part is complete, check if we should move to next
        if (i < formParts.length - 1) {
            const nextElementSelector = part.elementSelector;
            const nextElement = document.querySelector(nextElementSelector);
            if (nextElement) {
                setTimeout(() => {
                    nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

// Reset form function
function resetForm() {
    // Reset global variables
    selectedDate = null;
    selectedTime = null;
    
    // Reset form fields
    setTimeout(() => {
        const serviceOption = document.getElementById("serviceOption");
        const firstName = document.getElementById("firstName");
        const lastName = document.getElementById("lastName");
        const contactNumber = document.getElementById("contactNumber");
        const email = document.getElementById("email");
        const barangay = document.getElementById("barangay");
        const address = document.getElementById("address");
        const specialInstructions = document.getElementById("specialInstructions");
        
        if (serviceOption) serviceOption.value = "";
        if (firstName) firstName.value = "";
        if (lastName) lastName.value = "";
        if (contactNumber) contactNumber.value = "";
        if (email) email.value = "";
        if (barangay) barangay.value = "";
        if (address) address.value = "";
        if (specialInstructions) specialInstructions.value = "";
        
        // Clear any selected time slots
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Clear any selected calendar days
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Reset time slots display
        const timeSlotsContainer = document.getElementById("timeSlots");
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = "<p style='text-align: center; color: #666; font-style: italic; padding: 20px;'>Please select a date first</p>";
        }
    }, 0);
    
    // Reset calendar to current month
    currentDate = new Date();
    
    // Clear calendar data to force re-initialization
    CALENDAR_DATA.available = [];
    CALENDAR_DATA.unavailable = [];
    
    // Force re-render calendar immediately to clear any visual selections
    setTimeout(() => {
        renderCalendar();
    }, 10);

    // Clear validation styles
    setTimeout(() => {
        ['firstName','lastName','contactNumber','email','barangay','address','serviceOption'].forEach(id => {
            const el = document.getElementById(id);
            if (el) clearValidation(el);
        });
        
        const ts = document.getElementById('timeSlots'); 
        if (ts) { 
            ts.classList.remove('input-invalid','input-valid'); 
        }
        
        const btnN = document.getElementById('btnNormal');
        const btnR = document.getElementById('btnRush');
        if (btnN) btnN.classList.remove('btn-invalid','btn-valid');
        if (btnR) btnR.classList.remove('btn-invalid','btn-valid');
    }, 0);
}

function showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    // Hide the form
    document.getElementById("formSteps").classList.add("hidden");
    
    // Show confirmation
    const confirmation = document.getElementById("confirmation");
    const reviewDetails = document.getElementById("reviewDetails");
    
    // Sanitize inputs to prevent XSS
    const sanitizeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    };
    
    const selectedDateStr = selectedDate.toLocaleDateString();
    const timeSlots = bookingType === CONFIG.BOOKING_TYPES.RUSH ? RUSH_TIME_SLOTS : TIME_SLOTS;
    const selectedTimeStr = timeSlots[selectedTime].label;
    const fullName = `${firstName} ${lastName}`.trim();
    
    reviewDetails.innerHTML = `
        <p><strong>Booking Type:</strong> ${bookingType === CONFIG.BOOKING_TYPES.RUSH ? "Rush Booking" : "Normal Booking"}</p>
        <p><strong>Service Option:</strong> ${sanitizeHTML(formatService(serviceOption))}</p>
        <p><strong>Date:</strong> ${sanitizeHTML(selectedDateStr)}</p>
        <p><strong>Time:</strong> ${sanitizeHTML(selectedTimeStr)}</p>
        <p><strong>Full Name:</strong> ${sanitizeHTML(fullName)}</p>
        <p><strong>Contact Number:</strong> ${sanitizeHTML(contactNumber)}</p>
        ${email ? `<p><strong>Email:</strong> ${sanitizeHTML(email)}</p>` : ''}
        ${barangay ? `<p><strong>Barangay:</strong> ${sanitizeHTML(barangay)}</p>` : ''}
        ${address ? `<p><strong>Delivery Address:</strong> ${sanitizeHTML(address)}</p>` : ''}
        ${specialInstructions ? `<p><strong>Special Instructions:</strong> ${sanitizeHTML(specialInstructions)}</p>` : ''}
    `;
    
    confirmation.classList.remove("hidden");
}

function formatService(service) {
    switch (service) {
        case "pickup_delivery": return "Pickup and Delivery";
        case "pickup_selfclaim": return "Pickup and Self-Claim";
        case "dropoff_delivery": return "Drop-off and Delivery";
        default: return "";
    }
}
