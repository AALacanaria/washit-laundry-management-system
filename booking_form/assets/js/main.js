let bookingType = "";
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

// Calendar data - simulate available/unavailable dates
const availableDates = {
    // Available dates (green) - next 30 days
    available: [],
    // Unavailable dates (red) - weekends and holidays
    unavailable: []
};

// Time slots data
const timeSlots = {
    "09:00": { available: 3, label: "9:00 AM" },
    "10:00": { available: 2, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "13:00": { available: 3, label: "1:00 PM" },
    "14:00": { available: 2, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" },
    "16:00": { available: 2, label: "4:00 PM" },
    "17:00": { available: 1, label: "5:00 PM" }
};

// Initialize calendar data
function initializeCalendarData() {
    // Clear existing data first
    availableDates.available = [];
    availableDates.unavailable = [];
    
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    for (let d = new Date(today); d <= thirtyDaysLater; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        
        if (isWeekend) {
            availableDates.unavailable.push(new Date(d));
        } else {
            availableDates.available.push(new Date(d));
        }
    }
}

// Reset form function
function resetForm() {
    // Reset global variables
    selectedDate = null;
    selectedTime = null;
    
    // Reset form fields - use setTimeout to ensure DOM is ready
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
    availableDates.available = [];
    availableDates.unavailable = [];
    
    // Force re-render calendar immediately to clear any visual selections
    setTimeout(() => {
        renderCalendar();
    }, 10);
}

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

    if (type === "rush") {
        if (rushBtn) rushBtn.classList.add('selected', 'rush-selected');
    } else {
        if (normalBtn) normalBtn.classList.add('selected', 'normal-selected');
    }

    // rotate arrows: add 'expanded' to clicked booking-toggle button, remove from the other
    if (btnNormal) btnNormal.classList.toggle('expanded', type === 'normal');
    if (btnRush) btnRush.classList.toggle('expanded', type === 'rush');

    // Update booking type indicator content & styles (existing logic)
    const indicator = document.getElementById("bookingTypeIndicator");
    const text = document.getElementById("bookingTypeText");

    if (type === "rush") {
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

    // Debug
    console.log('Booking type selected:', bookingType);
    console.log('Form expanded:', document.getElementById("formSteps").classList.contains('expanded'));
}

// Calendar functions
function renderCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    document.getElementById("currentMonth").textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const calendarGrid = document.getElementById("calendarGrid");
    calendarGrid.innerHTML = "";
    
    // Add day headers
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach(day => {
        const dayHeader = document.createElement("div");
        dayHeader.className = "calendar-day";
        dayHeader.style.fontWeight = "bold";
        dayHeader.style.color = "#666";
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Fill calendar
    for (let i = 0; i < 42; i++) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        
        // Check if it's current month
        if (currentDay.getMonth() === currentDate.getMonth()) {
            dayElement.textContent = currentDay.getDate();
            
            // Check if it's today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDay = new Date(currentDay);
            checkDay.setHours(0, 0, 0, 0);
            
            if (checkDay.getTime() === today.getTime()) {
                dayElement.classList.add("today");
            }
            
            // Check availability
            const isAvailable = isDateAvailable(currentDay);
            if (isAvailable) {
                dayElement.classList.add("available");
                dayElement.onclick = () => selectDate(currentDay);
            } else {
                dayElement.classList.add("unavailable");
            }
            
            // Check if selected
            if (selectedDate) {
                const selectedDay = new Date(selectedDate);
                selectedDay.setHours(0, 0, 0, 0);
                if (checkDay.getTime() === selectedDay.getTime()) {
                    dayElement.classList.add("selected");
                }
            }
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function isDateAvailable(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const isPast = checkDate < today;
    if (isPast) return false;

    // For both normal and rush booking: weekdays available, weekends unavailable
    const dayOfWeek = checkDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    return !isWeekend;
}

function selectDate(date) {
    selectedDate = date;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots();
}

function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById("timeSlots");
    timeSlotsContainer.innerHTML = "";
    
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = "<p style='text-align: center; color: #666; font-style: italic; padding: 20px;'>Please select a date first</p>";
        return;
    }
    
    // Add title with proper centering - outside the grid
    const timeSlotsTitle = document.createElement("h4");
    timeSlotsTitle.textContent = `Available times for ${selectedDate.toLocaleDateString()}`;
    timeSlotsTitle.style.textAlign = "center";
    timeSlotsTitle.style.marginBottom = "6px"; // tightened spacing
    timeSlotsTitle.style.color = "#333";
    timeSlotsTitle.style.fontSize = "1.05rem";
    timeSlotsTitle.style.fontWeight = "600";
    timeSlotsContainer.appendChild(timeSlotsTitle);
    
    const isRush = bookingType === "rush";
    // When rush booking, show a small indicator above the AM group
    if (isRush) {
        const amInfo = document.createElement("div");
        amInfo.className = "slot-divider";
        amInfo.innerHTML = `
            <div style="text-align:center; line-height:1.25;">
                Rush booking: Only AM times can be chosen
                <div style="margin-top:6px; font-size:0.9rem; color:#666;">
                    (deliveries are scheduled in the PM until the shop’s closing time).
                </div>
            </div>
        `;
        amInfo.style.margin = "4px auto 8px"; // tightened spacing
        timeSlotsContainer.appendChild(amInfo);
    }
    
    // Wrapper for stacked AM and PM groups
    const wrapper = document.createElement("div");
    wrapper.className = "time-slots-wrapper";
    
    const amGroup = document.createElement("div");
    amGroup.className = "time-slots-group am-group";
    
    const pmGroup = document.createElement("div");
    pmGroup.className = "time-slots-group pm-group";
    
    // Filter time slots based on booking type
    let availableTimeSlots = {};
    
    if (bookingType === "rush") {
        availableTimeSlots = {
            "09:00": { available: 1, label: "9:00 AM" },
            "10:00": { available: 1, label: "10:00 AM" },
            "11:00": { available: 1, label: "11:00 AM" },
            "13:00": { available: 1, label: "1:00 PM" },
            "14:00": { available: 1, label: "2:00 PM" },
            "15:00": { available: 1, label: "3:00 PM" },
            "16:00": { available: 1, label: "4:00 PM" },
            "17:00": { available: 1, label: "5:00 PM" }
        };
    } else {
        availableTimeSlots = timeSlots;
    }
    
    // Ensure predictable order by sorting keys (HH:MM)
    const entries = Object.entries(availableTimeSlots).sort((a, b) => a[0].localeCompare(b[0]));
    
    entries.forEach(([time, slot]) => {
        const slotElement = document.createElement("div");
        slotElement.className = "time-slot";
        
        const hour = parseInt(time.split(':')[0], 10);
        if (hour < 12) {
            slotElement.classList.add("am");
        } else {
            slotElement.classList.add("pm");
        }

        // Determine displayed slot count/text; for rush+PM we mark as not selectable
        let slotCountText = `${slot.available} slot${slot.available > 1 ? 's' : ''} available`;
        if (isRush && hour >= 12) {
            slotCountText = "PM delivery not selectable";
        }
        
        slotElement.innerHTML = `
            <div class="time-label">${slot.label}</div>
            <div class="slot-count">${slotCountText}</div>
        `;
        
        if (isRush && hour >= 12) {
            // mark PM as unavailable for selection in rush mode
            slotElement.classList.add("unavailable");
            slotElement.setAttribute("aria-disabled", "true");
        } else {
            if (slot.available > 0) {
                slotElement.onclick = () => selectTimeSlot(time, slotElement);
            } else {
                slotElement.classList.add("unavailable");
                slotElement.setAttribute("aria-disabled", "true");
            }
        }
        
        if (hour < 12) {
            amGroup.appendChild(slotElement);
        } else {
            pmGroup.appendChild(slotElement);
        }
    });
    
    // Create and append AM divider above the AM group (always add divider first)
    const amDivider = document.createElement("div");
    amDivider.className = "am-pm-divider";
    amDivider.innerHTML = '<span>AM</span>';
    if (amGroup.children.length > 0) {
        wrapper.appendChild(amDivider);
        wrapper.appendChild(amGroup);
    } else {
        // If no AM slots, show a small note but still keep AM divider above it
        wrapper.appendChild(amDivider);
        const noAm = document.createElement("div");
        noAm.className = "time-slots-note";
        noAm.textContent = "No AM slots available";
        wrapper.appendChild(noAm);
    }
    
    // If PM group exists, add a divider then PM group
    if (pmGroup.children.length > 0) {
        const pmDivider = document.createElement("div");
        pmDivider.className = "am-pm-divider";
        pmDivider.innerHTML = '<span>PM</span>';
        wrapper.appendChild(pmDivider);
        wrapper.appendChild(pmGroup);
    } else {
        const noPm = document.createElement("div");
        noPm.className = "time-slots-note";
        noPm.textContent = "No PM slots available";
        // Only append if AM exists — keep layout consistent
        if (amGroup.children.length > 0) wrapper.appendChild(noPm);
    }
    
    timeSlotsContainer.appendChild(wrapper);
}

function selectTimeSlot(time, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new time
    element.classList.add('selected');
    selectedTime = time;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById("bookingForm");
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const serviceOption = document.getElementById("serviceOption").value;
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const contactNumber = document.getElementById("contactNumber").value.trim();
        const email = document.getElementById("email").value.trim();
        const barangay = document.getElementById("barangay").value.trim();
        const address = document.getElementById("address").value.trim();
        const specialInstructions = document.getElementById("specialInstructions").value.trim();
        
        // Validate all fields
        if (!serviceOption) {
            alert("Please select a service option.");
            return;
        }
        
        if (!selectedDate || !selectedTime) {
            alert("Please select a date and time.");
            return;
        }
        
        if (!firstName || !lastName) {
            alert("Please enter your first and last name.");
            return;
        }
        
        if (!contactNumber) {
            alert("Please enter your contact number.");
            return;
        }
        
        // Basic phone number validation (Philippine format)
        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(contactNumber)) {
            alert("Please enter a valid Philippine mobile number (09xxxxxxxxx).");
            return;
        }
        
        // Validate rush booking fields
        if (bookingType === "rush" && !address) {
            alert("Please enter your delivery address for rush booking.");
            return;
        }
        
        // Show confirmation with review
        showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions);
    });
});

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
    const selectedTimeStr = timeSlots[selectedTime].label;
    const fullName = `${firstName} ${lastName}`.trim();
    
    reviewDetails.innerHTML = `
        <p><strong>Booking Type:</strong> ${bookingType === "rush" ? "Rush Booking" : "Normal Booking"}</p>
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
