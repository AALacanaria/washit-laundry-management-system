// Shop Booking Integration for Homepage
// Handles selected (booked) laundry shop persistence and navigation

const BOOKED_LAUNDRY_SHOP_KEY = 'washit:bookedLaundryShop';
let currentBookedLaundryShop = null;

function sanitizeLogoPath(logo) {
    if (!logo || typeof logo !== 'string') {
        return '';
    }

    const trimmed = logo.trim();
    if (!trimmed) {
        return '';
    }

    if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
        return trimmed;
    }

    // Strip leading ./ or / to make it project-root relative
    const cleaned = trimmed.replace(/^\.\/+/, '').replace(/^\/+/, '');
    if (!cleaned) {
        return '';
    }

    try {
        return new URL(cleaned, `${window.location.origin}/`).href;
    } catch (err) {
        return cleaned;
    }
}

function normalizeShopForBooking(shopData) {
    if (!shopData || typeof shopData !== 'object') {
        return null;
    }

    return {
        ...shopData,
        logo: sanitizeLogoPath(shopData.logo)
    };
}

// Initialize shop booking integration
document.addEventListener('DOMContentLoaded', function() {
    initializeShopBookingIntegration();
});

function initializeShopBookingIntegration() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', bookWithShop);
        bookNowBtn.dataset.handlerAttached = 'true';
    }
}

function ensureBookNowHandler() {
    const bookNowBtn = document.getElementById('bookNowBtn');
    if (bookNowBtn) {
        if (!bookNowBtn.dataset.handlerAttached) {
            bookNowBtn.addEventListener('click', bookWithShop);
            bookNowBtn.dataset.handlerAttached = 'true';
        }
    }
}

// Function to handle booking with selected shop
function bookWithShop(event) {
    if (event) {
        event.preventDefault();
    }

    if (!currentBookedLaundryShop) {
        // Fallback to regular booking form
        window.location.href = 'features/booking-form/booking-form.html';
        return;
    }

    persistSelectedShop(currentBookedLaundryShop);

    // Create URL parameters with shop information
    const params = new URLSearchParams({
        shopId: currentBookedLaundryShop.id,
        shopName: currentBookedLaundryShop.name,
        shopAddress: currentBookedLaundryShop.address,
        shopPhone: currentBookedLaundryShop.phone,
        shopLogo: currentBookedLaundryShop.logo || '',
        shopLat: currentBookedLaundryShop.lat ?? '',
        shopLng: currentBookedLaundryShop.lng ?? '',
        shopBarangay: currentBookedLaundryShop.barangay || ''
    });

    // Navigate to booking form with shop parameters
    window.location.href = `features/booking-form/booking-form.html?${params.toString()}`;
}

// Store selected shop data when modal opens
function setCurrentShop(shopData) {
    const normalizedShop = normalizeShopForBooking(shopData);
    currentBookedLaundryShop = normalizedShop;
    window.currentBookedLaundryShop = normalizedShop;
    window.currentSelectedShop = normalizedShop; // Backward compatibility
    if (normalizedShop) {
        persistSelectedShop(normalizedShop);
    }
    ensureBookNowHandler();
}

function persistSelectedShop(shopData) {
    if (!shopData) return;
    try {
        sessionStorage.setItem(
            BOOKED_LAUNDRY_SHOP_KEY,
            JSON.stringify({ shop: shopData, savedAt: Date.now() })
        );
    } catch (err) {
        // Swallow storage errors silently
    }
}

// Export functions to global scope for backward compatibility
window.bookWithShop = bookWithShop;
window.setCurrentShop = setCurrentShop;