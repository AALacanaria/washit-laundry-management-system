function getMapShopData() {
    return [
        {
            id: 1,
            name: "Kylie Rose Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
            logo: "./features/homepage/find-laundry-shops/assets/images/kylierose-laundryhub-logo.png",
            lat: 16.425454290609377,
            lng: 120.5989512577405,
            barangay: "Trancoville",
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 917 234 5678",
            hours: "Open 6 AM – 5 PM",
            rating: "4.9",
            services: [
                "Pickup and Delivery",
                "Drop-off and Delivery",
                "Pickup and Self-Claim",
                "Wash, Dry, & Fold",
                "Bulk Orders"
            ],
            fullHours: [
                { day: "Monday - Saturday", hours: "6:00 AM - 5:00 PM" },
                { day: "Sunday", hours: "6:00 AM - 1:00 PM" }
            ],
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 2,
            name: "M. De Guzman Laundry Shop",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
            logo: "./features/homepage/find-laundry-shops/assets/images/mdeguzman-laundryshop-logo.png",
            lat: 16.425359279483803,
            lng: 120.6010600327948,
            barangay: "Trancoville",
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 928 765 4321",
            hours: "Open 6 AM – 5 PM",
            rating: "4.8",
            services: [
                "Pickup and Delivery",
                "Drop-off and Delivery",
                "Pickup and Self-Claim",
                "Wash, Dry, & Fold",
                "Bulk Orders"
            ],
            fullHours: [
                { day: "Monday - Saturday", hours: "6:00 AM - 5:00 PM" },
                { day: "Sunday", hours: "6:00 AM - 1:00 PM" }
            ],
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 3,
            name: "Sam, Paull, Adrianne Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
            logo: "./features/homepage/find-laundry-shops/assets/images/sampauladrianne-laundryhub-logo.png",
            lat: 16.42327170651393,
            lng: 120.59909688655648,
            barangay: "Trancoville",
            address: "Trancoville, Baguio City, Benguet 2600", 
            phone: "+63 936 123 9876",
            hours: "Open 6 AM – 5 PM",
            rating: "4.7",
            services: [
                "Pickup and Delivery",
                "Drop-off and Delivery",
                "Pickup and Self-Claim",
                "Wash, Dry, & Fold",
                "Bulk Orders"
            ],
            fullHours: [
                { day: "Monday - Saturday", hours: "6:00 AM - 5:00 PM" },
                { day: "Sunday", hours: "6:00 AM - 1:00 PM" }
            ],
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        }
    ];
}

var map;
var shopMarkers = [];
var showFilteredOnly = false;
var currentBoundaryLayer = null;
var barangayGeoJSON = null;
var userLocationMarker = null;
var userLocationLatLng = null;
var currentRouteLayer = null;
var routeFetchController = null;
var activeShop = null;
var locationPermissionAlertShown = false;
var routeInfoMarker = null;

function resolveDataAssetUrl(filename) {
    if (!filename) {
        return '';
    }

    if (/^https?:\/\//i.test(filename)) {
        return filename;
    }

    const normalizedName = filename.replace(/^\/+/, '');
    const pathWithinSite = normalizedName.startsWith('assets/')
        ? normalizedName
        : `assets/data/${normalizedName}`;

    if (window.location.protocol === 'file:') {
        return pathWithinSite;
    }

    try {
        return new URL(pathWithinSite, window.location.href).href;
    } catch (error) {
        return pathWithinSite;
    }
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

function resolveShopLogoUrl(logo) {
    if (!logo || typeof logo !== 'string') {
        return null;
    }

    const trimmed = logo.trim();
    if (!trimmed) {
        return null;
    }

    if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
        return trimmed;
    }

    const cleaned = trimmed.replace(/^\.\/+/, '').replace(/^\/+/, '');
    if (!cleaned) {
        return null;
    }

    try {
        const basePath = getSiteBasePath();
        const baseUrl = `${window.location.origin}${basePath}`;
        return new URL(cleaned, baseUrl).href;
    } catch (err) {
        const fallbackBase = getSiteBasePath();
        return `${fallbackBase}${cleaned}`.replace(/\/+/g, '/');
    }
}

