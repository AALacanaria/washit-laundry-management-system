// Auto-fill Initialization - Handles system initialization and coordination
class AutoFillInitializer {
    constructor() {
        this.initialized = false;
        this.initAttempts = 0;
        this.maxAttempts = 5;
    }

    // Initialize the auto-fill system
    init() {
        if (this.initialized) {
            console.log('AutoFillInitializer: System already initialized');
            return;
        }

        console.log('AutoFillInitializer: Starting initialization');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.performInit());
        } else {
            this.performInit();
        }
    }

    // Perform the actual initialization
    performInit() {
        this.initAttempts++;
        
        // Check if required elements exist
        if (!this.checkRequiredElements()) {
            if (this.initAttempts < this.maxAttempts) {
                console.log(`AutoFillInitializer: Required elements not found, retrying... (${this.initAttempts}/${this.maxAttempts})`);
                setTimeout(() => this.performInit(), 500);
                return;
            } else {
                console.warn('AutoFillInitializer: Max initialization attempts reached, some features may not work');
            }
        }

        // Initialize auto-fill manager
        if (typeof autoFillManager !== 'undefined') {
            try {
                autoFillManager.initializeAutoFill();
                console.log('AutoFillInitializer: Auto-fill manager initialized');
            } catch (error) {
                console.error('AutoFillInitializer: Error initializing auto-fill manager:', error);
            }
        }

        // Initialize email suggestions
        if (typeof emailSuggestionManager !== 'undefined') {
            try {
                emailSuggestionManager.initialize();
                console.log('AutoFillInitializer: Email suggestions initialized');
            } catch (error) {
                console.error('AutoFillInitializer: Error initializing email suggestions:', error);
            }
        }

        // Set up form field watchers
        this.setupFormWatchers();

        this.initialized = true;
        console.log('AutoFillInitializer: System initialization complete');
    }

    // Check if required DOM elements exist
    checkRequiredElements() {
        const requiredElements = [
            'firstName', 'lastName', 'contactNumber', 'email', 'barangay'
        ];

        return requiredElements.every(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.log(`AutoFillInitializer: Missing element: ${id}`);
                return false;
            }
            return true;
        });
    }

    // Set up form field watchers for smart triggering
    setupFormWatchers() {
        const customerSection = document.querySelector('[data-section="customerSection"]');
        if (!customerSection) return;

        // Watch for when customer section becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && typeof autoFillManager !== 'undefined') {
                    // Trigger auto-fill check when section comes into view
                    if (autoFillManager.isAutoFillAvailable() && !autoFillManager.bannerShown) {
                        autoFillManager.initializeAutoFill();
                    }
                }
            });
        }, {
            threshold: 0.3 // Trigger when 30% of section is visible
        });

        observer.observe(customerSection);

        // Set up click listeners on form fields to trigger auto-fill
        CONFIG.AUTO_FILL.FIELDS.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('focus', () => {
                    if (typeof autoFillManager !== 'undefined' && 
                        autoFillManager.isAutoFillAvailable() && 
                        !autoFillManager.bannerShown) {
                        autoFillManager.initializeAutoFill();
                    }
                });
            }
        });

        console.log('AutoFillInitializer: Form watchers set up');
    }

    // Manual trigger for auto-fill (for testing or special cases)
    triggerAutoFill() {
        if (typeof autoFillManager !== 'undefined') {
            autoFillManager.initializeAutoFill();
        }
    }

    // Check initialization status
    isInitialized() {
        return this.initialized;
    }

    // Reset initialization (for testing)
    reset() {
        this.initialized = false;
        this.initAttempts = 0;
        console.log('AutoFillInitializer: System reset');
    }
}

// Create global instance
const autoFillInitializer = new AutoFillInitializer();

// Auto-initialize when script loads
autoFillInitializer.init();

// Global functions for backward compatibility
function initializeAutoFillSystem() {
    autoFillInitializer.init();
}

function triggerAutoFill() {
    autoFillInitializer.triggerAutoFill();
}

// Debug function
window.debugAutoFillInit = function() {
    console.log('Auto-fill initialization debug info:');
    console.log('Initialized:', autoFillInitializer.isInitialized());
    console.log('Init attempts:', autoFillInitializer.initAttempts);
    console.log('Max attempts:', autoFillInitializer.maxAttempts);
    console.log('Required elements check:', autoFillInitializer.checkRequiredElements());
};
