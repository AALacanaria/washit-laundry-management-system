// Auto-fill Manager - Handles user data persistence and auto-fill banner functionality
class AutoFillManager {
    constructor() {
        this.storageKey = CONFIG.AUTO_FILL.STORAGE_KEY;
        this.enabled = CONFIG.AUTO_FILL.ENABLED;
        this.fields = CONFIG.AUTO_FILL.FIELDS;
        this.bannerShown = false;
    }

    // Initialize auto-fill system
    initializeAutoFill() {
        if (!this.enabled) return;
        
        console.log('AutoFillManager: Initializing auto-fill system');
        
        // Check if we have saved data
        const savedData = this.loadUserData();
        if (savedData && Object.keys(savedData).length > 0) {
            console.log('AutoFillManager: Found saved data:', savedData);
            this.showAutoFillBanner(savedData);
        } else {
            console.log('AutoFillManager: No saved data found');
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
            console.error('AutoFillManager: Error loading user data:', error);
            return {};
        }
    }

    // Save user data to localStorage
    saveUserData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            console.log('AutoFillManager: User data saved:', data);
        } catch (error) {
            console.error('AutoFillManager: Error saving user data:', error);
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

                // Show auto-fill banner when clicking on empty fields (if we have data)
                field.addEventListener('click', () => {
                    const savedData = this.loadUserData();
                    if (!this.bannerShown && savedData && Object.keys(savedData).length > 0) {
                        this.showAutoFillBanner(savedData);
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

    // Show auto-fill banner
    showAutoFillBanner(data) {
        if (this.bannerShown) return;

        const customerSection = document.querySelector('[data-section="customerSection"]');
        if (!customerSection) return;

        // Create banner element
        const banner = document.createElement('div');
        banner.className = 'auto-fill-banner';
        banner.innerHTML = `
            <div class="auto-fill-content">
                <div class="auto-fill-icon">💾</div>
                <div class="auto-fill-text">
                    <strong>Auto-fill detected!</strong><br>
                    We found your previous information. Would you like to fill the form automatically?
                </div>
                <div class="auto-fill-actions">
                    <button type="button" class="auto-fill-btn" onclick="autoFillManager.fillForm()">
                        ✓ Fill Form
                    </button>
                    <button type="button" class="auto-fill-btn dismiss" onclick="autoFillManager.dismissBanner()">
                        ✗ Dismiss
                    </button>
                </div>
            </div>
        `;

        // Insert banner at the beginning of customer section
        const firstChild = customerSection.firstElementChild;
        customerSection.insertBefore(banner, firstChild);

        this.bannerShown = true;
        this.savedDataForFill = data;

        console.log('AutoFillManager: Auto-fill banner displayed');
    }

    // Fill form with saved data
    fillForm() {
        const data = this.savedDataForFill || this.loadUserData();
        console.log('AutoFillManager: Filling form with data:', data);

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

        console.log('AutoFillManager: Form filled successfully');
    }

    // Dismiss auto-fill banner
    dismissBanner() {
        const banner = document.querySelector('.auto-fill-banner');
        if (banner) {
            banner.remove();
            this.bannerShown = false;
            console.log('AutoFillManager: Auto-fill banner dismissed');
        }
    }

    // Clear saved data
    clearSavedData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('AutoFillManager: Saved data cleared');
        } catch (error) {
            console.error('AutoFillManager: Error clearing saved data:', error);
        }
    }

    // Get saved data (for debugging)
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

// Debug function
window.debugAutoFill = function() {
    console.log('Auto-fill debug info:');
    console.log('Enabled:', autoFillManager.enabled);
    console.log('Storage key:', autoFillManager.storageKey);
    console.log('Tracked fields:', autoFillManager.fields);
    console.log('Saved data:', autoFillManager.getSavedData());
    console.log('Banner shown:', autoFillManager.bannerShown);
};
