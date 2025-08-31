// Self-Claim Calendar for Normal Bookings
class SelfClaimCalendarNormal {
    constructor() {
        this.currentDate = new Date();
        this.minClaimDate = null;
        this.allowedClaimDates = [];
    }

    initializeSelfClaimCalendar(pickupDate) {
        try {
            const pickup = pickupDate || window.selectedDate || new Date();
            const pickupDay = new Date(pickup);
            pickupDay.setHours(0, 0, 0, 0);
            
            // Normal: Self-claim available the next 2 days after pickup
            const firstClaimDay = new Date(pickupDay);
            firstClaimDay.setDate(firstClaimDay.getDate() + 1);
            
            if (firstClaimDay.getDay() === 0) {
                firstClaimDay.setDate(firstClaimDay.getDate() + 1);
            }
            
            firstClaimDay.setHours(0, 0, 0, 0);
            this.allowedClaimDates = [firstClaimDay.getTime()];
            
            const secondClaimDay = new Date(firstClaimDay);
            secondClaimDay.setDate(secondClaimDay.getDate() + 1);
            
            if (secondClaimDay.getDay() === 0) {
                secondClaimDay.setDate(secondClaimDay.getDate() + 1);
            }
            secondClaimDay.setHours(0, 0, 0, 0);
            this.allowedClaimDates.push(secondClaimDay.getTime());
            
            this.minClaimDate = firstClaimDay;
            this.maxClaimDate = secondClaimDay;
            
            // Always show self-claim section when calendar is initialized
            const selfClaimSection = document.getElementById('selfClaimSection');
            if (selfClaimSection) {
                selfClaimSection.classList.remove('hidden');
                selfClaimSection.style.display = '';
            }
            
            this.renderSelfClaimCalendar();
            
        } catch (error) {
            console.error('Error initializing normal self-claim calendar:', error);
        }
    }

    renderSelfClaimCalendar() {
        const currentMonthElement = document.getElementById('currentMonthSelfClaim');
        const calendarGrid = document.getElementById('selfClaimCalendarGrid');
        
        if (!currentMonthElement || !calendarGrid) {
            console.error('Self-claim calendar elements not found!');
            return;
        }
        
        const monthText = this.currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
        currentMonthElement.textContent = monthText;
        
        calendarGrid.innerHTML = '';
        
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        for (let i = 0; i < 42; i++) {
            const currentCalendarDate = new Date(startDate);
            currentCalendarDate.setDate(startDate.getDate() + i);
            currentCalendarDate.setHours(0, 0, 0, 0);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentCalendarDate.getDate();
            
            this.applySelfClaimDayStyles(dayElement, currentCalendarDate);
            
            calendarGrid.appendChild(dayElement);
        }
    }

    applySelfClaimDayStyles(dayElement, currentCalendarDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDateOnly = new Date(currentCalendarDate);
        currentDateOnly.setHours(0, 0, 0, 0);
        
        if (currentCalendarDate.getMonth() !== this.currentDate.getMonth()) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Outside current month';
        }
        else if (currentCalendarDate.getDay() === 0) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Shop closed on Sundays';
        }
        else if (currentDateOnly < today) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Past date unavailable';
        }
        else if (this.allowedClaimDates.includes(currentDateOnly.getTime())) {
            dayElement.classList.add('available');
            dayElement.style.cursor = 'pointer';
            dayElement.addEventListener('click', () => {
                this.selectSelfClaimDate(currentCalendarDate);
            });
        }
        else {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Not available for self-claim';
        }
        
        if (currentCalendarDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
    }

    selectSelfClaimDate(date) {
        window.selfClaimDate = new Date(date);
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        event.target.classList.add('selected');
        
        this.updateTimeSlots();
        this.updateServiceDescription();
    }

    updateTimeSlots() {
        const container = document.getElementById('selfClaimTimeSlots');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6; margin: 15px 0;">
                <h4 style="color: #495057; margin: 0 0 10px; font-size: 1.1rem;">✅ Self-claim date selected!</h4>
                <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
                    <strong>Come anytime during shop hours (6:00 AM - 5:00 PM)</strong><br>
                    No appointment needed - just bring your receipt!
                </p>
            </div>
        `;
        
        container.style.background = "#fff6f6";
        container.style.borderRadius = "8px";
        container.style.padding = "15px";
        container.style.marginTop = "10px";
    }

    updateServiceDescription() {
        const description = document.getElementById('serviceDescription');
        if (!description || !window.selectedDate || !window.selfClaimDate) return;
        
        const pickupDateStr = window.selectedDate.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric'
        });
        
        const claimDateStr = window.selfClaimDate.toLocaleDateString('en-PH', {
            month: 'short', 
            day: 'numeric'
        });
        
        description.innerHTML = `
            <strong>Normal Booking:</strong> Pickup & Self-Claim<br>
            📅 Pickup: ${pickupDateStr} | Self-claim: ${claimDateStr}
        `;
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderSelfClaimCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderSelfClaimCalendar();
    }

    reset() {
        // Clear all state
        this.allowedClaimDates = [];
        this.minClaimDate = null;
        this.maxClaimDate = null;
        window.selfClaimDate = null;
        
        // Clear visual selections
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Clear time slots
        const container = document.getElementById('selfClaimTimeSlots');
        if (container) {
            container.innerHTML = '';
        }
        
        // Hide self-claim section
        const selfClaimSection = document.getElementById('selfClaimSection');
        if (selfClaimSection) {
            selfClaimSection.classList.add('hidden');
            selfClaimSection.style.display = 'none';
        }
        
        // Reset service description
        const description = document.getElementById('serviceDescription');
        if (description) {
            description.innerHTML = '';
        }
    }
}

// Create global instance for normal bookings
const selfClaimCalendarNormal = new SelfClaimCalendarNormal();

// Global navigation functions
function previousMonthSelfClaim() {
    selfClaimCalendarNormal.previousMonth();
}

function nextMonthSelfClaim() {
    selfClaimCalendarNormal.nextMonth();
}

// Global reset function
function resetSelfClaimCalendar() {
    // Reset both calendars
    selfClaimCalendarNormal.reset();
    if (typeof selfClaimCalendarRush !== 'undefined') {
        selfClaimCalendarRush.reset();
    }
}

// Global initialization function for both booking types
function initializeSelfClaimCalendar(pickupDate, bookingType) {
    // Don't reset here - let the service selection handle it
    
    if (bookingType === 'normal') {
        selfClaimCalendarNormal.initializeSelfClaimCalendar(pickupDate);
    } else if (bookingType === 'rush') {
        // Call rush calendar if available
        if (typeof selfClaimCalendarRush !== 'undefined') {
            selfClaimCalendarRush.initializeSelfClaimCalendar(pickupDate);
        }
    }
}