function renderSidebarTitle(sidebarTitle, shop) {
    if (!sidebarTitle) {
        return;
    }

    const logoUrl = resolveShopLogoUrl(shop.logo);
    const fallbackInitial = (shop.name || '?').charAt(0).toUpperCase();

    sidebarTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
                width: 44px;
                height: 44px;
                border-radius: 14px;
                overflow: hidden;
                background: linear-gradient(135deg, #eff6ff, #e0f2fe);
                box-shadow: inset 0 0 0 1px rgba(29, 78, 216, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                ${logoUrl ? `<img src="${logoUrl}" alt="${shop.name || 'Laundry Shop'} Logo" class="map-shop-title-logo-img" style="width: 100%; height: 100%; object-fit: cover; display: block;" />` : ''}
                <div class="map-shop-title-logo-fallback" style="
                    width: 100%;
                    height: 100%;
                    display: ${logoUrl ? 'none' : 'flex'};
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1d4ed8;
                ">${fallbackInitial}</div>
            </div>
            <span style="font-size: 18px; font-weight: 700; color: #1e3a8a;">${shop.name}</span>
        </div>
    `;

    const logoImg = sidebarTitle.querySelector('.map-shop-title-logo-img');
    const fallbackEl = sidebarTitle.querySelector('.map-shop-title-logo-fallback');

    if (logoImg && fallbackEl) {
        const showFallback = () => {
            logoImg.style.display = 'none';
            fallbackEl.style.display = 'flex';
        };

        const hideFallback = () => {
            logoImg.style.display = 'block';
            fallbackEl.style.display = 'none';
        };

        logoImg.addEventListener('load', () => {
            if (logoImg.naturalWidth === 0 || logoImg.naturalHeight === 0) {
                showFallback();
            } else {
                hideFallback();
            }
        });

        logoImg.addEventListener('error', showFallback);

        if (logoImg.complete) {
            if (logoImg.naturalWidth === 0 || logoImg.naturalHeight === 0) {
                showFallback();
            } else {
                hideFallback();
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map', { zoomControl: false }).setView([16.424693, 120.600004], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    var washitIcon = L.icon({
        iconUrl: './assets/images/washit-map-pin.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });


    var shops = getMapShopData();

    shops.forEach(function(shop) {
        var marker = L.marker([shop.lat, shop.lng], {icon: washitIcon}).addTo(map);
        marker.shopData = shop;
        
        marker.on('click', function() {
            showMapSidebar(shop);
        });
        
        shopMarkers.push(marker);
    });
    applyShopVisibility();
    const barangayFilter = document.getElementById('barangay-filter');
    if (barangayFilter) {
        barangayFilter.addEventListener('change', function() {
            const selectedBarangay = this.value;
            if (selectedBarangay) {
                zoomToBarangay(selectedBarangay);
            } else {
                showFilteredOnly = false;
                resetMapView();
            }

            applyShopVisibility();
        });
    }

    loadBarangayBoundaries();
    autoAcquireLocationIfPermitted();
});

function showMapSidebar(shop) {
    if (shop && typeof setCurrentShop === 'function') {
        setCurrentShop(shop);
    } else if (shop && typeof window.setCurrentShop === 'function') {
        window.setCurrentShop(shop);
    }

    activeShop = shop;

    const sidebar = document.getElementById('mapSidePanel');
    const sidebarTitle = document.getElementById('sidePanelTitle');
    const sidebarContent = document.getElementById('sidePanelContent');
    
    if (!sidebar || !sidebarTitle || !sidebarContent) return;
    
    renderSidebarTitle(sidebarTitle, shop);
    
    sidebarContent.innerHTML = `
        <div style="margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 400;">${shop.tagline}</p>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 8px 0;">
                <span style="color: #059669; font-size: 13px; font-weight: 500;">${shop.hours}</span>
                <span style="color: #f59e0b; font-size: 13px; font-weight: 600;">⭐ ${shop.rating}</span>
            </div>
        </div>
        
        <div style="margin: 16px 0;">
            <p style="margin: 0 0 6px 0; color: #666; font-size: 13px; font-weight: 500;">📍 ${shop.address}</p>
            <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 500; font-size: 13px;">📞 ${shop.phone}</p>
        </div>
        
        <div style="margin: 16px 0; padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">Services Offered</h4>
            <div class="shop-modal-services">
                ${shop.services.map(service => `<div class="shop-modal-service">${service}</div>`).join('')}
            </div>
        </div>
        
        <div style="margin: 16px 0; padding: 12px; background: #e0f2fe; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #0369a1; font-size: 14px; font-weight: 600;">Operating Hours</h4>
            ${shop.fullHours.map(hours => 
                `<div style="font-size: 12px; color: #0369a1; margin: 4px 0;">${hours.day}: ${hours.hours}</div>`
            ).join('')}
        </div>

        <div id="mapRouteDetails" style="margin: 16px 0; padding: 12px; background: #eef2ff; border-radius: 8px; font-size: 12px; color: #1e3a8a;">
            <span style="color: #6b7280;">Enable your location or tap "My Location" to preview the route.</span>
        </div>
        
        <div style="margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">Payment Methods</h4>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${shop.payments.map(payment => {
                    let bgColor = '#f8f9fa';
                    let textColor = '#495057';
                    let borderColor = '#dee2e6';
                    
                    if (payment.type === 'GCash') {
                        bgColor = '#007bff';
                        textColor = 'white';
                        borderColor = '#0056b3';
                    } else if (payment.type === 'Maya') {
                        bgColor = '#00d4aa';
                        textColor = 'white';
                        borderColor = '#00b894';
                    }
                    
                    return `<span style="
                        padding: 6px 12px; 
                        border-radius: 4px; 
                        font-size: 11px; 
                        font-weight: 500; 
                        background: ${bgColor}; 
                        color: ${textColor}; 
                        border: 1px solid ${borderColor};
                    ">${payment.label}</span>`;
                }).join('')}
            </div>
        </div>
        
        <button class="map-book-now-btn"
                style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 16px; font-family: 'Inter', sans-serif; width: 100%; transition: background-color 0.2s ease;"
                onmouseover="this.style.background='#059669'" 
                onmouseout="this.style.background='#10b981'">
            📅 Book Now
        </button>
    `;
    
    sidebar.classList.add('active');

    const mapBookNowBtn = sidebarContent.querySelector('.map-book-now-btn');
    if (mapBookNowBtn) {
        mapBookNowBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (shop && typeof setCurrentShop === 'function') {
                setCurrentShop(shop);
            } else if (shop && typeof window.setCurrentShop === 'function') {
                window.setCurrentShop(shop);
            }

            if (typeof bookWithShop === 'function') {
                bookWithShop(event);
            } else if (typeof window.bookWithShop === 'function') {
                window.bookWithShop(event);
            } else {
                window.location.href = 'features/booking-form/booking-form.html';
            }
        });
    }

    if (userLocationLatLng) {
        setRouteDetails(null, null, 'loading');
    } else {
        setRouteDetails(null, null, 'need-location');
    }

    drawRouteToShop(shop, { autoRequest: true });
    
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 300);
}

function hideMapSidebar() {
    const sidebar = document.getElementById('mapSidePanel');
    if (sidebar) {
        sidebar.classList.remove('active');
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const closeSidebarBtn = document.getElementById('closeSidePanel');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', hideMapSidebar);
    }
    
    // Add event listeners for map control buttons
    const nearbyShopsBtn = document.querySelector('.nearby-shops-btn');
    if (nearbyShopsBtn) {
        nearbyShopsBtn.addEventListener('click', requestAndCenterOnUser);
    }
    
    const hideMapBtn = document.querySelector('.hide-btn');
    if (hideMapBtn) {
        hideMapBtn.addEventListener('click', toggleMap);
    }
    
    if (map) {
        map.on('click', function(e) {
            if (e.originalEvent.target === map.getContainer().querySelector('.leaflet-container')) {
                hideMapSidebar();
            }
        });
    }
});

function toggleMap() {
    const selectedBarangay = getSelectedBarangayValue();

    if (!selectedBarangay) {
        showFilteredOnly = false;
        applyShopVisibility();
        return;
    }

    showFilteredOnly = !showFilteredOnly;
    applyShopVisibility();

    if (showFilteredOnly) {
        zoomToBarangay(selectedBarangay);
    }
}

function findNearbyShops() {
    requestAndCenterOnUser();
}

async function loadBarangayBoundaries() {
    try {
        const geoJsonPath = resolveDataAssetUrl('baguio_barangays.geojson');

        const response = await fetch(geoJsonPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        barangayGeoJSON = await response.json();
    } catch (error) {
        alert('We could not load the barangay boundaries. Please open this page through a local web server (for example, VS Code Live Server or "python -m http.server 8000") to view the outlines. The map will continue without them.');
    }
}

function getSelectedBarangayValue() {
    const filter = document.getElementById('barangay-filter');
    if (!filter) {
        return '';
    }
    return filter.value || '';
}

function updateShopToggleButton() {
    const toggleBtn = document.querySelector('.hide-btn');
    if (!toggleBtn) {
        return;
    }

    const filter = document.getElementById('barangay-filter');
    const selectedBarangay = filter ? (filter.value || '') : '';
    const selectedBarangayLabel = filter && filter.selectedIndex >= 0
        ? filter.options[filter.selectedIndex].text.trim()
        : '';

    if (!selectedBarangay) {
        toggleBtn.textContent = 'Show All Wash.IT Shops';
        toggleBtn.disabled = true;
        toggleBtn.setAttribute('aria-disabled', 'true');
        return;
    }

    toggleBtn.disabled = false;
    toggleBtn.removeAttribute('aria-disabled');
    toggleBtn.textContent = showFilteredOnly
        ? 'Show All Wash.IT Shops'
        : `Show Only ${selectedBarangayLabel || selectedBarangay} Shops`;
}

function applyShopVisibility() {
    if (!map) {
        return;
    }

    const selectedBarangay = getSelectedBarangayValue();
    const filterActive = showFilteredOnly && selectedBarangay;

    shopMarkers.forEach(function(marker) {
        const markerBarangay = marker.shopData && marker.shopData.barangay;
        const shouldDisplay = !filterActive || markerBarangay === selectedBarangay;

        if (shouldDisplay) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            marker.setOpacity(1);
        } else if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });

    if (filterActive && activeShop && activeShop.barangay !== selectedBarangay) {
        activeShop = null;
        hideMapSidebar();
        clearRouteLayer();
    }

    updateShopToggleButton();
}

function zoomToBarangay(barangayValue) {
    if (currentBoundaryLayer) {
        map.removeLayer(currentBoundaryLayer);
        currentBoundaryLayer = null;
    }
    
    if (!barangayGeoJSON) {
        // Fallback behavior when GeoJSON cannot be loaded (CORS issue)
        alert(`Selected: ${barangayValue}\n\nNote: To see barangay boundaries, please open this page through a local web server.`);

        // Just reset to default view for now
        resetMapView();
        return;
    }

    const barangayFeature = barangayGeoJSON.features.find(feature => 
        feature.properties.ADM4_EN === barangayValue
    );

    if (barangayFeature) {
        const barangayLayer = L.geoJSON(barangayFeature, {
            style: {
                color: '#10b981',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.2,
                fillColor: '#10b981'
            }
        });

        currentBoundaryLayer = barangayLayer;
        barangayLayer.addTo(map);
        map.fitBounds(barangayLayer.getBounds());
    } else {
        alert(`Boundary for "${barangayValue}" not found in the data.`);
    }
}

function resetMapView() {
    if (currentBoundaryLayer) {
        map.removeLayer(currentBoundaryLayer);
        currentBoundaryLayer = null;
    }
    
    if (currentRouteLayer && map.hasLayer(currentRouteLayer)) {
        const bounds = currentRouteLayer.getBounds();
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds.pad(0.2));
        }
    } else {
        map.setView([16.424693, 120.600004], 16);
    }
    
    shopMarkers.forEach(function(marker) {
        marker.setOpacity(1);
    });

    applyShopVisibility();
}

function setUserLocation(lat, lng, options) {
    options = options || {};

    if (!map) {
        return null;
    }

    const latLng = L.latLng(lat, lng);
    userLocationLatLng = latLng;

    if (userLocationMarker) {
        userLocationMarker.setLatLng(latLng);
        if (!map.hasLayer(userLocationMarker)) {
            userLocationMarker.addTo(map);
        }
    } else {
        userLocationMarker = L.circleMarker(latLng, {
            radius: 7,
            color: '#2563eb',
            weight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.85
        }).addTo(map);

        userLocationMarker.bindPopup('You are here');
    }

    if (typeof userLocationMarker.bringToFront === 'function') {
        userLocationMarker.bringToFront();
    }

    if (options.panTo) {
        const targetZoom = options.zoom || Math.max(map.getZoom(), 15);
        map.setView(latLng, targetZoom);
    }

    if (options.openPopup && userLocationMarker) {
        userLocationMarker.openPopup();
    }

    return latLng;
}

function ensureUserLocation(autoRequest, options) {
    if (userLocationLatLng) {
        if (options) {
            setUserLocation(userLocationLatLng.lat, userLocationLatLng.lng, options);
        } else if (userLocationMarker && !map.hasLayer(userLocationMarker)) {
            userLocationMarker.addTo(map);
        }
        return Promise.resolve(userLocationLatLng);
    }

    if (!autoRequest) {
        return Promise.reject(new Error('LOCATION_UNAVAILABLE'));
    }

    if (!navigator.geolocation) {
        return Promise.reject(new Error('Geolocation is not supported by this browser.'));
    }

    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latLng = setUserLocation(position.coords.latitude, position.coords.longitude, options);
            resolve(latLng);
        }, function(error) {
            reject(error);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 10000
        });
    });
}

function abortRouteFetch() {
    if (routeFetchController) {
        routeFetchController.abort();
        routeFetchController = null;
    }
}

function clearRouteLayer() {
    if (currentRouteLayer) {
        map.removeLayer(currentRouteLayer);
        currentRouteLayer = null;
    }

    clearRouteInfoMarker();
}

function setRouteDetails(distanceMeters, durationSeconds, status) {
    const routeDetailsEl = document.getElementById('mapRouteDetails');
    if (!routeDetailsEl) {
        return;
    }

    if (status === 'loading') {
        routeDetailsEl.innerHTML = `
            <span style="color:#4b5563; display:flex; align-items:center; gap:8px;">
                Calculating distance...
            </span>
        `;
        return;
    }

    if (status === 'need-location') {
        routeDetailsEl.innerHTML = `
            <span style="color:#6b7280;">Enable your location or tap "My Location" to preview the route.</span>
        `;
        return;
    }

    routeDetailsEl.innerHTML = '';
}

function clearRouteInfoMarker() {
    if (map && routeInfoMarker) {
        map.removeLayer(routeInfoMarker);
    }

    routeInfoMarker = null;
}

function displayRouteDistanceOnRoute(routeGeometry, distanceMeters) {
    if (!map || !routeGeometry || typeof distanceMeters !== 'number') {
        return;
    }

    let coordinates = null;

    if (routeGeometry.type === 'LineString' && Array.isArray(routeGeometry.coordinates)) {
        coordinates = routeGeometry.coordinates;
    } else if (routeGeometry.type === 'MultiLineString' && Array.isArray(routeGeometry.coordinates)) {
        coordinates = routeGeometry.coordinates.reduce((accumulator, segment) => {
            if (Array.isArray(segment)) {
                return accumulator.concat(segment);
            }
            return accumulator;
        }, []);
    }

    if (!coordinates || coordinates.length === 0) {
        return;
    }

    const midpoint = getCoordinateAtFraction(coordinates, 0.5);
    if (!midpoint) {
        return;
    }

    const distanceKm = distanceMeters / 1000;
    const distanceText = distanceKm >= 1
        ? `${distanceKm.toFixed(2)} km`
        : `${Math.round(distanceMeters)} m`;

    clearRouteInfoMarker();

    const icon = L.divIcon({
        className: 'route-info-marker',
        html: `
            <div style="transform: translate(-50%, -120%);">
                <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: rgba(37, 99, 235, 0.94);
                    color: #ffffff;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 13px;
                    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.3);
                    letter-spacing: 0.25px;
                    white-space: nowrap;
                ">
                    <span>${distanceText}</span>
                </div>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });

    routeInfoMarker = L.marker(midpoint, {
        icon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000
    }).addTo(map);
}

