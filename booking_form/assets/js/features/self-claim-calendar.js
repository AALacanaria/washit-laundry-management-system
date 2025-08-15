// Self-Claim Calendar Management
class SelfClaimCalendar {
    constructor() {
        this.currentDate = new Date();
        this.minClaimDate = null;
    }

    // Initialize self-claim calendar after pickup is scheduled
    initializeSelfClaimCalendar(pickupDate, bookingType) {
        console.log('Initializing self-claim calendar for pickup:', pickupDate, 'booking type:', bookingType);
        
        // Validate inputs
        if (!pickupDate || !bookingType) {
            console.error('Missing required parameters for self-claim calendar:', { pickupDate, bookingType });
            console.log('Using fallback: normal booking with 2.5 days processing from today');
            
            // Use today + normal processing as fallback
            const today = new Date();
            this.currentDate = new Date(today);
            // Ensure bookingType is set on the instance for downstream logic
            this.bookingType = window.bookingType || 'normal';
            this.minClaimDate = new Date(today);
            this.minClaimDate.setDate(this.minClaimDate.getDate() + 2); // 2 days processing (normal)
            this.minClaimDate.setHours(this.minClaimDate.getHours() + 12); // +12 hours for .5 day
            
            // Set max date for fallback (normal: 3.5 days window)
            this.maxClaimDate = new Date(today);
            this.maxClaimDate.setDate(this.maxClaimDate.getDate() + 4); // 3.5 days rounded up
            
            console.log('Fallback dates:', { currentDate: this.currentDate, minClaimDate: this.minClaimDate, maxClaimDate: this.maxClaimDate });
            
            // Still try to render with fallback data
            const selfClaimSection = document.getElementById('selfClaimSection');
            if (selfClaimSection) {
                selfClaimSection.classList.remove('hidden');
                setTimeout(() => {
                    this.renderSelfClaimCalendar();
                }, 50);
            }
            updateScheduleTitle('claim');
            this.renderSelfClaimCalendar();
            return;
        }
        
        try {
            // Guard: if this instance was already initialized for 'rush' and
            // the incoming call does not explicitly request 'rush', don't overwrite
            // the existing rush configuration. This avoids stray fallback/normal
            // initializations from widening a rush-only window.
            if (this.bookingType === 'rush' && bookingType !== 'rush' && window.bookingType !== 'rush') {
                console.log('initializeSelfClaimCalendar: skipping re-init because existing bookingType is rush and incoming is not rush');
                // Still ensure calendar is rendered with current state
                this.renderSelfClaimCalendar();
                return;
            }
            // Resolve effective booking type carefully:
            // - Prefer 'rush' if any source (param, window, or previous instance state) indicates rush.
            // - Otherwise use 'normal'. This prevents a later 'normal' initialization from
            //   overwriting a valid 'rush' initialization that was already applied.
            const paramType = bookingType || window.bookingType || null;
            const prevType = this.bookingType || null;
            if (paramType === 'rush' || window.bookingType === 'rush' || prevType === 'rush') {
                this.bookingType = 'rush';
            } else {
                this.bookingType = 'normal';
            }
            // Calculate minimum claim date based on processing period
            // For pickup and self-claim: processing starts from today, not pickup date
            const today = new Date();
            this.minClaimDate = new Date(today);
            const processingDays = this.bookingType === 'rush' ? 1.5 : 2.5;
            
            // Calculate maximum claim date (limited window for self-claim)
            this.maxClaimDate = new Date(today);
            let maxWindowDays = null;
            if (bookingType === 'rush') {
                // For rush bookings, only make the exact processing completion date available (1.5 days)
                // We'll set maxClaimDate to equal minClaimDate after applying processing offset below.
                maxWindowDays = 1.5;
            } else {
                // For normal bookings keep the existing wider pickup window (3.5 days)
                maxWindowDays = 3.5;
                this.maxClaimDate.setDate(this.maxClaimDate.getDate() + Math.ceil(maxWindowDays));
            }

            console.log('Today:', today);
            console.log('Processing days for', bookingType, ':', processingDays);
            console.log('Max window days:', maxWindowDays);
            console.log('Note: Self-claim availability is calculated from TODAY, not pickup date');
            
            // Add processing days from today (handle half-days)
            this.minClaimDate.setDate(this.minClaimDate.getDate() + Math.floor(processingDays));
            if (processingDays % 1 !== 0) {
                this.minClaimDate.setHours(this.minClaimDate.getHours() + 12);
            }

            // For rush bookings, we want only the single completion day to be selectable.
            // If the calculated minClaimDate falls on a Sunday (shop closed), shift to Monday.
            if (bookingType === 'rush') {
                if (this.minClaimDate.getDay() === 0) {
                    console.log('Min claim date falls on Sunday; shifting to Monday');
                    this.minClaimDate.setDate(this.minClaimDate.getDate() + 1);
                }
                // Make the max claim date equal to the min claim date so only that day is available
                this.maxClaimDate = new Date(this.minClaimDate);
            }
            
            console.log('Calculated minimum claim date:', this.minClaimDate);
            console.log('Calculated maximum claim date:', this.maxClaimDate);
            console.log('Self-claim available from:', this.minClaimDate.toDateString(), 'to', this.maxClaimDate.toDateString());
            
            // Set current month to minimum claim date for better UX
            this.currentDate = new Date(this.minClaimDate);
            window.currentSelfClaimDate = this.currentDate;

            // Compute earliest self-claim time based on working hours algorithm (spec)
            // Shop open hours: 06:00 - 17:00, closed Sundays. Cutoff at 12:00.
            try {
                // Helper utilities
                const isOpenDay = (d) => d.getDay() !== 0; // skip Sunday; holidays not configured here
                const toStartOfDay = (d) => { const n = new Date(d); n.setHours(0,0,0,0); return n; };
                const nextOpenDayAtStart = (d) => {
                    const x = new Date(d);
                    x.setHours(6,0,0,0);
                    while (!isOpenDay(x)) {
                        x.setDate(x.getDate() + 1);
                        x.setHours(6,0,0,0);
                    }
                    return x;
                };

                // Use pickupDate param if provided, otherwise fall back to now
                const P = (pickupDate && pickupDate instanceof Date) ? new Date(pickupDate) : new Date();

                // Determine processing start S per cutoff rule
                const cutoffHour = 12;
                let S = new Date(P);
                const pickupHour = S.getHours();
                if (pickupHour >= cutoffHour) {
                    // Start next open day at 06:00
                    S = nextOpenDayAtStart(S);
                } else {
                    // If pickup day is closed (Sunday), shift to next open day at 06:00
                    if (!isOpenDay(S)) {
                        S = nextOpenDayAtStart(S);
                    }
                    // Ensure S is at least 06:00
                    if (S.getHours() < 6) S.setHours(6,0,0,0);
                    // If pickup time is after 17:00, move to next open day at 06:00
                    if (S.getHours() >= 17) S = nextOpenDayAtStart(S);
                }

                // Remaining processing in working hours: 1.5 working days = 16.5 hours
                let remainingHours = 16.5;
                let current = new Date(S);
                let earliestClaim = null;

                while (remainingHours > 0) {
                    // If current is a closed day, move to next open day at 06:00
                    if (!isOpenDay(current)) {
                        current = nextOpenDayAtStart(current);
                        continue;
                    }

                    // Ensure current is within open hours
                    if (current.getHours() < 6) current.setHours(6,0,0,0);
                    if (current.getHours() >= 17) {
                        current = nextOpenDayAtStart(current);
                        continue;
                    }

                    // Compute available hours today from current time until 17:00
                    const endOfToday = new Date(current);
                    endOfToday.setHours(17,0,0,0);
                    const availableToday = (endOfToday.getTime() - current.getTime()) / (1000 * 60 * 60);

                    if (remainingHours <= availableToday) {
                        // Earliest claim is within current day
                        earliestClaim = new Date(current.getTime() + remainingHours * 60 * 60 * 1000);
                        remainingHours = 0;
                        break;
                    } else {
                        // Consume today's available hours and move to next open day at 06:00
                        remainingHours -= availableToday;
                        current = nextOpenDayAtStart(current);
                    }
                }

                if (!earliestClaim) {
                    // Fallback: if loop somehow didn't set earliest, set to next open day at 06:00
                    earliestClaim = nextOpenDayAtStart(new Date());
                }

                this.minClaimDateTime = new Date(earliestClaim);
                this.minClaimDate = toStartOfDay(this.minClaimDateTime);

                console.log('Computed minClaimDateTime (working-hours):', this.minClaimDateTime);
            } catch (err) {
                console.warn('Failed to compute earliest claim via working-hours algorithm:', err);
                this.minClaimDateTime = new Date();
                this.minClaimDate = toStartOfDay(this.minClaimDateTime);
            }
            
            console.log('Set current date for calendar to:', this.currentDate);
            
            // Show self-claim section
            const selfClaimSection = document.getElementById('selfClaimSection');
            if (selfClaimSection) {
                selfClaimSection.classList.remove('hidden');
                
                // Ensure the section is visible before rendering
                setTimeout(() => {
                    this.renderSelfClaimCalendar();
                }, 50);
            }
            
            // Update title
            updateScheduleTitle('claim');
            
            // Render self-claim calendar immediately
            this.renderSelfClaimCalendar();
            
            // Force multiple re-renders to ensure display
            setTimeout(() => {
                this.renderSelfClaimCalendar();
                console.log('Self-claim calendar re-rendered after 100ms');
            }, 100);
            
            setTimeout(() => {
                this.renderSelfClaimCalendar();
                console.log('Self-claim calendar re-rendered after 200ms');
            }, 200);
            // Auto-select earliest allowed date so time slots are visible immediately
            try {
                if (Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0) {
                    const earliestMs = this.allowedClaimDates[0];
                    const earliestDate = new Date(earliestMs);
                    earliestDate.setHours(0,0,0,0);
                    setTimeout(() => {
                        // Use instance method without an event to select the date and render slots
                        this.selectSelfClaimDate(earliestDate);
                    }, 300);
                }
            } catch (err) {
                console.warn('Auto-select earliest allowed date failed:', err);
            }
        } catch (error) {
            console.error('Exception in initializeSelfClaimCalendar:', error);
            const calendarGrid = document.getElementById('selfClaimCalendarGrid');
            if (calendarGrid) {
                calendarGrid.innerHTML = `<div class="calendar-error">Unable to render calendar: ${error && error.message ? error.message : 'Unknown error'}</div>`;
            }
        }
        
    }

