/**
 * AapadaSathi Alert API
 * Integration endpoints for early warning alerts.
 */

import { ApiClient } from './api-client.js';

export class AlertApi {
  /**
   * Fetch active alerts
   * Backend endpoint: GET /api/alerts
   */
  static async getAlerts(filters = {}) {
    return ApiClient.get('/alerts');
  }

  /**
   * Preview an alert message in SMS and in-app formats
   * Backend endpoint: POST /api/alerts/preview
   */
  static async previewAlert(payload) {
    return ApiClient.post('/alerts/preview', payload);
  }
}
