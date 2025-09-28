// Payment Method Section - Shared Logic
class PaymentMethodManager {
    constructor() {
        this.selectedPaymentMethod = "";
        this.paymentFlow = {
            method: "",
            timing: "",
            status: "pending"
        };
        this.init();
    }

    init() {
        // Initialize payment method functionality
        this.setupEventListeners();
        this.resetPaymentSelection();
    }

    setupEventListeners() {
        // Add any shared event listeners here
    }

    // Main payment method selection handler
    selectPaymentMethod(cardElement, method) {
        // Remove previous selections
        const allCards = document.querySelectorAll('.payment-card');
        allCards.forEach(card => {
            card.classList.remove('selected');
        });

        // Add selected class to clicked card
        cardElement.classList.add('selected');

        // Update payment flow information
        this.updatePaymentFlow(method);

        // Update selected method
        this.selectedPaymentMethod = method;
        const hiddenInput = document.getElementById('paymentMethod');
        if (hiddenInput) {
            hiddenInput.value = method;
        }

        // Update global window variable for compatibility
        window.selectedPaymentMethod = method;

        // Delegate to specific payment method handler
        if (method === 'cash') {
            if (window.codPayment) {
                window.codPayment.handleSelection(cardElement);
            }
        } else if (method === 'cashless') {
            if (window.cashlessPayment) {
                window.cashlessPayment.handleSelection(cardElement);
            }
        }

        // Show payment flow information
        this.showPaymentFlowInfo(method);

        // Trigger validation
        if (typeof validatePaymentMethodVisual === 'function') {
            validatePaymentMethodVisual();
        }

        // Remove auto-scroll - let user stay in current position
    }

    updatePaymentFlow(method) {
        this.paymentFlow.method = method;
        this.paymentFlow.status = 'selected';
        
        // Delegate detailed flow updates to specific handlers
        if (method === 'cash' && window.codPayment) {
            window.codPayment.updateFlow(this.paymentFlow);
        } else if (method === 'cashless' && window.cashlessPayment) {
            window.cashlessPayment.updateFlow(this.paymentFlow);
        }
    }

    showPaymentFlowInfo(method) {
        // Remove any existing flow info
        const existingInfo = document.querySelector('.payment-flow-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        // Delegate to specific payment method for flow info
        let content = '';
        if (method === 'cash' && window.codPayment) {
            content = window.codPayment.getFlowInfo();
        } else if (method === 'cashless' && window.cashlessPayment) {
            content = window.cashlessPayment.getFlowInfo();
        }

        if (content) {
            const flowInfo = document.createElement('div');
            flowInfo.className = 'payment-flow-info';
            flowInfo.innerHTML = content;
            
            // Insert after payment options
            const paymentSection = document.querySelector('.payment-options');
            paymentSection.parentNode.insertBefore(flowInfo, paymentSection.nextSibling);

            // Add highlight without scrolling
            setTimeout(() => {
                flowInfo.classList.add('highlight');
                setTimeout(() => flowInfo.classList.remove('highlight'), 2000);
            }, 100);
        }
    }

    // Enhanced form submission with payment flow integration
    async processPaymentFlow() {
        if (!this.selectedPaymentMethod) {
            throw new Error('Please select a payment method');
        }

        try {
            if (this.selectedPaymentMethod === 'cash' && window.codPayment) {
                return await window.codPayment.processPayment();
            } else if (this.selectedPaymentMethod === 'cashless' && window.cashlessPayment) {
                return await window.cashlessPayment.processPayment();
            } else {
                throw new Error('Payment method handler not found');
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Reset payment selection
    resetPaymentSelection() {
        this.selectedPaymentMethod = "";
        window.selectedPaymentMethod = "";
        
        const allCards = document.querySelectorAll('.payment-card');
        allCards.forEach(card => {
            card.classList.remove('selected', 'input-valid', 'input-invalid');
        });

        const hiddenInput = document.getElementById('paymentMethod');
        if (hiddenInput) {
            hiddenInput.value = "";
        }

        // Reset specific payment method handlers
        if (window.codPayment) {
            window.codPayment.reset();
        }
        if (window.cashlessPayment) {
            window.cashlessPayment.reset();
        }
    }

    // Get current payment method
    getSelectedPaymentMethod() {
        return this.selectedPaymentMethod || window.selectedPaymentMethod || "";
    }

    // Section validation
    validateSection() {
        const isValid = !!this.selectedPaymentMethod;
        
        // Update visual validation state
        const allCards = document.querySelectorAll('.payment-card');
        allCards.forEach(card => {
            card.classList.remove('input-valid', 'input-invalid');
        });

        if (isValid) {
            const selectedCard = document.querySelector('.payment-card.selected');
            if (selectedCard) {
                selectedCard.classList.add('input-valid');
            }
        }

        return isValid;
    }
}

// Initialize payment method manager
let paymentMethodManager;
document.addEventListener('DOMContentLoaded', () => {
    paymentMethodManager = new PaymentMethodManager();
    window.paymentMethodManager = paymentMethodManager;
});

// Legacy function compatibility
function selectPaymentMethod(cardElement, method) {
    if (window.paymentMethodManager) {
        window.paymentMethodManager.selectPaymentMethod(cardElement, method);
    }
}

function processPaymentFlow() {
    if (window.paymentMethodManager) {
        return window.paymentMethodManager.processPaymentFlow();
    }
    return Promise.reject(new Error('Payment method manager not initialized'));
}

function resetPaymentSelection() {
    if (window.paymentMethodManager) {
        window.paymentMethodManager.resetPaymentSelection();
    }
}

function getSelectedPaymentMethod() {
    if (window.paymentMethodManager) {
        return window.paymentMethodManager.getSelectedPaymentMethod();
    }
    return "";
}

// Make functions globally available
window.selectPaymentMethod = selectPaymentMethod;
window.processPaymentFlow = processPaymentFlow;
window.resetPaymentSelection = resetPaymentSelection;
window.getSelectedPaymentMethod = getSelectedPaymentMethod;