    // Render self-claim calendar
    renderSelfClaimCalendar() {
        console.log('=== RENDERING SELF-CLAIM CALENDAR ===');
        console.log('Current date:', this.currentDate);
        console.log('Min claim date:', this.minClaimDate);
        
        const currentMonthElement = document.getElementById('currentMonthSelfClaim');
        const calendarGrid = document.getElementById('selfClaimCalendarGrid');
        
        console.log('Elements found:', { 
            currentMonthElement: !!currentMonthElement, 
            calendarGrid: !!calendarGrid,
            currentMonthElementExists: currentMonthElement !== null,
            calendarGridExists: calendarGrid !== null
        });
        
        if (!currentMonthElement || !calendarGrid) {
            console.error('CRITICAL: Self-claim calendar elements not found!');
            console.error('currentMonthElement:', currentMonthElement);
            console.error('calendarGrid:', calendarGrid);
            
            // Try to find elements with different selectors
            const allElements = document.querySelectorAll('[id*="selfClaim"]');
            console.log('All elements with selfClaim in ID:', allElements);
            
            return false;
        }
        
        try {
            console.log('Updating month display...');
            // Update month display
            const monthText = this.currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            console.log('Setting month text to:', monthText);
            currentMonthElement.textContent = monthText;
            
            console.log('Clearing existing calendar...');
            // Clear existing calendar
            calendarGrid.innerHTML = '';
            
            console.log('Creating calendar structure...');
            // Create calendar days
            const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            console.log('Calendar date range:', { firstDay, lastDay, startDate });
            
            // Add day headers
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            console.log('Adding day headers...');
            dayHeaders.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
            
            console.log('Day headers added, total children:', calendarGrid.children.length);
            
            // Add calendar days
            console.log('Adding calendar days...');
            for (let i = 0; i < 42; i++) {
                const currentCalendarDate = new Date(startDate);
                currentCalendarDate.setDate(startDate.getDate() + i);
                
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = currentCalendarDate.getDate();
                
                // Apply styling logic here...
                this.applySelfClaimDayStyles(dayElement, currentCalendarDate);
                
                calendarGrid.appendChild(dayElement);
            }
            
            console.log('Calendar rendering complete! Total children:', calendarGrid.children.length);
            return true;
            
        } catch (error) {
            console.error('ERROR in renderSelfClaimCalendar:', error);
            console.error('Error stack:', error.stack);
            return false;
        }
    }
    
