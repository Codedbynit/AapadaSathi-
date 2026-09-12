/**
 * AapadaSathi Map Controller
 * Initializes, manages, and cleans up Leaflet map instances.
 */

import { MAP_CONFIG } from './map-config.js';

export class MapController {
  constructor(elementId, customOptions = {}) {
    this.elementId = elementId;
    this.map = null;
    this.options = { ...MAP_CONFIG, ...customOptions };
    this.activeLayers = new Map();
  }

  init() {
    const el = document.getElementById(this.elementId);
    if (!el) {
      console.warn(`[MapController] Target element #${this.elementId} not found.`);
      return null;
    }

    // Clean existing map instance if any attached to the element
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    try {
      this.map = L.map(this.elementId, {
        center: this.options.center,
        zoom: this.options.zoom,
        minZoom: this.options.minZoom,
        maxZoom: this.options.maxZoom,
        zoomControl: true,
        attributionControl: true
      });

      // Add base tile layer
      const tileLayer = L.tileLayer(this.options.tileUrl, {
        attribution: this.options.attribution,
        subdomains: 'abcd',
        maxZoom: this.options.maxZoom
      });

      tileLayer.on('tileerror', (error) => {
        console.warn('[MapController] Tile load error, check network connection:', error);
      });

      tileLayer.addTo(this.map);

      // Invalidate size once container renders
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 300);

      return this.map;
    } catch (err) {
      console.error('[MapController] Initialization failed:', err);
      return null;
    }
  }

  panTo(latlng, zoom = 13) {
    if (this.map && latlng) {
      this.map.flyTo(latlng, zoom, { duration: 1.2 });
    }
  }

  removeLayerByKey(key) {
    const layer = this.activeLayers.get(key);
    if (layer && this.map) {
      this.map.removeLayer(layer);
    }
    this.activeLayers.delete(key);
  }

  clearLayers() {
    this.activeLayers.forEach(layer => {
      if (this.map && layer) this.map.removeLayer(layer);
    });
    this.activeLayers.clear();
  }

  destroy() {
    this.clearLayers();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
