// Laundry Shop Cards Component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeShopCards();
});

function initializeShopCards() {
    setupCardInteractions();
    populateShopCards();
}
function setupCardInteractions() {
    // Event delegation for card interactions
    document.addEventListener('click', function(e) {
        // Handle view details button clicks
        if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.shop-card');
            if (card) {
                expandCard(card);
            }
            return;
        }
        
        // Handle card clicks
        const clickedCard = e.target.closest('.shop-card');
        if (clickedCard && !e.target.closest('.view-details-btn')) {
            expandCard(clickedCard);
        }
    });
    
    // Close card when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.shop-card')) {
            collapseAllCards();
        }
    });
    
    // Close card with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            collapseAllCards();
        }
    });
}

function expandCard(card) {
    if (!card || !card.dataset.shopId) {
        return;
    }
    
    const shopId = parseInt(card.dataset.shopId);
    const shopData = getShopDataById(shopId);
    
    if (!shopData) {
        return;
    }
    
    openShopModal(shopData);
}

function openShopModal(shop) {
    setTimeout(() => {
        const modal = document.getElementById('shopModal');
        
        if (!modal) {
            return;
        }
        
        // Find modal elements
    const modalLogo = modal.querySelector('#modalLogo') || document.getElementById('modalLogo');
    const modalLogoFallback = modal.querySelector('#modalLogoFallback') || document.getElementById('modalLogoFallback');
        const modalShopName = modal.querySelector('#modalShopName') || document.getElementById('modalShopName');
        const modalTagline = modal.querySelector('#modalTagline') || document.getElementById('modalTagline');
        const modalHours = modal.querySelector('#modalHours') || document.getElementById('modalHours');
        const modalRating = modal.querySelector('#modalRating') || document.getElementById('modalRating');
        
        // Populate modal with shop data
        if (modalLogo) {
            const logoContainer = modalLogo.parentElement;
            // Reset visibility/state
            modalLogo.style.display = 'block';
            if (modalLogoFallback) {
                modalLogoFallback.style.display = 'none';
                modalLogoFallback.textContent = '';
            }
            if (logoContainer) {
                logoContainer.style.background = '#f1f5f9';
            }
            // Helper to show fallback initial
            const showFallback = () => {
                modalLogo.style.display = 'none';
                if (modalLogoFallback) {
                    modalLogoFallback.textContent = shop.name ? shop.name.charAt(0).toUpperCase() : '?';
                    modalLogoFallback.style.display = 'flex';
                }
            };
            // Attach handlers BEFORE setting src
            modalLogo.onload = function() {
                modalLogo.style.display = 'block';
                if (modalLogoFallback) modalLogoFallback.style.display = 'none';
            };
            modalLogo.onerror = function() {
                showFallback();
            };
            // Now set src and alt; guard against falsy or invalid paths
            modalLogo.alt = `${shop.name} ${shop.businessType} Logo`;
            if (shop.logo && typeof shop.logo === 'string' && shop.logo.trim() !== '') {
                modalLogo.src = shop.logo;
            } else {
                // No logo provided; show fallback immediately
                modalLogo.removeAttribute('src');
                showFallback();
            }
        }
        
        if (modalShopName) {
            modalShopName.textContent = shop.name;
        }
        
        if (modalTagline) {
            modalTagline.textContent = shop.tagline;
        }
        
        if (modalHours) {
            modalHours.textContent = shop.hours;
        }
        
        if (modalRating) {
            modalRating.textContent = shop.rating;
        }
    
    // Populate services
    const servicesContainer = document.getElementById('modalServices');
    if (servicesContainer) {
        servicesContainer.innerHTML = shop.services.map(service => 
            `<div class="shop-modal-service">${service}</div>`
        ).join('');
    }
    
    // Populate full hours
    const hoursContainer = document.getElementById('modalFullHours');
    if (hoursContainer) {
        hoursContainer.innerHTML = shop.fullHours.map(hours => {
            // Split by colon to separate day and time
            const [day, time] = hours.split(': ');
            return `
                <div class="shop-modal-hours-item">
                    <span class="shop-modal-hours-day">${day}</span>
                    <span class="shop-modal-hours-time">${time}</span>
                </div>
            `;
        }).join('');
    }
    
    // Populate contact info
    const contactContainer = document.getElementById('modalContact');
    if (contactContainer) {
        contactContainer.innerHTML = `
            <div class="shop-modal-contact-item">
                <span class="shop-modal-contact-icon">📌</span>
                <span>${shop.address}</span>
            </div>
            <div class="shop-modal-contact-item">
                <span class="shop-modal-contact-icon">📞</span>
                <span>${shop.phone}</span>
            </div>
            <div class="shop-modal-contact-item">
                <span class="shop-modal-contact-icon">🌐</span>
                <span>${shop.website}</span>
            </div>
            <div class="shop-modal-contact-item">
                <span class="shop-modal-contact-icon">📱</span>
                <span>${shop.social}</span>
            </div>
        `;
    }
    
        // Populate payment methods
        const paymentsContainer = document.getElementById('modalPayments');
        if (paymentsContainer) {
            paymentsContainer.innerHTML = shop.payments.map(payment => 
                `<div class="shop-modal-payment ${payment.type.toLowerCase()}">${payment.label}</div>`
            ).join('');
        }
        
        // Show the modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 100);
}

function closeShopModal() {
    const modal = document.getElementById('shopModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Add modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('shopModal');
    const closeBtn = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    // Close modal when clicking close button
    closeBtn.addEventListener('click', closeShopModal);
    closeModalBtn.addEventListener('click', closeShopModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeShopModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeShopModal();
        }
    });
});

