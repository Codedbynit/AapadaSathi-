/**
 * AapadaSathi Map Configuration
 * Tile URL is fetched from /api/config so the CARTO API key stays server-side.
 */

import { CONFIG } from '../config.js';

// Resolved tile URL and attribution (populated by loadMapConfig before map init)
let _resolvedTileUrl = CONFIG.MAP_TILE_URL;
let _resolvedAttribution = CONFIG.MAP_ATTRIBUTION;

/**
 * Fetch CARTO tile URL from the backend config endpoint.
 * Must be called (and awaited) before constructing MAP_CONFIG.
 */
export async function loadMapConfig() {
  try {
    const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:8000/api'
      : '/api';
    const res = await fetch(`${apiBase}/config`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.map_tile_url) _resolvedTileUrl = data.map_tile_url;
      if (data.map_attribution) _resolvedAttribution = data.map_attribution;
    }
  } catch {
    // Silently fall back to keyless URL already set above
  }
}

export const MAP_CONFIG = {
  center: CONFIG.DEFAULT_MAP_CENTER,
  zoom: CONFIG.DEFAULT_MAP_ZOOM,
  minZoom: 8,
  maxZoom: 18,
  get tileUrl() { return _resolvedTileUrl; },
  get attribution() { return _resolvedAttribution; }
};
