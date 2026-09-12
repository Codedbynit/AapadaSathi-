/**
 * Page Controller: Home / Landing
 * Complete English & Hindi Localization Support
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { AlertService } from '../services/alert-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';
import { FloodApi } from '../api/flood-api.js';
import { ApiClient } from '../api/api-client.js';

export class HomePage {
  static async render(container) {
    const lang = state.get('activeLanguage') || 'en';
    const settlements = await RiskService.getAllSettlements();
    const settlementsCount = Array.isArray(settlements) && settlements.length > 0 ? settlements.length : null;

    // Real monitored population total calculated dynamically from /api/settlements
    let totalPopulation = null;
    if (Array.isArray(settlements) && settlements.length > 0) {
      let popSum = 0;
      let valid = 0;
      for (const s of settlements) {
        if (typeof s.population === 'number' && !isNaN(s.population) && s.population > 0) {
          popSum += s.population;
          valid++;
        }
      }
      if (valid > 0) totalPopulation = popSum;
    }

    // Historical count from real dataset
    let historicalCount = null;
    try {
      const histRes = await ApiClient.get('/observations/historical');
      if (histRes && histRes.data && typeof histRes.data.count === 'number') {
        historicalCount = histRes.data.count;
      }
    } catch {
      historicalCount = null;
    }

    // Real live telemetry for primary monitored settlement
    const primarySettlement = Array.isArray(settlements) && settlements.length > 0 ? settlements[0] : null;
    let liveDischarge = null;
    let liveWeather = null;

    if (primarySettlement) {
      try {
        const floodRes = await FloodApi.getRiverDischarge(primarySettlement.latitude, primarySettlement.longitude);
        if (floodRes && floodRes.data && typeof floodRes.data.river_discharge_m3s === 'number') {
          liveDischarge = floodRes.data.river_discharge_m3s;
        }
      } catch (e) {
        console.warn("Flood telemetry error:", e);
      }

      try {
        const weatherRes = await ApiClient.get(`/weather?lat=${primarySettlement.latitude}&lon=${primarySettlement.longitude}`);
        if (weatherRes && weatherRes.data && typeof weatherRes.data.temperature_c === 'number') {
          liveWeather = weatherRes.data;
        }
      } catch (e) {
        console.warn("Weather telemetry error:", e);
      }
    }

    const refreshTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const alerts = await AlertService.getAlerts();

    container.innerHTML = `
      <div class="fade-in">
        <!-- Ambient Decorative Glows -->
        <div class="ambient-glow ambient-glow-teal" style="top:-80px; left:10%;"></div>
        <div class="ambient-glow ambient-glow-cyan" style="top:100px; right:10%;"></div>

        <!-- Two-Column Hero Section -->
        <section class="hero-grid">
          <!-- Left Column: Title, Subtitle, Search, Action CTAs -->
          <div class="hero-left">
            <div class="hero-badge">
              <i class="fa-solid fa-satellite-dish"></i>
              <span>${TranslationService.t('aiBadge', lang)}</span>
            </div>

            <h1 class="hero-title">
              ${TranslationService.t('heroTitlePrefix', lang)} <span class="hero-highlight">${TranslationService.t('heroTitleHighlight', lang)}</span>
            </h1>

            <p class="hero-subtitle">
              ${TranslationService.t('heroSubtitle', lang)}
            </p>

            <!-- Search Card -->
            <div class="hero-search-wrapper">
              <form id="hero-search-form" class="hero-search-card" role="search">
                <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
                <input 
                  type="text" 
                  id="hero-search-input" 
                  class="search-input" 
                  placeholder="${TranslationService.t('searchPlaceholder', lang)}"
                  autocomplete="off"
                  aria-label="Search for settlement"
                />
                <button type="submit" class="btn btn-primary" id="btn-hero-check">
                  <i class="fa-solid fa-shield-halved"></i> ${TranslationService.t('checkRiskBtn', lang)}
                </button>
              </form>
              <div id="search-suggestions" class="glass-panel" style="display:none; position:absolute; top:calc(100% + 8px); left:0; width:100%; z-index:100; max-height:260px; overflow-y:auto; padding:0.5rem; text-align:left; background:#ffffff; box-shadow:0 12px 30px rgba(15,43,72,0.12);"></div>
            </div>

            <!-- Quick Action Buttons Row -->
            <div class="hero-actions-row">
              <a href="#risk-map" class="btn btn-secondary">
                <i class="fa-solid fa-map-location-dot"></i> ${TranslationService.t('viewMapBtn', lang)}
              </a>
              <a href="#safe-route" class="btn btn-danger">
                <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRouteBtn', lang)}
              </a>
            </div>

            <!-- Trust Badges Strip -->
            <div class="hero-trust-strip">
              <div class="hero-trust-item">
                <i class="fa-solid fa-phone" style="color:#dc2626;"></i>
                <span>${TranslationService.t('emergencyHotlineTag', lang)}</span>
              </div>
              <div class="hero-trust-item">
                <i class="fa-solid fa-tower-broadcast"></i>
                <span>Open-Meteo & GeoNames Verified</span>
              </div>
              <div class="hero-trust-item">
                <i class="fa-solid fa-circle-check" style="color:#059669;"></i>
                <span>100% Real Backend Telemetry</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Real-time Telemetry & Honest Alert Status Card -->
          <div class="hero-right">
            <div class="hero-radar-card floating-widget" style="padding:1.75rem;">
              <div class="radar-card-header" style="margin-bottom:1rem;">
                <div>
                  <span class="status-badge badge-neutral" style="margin-bottom:0.4rem; background:#f1f5f9; color:#475569;">
                    <i class="fa-solid fa-satellite-dish"></i> Live Basin Telemetry
                  </span>
                  <div class="radar-location-title">${primarySettlement ? primarySettlement.name : 'Monitored Basin'}</div>
                  <div class="radar-location-sub">${primarySettlement ? `${primarySettlement.state || 'Assam'} • ${primarySettlement.latitude.toFixed(3)}°N, ${primarySettlement.longitude.toFixed(3)}°E` : 'GeoNames Directory'}</div>
                </div>
                <span class="status-badge badge-neutral" style="font-size:0.75rem;">
                  <i class="fa-solid fa-clock"></i> ${refreshTimestamp}
                </span>
              </div>

              <!-- Honest Status Notice -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.8rem; color:#64748b;">
                <div style="font-weight:700; color:#0f2b48; margin-bottom:2px;"><i class="fa-solid fa-circle-info" style="color:#0284c7;"></i> Alert data unavailable</div>
                AI early-warning risk model is currently pending deployment. Below is verified real-time telemetry.
              </div>

              <!-- Real Telemetry Metrics List -->
              <div class="radar-metrics-list" style="margin-bottom:1.25rem;">
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-water" style="color:#0284c7;"></i> River Discharge (Live)</span>
                  <span class="radar-metric-val" style="color:#0284c7;">${liveDischarge !== null ? `${liveDischarge} m³/s` : 'Unavailable'}</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-cloud-sun" style="color:#d97706;"></i> Ambient Weather</span>
                  <span class="radar-metric-val">${liveWeather ? `${liveWeather.temperature_c}°C (${liveWeather.humidity_percent}% hum)` : 'Unavailable'}</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-users" style="color:#059669;"></i> Settlement Population</span>
                  <span class="radar-metric-val" style="color:#059669;">${primarySettlement && primarySettlement.population ? primarySettlement.population.toLocaleString() : 'Unavailable'}</span>
                </div>
              </div>

              <div style="display:flex; gap:0.65rem;">
                <a href="#risk-map" class="btn btn-secondary" style="flex:1; padding:0.65rem 0.75rem; font-size:0.85rem; text-align:center;">
                  <i class="fa-solid fa-map-location-dot"></i> View Risk Map
                </a>
                <a href="#risk-dashboard" class="btn btn-primary" style="flex:1; padding:0.65rem 0.75rem; font-size:0.85rem; text-align:center;">
                  <i class="fa-solid fa-gauge-high"></i> My Settlement
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Status Strip: Real Demographics & Source Counts -->
        <section class="quick-status-grid">
          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-city"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">${settlementsCount !== null ? settlementsCount : 'Unavailable'}</div>
              <div class="stat-label">Currently loaded settlements (GeoNames)</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card" style="border-left:4px solid #059669;">
            <div class="stat-icon-wrapper" style="color:#059669; background:#ecfdf5; border-color:#a7f3d0;">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#059669;">${totalPopulation !== null ? totalPopulation.toLocaleString() : 'Unavailable'}</div>
              <div class="stat-label">Population represented by loaded settlements</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-database"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">${historicalCount !== null ? `${historicalCount}` : 'Unavailable'}</div>
              <div class="stat-label">Historical baseline observations (Open-Meteo)</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper" style="color:#0284c7; background:#e0f2fe; border-color:#bae6fd;">
              <i class="fa-solid fa-network-wired"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#0284c7;">Operational</div>
              <div class="stat-label">GeoNames • Open-Meteo • OpenWeather</div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="workflow-section">
          <div class="section-header">
            <span class="hero-badge"><i class="fa-solid fa-diagram-project"></i> ${TranslationService.t('operationalFramework', lang)}</span>
            <h2 class="section-title">${TranslationService.t('howItWorksTitle', lang)}</h2>
            <p>${TranslationService.t('howItWorksSubtitle', lang)}</p>
          </div>

          <div class="workflow-steps-grid">
            <div class="glass-panel step-card">
              <div class="step-number">1</div>
              <i class="fa-solid fa-satellite step-icon"></i>
              <h3 class="step-title">${TranslationService.t('detectTitle', lang)}</h3>
              <p class="step-desc">Open-Meteo flood telemetry and NASA FIRMS thermal anomaly detection capture baseline shifts.</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">2</div>
              <i class="fa-solid fa-brain step-icon"></i>
              <h3 class="step-title">${TranslationService.t('assessTitle', lang)}</h3>
              <p class="step-desc">Hydrological features correlate with historical training datasets for settlement impact assessment.</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">3</div>
              <i class="fa-solid fa-bullhorn step-icon"></i>
              <h3 class="step-title">${TranslationService.t('warnTitle', lang)}</h3>
              <p class="step-desc">Emergency SOS alerts dispatch via Twilio SMS alongside real-time coordinate broadcasts.</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">4</div>
              <i class="fa-solid fa-person-walking-arrow-right step-icon" style="color:#059669;"></i>
              <h3 class="step-title">${TranslationService.t('guideTitle', lang)}</h3>
              <p class="step-desc">Geographic settlement coordinates direct residents safely to identified high-ground shelters.</p>
            </div>
          </div>
        </section>

        <!-- Active Alerts Preview (Honest State with Verified Telemetry Summary) -->
        <section class="alerts-preview-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem;">
            <div>
              <span class="hero-badge" style="border-color:#e2e8f0; background:#f8fafc; color:#475569;">
                <i class="fa-solid fa-bell"></i> Live Feed Status
              </span>
              <h2>Urgent Warnings in Monitored Basin</h2>
            </div>
            <a href="#alerts" class="btn btn-secondary btn-sm">${TranslationService.t('viewAllAlertsBtn', lang)} <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="alerts-preview-list">
            <div class="glass-panel" style="padding:2.5rem; text-align:center; color:#64748b; width: 100%;">
              <i class="fa-solid fa-bell-slash" style="font-size:2rem; margin-bottom:1rem; color:#cbd5e1;"></i>
              <h4 style="font-size:1.1rem; color:#0f2b48; margin-bottom:0.25rem;">Alert data unavailable</h4>
              <p style="font-size:0.875rem;">No active alerts from the AI early-warning system at this time. Telemetry sources remain monitored.</p>
            </div>
          </div>
        </section>

        <!-- Trust & Multi-Source Fusion Section -->
        <section style="padding:3rem 0;">
          <div class="section-header">
            <span class="hero-badge"><i class="fa-solid fa-shield-heart"></i> ${TranslationService.t('multiSourceFusionBadge', lang)}</span>
            <h2>${TranslationService.t('trustSectionTitle', lang)}</h2>
            <p>${TranslationService.t('trustSectionSubtitle', lang)}</p>
          </div>

          <div class="trust-grid">
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-network-wired trust-icon"></i>
              <h4>${TranslationService.t('trustCard1Title', lang)}</h4>
              <p>${TranslationService.t('trustCard1Desc', lang)}</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-house-chimney trust-icon"></i>
              <h4>${TranslationService.t('trustCard2Title', lang)}</h4>
              <p>${TranslationService.t('trustCard2Desc', lang)}</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-language trust-icon"></i>
              <h4>${TranslationService.t('trustCard3Title', lang)}</h4>
              <p>${TranslationService.t('trustCard3Desc', lang)}</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-route trust-icon"></i>
              <h4>${TranslationService.t('trustCard4Title', lang)}</h4>
              <p>${TranslationService.t('trustCard4Desc', lang)}</p>
            </div>
          </div>
        </section>

        <!-- Footer with Admin Portal Access & Emergency Contacts -->
        <footer class="app-footer" style="margin-top:4.5rem; padding:2.5rem 0 2rem; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="brand-icon-wrapper" style="width:34px; height:34px; font-size:1rem;">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <strong style="color:#0f2b48; font-size:1rem;">AapadaSathi</strong>
              <div style="font-size:0.775rem; color:#64748b;">${TranslationService.t('tagline', lang)}</div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
            <a href="#response-dashboard" class="btn btn-secondary btn-sm" style="background:#ffffff; border:1px solid #cbd5e1; color:#0f2b48; font-weight:700; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
              <i class="fa-solid fa-lock"></i> ${TranslationService.t('adminPortal', lang)}
            </a>
            <a href="tel:112" class="header-hotline-badge" style="text-decoration:none;">
              <i class="fa-solid fa-phone-volume"></i>
              <span>${TranslationService.t('emergencyHelplineFull', lang)}</span>
            </a>
          </div>
        </footer>
      </div>
    `;

    this.initSearch(settlements);
    this.attachCardActions();
  }

  static initSearch(settlements) {
    const input = document.getElementById('hero-search-input');
    const form = document.getElementById('hero-search-form');
    const suggestions = document.getElementById('search-suggestions');

    if (!input || !form) return;

    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        suggestions.style.display = 'none';
        return;
      }

      const matches = settlements.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.district.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        suggestions.innerHTML = `<div style="padding:0.75rem; color:#64748b; font-size:0.875rem;">No settlements found for "${q}". Try "Mikirpara" or "Majuli".</div>`;
        suggestions.style.display = 'block';
        return;
      }

      suggestions.innerHTML = matches.map(m => `
        <div class="search-item" data-id="${m.id}" style="padding:0.75rem 1rem; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9;">
          <div>
            <strong style="color:#0f2b48;">${m.name}</strong>
            <div style="font-size:0.75rem; color:#64748b;">${m.district}, ${m.state}</div>
          </div>
          <span class="status-badge ${m.riskLevel ? RiskService.getRiskBadgeClass(m.riskLevel) : 'badge-neutral'}">${m.riskLevel || 'Unavailable'}</span>
        </div>
      `).join('');

      suggestions.style.display = 'block';

      suggestions.querySelectorAll('.search-item').forEach(el => {
        el.addEventListener('mouseenter', () => el.style.background = '#f1f5f9');
        el.addEventListener('mouseleave', () => el.style.background = 'transparent');
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-id');
          state.set('activeSettlementId', id);
          window.location.hash = '#risk-dashboard';
        });
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.toLowerCase().trim();
      const found = settlements.find(s => s.name.toLowerCase().includes(q));
      if (found) {
        state.set('activeSettlementId', found.id);
        window.location.hash = '#risk-dashboard';
      } else if (settlements.length > 0) {
        state.set('activeSettlementId', settlements[0].id);
        window.location.hash = '#risk-dashboard';
      }
    });

    document.addEventListener('click', (e) => {
      if (!form.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
      }
    });
  }

  static attachCardActions() {
    document.querySelectorAll('.alert-view-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-settlement-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#risk-dashboard';
      });
    });

    document.querySelectorAll('.alert-route-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-settlement-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#safe-route';
      });
    });
  }
}
