# Wash.IT - Laundry Management System

A comprehensive laundry management system featuring a modern homepage and advanced booking form functionality for laundry service providers and customers.

## 🌟 Overview

Wash.IT is a complete laundry service platform that provides:
- **Professional Homepage** - Showcasing services, partners, and company information
- **Advanced Booking System** - Multi-step booking process with real-time validation
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, intuitive interface with enhanced user experience

## 🗂️ Project Structure

```
washit-laundry-management-system/
├── 📄 washit.html                        # Main homepage
├── 📄 README.md                          # Project documentation
├── 📁 assets/                            # Root-level shared assets
│   └── 📁 images/
│       └── washit-logo.png               # Main company logo
├── 📁 features/                          # Feature-based organization
│   ├── 📁 homepage/                      # Homepage feature
│   │   └── 📁 assets/
│   │       ├── 📁 css/
│   │       │   ├── landing-page-styles.css    # Main homepage styles
│   │       │   ├── main.css                   # Base homepage styles
│   │       │   ├── 📁 components/             # UI components
│   │       │   │   ├── navigation.css         # Navigation bar
│   │       │   │   └── footer.css             # Footer styles
│   │       │   └── 📁 sections/               # Page sections
│   │       │       ├── washit-intro.css       # Hero/intro section
│   │       │       ├── find-shops.css         # Shop locator
│   │       │       ├── services.css           # Services showcase
│   │       │       ├── partners.css           # Partners section
│   │       │       └── contact.css            # Contact form
│   │       └── 📁 js/
│   │           └── landing-page-interactions.js # Homepage interactions
│   ├── 📁 booking-form/                 # Booking system
│   │   ├── 📄 booking-form.html          # Multi-step booking form
│   │   └── 📁 assets/                    # Booking form assets
│   │       ├── 📁 css/                   # Styling files
│   │       ├── 📁 js/                    # Interactive features
│   │       └── 📁 receipts/              # Receipt generation
│   └── 📁 shared/                        # Shared resources
│       └── 📁 assets/
│           └── 📁 images/
│               └── washit-logo.png       # Shared logo asset
```

## 🚀 Getting Started

### Quick Start

1. **Homepage**: Open `washit.html` in your browser
2. **Booking**: Click "START BOOKING NOW!" to access the booking form
3. **Local Development**: Use a local web server for full functionality

### Development Setup

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000/washit.html`

## ✨ Features

### 🏠 Homepage (`washit.html`)
- **Modern Hero Section** - Eye-catching introduction with company branding
- **Enhanced Navigation** - Optimized logo sizing and responsive menu
- **Service Showcase** - Detailed feature descriptions with visual elements
- **Partner Display** - Showcase of partner laundry shops
- **Contact Integration** - Direct contact form and business information
- **Responsive Design** - Fully optimized for all device sizes
- **Smooth Navigation** - Anchor links to different sections

### 📋 Booking System (`features/booking-form/`)
- **7-Step Process** - Comprehensive booking workflow
- **Real-time Validation** - Instant form validation and feedback
- **Interactive Calendar** - Smart date and time selection
- **Reliable Map Integration** - Multi-tier location services with GPS support
- **Automatic Fallback Systems** - Google Maps → Esri ArcGIS → Stadia Maps
- **Location Services** - User location detection and pickup point selection
- **Multiple Payment Options** - Cash and cashless payment methods
- **Receipt Generation** - Automatic customer and business receipts
- **Progress Tracking** - Visual progress indicators
- **Responsive Design** - Optimized for all devices

## 🎯 Key Enhancements

### Recent System Improvements (v2.2.0)
- ✅ **Reliable Map Integration** - Fixed map tile server issues with automatic fallback
- ✅ **Multi-Tier Tile Service** - Google Maps → Esri → Stadia Maps progression
- ✅ **Enhanced Error Handling** - Graceful degradation when services are unavailable
- ✅ **GPS Location Services** - Accurate user location detection and pickup selection
- ✅ **Restored Booking Form** - Fully functional booking system from verified backup
- ✅ **Verified Navigation** - Confirmed homepage-to-booking form link integrity

### Homepage Improvements (v2.1.0)
- ✅ **Isolated CSS Dependencies** - Homepage only loads homepage-specific styles
- ✅ **Enhanced Logo Sizing** - Optimized navigation and main banner logos
- ✅ **Improved Typography** - Larger, more readable feature descriptions
- ✅ **Better Layout Balance** - Optimized grid proportions for content vs. logo
- ✅ **Comprehensive Responsiveness** - Added tablet/iPad specific breakpoints
- ✅ **Unified Heading** - Combined heading text for better flow

### Responsive Design Coverage
- **Desktop**: 1025px and above
- **Tablet/iPad**: 769px to 1024px
- **Mobile**: 768px and below

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+)
- **Architecture**: Feature-based modular structure
- **Styling**: CSS Grid, Flexbox, Custom Properties
- **Maps**: Leaflet.js with multi-tier tile server support
- **Tile Servers**: Google Maps, Esri ArcGIS, Stadia Maps (with automatic fallback)
- **Location Services**: HTML5 Geolocation API with error handling
- **Storage**: LocalStorage for user data persistence

### Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features
- **Modular CSS Loading** - Only necessary styles are loaded
- **Optimized Images** - Properly sized and formatted assets
- **Minimal Dependencies** - Lightweight, fast-loading codebase
- **Progressive Enhancement** - Works without JavaScript for basic functionality

## 📱 Responsive Breakpoints

### Desktop (1025px+)
- Full navigation layout
- Two-column hero section
- Multi-column service grids
- Optimal logo and typography sizing

### Tablet/iPad (769px - 1024px)
- Adapted navigation sizing
- Balanced content layouts
- Touch-friendly interactions
- Optimized spacing and typography

### Mobile (768px and below)
- Single-column layouts
- Collapsible navigation
- Touch-optimized controls
- Compressed content hierarchy

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3b82f6` - Main brand color
- **Dark Blue**: `#1e40af` - Accent and hover states
- **Text Dark**: `#1a1a1a` - Primary text color
- **Text Gray**: `#374151` - Secondary text color

