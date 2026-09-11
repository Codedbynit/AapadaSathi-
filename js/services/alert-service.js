/**
 * AapadaSathi Alert Service
 */

import { AlertApi } from '../api/alert-api.js';

export class AlertService {
  static async getAlerts(filters = {}) {
    try {
      const res = await AlertApi.getAlerts(filters);
      return res.data;
    } catch { return []; }
  }

  static async previewAlert(payload) {
    try {
      const res = await AlertApi.previewAlert(payload);
      return res.data;
    } catch { return null; }
  }
}
