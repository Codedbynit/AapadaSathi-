/**
 * AapadaSathi API Client
 * Unified HTTP abstraction with mock mode interceptors, timeouts, and error normalization.
 * Connects seamlessly to future FastAPI backend when CONFIG.USE_MOCK_DATA = false.
 */

import { CONFIG } from '../config.js';

export class ApiClient {
  /**
   * Universal GET request
   * @param {string} endpoint - API path (e.g. '/settlements')
   * @param {Function} mockFallbackFn - function returning mock data if mock mode is on
   */
  static async get(endpoint, mockFallbackFn) {
    if (CONFIG.USE_MOCK_DATA) {
      // Simulate realistic network delay for authentic interactive feeling
      await new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_LATENCY_MS));
      if (typeof mockFallbackFn === 'function') {
        return { data: mockFallbackFn(), isMock: true, status: 200 };
      }
    }

    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, isMock: false, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`[ApiClient] Live API call to ${url} failed. Falling back to mock data if available:`, error.message);

      // Non-blocking graceful degradation: Fallback to mock if live API is unavailable
      if (typeof mockFallbackFn === 'function') {
        return { data: mockFallbackFn(), isMock: true, status: 200, fallbackTriggered: true };
      }

      throw error;
    }
  }

  /**
   * Universal POST request
   */
  static async post(endpoint, payload, mockFallbackFn) {
    if (CONFIG.USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_LATENCY_MS));
      if (typeof mockFallbackFn === 'function') {
        return { data: mockFallbackFn(payload), isMock: true, status: 200 };
      }
    }

    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      return { data, isMock: false, status: response.status };
    } catch (error) {
      console.warn(`[ApiClient] POST to ${url} failed.`, error.message);
      if (typeof mockFallbackFn === 'function') {
        return { data: mockFallbackFn(payload), isMock: true, status: 200, fallbackTriggered: true };
      }
      throw error;
    }
  }
}