    // Separate method for applying day styles
    applySelfClaimDayStyles(dayElement, currentCalendarDate) {
        // Get today's date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const currentDateOnly = new Date(currentCalendarDate);
        currentDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day
        
        // Determine effective booking type (prefer window bookingType for current user action)
        const effectiveBookingType = window.bookingType || this.bookingType || 'normal';

        // If effective type is rush, prefer the deterministic allowedClaimDates computed at init.
        // Do not overwrite an already-computed multi-day list (earliest partial day + next working day).
        if (effectiveBookingType === 'rush') {
            try {
                if (!Array.isArray(this.allowedClaimDates) || this.allowedClaimDates.length === 0) {
                    // As a defensive fallback, compute a minimal allowed date list (single completion day)
                    const rushDate = new Date();
                    rushDate.setDate(rushDate.getDate() + 1);
                    rushDate.setHours(rushDate.getHours() + 12);
                    if (rushDate.getDay() === 0) {
                        rushDate.setDate(rushDate.getDate() + 1);
                    }
                    const norm = new Date(rushDate);
                    norm.setHours(0,0,0,0);
                    this.allowedClaimDates = [norm.getTime()];
                    this.minClaimDate = new Date(norm);
                    this.maxClaimDate = new Date(norm);
                    console.log('Enforced fallback rush allowedClaimDates:', this.allowedClaimDates.map(t => new Date(t).toDateString()));
                } else {
                    // Keep the precomputed allowedClaimDates (earliest partial + next working day)
                    // Ensure min/max reflect the allowed range
                    const minMs = Math.min(...this.allowedClaimDates);
                    const maxMs = Math.max(...this.allowedClaimDates);
                    this.minClaimDate = new Date(minMs);
                    this.maxClaimDate = new Date(maxMs);
                }
            } catch (err) {
                console.warn('Failed to enforce rush allowedClaimDates:', err);
            }
        }

        // Check shop schedule (Monday-Saturday, closed Sundays)
        const dayOfWeek = currentCalendarDate.getDay();
        const isSunday = dayOfWeek === 0;
        
        // Debug information
        const debugInfo = {
            date: currentCalendarDate.toDateString(),
            today: today.toDateString(),
            minClaimDate: this.minClaimDate ? this.minClaimDate.toDateString() : 'not set',
            dayOfWeek,
            isSunday,
            isCurrentMonth: currentCalendarDate.getMonth() === this.currentDate.getMonth(),
            isPastDate: currentDateOnly < today,
            isBeforeMinClaim: this.minClaimDate ? currentCalendarDate < this.minClaimDate : false
        };
        
        // Log for specific dates to understand the logic
        if (currentCalendarDate.getDate() === 20 || currentCalendarDate.getDate() === 25) {
            console.log('Date analysis for', currentCalendarDate.getDate(), ':', debugInfo);
        }
        
    // Reset any previous availability classes to ensure idempotent styling
    dayElement.classList.remove('available', 'unavailable');

    // Check if date is in current month
        if (currentCalendarDate.getMonth() !== this.currentDate.getMonth()) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Outside current month';
        }
        // Check if it's Sunday (shop closed)
        else if (isSunday) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Shop closed on Sundays';
        }
        // Check if date is before today (past dates)
        else if (currentDateOnly < today) {
            dayElement.classList.add('unavailable');
            dayElement.style.cursor = 'not-allowed';
            dayElement.title = 'Past date unavailable';
        }
        // Check if date is before minimum claim date or after maximum claim date
        else if (this.minClaimDate && this.maxClaimDate) {
            const minClaimDateOnly = new Date(this.minClaimDate);
            minClaimDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day
            
            const maxClaimDateOnly = new Date(this.maxClaimDate);
            maxClaimDateOnly.setHours(0, 0, 0, 0); // Reset time to start of day
            // Diagnostic logging for min/max and current date (show effective booking type and allowed dates)
            console.log('Availability check for', currentCalendarDate.toDateString(), 'min:', minClaimDateOnly.toDateString(), 'max:', maxClaimDateOnly.toDateString(), 'effectiveBookingType:', (window.bookingType || this.bookingType || 'normal'), 'allowedDates(ms):', this.allowedClaimDates);

            // If we computed an explicit allowedClaimDates list, prefer it — it's deterministic and skips time-of-day pitfalls
            if (Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0) {
                const currentMs = currentDateOnly.getTime();
                const allowed = this.allowedClaimDates.includes(currentMs);
                if (allowed) {
                    dayElement.classList.add('available');
                    dayElement.addEventListener('click', () => {
                        this.selectSelfClaimDate(currentCalendarDate);
                    });
                } else {
                    dayElement.classList.add('unavailable');
                    dayElement.style.cursor = 'not-allowed';
                    // Provide a helpful title
                    if (currentMs < minClaimDateOnly.getTime()) {
                        dayElement.title = 'Items not ready yet';
                    } else {
                        dayElement.title = 'Outside pickup window';
                    }
                }
            } else {
                // Fallback behavior using min/max date checks (older logic)
                if (currentDateOnly < minClaimDateOnly) {
                    dayElement.classList.add('unavailable');
                    dayElement.style.cursor = 'not-allowed';
                    dayElement.title = 'Items not ready yet';
                } else if (currentDateOnly > maxClaimDateOnly) {
                    dayElement.classList.add('unavailable');
                    dayElement.style.cursor = 'not-allowed';
                    dayElement.title = 'Outside pickup window';
                } else {
                    // This date should be available
                    dayElement.classList.add('available');
                    dayElement.addEventListener('click', () => {
                        this.selectSelfClaimDate(currentCalendarDate);
                    });
                }
            }
        }
        
        // Highlight today
        if (currentCalendarDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Highlight selected date
        if (selfClaimDate && currentCalendarDate.toDateString() === selfClaimDate.toDateString()) {
            dayElement.classList.add('selected');
        }
    }

    // Select self-claim date
    selectSelfClaimDate(date, event) {
        // Update global variables
        selfClaimDate = date;
        window.selfClaimDate = date;
        
        console.log('Self-claim date selected:', date);
        
        // Update visual selection
        document.querySelectorAll('#selfClaimCalendarGrid .calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        // Find the clicked calendar day element safely
        let clickedDay = null;
        if (event && event.target) {
            clickedDay = event.target.closest('.calendar-day');
        }
        if (!clickedDay) {
            // Find by matching the date numerically within the current month
            const dateOnly = new Date(date);
            dateOnly.setHours(0,0,0,0);
            document.querySelectorAll('#selfClaimCalendarGrid .calendar-day').forEach(dayEl => {
                const dayNum = parseInt(dayEl.textContent, 10);
                const candidate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), dayNum);
                candidate.setHours(0,0,0,0);
                if (candidate.getTime() === dateOnly.getTime()) {
                    clickedDay = dayEl;
                }
            });
        }
        if (clickedDay) {
            clickedDay.classList.add('selected');
        }
        
        // Render self-claim time slots
        this.renderSelfClaimTimeSlots(date);
    }

    // Render self-claim time slots
    renderSelfClaimTimeSlots(selectedDate) {
        const container = document.getElementById('selfClaimTimeSlots');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Add title (matching main calendar format)
        const timeSlotsTitle = document.createElement("h4");
        timeSlotsTitle.style.cssText = "text-align: center; margin: 16px 0 8px; color: #333; font-size: 1.1rem; font-weight: 600;";
        timeSlotsTitle.textContent = `Available Self-Claim Time`;
        container.appendChild(timeSlotsTitle);
        
        // Add shop hours info (matching main calendar format)
        const shopHoursInfo = document.createElement("div");
        shopHoursInfo.style.textAlign = "center";
        shopHoursInfo.style.fontSize = "0.95rem";
        shopHoursInfo.style.color = "#666";
        shopHoursInfo.style.marginBottom = "12px";
        shopHoursInfo.textContent = "Shop Hours: 6:00 AM - 5:00 PM";
        container.appendChild(shopHoursInfo);
        
        // Add background styling to match main calendar time slots container
        container.style.background = "#fff6f6";
        container.style.borderRadius = "8px";
        container.style.padding = "15px";
        container.style.marginTop = "10px";
        
        // Create wrapper to match main calendar structure
        const wrapper = document.createElement('div');
        wrapper.className = 'time-slots-wrapper';
        
        // Create AM and PM groups
        const amGroup = document.createElement('div');
        amGroup.className = 'time-slots-group am-group';
        
        const pmGroup = document.createElement('div');
        pmGroup.className = 'time-slots-group pm-group';
        
        // Sort time slots and populate AM/PM groups
        const entries = Object.entries(SELF_CLAIM_TIME_SLOTS).sort((a, b) => a[0].localeCompare(b[0]));

        // Determine if we need to filter slots by ready time (earliest allowed day)
    const selectedDayOnly = new Date(selectedDate);
        selectedDayOnly.setHours(0,0,0,0);
    const earliestAllowedMs = Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0 ? this.allowedClaimDates[0] : null;
    const lastAllowedMs = Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0 ? this.allowedClaimDates[this.allowedClaimDates.length - 1] : null;
    const filterByReadyTime = earliestAllowedMs && selectedDayOnly.getTime() === earliestAllowedMs;
    const filterByEndTime = lastAllowedMs && selectedDayOnly.getTime() === lastAllowedMs;

    // Diagnostic logs to help debug disabled slots
    console.log('renderSelfClaimTimeSlots: selectedDayOnly=', selectedDayOnly.toDateString(), 'filterByReadyTime=', filterByReadyTime, 'filterByEndTime=', filterByEndTime);
    console.log('minClaimDateTime=', this.minClaimDateTime, 'endClaimDateTime=', this.endClaimDateTime, 'earliestAllowedMs=', earliestAllowedMs, 'lastAllowedMs=', lastAllowedMs);

        entries.forEach(([time, slot]) => {
            // If filtering by ready time, skip slots that occur before minClaimDateTime
            if (filterByReadyTime && this.minClaimDateTime) {
                const [h, m] = time.split(':').map(Number);
                const slotDate = new Date(selectedDayOnly);
                slotDate.setHours(h, m, 0, 0);
                if (slotDate.getTime() < this.minClaimDateTime.getTime()) {
                    console.log('Slot', slot.label, 'on', selectedDayOnly.toDateString(), 'DISABLED: before minClaimDateTime', slotDate, '<', this.minClaimDateTime);
                    // Create a disabled-looking slot instead of showing it as selectable
                    const disabledSlot = document.createElement('div');
                    disabledSlot.className = 'time-slot unavailable';
                    disabledSlot.innerHTML = `<div class="time-label">${slot.label}</div>`;
                    const hour = parseInt(time.split(':')[0], 10);
                    if (hour < 12) amGroup.appendChild(disabledSlot); else pmGroup.appendChild(disabledSlot);
                    return; // skip adding a selectable slot
                }
            }

            // If on the last allowed day, also disable slots that are after endClaimDateTime
            if (filterByEndTime && this.endClaimDateTime) {
                const [eh, em] = time.split(':').map(Number);
                const endSlotDate = new Date(selectedDayOnly);
                endSlotDate.setHours(eh, em, 0, 0);
                if (endSlotDate.getTime() > this.endClaimDateTime.getTime()) {
                    console.log('Slot', slot.label, 'on', selectedDayOnly.toDateString(), 'DISABLED: after endClaimDateTime', endSlotDate, '>', this.endClaimDateTime);
                    const disabledSlot = document.createElement('div');
                    disabledSlot.className = 'time-slot unavailable';
                    disabledSlot.innerHTML = `<div class="time-label">${slot.label}</div>`;
                    const hour = parseInt(time.split(':')[0], 10);
                    if (hour < 12) amGroup.appendChild(disabledSlot); else pmGroup.appendChild(disabledSlot);
                    return; // skip adding a selectable slot
                }
            }

            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.dataset.time = time;
            
            // Use simplified structure without slot counts for self-claim
            slotElement.innerHTML = `
                <div class="time-label">${slot.label}</div>
            `;
            
            slotElement.addEventListener('click', (evt) => {
                this.selectSelfClaimTime(time, slot.label, evt);
            });
            
            // Highlight selected time
            if (selfClaimTime === time) {
                slotElement.classList.add('selected');
            }
            
            // Group by AM/PM
            const hour = parseInt(time.split(':')[0], 10);
            if (hour < 12) {
                amGroup.appendChild(slotElement);
            } else {
                pmGroup.appendChild(slotElement);
            }
        });
        
        // Add groups with dividers (same as main calendar)
        this.addSelfClaimTimeSlotGroup(wrapper, amGroup, "AM");
        this.addSelfClaimTimeSlotGroup(wrapper, pmGroup, "PM");
        
        container.appendChild(wrapper);
    }

    // Add time slot group with divider (matching main calendar method)
    addSelfClaimTimeSlotGroup(wrapper, group, label) {
        const divider = document.createElement("div");
        divider.className = "am-pm-divider";
        divider.innerHTML = `<span>${label}</span>`;
        wrapper.appendChild(divider);
        
        if (group.children.length > 0) {
            wrapper.appendChild(group);
        } else {
            const noSlots = document.createElement("div");
            noSlots.className = "time-slots-note";
            noSlots.textContent = `No ${label} slots available`;
            wrapper.appendChild(noSlots);
        }
    }

    // Select self-claim time
    selectSelfClaimTime(time, label, event) {
        // Update global variables
        selfClaimTime = time;
        window.selfClaimTime = time;
        
        console.log('Self-claim time selected:', time, label);
        
        // Update visual selection
        document.querySelectorAll('#selfClaimTimeSlots .time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        // If event is provided, use it to find the clicked slot; otherwise, try to find by data-time
        let clickedSlot = null;
        if (event && event.target) {
            clickedSlot = event.target.closest('.time-slot');
        }
        if (!clickedSlot) {
            clickedSlot = document.querySelector(`#selfClaimTimeSlots .time-slot[data-time="${time}"]`);
        }
        if (clickedSlot) {
            clickedSlot.classList.add('selected');
        }
        
        // Update service description to show both pickup and claim times
        this.updateServiceDescriptionWithTimes();
        
        // Validate and scroll to next section
        setTimeout(() => {
            if (typeof validateDateTimeVisual === 'function') {
                validateDateTimeVisual();
            }
        }, 500);
    }

    // Update service description with scheduled times
    updateServiceDescriptionWithTimes() {
        const description = document.getElementById('serviceDescription');
        if (!description) return;
        
        const currentBookingType = window.bookingType || bookingType;
        const deliveryPeriod = currentBookingType === 'rush' ? '1.5 days' : '2-3 days';
        
        const pickupDateStr = selectedDate ? selectedDate.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric'
        }) : 'Not selected';
        
        const claimDateStr = selfClaimDate ? selfClaimDate.toLocaleDateString('en-PH', {
            month: 'short', 
            day: 'numeric'
        }) : 'Not selected';
        
        const pickupTimeStr = selectedTime ? TIME_SLOTS[selectedTime]?.label || selectedTime : 'Not selected';
        const claimTimeStr = selfClaimTime ? SELF_CLAIM_TIME_SLOTS[selfClaimTime]?.label || selfClaimTime : 'Not selected';
        
        description.innerHTML = `
            <strong>🏪 Pickup and Self-Claim</strong><br>
            <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <div style="margin-bottom: 8px;">
                    <strong>📦 Pickup:</strong> ${pickupDateStr} at ${pickupTimeStr}
                </div>
                <div>
                    <strong>🏪 Self-Claim:</strong> ${claimDateStr} at ${claimTimeStr}
                </div>
            </div>
            <em style="color: #6c757d; font-size: 0.9rem;">Processing period: ${deliveryPeriod}</em>
        `;
    }

    // Navigation methods
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        window.currentSelfClaimDate = this.currentDate;
        this.renderSelfClaimCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        window.currentSelfClaimDate = this.currentDate;
        this.renderSelfClaimCalendar();
    }

    // Reset self-claim scheduling
    resetSelfClaim() {
        selfClaimDate = null;
        selfClaimTime = null;
        window.selfClaimDate = null;
        window.selfClaimTime = null;
        
        const selfClaimSection = document.getElementById('selfClaimSection');
        if (selfClaimSection) {
            selfClaimSection.classList.add('hidden');
        }
        
        updateScheduleTitle('default');
    }
}

