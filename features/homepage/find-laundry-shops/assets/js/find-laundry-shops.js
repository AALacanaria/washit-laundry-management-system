// Find Laundry Shops - Original Inline Scripts Extracted

// Import shop data from shop-cards.js to maintain consistency
function getMapShopData() {
    // This function provides shop data for the map
    // Should match the data structure from shop-cards.js
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

// Global variables
var map;
var shopMarkers = [];
var markersVisible = true;

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map centered to show all partner shops in Trancoville, Baguio City
    map = L.map('map').setView([16.424693, 120.600004], 16);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create custom WashIt icon for markers
    var washitIcon = L.icon({
        iconUrl: './assets/images/washit-map-pin.png',
        iconSize: [40, 40], // Size of the icon
        iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -40], // Point from which the popup should open relative to the iconAnchor
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41]
    });

    // Test if image loads
    var testImg = new Image();
    testImg.onload = function() {
        // Logo loaded successfully
    };
    testImg.onerror = function() {
        // Failed to load logo
    };
    testImg.src = './assets/images/washit-map-pin.png';

    // Add laundry shop markers - Partner shops in Trancoville, Baguio City
    var shops = getMapShopData();

    shops.forEach(function(shop) {
        var marker = L.marker([shop.lat, shop.lng], {icon: washitIcon}).addTo(map);
        
        // Add click event to show side panel instead of popup
        marker.on('click', function() {
            showMapSidebar(shop);
        });
        
        // Store marker in global array
        shopMarkers.push(marker);
    });

    // Find nearby shops button functionality
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
});

// Function to show shop details in sidebar
function showMapSidebar(shop) {
    const sidebar = document.getElementById('mapSidePanel');
    const sidebarTitle = document.getElementById('sidePanelTitle');
    const sidebarContent = document.getElementById('sidePanelContent');
    
    if (!sidebar || !sidebarTitle || !sidebarContent) return;
    
    // Update sidebar content
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
    
    // Show sidebar
    sidebar.classList.add('active');
    
    // Invalidate map size to ensure proper rendering when sidebar opens
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 300); // Wait for animation to complete
}

// Function to hide sidebar
function hideMapSidebar() {
    const sidebar = document.getElementById('mapSidePanel');
    if (sidebar) {
        sidebar.classList.remove('active');
        
        // Invalidate map size to ensure proper rendering when sidebar closes
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 300); // Wait for animation to complete
    }
}

// Add event listeners for sidebar controls
document.addEventListener('DOMContentLoaded', function() {
    // Close sidebar button
    const closeSidebarBtn = document.getElementById('closeSidePanel');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', hideMapSidebar);
    }
    
    // Hide sidebar when clicking on map
    if (map) {
        map.on('click', function(e) {
            // Only hide if clicking on empty map area (not on markers)
            if (e.originalEvent.target === map.getContainer().querySelector('.leaflet-container')) {
                hideMapSidebar();
            }
        });
    }
});

// Toggle Map function - called from HTML onclick
function toggleMap() {
    var hideBtn = document.querySelector('.hide-btn');
    
    if (markersVisible) {
        // Hide all shop markers
        shopMarkers.forEach(function(marker) {
            map.removeLayer(marker);
        });
        markersVisible = false;
        hideBtn.textContent = 'Show Map';
    } else {
        // Show all shop markers
        shopMarkers.forEach(function(marker) {
            marker.addTo(map);
        });
        markersVisible = true;
        hideBtn.textContent = 'Hide Map';
    }
}

// Find nearby shops function - called from HTML onclick
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