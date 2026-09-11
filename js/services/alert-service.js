/**
 * AapadaSathi Alert Service
 */

import { AlertApi } from '../api/alert-api.js';

export class AlertService {
  static async getAlerts(filters = {}) {
    const res = await AlertApi.getAlerts(filters);
    return res.data;
  }

  static async previewAlert(payload) {
    const res = await AlertApi.previewAlert(payload);
    return res.data;
  }
}
