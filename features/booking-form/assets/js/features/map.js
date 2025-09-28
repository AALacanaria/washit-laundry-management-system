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

let currentRouteLayer = null;
let routeFetchController = null;
let latestRouteSignature = null;
let routeInfoMarker = null;
let pickupPopupTimeout = null;
let userLocationPopupTimeout = null;
let routeInfoTimeout = null;
let pickupReverseGeocodeController = null;
let lastPickupGeocodeKey = null;

function placePickupMarker(lat, lng, options = {}) {
    if (!map) {
        return;
    }

    if (pickupPopupTimeout) {
        clearTimeout(pickupPopupTimeout);
        pickupPopupTimeout = null;
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

    const heading = label || (isUserLocation ? '📍 My Location' : '📍 Pickup Location');
    const popupContent = `<div style="text-align: center; font-family: inherit;">
            <strong>${heading}</strong>
        </div>`;

    pickupMarker.bindPopup(popupContent);
    if (openPopup) {
        pickupMarker.openPopup();
        if (pickupPopupTimeout) {
            clearTimeout(pickupPopupTimeout);
        }
        pickupPopupTimeout = setTimeout(() => {
            if (pickupMarker && typeof pickupMarker.closePopup === 'function') {
                pickupMarker.closePopup();
            }
            pickupPopupTimeout = null;
        }, 2000);
    }

    pickupAddress = {
        lat,
        lng,
        accuracy,
        isUserLocation,
        label: label || null,
        timestamp: Date.now(),
        resolvedAddress: null,
        resolvedAddressSource: null,
        resolvedAddressUpdatedAt: null,
        isResolving: false
    };

    reverseGeocodePickupAddress(lat, lng);

    fitMapToRelevantLocations();
    drawRouteBetweenPickupAndShop();
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

function getPickupLatLng() {
    if (pickupMarker && typeof pickupMarker.getLatLng === 'function') {
        const markerLatLng = pickupMarker.getLatLng();
        if (markerLatLng && Number.isFinite(markerLatLng.lat) && Number.isFinite(markerLatLng.lng)) {
            return markerLatLng;
        }
    }

    if (pickupAddress && Number.isFinite(pickupAddress.lat) && Number.isFinite(pickupAddress.lng)) {
        return L.latLng(pickupAddress.lat, pickupAddress.lng);
    }

    return null;
}

function getPickupLocationDetails() {
    const latLng = getPickupLatLng();
    if (!latLng) {
        return null;
    }

    const accuracy = pickupAddress && Number.isFinite(pickupAddress.accuracy)
        ? Math.round(pickupAddress.accuracy)
        : null;

    return {
        lat: latLng.lat,
        lng: latLng.lng,
        accuracy,
        isUserLocation: !!(pickupAddress && pickupAddress.isUserLocation),
        label: pickupAddress && pickupAddress.label ? pickupAddress.label : null,
        timestamp: pickupAddress && pickupAddress.timestamp ? pickupAddress.timestamp : null,
        address: pickupAddress && pickupAddress.resolvedAddress ? pickupAddress.resolvedAddress : null,
        addressSource: pickupAddress && pickupAddress.resolvedAddressSource ? pickupAddress.resolvedAddressSource : null,
        isResolving: !!(pickupAddress && pickupAddress.isResolving)
    };
}

function reverseGeocodePickupAddress(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
    }

    const geocodeKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (pickupAddress && pickupAddress.resolvedAddress && lastPickupGeocodeKey === geocodeKey) {
        pickupAddress.isResolving = false;
        return;
    }

    if (pickupReverseGeocodeController) {
        pickupReverseGeocodeController.abort();
        pickupReverseGeocodeController = null;
    }

    pickupReverseGeocodeController = new AbortController();
    lastPickupGeocodeKey = geocodeKey;

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1&email=washitlms%40gmail.com`;

    if (pickupAddress) {
        pickupAddress.isResolving = true;
        pickupAddress.resolvedAddressSource = null;
    }

    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        signal: pickupReverseGeocodeController.signal
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Reverse geocode failed (${response.status})`);
            }
            return response.json();
        })
        .then((data) => {
            pickupReverseGeocodeController = null;

            if (!pickupAddress || geocodeKey !== lastPickupGeocodeKey) {
                return;
            }

            const formattedAddress = formatNominatimAddress(data);
            if (formattedAddress) {
                pickupAddress.resolvedAddress = formattedAddress;
                pickupAddress.resolvedAddressSource = 'reverse-geocode';
                pickupAddress.resolvedAddressUpdatedAt = Date.now();
                window.dispatchEvent(new CustomEvent('washit:pickupAddressResolved', {
                    detail: {
                        address: formattedAddress,
                        coordinates: { lat, lng }
                    }
                }));
            } else {
                pickupAddress.resolvedAddress = null;
                pickupAddress.resolvedAddressSource = 'reverse-geocode-empty';
            }
            pickupAddress.isResolving = false;
        })
        .catch((error) => {
            if (error && error.name === 'AbortError') {
                return;
            }
            pickupReverseGeocodeController = null;
            if (pickupAddress) {
                pickupAddress.resolvedAddressSource = 'reverse-geocode-error';
                pickupAddress.isResolving = false;
            }
            console.warn('Pickup reverse geocoding failed:', error);
        });
}

