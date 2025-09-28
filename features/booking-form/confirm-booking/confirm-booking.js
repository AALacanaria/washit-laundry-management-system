// Booking Confirmation and Receipt Generation
class BookingConfirmation {
    constructor() {
        this.bookingRef = null;
    }

    // Lazy initialization of receipt generators
    get customerReceiptGenerator() {
        if (!this._customerReceiptGenerator) {
            if (!window.customerReceiptGenerator) {
                return null;
            }
            this._customerReceiptGenerator = window.customerReceiptGenerator;
        }
        return this._customerReceiptGenerator;
    }

    // Lazy initialization of business receipt generator
    get businessReceiptGenerator() {
        if (!this._businessReceiptGenerator) {
            if (!window.businessReceiptGenerator) {
                return null;
            }
            this._businessReceiptGenerator = window.businessReceiptGenerator;
        }
        return this._businessReceiptGenerator;
    }

    // Main confirmation display function
    showConfirmation(serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        // Get confirmation modal elements
        const modal = document.getElementById("booking-modal");
        const reviewDetails = document.getElementById("reviewDetails");
        
        if (!modal || !reviewDetails) {
            return;
        }
        
        // Get booking data with fallbacks
        const bookingData = this.getBookingData();
        if (!this.validateBookingData(bookingData)) {
            return;
        }
        
        // Generate and display receipt using customer receipt generator (for modal display)
        const customerGenerator = this.customerReceiptGenerator;
        if (!customerGenerator) {
            alert('Error: Receipt system not loaded properly. Please refresh the page.');
            return;
        }

        // Get selected shop data
        const selectedShop = window.bookedLaundryShopData || window.selectedShopData || null;
        
        const receiptHTML = customerGenerator.generateModalReceipt(
            bookingData, serviceOption, firstName, lastName, 
            contactNumber, email, barangay, address, specialInstructions, selectedShop
        );
        
        // Store booking reference from customer receipt generator
        this.bookingRef = customerGenerator.bookingRef;
        
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
            alert('Error: Missing booking date or time. Please complete the form properly.');
            return false;
        }
        return true;
    }

    // Generate PRINT-SPECIFIC receipt HTML (clean format, no emojis)
    generatePrintReceipt(bookingData, serviceOption, firstName, lastName, contactNumber, email, barangay, address, specialInstructions) {
        // Use the business receipt generator for printing (includes pricing)
        const businessGenerator = this.businessReceiptGenerator;
        if (!businessGenerator) {
            alert('Error: Print receipt system not loaded properly. Please refresh the page.');
            return '<div>Error: Print receipt system not available</div>';
        }

        // Get selected shop data
        const selectedShop = window.bookedLaundryShopData || window.selectedShopData || null;
        
        return businessGenerator.generatePrintReceipt(
            bookingData, serviceOption, firstName, lastName,
            contactNumber, email, barangay, address, specialInstructions, selectedShop
        );
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

    // Generate PRINT-SPECIFIC receipt HTML using the dedicated generator
    const printReceiptHTML = bookingConfirmation.generatePrintReceipt(
        bookingData, serviceOption, firstName, lastName,
        contactNumber, email, barangay, address, specialInstructions
    );

    // Use the business receipt generator to create the print window
    const businessGenerator = bookingConfirmation.businessReceiptGenerator;
    if (!businessGenerator) {
        alert('Error: Print system not loaded properly. Please refresh the page.');
        return;
    }

    businessGenerator.generatePrintWindow(printReceiptHTML);
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
