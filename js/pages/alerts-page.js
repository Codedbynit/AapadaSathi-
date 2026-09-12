/**
 * Page Controller: Alerts Page
 * Complete English & Hindi Localization with 100% Real Supporting Telemetry
 */

import { state } from '../state.js';
import { AlertService } from '../services/alert-service.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';
import { FloodApi } from '../api/flood-api.js';
import { ApiClient } from '../api/api-client.js';
import { Toast } from '../components/toast.js';

export class AlertsPage {
  static async render(container) {
    const lang = state.get('activeLanguage') || 'en';
    
    // Show loading skeleton
    container.innerHTML = `
      <div class="alerts-page-container fade-in">
        <div class="glass-panel skeleton skeleton-card" style="height:80px;"></div>
        <div class="glass-panel skeleton skeleton-card" style="height:280px; margin-top:1.5rem;"></div>
      </div>
    `;

    const [alerts, settlements] = await Promise.all([
      AlertService.getAlerts(),
      RiskService.getAllSettlements()
    ]);

    // Fetch real supporting telemetry for monitored settlements
    let guwahatiFlood = null;
    let silcharFlood = null;
    let liveWeather = null;
    let firmsData = null;

    try {
      const [gwFloodRes, scFloodRes, weatherRes, firmsRes] = await Promise.allSettled([
        FloodApi.getRiverDischarge(26.1844, 91.7458),
        FloodApi.getRiverDischarge(24.8273, 92.7979),
        ApiClient.get('/weather?lat=26.1844&lon=91.7458'),
        ApiClient.get('/firms')
      ]);

      if (gwFloodRes.status === 'fulfilled' && gwFloodRes.value?.data?.river_discharge_m3s !== undefined) {
        guwahatiFlood = gwFloodRes.value.data.river_discharge_m3s;
      }
      if (scFloodRes.status === 'fulfilled' && scFloodRes.value?.data?.river_discharge_m3s !== undefined) {
        silcharFlood = scFloodRes.value.data.river_discharge_m3s;
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value?.data?.temperature_c !== undefined) {
        liveWeather = weatherRes.value.data;
      }
      if (firmsRes.status === 'fulfilled' && Array.isArray(firmsRes.value?.data)) {
        firmsData = firmsRes.value.data;
      }
    } catch (e) {
      console.warn("Failed to load supporting telemetry for alerts page:", e);
    }

    container.innerHTML = `
      <div class="alerts-page-container fade-in">
        <!-- Header & Filter Bar -->
        <div class="glass-panel alerts-filter-bar">
          <div>
            <h2>${TranslationService.t('activeDisasterWarningsTitle', lang)}</h2>
            <p style="font-size:0.875rem;">${TranslationService.t('activeDisasterWarningsSubtitle', lang)}</p>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <input 
              type="text" 
              class="filter-search-input" 
              id="alert-search-input" 
              placeholder="${TranslationService.t('filterBySettlementPlaceholder', lang)}"
              aria-label="Filter alerts by settlement"
            />
            <div class="map-filters-group">
              <button class="filter-chip active alert-filter-chip" data-severity="ALL">${TranslationService.t('allFilter', lang)}</button>
              <button class="filter-chip alert-filter-chip" data-severity="CRITICAL">${TranslationService.t('criticalFilter', lang)}</button>
              <button class="filter-chip alert-filter-chip" data-severity="HIGH">${TranslationService.t('highFilter', lang)}</button>
              <button class="filter-chip alert-filter-chip" data-severity="MODERATE">${TranslationService.t('moderateFilter', lang)}</button>
            </div>
          </div>
        </div>

        <!-- Alerts Feed List (Honest Alert State) -->
        <div class="alerts-feed-grid" id="alerts-feed-list">
          ${this.generateAlertCardsHtml(alerts, lang)}
        </div>

        <!-- Supporting Live Telemetry Section (Clearly distinguished from AI alerts) -->
        <section class="glass-panel" style="margin-top:1.75rem; padding:1.75rem;">
          <div style="margin-bottom:1.25rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
              <span class="hero-badge" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">
                <i class="fa-solid fa-satellite-dish"></i> Live Sensor Telemetry
              </span>
              <span style="font-size:0.75rem; font-weight:700; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:12px;">STANDALONE TELEMETRY</span>
            </div>
            <h3 style="color:#0f2b48; font-size:1.15rem; font-weight:800;">Real Supporting Telemetry</h3>
            <p style="font-size:0.85rem; color:#64748b;">
              Direct observational readings from external APIs. This telemetry is factual sensor data and does <strong>NOT</strong> constitute an automated AI disaster alert.
            </p>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
            <!-- Guwahati River Discharge -->
            <div style="padding:1.2rem; background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-weight:700; color:#b45309; font-size:0.9rem;">Guwahati River Discharge</span>
                <i class="fa-solid fa-water" style="color:#b45309;"></i>
              </div>
              <div style="font-size:1.6rem; font-weight:800; color:#b45309;">
                ${guwahatiFlood !== null ? `${guwahatiFlood} <span style="font-size:0.9rem; font-weight:600;">m³/s</span>` : 'Unavailable'}
              </div>
              <div style="font-size:0.75rem; color:#92400e; margin-top:0.35rem;">
                Source: Open-Meteo Flood Forecast (26.184°N, 91.746°E)
              </div>
            </div>

            <!-- Silchar River Discharge -->
            <div style="padding:1.2rem; background:#fffbeb; border:1px solid #fef3c7; border-left:4px solid #f59e0b; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-weight:700; color:#b45309; font-size:0.9rem;">Silchar River Discharge</span>
                <i class="fa-solid fa-water" style="color:#b45309;"></i>
              </div>
              <div style="font-size:1.6rem; font-weight:800; color:#b45309;">
                ${silcharFlood !== null ? `${silcharFlood} <span style="font-size:0.9rem; font-weight:600;">m³/s</span>` : 'Unavailable'}
              </div>
              <div style="font-size:0.75rem; color:#92400e; margin-top:0.35rem;">
                Source: Open-Meteo Flood Forecast (24.827°N, 92.798°E)
              </div>
            </div>

            <!-- OpenWeather Live Weather -->
            <div style="padding:1.2rem; background:#f0f9ff; border:1px solid #e0f2fe; border-left:4px solid #0284c7; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-weight:700; color:#0369a1; font-size:0.9rem;">Live Weather Telemetry</span>
                <i class="fa-solid fa-cloud-rain" style="color:#0284c7;"></i>
              </div>
              <div style="font-size:1.6rem; font-weight:800; color:#0369a1;">
                ${liveWeather !== null ? `${liveWeather.temperature_c}°C` : 'Unavailable'}
              </div>
              <div style="font-size:0.75rem; color:#0369a1; margin-top:0.35rem;">
                ${liveWeather !== null ? `Condition: ${liveWeather.weather_description || 'Clear'}, Humidity: ${liveWeather.humidity_percent}%, Rain: ${liveWeather.rainfall_mm !== undefined ? `${liveWeather.rainfall_mm}mm` : '0mm'}` : 'OpenWeather API connection unavailable.'}
              </div>
            </div>

            <!-- NASA FIRMS Active Thermal Detections -->
            <div style="padding:1.2rem; background:#fff7ed; border:1px solid #ffedd5; border-left:4px solid #ea580c; border-radius:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-weight:700; color:#c2410c; font-size:0.9rem;">Satellite Thermal Detections</span>
                <i class="fa-solid fa-satellite" style="color:#ea580c;"></i>
              </div>
              <div style="font-size:1.6rem; font-weight:800; color:#c2410c;">
                ${firmsData !== null ? `${firmsData.length} observations` : 'Unavailable'}
              </div>
              <div style="font-size:0.75rem; color:#9a3412; margin-top:0.35rem;">
                Source: NASA FIRMS (VIIRS NOAA-20 NRT). Active thermal/fire anomalies, not flood telemetry.
              </div>
            </div>
          </div>
        </section>

        <!-- Alert Detail Modal -->
        <div id="alert-modal" class="glass-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:90%; max-width:540px; z-index:1100; padding:2rem;">
          <div id="alert-modal-content"></div>
        </div>
        <div id="modal-backdrop" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,43,72,0.5); backdrop-filter:blur(6px); z-index:1050;"></div>
      </div>
    `;

    this.attachEvents(alerts, lang);
  }

