// Join Button - Original Inline Script Extracted

// Text change effect for join button
document.addEventListener('DOMContentLoaded', function() {
    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn) {
        // Keep the button label static to avoid overlay text on hover
        joinBtn.textContent = 'JOIN US!';
    }
});