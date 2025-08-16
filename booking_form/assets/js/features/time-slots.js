// Time Slot Rendering and Management
class TimeSlotRenderer {
    constructor() {
        this.timeSlotUtils = new TimeSlotUtils();
    }

    // Main time slots rendering function
    renderTimeSlots() {
        const timeSlotsContainer = document.getElementById("timeSlots");
        if (!timeSlotsContainer) return;
        
        timeSlotsContainer.innerHTML = "";
        
        const currentSelectedDate = window.selectedDate || selectedDate;
        if (!currentSelectedDate) {
            this.showNoDateSelectedMessage(timeSlotsContainer);
            return;
        }
        
        this.renderTimeSlotsForDate(timeSlotsContainer, currentSelectedDate);
    }

    // Show message when no date is selected
    showNoDateSelectedMessage(container) {
        container.innerHTML = "<p style='text-align: center; color: #666; font-style: italic; padding: 20px;'>Please select a date first</p>";
    }

    // Render time slots for selected date
    renderTimeSlotsForDate(container, selectedDate) {
        // Add title and shop hours
        this.addTimeSlotsHeader(container, selectedDate);
        
        const isRush = (window.bookingType || bookingType) === CONFIG.BOOKING_TYPES.RUSH;
        
        // Add rush booking info if applicable
        if (isRush) {
            this.addRushBookingInfo(container);
        }
        
        // Get available time slots
        const availableTimeSlots = this.timeSlotUtils.getAvailableTimeSlots(selectedDate, isRush);
        
        // Check if no slots available
        if (Object.keys(availableTimeSlots).length === 0) {
            this.showNoSlotsMessage(container);
            return;
        }
        
        // Add current time info for today
        this.addCurrentTimeInfo(container, selectedDate);
        
        // Create and populate time slots
        this.createTimeSlotGroups(container, availableTimeSlots, isRush);
    }

    // Add header with title and shop hours
    addTimeSlotsHeader(container, selectedDate) {
        const timeSlotsTitle = document.createElement("h4");
        timeSlotsTitle.textContent = `Available Time for ${selectedDate.toLocaleDateString()}`;
        timeSlotsTitle.style.textAlign = "center";
        timeSlotsTitle.style.marginBottom = "6px";
        timeSlotsTitle.style.color = "#333";
        timeSlotsTitle.style.fontSize = "1.05rem";
        timeSlotsTitle.style.fontWeight = "600";
        container.appendChild(timeSlotsTitle);
        
        const shopHoursInfo = document.createElement("div");
        shopHoursInfo.style.textAlign = "center";
        shopHoursInfo.style.fontSize = "0.85rem";
        shopHoursInfo.style.color = "#666";
        shopHoursInfo.style.marginBottom = "8px";
        const openTime = CONFIG.SHOP_SCHEDULE.OPEN_HOUR === 6 ? "6:00 AM" : `${CONFIG.SHOP_SCHEDULE.OPEN_HOUR}:00 AM`;
        const closeTime = CONFIG.SHOP_SCHEDULE.CLOSE_HOUR === 17 ? "5:00 PM" : `${CONFIG.SHOP_SCHEDULE.CLOSE_HOUR}:00 PM`;
        shopHoursInfo.textContent = `Shop Hours: ${openTime} - ${closeTime}`;
        container.appendChild(shopHoursInfo);
    }

    // Add rush booking information
    addRushBookingInfo(container) {
        const amInfo = document.createElement("div");
        amInfo.className = "slot-divider";
        amInfo.innerHTML = `
            <div style="text-align:center; line-height:1.25;">
                Rush booking: Only AM times can be chosen
                <div style="margin-top:6px; font-size:0.9rem; color:#666;">
                    (deliveries are scheduled in the PM until the shop's closing time).
                </div>
            </div>
        `;
        amInfo.style.margin = "4px auto 8px";
        container.appendChild(amInfo);
    }

