/**
 * AapadaSathi Application Configuration
 * Centralized settings for API endpoints, Mock Mode, Maps, and Defaults.
 * 
 * IMPORTANT FOR BACKEND INTEGRATION:
 * When FastAPI backend is running, set USE_MOCK_DATA to false.
 */

export const CONFIG = {
  // Toggle between local high-fidelity mock data and live FastAPI backend
  USE_MOCK_DATA: true,

  // Future FastAPI backend base URL
  API_BASE_URL: 'http://localhost:8000/api',

  // Request timeout in milliseconds
  API_TIMEOUT_MS: 6000,

  // Simulated latency for realistic demo feel when USE_MOCK_DATA is true (ms)
  MOCK_LATENCY_MS: 250,

  // Default region: Brahmaputra River Basin (Majuli District, Assam)
  DEFAULT_MAP_CENTER: [26.9720, 94.2000],
  DEFAULT_MAP_ZOOM: 12,

  // Crisp, beautiful light mode map tiles (CartoDB Voyager - no paid key needed)
  MAP_TILE_URL: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  MAP_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',

  // Default settlement ID for initial state
  DEFAULT_SETTLEMENT_ID: 'settlement-01',

  // Default language ('en' | 'hi' | 'as')
  DEFAULT_LANGUAGE: 'en',

  // Default user persona ('resident' | 'official')
  DEFAULT_PERSONA: 'resident',

  // Emergency services helpline
  EMERGENCY_HELPLINE: '112 / 1070 (SDRF)'
};
