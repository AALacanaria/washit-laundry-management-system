// Booking Confirmation and Receipt Generation
class BookingConfirmation {
    constructor() {
        this.bookingRef = null;
    }

    // Lazy initialization of receipt generators
    get customerReceiptGenerator() {
        if (!this._customerReceiptGenerator) {
            if (!window.customerReceiptGenerator) {
                console.error('Customer receipt generator not found! Make sure customer-receipt.js is loaded.');
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
                console.error('Business receipt generator not found! Make sure business-receipt.js is loaded.');
                return null;
            }
            this._businessReceiptGenerator = window.businessReceiptGenerator;
        }
        return this._businessReceiptGenerator;
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
        
        // Generate and display receipt using customer receipt generator (for modal display)
        const customerGenerator = this.customerReceiptGenerator;
        if (!customerGenerator) {
            console.error('Customer receipt generator not available');
            alert('Error: Receipt system not loaded properly. Please refresh the page.');
            return;
        }

        const receiptHTML = customerGenerator.generateModalReceipt(
            bookingData, serviceOption, firstName, lastName, 
            contactNumber, email, barangay, address, specialInstructions
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
            console.error('Missing selectedDate or selectedTime');
            console.error('bookingData:', bookingData);
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
            console.error('Business receipt generator not available');
            alert('Error: Print receipt system not loaded properly. Please refresh the page.');
            return '<div>Error: Print receipt system not available</div>';
        }

        return businessGenerator.generatePrintReceipt(
            bookingData, serviceOption, firstName, lastName,
            contactNumber, email, barangay, address, specialInstructions
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

// Test function to verify new receipt structure
window.testNewReceiptStructure = function() {
    console.log("🧪 Testing New Receipt Structure...");

    // Check if new receipt generators are available
    if (window.customerReceiptGenerator) {
        console.log("✅ Customer Receipt Generator: Available");
        console.log("   Type:", typeof window.customerReceiptGenerator);
        console.log("   Has generateModalReceipt:", typeof window.customerReceiptGenerator.generateModalReceipt === 'function');
    } else {
        console.log("❌ Customer Receipt Generator: NOT FOUND");
    }

    if (window.businessReceiptGenerator) {
        console.log("✅ Business Receipt Generator: Available");
        console.log("   Type:", typeof window.businessReceiptGenerator);
        console.log("   Has generatePrintReceipt:", typeof window.businessReceiptGenerator.generatePrintReceipt === 'function');
        console.log("   Has generatePrintWindow:", typeof window.businessReceiptGenerator.generatePrintWindow === 'function');
    } else {
        console.log("❌ Business Receipt Generator: NOT FOUND");
    }

    // Check if old generators are still accessible (should be undefined)
    if (window.bookingReceiptGenerator) {
        console.log("⚠️  Old Booking Receipt Generator still exists");
    } else {
        console.log("✅ Old Booking Receipt Generator properly removed");
    }

    if (window.printReceiptGenerator) {
        console.log("⚠️  Old Print Receipt Generator still exists");
    } else {
        console.log("✅ Old Print Receipt Generator properly removed");
    }

    // Test BookingConfirmation lazy loading
    const testBookingConfirmation = new BookingConfirmation();
    if (testBookingConfirmation.customerReceiptGenerator) {
        console.log("✅ BookingConfirmation lazy loading: Customer generator accessible");
    } else {
        console.log("❌ BookingConfirmation lazy loading: Customer generator not accessible");
    }

    if (testBookingConfirmation.businessReceiptGenerator) {
        console.log("✅ BookingConfirmation lazy loading: Business generator accessible");
    } else {
        console.log("❌ BookingConfirmation lazy loading: Business generator not accessible");
    }

    // Test laundry items integration
    if (window.laundryItems) {
        console.log("✅ Laundry Items: Available");
        console.log("   Has getItems:", typeof window.laundryItems.getItems === 'function');
        console.log("   Has hasItems:", typeof window.laundryItems.hasItems === 'function');
    } else {
        console.log("❌ Laundry Items: NOT FOUND");
    }

    // Test CONFIG availability
    if (typeof CONFIG !== 'undefined') {
        console.log("✅ CONFIG: Available");
        console.log("   Has BOOKING_TYPES:", typeof CONFIG.BOOKING_TYPES === 'object');
    } else {
        console.log("❌ CONFIG: NOT FOUND");
    }

    console.log("🎉 Receipt Structure Test Complete!");
};

// Test receipt generation with sample data
window.testReceiptGeneration = function() {
    console.log("🧪 Testing Receipt Generation...");

    const testBookingData = {
        selectedDate: new Date(),
        selectedTime: "09:00",
        bookingType: "normal",
        serviceType: "pickup_delivery"
    };

    const testCustomerData = {
        serviceOption: "pickup_delivery",
        firstName: "John",
        lastName: "Doe",
        contactNumber: "09123456789",
        email: "john@example.com",
        barangay: "Test Barangay",
        address: "123 Test Street",
        specialInstructions: "Test instructions"
    };

    try {
        // Test customer receipt generation
        if (window.customerReceiptGenerator) {
            console.log("📄 Testing Customer Receipt Generation...");
            const customerReceipt = window.customerReceiptGenerator.generateModalReceipt(
                testBookingData,
                testCustomerData.serviceOption,
                testCustomerData.firstName,
                testCustomerData.lastName,
                testCustomerData.contactNumber,
                testCustomerData.email,
                testCustomerData.barangay,
                testCustomerData.address,
                testCustomerData.specialInstructions
            );
            console.log("✅ Customer Receipt Generated Successfully");
            console.log("   Length:", customerReceipt.length, "characters");
        } else {
            console.log("❌ Customer Receipt Generator not available");
        }

        // Test business receipt generation
        if (window.businessReceiptGenerator) {
            console.log("🖨️  Testing Business Receipt Generation...");
            const businessReceipt = window.businessReceiptGenerator.generatePrintReceipt(
                testBookingData,
                testCustomerData.serviceOption,
                testCustomerData.firstName,
                testCustomerData.lastName,
                testCustomerData.contactNumber,
                testCustomerData.email,
                testCustomerData.barangay,
                testCustomerData.address,
                testCustomerData.specialInstructions
            );
            console.log("✅ Business Receipt Generated Successfully");
            console.log("   Length:", businessReceipt.length, "characters");
        } else {
            console.log("❌ Business Receipt Generator not available");
        }

    } catch (error) {
        console.error("❌ Error during receipt generation:", error);
        console.error("   Error stack:", error.stack);
    }

    console.log("🎉 Receipt Generation Test Complete!");
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

    // Generate PRINT-SPECIFIC receipt HTML using the dedicated generator
    const printReceiptHTML = bookingConfirmation.generatePrintReceipt(
        bookingData, serviceOption, firstName, lastName,
        contactNumber, email, barangay, address, specialInstructions
    );

    // Use the business receipt generator to create the print window
    const businessGenerator = bookingConfirmation.businessReceiptGenerator;
    if (!businessGenerator) {
        console.error('Business receipt generator not available for printing');
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
