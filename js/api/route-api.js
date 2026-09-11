/**
 * AapadaSathi Safe Route API
 * Integration point for evacuation routes, safe shelter databases, and hazard overlays.
 * 
 * EXTENSION TO REAL GIS:
 * When connecting to real GIS or routing services (OSRM / OpenRouteService / FastAPI):
 * 1. Set CONFIG.USE_MOCK_DATA = false
 * 2. This class calls GET /api/routes/{settlement_id}
 * 3. The backend returns route geometry (GeoJSON LineString) avoiding flood polygons.
 */

import { ApiClient } from './api-client.js';


export class RouteApi {
  /**
   * Fetch safe evacuation route and shelter for settlement
   * Backend endpoint: GET /api/routes/{settlement_id}
   */
  static async getRouteBySettlementId(settlementId) {
    return ApiClient.get(`/routes/${settlementId}`);
  }

  /**
   * Fetch GeoJSON feature collection for corridor, hazard zones, and shelters
   * In mock mode, loads from assets/demo-route.geojson
   */
  static async getRouteGeoJson() {
    try {
      const res = await fetch('assets/demo-route.geojson');
      if (res.ok) {
        const geojson = await res.json();
        return { data: geojson, isMock: true, status: 200 };
      }
    } catch (e) {
      console.warn('[RouteApi] Could not load local demo-route.geojson, fallback to embedded mock:', e.message);
    }

    // Fallback embedded geometry
    return {
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "corridor-primary", name: "Primary Evacuation Corridor" },
            geometry: {
              type: "LineString",
              coordinates: [
                [94.1820, 26.9650],
                [94.1890, 26.9710],
                [94.2020, 26.9790],
                [94.2140, 26.9860],
                [94.2250, 26.9940]
              ]
            }
          }
        ]
      },
      isMock: true,
      status: 200
    };
  }
}
