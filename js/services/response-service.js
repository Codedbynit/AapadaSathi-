/**
 * AapadaSathi Response Service
 */

import { ResponseApi } from '../api/response-api.js';

export class ResponseService {
  static async getOverview() {
    try {
      const res = await ResponseApi.getOverview();
      return res.data;
    } catch { return null; }
  }
}
