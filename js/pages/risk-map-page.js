/**
 * Page Controller: Live Risk Map
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { MapController } from '../maps/map-controller.js';
import { RiskMarkers } from '../maps/risk-markers.js';
import { Toast } from '../components/toast.js';
import { TranslationService } from '../services/translation-service.js';

export class RiskMapPage {
  static mapController = null;

  static async render(container) {
    const settlements = await RiskService.getAllSettlements();

    // Enrich each settlement with real river discharge from Open-Meteo Flood Forecast
    // Fetch all in parallel; if any fail, that settlement gets river_discharge_m3s = null
    await Promise.allSettled(
      settlements.map(async (s) => {
        try {
          const res = await fetch(
            `${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
              ? 'http://localhost:8000/api'
              : '/api'}/flood?lat=${s.latitude}&lon=${s.longitude}`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (res.ok) {
            const json = await res.json();
            s.river_discharge_m3s = (json.river_discharge_m3s !== undefined && json.river_discharge_m3s !== null)
              ? json.river_discharge_m3s
              : null;
          } else {
            s.river_discharge_m3s = null;
          }
        } catch {
          s.river_discharge_m3s = null;
        }
      })
    );

    const activeSettlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage') || 'en';

    container.innerHTML = `
      <div class="map-page-wrapper fade-in">
        <!-- Map Floating Control Toolbar -->
        <div class="glass-panel map-toolbar">
          <div class="map-filters-group">
            <span style="font-size:0.8rem; font-weight:700; color:var(--color-accent); text-transform:uppercase; margin-right:0.25rem;">
              <i class="fa-solid fa-filter"></i> ${TranslationService.t('filters', lang)}
            </span>
            <button class="filter-chip active" data-filter="ALL">${TranslationService.t('allHazards', lang)}</button>
            <button class="filter-chip" data-filter="FLOOD">${TranslationService.t('flooding', lang)}</button>
            <button class="filter-chip" data-filter="EROSION">${TranslationService.t('erosion', lang)}</button>
            <button class="filter-chip" data-filter="CRITICAL_ONLY">${TranslationService.t('criticalOnly', lang)}</button>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem;">
            <!-- View Mode Switcher (Map vs Accessible List) -->
            <button class="btn btn-secondary btn-sm" id="btn-toggle-map-view">
              <i class="fa-solid fa-list"></i> <span id="view-toggle-text">${TranslationService.t('listView', lang)}</span>
            </button>
            <div class="freshness-tag" style="margin:0;">
              <i class="fa-solid fa-circle-dot" style="color:#10b981;"></i> ${TranslationService.t('realtimeSimulation', lang)}
            </div>
          </div>
        </div>

        <!-- Main Map Canvas -->
        <div class="map-canvas-container" id="map-container-frame">
          <div id="leaflet-risk-map" role="region" aria-label="Interactive disaster risk map"></div>

          <!-- Floating Map Legend -->
          <div class="map-legend-box" id="map-legend">
            <div class="legend-title">${TranslationService.t('riskSeverityScale', lang)}</div>
            <div class="legend-item"><span class="risk-dot risk-dot-critical"></span> ${TranslationService.t('criticalScale', lang)}</div>
            <div class="legend-item"><span class="risk-dot risk-dot-high"></span> ${TranslationService.t('highScale', lang)}</div>
            <div class="legend-item"><span class="risk-dot risk-dot-moderate"></span> ${TranslationService.t('moderateScale', lang)}</div>
            <div class="legend-item"><span class="risk-dot risk-dot-low"></span> ${TranslationService.t('lowScale', lang)}</div>
          </div>

          <!-- Fallback List View (Accessible Text Mode) -->
          <div class="map-fallback-list" id="map-fallback-list">
            ${settlements.map(s => `
              <div class="glass-panel" style="padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <h4 style="color:#0f2b48;">${s.name}</h4>
                    <div style="font-size:0.75rem; color:#64748b;">${s.district}, ${s.state}</div>
                  </div>
                  <span class="status-badge ${s.riskLevel ? RiskService.getRiskBadgeClass(s.riskLevel) : 'badge-neutral'}">${s.riskLevel || 'Unavailable'}</span>
                </div>
                <div style="font-size:0.85rem; color:#334155;">
                  <div><strong>${TranslationService.t('hazardLabel', lang)}</strong> ${s.hazardType || 'Unknown'}</div>
                  <div><strong>${TranslationService.t('riskScore', lang)}:</strong> ${s.riskScore !== undefined ? s.riskScore + '/100' : 'N/A'}</div>
                  <div><strong>${TranslationService.t('leadTimeLabel', lang)}</strong> ${s.leadTimeHours !== undefined ? s.leadTimeHours + ' hrs' : 'N/A'}</div>
                  <div><strong>${TranslationService.t('populationLabel', lang)}</strong> ${s.population.toLocaleString()}</div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                  <button class="btn btn-primary btn-sm fallback-view-btn" data-id="${s.id}" style="flex:1;">
                    ${TranslationService.t('viewRiskBtn', lang)}
                  </button>
                  ${s.evacuationRequired ? `
                    <button class="btn btn-danger btn-sm fallback-route-btn" data-id="${s.id}" style="flex:1;">
                      ${TranslationService.t('safeRouteBtn', lang)}
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.initMap(settlements, activeSettlementId);
    this.attachEvents(settlements);
  }

  static initMap(settlements, activeSettlementId) {
    // Teardown previous controller instance if existing
    if (this.mapController) {
      this.mapController.destroy();
    }

    this.mapController = new MapController('leaflet-risk-map');
    const map = this.mapController.init();

    if (!map) {
      console.warn('[RiskMapPage] Map initialization failed, activating fallback list.');
      this.toggleListView(true);
      return;
    }

    this.renderMarkers(settlements);

    // If an active settlement is selected, pan to it and open popup
    const target = settlements.find(s => s.id === activeSettlementId);
    if (target) {
      this.mapController.panTo([target.latitude, target.longitude], 12);
    }
  }

  static renderMarkers(settlementsToRender) {
    if (!this.mapController || !this.mapController.map) return;
    this.mapController.clearLayers();

    const layerGroup = L.featureGroup();

    settlementsToRender.forEach(settlement => {
      const icon = RiskMarkers.createDivIcon(settlement);
      const marker = L.marker([settlement.latitude, settlement.longitude], { icon });

      RiskMarkers.bindPopup(
        marker,
        settlement,
        (id) => {
          state.set('activeSettlementId', id);
          window.location.hash = '#risk-dashboard';
        },
        (id) => {
          state.set('activeSettlementId', id);
          window.location.hash = '#safe-route';
        }
      );

      marker.addTo(layerGroup);
    });

    layerGroup.addTo(this.mapController.map);
    this.mapController.activeLayers.set('settlement-markers', layerGroup);
  }

  static attachEvents(settlements) {
    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        filterChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const filter = e.currentTarget.getAttribute('data-filter');
        let filtered = settlements;

        if (filter === 'FLOOD') {
          filtered = settlements.filter(s => s.hazardType.includes('FLOOD'));
        } else if (filter === 'EROSION') {
          filtered = settlements.filter(s => s.hazardType.includes('EROSION'));
        } else if (filter === 'CRITICAL_ONLY') {
          filtered = settlements.filter(s => s.riskLevel === 'CRITICAL');
        }

        this.renderMarkers(filtered);
        Toast.show(`Showing ${filtered.length} settlements for filter: ${e.currentTarget.innerText}`, 'info', 2000);
      });
    });

    // Toggle between map and fallback list
    const toggleBtn = document.getElementById('btn-toggle-map-view');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isListVisible = document.getElementById('map-fallback-list').style.display === 'grid';
        this.toggleListView(!isListVisible);
      });
    }

    // Fallback list buttons
    document.querySelectorAll('.fallback-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.set('activeSettlementId', e.currentTarget.getAttribute('data-id'));
        window.location.hash = '#risk-dashboard';
      });
    });

    document.querySelectorAll('.fallback-route-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.set('activeSettlementId', e.currentTarget.getAttribute('data-id'));
        window.location.hash = '#safe-route';
      });
    });
  }

  static toggleListView(showList) {
    const mapEl = document.getElementById('leaflet-risk-map');
    const listEl = document.getElementById('map-fallback-list');
    const legendEl = document.getElementById('map-legend');
    const toggleText = document.getElementById('view-toggle-text');

    if (showList) {
      if (mapEl) mapEl.style.display = 'none';
      if (legendEl) legendEl.style.display = 'none';
      if (listEl) listEl.style.display = 'grid';
      if (toggleText) toggleText.innerText = 'Map View';
    } else {
      if (mapEl) mapEl.style.display = 'block';
      if (legendEl) legendEl.style.display = 'flex';
      if (listEl) listEl.style.display = 'none';
      if (toggleText) toggleText.innerText = 'List View';
      if (this.mapController && this.mapController.map) {
        this.mapController.map.invalidateSize();
      }
    }
  }
}
