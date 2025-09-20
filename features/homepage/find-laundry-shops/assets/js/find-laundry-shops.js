// Find Laundry Shops - Original Inline Scripts Extracted

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Basic map initialization
    var map = L.map('map').setView([14.5995, 120.9842], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add laundry shop markers
    var shops = [
        {
            name: "WashIt Express - Makati",
            lat: 14.5547,
            lng: 121.0244,
            address: "Ayala Avenue, Makati City",
            services: "Wash, Dry, Fold, Ironing"
        },
        {
            name: "WashIt Quick - BGC",
            lat: 14.5515,
            lng: 121.0500,
            address: "Bonifacio Global City, Taguig",
            services: "Express Wash, Premium Care"
        },
        {
            name: "WashIt Clean - Ortigas",
            lat: 14.5864,
            lng: 121.0560,
            address: "Ortigas Center, Pasig City",
            services: "Eco-friendly Wash, Dry Cleaning"
        },
        {
            name: "WashIt Fresh - QC",
            lat: 14.6760,
            lng: 121.0437,
            address: "Quezon Avenue, Quezon City",
            services: "24/7 Service, Self-Service"
        },
        {
            name: "WashIt Pro - Manila",
            lat: 14.5958,
            lng: 120.9772,
            address: "Ermita, Manila",
            services: "Professional Cleaning, Same Day Service"
        }
    ];

    shops.forEach(function(shop) {
        var marker = L.marker([shop.lat, shop.lng]).addTo(map);
        
        var popupContent = `
            <div style="text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #3b82f6;">${shop.name}</h3>
                <p style="margin: 0 0 10px 0; color: #666; font-style: italic;">${shop.address}</p>
                <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #333;">Services:</strong><br>
                    <span style="font-size: 13px; color: #666;">${shop.services}</span>
                </div>
                <button onclick="window.location.href='features/booking-form/booking-form.html'" 
                        style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 14px; margin-top: 8px;">
                    Book Now
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
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

    // Hide shops button functionality
    document.querySelector('.hide-btn').addEventListener('click', function() {
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
    });
});