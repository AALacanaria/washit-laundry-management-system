// Self-Claim Calendar Management
class SelfClaimCalendar {
    constructor() {
        this.currentDate = new Date();
        this.minClaimDate = null;
    }

    // Initialize self-claim calendar after pickup is scheduled
    initializeSelfClaimCalendar(pickupDate, bookingType) {
    // initialization logged in debug during development (removed)
        
        // Validate inputs
        if (!pickupDate || !bookingType) {
            console.error('Missing required parameters for self-claim calendar:', { pickupDate, bookingType });
            // fallback path used (no console log)
            
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
            
            // fallback dates computed
            
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
                // skipping re-init because existing bookingType is rush
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
            // Calculate claim availability
            // Shop open hours: 06:00 - 17:00, closed Sundays.
            // Rush processing: 4 hours from pickup time (same-day window from readiness to 17:00) and next working day full hours.
            const today = new Date();

            // Helper: start-of-day and next working day
            const toStartOfDay = (d) => { const n = new Date(d); n.setHours(0,0,0,0); return n; };
            const nextWorkingDay = (d) => {
                const x = new Date(d);
                x.setDate(x.getDate() + 1);
                // Skip Sundays
                while (x.getDay() === 0) {
                    x.setDate(x.getDate() + 1);
                }
                x.setHours(6,0,0,0);
                return x;
            };

            // Unified availability logic for both normal and rush: use pickup + 4 hours readiness
            // and allow the earliest day (same-day if readiness <= 17:00 and not Sunday) plus
            // two subsequent working days (skip Sundays). This makes Rush behave like Normal
            // for self-claim availability but keeps the +4-hour readiness rule for both.
            // Resolve pickup datetime (prefer incoming pickupDate or window.selectedDate)
            const P = (pickupDate && pickupDate instanceof Date) ? new Date(pickupDate) : (window.selectedDate ? new Date(window.selectedDate) : new Date());

            // Apply selected pickup time if pickupDate had no time component
            try {
                const hasHour = P.getHours() !== 0 || P.getMinutes() !== 0;
                const timeStr = (typeof window.selectedTime !== 'undefined' && window.selectedTime) ? window.selectedTime : (typeof selectedTime !== 'undefined' ? selectedTime : null);
                if (!hasHour && timeStr) {
                    const parts = timeStr.toString().split(':');
                    const hh = Number(parts[0]);
                    const mm = parts.length > 1 ? Number(parts[1]) : 0;
                    if (!Number.isNaN(hh)) {
                        P.setHours(hh, isNaN(mm) ? 0 : mm, 0, 0);
                    }
                }
            } catch (err) {
                console.warn('Failed to apply pickup time to pickupDate:', err);
            }

            // Compute readiness = pickup + 4 hours
            const readiness = new Date(P.getTime() + 4 * 60 * 60 * 1000);

            // Build allowed claim dates: earliest (same-day if allowed) + 2 next working days
            this.allowedClaimDates = [];

            const readinessEndOfDay = new Date(readiness.getFullYear(), readiness.getMonth(), readiness.getDate(), 17, 0, 0);
            let earliestDayStart;
            // include same-day only if not Sunday and readiness <= 17:00
            if (readiness.getDay() !== 0 && readiness.getTime() <= readinessEndOfDay.getTime()) {
                earliestDayStart = toStartOfDay(readiness);
                // set precise min and end times for earliest day
                this.minClaimDateTime = new Date(readiness);
                this.endClaimDateTime = new Date(readinessEndOfDay);
            } else {
                const next = nextWorkingDay(readiness);
                earliestDayStart = toStartOfDay(next);
                this.minClaimDateTime = new Date(next.getFullYear(), next.getMonth(), next.getDate(), 6, 0, 0);
                this.endClaimDateTime = new Date(next.getFullYear(), next.getMonth(), next.getDate(), 17, 0, 0);
            }

            // push earliest and then N subsequent working days depending on booking type
            // Rush: earliest + 1 extra day (total 2 days). Normal: earliest + 2 extra days (total 3 days).
            const extraDays = (this.bookingType === 'rush') ? 1 : 2;
            let cursor = new Date(earliestDayStart);
            for (let i = 0; i <= extraDays; i++) {
                this.allowedClaimDates.push(toStartOfDay(cursor).getTime());
                // advance cursor to next working day for next iteration
                cursor = nextWorkingDay(cursor);
            }

            // Set min/max claim dates for calendar rendering
            this.minClaimDate = new Date(this.allowedClaimDates[0]);
            this.maxClaimDate = new Date(this.allowedClaimDates[this.allowedClaimDates.length - 1]);

            // Ensure min/end timestamps exist as a fallback
            if (!this.minClaimDateTime) this.minClaimDateTime = new Date(this.minClaimDate.getFullYear(), this.minClaimDate.getMonth(), this.minClaimDate.getDate(), 6, 0, 0);
            if (!this.endClaimDateTime) this.endClaimDateTime = new Date(this.maxClaimDate.getFullYear(), this.maxClaimDate.getMonth(), this.maxClaimDate.getDate(), 17, 0, 0);

            // Set calendar current month to earliest allowed day
            this.currentDate = new Date(this.minClaimDate);
            window.currentSelfClaimDate = this.currentDate;
            
            // current date set for calendar
            
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
                // re-render after 100ms
            }, 100);
            
