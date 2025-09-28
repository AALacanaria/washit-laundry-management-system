// Map Management Module
// Handles map initialization, geolocation, and user interaction

// Global map state
let map = null;
let userLocationMarker = null;
let userLocationCircle = null;
let pickupMarker = null;
let pickupAddress = null;
let barangayGeoJSON = null;
let barangayBoundaryPromise = null;
let currentBarangayLayer = null;
let pendingBarangayName = null;
let lastBarangayHighlighted = null;
let barangayLoadErrorNotified = false;
let shopMarker = null;
let shopMarkerIcon = null;
let pendingShopData = null;
let lastFitSignature = null;

function placePickupMarker(lat, lng, options = {}) {
    if (!map) {
        return;
    }

    const {
        isUserLocation = false,
        accuracy = null,
        label,
        openPopup = true
    } = options;

    if (pickupMarker) {
        map.removeLayer(pickupMarker);
    }

    pickupMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'pickup-marker',
            html: '<div style="background-color: #ff4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);

    const heading = label || (isUserLocation ? '📍 Pickup Location (Your Location)' : '📍 Pickup Location');
    let popupContent = `<div style="text-align: center; font-family: inherit;">
            <strong>${heading}</strong><br>
            <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>`;

    if (isUserLocation && accuracy) {
        popupContent += `<br><small>Based on your device location (±${Math.round(accuracy)}m)</small>`;
    }

    popupContent += '</div>';

    pickupMarker.bindPopup(popupContent);
    if (openPopup) {
        pickupMarker.openPopup();
    }

    pickupAddress = {
        lat,
        lng,
        accuracy,
        isUserLocation
    };

    fitMapToRelevantLocations();
}

