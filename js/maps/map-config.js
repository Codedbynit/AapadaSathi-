/**
 * AapadaSathi Map Configuration
 */

import { CONFIG } from '../config.js';

export const MAP_CONFIG = {
  center: CONFIG.DEFAULT_MAP_CENTER,
  zoom: CONFIG.DEFAULT_MAP_ZOOM,
  minZoom: 8,
  maxZoom: 18,
  tileUrl: CONFIG.MAP_TILE_URL,
  attribution: CONFIG.MAP_ATTRIBUTION
};
