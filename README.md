# Wash.IT - Laundry Management System

Modern, multi-channel laundry platform bridging shop discovery, smart bookings, and digital receipts for Wash.IT partner shops.

## What's new (v2.5.0)

- **Client-to-shop routing preview** – Homepage map now fetches live driving directions from the user's geolocated position to the selected laundry shop with distance and ETA summaries.
- **Streamlined map controls** – Removed legacy highway overlays and simplified the toggle to "Hide/Show Shops" so the focus stays on customer-to-shop routes.

## What's new (v2.4.0)

- **Dashboard Foundation** – Initial architecture for the partner dashboard, including secure routing, component placeholders, and data models for future features like analytics, booking management, and service configuration.

## What's new (v2.3.0)

- **Shop-to-booking hand-off** – Homepage map and cards now persist the chosen shop via session storage and URL params so the booking form auto-loads shop details, badges, and map markers.
- **Barangay intelligence** – GeoJSON boundary overlays, barangay filters, and highlight tooling for both homepage discovery and booking pickup maps (requires running through a local server to load the data).
- **Smart customer helpers** – Silent auto-fill with localStorage, per-field persistence, and inline email domain suggestions to reduce manual typing.
- **Self-claim scheduling flow** – Pickup + self-claim now exposes its own calendar/time-slot flow with validation, visual indicators, and messaging tailored to normal vs. rush bookings.
- **Time-slot & validation upgrades** – Philippine-time awareness, AM/PM grouping, rush-mode restrictions, 3-digit quantity validators, and refined error messaging across the 7-step form.
- **Location UX boost** – Leaflet-based pickup map picks a reliable tile stack (Google → Esri → Stadia), adds a custom “Use My Location” control, and gracefully manages geolocation fallbacks.
- **Receipt polish** – Customer and business receipt templates reorganized for easier customization.

## 🌟 Overview

Wash.IT supplies laundry operators and customers with:

- **Interactive homepage** featuring partner spotlight cards, map-based shop discovery, and seamless booking hand-offs.
- **Advanced booking workflow** covering service selection, schedule orchestration, customer profiling, payment choice, and receipt generation.
- **Responsive, modular design** optimized for desktop, tablet, and mobile with feature-scoped CSS/JS bundles.
- **Location-aware experiences** leveraging Leaflet maps, barangay datasets, geolocation, and pickup/self-claim routing.
- **Productivity helpers** such as auto-fill, email suggestions, validation cues, and persistent form progress.

## 🗂️ Project Structure

