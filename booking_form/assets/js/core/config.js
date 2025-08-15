// Configuration and Data
const CONFIG = {
    BOOKING_TYPES: {
        NORMAL: "normal",
        RUSH: "rush"
    },
    VALIDATION: {
        PHONE_PATTERN: /^09\d{9}$/,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    SHOP_SCHEDULE: {
        OPEN_HOUR: 6,  // 6 AM
        CLOSE_HOUR: 17, // 5 PM (17:00)
        TIMEZONE: 'Asia/Manila' // Philippines timezone
    },
    AUTO_FILL: {
        STORAGE_KEY: 'washit_user_info',
        ENABLED: true,
        FIELDS: ['firstName', 'lastName', 'contactNumber', 'email', 'barangay', 'address']
    },
    EMAIL_DOMAINS: [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'icloud.com',
        'yahoo.com.ph',
        'aol.com',
        'live.com',
        'msn.com',
        'protonmail.com'
    ]
};

// Global Variables (shared across all modules)
window.bookingType = "";
window.currentDate = new Date();
window.selectedDate = null;
window.selectedTime = null;
window.selfClaimDate = null;
window.selfClaimTime = null;
window.currentSelfClaimDate = new Date();

// Backward compatibility variables
let bookingType = "";
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let selfClaimDate = null;
let selfClaimTime = null;
let currentSelfClaimDate = new Date();
