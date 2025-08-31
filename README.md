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

## 📁 Project Structure (Modular Architecture)

```
washit-bookingform/
├── 📄 index.html                          # Main booking form
├── 📄 README.md                           # Project documentation
├── 📁 booking-preference/                 # Section 1: Booking Type Selection
│   ├── booking-preference-styles.css     # Toggle switch and booking type styles
│   ├── booking-preference.js             # Booking type selection logic
│   └── 📁 normal-rush/                   # Sub-features for Normal/Rush
│       ├── normal-rush-styles.css        # Styles for normal/rush features
│       ├── normal.js                     # Normal booking specific logic
│       └── rush.js                       # Rush booking specific logic
├── 📁 service-details/                   # Section 2: Service Options
│   ├── service-details-styles.css       # Service card styling
│   └── service-details.js               # Service selection logic
├── 📁 laundry-items/                     # Section 3: Laundry Items
│   ├── laundry-items-styles.css         # Items table and pricing styles
│   └── laundry-items.js                 # Items calculation logic
├── 📁 book-schedule/                     # Section 4: Schedule Booking
│   ├── book-schedule-styles.css         # Calendar and time slots styles
│   └── book-schedule.js                 # Calendar and scheduling logic
├── 📁 customer-information/              # Section 5: Customer Details
│   ├── customer-information-styles.css  # Form inputs and autofill styles
│   └── customer-information.js          # Customer data management
├── 📁 payment-method/                    # Section 6: Payment Selection
│   ├── payment-method-styles.css        # Payment card styles
│   └── payment-method.js                # Payment method logic
├── 📁 confirm-booking/                   # Section 7: Booking Confirmation
│   ├── confirm-booking-styles.css       # Modal and receipt styles
│   └── confirm-booking.js               # Confirmation and receipt logic
├── 📁 components/                        # Shared UI Components
│   ├── buttons.css                       # Button styles and states
│   ├── loading.css                       # Loading animations
│   └── sections.css                      # Form sections and layout
├── 📁 utils/                             # Shared Utilities
│   └── validation.js                     # Form validation utilities
└── 📁 assets/                            # Legacy and Shared Assets
    ├── 📁 css/
    │   ├── 📁 base/                      # Foundation styles
    │   │   ├── reset.css                 # CSS reset and utilities
    │   │   ├── typography.css            # Typography and fonts
    │   │   └── layout.css                # Layout and grid systems
    │   ├── 📁 components/                # Legacy component styles
    │   └── 📁 features/                  # Legacy feature styles
    ├── 📁 js/
    │   ├── 📁 core/                      # Core configuration
    │   │   ├── config.js                 # Global settings
    │   │   └── time-slots.js             # Time slot definitions
    │   ├── 📁 features/                  # Legacy feature modules
    │   ├── validation.js                 # Form validation (legacy)
    │   └── main.js                       # Main initialization
    └── 📁 receipts/                      # Receipt generation
        ├── 📁 customer/                  # Customer receipt templates
        └── 📁 business/                  # Business receipt templates
```

## 🏗️ Modular Architecture

### 7 Main Sections

1. **Booking Preference** (`booking-preference/`)
   - Toggle between Normal and Rush booking
   - Sub-features for booking type specific logic
   - Processing time and pricing display

2. **Service Details** (`service-details/`)
   - Service option selection (Pickup/Delivery, etc.)
   - Visual card-based interface
   - Service description and pricing

3. **Laundry Items** (`laundry-items/`)
   - Item category selection and quantity
   - Dynamic pricing calculation
   - Item validation and limits

4. **Book Schedule** (`book-schedule/`)
   - Calendar interface for date selection
   - Time slot availability and selection
   - Self-claim scheduling logic

5. **Customer Information** (`customer-information/`)
   - Customer data input forms
   - Auto-fill functionality
   - Address and contact validation

6. **Payment Method** (`payment-method/`)
   - Payment option selection
   - COD vs Cashless payment options
   - Payment validation

7. **Confirm Booking** (`confirm-booking/`)
   - Booking review and confirmation
   - Receipt generation and display
   - Modal interface for confirmation

### Shared Resources

- **Components** (`components/`) - Reusable UI components
- **Utils** (`utils/`) - Shared utility functions
- **Assets** (`assets/`) - Images, icons, legacy code

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
3. **Select Laundry Items** - Choose item categories and quantities
4. **Pick Date & Time** - Use the calendar to select your preferred slot
5. **Fill Customer Details** - Enter your contact and address information
6. **Choose Payment Method** - Select COD or Cashless payment
7. **Review & Confirm** - Check your booking details and submit

## 🎨 Modular Design Principles

### Naming Convention
- **Folders**: `kebab-case` (e.g., `booking-preference`)
- **Files**: `{section-name}-styles.css` and `{section-name}.js`
- **Sub-features**: Organized in subfolders with descriptive names

### File Organization
- Each section is self-contained with its own CSS and JS
- Shared components are centralized in `/components/`
- Utilities are in `/utils/`
- Legacy code remains in `/assets/` for backwards compatibility

### Import Structure
- CSS imports are grouped by: Base → Components → Sections → Legacy
- JS imports are grouped by: Core → Utils → Sections → Legacy
- Dependencies are loaded in correct order

## 🔧 Development Guidelines

### Adding New Sections
1. Create folder: `/new-section/`
2. Add files: `new-section-styles.css` and `new-section.js`
3. Update `index.html` imports
4. Follow existing patterns for consistency

### Adding Sub-features
1. Create subfolder within section: `/section-name/sub-feature/`
2. Add files following naming convention
3. Import in main section or `index.html` as needed

### Shared Components
- Add reusable CSS to `/components/`
- Add utility functions to `/utils/`
- Update imports in `index.html`

## 📱 Browser Support & Performance

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **Mobile-first**: Responsive design with touch-friendly interfaces
- **Performance**: Modular loading for faster initial page loads
- **Accessibility**: WCAG 2.1 AA compliant form elements

## 🧪 Testing

The modular structure makes testing easier:
- Each section can be tested independently
- Shared utilities can be unit tested
- CSS components can be visually tested in isolation

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-section`)
3. Follow the modular architecture patterns
4. Test your changes across all sections
5. Submit a Pull Request

---

**Built with ❤️ using modular architecture for maintainable laundry booking**

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
