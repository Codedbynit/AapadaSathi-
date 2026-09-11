/**
 * AapadaSathi Alert API
 * Integration endpoints for early warning alerts.
 */

import { ApiClient } from './api-client.js';
import { MOCK_ALERTS } from '../services/mock-data-service.js';

export class AlertApi {
  /**
   * Fetch active alerts
   * Backend endpoint: GET /api/alerts
   */
  static async getAlerts(filters = {}) {
    return ApiClient.get('/alerts', () => {
      let results = [...MOCK_ALERTS];
      if (filters.severity && filters.severity !== 'ALL') {
        results = results.filter(a => a.severity === filters.severity);
      }
      if (filters.hazard && filters.hazard !== 'ALL') {
        results = results.filter(a => a.hazardType.includes(filters.hazard));
      }
      if (filters.settlementId) {
        results = results.filter(a => a.settlementId === filters.settlementId);
      }
      return results;
    });
  }

  /**
   * Preview an alert message in SMS and in-app formats
   * Backend endpoint: POST /api/alerts/preview
   */
  static async previewAlert(payload) {
    return ApiClient.post('/alerts/preview', payload, (p) => {
      const lang = p.language || 'en';
      const msg = `[AapadaSathi ALERT] ${p.settlementName || 'Your Settlement'}: Predicted ${p.hazardType || 'Flood'} risk level is HIGH. Evacuate via North Embankment to designated safe shelter. Helpline: 112.`;
      return {
        smsText: msg,
        inAppText: msg,
        characterCount: msg.length,
        language: lang,
        generatedAt: new Date().toLocaleTimeString()
      };
    });
  }
}
