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
        const fullName = document.getElementById("fullName");
        const contactNumber = document.getElementById("contactNumber");
        const address = document.getElementById("address");
        const specialInstructions = document.getElementById("specialInstructions");
        
        if (serviceOption) serviceOption.value = "";
        if (fullName) fullName.value = "";
        if (contactNumber) contactNumber.value = "";
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
    bookingType = type;
    
    // Update button visual states
    const normalBtn = document.querySelector('.btn-primary');
    const rushBtn = document.querySelector('.btn-secondary');
    
    // Remove all selected classes
    normalBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
    rushBtn.classList.remove('selected', 'normal-selected', 'rush-selected');
    
    // Add appropriate selected class
    if (type === "rush") {
        rushBtn.classList.add('selected', 'rush-selected');
        normalBtn.classList.remove('rush-selected');
    } else {
        normalBtn.classList.add('selected', 'normal-selected');
        rushBtn.classList.remove('normal-selected');
    }
    
    // Update booking type indicator
    const indicator = document.getElementById("bookingTypeIndicator");
    const text = document.getElementById("bookingTypeText");
    
    if (type === "rush") {
        text.textContent = "Rush Booking";
        indicator.innerHTML = '<strong>Rush Booking</strong> - Same day service (limited slots)';
        indicator.style.background = "#fff5f5";
        indicator.style.borderColor = "#fed7d7";
        indicator.style.color = "#c53030";
        
        // Show rush-specific fields
        document.getElementById("rushFields").classList.remove("hidden");
        document.getElementById("address").required = true;
    } else {
        text.textContent = "Normal Booking";
        indicator.innerHTML = '<strong>Normal Booking</strong> - 3-day processing time';
        indicator.style.background = "#fff3cd";
        indicator.style.borderColor = "#ffeaa7";
        indicator.style.color = "#856404";
        
        // Hide rush-specific fields
        document.getElementById("rushFields").classList.add("hidden");
        document.getElementById("address").required = false;
    }
    
    // Expand the form steps container with animation
    const formSteps = document.getElementById("formSteps");
    formSteps.classList.add("expanded");
    
    // Reset ALL form data when switching booking types
    resetForm();
    
    // Initialize calendar and render with a longer delay to ensure complete reset
    setTimeout(() => {
        // Force re-initialization of calendar data
        initializeCalendarData();
        renderCalendar();
        renderTimeSlots(); // Clear time slots when switching
    }, 150);
    
    // Debug: Log the current state
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
    
    const isToday = checkDate.getTime() === today.getTime();
    const isPast = checkDate < today;
    
    if (isPast) return false;
    
    // For rush booking, only today is available
    if (bookingType === "rush") {
        return isToday;
    }
    
    // For normal booking, check available dates (weekdays)
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
    timeSlotsTitle.style.marginBottom = "20px";
    timeSlotsTitle.style.color = "#333";
    timeSlotsTitle.style.fontSize = "1.1rem";
    timeSlotsTitle.style.fontWeight = "600";
    timeSlotsContainer.appendChild(timeSlotsTitle);
    
    const slotsGrid = document.createElement("div");
    slotsGrid.className = "time-slots";
    
    // Filter time slots based on booking type
    let availableTimeSlots = {};
    
    if (bookingType === "rush") {
        // For rush booking, show all time slots but with limited availability
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
        // For normal booking, show regular time slots
        availableTimeSlots = timeSlots;
    }
    
    Object.entries(availableTimeSlots).forEach(([time, slot]) => {
        const slotElement = document.createElement("div");
        slotElement.className = "time-slot";
        
        // Add AM/PM class based on time
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) {
            slotElement.classList.add("am");
        } else {
            slotElement.classList.add("pm");
        }
        
        slotElement.innerHTML = `
            <div class="time-label">${slot.label}</div>
            <div class="slot-count">${slot.available} slot${slot.available > 1 ? 's' : ''} available</div>
        `;
        
        if (slot.available > 0) {
            slotElement.onclick = () => selectTimeSlot(time, slotElement);
        } else {
            slotElement.classList.add("unavailable");
        }
        
        slotsGrid.appendChild(slotElement);
    });
    
    timeSlotsContainer.appendChild(slotsGrid);
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
        const fullName = document.getElementById("fullName").value.trim();
        const contactNumber = document.getElementById("contactNumber").value.trim();
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
        
        if (!fullName) {
            alert("Please enter your full name.");
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
        showConfirmation(serviceOption, fullName, contactNumber, address, specialInstructions);
    });
});

function showConfirmation(serviceOption, fullName, contactNumber, address, specialInstructions) {
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
    
    reviewDetails.innerHTML = `
        <p><strong>Booking Type:</strong> ${bookingType === "rush" ? "Rush Booking" : "Normal Booking"}</p>
        <p><strong>Service Option:</strong> ${sanitizeHTML(formatService(serviceOption))}</p>
        <p><strong>Date:</strong> ${sanitizeHTML(selectedDateStr)}</p>
        <p><strong>Time:</strong> ${sanitizeHTML(selectedTimeStr)}</p>
        <p><strong>Full Name:</strong> ${sanitizeHTML(fullName)}</p>
        <p><strong>Contact Number:</strong> ${sanitizeHTML(contactNumber)}</p>
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