function getCoordinateAtFraction(coordinates, fraction) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        return null;
    }

    if (coordinates.length === 1) {
        const onlyCoord = coordinates[0];
        return onlyCoord ? L.latLng(onlyCoord[1], onlyCoord[0]) : null;
    }

    const clampedFraction = Math.max(0, Math.min(1, fraction));
    let totalDistance = 0;
    const segmentDistances = [];

    for (let i = 1; i < coordinates.length; i += 1) {
        const start = L.latLng(coordinates[i - 1][1], coordinates[i - 1][0]);
        const end = L.latLng(coordinates[i][1], coordinates[i][0]);
        const segmentDistance = start.distanceTo(end);
        segmentDistances.push(segmentDistance);
        totalDistance += segmentDistance;
    }

    if (totalDistance === 0) {
        const firstCoord = coordinates[0];
        return firstCoord ? L.latLng(firstCoord[1], firstCoord[0]) : null;
    }

    const targetDistance = totalDistance * clampedFraction;
    let accumulatedDistance = 0;

    for (let i = 0; i < segmentDistances.length; i += 1) {
        const segmentDistance = segmentDistances[i];
        if (accumulatedDistance + segmentDistance >= targetDistance) {
            const startCoord = coordinates[i];
            const endCoord = coordinates[i + 1];
            const segmentFraction = segmentDistance === 0
                ? 0
                : (targetDistance - accumulatedDistance) / segmentDistance;
            const lat = startCoord[1] + (endCoord[1] - startCoord[1]) * segmentFraction;
            const lng = startCoord[0] + (endCoord[0] - startCoord[0]) * segmentFraction;
            return L.latLng(lat, lng);
        }
        accumulatedDistance += segmentDistance;
    }

    const lastCoord = coordinates[coordinates.length - 1];
    return lastCoord ? L.latLng(lastCoord[1], lastCoord[0]) : null;
}

