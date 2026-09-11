# AapadaSathi Real GIS & Evacuation Routing Integration Guide

## 1. Architectural Separation
The frontend decouples routing into three clean layers:

1. **Network Layer (`js/api/route-api.js`)**: Fetches route coordinates and GeoJSON features from the backend or an external routing engine.
2. **Domain Service (`js/services/route-service.js`)**: Normalizes route geometry, computes turn steps, parses barrier points, and handles cache fallback.
3. **Map Rendering Layer (`js/maps/route-layer.js`)**: Renders GeoJSON lines, flood hazard polygons, and shelter pins onto the Leaflet map without any tight coupling to backend logic.

---

## 2. Integrating with Open Source Routing Machine (OSRM)
To compute live paths avoiding flooded road sections:

```javascript
// Example modification inside js/api/route-api.js
export class RouteApi {
  static async getLiveOsrmRoute(originCoords, destinationCoords, avoidPolygons = []) {
    // Coordinates format: [lng, lat]
    const coordsString = `${originCoords[1]},${originCoords[0]};${destinationCoords[1]},${destinationCoords[0]}`;
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(osrmUrl);
    const data = await response.json();
    return data.routes[0]; // Contains geojson geometry and step instructions
  }
}
```

---

## 3. Integrating with OpenRouteService (ORS) Avoid Polygons
OpenRouteService natively supports avoiding custom hazard polygons (such as Copernicus SAR flood footprints):

```json
POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
{
  "coordinates": [[94.1820, 26.9650], [94.2250, 26.9940]],
  "options": {
    "avoid_polygons": {
      "type": "Polygon",
      "coordinates": [
        [[94.1700, 26.9550], [94.1900, 26.9580], [94.2050, 26.9650], [94.1700, 26.9550]]
      ]
    }
  }
}
```

---

## 4. Government GIS & Open Data Integrations
- **Bhuvan (ISRO)**: Inundation layer WMS tiles can be added directly to `js/maps/map-controller.js` as an overlay tile layer.
- **National Disaster Management Authority (NDMA)**: Shelter registry APIs can be connected to populate `shelterDetails`.
- **Central Water Commission (CWC)**: Hydrological telemetry stations push river level heights at 15-minute intervals.