// Helper function to get shop data by ID
function getShopDataById(id) {
    const shopData = [
        {
            id: 1,
            logo: "./features/homepage/find-laundry-shops/assets/images/kylierose-laundryhub-logo.png",
            name: "Kylie Rose Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 917 234 5678",
            website: "kylieroselaundry.com",
            social: "@kylieroselaundry",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 2,
            logo: "features/homepage/find-laundry-shops/assets/images/mdeguzman-laundryshop-logo.png",
            name: "M. De Guzman Laundry Shop",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 928 765 4321",
            website: "mdguzmanlaundry.com",
            social: "@mdguzmanlaundry",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 3,
            logo: "features/homepage/find-laundry-shops/assets/images/sampauladrianne-laundryhub-logo.png",
            name: "Sam, Paull, Adrianne Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 936 123 9876",
            website: "spalaundryhub.com",
            social: "@spalaundryhub",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        }
    ];
    
    return shopData.find(shop => shop.id === id);
}

// Modal functions are now used instead of inline expansion

function collapseAllCards() {
    // No longer needed with modal approach
}

function populateShopCards() {
    const container = document.querySelector('.shop-cards-grid');
    if (!container) {
        return;
    }
    
    // Partner laundry shops data
    const shopData = [
        {
            id: 1,
            logo: "features/homepage/find-laundry-shops/assets/images/kylierose-laundryhub-logo.png",
            name: "Kylie Rose Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 917 234 5678",
            website: "kylieroselaundry.com",
            social: "@kylieroselaundry",
            promotion: "First Time Customer: 20% OFF",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 2,
            logo: "./features/homepage/find-laundry-shops/assets/images/mdeguzman-laundryshop-logo.png",
            name: "M. De Guzman Laundry Shop",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 928 765 4321",
            website: "mdguzmanlaundry.com",
            social: "@mdguzmanlaundry",
            promotion: "Family Package: 15% OFF",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        },
        {
            id: 3,
            logo: "./features/homepage/find-laundry-shops/assets/images/sampauladrianne-laundryhub-logo.png",
            name: "Sam, Paull, Adrianne Laundry Hub",
            businessType: "",
            tagline: "Wash & Fold, Pickup, Self-Claim, Drop-off, & Delivery",
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
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 936 123 9876",
            website: "spalaundryhub.com",
            social: "@spalaundryhub",
            promotion: "Loyalty Program: Earn Points",
            payments: [
                {type: "COD", label: "Cash on Delivery"},
                {type: "GCash", label: "GCash"},
                {type: "Maya", label: "Maya"}
            ]
        }
    ];
    
    // Clear existing cards
    container.innerHTML = '';
    
    // Create cards for each shop
    shopData.forEach(shop => {
        const cardHTML = createShopCardHTML(shop);
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function createShopCardHTML(shop) {
    return `
        <div class="shop-card" data-shop-id="${shop.id}">
            <div class="shop-card-header">
                <div class="shop-logo">
                    <img src="${shop.logo}" alt="${shop.name} ${shop.businessType} Logo" onerror="this.style.display='none'; this.parentElement.textContent='🏪';">
                </div>
                <div class="shop-info">
                    <h3>${shop.name}<br>${shop.businessType}</h3>
                </div>
            </div>
            <p class="shop-tagline">${shop.tagline}</p>
            
            <div class="shop-meta">
                <div class="shop-hours">${shop.hours}</div>
                <div class="shop-rating">${shop.rating}</div>
            </div>
            
            <div class="shop-card-footer">
                <button class="view-details-btn">
                    View Details
                    <span>ℹ️</span>
                </button>
            </div>
        </div>
    `;
}

// Utility function to add click analytics or tracking
function trackCardInteraction(shopId, action) {
    // This could be used to track user interactions for analytics
}

// Export functions for potential external use
window.ShopCards = {
    expandCard,
    collapseAllCards,
    populateShopCards
};