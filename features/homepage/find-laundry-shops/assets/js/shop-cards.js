// Laundry Shop Cards Component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeShopCards();
});

function initializeShopCards() {
    setupCardInteractions();
    populateShopCards();
}

function setupCardInteractions() {
    // Specific event listener for close buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.close-btn')) {
            console.log('Close button clicked!'); // Debug log
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.shop-card');
            if (card) {
                console.log('Found card to close:', card.dataset.shopId);
                collapseCard(card);
            }
            return;
        }
    });
    
    // Event delegation for other interactions
    document.addEventListener('click', function(e) {
        // Handle view details button clicks
        if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const card = e.target.closest('.shop-card');
            if (card) {
                expandCard(card);
            }
            return; // Exit early
        }
        
        // Handle card clicks (only when not expanded and not clicking on buttons)
        const clickedCard = e.target.closest('.shop-card');
        if (clickedCard && 
            !clickedCard.classList.contains('expanded') && 
            !e.target.closest('.view-details-btn') && 
            !e.target.closest('.close-btn') &&
            !e.target.closest('.shop-expanded-content')) {
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
    // Collapse all other cards first
    collapseAllCards();
    
    // Expand the clicked card
    card.classList.add('expanded');
    
    // Smooth scroll to card if needed
    setTimeout(() => {
        card.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 100);
}

function collapseCard(card) {
    if (card && card.classList.contains('expanded')) {
        console.log('Collapsing card:', card.dataset.shopId); // Debug log
        card.classList.remove('expanded');
    }
}

function collapseAllCards() {
    const expandedCards = document.querySelectorAll('.shop-card.expanded');
    expandedCards.forEach(card => {
        card.classList.remove('expanded');
    });
}

function populateShopCards() {
    const container = document.querySelector('.shop-cards-grid');
    if (!container) return;
    
    // Partner laundry shops data
    const shopData = [
        {
            id: 1,
            logo: "features/homepage/find-laundry-shops/assets/images/kylierose-laundryhub-logo.png",
            name: "Kylie Rose",
            businessType: "Laundry Hub",
            tagline: "Premium Wash & Fold • Quality Care • Trusted Service",
            hours: "Open 6 AM – 5 PM",
            rating: "4.9",
            services: [
                "Wash and Fold",
                "Dry Cleaning",
                "Bulk Laundry",
                "Pickup and Delivery",
                "Pickup and Self-claim",
                "Drop Off and Delivery",
                "Rush Service"
            ],
            fullHours: [
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM",
                "Holiday hours may vary",
                "Note: Last pickup 30 minutes before closing"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 917 234 5678",
            website: "kylieroselaundry.com",
            social: "@kylieroselaundry",
            promotion: "First Time Customer: 20% OFF",
            payments: ["💳", "💰", "📱", "🏧"]
        },
        {
            id: 2,
            logo: "features/homepage/find-laundry-shops/assets/images/mdeguzman-laundryshop-logo.png",
            name: "M. De Guzman",
            businessType: "Laundry Shop",
            tagline: "Affordable • Reliable • Community Trusted",
            hours: "Open 6 AM – 5 PM",
            rating: "4.8",
            services: [
                "Wash and Fold",
                "Dry Cleaning",
                "Bulk Laundry",
                "Pickup and Delivery",
                "Pickup and Self-claim",
                "Drop Off and Delivery",
                "Rush Service"
            ],
            fullHours: [
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM",
                "Holiday hours may vary",
                "Staff assistance available all hours"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 928 765 4321",
            website: "mdguzmanlaundry.com",
            social: "@mdguzmanlaundry",
            promotion: "Family Package: 15% OFF",
            payments: ["💳", "💰", "📱", "🏧"]
        },
        {
            id: 3,
            logo: "features/homepage/find-laundry-shops/assets/images/sampauladrianne-laundryhub-logo.png",
            name: "Sam, Paull, Adrianne",
            businessType: "Laundry Hub",
            tagline: "Personalized Service • Quick Turnaround • Quality Assurance",
            hours: "Open 6 AM – 5 PM",
            rating: "4.7",
            services: [
                "Wash and Fold",
                "Dry Cleaning",
                "Bulk Laundry",
                "Pickup and Delivery",
                "Pickup and Self-claim",
                "Drop Off and Delivery",
                "Rush Service"
            ],
            fullHours: [
                "Monday - Saturday: 6:00 AM - 5:00 PM",
                "Sunday: 6:00 AM - 1:00 PM",
                "Holiday hours may vary",
                "Emergency pickup available"
            ],
            address: "Trancoville, Baguio City, Benguet 2600",
            phone: "+63 936 123 9876",
            website: "spalaundryhub.com",
            social: "@spalaundryhub",
            promotion: "Loyalty Program: Earn Points",
            payments: ["💳", "💰", "📱", "🎁"]
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
            <button class="close-btn" title="Close">×</button>
            
            <div class="shop-card-header">
                <div class="shop-logo">
                    <img src="${shop.logo}" alt="${shop.name} ${shop.businessType} Logo" onerror="this.style.display='none'; this.parentElement.textContent='🏪';">
                </div>
                <div class="shop-info">
                    <h3>${shop.name}<br>${shop.businessType}</h3>
                    <p class="shop-tagline">${shop.tagline}</p>
                </div>
            </div>
            
            <div class="shop-hours">${shop.hours}</div>
            
            <div class="shop-card-footer">
                <button class="view-details-btn">
                    View Details
                    <span>ℹ️</span>
                </button>
                <div class="shop-rating">${shop.rating}</div>
            </div>
            
            <div class="shop-expanded-content">
                <div class="expanded-section">
                    <h4>🛍️ Services Offered</h4>
                    <ul>
                        ${shop.services.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="expanded-section">
                    <h4>🕒 Operating Hours</h4>
                    <ul>
                        ${shop.fullHours.map(hours => `<li>${hours}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="expanded-section">
                    <h4>📍 Location & Contact</h4>
                    <div class="location-info">
                        <span>📌</span>
                        <span>${shop.address}</span>
                    </div>
                    <div>📞 ${shop.phone}</div>
                    <div>🌐 ${shop.website}</div>
                    <div>📱 ${shop.social}</div>
                </div>
                
                <div class="expanded-section">
                    <h4>🎉 Current Promotion</h4>
                    <div class="promotion-badge">${shop.promotion}</div>
                    
                    <h4 style="margin-top: 15px;">💳 Payment Methods</h4>
                    <div class="payment-methods">
                        ${shop.payments.map(payment => `<div class="payment-icon">${payment}</div>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Animation helpers
function animateCardExpansion(card) {
    const content = card.querySelector('.shop-expanded-content');
    if (!content) return;
    
    // Measure the height needed
    content.style.maxHeight = 'none';
    const height = content.scrollHeight;
    content.style.maxHeight = '0';
    
    // Force reflow and animate
    content.offsetHeight;
    content.style.maxHeight = height + 'px';
    
    // Reset to auto after animation
    setTimeout(() => {
        if (card.classList.contains('expanded')) {
            content.style.maxHeight = '500px';
        }
    }, 300);
}

// Utility function to add click analytics or tracking
function trackCardInteraction(shopId, action) {
    // This could be used to track user interactions for analytics
    console.log(`Shop ${shopId}: ${action}`);
}

// Export functions for potential external use
window.ShopCards = {
    expandCard,
    collapseCard,
    collapseAllCards,
    populateShopCards
};