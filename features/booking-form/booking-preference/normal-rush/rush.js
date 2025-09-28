// Self-Claim Calendar for Rush Bookings
class SelfClaimCalendarRush {
    constructor() {
        this.currentDate = new Date();
        this.minClaimDate = null;
        this.allowedClaimDates = [];
        this.notificationShown = false;
    }

    initializeSelfClaimCalendar(pickupDate) {
        try {
            const pickup = pickupDate || window.selectedDate || new Date();
            const pickupDay = new Date(pickup);
            pickupDay.setHours(0, 0, 0, 0);
            
            // Rush: Self-claim available same day as pickup
            const claimDay = new Date(pickupDay);
            claimDay.setHours(0, 0, 0, 0);
            
            // Skip if Sunday (shop closed)
            if (claimDay.getDay() === 0) {
                claimDay.setDate(claimDay.getDate() + 1);
            }
            
            this.allowedClaimDates = [claimDay.getTime()];
            this.minClaimDate = claimDay;
            this.maxClaimDate = claimDay;
            
            // Always show self-claim section when calendar is initialized
            const selfClaimSection = document.getElementById('selfClaimSection');
            if (selfClaimSection) {
                selfClaimSection.classList.remove('hidden');
                selfClaimSection.style.display = '';
            }
            
            this.renderSelfClaimCalendar();
            
        } catch (error) {
            this.notifyCalendarIssue('We couldn’t prepare the rush self-claim calendar. Please refresh the page and try again.');
        }
    }

    renderSelfClaimCalendar() {
        const currentMonthElement = document.getElementById('currentMonthSelfClaim');
        const calendarGrid = document.getElementById('selfClaimCalendarGrid');
        
        if (!currentMonthElement || !calendarGrid) {
            this.notifyCalendarIssue('We couldn’t display the self-claim calendar because required elements are missing.');
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

    notifyCalendarIssue(message) {
        if (this.notificationShown) {
            return;
        }

        this.notificationShown = true;
        alert(message);
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
            <div style="text-align: center; padding: 20px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffeaa7; margin: 15px 0;">
                <h4 style="color: #856404; margin: 0 0 10px; font-size: 1.1rem;">⚡ Rush Self-claim date selected!</h4>
                <p style="margin: 0; color: #856404; font-size: 0.9rem;">
                    <strong>Same-day pickup available during shop hours (6:00 AM - 5:00 PM)</strong><br>
                    Rush processing completed - just bring your receipt!
                </p>
            </div>
        `;
        
        container.style.background = "#fffbf0";
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
            <strong>Rush Booking:</strong> Pickup & Self-Claim<br>
            📅 Same-day: ${pickupDateStr} (Rush Processing)
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

// Create global instance for rush bookings
const selfClaimCalendarRush = new SelfClaimCalendarRush();

// Global navigation functions for rush (reuse the same function names)
function previousMonthSelfClaimRush() {
    selfClaimCalendarRush.previousMonth();
}

function nextMonthSelfClaimRush() {
    selfClaimCalendarRush.nextMonth();
}

// Global initialization function for rush bookings
function initializeSelfClaimCalendarRush(pickupDate) {
    selfClaimCalendarRush.initializeSelfClaimCalendar(pickupDate);
}
