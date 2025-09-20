// Services Section Component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeServices();
});

function initializeServices() {
    setupIntersectionObserver();
    setupServiceAnimations();
    setupServiceInteractions();
    setupServiceStats();
}

function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger specific animations based on element type
                if (entry.target.classList.contains('service-item')) {
                    animateServiceItem(entry.target);
                }
                
                if (entry.target.classList.contains('service-stats')) {
                    animateStats(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe service items
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        observer.observe(item);
    });
    
    // Observe service stats
    const serviceStats = document.querySelectorAll('.service-stats');
    serviceStats.forEach(stat => {
        observer.observe(stat);
    });
    
    // Observe section title
    const servicesTitle = document.querySelector('.services h2');
    if (servicesTitle) {
        observer.observe(servicesTitle);
    }
}

function setupServiceAnimations() {
    // Add staggered animation to service items
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = 'all 0.6s ease';
        item.style.transitionDelay = `${index * 0.2}s`;
    });
}

function animateServiceItem(serviceItem) {
    serviceItem.style.opacity = '1';
    serviceItem.style.transform = 'translateY(0)';
    
    // Animate service features
    const features = serviceItem.querySelectorAll('.service-feature');
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(-20px)';
            feature.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 50);
        }, index * 100);
    });
    
    // Animate service image
    const serviceImage = serviceItem.querySelector('.service-image img');
    if (serviceImage) {
        setTimeout(() => {
            serviceImage.style.transform = 'scale(1.02)';
            setTimeout(() => {
                serviceImage.style.transform = 'scale(1)';
            }, 300);
        }, 300);
    }
}

function setupServiceInteractions() {
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        // Add hover effect for the entire service item
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.01)';
            
            // Add glow effect to service icon if it exists
            const icon = this.querySelector('.service-icon');
            if (icon) {
                icon.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.5)';
            }
            
            // Highlight service features
            const features = this.querySelectorAll('.service-feature');
            features.forEach(feature => {
                feature.style.transform = 'translateX(5px)';
            });
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            
            const icon = this.querySelector('.service-icon');
            if (icon) {
                icon.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
            }
            
            const features = this.querySelectorAll('.service-feature');
            features.forEach(feature => {
                feature.style.transform = 'translateX(0)';
            });
        });
        
        // Add click effect
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.service-cta')) {
                createRippleEffect(this, e);
            }
        });
    });
    
    // Setup CTA button interactions
    setupCTAButtons();
}

function setupCTAButtons() {
    const ctaButtons = document.querySelectorAll('.service-cta .btn');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
            
            // Create ripple effect
            createRippleEffect(this, e);
            
            // Simulate action
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
                
                // Show success notification
                showNotification('Learn more about our services!', 'success');
            }, 1000);
        });
        
        // Add hover sound effect (visual feedback)
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function setupServiceStats() {
    // Service statistics data
    const servicesData = [
        {
            selector: '.pickup-monitoring',
            stats: [
                { number: 500, label: 'Orders Tracked', suffix: '+' },
                { number: 99, label: 'Accuracy Rate', suffix: '%' },
                { number: 24, label: 'Hour Support', suffix: '/7' }
            ]
        },
        {
            selector: '.digital-booking',
            stats: [
                { number: 1000, label: 'Bookings Made', suffix: '+' },
                { number: 95, label: 'Success Rate', suffix: '%' },
                { number: 5, label: 'Avg Response', suffix: 'min' }
            ]
        },
        {
            selector: '.digital-receipt',
            stats: [
                { number: 2000, label: 'Receipts Generated', suffix: '+' },
                { number: 100, label: 'Digital Format', suffix: '%' },
                { number: 3, label: 'Seconds', suffix: 'avg' }
            ]
        }
    ];
    
    // Add stats to service items if they don't exist
    servicesData.forEach((serviceData, index) => {
        const serviceItem = document.querySelectorAll('.service-item')[index];
        if (serviceItem && !serviceItem.querySelector('.service-stats')) {
            const statsContainer = document.createElement('div');
            statsContainer.className = 'service-stats';
            
            serviceData.stats.forEach(stat => {
                const statElement = document.createElement('div');
                statElement.className = 'service-stat';
                statElement.innerHTML = `
                    <div class="number" data-target="${stat.number}">${stat.suffix ? '0' + stat.suffix : '0'}</div>
                    <div class="label">${stat.label}</div>
                `;
                statsContainer.appendChild(statElement);
            });
            
            const serviceContent = serviceItem.querySelector('.service-content');
            if (serviceContent) {
                serviceContent.appendChild(statsContainer);
            }
        }
    });
}

function animateStats(statsContainer) {
    const numbers = statsContainer.querySelectorAll('.number');
    
    numbers.forEach(number => {
        const target = parseInt(number.getAttribute('data-target'));
        const suffix = number.textContent.replace(/\d/g, '');
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        const updateNumber = () => {
            if (current < target) {
                current += increment;
                const displayValue = Math.min(Math.ceil(current), target);
                number.textContent = displayValue + suffix;
                setTimeout(updateNumber, stepTime);
            } else {
                number.textContent = target + suffix;
            }
        };
        
        // Start animation with a delay
        setTimeout(updateNumber, Math.random() * 500);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Parallax effect for service images
function setupParallaxEffect() {
    const serviceImages = document.querySelectorAll('.service-image img');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        serviceImages.forEach((img, index) => {
            const rate = scrolled * -0.1 * (index % 2 === 0 ? 1 : -1);
            img.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Initialize parallax effect
window.addEventListener('load', setupParallaxEffect);

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .service-feature {
        transition: all 0.3s ease;
    }
    
    .animate-in {
        animation-play-state: running;
    }
`;
document.head.appendChild(style);