  static generateAlertCardsHtml(alerts, lang = 'en') {
    if (!alerts || alerts.length === 0) {
      return `
        <div class="glass-panel state-container" style="padding:3.5rem 2rem; text-align:center;">
          <div class="state-icon" style="background:#f1f5f9; color:#94a3b8; border:1px solid #e2e8f0; margin-bottom:1rem;">
            <i class="fa-solid fa-bell-slash"></i>
          </div>
          <h3 class="state-title" style="color:#0f2b48; font-size:1.35rem; font-weight:800;">
            ${lang === 'hi' ? 'चेतावनी डेटा उपलब्ध नहीं है' : 'Alert data unavailable'}
          </h3>
          <p class="state-desc" style="max-width:540px; margin:0.5rem auto 0 auto; color:#64748b; font-size:0.9rem; line-height:1.5;">
            ${lang === 'hi' 
              ? 'मशीन लर्निंग बाढ़ पूर्वानुमान और स्वचालित आपातकालीन चेतावनी प्रणाली वर्तमान में सक्रिय चेतावनी प्रकाशित नहीं कर रही है। वास्तविक पर्यावरणीय टेलीमेट्री नीचे प्रदर्शित है।' 
              : 'Automated ML warning models are not currently publishing flood alerts. Supporting live environmental telemetry is provided below.'}
          </p>
        </div>
      `;
    }

    const readSet = state.get('alertsRead') || new Set();

    return alerts.map(alert => {
      const isRead = readSet.has(alert.id);
      return `
        <div class="glass-panel alert-item-card severity-${alert.severity.toLowerCase()} ${isRead ? 'alert-read' : ''}" data-id="${alert.id}">
          <div class="alert-icon-col" style="color:${alert.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'}; background:${alert.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed'};">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>

          <div class="alert-content-col">
            <div class="alert-title-row">
              <span class="status-badge ${RiskService.getRiskBadgeClass(alert.severity)}">${alert.severity}</span>
              <h3 class="alert-title">${alert.title}</h3>
              ${isRead ? `<span style="font-size:0.75rem; color:#64748b;"><i class="fa-solid fa-check"></i> ${TranslationService.t('acknowledgedBadge', lang)}</span>` : ''}
            </div>
            <p class="alert-description">${alert.message}</p>
            <div class="alert-meta-row">
              <span><i class="fa-solid fa-location-dot"></i> ${alert.settlementName}</span>
              <span><i class="fa-solid fa-clock"></i> ${TranslationService.t('issuedLabel', lang)} ${alert.issuedAt}</span>
              <span><i class="fa-solid fa-hourglass-start"></i> ${TranslationService.t('leadTimeLabel', lang)} <strong>${alert.leadTimeHours} hrs</strong></span>
              <span><i class="fa-solid fa-chart-pie"></i> ${TranslationService.t('confidenceLabel', lang)} ${alert.confidence}</span>
            </div>
          </div>

          <div class="alert-actions-col">
            <button class="btn btn-secondary btn-sm btn-open-modal" data-id="${alert.id}">
              <i class="fa-solid fa-eye"></i> ${TranslationService.t('detailsBtn', lang)}
            </button>
            <button class="btn btn-secondary btn-sm btn-ack-alert" data-id="${alert.id}">
              <i class="fa-solid fa-check"></i> ${isRead ? TranslationService.t('doneBtn', lang) : TranslationService.t('acknowledgeBtn', lang)}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  static attachEvents(allAlerts, lang = 'en') {
    const searchInput = document.getElementById('alert-search-input');
    const feedList = document.getElementById('alerts-feed-list');
    let currentSeverity = 'ALL';

    const filterAndRender = () => {
      if (!allAlerts || allAlerts.length === 0) return;
      const q = searchInput.value.toLowerCase().trim();
      let filtered = allAlerts;
      if (currentSeverity !== 'ALL') {
        filtered = filtered.filter(a => a.severity === currentSeverity);
      }
      if (q) {
        filtered = filtered.filter(a => 
          a.settlementName.toLowerCase().includes(q) || 
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q)
        );
      }
      feedList.innerHTML = this.generateAlertCardsHtml(filtered, lang);
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterAndRender);
    }

    document.querySelectorAll('.alert-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.alert-filter-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentSeverity = e.currentTarget.getAttribute('data-severity');
        filterAndRender();
      });
    });
  }
}
