/**
 * Page Controller: Safe Route / Evacuation Guidance
 * Strictly adheres to 100% Real Data. Displays "Route data unavailable" when no live routing engine is connected.
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';

export class SafeRoutePage {
  static async render(container) {
    const settlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage') || 'en';

    // Fetch real settlements from GeoNames
    const settlements = await RiskService.getAllSettlements() || [];
    const selected = settlements.find(s => s.id === settlementId) || (settlements.length > 0 ? settlements[0] : null);

    container.innerHTML = `
      <div class="safe-route-container fade-in">
        <!-- Header Panel -->
        <div class="glass-panel" style="padding:1.5rem 2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <span class="hero-badge" style="margin-bottom:0.4rem;"><i class="fa-solid fa-route"></i> Evacuation Routing Service</span>
            <h1 style="font-size:1.5rem; font-weight:800; color:#0f2b48;">Safe Evacuation Guidance</h1>
            <p style="font-size:0.875rem; color:#64748b;">Turn-by-turn routing and safe corridor calculation.</p>
          </div>

          <!-- Settlement Selector for Real Coordinates -->
          <div>
            <label for="route-settlement-picker" style="display:block; font-size:0.75rem; font-weight:700; color:#64748b; margin-bottom:0.25rem;">
              ORIGIN SETTLEMENT
            </label>
            <select id="route-settlement-picker" class="settlement-select" style="min-width:220px;">
              ${settlements.map(s => `
                <option value="${s.id}" ${selected && selected.id === s.id ? 'selected' : ''}>
                  ${s.name} (${Number(s.latitude).toFixed(3)}°N, ${Number(s.longitude).toFixed(3)}°E)
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Main Status Card: Route data unavailable -->
        <div class="glass-panel" style="padding:3.5rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1.25rem;">
          <div class="state-icon" style="background:#f1f5f9; color:#94a3b8; border:1px solid #e2e8f0; width:64px; height:64px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.75rem;">
            <i class="fa-solid fa-map-location-dot"></i>
          </div>
          <h2 style="color:#0f2b48; font-size:1.4rem; font-weight:800;">Route data unavailable</h2>
          <p style="max-width:560px; color:#475569; font-size:0.925rem; line-height:1.55;">
            A live routing engine is not currently connected to compute evacuation corridors. In accordance with platform integrity rules, no simulated paths, estimated travel times, or hypothetical road closures are fabricated.
          </p>

          <!-- Real Settlement Origin Coordinates Panel -->
          ${selected ? `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1.25rem 2rem; max-width:540px; width:100%; text-align:left; margin-top:0.75rem;">
              <div style="font-size:0.75rem; font-weight:700; color:#0284c7; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">
                Loaded Origin Input (Source: GeoNames)
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.875rem;">
                <span style="color:#64748b;">Settlement:</span>
                <strong style="color:#0f2b48;">${selected.name} (${selected.state || 'Assam'})</strong>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.875rem;">
                <span style="color:#64748b;">Real Coordinates:</span>
                <code style="color:#0284c7;">${Number(selected.latitude).toFixed(4)}°N, ${Number(selected.longitude).toFixed(4)}°E</code>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.875rem;">
                <span style="color:#64748b;">Population:</span>
                <strong style="color:#0f2b48;">${typeof selected.population === 'number' && selected.population > 0 ? selected.population.toLocaleString() : 'Unavailable'}</strong>
              </div>
            </div>
          ` : ''}

          <div style="display:flex; gap:1rem; margin-top:0.5rem; flex-wrap:wrap; justify-content:center;">
            <a href="#risk-dashboard" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-gauge-high"></i> View Settlement Telemetry
            </a>
            <a href="#risk-map" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-map-location-dot"></i> View on Basin Map
            </a>
          </div>
        </div>
      </div>
    `;

    const picker = container.querySelector('#route-settlement-picker');
    if (picker) {
      picker.addEventListener('change', (e) => {
        state.set('activeSettlementId', e.target.value);
        this.render(container);
      });
    }
  }
}
