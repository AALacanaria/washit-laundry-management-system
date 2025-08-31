// Simple service selection function
function selectService(cardElement, serviceValue) {
    
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
    
    // Capture previous and update global variable early
    const previousService = window.selectedServiceType;
    window.selectedServiceType = serviceValue;
    
    // If service changed, perform hard reset BEFORE updating indicator
    if (previousService !== serviceValue) {
        if (typeof resetScheduleOnServiceChange === 'function') {
            resetScheduleOnServiceChange();
        }
    }

    // Run unified indicator/update logic
    if (typeof updateServiceIndicator === 'function') {
        updateServiceIndicator(serviceValue);
    } else if (typeof updateStaticCalendarHeader === 'function') {
        updateStaticCalendarHeader(serviceValue);
    }
    
    // Do NOT auto-render time slots on service change; user must pick a new date first
    
    // Trigger validation
    if (hiddenInput && typeof validateSelect === 'function') {
        validateSelect(hiddenInput);
    }
    
}

// Simple reset function using CSS override
function resetServiceSelection() {
    
    // Add reset state to container - this overrides all selected styles
    const container = document.querySelector('.service-options-grid');
    if (container) {
        container.classList.add('reset-state');
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
    
    // Fully reset self-claim calendars/UI
    if (typeof resetSelfClaimCalendar === 'function') {
        resetSelfClaimCalendar();
    } else {
        const selfClaimSection = document.getElementById('selfClaimSection');
        if (selfClaimSection) selfClaimSection.classList.add('hidden');
    }
    
    // Reset calendar/service indicators
    if (typeof updateServiceIndicator === 'function') {
        updateServiceIndicator('');
    } else if (typeof updateStaticCalendarHeader === 'function') {
        updateStaticCalendarHeader('');
    }
    
}


