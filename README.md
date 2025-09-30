# Wash.IT - Laundry Management System

Modern, multi-channel laundry platform bridging shop discovery, smart bookings, and digital receipts for Wash.IT partner shops.

## 🆕 What's New (v2.8.0)

- **Comprehensive mobile-first optimizations** – Implemented device-specific content for all service sections with concise mobile descriptions while maintaining detailed desktop content through responsive CSS.
- **Enhanced partners layout** – Redesigned partner shop cards for horizontal display on mobile with logos positioned left and shop information on the right for better space utilization.
- **Consistent mobile typography** – Standardized 32px heading font sizes across all sections (Services, Partners, Contact) for a unified mobile experience.
- **Optimized Contact section** – Reduced padding, margins, and form element sizing for better mobile readability and reduced scrolling.
- **CSS architecture improvements** – Eliminated `!important` declarations in favor of proper CSS specificity and cascade management for maintainable code.
- **Advanced responsive breakpoints** – Refined responsive design with specific breakpoints for mobile (≤768px), tablet (769-1024px), and desktop (>1025px) experiences.
- **Mobile navigation enhancements** – Improved mobile menu functionality with better touch interactions and smooth transitions.

## 🌟 Overview

Wash.IT supplies laundry operators and customers with:

- **Interactive homepage** featuring partner spotlight cards, map-based shop discovery, and seamless booking hand-offs.
- **Advanced booking workflow** covering service selection, schedule orchestration, customer profiling, payment choice, and receipt generation.
- **Mobile-optimized responsive design** with device-specific content, horizontal partner layouts, and consistent typography for superior mobile user experience.
- **Location-aware experiences** leveraging Leaflet maps, barangay datasets, geolocation, and pickup/self-claim routing.
- **Productivity helpers** such as auto-fill, email suggestions, validation cues, and persistent form progress.
- **Clean CSS architecture** following best practices with proper specificity management and maintainable code structure.

## 🗂️ Project Structure

```
washit-laundry-management-system/
├── index.html                     # Landing page and entry point
├── README.md
├── assets/
│   ├── data/
│   │   ├── baguio_barangays.geojson  # Barangay boundaries for maps
│   │   └── baguio-highway1.geojson   # Highway data for routing
│   ├── images/
│   │   ├── washit-logo.png
│   │   └── washit-map-pin.png
│   └── js/                         # Global scripts (placeholder)
└── features/
    ├── homepage/
    │   ├── assets/
    │   │   ├── css/                # Landing-page styles, components, sections
    │   │   │   ├── main.css
    │   │   │   └── components/     # Footer, responsive styles
    │   │   └── js/
    │   │       ├── landing-page-interactions.js
    │   │       └── shop-booking-integration.js
    │   ├── main-banner/            # Hero section with CTA
    │   ├── navigation/             # Header navigation and mobile menu
    │   ├── services/               # Service features showcase
    │   ├── partners/               # Partner laundry shops display
    │   ├── contact/                # Contact form and information
    │   └── find-laundry-shops/     # Interactive map and shop discovery
    │       └── assets/
    │           ├── css/
    │           └── js/             # Map + card rendering logic
    ├── booking-form/
    │   ├── booking-form.html       # 7-step booking experience
    │   ├── assets/
    │   │   ├── css/                # Base, components, feature styles
    │   │   │   ├── base/           # Layout, reset, typography
    │   │   │   ├── components/     # Reusable UI components
    │   │   │   └── features/       # Responsive design
    │   │   ├── js/
    │   │   │   ├── main.js         # Entry point and initialization
    │   │   │   ├── core/           # Config, shared utilities
    │   │   │   └── features/       # Calendar, map, email suggestions
    │   │   └── receipts/
    │   │       ├── business/       # Business receipt templates
    │   │       └── customer/       # Customer receipt templates
    │   ├── booking-preference/     # Normal vs. rush logic, shop badges
    │   ├── book-schedule/          # Calendar and time slot selection
    │   ├── confirm-booking/        # Final confirmation step
    │   ├── customer-information/   # Contact details and auto-fill
    │   ├── laundry-items/          # Item selection and quantities
    │   ├── payment-method/         # Payment options (COD/Cashless)
    │   ├── service-details/        # Service type selection
    │   └── utils/                  # Validation utilities
    ├── dashboard/                  # Partner dashboard (foundation)
    └── shared/
        ├── assets/
        │   ├── css/
        │   │   ├── base/           # Shared base styles
        │   │   └── features/       # Shared responsive styles
        │   └── images/
        │       └── washit-logo.png
        └── utils/
            └── validation.js       # Shared validation functions
```

