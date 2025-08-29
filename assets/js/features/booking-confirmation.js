// Booking Confirmation and Receipt Generation
class BookingConfirmation {
    constructor() {
        this.bookingRef = null;
        this.receiptGenerator = new ReceiptGenerator();
    }

    // Main confirmation display function
    showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    // showConfirmation called
        
        // Get confirmation modal elements
        const modal = document.getElementById("booking-modal");
        const reviewDetails = document.getElementById("reviewDetails");
        
        if (!modal || !reviewDetails) {
            console.error('Modal elements not found!');
            return;
        }
        
        // Get booking data with fallbacks
        const bookingData = this.getBookingData();
        if (!this.validateBookingData(bookingData)) {
            return;
        }
        
        // Generate and display receipt using dedicated receipt generator
        const receiptHTML = this.receiptGenerator.generateModalReceipt(
            bookingData, serviceOption, firstName, lastName, 
            contactNumber, email, barangay, address, specialInstructions
        );
        
        // Store booking reference from receipt generator
        this.bookingRef = this.receiptGenerator.bookingRef;
        
        reviewDetails.innerHTML = receiptHTML;

        // Force modal to be in the exact center of current viewport
        this.centerModalInViewport(modal);
        
        // Add click outside to close
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        };
    }

    // Force modal to center of current viewport
    centerModalInViewport(modal) {
        // FORCE immediate viewport reset - no smooth scrolling
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Lock the page completely
        const currentScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${currentScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';

        // Force modal to display immediately - no transitions
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.zIndex = '999999';
        modal.classList.remove("hidden");
        modal.classList.add("show");

        // Fix accessibility: Remove aria-hidden when modal is shown
        modal.setAttribute('aria-hidden', 'false');

        // Force immediate focus and viewport centering
        modal.focus();

        // Double-check modal is visible
        setTimeout(() => {
            modal.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
        }, 10);
    }

    // Get booking data with fallbacks
    getBookingData() {
        const actualSelectedDate = selectedDate || window.selectedDate;
        const actualSelectedTime = selectedTime || window.selectedTime;
        const actualBookingType = bookingType || window.bookingType;
        const actualServiceType = selectedServiceType || window.selectedServiceType;
        
        // For pickup and self-claim services, also get self-claim details
        const actualSelfClaimDate = selfClaimDate || window.selfClaimDate;
        const actualSelfClaimTime = selfClaimTime || window.selfClaimTime;
        
        return {
            selectedDate: actualSelectedDate,
            selectedTime: actualSelectedTime,
            bookingType: actualBookingType,
            serviceType: actualServiceType,
            selfClaimDate: actualSelfClaimDate,
            selfClaimTime: actualSelfClaimTime
        };
    }

    // Validate booking data
    validateBookingData(bookingData) {
        if (!bookingData.selectedDate || !bookingData.selectedTime) {
            console.error('Missing selectedDate or selectedTime');
            console.error('bookingData:', bookingData);
            alert('Error: Missing booking date or time. Please complete the form properly.');
            return false;
        }
        return true;
    }

    // Generate booking receipt HTML
    generateReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        // Generate booking reference
        this.bookingRef = this.generateBookingReference();
        
        // Get formatted dates and times
        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        
        // Sanitize all inputs
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });
        
        return this.buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData);
    }

    // Generate unique booking reference
    generateBookingReference() {
        return 'WSH-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 4).toUpperCase();
    }

    // Get formatted timestamps
    getFormattedTimestamps(bookingData) {
        const bookingDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const selectedDateStr = bookingData.selectedDate.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate estimated completion
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const estimatedDays = isRush ? 1.5 : 2.5; // 1.5 days for rush, 2.5 days average for normal (2-3 days)
        const completionDate = new Date(bookingData.selectedDate);
        
        if (isRush) {
            // 1.5 days = 1 day + 12 hours
            completionDate.setDate(completionDate.getDate() + 1);
            completionDate.setHours(completionDate.getHours() + 12);
        } else {
            // 2.5 days average for 2-3 day range
            completionDate.setDate(completionDate.getDate() + 2);
            completionDate.setHours(completionDate.getHours() + 12);
        }
        
        const completionDateStr = completionDate.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return {
            bookingDate,
            selectedDateStr,
            completionDateStr
        };
    }

    // Get selected time string with fallbacks
    getSelectedTimeString(bookingData) {
        let selectedTimeStr = 'Unknown Time';
        try {
            const timeSlots = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH ? RUSH_TIME_SLOTS : TIME_SLOTS;
            if (timeSlots && timeSlots[bookingData.selectedTime]) {
                selectedTimeStr = timeSlots[bookingData.selectedTime].label;
            } else {
                console.warn('Time slot not found:', bookingData.selectedTime, 'in', timeSlots);
                // Try ALL_TIME_SLOTS as fallback
                const allTimeSlots = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH ? ALL_RUSH_TIME_SLOTS : ALL_TIME_SLOTS;
                if (allTimeSlots && allTimeSlots[bookingData.selectedTime]) {
                    selectedTimeStr = allTimeSlots[bookingData.selectedTime].label;
                } else {
                    selectedTimeStr = bookingData.selectedTime || 'Unknown Time';
                }
            }
        } catch (error) {
            console.error('Error getting time slot label:', error);
            selectedTimeStr = bookingData.selectedTime || 'Unknown Time';
        }
        return selectedTimeStr;
    }

    // Sanitize all input data
    sanitizeInputs(data) {
        const sanitize = (str) => {
            const div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        };

        return {
            fullName: sanitize(`${data.firstName} ${data.lastName}`.trim()),
            contactNumber: sanitize(data.contactNumber),
            email: sanitize(data.email),
            barangay: sanitize(data.barangay),
            address: sanitize(data.address),
            specialInstructions: sanitize(data.specialInstructions),
            serviceOption: sanitize(this.formatService(data.serviceOption))
        };
    }

    getPaymentMethod() {
        // Try multiple sources for payment method
        if (window.selectedPaymentMethod) {
            return window.selectedPaymentMethod;
        }
        
        const paymentInput = document.getElementById('paymentMethod');
        if (paymentInput && paymentInput.value) {
            return paymentInput.value;
        }
        
        const selectedCard = document.querySelector('.payment-card.selected');
        if (selectedCard) {
            return selectedCard.getAttribute('data-value');
        }
        
        return 'Not selected';
    }

    formatPaymentMethod(method) {
        const paymentMap = {
            'cash': '💵 Cash on Delivery - Pay when we deliver your items',
            'cashless': '📱 Cashless Payment - Digital payment required before confirmation'
        };
        
        return paymentMap[method] || method;
    }

    // Build complete receipt HTML (for modal display - with emojis but clean alignment)
    buildReceiptHTML(bookingData, timestamps, selectedTimeStr, sanitizedData) {
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const isPickupAndSelfClaim = bookingData.serviceType === 'pickup_selfclaim';
        
        // Format self-claim details if applicable
        let selfClaimSchedule = '';
        if (isPickupAndSelfClaim && bookingData.selfClaimDate && bookingData.selfClaimTime) {
            const selfClaimDateStr = bookingData.selfClaimDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            selfClaimSchedule = `
                <div class="receipt-line">
                    <span class="label">🏪 Self-Claim Date:</span>
                    <span class="value">${selfClaimDateStr}</span>
                </div>
                <div class="receipt-line">
                    <span class="label">🕐 Self-Claim Time:</span>
                    <span class="value">${bookingData.selfClaimTime}</span>
                </div>
            `;
        }
        
        return `
            <div class="booking-receipt">
                <div class="receipt-header">
                    <h4>🧺 Wash.IT Laundry Service</h4>
                    <p class="booking-ref">Booking Reference: <strong>${this.bookingRef}</strong></p>
                    <p class="booking-timestamp">Booked on: ${timestamps.bookingDate}</p>
                </div>
                
                <div class="receipt-section">
                    <h5>📋 Service Details</h5>
                    <div class="receipt-line">
                        <span class="label">Booking Type:</span>
                        <span class="value">${isRush ? "🚀 Rush Booking (1.5 days delivery)" : "⏰ Normal Booking (2-3 days delivery)"}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Service Option:</span>
                        <span class="value">${sanitizedData.serviceOption}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">📅 Pickup Date:</span>
                        <span class="value">${timestamps.selectedDateStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">🕐 Pickup Time:</span>
                        <span class="value">${selectedTimeStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">💳 Payment Method:</span>
                        <span class="value">${this.formatPaymentMethod(this.getPaymentMethod())}</span>
                    </div>
                    ${selfClaimSchedule}
                    ${!isPickupAndSelfClaim ? `
                    <div class="receipt-line">
                        <span class="label">Estimated Completion:</span>
                        <span class="value">${timestamps.completionDateStr}</span>
                    </div>` : ''}
                </div>
                
                <div class="receipt-section">
                    <h5>👤 Customer Information</h5>
                    <div class="receipt-line">
                        <span class="label">Full Name:</span>
                        <span class="value">${sanitizedData.fullName}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Contact Number:</span>
                        <span class="value">${sanitizedData.contactNumber}</span>
                    </div>
                    ${sanitizedData.email ? `
                    <div class="receipt-line">
                        <span class="label">Email:</span>
                        <span class="value">${sanitizedData.email}</span>
                    </div>` : ''}
                    ${sanitizedData.barangay ? `
                    <div class="receipt-line">
                        <span class="label">Barangay:</span>
                        <span class="value">${sanitizedData.barangay}</span>
                    </div>` : ''}
                    ${sanitizedData.address ? `
                    <div class="receipt-line">
                        <span class="label">Address Details:</span>
                        <span class="value">${sanitizedData.address}</span>
                    </div>` : ''}
                    ${sanitizedData.specialInstructions ? `
                    <div class="receipt-line">
                        <span class="label">Special Instructions:</span>
                        <span class="value">${sanitizedData.specialInstructions}</span>
                    </div>` : ''}
                </div>
                
                <div class="receipt-section receipt-footer">
                    <h5>📞 What's Next?</h5>
                    <div class="footer-content">
                        <div class="receipt-line">
                            <span class="label">• Confirmation Call:</span>
                            <span class="value">Within 24 hours to ${sanitizedData.contactNumber}</span>
                        </div>
                        <div class="receipt-line">
                            <span class="label">• Keep Reference:</span>
                            <span class="value">${this.bookingRef}</span>
                        </div>
                        ${isPickupAndSelfClaim ? 
                            `<div class="receipt-line">
                                <span class="label">• Team Arrival:</span>
                                <span class="value">Pickup on ${timestamps.selectedDateStr}</span>
                            </div>
                            <div class="receipt-line">
                                <span class="label">• Item Collection:</span>
                                <span class="value">At shop on ${bookingData.selfClaimDate ? bookingData.selfClaimDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'your selected date'}</span>
                            </div>
                            <div class="receipt-line">
                                <span class="label">• Payment Due:</span>
                                <span class="value">Upon item collection at shop</span>
                            </div>` :
                            `<div class="receipt-line">
                                <span class="label">• Team Arrival:</span>
                                <span class="value">${sanitizedData.serviceOption.includes('pickup') ? 'Pickup' : 'Drop-off'} at scheduled time</span>
                            </div>
                            <div class="receipt-line">
                                <span class="label">• Payment Due:</span>
                                <span class="value">Upon ${sanitizedData.serviceOption.includes('delivery') ? 'delivery' : 'pickup'}</span>
                            </div>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // Generate PRINT-SPECIFIC receipt HTML (clean format, no emojis)
    generatePrintReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        // Generate booking reference
        this.bookingRef = this.generateBookingReference();
        
        // Get formatted dates and times
        const timestamps = this.getFormattedTimestamps(bookingData);
        const selectedTimeStr = this.getSelectedTimeString(bookingData);
        
        // Sanitize all inputs
        const sanitizedData = this.sanitizeInputs({
            firstName, lastName, contactNumber, email, barangay, address, specialInstructions, serviceOption
        });
        
        const isRush = bookingData.bookingType === CONFIG.BOOKING_TYPES.RUSH;
        const isPickupAndSelfClaim = bookingData.serviceType === 'pickup_selfclaim';
        
        // Format self-claim details if applicable
        let selfClaimSchedule = '';
        if (isPickupAndSelfClaim && bookingData.selfClaimDate && bookingData.selfClaimTime) {
            const selfClaimDateStr = bookingData.selfClaimDate.toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            selfClaimSchedule = `
                <div class="receipt-line">
                    <span class="label">Self-Claim Date:</span>
                    <span class="value">${selfClaimDateStr}</span>
                </div>
                <div class="receipt-line">
                    <span class="label">Self-Claim Time:</span>
                    <span class="value">${bookingData.selfClaimTime}</span>
                </div>
            `;
        }
        
        return `
            <div class="booking-receipt">
                <div class="receipt-header">
                    <div class="logo-section">
                        <h2>WASH.IT</h2>
                        <h3>LAUNDRY SERVICE</h3>
                    </div>
                    <div class="receipt-info">
                        <p>BOOKING CONFIRMATION</p>
                        <p>Reference: ${this.bookingRef}</p>
                        <p>Date: ${timestamps.bookingDate}</p>
                    </div>
                </div>
                
                <div class="receipt-section">
                    <h4 class="section-title">SERVICE DETAILS</h4>
                    <div class="receipt-line">
                        <span class="label">Booking Type:</span>
                        <span class="value">${isRush ? "Rush Service (1.5 days)" : "Standard Service (2-3 days)"}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Service Option:</span>
                        <span class="value">${sanitizedData.serviceOption}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Pickup Date:</span>
                        <span class="value">${timestamps.selectedDateStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Pickup Time:</span>
                        <span class="value">${selectedTimeStr}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Payment Method:</span>
                        <span class="value">${this.formatPaymentMethod(this.getPaymentMethod())}</span>
                    </div>
                    ${selfClaimSchedule}
                    ${!isPickupAndSelfClaim ? `
                    <div class="receipt-line">
                        <span class="label">Est. Completion:</span>
                        <span class="value">${timestamps.completionDateStr}</span>
                    </div>` : ''}
                </div>
                
                <div class="receipt-section">
                    <h4 class="section-title">CUSTOMER INFORMATION</h4>
                    <div class="receipt-line">
                        <span class="label">Full Name:</span>
                        <span class="value">${sanitizedData.fullName}</span>
                    </div>
                    <div class="receipt-line">
                        <span class="label">Contact Number:</span>
                        <span class="value">${sanitizedData.contactNumber}</span>
                    </div>
                    ${sanitizedData.email ? `
                    <div class="receipt-line">
                        <span class="label">Email:</span>
                        <span class="value">${sanitizedData.email}</span>
                    </div>` : ''}
                    ${sanitizedData.barangay ? `
                    <div class="receipt-line">
                        <span class="label">Barangay:</span>
                        <span class="value">${sanitizedData.barangay}</span>
                    </div>` : ''}
                    ${sanitizedData.address ? `
                    <div class="receipt-line">
                        <span class="label">Address Details:</span>
                        <span class="value">${sanitizedData.address}</span>
                    </div>` : ''}
                    ${sanitizedData.specialInstructions ? `
                    <div class="receipt-line">
                        <span class="label">Special Instructions:</span>
                        <span class="value">${sanitizedData.specialInstructions}</span>
                    </div>` : ''}
                </div>
                
                <div class="receipt-section receipt-footer">
                    <h4 class="section-title">IMPORTANT INFORMATION</h4>
                    <div class="footer-content">
                        <p>• Confirmation call within 24 hours to ${sanitizedData.contactNumber}</p>
                        <p>• Please keep this booking reference: ${this.bookingRef}</p>
                        ${isPickupAndSelfClaim ? 
                            `<p>• Pickup service at scheduled time on ${timestamps.selectedDateStr}</p>
                             <p>• Item collection at shop on ${bookingData.selfClaimDate ? bookingData.selfClaimDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'selected date'}</p>
                             <p>• Payment due upon item collection</p>` :
                            `<p>• ${sanitizedData.serviceOption.includes('pickup') ? 'Pickup' : 'Drop-off'} service at scheduled time</p>
                             <p>• Payment due upon ${sanitizedData.serviceOption.includes('delivery') ? 'delivery' : 'pickup'}</p>`
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // Format service option display text
    formatService(service) {
        switch (service) {
            case "pickup_delivery": return "Pickup and Delivery - We pick up and deliver your items";
            case "pickup_selfclaim": return "Pickup and Self-Claim - We pick up, you collect at shop";
            case "dropoff_delivery": return "Drop-off and Delivery - You drop off, we deliver";
            default: return service || "";
        }
    }

    // Get current booking reference
    getBookingReference() {
        return this.bookingRef;
    }
}

// Create global instance
const bookingConfirmation = new BookingConfirmation();

// Global functions for backward compatibility
function showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
    bookingConfirmation.showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions);
}

function formatService(service) {
    return bookingConfirmation.formatService(service);
}

// Test function for confirmation
    window.testConfirmation = function() {
    // Set test data in both local and window variables
    selectedDate = new Date();
    selectedTime = "09:00";
    bookingType = "normal";
    
    window.selectedDate = selectedDate;
    window.selectedTime = selectedTime;
    window.bookingType = bookingType;
    
    // test confirmation invoked
    
    showConfirmation(
        "pickup_delivery",
        "John",
        "Doe", 
        "09123456789",
        "john@gmail.com",
        "Test Barangay",
        "123 Test Street",
        "Test instructions"
    );
};

// Modal Control Functions
function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    if (modal) {
        // Get the stored scroll position
        const scrollTop = parseInt(document.body.style.top || '0') * -1;
        
        // Hide modal immediately
        modal.classList.remove("show");
        modal.classList.add("hidden");
        modal.style.display = 'none';
        
        // Fix accessibility: Set aria-hidden when modal is hidden
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll and position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollTop);
    }
}

function printReceipt() {
    // Get the receipt data directly
    const bookingData = bookingConfirmation.getBookingData();
    if (!bookingData || !bookingData.selectedDate || !bookingData.selectedTime) {
        alert('Error: No booking data available for printing');
        return;
    }

    // Get form data
    const firstName = document.getElementById('firstName')?.value || 'N/A';
    const lastName = document.getElementById('lastName')?.value || 'N/A';
    const contactNumber = document.getElementById('contactNumber')?.value || 'N/A';
    const email = document.getElementById('email')?.value || '';
    const barangay = document.getElementById('barangay')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const specialInstructions = document.getElementById('specialInstructions')?.value || '';
    const serviceOption = document.getElementById('serviceOption')?.value || 'N/A';

    // Generate PRINT-SPECIFIC receipt HTML (clean format)
    const printReceiptHTML = bookingConfirmation.generatePrintReceipt(
        bookingData, serviceOption, firstName, lastName, 
        contactNumber, email, barangay, address, specialInstructions
    );

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Wash.IT Receipt</title>
            <style>
                @page {
                    size: A4;
                    margin: 0.5in;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 15px;
                    background: white;
                    color: black;
                }
                
                .booking-receipt {
                    max-width: 480px;
                    margin: 0 auto;
                    border: 2px solid #000;
                    background: white;
                    padding: 0;
                }
                
                .receipt-header {
                    text-align: center;
                    padding: 15px;
                    border-bottom: 2px solid #000;
                    background: #f8f8f8;
                }
                
                .logo-section h2 {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 0;
                    letter-spacing: 2px;
                }
                
                .logo-section h3 {
                    font-size: 12px;
                    font-weight: normal;
                    margin: 2px 0 10px 0;
                    letter-spacing: 1px;
                }
                
                .receipt-info {
                    font-size: 10px;
                    margin-top: 10px;
                }
                
                .receipt-info p {
                    margin: 2px 0;
                }
                
                .receipt-section {
                    padding: 12px 15px;
                    border-bottom: 1px solid #ccc;
                }
                
                .receipt-section:last-child {
                    border-bottom: none;
                }
                
                .section-title {
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    margin: 0 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #ddd;
                    text-decoration: underline;
                }
                
                .receipt-line {
                    display: flex;
                    margin: 3px 0;
                    min-height: 16px;
                }
                
                .receipt-line .label {
                    width: 140px;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .receipt-line .value {
                    flex: 1;
                    padding-left: 10px;
                    border-bottom: 1px dotted #ccc;
                }
                
                .receipt-footer {
                    background: #f5f5f5;
                }
                
                .footer-content {
                    text-align: left;
                }
                
                .footer-content p {
                    margin: 4px 0;
                    font-size: 10px;
                    line-height: 1.3;
                }
                
                strong {
                    font-weight: bold;
                }
                
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            ${printReceiptHTML}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
}

function startNewBooking() {
    // Close modal
    closeBookingModal();
    
    // Reset form and reload page
    setTimeout(() => {
        window.location.reload();
    }, 300);
}

// Global functions for modal
window.closeBookingModal = closeBookingModal;
window.printReceipt = printReceipt;
window.startNewBooking = startNewBooking;
