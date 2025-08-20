// Calendar Rendering and Display
class CalendarRenderer {
    constructor() {
        this.monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        this.dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    }

    // Render the calendar display
    renderCalendar() {
        this.updateMonthHeader();
        this.renderCalendarGrid();
    }

    // Update month/year header
    updateMonthHeader() {
        const currentMonthElement = document.getElementById("currentMonth");
        if (currentMonthElement) {
            const actualCurrentDate = currentDate || window.currentDate || new Date();
            currentMonthElement.textContent = 
                `${this.monthNames[actualCurrentDate.getMonth()]} ${actualCurrentDate.getFullYear()}`;
        }
    }

    // Render the calendar grid
    renderCalendarGrid() {
        const calendarGrid = document.getElementById("calendarGrid");
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = "";
        
        // Add day headers
        this.dayNames.forEach(day => {
            const dayHeader = document.createElement("div");
            dayHeader.className = "calendar-day";
            dayHeader.style.fontWeight = "bold";
            dayHeader.style.color = "#666";
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get calendar dates
        const actualCurrentDate = currentDate || window.currentDate || new Date();
        const firstDay = new Date(actualCurrentDate.getFullYear(), actualCurrentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Fill calendar with 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const dayElement = this.createDayElement(startDate, i, actualCurrentDate);
            calendarGrid.appendChild(dayElement);
        }
    }

    // Create individual day element
    createDayElement(startDate, dayOffset, currentMonth) {
        const dayElement = document.createElement("div");
        dayElement.className = "calendar-day";
        
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + dayOffset);
        
        // Check if it's current month
        if (currentDay.getMonth() === currentMonth.getMonth()) {
            dayElement.textContent = currentDay.getDate();
            
            this.applyDayStyles(dayElement, currentDay);
            this.applyDayInteraction(dayElement, currentDay);
        }
        
        return dayElement;
    }

    // Apply styling to day element
    applyDayStyles(dayElement, currentDay) {
        // Check if it's today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDay = new Date(currentDay);
        checkDay.setHours(0, 0, 0, 0);
        
        if (checkDay.getTime() === today.getTime()) {
            dayElement.classList.add("today");
        }
        
        // Check availability
        const isAvailable = CALENDAR_DATA.isDateAvailable(currentDay);
        if (isAvailable) {
            dayElement.classList.add("available");
        } else {
            dayElement.classList.add("unavailable");
        }
        
        // Check if selected
        const actualSelectedDate = selectedDate || window.selectedDate;
        if (actualSelectedDate) {
            const selectedDay = new Date(actualSelectedDate);
            selectedDay.setHours(0, 0, 0, 0);
            if (checkDay.getTime() === selectedDay.getTime()) {
                dayElement.classList.add("selected");
            }
        }
    }

    // Apply interaction to day element
    applyDayInteraction(dayElement, currentDay) {
        const isAvailable = CALENDAR_DATA.isDateAvailable(currentDay);
        if (isAvailable) {
            dayElement.onclick = () => this.selectDate(currentDay);
        }
    }

    // Select a date
    selectDate(date) {
        window.selectedDate = date;
        if (typeof selectedDate !== 'undefined') {
            selectedDate = date;
        }
        window.selectedTime = null;
        if (typeof selectedTime !== 'undefined') {
            selectedTime = null;
        }
        
        // Clear previous time slot selections
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Clear previous date selections
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Re-render calendar and show time slots immediately for the newly selected date
        this.renderCalendar();
        if (typeof timeSlotRenderer !== 'undefined') {
            timeSlotRenderer.renderTimeSlots();
        } else if (typeof renderTimeSlots === 'function') {
            renderTimeSlots();
        }

        // Update validation state
        if (typeof validateDateTimeVisual === 'function') {
            validateDateTimeVisual();
        }
    }

    // Navigate to previous month
    previousMonth() {
        const actualCurrentDate = currentDate || window.currentDate || new Date();
        actualCurrentDate.setMonth(actualCurrentDate.getMonth() - 1);
        
        // Update global references
        if (typeof currentDate !== 'undefined') {
            currentDate = actualCurrentDate;
        }
        window.currentDate = actualCurrentDate;
        
        this.renderCalendar();
    }

    // Navigate to next month
    nextMonth() {
        const actualCurrentDate = currentDate || window.currentDate || new Date();
        actualCurrentDate.setMonth(actualCurrentDate.getMonth() + 1);
        
        // Update global references
        if (typeof currentDate !== 'undefined') {
            currentDate = actualCurrentDate;
        }
        window.currentDate = actualCurrentDate;
        
        this.renderCalendar();
    }
}

// Create global instance
const calendarRenderer = new CalendarRenderer();

// Global functions for backward compatibility
function renderCalendar() {
    calendarRenderer.renderCalendar();
}

function selectDate(date) {
    calendarRenderer.selectDate(date);
}

function previousMonth() {
    calendarRenderer.previousMonth();
}

function nextMonth() {
    calendarRenderer.nextMonth();
}

// Legacy month and day names for compatibility
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
