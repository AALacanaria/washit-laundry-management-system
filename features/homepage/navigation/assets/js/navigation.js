// Navigation Component JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    setupMobileMenu();
    setupScrollEffect();
    setupJoinButton();
    setupSmoothScrolling();
}

function setupMobileMenu() {
    // Create mobile menu toggle if it doesn't exist
    const navContainer = document.querySelector('.nav-container');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!document.querySelector('.mobile-menu-toggle')) {
        const mobileToggle = document.createElement('div');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<span></span><span></span><span></span>';
        navContainer.appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            document.querySelector('.mobile-menu-toggle').classList.remove('active');
        });
    });
}

function setupScrollEffect() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        // Navigation is now static - removed hide/show functionality
    });
}

function setupJoinButton() {
    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn) {
        joinBtn.addEventListener('mouseenter', function() {
            this.textContent = 'SIGNUP/LOGIN';
        });
        
        joinBtn.addEventListener('mouseleave', function() {
            this.textContent = 'JOIN US!';
        });
        
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to login/signup page
            window.open('https://washit.42web.io/admin/login.php', '_blank');
        });
    }
}

function setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Highlight active navigation item based on scroll position
function highlightActiveNavItem() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && 
                window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize active nav highlighting
document.addEventListener('DOMContentLoaded', highlightActiveNavItem);