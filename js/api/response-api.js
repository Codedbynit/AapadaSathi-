/**
 * AapadaSathi Official Response API
 * Aggregated metrics, pipeline health, model evaluation, and resource allocations.
 */

import { ApiClient } from './api-client.js';
import { MOCK_RESPONSE_OVERVIEW } from '../services/mock-data-service.js';

export class ResponseApi {
  /**
   * Fetch official overview metrics & source health
   * Backend endpoint: GET /api/response/overview
   */
  static async getOverview() {
    return ApiClient.get('/response/overview', () => {
      return MOCK_RESPONSE_OVERVIEW;
    });
  }
}
