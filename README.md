# AapadaSathi
> **“Early warnings. Safer decisions.”**

AapadaSathi is an AI-assisted, settlement-level disaster early-warning and evacuation guidance platform. It combines weather, hydrological, satellite, sensor, and historical incident data to show localized disaster risk and turn warnings into clear, actionable instructions.

---

## 1. Quick Start: How to Run the Frontend

The application requires **zero complex build tools**, NPM bundlers, or compilation. It runs directly in modern browsers via standard ES6 modules and any local HTTP server.

### Option A: Using Python (Recommended)
```bash
# In the project directory:
python -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.

### Option B: Using Node / NPX
```bash
npx serve . -p 8080
```
Open **`http://localhost:8080`** in your browser.

### Option C: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

## 2. Page Structure & Architecture

AapadaSathi is built using a high-performance **Glassmorphism Design System** in Vanilla JavaScript and CSS3. Navigation is orchestrated via a hash router (`#home`, `#risk-dashboard`, `#risk-map`, `#safe-route`, `#alerts`, `#response-dashboard`) that preserves state while offering instant response times.

### Page Breakdown
| Page | Route | Description |
| :--- | :--- | :--- |
| **Landing / Home** | `#home` | Hero with settlement search, quick status counters, 4-step workflow (Detect &rarr; Assess &rarr; Warn &rarr; Guide), active warning previews, and multi-source fusion trust pillars. |
| **Resident Risk Dashboard** | `#risk-dashboard` | Settlement context bar, radial risk gauge (0–100), 6 contributing meteorological & hydrological factors, resident safety checklist, and 1-click **Find Safe Evacuation Route** CTA. |
| **Live Risk Map** | `#risk-map` | Full Leaflet.js basin map with pulsating risk markers, hazard/severity filter chips, settlement search auto-pan, popups with lead times, and accessible text-list fallback. |
| **Safe Evacuation Route** | `#safe-route` | **Key Differentiating Feature:** Visualizes the designated evacuation corridor on Leaflet, avoiding flooded hazard polygons and impassable culvert breaches to reach high-ground shelters. |
| **Alerts Page** | `#alerts` | Filterable alert feed with severity chips, hazard categories, read/acknowledged toggle, and detail modal. |
| **Response Dashboard** | `#response-dashboard` | Incident Command System cockpit for disaster officials & judges: Aggregate basin metrics, priority settlement queue, model evaluation metrics, sensor health, and Alert Composer. |

---

## 3. File & Directory Structure

```text
AapadaSathi-/
├── index.html                           # Main SPA shell & route target
├── pages/                               # Direct entry / standalone redirect pages
│   ├── home.html
│   ├── risk-dashboard.html
│   ├── risk-map.html
│   ├── safe-route.html
│   ├── alerts.html
│   └── response-dashboard.html
├── css/
│   ├── variables.css                    # Design tokens (ocean teal, cyan, risk scale, glass optics)
│   ├── base.css                         # Reset, typography, animations, accessible focus states
│   ├── layout.css                       # Header, navigation, mobile drawer, bottom nav bar, footer
│   ├── glassmorphism.css                # Frosted glass panels, backdrop-filters, ambient glows
│   ├── components.css                   # Buttons, badges, SVG risk gauge, checklist, modals, toasts
│   ├── responsive.css                   # Mobile (<768px), tablet (<1024px), desktop breakpoints
│   └── pages/                           # Dedicated modular stylesheets
│       ├── home.css
│       ├── risk-dashboard.css
│       ├── risk-map.css
│       ├── safe-route.css
│       ├── alerts.css
│       └── response-dashboard.css
├── js/
│   ├── app.js                           # App bootstrapper
│   ├── config.js                        # App config (USE_MOCK_DATA, API_BASE_URL, default coordinates)
│   ├── state.js                         # Central reactive state store with event pub/sub
│   ├── router.js                        # Hash-based client router
│   ├── api/                             # API clients (prepared for FastAPI)
│   │   ├── api-client.js                # Unified fetch wrapper with latency simulation & error handling
│   │   ├── risk-api.js                  # Settlements & risk calculation endpoints
│   │   ├── alert-api.js                 # Alert feed & preview endpoints
│   │   ├── route-api.js                 # Evacuation route & shelter endpoints
│   │   └── response-api.js              # Aggregated metrics & data pipeline endpoints
│   ├── services/                        # Business logic & domain models
│   │   ├── mock-data-service.js         # Realistic riverine dataset (Majuli / Brahmaputra basin)
│   │   ├── risk-service.js              # Risk score calculations & color mapping
│   │   ├── alert-service.js             # Filter & sort logic for active warnings
│   │   ├── route-service.js             # Safe route calculator and GeoJSON provider
│   │   └── translation-service.js       # English, Hindi, and Assamese multi-lingual dictionary
│   ├── maps/                            # Leaflet geospatial mapping subsystem
│   │   ├── map-config.js                # Default zoom, coordinates, bounds
│   │   ├── map-controller.js            # Map lifecycle manager & layer orchestrator
│   │   ├── risk-markers.js              # Animated risk markers & rich glass popups
│   │   └── route-layer.js               # Evacuation corridors, hazard polygons, shelters
│   └── pages/                           # View controllers
│       ├── home-page.js
│       ├── risk-dashboard-page.js
│       ├── risk-map-page.js
│       ├── safe-route-page.js
│       ├── alerts-page.js
│       └── response-dashboard-page.js
├── assets/
│   └── demo-route.geojson               # High-fidelity GeoJSON with corridor, hazard polygon & blockage
├── docs/
│   ├── ui-flow.md                       # Persona user journey & interaction architecture
│   ├── api-contract.md                  # Complete FastAPI endpoints specification
│   └── route-integration.md             # Guide for OSRM / OpenRouteService / GIS integration
└── README.md
```

