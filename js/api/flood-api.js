import { ApiClient } from './api-client.js';

export class FloodApi {
  /**
   * Fetch real river discharge data from our FastAPI backend
   */
  static async getRiverDischarge(lat, lon) {
    // We intentionally don't pass a mock fallback function here 
    // so it always attempts to fetch real data from the backend.
    return ApiClient.get(`/flood?lat=${lat}&lon=${lon}`);
  }
}
