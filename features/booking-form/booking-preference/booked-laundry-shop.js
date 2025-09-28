// Booked Laundry Shop Integration
// Handles displaying the booked laundry shop throughout the booking flow

const BOOKED_LAUNDRY_SHOP_KEY = 'washit:bookedLaundryShop';
const BOOKED_LAUNDRY_SHOP_TTL_MS = 1000 * 60 * 30; // 30 minutes

function parseCoordinate(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function normalizeShopData(shop) {
    if (!shop || typeof shop !== 'object') {
        return null;
    }

    const logo = (typeof shop.logo === 'string') ? shop.logo.trim() : '';

    return {
        id: shop.id,
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        logo,
        barangay: shop.barangay || shop.barangayName || null,
        lat: parseCoordinate(shop.lat),
        lng: parseCoordinate(shop.lng)
    };
}

function getSiteBasePath() {
    const { pathname } = window.location;
    const segments = pathname.split('/').filter(Boolean);
    const repoIndex = segments.indexOf('washit-laundry-management-system');

    if (repoIndex !== -1) {
        const baseSegments = segments.slice(0, repoIndex + 1);
        return `/${baseSegments.join('/')}/`;
    }

    return '/';
}

function resolveShopLogoUrl(rawLogo) {
    if (!rawLogo || typeof rawLogo !== 'string') {
        return null;
    }

    const trimmed = rawLogo.trim();
    if (!trimmed) {
        return null;
    }

    // Allow data URLs or absolute URLs as-is
    if (/^data:image\//i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    try {
        const cleaned = trimmed.replace(/^\.\/+/, '').replace(/^\/+/, '');
        const basePath = getSiteBasePath();
        const baseUrl = `${window.location.origin}${basePath}`;
        const absoluteUrl = new URL(cleaned || '', baseUrl);
        return absoluteUrl.href;
    } catch (err) {
        const fallbackBase = getSiteBasePath();
        const cleanedPath = trimmed.replace(/^\.\/+/, '').replace(/^\/+/, '');
        return `${fallbackBase}${cleanedPath}`.replace(/\/+/g, '/');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let bookedShop = null;

    if (hasShopParameters(params)) {
        bookedShop = extractShopData(params);
        clearStoredShopRecord();
    } else {
        bookedShop = consumeStoredShopRecord();
    }

    if (bookedShop) {
        displayBookedLaundryShop(bookedShop);
        setupChangeShopHandler();
    } else {
        clearShopSelection();
    }
});

function hasShopParameters(params) {
    return params.has('shopId') && params.has('shopName');
}

function extractShopData(params) {
    return normalizeShopData({
        id: params.get('shopId'),
        name: params.get('shopName'),
        address: params.get('shopAddress') || 'Address not available',
        phone: params.get('shopPhone') || 'Phone not available',
        logo: params.get('shopLogo') || '',
        lat: params.get('shopLat'),
        lng: params.get('shopLng'),
        barangay: params.get('shopBarangay') || null
    });
}

function displayBookedLaundryShop(shop) {
    const normalizedShop = normalizeShopData(shop);
    if (!normalizedShop) {
        clearShopSelection();
        return;
    }

    const indicator = document.getElementById('bookedLaundryShopIndicator');
    const shopLogo = document.getElementById('bookedLaundryShopLogo');
    const shopLogoFallback = document.getElementById('bookedLaundryShopLogoFallback');
    const shopName = document.getElementById('bookedLaundryShopName');
    const shopAddress = document.getElementById('bookedLaundryShopAddress');
    const shopPhone = document.getElementById('bookedLaundryShopPhone');

    if (indicator) {
        if (shopName) shopName.textContent = normalizedShop.name || 'Laundry Shop';
        if (shopAddress) shopAddress.textContent = normalizedShop.address || 'Address not available';
        if (shopPhone) shopPhone.textContent = normalizedShop.phone || 'Contact not available';

        if (shopLogo && shopLogoFallback) {
            const logoUrl = resolveShopLogoUrl(normalizedShop.logo);

            if (logoUrl) {
                shopLogo.src = logoUrl;
                shopLogo.alt = `${normalizedShop.name || 'Laundry Shop'} Logo`;
                shopLogo.style.display = 'block';
                shopLogoFallback.style.display = 'none';
                shopLogo.onerror = function() {
                    this.style.display = 'none';
                    shopLogoFallback.style.display = 'flex';
                    shopLogoFallback.textContent = (normalizedShop.name || '?').charAt(0).toUpperCase();
                };
            } else {
                shopLogo.style.display = 'none';
                shopLogoFallback.style.display = 'flex';
                shopLogoFallback.textContent = (normalizedShop.name || '?').charAt(0).toUpperCase();
            }
        }

        indicator.classList.remove('hidden');
    }

    updateBookedLaundryShopBadge(normalizedShop);
    updatePageTitle(normalizedShop.name);
    window.bookedLaundryShopData = normalizedShop;
    window.selectedShopData = normalizedShop; // Backward compatibility

    window.dispatchEvent(new CustomEvent('washit:bookedLaundryShopUpdated', {
        detail: normalizedShop
    }));
}

function updateBookedLaundryShopBadge(shop) {
    const badge = document.getElementById('bookedLaundryShopBadge');
    const badgeName = document.getElementById('bookedLaundryShopBadgeName');
    const badgeAddress = document.getElementById('bookedLaundryShopBadgeAddress');
    const indicator = document.getElementById('bookedLaundryShopIndicator');

    if (!badge || !badgeName || !badgeAddress) return;

    badgeName.textContent = shop.name || 'Laundry Shop';
    badgeAddress.textContent = shop.address || 'Address not available';

    const indicatorVisible = indicator && !indicator.classList.contains('hidden');
    if (indicatorVisible) {
        badge.classList.remove('visible');
    } else {
        badge.classList.add('visible');
    }
}

function setupChangeShopHandler() {
    const changeShopBtn = document.getElementById('changeBookedLaundryShopBtn');

    if (!changeShopBtn) return;

    changeShopBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to change the selected shop? Your current form progress will be lost.')) {
            clearShopSelection();
            window.location.href = '../../index.html#find-shops';
        }
    });
}