function formatNominatimAddress(data) {
    if (!data) {
        return '';
    }

    const address = data.address || {};
    const parts = [];
    const seen = new Set();

    const addPart = (value) => {
        const trimmed = typeof value === 'string' ? value.trim() : '';
        if (!trimmed) {
            return;
        }
        const normalized = trimmed.toLowerCase();
        if (seen.has(normalized)) {
            return;
        }
        seen.add(normalized);
        parts.push(trimmed);
    };

    const road = address.road || address.residential || address.street || address.highway || address.pedestrian || address.path || address.footway || address.cycleway || address.service;
    const houseNumber = address.house_number || address.house_name || address.building || address.unit || address.level;
    const neighbourhood = address.neighbourhood || address.suburb || address.village || address.hamlet || address.barangay || address.district || address.borough || address.quarter;
    const city = address.city || address.town || address.municipality || address.county || address.state_district;
    const province = address.state || address.province || address.region;
    const postcode = address.postcode;
    const country = address.country;

    if (houseNumber && road) {
        addPart(`${houseNumber} ${road}`);
    } else if (road) {
        addPart(road);
    } else if (houseNumber) {
        addPart(houseNumber);
    }

    addPart(neighbourhood);
    addPart(city);
    addPart(province);

    if (postcode) {
        addPart(postcode);
    }

    if (country) {
        addPart(country);
    }

    if (parts.length === 0 && typeof data.display_name === 'string') {
        return data.display_name.split(',').slice(0, 5).map((segment) => segment.trim()).filter(Boolean).join(', ');
    }

    const limitedParts = limitAddressSegments(parts);

    return limitedParts.join(', ');
}

function limitAddressSegments(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
        return [];
    }

    const result = [];
    let encounteredBaguio = false;

    for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        if (!segment) {
            continue;
        }

        if (/baguio/i.test(segment)) {
            if (!encounteredBaguio) {
                result.push('Baguio City');
            }
            encounteredBaguio = true;
            break;
        }

        result.push(segment);
    }

    if (!encounteredBaguio && !result.some((part) => /baguio/i.test(part))) {
        const baguioSegment = segments.find((part) => /baguio/i.test(part));
        if (baguioSegment) {
            result.push('Baguio City');
        }
    }

    return result;
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

    if (currentRouteLayer && latestRouteSignature) {
        parts.push(`route:${latestRouteSignature}`);
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
    const signature = computeMarkerSignature();

    if (!force && signature && signature === lastFitSignature) {
        return;
    }

    const routeBounds = currentRouteLayer && typeof currentRouteLayer.getBounds === 'function'
        ? currentRouteLayer.getBounds()
        : null;
    const hasRouteBounds = routeBounds && routeBounds.isValid();

    if (points.length === 0 && !hasRouteBounds) {
        lastFitSignature = null;
        return;
    }

    let bounds = null;

    if (points.length === 1) {
        bounds = L.latLngBounds(points);
    } else if (points.length > 1) {
        bounds = L.latLngBounds(points);
    }

    if (hasRouteBounds) {
        if (bounds) {
            bounds.extend(routeBounds);
        } else {
            bounds = routeBounds;
        }
    }

    if (!bounds || !bounds.isValid()) {
        lastFitSignature = signature;
        return;
    }

    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.setView(bounds.getCenter(), Math.max(map.getZoom(), 15));
    } else {
        map.fitBounds(bounds, { padding: [56, 56], maxZoom: 17 });
    }

    lastFitSignature = signature;
}