---

## 4. How to Switch from Mock Mode to FastAPI Backend

1. Open **[`js/config.js`](file:///c:/Users/91860/OneDrive/web%20dev/AapadaSathi/AapadaSathi-/js/config.js)**.
2. Toggle the `USE_MOCK_DATA` flag to `false`:
   ```javascript
   export const CONFIG = {
     USE_MOCK_DATA: false,
     API_BASE_URL: 'http://localhost:8000/api',
     // ...
   };
   ```
3. Start your FastAPI backend server at `http://localhost:8000`.
4. The frontend will automatically execute real HTTP `fetch()` requests conforming to [`docs/api-contract.md`](file:///c:/Users/91860/OneDrive/web%20dev/AapadaSathi/AapadaSathi-/docs/api-contract.md). If the backend is unavailable or crashes, the frontend gracefully degrades to demonstration data with a non-blocking toast warning.

---

## 5. How to Test the Safe-Route Experience

1. Open the application and navigate to **"My Settlement"** (`#risk-dashboard`).
2. Ensure **Mikirpara Settlement** is selected (or pick it from the dropdown).
3. Notice the **CRITICAL (Score: 89)** status, the pulsating warning, and the prominent red **"Find Safe Evacuation Route"** button.
4. Click the button (or visit `#safe-route`).
5. Observe:
   - The interactive Leaflet map rendering the **Green Dashed Evacuation Corridor**.
   - The **Red Translucent Flood Polygon** representing the inundated riverbank.
   - The **Impassable Culvert Warning Point** (South Embankment Road km 3.2).
   - The **Safe Shelter Pin** (Model Higher Secondary Shelter, High Ground).
   - Turn-by-turn numbered walking directions and shelter amenity readiness.
   - The 1-tap **Call Emergency: 112** action button.

---

## 6. Assumptions & Demo Features

- **No Paid API Keys Required**: Uses CartoDB Positron / OSM public tile services and Font Awesome 6 CDN.
- **Demo Region**: Focuses on the Brahmaputra River Basin (Majuli District, Assam), a real-world flood hotspot prone to flash inundation and riverbank erosion.
- **Simulated SMS / Broadcast Sandbox**: The Alert Composer simulates 160-character cellular SMS and app push notifications safely in the browser without dispatching live telecom traffic.
- **Model Evaluation Disclaimer**: The model precision/recall metrics in the Response Dashboard are computed on historical holdout validation datasets and labeled as prototype decision support.

---

## 7. Next Recommended Implementation Steps

1. **FastAPI Backend Setup**: Implement the endpoints defined in [`docs/api-contract.md`](file:///c:/Users/91860/OneDrive/web%20dev/AapadaSathi/AapadaSathi-/docs/api-contract.md) using SQLAlchemy / Pydantic.
2. **Dynamic GIS Routing**: Connect `RouteApi` to an OSRM or OpenRouteService instance passing real-time flooded polygons in `avoid_polygons` as described in [`docs/route-integration.md`](file:///c:/Users/91860/OneDrive/web%20dev/AapadaSathi/AapadaSathi-/docs/route-integration.md).
3. **PWA & Offline Service Worker**: Add a service worker (`sw.js`) to cache the evacuation route and instructions for offline use when mobile connectivity is cut during severe floods.
