/**
 * AapadaSathi Risk API
 * Integration endpoints for settlements and risk assessments.
 */

import { ApiClient } from './api-client.js';


export class RiskApi {
  /**
   * Fetch list of all monitored settlements
   * Backend endpoint: GET /api/settlements
   */
  static async getSettlements() {
    return ApiClient.get('/settlements');
  }

  /**
   * Fetch settlement-level disaster risk calculation & factor breakdown
   * Backend endpoint: GET /api/risk/{settlement_id}
   */
  static async getRiskBySettlementId(settlementId) {
    return ApiClient.get(`/risk/${settlementId}`);
  }

  /**
   * Search settlements by name/district
   */
  static async searchSettlements(query) {
    const encoded = encodeURIComponent(query);
    return ApiClient.get(`/settlements/search?q=${encoded}`);
  }
}
