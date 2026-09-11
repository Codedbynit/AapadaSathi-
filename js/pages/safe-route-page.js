/**
 * Page Controller: Safe Route / Evacuation Guidance
 * Key Differentiating Feature: Visual Evacuation Corridors & Actionable Rescue Hub
 */

import { state } from '../state.js';
import { RouteService } from '../services/route-service.js';
import { RiskService } from '../services/risk-service.js';
import { MapController } from '../maps/map-controller.js';
import { RouteLayer } from '../maps/route-layer.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class SafeRoutePage {
  static mapController = null;

  static async render(container) {
    const settlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage');

    const riskData = await RiskService.getRisk(settlementId);
    const routeData = await RouteService.getRoute(settlementId);
    const geojsonData = await RouteService.getGeoJson();

    // Check if evacuation is recommended for current settlement
    if (!riskData.evacuationRequired) {
      container.innerHTML = `
        <div class="safe-route-container fade-in">
          <div class="glass-panel" style="padding:3rem 1.5rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem;">
            <div class="state-icon" style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.4);">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 style="color:#ffffff;">Evacuation is Not Currently Recommended</h2>
            <p style="max-width:520px; color:#cbd5e1;">
              <strong>${riskData.settlement.name}</strong> is currently at <strong>${riskData.riskLevel} RISK</strong>. No immediate evacuation has been mandated by district disaster authorities.
            </p>
            <div style="display:flex; gap:1rem; margin-top:1rem;">
              <a href="#risk-dashboard" class="btn btn-primary">
                <i class="fa-solid fa-gauge-high"></i> Monitor Risk Dashboard
              </a>
              <button class="btn btn-secondary" id="btn-demo-critical-route">
                <i class="fa-solid fa-triangle-exclamation"></i> Simulate Critical Settlement (Mikirpara)
              </button>
            </div>
          </div>
        </div>
      `;

      const simBtn = document.getElementById('btn-demo-critical-route');
      if (simBtn) {
        simBtn.addEventListener('click', () => {
          state.set('activeSettlementId', 'settlement-01');
          this.render(container);
          Toast.show('Switched to Mikirpara (Critical Flood Route Active)', 'info');
        });
      }
      return;
    }

    // Active Evacuation Mode
    container.innerHTML = `
      <div class="safe-route-container fade-in">
        <!-- 1. Urgent Evacuation Banner -->
        <div class="glass-panel evac-banner">
          <div class="evac-banner-left">
            <div class="evac-banner-icon" aria-hidden="true">
              <i class="fa-solid fa-person-running"></i>
            </div>
            <div class="evac-banner-text">
              <h2>Active Evacuation Corridor: ${routeData.settlementName}</h2>
              <p>Risk: <strong>${routeData.currentRisk}</strong> &bull; Verified Safe Route to Designated Relief Hub</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <a href="tel:112" class="btn btn-emergency btn-sm">
              <i class="fa-solid fa-phone"></i> Call Emergency: 112
            </a>
            <button class="btn btn-secondary btn-sm" id="btn-share-evac-route">
              <i class="fa-solid fa-share-nodes"></i> Share Route
            </button>
          </div>
        </div>

        <!-- 2. Route Metrics Bar -->
        <div class="route-metrics-bar">
          <div class="route-metric-card">
            <i class="fa-solid fa-route route-metric-icon"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">${routeData.distanceKm} km</span>
              <span class="route-metric-label">Corridor Distance</span>
            </div>
          </div>

          <div class="route-metric-card">
            <i class="fa-solid fa-person-walking route-metric-icon" style="color:#10b981;"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">~${routeData.estimatedMinutesFoot} mins</span>
              <span class="route-metric-label">On Foot (Safe Pace)</span>
            </div>
          </div>

          <div class="route-metric-card">
            <i class="fa-solid fa-car route-metric-icon"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">~${routeData.estimatedMinutesVehicle} mins</span>
              <span class="route-metric-label">Authorized Vehicle</span>
            </div>
          </div>

          <div class="route-metric-card" style="border-left:3px solid #10b981;">
            <i class="fa-solid fa-circle-check route-metric-icon" style="color:#10b981;"></i>
            <div class="route-metric-content">
              <span class="route-metric-value" style="color:#34d399; font-size:1rem;">${routeData.routeStatus}</span>
              <span class="route-metric-label">${routeData.lastVerifiedAt}</span>
            </div>
          </div>
        </div>

        <!-- 3. Split Layout: Interactive Map & Step Guidance -->
        <div class="route-split-layout">
          <!-- Left/Top: Route Map -->
          <div class="route-map-panel">
            <div id="leaflet-route-map" role="region" aria-label="Interactive evacuation route map"></div>

            <!-- Floating Route Badge -->
            <div class="route-map-badge">
              <span style="display:inline-block; width:12px; height:4px; background:#10b981; border-radius:2px;"></span>
              <span>Green Dashed Line: Verified Embankment Corridor</span>
            </div>
          </div>

          <!-- Right/Bottom: Turn-by-Turn Guide & Destination Shelter -->
          <div class="glass-panel route-guide-panel">
            <!-- Safe Shelter Destination Card -->
            <div class="shelter-destination-card">
              <span class="shelter-badge"><i class="fa-solid fa-person-shelter"></i> DESIGNATED REFUGE</span>
              <h3 class="shelter-name">${routeData.shelterDetails.name}</h3>
              <div style="font-size:0.825rem; color:#38bdf8;">
                <i class="fa-solid fa-mountain"></i> ${routeData.shelterDetails.elevation} &bull; Capacity: ${routeData.shelterDetails.capacity}
              </div>
              <div style="font-size:0.8rem; color:#34d399; font-weight:600;">
                <i class="fa-solid fa-users"></i> ${routeData.shelterDetails.occupancyStatus}
              </div>
              <div class="shelter-amenities">
                ${routeData.shelterDetails.amenities.map(a => `
                  <span class="amenity-tag"><i class="fa-solid fa-check"></i> ${a}</span>
                `).join('')}
              </div>
              <div style="font-size:0.775rem; color:#cbd5e1; margin-top:0.25rem;">
                <i class="fa-solid fa-phone"></i> In-Charge: <strong>${routeData.shelterDetails.contact}</strong>
              </div>
            </div>

            <!-- Road Hazard Warning -->
            <div class="road-block-alert">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>CRITICAL ROAD HAZARD:</strong>
                <div>${routeData.roadBlockage.location} is <strong>${routeData.roadBlockage.status}</strong> due to ${routeData.roadBlockage.reason}. Avoid this section completely.</div>
              </div>
            </div>

            <!-- Numbered Steps -->
            <div>
              <h4 style="margin-bottom:1rem; font-size:1rem; color:#ffffff;">
                <i class="fa-solid fa-list-ol"></i> Step-by-Step Evacuation Steps
              </h4>
              <div class="route-steps-list">
                ${routeData.instructions.map((step, idx) => `
                  <div class="route-step-item">
                    <div class="step-bullet ${idx === routeData.instructions.length - 1 ? 'shelter-bullet' : ''}">
                      ${idx === routeData.instructions.length - 1 ? '<i class="fa-solid fa-check"></i>' : step.step}
                    </div>
                    <div class="step-text">${step.title}</div>
                    <div class="step-subtext">${step.detail}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Explicit Early Guidance Limitation Notice -->
            <div style="padding:0.75rem 1rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-size:0.78rem; color:#94a3b8; line-height:1.45;">
              <strong style="color:#ffffff;">Official Notice:</strong> Route information is an AI-assisted early guidance layer. Always follow real-time instructions from SDRF, NDRF, and local police along the corridor. Hydrological conditions can shift rapidly.
            </div>
          </div>
        </div>
      </div>
    `;

    this.initRouteMap(geojsonData);
    this.attachEvents(routeData);
  }

  static initRouteMap(geojsonData) {
    if (this.mapController) {
      this.mapController.destroy();
    }

    this.mapController = new MapController('leaflet-route-map', {
      center: [26.9780, 94.2050],
      zoom: 12
    });

    const map = this.mapController.init();
    if (!map) return;

    // Render evacuation corridor GeoJSON with RouteLayer
    RouteLayer.renderGeoJson(map, geojsonData);
  }

  static attachEvents(routeData) {
    const shareBtn = document.getElementById('btn-share-evac-route');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `[AapadaSathi Safe Route] Evacuate ${routeData.settlementName} via North Embankment to ${routeData.shelterName} (${routeData.distanceKm} km, ~${routeData.estimatedMinutesFoot}m foot). Stay off South Culvert km 3.2. Helpline: 112.`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          Toast.show('Evacuation corridor directions copied to clipboard!', 'success');
        } else {
          Toast.show('Route ready to share.', 'info');
        }
      });
    }
  }
}