function toNumber(value) {
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

function getShopLatLng(shop) {
    if (!shop) {
        return null;
    }

    const lat = toNumber(shop.lat);
    const lng = toNumber(shop.lng);

    if (lat === null || lng === null) {
        return null;
    }

    return { lat, lng };
}

function ensureShopMarkerIcon() {
    if (shopMarkerIcon) {
        return shopMarkerIcon;
    }

    shopMarkerIcon = L.divIcon({
        className: 'shop-location-marker',
        html: `
            <div style="position: relative; width: 34px; height: 42px;">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2563eb, #1e3a8a);
                    border: 3px solid #ffffff;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
                "></div>
                <div style="
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 12px;
                    background: #1e40af;
                    border-radius: 50%;
                    border: 2px solid #bfdbfe;
                    box-shadow: 0 3px 8px rgba(30, 64, 175, 0.45);
                "></div>
                <div style="
                    position: absolute;
                    top: 22px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 10px solid #2563eb;
                    filter: drop-shadow(0 -1px 2px rgba(37, 99, 235, 0.6));
                "></div>
            </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -32]
    });

    return shopMarkerIcon;
}

function computeMarkerSignature() {
    const parts = [];

    if (shopMarker) {
        const { lat, lng } = shopMarker.getLatLng();
        parts.push(`shop:${lat.toFixed(6)},${lng.toFixed(6)}`);
    }

    if (pickupMarker) {
        const { lat, lng } = pickupMarker.getLatLng();
        parts.push(`pickup:${lat.toFixed(6)},${lng.toFixed(6)}`);
    }

    parts.sort();
    return parts.join('|');
}

function fitMapToRelevantLocations(force = false) {
    if (!map) {
        return;
    }

    const points = [];

    if (shopMarker) {
        points.push(shopMarker.getLatLng());
    }

    if (pickupMarker) {
        points.push(pickupMarker.getLatLng());
    }

    if (points.length === 0) {
        lastFitSignature = null;
        return;
    }

    const signature = computeMarkerSignature();

    if (!force && signature === lastFitSignature) {
        return;
    }

    if (points.length === 1) {
        map.setView(points[0], Math.max(map.getZoom(), 15));
    } else {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17 });
        }
    }

    lastFitSignature = signature;
}

function placeShopMarker(shop) {
    if (!map) {
        pendingShopData = shop || null;
        return;
    }

    if (shopMarker) {
        map.removeLayer(shopMarker);
        shopMarker = null;
    }

    const coords = getShopLatLng(shop);

    if (!coords) {
        pendingShopData = null;
        fitMapToRelevantLocations();
        return;
    }

    const icon = ensureShopMarkerIcon();

    shopMarker = L.marker([coords.lat, coords.lng], { icon }).addTo(map);

    const name = (shop && shop.name) ? shop.name : 'Laundry Shop';
    const address = shop && shop.address ? shop.address : null;
    const barangay = shop && shop.barangay ? shop.barangay : null;

    const popupLines = [`<div style="text-align: center; font-family: inherit;">`, `<strong>🏢 ${name}</strong>`];

    if (barangay) {
        popupLines.push(`<br><small>${barangay}, Baguio City</small>`);
    } else if (address) {
        popupLines.push(`<br><small>${address}</small>`);
    }

    popupLines.push(`<br><small>Lat: ${coords.lat.toFixed(6)}<br>Lng: ${coords.lng.toFixed(6)}</small>`);
    popupLines.push('</div>');

    shopMarker.bindPopup(popupLines.join(''));

    shopMarker.openPopup();

    pendingShopData = null;

    fitMapToRelevantLocations();
}

function normalizeBarangayName(name) {
    return (name || '')
        .replace(/barangay/gi, '')
        .replace(/brgy\./gi, '')
        .replace(/[^a-zA-Z\s-]/g, '')
        .trim()
        .toLowerCase();
}

function extractBarangayFromShop(shop) {
    if (!shop) {
        return null;
    }

    if (shop.barangay && shop.barangay.trim()) {
        return shop.barangay.trim();
    }

    if (shop.barangayName && typeof shop.barangayName === 'string' && shop.barangayName.trim()) {
        return shop.barangayName.trim();
    }

    if (shop.address && typeof shop.address === 'string') {
        const parts = shop.address.split(',');
        if (parts.length > 0) {
            const firstPart = parts[0].trim();
            if (firstPart) {
                return firstPart;
            }
        }
    }

    return null;
}

function loadBarangayBoundaries() {
    if (barangayGeoJSON) {
        return Promise.resolve(barangayGeoJSON);
    }

    if (barangayBoundaryPromise) {
        return barangayBoundaryPromise;
    }

    const isGitHubPages = window.location.hostname.includes('github.io');
    const geoJsonPath = isGitHubPages
        ? '/washit-laundry-management-system/assets/data/baguio_barangays.geojson'
        : '../../assets/data/baguio_barangays.geojson';

    barangayBoundaryPromise = fetch(geoJsonPath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            barangayGeoJSON = data;
            barangayBoundaryPromise = null;
            return data;
        })
        .catch((error) => {
            barangayBoundaryPromise = null;
            if (!barangayLoadErrorNotified) {
                barangayLoadErrorNotified = true;
                alert('We could not load the barangay boundaries. Please open this page through a local web server (for example, VS Code Live Server) to view the outlines.');
            }
            throw error;
        });

    return barangayBoundaryPromise;
}

function clearBarangayHighlight() {
    if (currentBarangayLayer && map) {
        map.removeLayer(currentBarangayLayer);
    }
    currentBarangayLayer = null;
    lastBarangayHighlighted = null;
}

function highlightBarangayByName(barangayName, options = {}) {
    if (!barangayName) {
        pendingBarangayName = null;
        clearBarangayHighlight();
        return;
    }

    pendingBarangayName = barangayName;

    if (!map) {
        return;
    }

    loadBarangayBoundaries()
        .then((data) => {
            if (!map) {
                return;
            }

            const normalizedTarget = normalizeBarangayName(barangayName);
            if (!normalizedTarget) {
                clearBarangayHighlight();
                return;
            }

            if (lastBarangayHighlighted === normalizedTarget && currentBarangayLayer) {
                return;
            }

            const matchingFeature = data.features.find((feature) => {
                const featureName = normalizeBarangayName(feature.properties?.ADM4_EN);
                return featureName === normalizedTarget;
            });

            if (!matchingFeature) {
                return;
            }

            clearBarangayHighlight();

            currentBarangayLayer = L.geoJSON(matchingFeature, {
                style: {
                    color: '#4f46e5',
                    weight: 2.5,
                    opacity: 0.85,
                    fillOpacity: 0.08,
                    fillColor: '#4338ca'
                }
            }).addTo(map);

            lastBarangayHighlighted = normalizedTarget;
            pendingBarangayName = null;

            if (options.fitBounds !== false && currentBarangayLayer) {
                const bounds = currentBarangayLayer.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
                }
            }
        })
        .catch(() => {
            // Fetch error already handled; nothing else needed
        });
}

function highlightBookedLaundryBarangay(shop) {
    const selectedShop = shop || window.bookedLaundryShopData || null;

    if (!selectedShop) {
        pendingBarangayName = null;
        clearBarangayHighlight();
        return;
    }

    const barangayName = extractBarangayFromShop(selectedShop);

    if (!barangayName) {
        pendingBarangayName = null;
        clearBarangayHighlight();
        return;
    }

    highlightBarangayByName(barangayName, { fitBounds: !pickupMarker });
}

// Check if map container is visible and has dimensions
function isMapContainerReady() {
    const container = document.getElementById('pickupMap');
    if (!container) return false;

    const style = window.getComputedStyle(container);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    return container.offsetWidth > 0 && container.offsetHeight > 0;
}

// Wait for map container to become visible
function waitForMapContainer(callback, maxWaitTime = 10000) {
    const startTime = Date.now();

    function checkContainer() {
        if (isMapContainerReady()) {
            callback();
            return;
        }

        if (Date.now() - startTime > maxWaitTime) {
            return;
        }

        setTimeout(checkContainer, 100);
    }

    checkContainer();
}

// Get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                resolve(coords);
            },
            (error) => {
                let errorMessage = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Please check your GPS.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

// Add user location marker
function addUserLocationMarker(lat, lng, accuracy) {
    if (!map) return;

    // Remove existing markers
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    if (userLocationCircle) {
        map.removeLayer(userLocationCircle);
    }

    // Create user location icon
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="
            background-color: #4285f4;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        "></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    // Add user location marker
    userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);

    // Add accuracy circle if accuracy is reasonable
    if (accuracy && accuracy < 1000) {
        userLocationCircle = L.circle([lat, lng], {
            color: '#4285f4',
            fillColor: '#4285f4',
            fillOpacity: 0.15,
            radius: accuracy,
            weight: 2
        }).addTo(map);
    }

    // Add popup with location info
    userLocationMarker.bindPopup(`
        <div style="text-align: center; font-family: inherit;">
            <strong>📍 Your Location</strong><br>
            <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
            ${accuracy ? `<br><small>Accuracy: ±${Math.round(accuracy)}m</small>` : ''}
        </div>
    `).openPopup();
}

// Custom Leaflet Control for Location Button
L.Control.LocationButton = L.Control.extend({
    options: {
        position: 'bottomright'
    },

    onAdd: function(map) {
        // Add custom CSS for the control
        if (!document.getElementById('leaflet-location-control-styles')) {
            const style = document.createElement('style');
            style.id = 'leaflet-location-control-styles';
            style.textContent = `
                .leaflet-control-location {
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }

                .leaflet-control-location-button {
                    width: 30px !important;
                    height: 30px !important;
                    line-height: 30px !important;
                    display: block !important;
                    text-align: center !important;
                    text-decoration: none !important;
                    color: #333 !important;
                    background-color: white !important;
                    border: 2px solid rgba(0,0,0,0.2) !important;
                    border-radius: 4px !important;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.4) !important;
                    font-size: 16px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                    margin-bottom: 5px !important;
                }

                .leaflet-control-location-button:hover {
                    background-color: #f4f4f4 !important;
                    transform: scale(1.05) !important;
                }

                .leaflet-control-location-button:active {
                    transform: scale(0.95) !important;
                }

                .leaflet-control-location-button:disabled {
                    opacity: 0.6 !important;
                    cursor: not-allowed !important;
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
        }

        const container = L.DomUtil.create('div', 'leaflet-control-location leaflet-bar leaflet-control');

        // Create the button element
        const button = L.DomUtil.create('a', 'leaflet-control-location-button', container);
        button.href = '#';
        button.title = 'Use My Location';
        button.innerHTML = '📍';

        // Prevent map interactions when clicking the button
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Add click handler
        L.DomEvent.on(button, 'click', function(e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            refreshUserLocation();
        });

        return container;
    }
});

