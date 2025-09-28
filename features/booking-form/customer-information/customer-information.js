// Auto-fill Manager - Handles user data persistence and auto-fill banner functionality
class AutoFillManager {
    constructor() {
        this.storageKey = CONFIG.AUTO_FILL.STORAGE_KEY;
        this.enabled = CONFIG.AUTO_FILL.ENABLED;
        this.fields = CONFIG.AUTO_FILL.FIELDS;
        this.bannerShown = false;
        this.storageFailureNotified = false;
    }

    // Initialize auto-fill system
    initializeAutoFill() {
        if (!this.enabled) return;

        // Check if we have saved data and auto-fill silently
        const savedData = this.loadUserData();
        if (savedData && Object.keys(savedData).length > 0) {
            setTimeout(() => {
                this.fillFormSilently(savedData);
            }, 500);
        }

        // Set up field listeners for saving data
        this.setupFieldListeners();
    }

    // Load user data from localStorage
    loadUserData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            this.notifyStorageFailure();
            return {};
        }
    }

    // Save user data to localStorage
    saveUserData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));

            // Also save service option for auto-fill
            const serviceOption = document.getElementById('serviceOption');
            if (serviceOption && serviceOption.value) {
                // Note: Service option autofill removed - only save for reference
                // data.serviceOption = serviceOption.value;
            }
        } catch (error) {
            this.notifyStorageFailure();
        }
    }

    // Set up field listeners to save data when fields are filled
    setupFieldListeners() {
        this.fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Save data when field loses focus and has content
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        this.saveFieldData(fieldId, field.value.trim());
                    }
                });

                // Also save when pressing Enter
                field.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && field.value.trim()) {
                        this.saveFieldData(fieldId, field.value.trim());
                    }
                });
            }
        });
    }

    // Save individual field data
    saveFieldData(fieldId, value) {
        const currentData = this.loadUserData();
        currentData[fieldId] = value;
        this.saveUserData(currentData);
    }

    // Fill form silently with saved data
    fillFormSilently(data) {
        // Fill regular fields
        this.fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && data[fieldId] && !field.value.trim()) {
                field.value = data[fieldId];

                // Trigger validation if available
                if (typeof validateText === 'function' && fieldId !== 'email') {
                    validateText(field);
                } else if (typeof validateEmail === 'function' && fieldId === 'email') {
                    validateEmail(field);
                }

                // Trigger any change events
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

    // Intentionally skip auto-filling the service option so the user must choose it each time.
    // This keeps the select required in the UI while still allowing other fields to be auto-filled.

        // Force re-check visibility of address field for rush bookings
        setTimeout(() => {
            const addressField = document.getElementById('address');
            const currentBookingType = window.bookingType || bookingType;

            if (addressField && data.address) {
                // Ensure address field is properly filled regardless of booking type
                if (!addressField.value.trim()) {
                    addressField.value = data.address;
                    if (typeof validateText === 'function') {
                        validateText(addressField);
                    }
                }
            }
        }, 200);
    }

    // Show auto-fill banner (kept for backward compatibility)
    showAutoFillBanner(data) {
        // Banner functionality removed - auto-fill now works silently
        return;
    }

    // Fill form with saved data
    fillForm() {
        const data = this.savedDataForFill || this.loadUserData();

        this.fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && data[fieldId]) {
                field.value = data[fieldId];

                // Trigger validation if available
                if (typeof validateText === 'function' && fieldId !== 'email') {
                    validateText(field);
                } else if (typeof validateEmail === 'function' && fieldId === 'email') {
                    validateEmail(field);
                }

                // Trigger any change events
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        this.dismissBanner();

        // Auto-scroll to next section after filling
        setTimeout(() => {
            if (typeof autoScrollToNextSection === 'function') {
                autoScrollToNextSection();
            }
        }, 500);
    }

    // Dismiss auto-fill banner
    dismissBanner() {
        const banner = document.querySelector('.auto-fill-banner');
        if (banner) {
            banner.remove();
            this.bannerShown = false;
        }
    }

    // Clear saved data
    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            this.notifyStorageFailure();
        }
    }

    notifyStorageFailure() {
        if (this.storageFailureNotified) {
            return;
        }

        this.storageFailureNotified = true;
        alert('We could not save your contact details for auto-fill. Your browser may be blocking storage or in private mode.');
    }

    // Provide access to saved data when needed elsewhere
    getSavedData() {
        return this.loadUserData();
    }

    // Check if auto-fill is available
    isAutoFillAvailable() {
        const data = this.loadUserData();
        return data && Object.keys(data).length > 0;
    }
}

// Create global instance
const autoFillManager = new AutoFillManager();

// Global functions for backward compatibility
function initializeAutoFill() {
    autoFillManager.initializeAutoFill();
}

function loadUserData() {
    return autoFillManager.loadUserData();
}

function saveUserData(data) {
    autoFillManager.saveUserData(data);
}
