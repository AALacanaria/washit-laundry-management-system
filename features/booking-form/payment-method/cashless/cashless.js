// Cashless Payment Handler
class CashlessPayment {
    constructor() {
        this.paymentMethod = 'cashless';
        this.flowData = {
            timing: 'upfront',
            description: 'Payment required before booking confirmation',
            bookingStatus: 'pending_payment',
            paymentStatus: 'pending_verification'
        };
        this.init();
    }

    init() {
        // Initialize cashless payment functionality
    }

    handleSelection(cardElement) {
        // Cashless-specific selection handling - minimal implementation
        // No additional UI elements, just core logic
    }

    updateFlow(paymentFlow) {
        // Update the shared payment flow with cashless-specific data
        Object.assign(paymentFlow, this.flowData);
    }

    getFlowInfo() {
        return `
            <div class="flow-status cashless">
                <span class="status-badge booking-pending">Booking: Pending Payment</span>
                <span class="status-badge payment-required">Payment: Required Now</span>
                <p class="flow-description">💳 Complete payment to confirm your booking. No payment needed on delivery!</p>
            </div>
        `;
    }

    async processPayment() {
        // Cashless payment processing
        try {
            const paymentResult = await this.simulatePaymentGateway();
            
            if (paymentResult.success) {
                return {
                    success: true,
                    method: 'cashless',
                    bookingStatus: 'confirmed',
                    paymentStatus: 'paid',
                    message: 'Payment successful! Your booking is confirmed.'
                };
            } else {
                return {
                    success: false,
                    method: 'cashless',
                    bookingStatus: 'pending_payment',
                    paymentStatus: 'failed',
                    message: 'Payment failed. Please try again or select Cash on Delivery.'
                };
            }
        } catch (error) {
            return {
                success: false,
                method: 'cashless',
                message: error.message
            };
        }
    }

    async simulatePaymentGateway() {
        // Simulate payment processing
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% success rate for demo
                resolve({ success });
            }, 2000);
        });
    }

    reset() {
        // Reset cashless-specific state
        // Minimal reset functionality
    }
}

// Initialize cashless payment handler
let cashlessPayment;
document.addEventListener('DOMContentLoaded', () => {
    cashlessPayment = new CashlessPayment();
    window.cashlessPayment = cashlessPayment;
});