```
washit-laundry-management-system/
├── index.html                     # Landing page and entry point
├── README.md
├── assets/
│   ├── data/
│   │   └── baguio_barangays.geojson  # Barangay boundaries for maps
│   ├── images/
│   │   ├── washit-logo.png
│   │   └── washit-map-pin.png
│   └── js/                         # Global scripts (placeholder)
└── features/
	├── homepage/
	│   ├── assets/
	│   │   ├── css/                # Landing-page styles, components, sections
	│   │   └── js/
	│   │       ├── landing-page-interactions.js
	│   │       └── shop-booking-integration.js
	│   └── find-laundry-shops/
	│       └── assets/
	│           ├── css/
	│           └── js/             # Map + card rendering logic
	├── booking-form/
	│   ├── booking-form.html       # 7-step booking experience
	│   ├── assets/
	│   │   ├── css/                # Base, components, feature styles
	│   │   ├── js/
	│   │   │   ├── core/           # config, shared utilities
	│   │   │   └── features/       # calendar, map, email suggestions, etc.
	│   │   └── receipts/
	│   │       ├── business/
	│   │       └── customer/
	│   ├── booking-preference/     # Normal vs. rush logic, shop badges
	│   ├── confirm-booking/
	│   ├── customer-information/
	│   ├── laundry-items/
	│   ├── payment-method/
	│   └── service-details/
	└── shared/
		├── assets/
		│   ├── css/
		│   └── images/
		└── utils/
			└── validation.js
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

### Quick navigation

- **Homepage:** `index.html` – explore shops, open the modal, and click “Book Now” to jump into the booking flow with the selected shop context.
- **Direct booking access:** `features/booking-form/booking-form.html` – includes URL parameters like `?shopId=` for deep linking.
- **Receipts:** located under `features/booking-form/assets/receipts/{customer|business}/`.

## ✨ Feature Highlights

### Homepage experience

- **Shop discovery map** with barangay filter, session-persistent selection, real-time routing preview, and modal detail views.
- **Leaflet integration** showcasing partner locations with custom pins and optional barangay overlays.
- **Seamless booking hand-off** by storing the chosen shop in session storage and query parameters so the booking form auto-populates badges, titles, and map markers.
- **Responsive cards & modals** built with reusable CSS section bundles.

### Booking system

- **Structured 7-step flow** with service selection, schedule, items, customer info, payment, and confirmation.
- **Smart auto-fill** leveraging localStorage and per-field listeners to restore contact details silently.
- **Inline email suggestions** that surface domain completions and keyboard navigation.
- **Dual-calendar scheduling** for pickup/delivery and self-claim scenarios, tuned for normal vs. rush bookings.
- **Context-aware time slots** grouped by AM/PM, filtered by current Philippine time, and restricted in rush mode.
- **Advanced validation** spanning text, phone, email, quantity inputs, booking type toggles, and payment selections.
- **Pickup map enhancements** with multi-tier tile fallbacks, custom location button, barangay highlighting, and user pin placement.
- **Receipt generation** templates for customer and business stakeholders with dedicated asset folders.

## 📊 Data & Integrations

- **Leaflet.js** powers mapping across homepage and booking form.
- **Barangay GeoJSON** (`assets/data/baguio_barangays.geojson`) delivers boundary overlays—served via fetch, so a local server is required in development.
- **OSRM routing service** provides live driving paths between the customer's location and the selected shop.
- **Local/session storage** persists customer details and shop choices between pages.
- **Geolocation API** drives “Use My Location” flows for accurate pickup pins.

## 🛠️ Technical Stack

- **Languages:** HTML5, CSS3, modern JavaScript (ES6+).
- **Architecture:** Feature-based modular directories for CSS, JS, and assets.
- **Styling:** CSS Grid, Flexbox, custom properties, responsive breakpoints (>1025px desktop, 769–1024px tablet, ≤768px mobile).
- **Performance:** Lazy module initialization, scoped bundles, optimized imagery, minimal external dependencies.

## 🧑‍� Development Guidelines

- Keep feature-specific assets within their module (e.g., booking map logic under `features/booking-form/assets/js/features/`).
- Use relative paths when referencing shared assets to maintain portability.
- Update homepage navigation and booking integration scripts when adding new sections or shops.
- For new scheduling logic, extend the helpers in `core/config.js`, `features/time-slots.js`, and `shared/utils/validation.js`.

## 👥 Credits

**Capstone Project Development Team:**
- **Giacao, Mike Joshua S.** - Lead Developer
- **Ramos, Denver Ivan A.** - Frontend Developer  
- **Lacanaria, Armel B.** - System Architect

**Institution:** University of the Cordilleras, Baguio City, Benguet

## 📄 License

This project is developed as a capstone project for academic purposes.

## 🔄 Version History

### v2.5.0 (Current)
- Added live routing previews between customer geolocation and selected shops, including distance and ETA display.
- Simplified homepage map controls by removing unused highway overlays and renaming the toggle to "Hide/Show Shops".

### v2.4.0
- Built the initial dashboard foundation with secure routing, placeholder modules, and data models for upcoming analytics features.

### v2.3.0
- Added shop-to-booking hand-off with session storage and query parameter support.
- Introduced barangay overlays, filters, and highlight tooling across homepage and booking maps.
- Implemented silent auto-fill, field-level persistence, and email domain suggestions.
- Expanded pickup/self-claim scheduling with dedicated calendars, rush rules, and improved validation.
- Enhanced Leaflet controls with multi-tier tile fallbacks, custom location button, and geolocation feedback.
- Reorganized receipt templates for easier customization.

### v2.2.0
- Fixed map integration with reliable tile servers (Google Maps → Esri → Stadia Maps).
- Restored booking form functionality from backup and verified navigation links.
- Improved map error handling and GPS location services.

### v2.1.0
- Enhanced homepage responsiveness, logo sizing, and typography.
- Isolated CSS dependencies and optimized layout balance.

### v2.0.0
- Migrated to feature-based modular architecture.
- Separated homepage and booking form bundles.

### v1.0.0
- Initial release with basic multi-step booking functionality and responsive layout.

---

**🧺 Wash.IT – Transforming Laundry Services with Modern Technology**
