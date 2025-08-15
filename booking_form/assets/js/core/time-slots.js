// Time slots data - All possible slots within shop hours
const ALL_TIME_SLOTS = {
    "06:00": { available: 3, label: "6:00 AM" },
    "07:00": { available: 3, label: "7:00 AM" },
    "08:00": { available: 3, label: "8:00 AM" },
    "09:00": { available: 3, label: "9:00 AM" },
    "10:00": { available: 2, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 2, label: "12:00 PM" },
    "13:00": { available: 3, label: "1:00 PM" },
    "14:00": { available: 2, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" },
    "16:00": { available: 2, label: "4:00 PM" },
    "17:00": { available: 1, label: "5:00 PM" }
};

// Rush booking time slots (limited availability)
const ALL_RUSH_TIME_SLOTS = {
    "06:00": { available: 1, label: "6:00 AM" },
    "07:00": { available: 1, label: "7:00 AM" },
    "08:00": { available: 1, label: "8:00 AM" },
    "09:00": { available: 1, label: "9:00 AM" },
    "10:00": { available: 1, label: "10:00 AM" },
    "11:00": { available: 1, label: "11:00 AM" },
    "12:00": { available: 1, label: "12:00 PM" },
    "13:00": { available: 1, label: "1:00 PM" },
    "14:00": { available: 1, label: "2:00 PM" },
    "15:00": { available: 1, label: "3:00 PM" },
    "16:00": { available: 1, label: "4:00 PM" },
    "17:00": { available: 1, label: "5:00 PM" }
};

// Legacy time slots (kept for backward compatibility)
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
