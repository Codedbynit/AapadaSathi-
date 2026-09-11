/**
 * AapadaSathi Risk API
 * Integration endpoints for settlements and risk assessments.
 */

import { ApiClient } from './api-client.js';
import { MOCK_SETTLEMENTS, MOCK_RISK_DETAILS } from '../services/mock-data-service.js';

export class RiskApi {
  /**
   * Fetch list of all monitored settlements
   * Backend endpoint: GET /api/settlements
   */
  static async getSettlements() {
    return ApiClient.get('/settlements', () => MOCK_SETTLEMENTS);
  }

  /**
   * Fetch settlement-level disaster risk calculation & factor breakdown
   * Backend endpoint: GET /api/risk/{settlement_id}
   */
  static async getRiskBySettlementId(settlementId) {
    return ApiClient.get(`/risk/${settlementId}`, () => {
      return MOCK_RISK_DETAILS[settlementId] || MOCK_RISK_DETAILS["settlement-01"];
    });
  }

  /**
   * Search settlements by name/district
   */
  static async searchSettlements(query) {
    return ApiClient.get(`/settlements/search?q=${encodeURIComponent(query)}`, () => {
      const q = query.toLowerCase().trim();
      if (!q) return MOCK_SETTLEMENTS;
      return MOCK_SETTLEMENTS.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.district.toLowerCase().includes(q)
      );
    });
  }
}
