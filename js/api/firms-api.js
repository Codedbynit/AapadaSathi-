/**
 * AapadaSathi NASA FIRMS API Client
 * Fetches satellite thermal anomaly / active fire detection records from FastAPI backend.
 */

import { ApiClient } from './api-client.js';

export class FirmsApi {
  /**
   * Fetch NASA FIRMS satellite fire detections for bounding box
   * Bounding box order: west, south, east, north (default Assam: 89.5, 24.0, 96.0, 28.5)
   * @param {number} west
   * @param {number} south
   * @param {number} east
   * @param {number} north
   */
  static async getDetections(west = 89.5, south = 24.0, east = 96.0, north = 28.5) {
    try {
      const response = await ApiClient.get(`/firms?west=${west}&south=${south}&east=${east}&north=${north}`);
      const data = response.data;

      if (Array.isArray(data)) {
        return { status: 'ok', detections: data };
      } else if (data && typeof data === 'object') {
        if (data.status === 'unavailable') {
          return { status: 'unavailable', detections: [] };
        }
        if (Array.isArray(data.detections)) {
          return { status: data.status || 'ok', detections: data.detections };
        }
      }
      return { status: 'ok', detections: [] };
    } catch (error) {
      console.warn('[FirmsApi] NASA FIRMS call failed or unavailable:', error.message);
      return { status: 'unavailable', detections: [] };
    }
  }
}
