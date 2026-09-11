/**
 * AapadaSathi Safe Route Service
 * Business logic for evacuation corridors, shelter matching, and turns.
 */

import { RouteApi } from '../api/route-api.js';

export class RouteService {
  static async getRoute(settlementId) {
    const res = await RouteApi.getRouteBySettlementId(settlementId);
    return res.data;
  }

  static async getGeoJson() {
    const res = await RouteApi.getRouteGeoJson();
    return res.data;
  }
}
