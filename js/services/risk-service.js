/**
 * AapadaSathi Risk Service
 * Business logic for processing and formatting settlement risks.
 */

import { RiskApi } from '../api/risk-api.js';

export class RiskService {
  static async getAllSettlements() {
    const res = await RiskApi.getSettlements();
    return res.data;
  }

  static async getRisk(settlementId) {
    const res = await RiskApi.getRiskBySettlementId(settlementId);
    return res.data;
  }

  static async search(query) {
    const res = await RiskApi.searchSettlements(query);
    return res.data;
  }

  static getRiskColor(level) {
    switch ((level || '').toUpperCase()) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#ea580c';
      case 'MODERATE': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#38bdf8';
    }
  }

  static getRiskBadgeClass(level) {
    switch ((level || '').toUpperCase()) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MODERATE': return 'badge-moderate';
      case 'LOW': return 'badge-low';
      default: return 'badge-neutral';
    }
  }
}
