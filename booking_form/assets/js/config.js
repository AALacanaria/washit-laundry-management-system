// Configuration and Data
const CONFIG = {
    BOOKING_TYPES: {
        NORMAL: "normal",
        RUSH: "rush"
    },
    VALIDATION: {
        PHONE_PATTERN: /^09\d{9}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

// Time slots data
const TIME_SLOTS = {
    "09:00": { available: 3, label: "9:00 AM" },
    "10:00": { available: 2, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "13:00": { available: 3, label: "1:00 PM" },
    "14:00": { available: 2, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" },
    "16:00": { available: 2, label: "4:00 PM" },
    "17:00": { available: 1, label: "5:00 PM" }
};

// Rush booking time slots (limited)
const RUSH_TIME_SLOTS = {
    "09:00": { available: 1, label: "9:00 AM" },
    "10:00": { available: 1, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "13:00": { available: 1, label: "1:00 PM" },
    "14:00": { available: 1, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" },
    "16:00": { available: 1, label: "4:00 PM" },
    "17:00": { available: 1, label: "5:00 PM" }
};

// Calendar data - simulate available/unavailable dates
const CALENDAR_DATA = {
    available: [],
    unavailable: []
};

// Month names for calendar display
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Day names for calendar headers
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