### Typography
- **Headings**: Poppins (800 weight)
- **Body Text**: Inter (400-600 weight)
- **Responsive Scaling**: Optimized for all screen sizes

### Component Architecture
- **Navigation**: Fixed header with brand logo and menu
- **Hero Section**: Split layout with content and branding
- **Services**: Grid-based feature showcase
- **Partners**: Card-based partner display
- **Contact**: Integrated contact form and information

## 🔧 Development Guidelines

### Adding New Features
1. Create feature folder in `features/`
2. Follow existing CSS and JS structure
3. Update navigation links as needed
4. Maintain responsive design patterns

### CSS Organization
- **Base Styles**: Foundation and reset styles
- **Components**: Reusable UI components
- **Sections**: Page-specific styling
- **Responsive**: Mobile-first approach

### File Management
- Use relative paths for all assets
- Follow kebab-case naming convention
- Keep feature-specific assets organized
- Maintain clean import structure

## 📞 Contact & Support

### Business Information
- **Email**: washitlms@gmail.com
- **Phone**: (+63)9610166195
- **Address**: University of the Cordilleras, Gov. Pack Rd., Baguio City, Benguet

### Technical Support
For development questions or technical issues, please refer to the codebase documentation or contact the development team.

## 👥 Credits

**Capstone Project Development Team:**
- **Giacao, Mike Joshua S.** - Lead Developer
- **Ramos, Denver Ivan A.** - Frontend Developer  
- **Lacanaria, Armel B.** - System Architect

**Institution:** University of the Cordilleras, Baguio City, Benguet

## 📄 License

This project is developed as a capstone project for academic purposes.

## 🔄 Version History

### v2.2.0 (Current)
- ✅ Fixed map integration with reliable tile servers (Google Maps, Esri, Stadia Maps)
- ✅ Restored booking form functionality from backup
- ✅ Updated booking form navigation and structure
- ✅ Improved map error handling with automatic fallback systems
- ✅ Enhanced location services with GPS integration
- ✅ Verified homepage-to-booking form navigation links

### v2.1.0
- ✅ Enhanced homepage with improved logo sizing
- ✅ Comprehensive tablet/mobile responsiveness
- ✅ Isolated CSS dependencies for better performance
- ✅ Unified heading structure and typography improvements

### v2.0.0
- ✅ Feature-based modular architecture
- ✅ Separated homepage and booking form
- ✅ Enhanced responsive design
- ✅ Improved navigation and user experience

### v1.0.0
- ✅ Initial release with basic booking functionality
- ✅ Multi-step booking process
- ✅ Basic responsive design

---

**🧺 Wash.IT Laundry Management System - Transforming Laundry Services with Modern Technology**
