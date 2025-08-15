// Calendar Functions
function initializeCalendarData() {
    // Clear existing data first
    CALENDAR_DATA.available = [];
    CALENDAR_DATA.unavailable = [];
    
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    for (let d = new Date(today); d <= thirtyDaysLater; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        
        if (isWeekend) {
            CALENDAR_DATA.unavailable.push(new Date(d));
        } else {
            CALENDAR_DATA.available.push(new Date(d));
        }
    }
}

function renderCalendar() {
    document.getElementById("currentMonth").textContent = 
        `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const calendarGrid = document.getElementById("calendarGrid");
    calendarGrid.innerHTML = "";
    
    // Add day headers
    DAY_NAMES.forEach(day => {
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
            
            // Check if selected - ensure only one date is selected at a time
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
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const isPast = checkDate < today;
    if (isPast) return false;

    // For both normal and rush booking: weekdays available, weekends unavailable
    const dayOfWeek = checkDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return !isWeekend;
}

function selectDate(date) {
    selectedDate = date;
    selectedTime = null;
    
    // Clear previous time slot selections when date changes
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Clear previous date selections to remove blue stroke
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    renderCalendar();
    renderTimeSlots();

    // update validation state for date/time (date selected but time not yet)
    validateDateTimeVisual();
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
    timeSlotsTitle.style.marginBottom = "6px";
    timeSlotsTitle.style.color = "#333";
    timeSlotsTitle.style.fontSize = "1.05rem";
    timeSlotsTitle.style.fontWeight = "600";
    timeSlotsContainer.appendChild(timeSlotsTitle);
    
    const isRush = bookingType === CONFIG.BOOKING_TYPES.RUSH;
    
    // When rush booking, show a small indicator above the AM group
    if (isRush) {
        const amInfo = document.createElement("div");
        amInfo.className = "slot-divider";
        amInfo.innerHTML = `
            <div style="text-align:center; line-height:1.25;">
                Rush booking: Only AM times can be chosen
                <div style="margin-top:6px; font-size:0.9rem; color:#666;">
                    (deliveries are scheduled in the PM until the shop's closing time).
                </div>
            </div>
        `;
        amInfo.style.margin = "4px auto 8px";
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
    
    if (bookingType === CONFIG.BOOKING_TYPES.RUSH) {
        availableTimeSlots = RUSH_TIME_SLOTS;
    } else {
        availableTimeSlots = TIME_SLOTS;
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
    
    // Create and append AM divider above the AM group
    const amDivider = document.createElement("div");
    amDivider.className = "am-pm-divider";
    amDivider.innerHTML = '<span>AM</span>';
    if (amGroup.children.length > 0) {
        wrapper.appendChild(amDivider);
        wrapper.appendChild(amGroup);
    } else {
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
        if (amGroup.children.length > 0) wrapper.appendChild(noPm);
    }
    
    timeSlotsContainer.appendChild(wrapper);

    // After rendering slots, update validation visuals
    validateDateTimeVisual();
}

function selectTimeSlot(time, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new time
    element.classList.add('selected');
    selectedTime = time;

    // Update validation visual for date/time with immediate check
    setTimeout(() => {
        validateDateTimeVisual();
        
        // Auto-scroll to next section when both date and time are selected
        if (selectedDate && selectedTime) {
            autoScrollToNextSection();
        }
    }, 100);
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}