## 🚀 Getting Started

1. **Clone or download** the repository.
2. **Run a local web server** (required for GeoJSON fetches and Leaflet tiles):

```powershell
# Option A: Python 3 (PowerShell)
python -m http.server 8000

# Option B: Node.js http-server
npx http-server . -p 8000
```

3. Open `http://localhost:8000/index.html` in your browser.

### Quick Navigation

- **Homepage:** `index.html` – explore shops, open the modal, and click "Book Now" to jump into the booking flow with the selected shop context.
- **Direct booking access:** `features/booking-form/booking-form.html` – includes URL parameters like `?shopId=` for deep linking.
- **Receipts:** located under `features/booking-form/assets/receipts/{customer|business}/`.

## ✨ Feature Highlights

### Homepage Experience

- **Shop discovery map** with barangay filter, session-persistent selection, real-time routing preview, and modal detail views.
- **Leaflet integration** showcasing partner locations with custom pins and optional barangay overlays.
- **Seamless booking hand-off** by storing the chosen shop in session storage and query parameters so the booking form auto-populates badges, titles, and map markers.
- **Responsive cards & modals** built with reusable CSS section bundles.

### Mobile-First Responsive Design

- **Device-specific content** with separate mobile and desktop service descriptions for optimal readability on each platform.
- **Horizontal partner layout** displaying all three partner shops side-by-side on mobile with logo-left, content-right arrangement.
- **Consistent mobile typography** with standardized 32px headings across Services, Partners, and Contact sections.
- **Optimized spacing and sizing** with compact layouts, reduced padding, and mobile-appropriate form elements.
- **CSS best practices** using proper specificity instead of `!important` declarations for maintainable responsive code.
- **Advanced breakpoint system** with specific optimizations for mobile (≤768px), tablet (769-1024px), and desktop (>1025px).

### Booking System

- **Structured 7-step flow** with service selection, schedule, items, customer info, payment, and confirmation.
- **Smart auto-fill** leveraging localStorage and per-field listeners to restore contact details silently.
- **Inline email suggestions** that surface domain completions and keyboard navigation.
- **Dual-calendar scheduling** for pickup/delivery and self-claim scenarios, tuned for normal vs. rush bookings.
- **Context-aware time slots** grouped by AM/PM, filtered by current Philippine time, and restricted in rush mode.
- **Advanced validation** spanning text, phone, email, quantity inputs, booking type toggles, and payment selections.
- **Pickup map enhancements** with multi-tier tile fallbacks, custom location button, barangay highlighting, and user pin placement.
- **Receipt generation** templates for customer and business stakeholders with dedicated asset folders and map-assisted pickup addresses.

### Location & Mapping Features

- **Auto location confidence** – Homepage map auto-centers on the customer when geolocation permission is granted, keeping routes ready without extra clicks.
- **Route clarity on shop switch** – Switching between laundry shops instantly recalculates the customer-to-shop route so the map preview stays accurate.
- **Refined map filtering** – "Show All Wash.IT Shops" toggle switches between all-shop view and the currently selected barangay, with markers updating accordingly.
- **Smart pickup address merge** – Receipts combine user details with reverse-geocoded map data, filling in missing streets automatically.

## 📊 Data & Integrations

- **Leaflet.js** powers mapping across homepage and booking form.
- **Barangay GeoJSON** (`assets/data/baguio_barangays.geojson`) delivers boundary overlays—served via fetch, so a local server is required in development.
- **OSRM routing service** provides live driving paths between the customer's location and the selected shop.
- **Local/session storage** persists customer details and shop choices between pages.
- **Geolocation API** drives "Use My Location" flows for accurate pickup pins.

