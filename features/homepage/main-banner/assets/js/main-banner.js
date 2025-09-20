// Main Banner Component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeMainBanner();
});

function initializeMainBanner() {
    setupBannerAnimations();
    setupFloatingElements();
    setupStatCounters();
    setupParallaxEffect();
}

function setupBannerAnimations() {
    const bannerContent = document.querySelector('.banner-content');
    if (bannerContent) {
        // Add stagger animation to banner elements
        const elements = bannerContent.querySelectorAll('h1, .subtitle, .cta-button');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.3}s`;
        });
    }
}

function setupFloatingElements() {
    const banner = document.querySelector('.main-banner');
    if (!banner || document.querySelector('.floating-elements')) return;
    
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-elements';
    
    const symbols = ['🧺', '👕', '✨'];
    symbols.forEach((symbol, index) => {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.textContent = symbol;
        element.style.animationDelay = `${index * 2}s`;
        floatingContainer.appendChild(element);
    });
    
    banner.appendChild(floatingContainer);
}

function setupStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const suffix = element.textContent.replace(/[0-9]/g, '');
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 50);
}

function setupParallaxEffect() {
    const banner = document.querySelector('.main-banner');
    if (!banner) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        banner.style.transform = `translateY(${rate}px)`;
    });
}

// Banner interaction handlers
function handleCTAClick(event) {
    // Add click animation
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
    
    // Add ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: 20px;
        height: 20px;
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cta-button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleStyle);

// Bind CTA button click handler
document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', handleCTAClick);
    }
});