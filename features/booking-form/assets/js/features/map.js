// Map Management Module
// Handles map initialization, geolocation, and user interaction

// Global map state
let map = null;
let userLocationMarker = null;
let userLocationCircle = null;
let pickupMarker = null;
let pickupAddress = null;

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
            console.log('Primary tile layer failed, switching to fallback');
            if (fallbackAttempts === 0) {
                map.removeLayer(tileLayer);
                fallbackLayer1.addTo(map);
                fallbackAttempts++;
            }
        });

        fallbackLayer1.on('tileerror', function() {
            console.log('First fallback failed, trying second fallback');
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
                pickupAddress = {
                    lat: location.lat,
                    lng: location.lng,
                    accuracy: location.accuracy,
                    isUserLocation: true
                };
            })
            .catch(() => {
                // Location not available, continue with default view
            });

        // Handle map click to place pickup pin
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Remove existing pickup marker
            if (pickupMarker) {
                map.removeLayer(pickupMarker);
            }

            // Add new pickup marker
            pickupMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'pickup-marker',
                    html: '<div style="background-color: #ff4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(map);

            // Add popup
            pickupMarker.bindPopup(`
                <div style="text-align: center; font-family: inherit;">
                    <strong>📍 Pickup Location</strong><br>
                    <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
                </div>
            `).openPopup();

            // Store pickup address
            pickupAddress = { lat: lat, lng: lng, isUserLocation: false };
        });

        // Fix zoom controls to prevent page scrolling
        fixZoomControls();

    } catch (error) {
        console.error('Failed to initialize map:', error);
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

// Refresh user's current location and center map
function refreshUserLocation() {
    if (!map) {
        console.error('Map not initialized');
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

            // Update pickup address to user's location
            pickupAddress = {
                lat: location.lat,
                lng: location.lng,
                accuracy: location.accuracy,
                isUserLocation: true
            };

            // Re-enable button
            if (locationButton) {
                locationButton.disabled = false;
                locationButton.innerHTML = '📍';
                locationButton.style.opacity = '1';
                locationButton.title = 'Use My Location';
            }
        })
        .catch((error) => {
            console.error('Failed to get user location:', error);
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
