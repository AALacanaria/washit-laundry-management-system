// Calendar Data and Initialization
class CalendarData {
    constructor() {
        this.available = [];
        this.unavailable = [];
    }

    // Initialize calendar data for next 30 days
    initializeCalendarData() {
        // Clear existing data first
        this.available = [];
        this.unavailable = [];
        
        const today = new Date();
        const thirtyDaysLater = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        for (let d = new Date(today); d <= thirtyDaysLater; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const isSunday = dayOfWeek === 0; // Sunday only (shop closed)
            
            if (isSunday) {
                this.unavailable.push(new Date(d));
            } else {
                this.available.push(new Date(d));
            }
        }
    }

    // Check if a date is available for booking
    isDateAvailable(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        
        const isPast = checkDate < today;
        if (isPast) return false;

        // Shop is open Monday-Saturday (closed Sundays only)
        const dayOfWeek = checkDate.getDay();
        const isSunday = dayOfWeek === 0;

        return !isSunday;
    }

    // Clear all calendar data
    clearCalendarData() {
        this.available = [];
        this.unavailable = [];
    }
}

// Create global instance for backward compatibility
const CALENDAR_DATA = new CalendarData();

// Global function for backward compatibility
function initializeCalendarData() {
    CALENDAR_DATA.initializeCalendarData();
}

function isDateAvailable(date) {
    return CALENDAR_DATA.isDateAvailable(date);
}
