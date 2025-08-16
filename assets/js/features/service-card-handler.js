// Simple service selection function
function selectService(cardElement, serviceValue) {
    console.log('Service card clicked:', serviceValue);
    
    // Remove reset state from container
    const container = document.querySelector('.service-options-grid');
    if (container) {
        container.classList.remove('reset-state');
    }
    
    // Remove selected class from all cards
    const allCards = document.querySelectorAll('.service-card');
    allCards.forEach(card => card.classList.remove('selected'));
    
    // Add selected class to clicked card
    cardElement.classList.add('selected');
    
    // Update hidden input
    const hiddenInput = document.getElementById('serviceOption');
    if (hiddenInput) {
        hiddenInput.value = serviceValue;
    }
    
    // Update global variable
    window.selectedServiceType = serviceValue;
    
    // Update static calendar header
    if (typeof updateStaticCalendarHeader === 'function') {
        updateStaticCalendarHeader(serviceValue);
    }
    
    // Re-render time slots
    if (typeof renderTimeSlots === 'function') {
        renderTimeSlots();
    }
    
    // Trigger validation
    if (hiddenInput && typeof validateSelect === 'function') {
        validateSelect(hiddenInput);
    }
    
    console.log('Service selection complete. Card classes:', cardElement.className);
}

// Simple reset function using CSS override
function resetServiceSelection() {
    console.log('Resetting service selection - Simple approach');
    
    // Add reset state to container - this overrides all selected styles
    const container = document.querySelector('.service-options-grid');
    if (container) {
        container.classList.add('reset-state');
        console.log('Added reset-state class to container');
    }
    
    // Clear hidden input
    const hiddenInput = document.getElementById('serviceOption');
    if (hiddenInput) {
        hiddenInput.value = '';
        hiddenInput.classList.remove('input-valid', 'input-invalid');
    }
    
    // Clear global variable
    window.selectedServiceType = '';
    
    // Hide service indicator
    const indicator = document.getElementById('serviceOptionIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
    
    // Hide self-claim section
    const selfClaimSection = document.getElementById('selfClaimSection');
    if (selfClaimSection) {
        selfClaimSection.classList.add('hidden');
    }
    
    // Reset calendar header to default
    if (typeof updateStaticCalendarHeader === 'function') {
        updateStaticCalendarHeader('');
    }
    
    console.log('Service selection reset complete');
}


