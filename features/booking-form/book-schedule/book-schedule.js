// Book Schedule Section - Calendar and Time Slots Management
class BookSchedule {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedSelfClaimDate = null;
        this.selectedSelfClaimTime = null;
        this.currentBookingType = 'normal';
        this.init();
    }

    init() {
        // Initialize calendar and time slots
        this.initializeCalendar();
        this.initializeTimeSlots();
        this.setupEventListeners();
    }

    initializeCalendar() {
        // Calendar initialization logic
        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            this.renderCalendar();
        }
    }

    initializeTimeSlots() {
        // Time slots initialization logic
        const timeSlots = document.getElementById('timeSlots');
        if (timeSlots) {
            this.renderTimeSlots();
        }
    }

    setupEventListeners() {
        // Calendar navigation
        const prevBtn = document.querySelector('.calendar-navigation button:first-child');
        const nextBtn = document.querySelector('.calendar-navigation button:last-child');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousMonth());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());
    }

    renderCalendar() {
        // Calendar rendering logic
    }

    renderTimeSlots() {
        // Time slots rendering logic
    }

    previousMonth() {
        // Previous month navigation
    }

    nextMonth() {
        // Next month navigation
    }

    selectDate(date) {
        this.selectedDate = date;
        this.updateTimeSlots(date);
    }

    selectTimeSlot(time) {
        this.selectedTime = time;
    }

    updateTimeSlots(date) {
        // Update available time slots based on selected date
    }

    getSelectedSchedule() {
        return {
            date: this.selectedDate,
            time: this.selectedTime,
            selfClaimDate: this.selectedSelfClaimDate,
            selfClaimTime: this.selectedSelfClaimTime
        };
    }
}

// Initialize book schedule functionality
document.addEventListener('DOMContentLoaded', () => {
    window.bookSchedule = new BookSchedule();
});

// Legacy function compatibility
function previousMonth() {
    if (window.bookSchedule) {
        window.bookSchedule.previousMonth();
    }
}

function nextMonth() {
    if (window.bookSchedule) {
        window.bookSchedule.nextMonth();
    }
}

function previousMonthSelfClaim() {
    // Self-claim calendar navigation
}

function nextMonthSelfClaim() {
    // Self-claim calendar navigation
}