function drawRouteToShop(shop, options) {
    if (!shop || !map) {
        return;
    }

    options = options || {};
    const autoRequest = options.autoRequest !== false;

    if (userLocationLatLng) {
        setRouteDetails(null, null, 'loading');
    } else {
        setRouteDetails(null, null, 'need-location');
    }

    ensureUserLocation(autoRequest, { panTo: false, openPopup: false })
        .then(function(latLng) {
            if (!latLng) {
                throw new Error('LOCATION_UNAVAILABLE');
            }

            abortRouteFetch();
            clearRouteLayer();

            const destination = L.latLng(shop.lat, shop.lng);
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${latLng.lng},${latLng.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

            routeFetchController = new AbortController();

            return fetch(osrmUrl, { signal: routeFetchController.signal })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error(`Routing request failed (${response.status})`);
                    }
                    return response.json();
                })
                .then(function(data) {
                    routeFetchController = null;

                    const route = data && data.routes && data.routes[0];
                    if (!route || !route.geometry) {
                        throw new Error('No route geometry returned.');
                    }

                    currentRouteLayer = L.geoJSON(route.geometry, {
                        style: {
                            color: '#0ea5e9',
                            weight: 6,
                            opacity: 0.85
                        }
                    }).addTo(map);

                    const bounds = currentRouteLayer.getBounds();
                    if (bounds && bounds.isValid()) {
                        bounds.extend(latLng);
                        bounds.extend(destination);
                        map.fitBounds(bounds.pad(0.2));
                    }

                    if (userLocationMarker && !map.hasLayer(userLocationMarker)) {
                        userLocationMarker.addTo(map);
                    }

                    displayRouteDistanceOnRoute(route.geometry, route.distance);
                    setRouteDetails(route.distance, null, 'shown-on-route');
                });
        })
        .catch(function(error) {
            if (!error || error.name === 'AbortError') {
                return;
            }

            routeFetchController = null;
            clearRouteLayer();

            if (error.code !== 1 && error.message !== 'LOCATION_UNAVAILABLE') {
                console.warn('Route calculation failed:', error);
            }
        });
}