    // Show no slots available message
    showNoSlotsMessage(container) {
        const noSlotsMessage = document.createElement("div");
        noSlotsMessage.className = "time-slots-note";
        noSlotsMessage.style.textAlign = "center";
        noSlotsMessage.style.padding = "20px";
        noSlotsMessage.style.color = "#666";
        
        if (this.timeSlotUtils.isShopOpen()) {
            noSlotsMessage.textContent = "No more available time slots for today. Please select a future date.";
        } else {
            const shopHours = `${CONFIG.SHOP_SCHEDULE.OPEN_HOUR}:00 AM - ${CONFIG.SHOP_SCHEDULE.CLOSE_HOUR === 17 ? '5:00' : CONFIG.SHOP_SCHEDULE.CLOSE_HOUR + ':00'} PM`;
            noSlotsMessage.textContent = `Shop is currently closed. Operating hours: ${shopHours}`;
        }
        
        container.appendChild(noSlotsMessage);
    }

    // Add current time information for today
    addCurrentTimeInfo(container, selectedDate) {
        const today = this.timeSlotUtils.getCurrentPhilippineTime();
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const isToday = selectedDateStart.getTime() === todayStart.getTime();
        
        if (isToday) {
            const currentTimeInfo = document.createElement("div");
            currentTimeInfo.className = "slot-divider";
            currentTimeInfo.style.margin = "4px auto 8px";
            currentTimeInfo.innerHTML = `
                <div style="text-align:center; line-height:1.25; font-size:0.9rem; color:#555;">
                    Current time: ${today.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    })} • Showing available slots from now
                </div>
            `;
            container.appendChild(currentTimeInfo);
        }
    }

    // Create AM and PM time slot groups
    createTimeSlotGroups(container, availableTimeSlots, isRush) {
        const wrapper = document.createElement("div");
        wrapper.className = "time-slots-wrapper";
        
        const amGroup = document.createElement("div");
        amGroup.className = "time-slots-group am-group";
        
        const pmGroup = document.createElement("div");
        pmGroup.className = "time-slots-group pm-group";
        
        // Sort time slots and populate groups
        const entries = Object.entries(availableTimeSlots).sort((a, b) => a[0].localeCompare(b[0]));
        
        entries.forEach(([time, slot]) => {
            const slotElement = this.createTimeSlotElement(time, slot, isRush);
            const hour = parseInt(time.split(':')[0], 10);
            
            if (hour < 12) {
                amGroup.appendChild(slotElement);
            } else {
                pmGroup.appendChild(slotElement);
            }
        });
        
        // Add groups with dividers
        this.addTimeSlotGroup(wrapper, amGroup, "AM");
        this.addTimeSlotGroup(wrapper, pmGroup, "PM");
        
        container.appendChild(wrapper);

        // Update validation visuals
        if (typeof validateDateTimeVisual === 'function') {
            validateDateTimeVisual();
        }
    }

    // Create individual time slot element
    createTimeSlotElement(time, slot, isRush) {
        const slotElement = document.createElement("div");
        slotElement.className = "time-slot";
        
        const hour = parseInt(time.split(':')[0], 10);
        slotElement.classList.add(hour < 12 ? "am" : "pm");

        // Determine slot text and availability
        let slotCountText = `${slot.available} slot${slot.available > 1 ? 's' : ''} available`;
        if (isRush && hour >= 12) {
            slotCountText = "PM delivery not selectable";
        }
        
        slotElement.innerHTML = `
            <div class="time-label">${slot.label}</div>
            <div class="slot-count">${slotCountText}</div>
        `;
        
        // Set interaction based on availability
        if (isRush && hour >= 12) {
            slotElement.classList.add("unavailable");
            slotElement.setAttribute("aria-disabled", "true");
        } else if (slot.available > 0) {
            slotElement.onclick = () => this.selectTimeSlot(time, slotElement);
        } else {
            slotElement.classList.add("unavailable");
            slotElement.setAttribute("aria-disabled", "true");
        }
        
        return slotElement;
    }