// Factory function to create the control
L.control.locationButton = function(opts) {
    return new L.Control.LocationButton(opts);
};

// Initialize map
function initializeMap() {
    const mapContainer = document.getElementById('pickupMap');

    if (!mapContainer || typeof L === 'undefined' || map) {
        return;
    }

    try {
        // Initialize map
        map = L.map('pickupMap', {
            center: [14.5995, 120.9842],
            zoom: 13,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true,
            fadeAnimation: true,
            zoomAnimation: true,
            preferCanvas: false,
            updateWhenIdle: true,
            updateWhenZooming: false
        });

        // Add tile layer with reliable tile server
        const tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20,
            minZoom: 3,
            updateWhenIdle: true,
            updateWhenZooming: false,
            keepBuffer: 2,
            updateInterval: 200
        });

        // Add alternative fallback tile layer
        const fallbackLayer1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19,
            minZoom: 3
        });

        // Add another fallback
        const fallbackLayer2 = L.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png', {
            attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>, © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 20,
            minZoom: 3
        });

        // Try primary tile layer first, fallback if it fails
        let fallbackAttempts = 0;
        tileLayer.on('tileerror', function() {
            if (fallbackAttempts === 0) {
                map.removeLayer(tileLayer);
                fallbackLayer1.addTo(map);
                fallbackAttempts++;
            }
        });

        fallbackLayer1.on('tileerror', function() {
            if (fallbackAttempts === 1) {
                map.removeLayer(fallbackLayer1);
                fallbackLayer2.addTo(map);
                fallbackAttempts++;
            }
        });

        tileLayer.addTo(map);

        // Add custom location control
        L.control.locationButton({ position: 'bottomright' }).addTo(map);

        // Force map refresh after initialization
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);

        // Get and pin user's location
        getUserLocation()
            .then((location) => {
                map.setView([location.lat, location.lng], 16);
                addUserLocationMarker(location.lat, location.lng, location.accuracy);
                placePickupMarker(location.lat, location.lng, {
                    isUserLocation: true,
                    accuracy: location.accuracy,
                    openPopup: false
                });
            })
            .catch(() => {
                // Location not available, continue with default view
            });

        // Handle map click to place pickup pin
        map.on('click', function(e) {
            placePickupMarker(e.latlng.lat, e.latlng.lng, { isUserLocation: false });
        });

        // Fix zoom controls to prevent page scrolling
        fixZoomControls();

        // Highlight the barangay of the currently selected shop if available
        highlightBookedLaundryBarangay();

        // Place the selected shop marker if data is available
        if (window.bookedLaundryShopData || pendingShopData) {
            placeShopMarker(window.bookedLaundryShopData || pendingShopData);
        }

    } catch (error) {
        alert('We couldn’t load the map. Please refresh the page and make sure you’re connected to the internet.');
    }
}