// Create global instance
const selfClaimCalendar = new SelfClaimCalendar();

// Global navigation functions
function previousMonthSelfClaim() {
    selfClaimCalendar.previousMonth();
}

function nextMonthSelfClaim() {
    selfClaimCalendar.nextMonth();
}

// Simpler global function
function initializeSelfClaimCalendar(pickupDate, bookingType) {
    console.log('=== SIMPLE INITIALIZATION ===');
    console.log('Params:', { pickupDate, bookingType });

    // Ensure UI elements exist and show a preliminary month header to avoid 'Loading...'
    const selfClaimSection = document.getElementById('selfClaimSection');
    const currentMonthElement = document.getElementById('currentMonthSelfClaim');
    const calendarGrid = document.getElementById('selfClaimCalendarGrid');

    if (selfClaimSection) {
        selfClaimSection.classList.remove('hidden');
    }

    // Immediately set a sensible month header so the header doesn't stay 'Loading...'
    try {
        const baseDate = (pickupDate && pickupDate instanceof Date) ? pickupDate : new Date();
        if (currentMonthElement && baseDate) {
            currentMonthElement.textContent = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    } catch (err) {
        console.warn('Failed to set currentMonthSelfClaim header:', err);
    }

    // Defensive init: call instance initializer inside try/catch and render result or a friendly message
    try {
        if (typeof selfClaimCalendar !== 'undefined' && selfClaimCalendar) {
            console.log('Using global selfClaimCalendar instance');
            selfClaimCalendar.initializeSelfClaimCalendar(pickupDate, bookingType);
        } else {
            console.log('Creating new instance');
            const newCalendar = new SelfClaimCalendar();
            newCalendar.initializeSelfClaimCalendar(pickupDate, bookingType);
        }
    } catch (error) {
        console.error('Error initializing self-claim calendar:', error);
        if (calendarGrid) {
            calendarGrid.innerHTML = '<div class="calendar-error">Unable to load calendar. Please try again.</div>';
        }
    }
}

// Test function to manually trigger calendar rendering
function testSelfClaimCalendar() {
    console.log('=== MANUAL TEST OF SELF-CLAIM CALENDAR ===');
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3); // 3 days from now
    
    if (selfClaimCalendar) {
        selfClaimCalendar.initializeSelfClaimCalendar(testDate, 'normal');
    } else {
        console.error('selfClaimCalendar not available');
    }
}

// Make it globally available for debugging
window.testSelfClaimCalendar = testSelfClaimCalendar;