    // Add time slot group with divider
    addTimeSlotGroup(wrapper, group, label) {
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

    // Select a time slot
    selectTimeSlot(time, element) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new time
        element.classList.add('selected');
        window.selectedTime = time;
        if (typeof selectedTime !== 'undefined') {
            selectedTime = time;
        }

        // Check if this is pickup and self-claim service
        const isPickupAndSelfClaim = window.selectedServiceType === 'pickup_selfclaim';
        
        if (isPickupAndSelfClaim) {
            // Show self-claim calendar after pickup time is selected
            setTimeout(() => {
                if (typeof validateDateTimeVisual === 'function') {
                    validateDateTimeVisual();
                }
                
                // Show self-claim section and update title
                const selfClaimSection = document.getElementById('selfClaimSection');
                if (selfClaimSection) {
                    selfClaimSection.classList.remove('hidden');
                    
                    // Update schedule title
                    if (typeof updateScheduleTitle === 'function') {
                        updateScheduleTitle('claim');
                    }
                    
                        // Initialize self-claim calendar with current selection
                        if (typeof initializeSelfClaimCalendar === 'function') {
                            const pickupDate = window.selectedDate || selectedDate;
                            const currentBookingType = window.bookingType || bookingType;
                            
                            // triggering self-claim calendar
                            
                            // Try with current values first
                            if (pickupDate && currentBookingType) {
                                // initializing with valid data
                                initializeSelfClaimCalendar(pickupDate, currentBookingType);
                            } else {
                                // missing data, using fallback
                                // Use test data as fallback
                                const fallbackDate = new Date();
                                fallbackDate.setDate(fallbackDate.getDate() + 1);
                                initializeSelfClaimCalendar(fallbackDate, 'normal');
                            }
                            
                            // Do NOT auto-run the debug test function here; it can overwrite the real initialization.
                        }
                }
            }, 200);
        } else {
            // Auto-scroll to customer section for other service types
            setTimeout(() => {
                if (typeof validateDateTimeVisual === 'function') {
                    validateDateTimeVisual();
                }
            }, 200);
        }
    }
}

// Time slot utility functions
class TimeSlotUtils {
    // Get current Philippine time
    getCurrentPhilippineTime() {
        return new Date(new Date().toLocaleString("en-US", { timeZone: CONFIG.SHOP_SCHEDULE.TIMEZONE }));
    }

    // Check if shop is currently open
    isShopOpen() {
        const now = this.getCurrentPhilippineTime();
        const currentHour = now.getHours();
        return currentHour >= CONFIG.SHOP_SCHEDULE.OPEN_HOUR && currentHour < CONFIG.SHOP_SCHEDULE.CLOSE_HOUR;
    }

    // Get available time slots for a date
    getAvailableTimeSlots(selectedDate, isRush) {
        // This function would need to be implemented based on the original logic
        // For now, return the basic time slots
        const baseSlots = isRush ? (typeof RUSH_TIME_SLOTS !== 'undefined' ? RUSH_TIME_SLOTS : {}) : (typeof TIME_SLOTS !== 'undefined' ? TIME_SLOTS : {});
        
        // Filter based on current time if today
        const today = this.getCurrentPhilippineTime();
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const isToday = selectedDateStart.getTime() === todayStart.getTime();
        
        if (!isToday) {
            return baseSlots;
        }
        
        // Filter out past times for today
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const filtered = {};
        
        Object.entries(baseSlots).forEach(([time, slot]) => {
            const [hour, minute] = time.split(':').map(Number);
            const slotTime = hour * 60 + minute;
            const currentTime = currentHour * 60 + currentMinute;
            
            if (slotTime > currentTime) {
                filtered[time] = slot;
            }
        });
        
        return filtered;
    }
}

// Create global instances
const timeSlotRenderer = new TimeSlotRenderer();

// Global functions for backward compatibility
function renderTimeSlots() {
    timeSlotRenderer.renderTimeSlots();
}

function selectTimeSlot(time, element) {
    timeSlotRenderer.selectTimeSlot(time, element);
}