function setPickupRouteDetails(status, data) {
    const container = document.getElementById('pickupRouteDetails');
    if (!container) {
        return;
    }

    if (status !== 'success') {
        clearRouteInfoMarker();
    }

    container.classList.remove('is-loading', 'is-success', 'is-error');

    let icon = '🧭';
    let message = 'Enable your location or drop a pickup pin to preview the drive to your selected laundry shop.';

    switch (status) {
        case 'loading':
            container.classList.add('is-loading');
            icon = '⏳';
            message = 'Calculating route…';
            break;
        case 'need-shop':
            icon = '🏪';
            message = 'Select a laundry shop to preview the drive from your pickup location.';
            break;
        case 'need-pickup':
            icon = '📍';
            message = 'Set your pickup pin or tap the location button to preview the drive to your selected shop.';
            break;
        case 'error':
            container.classList.add('is-error');
            icon = '⚠️';
            message = 'We couldn’t calculate the route right now. Refresh your location or try again.';
            break;
        case 'success':
            container.classList.add('is-success');
            icon = '';
            message = '';
            break;
        default:
            break;
    }

    if (icon || message) {
        container.innerHTML = `<span class="route-status-icon">${icon}</span><span>${message}</span>`;
        container.style.display = '';
    } else {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

function clearRouteInfoMarker() {
    if (routeInfoTimeout) {
        clearTimeout(routeInfoTimeout);
        routeInfoTimeout = null;
    }
    if (map && routeInfoMarker) {
        map.removeLayer(routeInfoMarker);
    }
    routeInfoMarker = null;
}

function clearRouteLayer() {
    if (map && currentRouteLayer) {
        map.removeLayer(currentRouteLayer);
    }
    currentRouteLayer = null;
    clearRouteInfoMarker();
}

function abortRouteFetch() {
    if (routeFetchController) {
        routeFetchController.abort();
        routeFetchController = null;
    }
}

function drawRouteBetweenPickupAndShop(options = {}) {
    if (!map) {
        return;
    }

    const shopData = window.bookedLaundryShopData || pendingShopData || null;
    const shopCoords = getShopLatLng(shopData);

    if (!shopCoords) {
        clearRouteLayer();
        latestRouteSignature = null;
        setPickupRouteDetails('need-shop');
        return;
    }

    const pickupLatLng = getPickupLatLng();

    if (!pickupLatLng) {
        clearRouteLayer();
        latestRouteSignature = null;
        setPickupRouteDetails('need-pickup');
        return;
    }

    const origin = L.latLng(pickupLatLng.lat, pickupLatLng.lng);
    const destination = L.latLng(shopCoords.lat, shopCoords.lng);

    const signature = `${origin.lat.toFixed(6)},${origin.lng.toFixed(6)}|${destination.lat.toFixed(6)},${destination.lng.toFixed(6)}`;

    if (!options.force && signature === latestRouteSignature && currentRouteLayer) {
        return;
    }

    abortRouteFetch();
    setPickupRouteDetails('loading');

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    routeFetchController = new AbortController();

    fetch(osrmUrl, { signal: routeFetchController.signal })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Routing request failed (${response.status})`);
            }
            return response.json();
        })
        .then((data) => {
            routeFetchController = null;

            const route = data && data.routes && data.routes[0];
            if (!route || !route.geometry) {
                throw new Error('No route geometry returned.');
            }

            clearRouteLayer();

            currentRouteLayer = L.geoJSON(route.geometry, {
                style: {
                    color: '#0ea5e9',
                    weight: 5,
                    opacity: 0.85
                }
            }).addTo(map);

            latestRouteSignature = signature;

            setPickupRouteDetails('success');
            displayRouteInfoOnRoute(route.geometry, route.distance, route.duration);

            if (pickupMarker && typeof pickupMarker.bringToFront === 'function') {
                pickupMarker.bringToFront();
            }
            if (shopMarker && typeof shopMarker.bringToFront === 'function') {
                shopMarker.bringToFront();
            }

            fitMapToRelevantLocations(true);
        })
        .catch((error) => {
            if (error && error.name === 'AbortError') {
                return;
            }

            routeFetchController = null;
            latestRouteSignature = null;
            clearRouteLayer();
            setPickupRouteDetails('error');
            console.warn('Pickup route calculation failed:', error);
        });
}

function displayRouteInfoOnRoute(routeGeometry, distance, duration) {
    if (!map || !routeGeometry) {
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

    const distanceKm = distance / 1000;
    const distanceText = distanceKm >= 1
        ? `${distanceKm.toFixed(2)} km`
        : `${Math.round(distance)} m`;
    const minutes = Math.round(duration / 60);
    const durationText = minutes < 1 ? 'under a minute' : `${minutes} min`;

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
                    background: rgba(14, 165, 233, 0.95);
                    color: #ffffff;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 13px;
                    box-shadow: 0 10px 25px rgba(14, 165, 233, 0.35);
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                ">
                    <span>🛵</span>
                    <span>${distanceText} • approx. ${durationText}</span>
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

    if (routeInfoTimeout) {
        clearTimeout(routeInfoTimeout);
    }

    routeInfoTimeout = setTimeout(() => {
        clearRouteInfoMarker();
    }, 2000);
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

function placeShopMarker(shop) {
    if (!map) {
        pendingShopData = shop || null;
        if (shop) {
            setPickupRouteDetails(getPickupLatLng() ? 'loading' : 'need-pickup');
        } else {
            clearRouteLayer();
            latestRouteSignature = null;
            setPickupRouteDetails('need-shop');
        }
        return;
    }

    if (shopMarker) {
        map.removeLayer(shopMarker);
        shopMarker = null;
    }

    const coords = getShopLatLng(shop);

    if (!coords) {
        pendingShopData = null;
        clearRouteLayer();
        latestRouteSignature = null;
        setPickupRouteDetails('need-shop');
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
    drawRouteBetweenPickupAndShop({ force: true });
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
    if (userLocationPopupTimeout) {
        clearTimeout(userLocationPopupTimeout);
        userLocationPopupTimeout = null;
    }

    userLocationMarker.bindPopup(`
        <div style="text-align: center; font-family: inherit;">
            <strong>📍 My Location</strong>
        </div>
    `).openPopup();

    userLocationPopupTimeout = setTimeout(() => {
        if (userLocationMarker && typeof userLocationMarker.closePopup === 'function') {
            userLocationMarker.closePopup();
        }
        userLocationPopupTimeout = null;
    }, 2000);
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
                if (window.bookedLaundryShopData) {
                    setPickupRouteDetails('need-pickup');
                } else {
                    setPickupRouteDetails('need-shop');
                }
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
    if (window.bookedLaundryShopData) {
        setPickupRouteDetails('need-pickup');
    } else {
        setPickupRouteDetails('need-shop');
    }

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

            if (!pickupMarker) {
                if (window.bookedLaundryShopData) {
                    setPickupRouteDetails('need-pickup');
                } else {
                    setPickupRouteDetails('need-shop');
                }
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
window.getPickupLocationDetails = getPickupLocationDetails;
