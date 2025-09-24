function getMapShopData() {
    return [
        {
            id: 1,
            name: "Kylie Rose Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
            lat: 16.425454290609377,
            lng: 120.5989512577405,
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
            lat: 16.425359279483803,
            lng: 120.6010600327948,
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
            lat: 16.42327170651393,
            lng: 120.59909688655648,
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
var markersVisible = true;
var currentBoundaryLayer = null;
var barangayGeoJSON = null;
document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map').setView([16.424693, 120.600004], 16);
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
        
        marker.on('click', function() {
            showMapSidebar(shop);
        });
        
        shopMarkers.push(marker);
    });
    document.querySelector('.nearby-shops-btn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                
                map.setView([lat, lng], 15);
                
                L.marker([lat, lng]).addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    const barangayFilter = document.getElementById('barangay-filter');
    if (barangayFilter) {
        barangayFilter.addEventListener('change', function() {
            const selectedBarangay = this.value;
            if (selectedBarangay) {
                zoomToBarangay(selectedBarangay);
            } else {
                resetMapView();
            }
        });
    }

    loadBarangayBoundaries();
});

function showMapSidebar(shop) {
    const sidebar = document.getElementById('mapSidePanel');
    const sidebarTitle = document.getElementById('sidePanelTitle');
    const sidebarContent = document.getElementById('sidePanelContent');
    
    if (!sidebar || !sidebarTitle || !sidebarContent) return;
    
    sidebarTitle.textContent = shop.name;
    
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
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">🧺 Services Offered</h4>
            <div class="shop-modal-services">
                ${shop.services.map(service => `<div class="shop-modal-service">${service}</div>`).join('')}
            </div>
        </div>
        
        <div style="margin: 16px 0; padding: 12px; background: #e0f2fe; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #0369a1; font-size: 14px; font-weight: 600;">📅 Operating Hours</h4>
            ${shop.fullHours.map(hours => 
                `<div style="font-size: 12px; color: #0369a1; margin: 4px 0;">${hours.day}: ${hours.hours}</div>`
            ).join('')}
        </div>
        
        <div style="margin: 16px 0;">
            <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">💳 Payment Methods</h4>
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
        
        <button onclick="window.location.href='features/booking-form/booking-form.html'" 
                style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 16px; font-family: 'Inter', sans-serif; width: 100%; transition: background-color 0.2s ease;"
                onmouseover="this.style.background='#059669'" 
                onmouseout="this.style.background='#10b981'">
            📅 Book Now
        </button>
    `;
    
    sidebar.classList.add('active');
    
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
    
    if (map) {
        map.on('click', function(e) {
            if (e.originalEvent.target === map.getContainer().querySelector('.leaflet-container')) {
                hideMapSidebar();
            }
        });
    }
});

function toggleMap() {
    var hideBtn = document.querySelector('.hide-btn');
    
    if (markersVisible) {
        shopMarkers.forEach(function(marker) {
            map.removeLayer(marker);
        });
        markersVisible = false;
        hideBtn.textContent = 'Show Map';
    } else {
        shopMarkers.forEach(function(marker) {
            marker.addTo(map);
        });
        markersVisible = true;
        hideBtn.textContent = 'Hide Map';
    }
}

function findNearbyShops() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            
            map.setView([lat, lng], 15);
            
            L.marker([lat, lng]).addTo(map)
                .bindPopup('Your Location')
                .openPopup();
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

async function loadBarangayBoundaries() {
    try {
        const response = await fetch('/washit-laundry-management-system/assets/data/baguio_barangays.geojson');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        barangayGeoJSON = await response.json();
        console.log('Barangay boundaries loaded successfully:', barangayGeoJSON.features.length, 'barangays');
    } catch (error) {
        console.error('Failed to load barangay boundaries:', error);
        console.warn('CORS Error: You need to serve this page through a web server (not file://) to load GeoJSON data.');
        console.log('Solutions:');
        console.log('1. Use Live Server extension in VS Code');
        console.log('2. Run: python -m http.server 8000 (from project root)');
        console.log('3. Use any local web server to serve the files');
        
        // Provide fallback functionality
        console.log('Using fallback mode without boundary display');
    }
}

function zoomToBarangay(barangayValue) {
    if (currentBoundaryLayer) {
        map.removeLayer(currentBoundaryLayer);
        currentBoundaryLayer = null;
    }
    
    if (!barangayGeoJSON) {
        // Fallback behavior when GeoJSON cannot be loaded (CORS issue)
        console.log('GeoJSON data not available due to CORS restrictions');
        
        // Show a basic message and reset view
        alert(`Selected: ${barangayValue}\n\nNote: To see barangay boundaries, please serve this page through a web server (see console for instructions).`);
        
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
        console.error('Barangay not found:', barangayValue);
        console.log('Available barangays:', barangayGeoJSON.features.map(f => f.properties.ADM4_EN));
        alert(`Boundary for "${barangayValue}" not found in the data.`);
    }
}

function resetMapView() {
    if (currentBoundaryLayer) {
        map.removeLayer(currentBoundaryLayer);
        currentBoundaryLayer = null;
    }
    
    map.setView([16.424693, 120.600004], 16);
    
    shopMarkers.forEach(function(marker) {
        if (!map.hasLayer(marker) && markersVisible) {
            marker.addTo(map);
        }
        marker.setOpacity(1);
    });
}