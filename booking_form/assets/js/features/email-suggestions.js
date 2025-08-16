// Email Suggestions Manager - Handles email domain autocomplete functionality
class EmailSuggestionManager {
    constructor() {
        this.emailDomains = CONFIG.EMAIL_DOMAINS;
        this.currentSuggestions = [];
        this.selectedIndex = -1;
        this.isVisible = false;
        this.inputElement = null;
        this.suggestionsContainer = null;
    }

    // Initialize email suggestions system
    initialize() {
    // initializing email suggestions
        
        this.inputElement = document.getElementById('email');
        if (!this.inputElement) {
            console.warn('EmailSuggestionManager: Email input element not found');
            return;
        }

        this.setupEventListeners();
    // email suggestions initialized
    }

    // Set up event listeners for email input
    setupEventListeners() {
        // Input event for real-time suggestions
        this.inputElement.addEventListener('input', (e) => {
            this.handleInput(e);
        });

        // Keydown event for navigation
        this.inputElement.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Focus event to show suggestions if applicable
        this.inputElement.addEventListener('focus', (e) => {
            this.handleFocus(e);
        });

        // Blur event to hide suggestions (with delay for clicks)
        this.inputElement.addEventListener('blur', (e) => {
            setTimeout(() => this.hideSuggestions(), 150);
        });

        // Click outside to hide suggestions
        document.addEventListener('click', (e) => {
            if (!this.inputElement.contains(e.target) && 
                (!this.suggestionsContainer || !this.suggestionsContainer.contains(e.target))) {
                this.hideSuggestions();
            }
        });
    }

    // Handle input changes
    handleInput(event) {
        const value = event.target.value.trim();
        
        if (!value || !value.includes('@')) {
            this.hideSuggestions();
            return;
        }

        const [localPart, domainPart] = value.split('@');
        
        if (!localPart || domainPart === undefined) {
            this.hideSuggestions();
            return;
        }

        // If domain part is empty or incomplete, show suggestions
        if (domainPart.length === 0 || !domainPart.includes('.')) {
            this.showSuggestions(localPart, domainPart);
        } else {
            this.hideSuggestions();
        }
    }

    // Handle keyboard navigation
    handleKeydown(event) {
        if (!this.isVisible) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentSuggestions.length - 1);
                this.updateSelection();
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;

            case 'Enter':
                event.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectSuggestion(this.currentSuggestions[this.selectedIndex]);
                }
                break;

            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    // Handle focus event
    handleFocus(event) {
        const value = event.target.value.trim();
        if (value && value.includes('@')) {
            const [localPart, domainPart] = value.split('@');
            if (localPart && domainPart !== undefined && (domainPart.length === 0 || !domainPart.includes('.'))) {
                this.showSuggestions(localPart, domainPart);
            }
        }
    }

    // Show email domain suggestions
    showSuggestions(localPart, domainPart) {
        // Filter domains based on current input
        const filteredDomains = this.emailDomains.filter(domain => 
            domain.toLowerCase().startsWith(domainPart.toLowerCase())
        );

        if (filteredDomains.length === 0) {
            this.hideSuggestions();
            return;
        }

        // Create suggestions with complete email addresses
        this.currentSuggestions = filteredDomains.map(domain => `${localPart}@${domain}`);
        this.selectedIndex = -1;

        this.createSuggestionsContainer();
        this.renderSuggestions();
        this.isVisible = true;

    // showing email suggestions
    }

    // Create suggestions container
    createSuggestionsContainer() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.remove();
        }

        this.suggestionsContainer = document.createElement('div');
        this.suggestionsContainer.className = 'email-suggestions';
        
        // Position the container relative to the input
        const inputRect = this.inputElement.getBoundingClientRect();
        const formGroup = this.inputElement.closest('.form-group') || this.inputElement.parentElement;
        
        if (formGroup) {
            formGroup.style.position = 'relative';
            formGroup.appendChild(this.suggestionsContainer);
        } else {
            document.body.appendChild(this.suggestionsContainer);
            this.suggestionsContainer.style.position = 'absolute';
            this.suggestionsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
            this.suggestionsContainer.style.left = `${inputRect.left + window.scrollX}px`;
            this.suggestionsContainer.style.width = `${inputRect.width}px`;
        }
    }

    // Render suggestions list
    renderSuggestions() {
        this.suggestionsContainer.innerHTML = '';

        this.currentSuggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            
            const [localPart, domain] = suggestion.split('@');
            item.innerHTML = `
                <span class="suggestion-email">${localPart}@</span>
                <span class="suggestion-domain">${domain}</span>
            `;

            item.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });

            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });

            this.suggestionsContainer.appendChild(item);
        });
    }

    // Update visual selection
    updateSelection() {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            item.classList.toggle('highlighted', index === this.selectedIndex);
        });
    }

    // Select a suggestion
    selectSuggestion(suggestion) {
        this.inputElement.value = suggestion;
        this.inputElement.focus();
        
        // Trigger validation if available
        if (typeof validateEmail === 'function') {
            validateEmail(this.inputElement);
        }
        
        // Trigger change event
        this.inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.hideSuggestions();
        
    // suggestion selected
    }

    // Hide suggestions
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.remove();
            this.suggestionsContainer = null;
        }
        this.isVisible = false;
        this.selectedIndex = -1;
        this.currentSuggestions = [];
    }

    // Check if suggestions are visible
    isActive() {
        return this.isVisible;
    }

    // Get current suggestions (for debugging)
    getCurrentSuggestions() {
        return this.currentSuggestions;
    }
}

// Create global instance
const emailSuggestionManager = new EmailSuggestionManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    emailSuggestionManager.initialize();
});

// Global function for backward compatibility
function initializeEmailSuggestions() {
    emailSuggestionManager.initialize();
}

// Debug function
window.debugEmailSuggestions = function() {
    // debug helper for email suggestions
};
