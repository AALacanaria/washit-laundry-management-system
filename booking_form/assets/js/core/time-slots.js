// Time slots data - All possible slots within shop hours
// Shop opens at 6:00 AM, closes at 5:00 PM
// Booking slots: 1 hour after opening (7:00 AM) to 2 hours before closing (3:00 PM)
const ALL_TIME_SLOTS = {
    "07:00": { available: 3, label: "7:00 AM" },
    "08:00": { available: 3, label: "8:00 AM" },
    "09:00": { available: 3, label: "9:00 AM" },
    "10:00": { available: 2, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 2, label: "12:00 PM" },
    "13:00": { available: 3, label: "1:00 PM" },
    "14:00": { available: 2, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" }
};

// Rush booking time slots (limited availability)
// Same time restrictions: 7:00 AM to 3:00 PM
const ALL_RUSH_TIME_SLOTS = {
    "07:00": { available: 1, label: "7:00 AM" },
    "08:00": { available: 1, label: "8:00 AM" },
    "09:00": { available: 1, label: "9:00 AM" },
    "10:00": { available: 1, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 1, label: "12:00 PM" },
    "13:00": { available: 1, label: "1:00 PM" },
    "14:00": { available: 1, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" }
};

// Legacy time slots (kept for backward compatibility)
// Updated to follow new time restrictions: 7:00 AM to 3:00 PM
const TIME_SLOTS = {
    "07:00": { available: 3, label: "7:00 AM" },
    "08:00": { available: 3, label: "8:00 AM" },
    "09:00": { available: 3, label: "9:00 AM" },
    "10:00": { available: 2, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 2, label: "12:00 PM" },
    "13:00": { available: 3, label: "1:00 PM" },
    "14:00": { available: 2, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" }
};

// Rush booking time slots (limited)
// Updated to follow new time restrictions: 7:00 AM to 3:00 PM
const RUSH_TIME_SLOTS = {
    "07:00": { available: 1, label: "7:00 AM" },
    "08:00": { available: 1, label: "8:00 AM" },
    "09:00": { available: 1, label: "9:00 AM" },
    "10:00": { available: 1, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 1, label: "12:00 PM" },
    "13:00": { available: 1, label: "1:00 PM" },
    "14:00": { available: 1, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" }
};

// Self-claim time slots (shop hours: 6:00 AM - 5:00 PM)
// Customers can pick up their items anytime during shop hours
const SELF_CLAIM_TIME_SLOTS = {
    "06:00": { available: 5, label: "6:00 AM" },
    "07:00": { available: 5, label: "7:00 AM" },
    "08:00": { available: 5, label: "8:00 AM" },
    "09:00": { available: 5, label: "9:00 AM" },
    "10:00": { available: 5, label: "10:00 AM" },
    "11:00": { available: 5, label: "11:00 AM" },
    "12:00": { available: 5, label: "12:00 PM" },
    "13:00": { available: 5, label: "1:00 PM" },
    "14:00": { available: 5, label: "2:00 PM" },
    "15:00": { available: 5, label: "3:00 PM" },
    "16:00": { available: 5, label: "4:00 PM" },
    "17:00": { available: 5, label: "5:00 PM" }
};
