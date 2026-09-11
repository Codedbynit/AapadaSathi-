/**
 * AapadaSathi Response Service
 */

import { ResponseApi } from '../api/response-api.js';

export class ResponseService {
  static async getOverview() {
    const res = await ResponseApi.getOverview();
    return res.data;
  }
}