## 🛠️ Technical Stack

- **Languages:** HTML5, CSS3, modern JavaScript (ES6+).
- **Architecture:** Feature-based modular directories for CSS, JS, and assets.
- **Styling:** CSS Grid, Flexbox, custom properties, responsive breakpoints with mobile-first approach.
- **Performance:** Lazy module initialization, scoped bundles, optimized imagery, minimal external dependencies.
- **Responsive Design:** Advanced breakpoint system with device-specific optimizations and consistent typography scaling.

## 🧑‍💻 Development Guidelines

- Keep feature-specific assets within their module (e.g., booking map logic under `features/booking-form/assets/js/features/`).
- Use relative paths when referencing shared assets to maintain portability.
- Update homepage navigation and booking integration scripts when adding new sections or shops.
- For new scheduling logic, extend the helpers in `core/config.js`, `features/time-slots.js`, and `shared/utils/validation.js`.
- Follow mobile-first responsive design principles with proper CSS specificity.
- Use semantic HTML and maintain accessibility standards.

## 🔄 Version History

### v2.8.0 (Current) - Mobile-First Revolution
- Comprehensive mobile-first optimizations with device-specific content for all service sections
- Redesigned partners section with horizontal card layout for better mobile space utilization
- Standardized mobile typography across all sections for consistent user experience
- Optimized Contact section spacing and form elements for improved mobile usability
- Refactored CSS architecture to eliminate `!important` declarations and use proper specificity
- Advanced responsive breakpoints with specific optimizations for different screen sizes

### v2.7.0 - Enhanced Location Intelligence
- Homepage map auto-fetches user location when permission is granted, keeping the "You are here" marker in sync
- Routing refreshes as you switch shops, mirroring the booking form's behavior
- Barangay filter toggle now switches between filtered and all-shop views with clear labeling

### v2.6.0 - Smart Address Management
- Merged user-provided and map-resolved pickup addresses on both receipts, ensuring barangay presence without duplicate house numbers
- Removed coordinates and external navigation links from receipt outputs while keeping a clean Baguio City-capped format

### v2.5.0 - Live Routing Preview
- Added live routing previews between customer geolocation and selected shops, including distance and ETA display
- Simplified homepage map controls by removing unused highway overlays and renaming the toggle to "Hide/Show Shops"

### v2.4.0 - Dashboard Foundation
- Built the initial dashboard foundation with secure routing, placeholder modules, and data models for upcoming analytics features

### v2.3.0 - Smart Integration
- Added shop-to-booking hand-off with session storage and query parameter support
- Introduced barangay overlays, filters, and highlight tooling across homepage and booking maps
- Implemented silent auto-fill, field-level persistence, and email domain suggestions
- Expanded pickup/self-claim scheduling with dedicated calendars, rush rules, and improved validation
- Enhanced Leaflet controls with multi-tier tile fallbacks, custom location button, and geolocation feedback
- Reorganized receipt templates for easier customization

### v2.2.0 - Map Integration Fixes
- Fixed map integration with reliable tile servers (Google Maps → Esri → Stadia Maps)
- Restored booking form functionality from backup and verified navigation links
- Improved map error handling and GPS location services

### v2.1.0 - Enhanced Responsiveness
- Enhanced homepage responsiveness, logo sizing, and typography
- Isolated CSS dependencies and optimized layout balance

### v2.0.0 - Modular Architecture
- Migrated to feature-based modular architecture
- Separated homepage and booking form bundles

### v1.0.0 - Initial Release
- Initial release with basic multi-step booking functionality and responsive layout

## 👥 Credits

**Capstone Project Development Team:**
- **Giacao, Mike Joshua S.** - Lead Developer
- **Ramos, Denver Ivan A.** - Frontend Developer  
- **Lacanaria, Armel B.** - System Architect

**Institution:** University of the Cordilleras, Baguio City, Benguet

## 📄 License

This project is developed as a capstone project for academic purposes.

---

**🧺 Wash.IT – Transforming Laundry Services with Modern Technology**