function requestAndCenterOnUser() {
    ensureUserLocation(true, { panTo: true, openPopup: true })
        .then(function() {
            if (activeShop) {
                drawRouteToShop(activeShop, { autoRequest: false });
            }
        })
        .catch(function(error) {
            if (error && error.code === 1) {
                alert('We need permission to access your location. Please allow it in your browser settings.');
            } else if (error && error.message && error.message !== 'LOCATION_UNAVAILABLE') {
                console.warn('Unable to determine current location:', error.message);
            }
        });
}

function autoAcquireLocationIfPermitted() {
    if (userLocationLatLng) {
        return;
    }

    if (!navigator || !navigator.permissions || typeof navigator.permissions.query !== 'function') {
        return;
    }

    navigator.permissions.query({ name: 'geolocation' })
        .then(function(status) {
            var handleGranted = function() {
                ensureUserLocation(true, { panTo: true, openPopup: false })
                    .then(function() {
                        if (activeShop) {
                            drawRouteToShop(activeShop, { autoRequest: false });
                        }
                    })
                    .catch(function() {
                        // Ignore errors; user may have revoked access in between.
                    });
            };

            if (status.state === 'granted') {
                handleGranted();
            }

            if (typeof status.addEventListener === 'function') {
                status.addEventListener('change', function() {
                    if (status.state === 'granted') {
                        handleGranted();
                    }
                });
            } else {
                status.onchange = function() {
                    if (status.state === 'granted') {
                        handleGranted();
                    }
                };
            }
        })
        .catch(function() {
            // Permissions API not accessible; do nothing to avoid triggering prompts.
        });
}

