/**
 * AapadaSathi Safe Route Service
 * Business logic for evacuation corridors, shelter matching, and turns.
 */

import { RouteApi } from '../api/route-api.js';

export class RouteService {
  static async getRoute(settlementId) {
    try {
      const res = await RouteApi.getRouteBySettlementId(settlementId);
      return res.data;
    } catch { return null; }
  }

  static async getGeoJson() {
    try {
      const res = await RouteApi.getRouteGeoJson();
      return res.data;
    } catch { return null; }
  }
}