            setTimeout(() => {
                this.renderSelfClaimCalendar();
                // re-render after 200ms
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
    // rendering self-claim calendar
        
        const currentMonthElement = document.getElementById('currentMonthSelfClaim');
        const calendarGrid = document.getElementById('selfClaimCalendarGrid');
        
    // element existence checked
        
        if (!currentMonthElement || !calendarGrid) {
            console.error('CRITICAL: Self-claim calendar elements not found!');
            console.error('currentMonthElement:', currentMonthElement);
            console.error('calendarGrid:', calendarGrid);
            
            // Try to find elements with different selectors
            const allElements = document.querySelectorAll('[id*="selfClaim"]');
            // debug: elements with selfClaim IDs
            
            return false;
        }
        
        try {
            // update month display
            // Update month display
            const monthText = this.currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
            // set month text
            currentMonthElement.textContent = monthText;
            
            // clearing existing calendar
            // Clear existing calendar
            calendarGrid.innerHTML = '';
            
            // creating calendar structure
            // Create calendar days
            const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            // calendar date range computed
            
            // Add day headers
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            // adding day headers
            dayHeaders.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'calendar-day-header';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });
            
            // day headers added
            
            // Add calendar days
            // adding calendar days
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
            
            // calendar rendering complete
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
                    // enforced fallback rush allowedClaimDates
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
            // date analysis logged for debugging
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
            // availability check performed

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
        
    // self-claim date selected
        
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

        // Determine per-day readiness and end-of-day bounds so we can filter slots correctly
    const selectedDayOnly = new Date(selectedDate);
        selectedDayOnly.setHours(0,0,0,0);
    const earliestAllowedMs = Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0 ? this.allowedClaimDates[0] : null;
    const lastAllowedMs = Array.isArray(this.allowedClaimDates) && this.allowedClaimDates.length > 0 ? this.allowedClaimDates[this.allowedClaimDates.length - 1] : null;

    // Compute day-specific min/max timestamps (default shop hours 06:00-17:00)
    const dayMinTime = (function() {
        const d = new Date(selectedDayOnly);
        d.setHours(6,0,0,0);
        // If this is the earliest allowed day and we have a precise minClaimDateTime, use it (readiness)
        if (earliestAllowedMs && selectedDayOnly.getTime() === earliestAllowedMs && this.minClaimDateTime) {
            return new Date(this.minClaimDateTime);
        }
        return d;
    }).call(this);

    const dayEndTime = (function() {
        const d = new Date(selectedDayOnly);
        d.setHours(17,0,0,0);
        // If this is the last allowed day and we have a precise endClaimDateTime that
        // falls on this same day, use it. Otherwise keep the day's 17:00 bound.
        if (lastAllowedMs && selectedDayOnly.getTime() === lastAllowedMs && this.endClaimDateTime) {
            const e = new Date(this.endClaimDateTime);
            const eDay = new Date(e);
            eDay.setHours(0,0,0,0);
            if (eDay.getTime() === selectedDayOnly.getTime()) {
                return new Date(this.endClaimDateTime);
            }
        }
        return d;
    }).call(this);

    // Diagnostic logs to help debug disabled slots
    // renderSelfClaimTimeSlots diagnostics removed

        entries.forEach(([time, slot]) => {
            // Compute timestamp for this slot on the selected day
            const [h, m] = time.split(':').map(Number);
            const slotDate = new Date(selectedDayOnly);
            slotDate.setHours(h, m, 0, 0);

            // Disable slots before the day-specific min time (e.g., readiness on earliest day or 06:00 on subsequent days)
            if (slotDate.getTime() < dayMinTime.getTime()) {
                    // slot disabled: before dayMinTime
                const disabledSlot = document.createElement('div');
                disabledSlot.className = 'time-slot unavailable';
                disabledSlot.innerHTML = `<div class="time-label">${slot.label}</div>`;
                const hour = parseInt(time.split(':')[0], 10);
                if (hour < 12) amGroup.appendChild(disabledSlot); else pmGroup.appendChild(disabledSlot);
                return; // skip adding a selectable slot
            }

            // Disable slots after the day-specific end time (e.g., 17:00 on last allowed day)
            const endSlotDate = new Date(selectedDayOnly);
            endSlotDate.setHours(h, m, 0, 0);
            if (endSlotDate.getTime() > dayEndTime.getTime()) {
                    // slot disabled: after dayEndTime
                const disabledSlot = document.createElement('div');
                disabledSlot.className = 'time-slot unavailable';
                disabledSlot.innerHTML = `<div class="time-label">${slot.label}</div>`;
                const hour = parseInt(time.split(':')[0], 10);
                if (hour < 12) amGroup.appendChild(disabledSlot); else pmGroup.appendChild(disabledSlot);
                return; // skip adding a selectable slot
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
        
    // self-claim time selected
        
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
            try {
                let ok = false;
                if (typeof validateDateTimeVisual === 'function') {
                    ok = !!validateDateTimeVisual();
                }

                // If validation passes and the form is expanded, reveal the Confirm section
                if (ok && typeof ensureConfirmVisible === 'function') {
                    ensureConfirmVisible();

                    // Briefly highlight the submit button to draw attention
                    const submitBtn = document.querySelector('.submit-btn');
                    if (submitBtn) {
                        submitBtn.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';
                        submitBtn.style.transform = 'scale(1.02)';
                        setTimeout(() => {
                            submitBtn.style.boxShadow = '';
                            submitBtn.style.transform = '';
                        }, 3000);
                    }
                }
            } catch (e) {
                // defensive: swallow errors
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

    // debug helper removed

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
    // simple initialization

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
            // using global selfClaimCalendar instance
            selfClaimCalendar.initializeSelfClaimCalendar(pickupDate, bookingType);
        } else {
            // creating new instance
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
    // manual test function invoked
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
