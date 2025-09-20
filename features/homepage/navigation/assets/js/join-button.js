// Join Button - Original Inline Script Extracted

// Text change effect for join button
document.addEventListener('DOMContentLoaded', function() {
    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn) {
        joinBtn.addEventListener('mouseenter', function() {
            this.textContent = 'PARTNER WITH US!';
        });
        
        joinBtn.addEventListener('mouseleave', function() {
            this.textContent = 'JOIN US!';
        });
    }
});