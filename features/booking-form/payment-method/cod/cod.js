// Cash on Delivery (COD) Payment Handler
class CODPayment {
    constructor() {
        this.paymentMethod = 'cash';
        this.flowData = {
            timing: 'on_delivery',
            description: 'Payment will be collected when you receive your laundry',
            bookingStatus: 'confirmed',
            paymentStatus: 'pending_cod'
        };
        this.init();
    }

    init() {
        // Initialize COD-specific functionality
    }

    handleSelection(cardElement) {
        // COD-specific selection handling - minimal implementation
        // No additional UI elements, just core logic
    }

    updateFlow(paymentFlow) {
        // Update the shared payment flow with COD-specific data
        Object.assign(paymentFlow, this.flowData);
    }

    getFlowInfo() {
        return `
            <div class="flow-status cod">
                <span class="status-badge booking-confirmed">Booking: Will be Confirmed</span>
                <span class="status-badge payment-pending">Payment: COD (Pay Later)</span>
                <p class="flow-description">✅ Your booking will be confirmed immediately. Pay when your laundry is ready!</p>
            </div>
        `;
    }

    async processPayment() {
        // COD processing - immediate confirmation
        try {
            return {
                success: true,
                method: 'cash',
                bookingStatus: 'confirmed',
                paymentStatus: 'pending_cod',
                message: 'Booking confirmed! Payment will be collected on delivery/pickup.'
            };
        } catch (error) {
            return {
                success: false,
                method: 'cash',
                message: 'Booking confirmation failed. Please try again.'
            };
        }
    }

    reset() {
        // Reset COD-specific state
        // Minimal reset functionality
    }
}

// Initialize COD payment handler
let codPayment;
document.addEventListener('DOMContentLoaded', () => {
    codPayment = new CODPayment();
    window.codPayment = codPayment;
});