function updatePageTitle(shopName) {
    if (!shopName) return;
    const currentTitle = document.title;
    if (!currentTitle.includes(shopName)) {
        document.title = `${currentTitle} - ${shopName}`;
    }
}

function clearShopSelection() {
    const indicator = document.getElementById('bookedLaundryShopIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }

    const badge = document.getElementById('bookedLaundryShopBadge');
    const badgeName = document.getElementById('bookedLaundryShopBadgeName');
    const badgeAddress = document.getElementById('bookedLaundryShopBadgeAddress');
    if (badge) {
        badge.classList.remove('visible');
    }
    if (badgeName) {
        badgeName.textContent = 'Select a laundry shop to continue';
    }
    if (badgeAddress) {
        badgeAddress.textContent = 'The shop you choose will appear here.';
    }

    clearStoredShopRecord();
    window.bookedLaundryShopData = null;
    window.selectedShopData = null;
    document.title = 'Wash.IT Booking Form';

    window.dispatchEvent(new CustomEvent('washit:bookedLaundryShopUpdated', {
        detail: null
    }));
}

function getStoredShopRecord() {
    try {
        const raw = sessionStorage.getItem(BOOKED_LAUNDRY_SHOP_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.shop) return null;
        if (parsed.savedAt && Date.now() - parsed.savedAt > BOOKED_LAUNDRY_SHOP_TTL_MS) {
            sessionStorage.removeItem(BOOKED_LAUNDRY_SHOP_KEY);
            return null;
        }
        return parsed;
    } catch (err) {
        sessionStorage.removeItem(BOOKED_LAUNDRY_SHOP_KEY);
        return null;
    }
}

function consumeStoredShopRecord() {
    const record = getStoredShopRecord();
    if (!record) return null;
    try {
        sessionStorage.removeItem(BOOKED_LAUNDRY_SHOP_KEY);
    } catch (err) {
        // Swallow storage errors silently
    }
    return record.shop || null;
}

function clearStoredShopRecord() {
    try {
        sessionStorage.removeItem(BOOKED_LAUNDRY_SHOP_KEY);
    } catch (err) {
        // Swallow storage errors silently
    }
}

// Expose utility for other modules if needed
window.BookedLaundryShop = {
    clearShopSelection,
    getBookedLaundryShopData: () => window.bookedLaundryShopData || null,
    displayBookedLaundryShop
};

// Backward compatibility for modules referencing ShopSelection
window.ShopSelection = {
    clearShopSelection,
    getSelectedShopData: () => window.bookedLaundryShopData || null,
    displaySelectedShop: displayBookedLaundryShop
};