// Fix zoom controls
function fixZoomControls() {
    if (!map) return;

    setTimeout(() => {
        const zoomInBtn = document.querySelector('.leaflet-control-zoom-in');
        const zoomOutBtn = document.querySelector('.leaflet-control-zoom-out');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (map) map.zoomIn();
                return false;
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (map) map.zoomOut();
                return false;
            });
        }
    }, 500);
}

// Refresh map when container becomes visible
function refreshMap() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
}

// Initialize map when form becomes visible
function initializeMapWhenVisible() {
    if (isMapContainerReady()) {
        initializeMap();
        return;
    }

    waitForMapContainer(() => {
        if (!map) {
            initializeMap();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') {
        initializeMapWhenVisible();
    }
});

// Backup initialization when window loads
window.addEventListener('load', function() {
    if (typeof L !== 'undefined' && !map && isMapContainerReady()) {
        initializeMap();
    }
});

window.addEventListener('washit:bookedLaundryShopUpdated', (event) => {
    const shop = event?.detail || null;
    pendingShopData = shop || null;
    highlightBookedLaundryBarangay(shop);
    placeShopMarker(shop);
});

// Refresh user's current location and center map
function refreshUserLocation() {
    if (!map) {
        alert('The map is still getting ready. Please try again in a moment.');
        return;
    }

    // Find the location control button
    const locationButton = document.querySelector('.leaflet-control-location-button');
    if (locationButton) {
        locationButton.disabled = true;
        locationButton.innerHTML = '⏳';
        locationButton.style.opacity = '0.6';
        locationButton.title = 'Getting Location...';
    }

    getUserLocation()
        .then((location) => {
            // Center map on user's location
            map.setView([location.lat, location.lng], 16);

            // Add/update user location marker
            addUserLocationMarker(location.lat, location.lng, location.accuracy);

            // Pin pickup location to the user's position
            placePickupMarker(location.lat, location.lng, {
                isUserLocation: true,
                accuracy: location.accuracy,
                openPopup: true
            });

            // Re-enable button
            if (locationButton) {
                locationButton.disabled = false;
                locationButton.innerHTML = '📍';
                locationButton.style.opacity = '1';
                locationButton.title = 'Use My Location';
            }
        })
        .catch((error) => {
            alert(error.message);

            // Re-enable button
            if (locationButton) {
                locationButton.disabled = false;
                locationButton.innerHTML = '📍';
                locationButton.style.opacity = '1';
                locationButton.title = 'Use My Location';
            }
        });
}

// Make essential functions globally available
window.refreshMap = refreshMap;
window.refreshUserLocation = refreshUserLocation;
window.initializeMapIfNeeded = () => {
    if (!map && isMapContainerReady()) {
        initializeMap();
    }
};
