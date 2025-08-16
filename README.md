# 🧺 Wash.IT Booking Form

A modern, responsive web application for booking laundry services with pickup and delivery options.

## 🌟 Features

### 📋 Service Selection
- **Pickup & Delivery** - Full-service option with pickup and delivery
- **Pickup & Self-Claim** - We pick up, you collect at shop
- **Drop-off & Delivery** - You drop off, we deliver

### ⚡ Booking Types
- **Normal Booking** - 2-3 days processing, standard rates, all time slots available
- **Rush Booking** - 1.5 days processing, premium rates (+50%), limited slots

### 📅 Smart Calendar
- 30-day availability window
- Weekend/weekday scheduling
- Real-time slot availability
- Rush booking time restrictions

### 🚀 User Experience
- **Toggle Switch UI** - Modern booking type selection
- **Card-based Service Selection** - Intuitive visual interface
- **Auto-fill System** - Remembers customer information
- **Email Suggestions** - Auto-complete for common email domains
- **Responsive Design** - Works seamlessly on all devices
- **Form Validation** - Real-time validation with visual feedback

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Architecture**: Modular, component-based design
- **Styling**: Modern CSS with flexbox/grid layouts
- **Storage**: LocalStorage for user data persistence
- **Compatibility**: Modern browsers (ES6+)

## 📁 Project Structure

```
washit-bookingform/
├── 📄 index.html                          # Main booking form
├── 📄 README.md                           # Project documentation
└── 📁 assets/
    ├── 📁 css/
    │   ├── 📁 base/                       # Foundation styles
    │   │   ├── reset.css                  # CSS reset and utilities
    │   │   ├── typography.css             # Typography and fonts
    │   │   └── layout.css                 # Layout and grid systems
    │   ├── 📁 components/                 # UI component styles
    │   │   ├── buttons.css                # Button styles and states
    │   │   ├── forms.css                  # Form inputs and validation
    │   │   ├── sections.css               # Form sections and layout
    │   │   ├── service-cards.css          # Service selection cards
    │   │   ├── toggle-booking.css         # Toggle switch UI
    │   │   ├── loading.css                # Loading animations
    │   │   ├── autofill.css               # Auto-fill banner
    │   │   ├── email-suggestions.css      # Email dropdown
    │   │   └── receipt.css                # Booking confirmation
    │   └── 📁 features/                   # Feature-specific styles
    │       ├── calendar.css               # Calendar interface
    │       ├── time-slots.css             # Time slot selection
    │       └── responsive.css             # Mobile responsiveness
    └── 📁 js/
        ├── 📁 core/                       # Core configuration
        │   ├── config.js                  # Global settings
        │   └── time-slots.js              # Time slot definitions
        ├── 📁 features/                   # Feature modules
        │   ├── autofill-manager.js        # User data management
        │   ├── autofill-init.js           # Auto-fill initialization
        │   ├── email-suggestions.js       # Email auto-complete
        │   ├── booking-selection.js       # Booking type logic
        │   ├── service-card-handler.js    # Service selection
        │   ├── booking-confirmation.js    # Receipt generation
        │   ├── form-navigation.js         # Form navigation
        │   ├── calendar-data.js           # Calendar data management
        │   ├── calendar-renderer.js       # Calendar display
        │   ├── time-slots.js              # Time slot rendering
        │   └── self-claim-calendar.js     # Self-claim specific logic
        ├── validation.js                  # Form validation
        └── main.js                        # Main initialization
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation

1. **Clone or download** the project files
2. **Open** `index.html` in a web browser, or
3. **Serve** via local web server for development:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

### Usage

1. **Select Booking Type** - Choose between Normal or Rush booking using the toggle switch
2. **Choose Service** - Select from pickup/delivery options using the card interface
3. **Pick Date & Time** - Use the calendar to select your preferred slot
4. **Fill Customer Details** - Enter your contact and address information
5. **Review & Confirm** - Check your booking details and submit

## 🎨 UI Components

### Toggle Switch Booking Selection
- Modern toggle interface for booking type selection
- Real-time updates of processing time and pricing
- Smooth animations and visual feedback

### Service Cards
- Visual card-based service selection
- Clear icons and descriptions
- Hover effects and selection states

### Smart Calendar
- 30-day availability display
- Weekend/weekday visual distinction
- Today highlighting and disabled dates

### Auto-fill System
- Persistent user data storage
- One-click form population
- Privacy-conscious (local storage only)

## 🔧 Configuration

### Time Slots
Modify `assets/js/core/time-slots.js` to adjust available booking times:

```javascript
// Normal booking slots (7 AM - 5 PM)
const NORMAL_TIME_SLOTS = [
    "07:00", "08:00", "09:00", // ... customize as needed
];

// Rush booking slots (limited hours)
const RUSH_TIME_SLOTS = [
    "09:00", "10:00", "11:00", // ... customize as needed
];
```

### Shop Settings
Update `assets/js/core/config.js` for business configuration:

```javascript
const CONFIG = {
    SHOP_SCHEDULE: {
        WEEKDAY_HOURS: "7:00 AM - 5:00 PM",
        WEEKEND_HOURS: "8:00 AM - 4:00 PM"
    },
    BOOKING_TYPES: {
        NORMAL: "normal",
        RUSH: "rush"
    }
    // ... other settings
};
```

## 📱 Mobile Responsiveness

- **Breakpoints**: 640px, 768px, 1024px
- **Touch-friendly**: Large tap targets and intuitive gestures
- **Optimized layouts**: Stacked layouts for smaller screens
- **Performance**: Optimized for mobile networks

## 🔍 Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 60+     |
| Firefox | 55+     |
| Safari  | 11+     |
| Edge    | 79+     |

## 🧪 Development

### Code Style
- **Modular Architecture**: Single-responsibility principle
- **ES6+ Features**: Modern JavaScript syntax
- **CSS Custom Properties**: For theming and consistency
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

### Adding New Features

1. **CSS**: Add component styles to `assets/css/components/`
2. **JavaScript**: Create feature modules in `assets/js/features/`
3. **Configuration**: Update `assets/js/core/config.js` if needed
4. **Integration**: Include new files in `index.html`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support or questions about the Wash.IT booking system, please contact:
- **Email**: support@washit.com
- **Website**: https://washit.com

## 🔄 Version History

- **v2.0.0** - Toggle switch UI, modular architecture, enhanced UX
- **v1.5.0** - Card-based service selection, improved calendar
- **v1.0.0** - Initial release with basic booking functionality

---

**Built with ❤️ for efficient laundry service booking**
