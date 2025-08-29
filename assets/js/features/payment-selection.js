// Payment Method Selection Logic
let selectedPaymentMethod = "";
let paymentFlow = {
    method: "",
    timing: "",
    status: "pending"
};

function selectPaymentMethod(cardElement, method) {
    // Remove previous selections
    const allCards = document.querySelectorAll('.payment-card');
    allCards.forEach(card => {
        card.classList.remove('selected');
    });

    // Add selected class to clicked card
    cardElement.classList.add('selected');

    // Update payment flow information
    updatePaymentFlow(method);

    // Update global variable and hidden input
    selectedPaymentMethod = method;
    const hiddenInput = document.getElementById('paymentMethod');
    if (hiddenInput) {
        hiddenInput.value = method;
    }

    // Update global window variable for compatibility
    window.selectedPaymentMethod = method;

    // Show payment flow information
    showPaymentFlowInfo(method);

    // Trigger validation
    if (typeof validatePaymentMethodVisual === 'function') {
        validatePaymentMethodVisual();
    }
}

function updatePaymentFlow(method) {
    paymentFlow.method = method;
    
    if (method === 'cash') {
        paymentFlow.timing = 'on_delivery';
        paymentFlow.description = 'Payment will be collected when you receive your laundry';
        paymentFlow.bookingStatus = 'confirmed';
        paymentFlow.paymentStatus = 'pending_cod';
    } else if (method === 'cashless') {
        paymentFlow.timing = 'upfront';
        paymentFlow.description = 'Payment required before booking confirmation';
        paymentFlow.bookingStatus = 'pending_payment';
        paymentFlow.paymentStatus = 'pending_verification';
    }
    
    paymentFlow.status = 'selected';
}

function showPaymentFlowInfo(method) {
    // Remove any existing flow info
    const existingInfo = document.querySelector('.payment-flow-info');
    if (existingInfo) {
        existingInfo.remove();
    }

    // Create payment flow information display
    const flowInfo = document.createElement('div');
    flowInfo.className = 'payment-flow-info';
    
    let content = '';
    if (method === 'cash') {
        content = `
            <div class="flow-status cod">
                <span class="status-badge booking-confirmed">Booking: Will be Confirmed</span>
                <span class="status-badge payment-pending">Payment: COD (Pay Later)</span>
                <p class="flow-description">✅ Your booking will be confirmed immediately. Pay when your laundry is ready!</p>
            </div>
        `;
    } else if (method === 'cashless') {
        content = `
            <div class="flow-status cashless">
                <span class="status-badge booking-pending">Booking: Pending Payment</span>
                <span class="status-badge payment-required">Payment: Required Now</span>
                <p class="flow-description">💳 Complete payment to confirm your booking. No payment needed on delivery!</p>
            </div>
        `;
    }
    
    flowInfo.innerHTML = content;
    
    // Insert after payment options
    const paymentSection = document.querySelector('.payment-options');
    paymentSection.parentNode.insertBefore(flowInfo, paymentSection.nextSibling);

    // Smooth scroll and highlight
    setTimeout(() => {
        flowInfo.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        flowInfo.classList.add('highlight');
        setTimeout(() => flowInfo.classList.remove('highlight'), 2000);
    }, 100);
}

// Mock payment gateway simulation for cashless payments
function simulatePaymentGateway() {
    if (selectedPaymentMethod !== 'cashless') {
        return Promise.resolve({ success: true, message: 'COD selected - no upfront payment needed' });
    }

    return new Promise((resolve) => {
        // Show payment gateway modal (mock)
        showPaymentGatewayModal();

        // Simulate payment processing after 3 seconds
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate for demo
            hidePaymentGatewayModal();
            
            if (success) {
                updatePaymentStatus('paid');
                resolve({ success: true, message: 'Payment successful!' });
            } else {
                updatePaymentStatus('failed');
                resolve({ success: false, message: 'Payment failed. Please try again.' });
            }
        }, 3000);
    });
}

function showPaymentGatewayModal() {
    // Create mock payment gateway modal
    const modal = document.createElement('div');
    modal.id = 'payment-gateway-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>💳 Complete Your Payment</h3>
                <div class="payment-simulator">
                    <p>Processing your cashless payment...</p>
                    <div class="payment-options-sim">
                        <div class="payment-method-sim">
                            <span>🔒</span>
                            <span>GCash • Maya • Online Banking</span>
                        </div>
                    </div>
                    <div class="loading-spinner"></div>
                    <p class="payment-note">This is a simulation - your booking will be confirmed automatically</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 100);
}

function hidePaymentGatewayModal() {
    const modal = document.getElementById('payment-gateway-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function updatePaymentStatus(status) {
    paymentFlow.paymentStatus = status;
    
    if (status === 'paid') {
        paymentFlow.bookingStatus = 'confirmed';
    } else if (status === 'failed') {
        paymentFlow.bookingStatus = 'pending_payment';
    }
}

// Enhanced form submission with payment flow integration
async function processPaymentFlow() {
    if (!selectedPaymentMethod) {
        throw new Error('Please select a payment method');
    }

    try {
        if (selectedPaymentMethod === 'cash') {
            // COD - immediate confirmation
            updatePaymentStatus('pending_cod');
            return {
                success: true,
                method: 'cash',
                bookingStatus: 'confirmed',
                paymentStatus: 'pending_cod',
                message: 'Booking confirmed! Payment will be collected on delivery/pickup.'
            };
        } else if (selectedPaymentMethod === 'cashless') {
            // Cashless - simulate payment gateway
            const paymentResult = await simulatePaymentGateway();
            
            if (paymentResult.success) {
                updatePaymentStatus('paid');
                return {
                    success: true,
                    method: 'cashless',
                    bookingStatus: 'confirmed',
                    paymentStatus: 'paid',
                    message: 'Payment successful! Your booking is confirmed.'
                };
            } else {
                updatePaymentStatus('failed');
                return {
                    success: false,
                    method: 'cashless',
                    bookingStatus: 'pending_payment',
                    paymentStatus: 'failed',
                    message: 'Payment failed. Please try again or select Cash on Delivery.'
                };
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Make function globally available for form submission
window.processPaymentFlow = processPaymentFlow;

// Reset payment selection
function resetPaymentSelection() {
    selectedPaymentMethod = "";
    window.selectedPaymentMethod = "";
    
    const allCards = document.querySelectorAll('.payment-card');
    allCards.forEach(card => {
        card.classList.remove('selected', 'input-valid', 'input-invalid');
    });

    const hiddenInput = document.getElementById('paymentMethod');
    if (hiddenInput) {
        hiddenInput.value = "";
    }
}

// Get current payment method
function getSelectedPaymentMethod() {
    return selectedPaymentMethod || window.selectedPaymentMethod || "";
}

// Auto-scroll to next section after payment selection
function autoScrollToNextSectionAfterPayment() {
    setTimeout(() => {
        const confirmSection = document.querySelector('[data-section="confirmSection"]');
        if (confirmSection) {
            confirmSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 300);
}
