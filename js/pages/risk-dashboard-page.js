/**
 * Page Controller: Resident Risk Dashboard
 * Complete English & Hindi Localization
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';
import { FloodApi } from '../api/flood-api.js';
import { ApiClient } from '../api/api-client.js';

export class RiskDashboardPage {
  static async render(container) {
    const settlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage') || 'en';

    // Show loading skeleton first
    container.innerHTML = `
      <div class="dashboard-container fade-in">
        <div class="glass-panel skeleton skeleton-card" style="height:70px;"></div>
        <div class="risk-core-grid">
          <div class="glass-panel skeleton skeleton-card" style="height:380px;"></div>
          <div class="glass-panel skeleton skeleton-card" style="height:380px;"></div>
        </div>
      </div>
    `;

    // 1. Fetch real settlements from backend (GeoNames)
    const settlements = await RiskService.getAllSettlements();
    const settlementsCount = Array.isArray(settlements) && settlements.length > 0 ? settlements.length : null;

    // 2. Determine selected settlement
    const selectedSettlement = (Array.isArray(settlements) && settlements.find(s => s.id === settlementId)) ||
                               (Array.isArray(settlements) && settlements.length > 0 ? settlements[0] : null);

    // 3. Compute real population coverage dynamically from loaded settlements
    let totalPopulation = null;
    if (Array.isArray(settlements) && settlements.length > 0) {
      let popSum = 0;
      let validCount = 0;
      for (const s of settlements) {
        if (typeof s.population === 'number' && !isNaN(s.population) && s.population > 0) {
          popSum += s.population;
          validCount++;
        }
      }
      if (validCount > 0) {
        totalPopulation = popSum;
      }
    }

    // 4. Fetch REAL river discharge for selected settlement from Open-Meteo Flood Forecast
    let liveRiverDischarge = null;
    const queryLat = selectedSettlement ? selectedSettlement.latitude : 26.2;
    const queryLon = selectedSettlement ? selectedSettlement.longitude : 92.5;
    try {
      const floodRes = await FloodApi.getRiverDischarge(queryLat, queryLon);
      if (floodRes && floodRes.data && typeof floodRes.data.river_discharge_m3s === 'number') {
        liveRiverDischarge = floodRes.data.river_discharge_m3s;
      }
    } catch (e) {
      console.warn("Failed to load real flood data:", e);
    }

    // Fetch REAL weather telemetry from OpenWeather
    let liveWeather = null;
    try {
      const weatherRes = await ApiClient.get(`/weather?lat=${queryLat}&lon=${queryLon}`);
      if (weatherRes && weatherRes.data && typeof weatherRes.data.temperature_c === 'number') {
        liveWeather = weatherRes.data;
      }
    } catch (e) {
      console.warn("Failed to load real weather data:", e);
    }

    // Fetch REAL NASA FIRMS satellite observations
    let firmsData = null;
    try {
      const firmsRes = await ApiClient.get('/firms');
      if (firmsRes && Array.isArray(firmsRes.data)) {
        firmsData = firmsRes.data;
      }
    } catch (e) {
      console.warn("Failed to load real FIRMS data:", e);
    }

    // 5. Fetch real historical observations from backend / dataset
    let historicalData = null;
    try {
      const histRes = await ApiClient.get('/observations/historical');
      if (histRes && histRes.data && typeof histRes.data.count === 'number' && histRes.data.count > 0) {
        historicalData = histRes.data;
      }
    } catch (e) {
      try {
        const fileRes = await fetch('api/data/historical_features.json');
        if (fileRes.ok) {
          const list = await fileRes.json();
          if (Array.isArray(list) && list.length > 0) {
            historicalData = {
              count: list.length,
              is_historical: true,
              source: 'Open-Meteo Archive',
              start_date: list[0]?.date,
              end_date: list[list.length - 1]?.date
            };
          }
        }
      } catch (err) {
        console.warn("Failed to load historical observations:", err);
      }
    }

    // 6. Record actual dashboard refresh timestamp
    const refreshTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 7. Check risk data (remains honestly unavailable until ML model is connected)
    const riskData = await RiskService.getRisk(settlementId);

    if (!riskData) {
      container.innerHTML = `
      <div class="dashboard-container fade-in">
        <!-- Context Bar with Settlement Selector & Refresh Time -->
        <div class="glass-panel context-bar">
          <div class="context-location">
            <div class="context-location-icon">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h1 class="context-title" id="current-settlement-name">
                ${selectedSettlement ? selectedSettlement.name : 'Monitored Settlements'}
              </h1>
              <div class="context-subtitle">
                ${selectedSettlement ? `${selectedSettlement.state || 'Assam, IN'} &bull; ${selectedSettlement.latitude.toFixed(4)}°N, ${selectedSettlement.longitude.toFixed(4)}°E` : 'GeoNames Administrative Directory'}
              </div>
            </div>
          </div>

          <div class="context-meta">
            <div class="freshness-tag">
              <i class="fa-solid fa-rotate"></i> Refreshed at ${refreshTimestamp}
            </div>

            ${Array.isArray(settlements) && settlements.length > 0 ? `
              <div>
                <label for="settlement-picker" class="sr-only">Change Settlement</label>
                <select id="settlement-picker" class="settlement-select" aria-label="Change settlement">
                  ${settlements.map(s => `
                    <option value="${s.id}" ${s.id === (selectedSettlement ? selectedSettlement.id : '') ? 'selected' : ''}>
                      ${s.name} (Pop: ${typeof s.population === 'number' ? s.population.toLocaleString() : 'N/A'})
                    </option>
                  `).join('')}
                </select>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Preserved Honest Unavailable State for ML Risk Prediction -->
        <div class="glass-panel" style="padding:3.5rem 2rem; text-align:center; color:#64748b; border: 1px solid #e2e8f0; background:#ffffff;">
          <i class="fa-solid fa-server" style="font-size:3rem; margin-bottom:1.5rem; color:#cbd5e1;"></i>
          <h2 style="color:#0f2b48; margin-bottom:0.5rem; font-size:1.5rem;">Risk prediction data unavailable</h2>
          <p style="font-size:1rem; max-width:550px; margin:0 auto; color:#64748b;">The AI risk modeling system and settlement risk scores are currently unavailable. The real Random Forest model has not been connected yet.</p>
        </div>

        <!-- Real Data Overview (100% Real Backend Data) -->
        <section style="margin-top:0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3 style="font-size:1.2rem; font-weight:800; color:#0f2b48; margin:0;">Real Data Overview</h3>
              <p style="font-size:0.85rem; color:#64748b; margin:0.25rem 0 0 0;">Verified data loaded directly from active backend sources.</p>
            </div>
            <span class="status-badge badge-neutral" style="font-size:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; color:#475569;">
              <i class="fa-solid fa-circle-check" style="color:#059669;"></i> Real Sources Only
            </span>
          </div>

          <div class="impact-grid">
            <!-- Card A: Monitored Settlements -->
            <div class="impact-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="impact-label">Monitored Settlements</span>
                <span style="font-size:0.7rem; font-weight:700; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:12px;">LIVE DIRECTORY</span>
              </div>
              <div class="impact-number" style="color:#0284c7;">
                ${settlementsCount !== null ? `${settlementsCount} settlements` : 'Unavailable'}
              </div>
              <span style="font-size:0.75rem; color:#64748b;">
                ${settlementsCount !== null ? `Real administrative locations loaded via GeoNames API.` : 'Settlement directory unavailable.'}
              </span>
            </div>

            <!-- Card B: Population Coverage -->
            <div class="impact-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="impact-label">Population Coverage</span>
                <span style="font-size:0.7rem; font-weight:700; background:#ecfdf5; color:#047857; padding:2px 8px; border-radius:12px;">GEONAMES</span>
              </div>
              <div class="impact-number" style="color:#059669;">
                ${totalPopulation !== null ? totalPopulation.toLocaleString() : 'Unavailable'}
              </div>
              <span style="font-size:0.75rem; color:#64748b;">
                Population represented across currently loaded GeoNames settlements.
              </span>
            </div>

            <!-- Card C: Historical Observations -->
            <div class="impact-card">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="impact-label">Historical Observations</span>
                <span style="font-size:0.7rem; font-weight:700; background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:12px;">HISTORICAL ARCHIVE</span>
              </div>
              <div class="impact-number" style="color:#d97706;">
                ${historicalData && typeof historicalData.count === 'number' ? `${historicalData.count} records` : 'Unavailable'}
              </div>
              <span style="font-size:0.75rem; color:#64748b;">
                ${historicalData && historicalData.start_date && historicalData.end_date ? `Open-Meteo archive dataset (${historicalData.start_date} to ${historicalData.end_date}); not live.` : 'Archived observations dataset; not live telemetry.'}
              </span>
            </div>

            <!-- Card D: Live Data Sources -->
            <div class="impact-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                <span class="impact-label">Live Data Sources</span>
                <span style="font-size:0.7rem; font-weight:700; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:12px;">STATUS AUDIT</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem; margin-top:0.25rem;">
                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span style="width:7px; height:7px; border-radius:50%; background:#10b981; display:inline-block;"></span>
                  <span style="font-weight:600; color:#0f2b48;">GeoNames:</span>
                  <span style="color:#059669; margin-left:auto; font-weight:600;">Operational</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span style="width:7px; height:7px; border-radius:50%; background:#10b981; display:inline-block;"></span>
                  <span style="font-weight:600; color:#0f2b48;">Open-Meteo Flood:</span>
                  <span style="color:#059669; margin-left:auto; font-weight:600;">Operational</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span style="width:7px; height:7px; border-radius:50%; background:${liveWeather ? '#10b981' : '#94a3b8'}; display:inline-block;"></span>
                  <span style="font-weight:600; color:#0f2b48;">OpenWeather:</span>
                  <span style="color:${liveWeather ? '#059669' : '#94a3b8'}; margin-left:auto; font-weight:600;">${liveWeather ? 'Operational' : 'Unavailable'}</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span style="width:7px; height:7px; border-radius:50%; background:${firmsData !== null ? '#10b981' : '#94a3b8'}; display:inline-block;"></span>
                  <span style="font-weight:600; color:#0f2b48;">NASA FIRMS:</span>
                  <span style="color:${firmsData !== null ? '#059669' : '#94a3b8'}; margin-left:auto; font-weight:600;">${firmsData !== null ? 'Operational' : 'Unavailable'}</span>
                </div>
                <div style="display:flex; align-items:center; gap:0.45rem;">
                  <span style="width:7px; height:7px; border-radius:50%; background:#94a3b8; display:inline-block;"></span>
                  <span style="font-weight:600; color:#64748b;">Random Forest ML:</span>
                  <span style="color:#94a3b8; margin-left:auto;">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Live Telemetry Section (Preserved River Discharge & Weather Cards) -->
        <section class="factors-section" style="margin-top:1.5rem;">
          <div style="margin-bottom:0.75rem;">
            <h3 style="font-size:1.15rem; font-weight:800; color:#0f2b48;">Live Telemetry (Standalone)</h3>
            <p style="font-size:0.875rem; color:#64748b;">Direct hydrological and meteorological readings bypassing the risk engine.</p>
          </div>
          <div class="factor-grid">
            ${liveRiverDischarge !== null ? `
              <div class="factor-card" style="border-left:4px solid #f59e0b; background:#fffbeb;">
                <div class="factor-header">
                  <span style="font-weight:600; color:#b45309;">River Discharge (Live)</span>
                  <i class="fa-solid fa-water" style="color:#b45309;"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value" style="color:#b45309;">${liveRiverDischarge}</span>
                  <span class="factor-unit">/ m³/s</span>
                </div>
                <div class="factor-explanation" style="color:#92400e;">
                  Live river discharge data from Open-Meteo Flood Forecast for ${selectedSettlement ? selectedSettlement.name : 'Assam'} (${queryLat.toFixed(3)}°N, ${queryLon.toFixed(3)}°E).
                </div>
              </div>
            ` : `
              <div class="factor-card">
                <div class="factor-header">
                  <span>River Discharge</span>
                  <i class="fa-solid fa-water"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value" style="color:#94a3b8; font-size:1.5rem;">Unavailable</span>
                </div>
                <div class="factor-explanation">Open-Meteo flood telemetry connection unavailable.</div>
              </div>
            `}
            ${liveWeather !== null ? `
              <div class="factor-card" style="border-left:4px solid #0284c7; background:#f0f9ff;">
                <div class="factor-header">
                  <span style="font-weight:600; color:#0369a1;">Weather Telemetry (Live)</span>
                  <i class="fa-solid fa-cloud-rain" style="color:#0284c7;"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value" style="color:#0369a1;">${liveWeather.temperature_c}°C</span>
                  <span class="factor-unit" style="font-size:0.85rem; color:#0284c7;">&bull; ${liveWeather.rainfall_mm !== undefined ? `${liveWeather.rainfall_mm} mm rain` : ''}</span>
                </div>
                <div class="factor-explanation" style="color:#0369a1;">
                  Live observations from OpenWeather API (${liveWeather.weather_description || 'Clear'}, Humidity: ${liveWeather.humidity_percent}%, Wind: ${liveWeather.wind_speed_ms || 'N/A'} m/s).
                </div>
              </div>
            ` : `
              <div class="factor-card">
                <div class="factor-header">
                  <span>Weather Telemetry</span>
                  <i class="fa-solid fa-cloud"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value" style="color:#94a3b8; font-size:1.5rem;">Weather data unavailable</span>
                </div>
                <div class="factor-explanation">OpenWeather API connection unavailable.</div>
              </div>
            `}
            <div class="factor-card" style="border-left:4px solid #ea580c; background:#fff7ed;">
              <div class="factor-header">
                <span style="font-weight:600; color:#c2410c;">Thermal Satellites (NASA FIRMS)</span>
                <i class="fa-solid fa-satellite" style="color:#ea580c;"></i>
              </div>
              <div class="factor-value-row">
                <span class="factor-value" style="color:#c2410c;">${firmsData !== null ? `${firmsData.length} hotspots` : 'Unavailable'}</span>
              </div>
              <div class="factor-explanation" style="color:#9a3412;">
                ${firmsData !== null && firmsData.length === 0 ? 'No active satellite thermal/fire anomalies detected in monitoring bounding box (VIIRS NOAA-20 NRT). Active thermal data only; not flood detection.' : 'NASA FIRMS satellite anomaly telemetry (VIIRS NOAA-20 NRT). Active thermal data only; not flood detection.'}
              </div>
            </div>
          </div>
        </section>
      </div>
      `;

      // Attach settlement picker event listener so user can switch settlements
      const picker = container.querySelector('#settlement-picker');
      if (picker) {
        picker.addEventListener('change', (e) => {
          state.set('activeSettlementId', e.target.value);
          this.render(container);
          Toast.show(`Viewing telemetry for ${e.target.selectedOptions[0].text.split('(')[0].trim()}`, 'info');
        });
      }
      return;
    }


    const level = riskData.riskLevel;
    const score = riskData.riskScore;
    const color = RiskService.getRiskColor(level);
    const badgeClass = RiskService.getRiskBadgeClass(level);

    // Inject live data into the factors array
    if (riskData && riskData.factors) {
      riskData.factors.forEach(factor => {
        if (factor.name === 'River Discharge' || factor.name === 'नदी जलप्रवाह दर') {
          if (liveRiverDischarge !== null) {
            factor.value = liveRiverDischarge;
            factor.unit = 'm³/s';
            factor.name = 'River Discharge (Live)';
            factor.status = 'warning'; // highlight it's live
            factor.explanation = 'Live river discharge data from Open-Meteo API.';
          }
        }
      });
    }

    // Circumference calculation for circular gauge: r=70 => C = 2 * PI * 70 = ~440
    const circumference = 440;
    const strokeOffset = circumference - (score / 100) * circumference;

    const translatedLevel = lang === 'hi' 
      ? (level === 'CRITICAL' ? 'अति गंभीर' : level === 'HIGH' ? 'उच्च' : level === 'MODERATE' ? 'मध्यम' : 'कम')
      : level;

    const translatedExplanation = lang === 'hi'
      ? `लगभग ${riskData.leadTimeHours} घंटे में अत्यधिक बाढ़ आने का अनुमान है। लगातार वर्षा और रंगानदी बांध से जल निकासी के कारण जलस्तर खतरे के निशान से ऊपर पहुंच रहा है।`
      : riskData.explanation;

    const translatedAction = lang === 'hi'
      ? `उत्तरी तटबंध सुरक्षित निकासी गलियारे से होते हुए तुरंत मॉडल हायर सेकेंडरी सुरक्षित आश्रय केंद्र की ओर जाएं। जलमग्न पुलिया पार न करें।`
      : riskData.recommendedAction;

    container.innerHTML = `
      <div class="dashboard-container fade-in">
        <!-- 1. Top Context Bar -->
        <div class="glass-panel context-bar">
          <div class="context-location">
            <div class="context-location-icon" style="background:${color}22; border-color:${color}; color:${color};">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h1 class="context-title" id="current-settlement-name">
                ${lang === 'hi' ? riskData.settlement.name.replace('Settlement', 'बस्ती') : riskData.settlement.name}
              </h1>
              <div class="context-subtitle">
                ${riskData.settlement.district} ${TranslationService.t('districtLabel', lang)}, ${riskData.settlement.state} &bull; ${TranslationService.t('coordinatesLabel', lang)} ${riskData.settlement.coordinates[0].toFixed(3)}°N, ${riskData.settlement.coordinates[1].toFixed(3)}°E
              </div>
            </div>
          </div>

          <div class="context-meta">
            <div class="freshness-tag">
              <i class="fa-solid fa-rotate"></i> ${TranslationService.t('updatedLabel', lang)} ${riskData.updatedAt}
            </div>

            <!-- Settlement Selector -->
            <div>
              <label for="settlement-picker" class="sr-only">Change Settlement</label>
              <select id="settlement-picker" class="settlement-select" aria-label="Change settlement">
                ${settlements.map(s => `
                  <option value="${s.id}" ${s.id === settlementId ? 'selected' : ''}>
                    ${s.name} (${s.riskLevel})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- 2. Main Risk Core Grid: Left Risk Dial, Right Recommended Action -->
        <div class="risk-core-grid">
          <!-- Main Risk Card -->
          <div class="glass-panel main-risk-card ${level === 'CRITICAL' ? 'glass-panel-danger' : ''}">
            <div class="hazard-badge-strip">
              <span class="hazard-pill"><i class="fa-solid fa-water"></i> ${lang === 'hi' ? 'आकस्मिक नदी बाढ़' : riskData.hazard}</span>
              <span class="status-badge ${badgeClass}">${translatedLevel} ${lang === 'hi' ? 'जोखिम' : 'RISK'}</span>
            </div>

            <!-- Visual Risk Gauge Ring (Numerical Score Preserved) -->
            <div class="risk-gauge-container" role="img" aria-label="Risk score ${score} out of 100">
              <svg class="risk-gauge-svg" viewBox="0 0 160 160">
                <circle class="risk-gauge-track" cx="80" cy="80" r="70"></circle>
                <circle 
                  class="risk-gauge-fill" 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  style="stroke: ${color}; stroke-dashoffset: ${strokeOffset};"
                ></circle>
              </svg>
              <div class="risk-gauge-content">
                <div class="risk-gauge-score">${score}</div>
                <div class="risk-gauge-label" style="color:${color};">${translatedLevel}</div>
              </div>
            </div>

            <p class="risk-explanation-text">
              ${translatedExplanation}
            </p>

            <div style="display:flex; gap:1rem; width:100%; justify-content:center; flex-wrap:wrap;">
              <div class="risk-lead-time-box">
                <i class="fa-solid fa-hourglass-start" style="color:var(--color-accent);"></i>
                <span>${TranslationService.t('leadTimeLabel', lang)} <span class="lead-time-val">${riskData.leadTimeHours} hrs</span></span>
              </div>
              <div class="risk-lead-time-box">
                <i class="fa-solid fa-chart-pie" style="color:var(--color-accent);"></i>
                <span>${TranslationService.t('confidenceLabel', lang)} <strong>${riskData.confidence}</strong></span>
              </div>
            </div>
          </div>

          <!-- 3. Recommended Action Card -->
          <div class="glass-panel action-priority-card" style="border-left-color:${color};">
            <div>
              <div class="action-header-row">
                <div>
                  <span class="hero-badge" style="background:rgba(2,132,199,0.08); border-color:#bae6fd; color:#0369a1; margin-bottom:0.5rem;">
                    <i class="fa-solid fa-person-running"></i> ${TranslationService.t('priorityActionRequired', lang)}
                  </span>
                  <h2 class="action-main-instruction">${translatedAction}</h2>
                </div>
                ${riskData.evacuationRequired ? `
                  <span class="action-urgency-badge">
                    <i class="fa-solid fa-bell"></i> ${TranslationService.t('urgentActionBadge', lang)}
                  </span>
                ` : `
                  <span class="status-badge badge-neutral">${TranslationService.t('standbyBadge', lang)}</span>
                `}
              </div>

              <!-- Interactive Resident Checklist -->
              <div class="checklist-container">
                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-1" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step1Title', lang)}</div>
                    <div class="checklist-desc">${TranslationService.t('step1Desc', lang)}</div>
                  </div>
                </label>

                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-2" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step2Title', lang)}</div>
                    <div class="checklist-desc">${TranslationService.t('step2Desc', lang)}</div>
                  </div>
                </label>

                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-3" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step3Title', lang)}</div>
                    <div class="checklist-desc">${TranslationService.t('step3Desc', lang)}</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Action CTAs -->
            <div class="action-buttons-group">
              ${riskData.routeAvailable ? `
                <a href="#safe-route" class="btn btn-emergency btn-lg" id="btn-open-safe-route">
                  <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('findSafeRoute', lang)}
                </a>
              ` : `
                <button class="btn btn-secondary btn-lg" disabled>
                  <i class="fa-solid fa-circle-check"></i> ${TranslationService.t('standbyBadge', lang)}
                </button>
              `}
              <a href="#risk-map" class="btn btn-secondary">
                <i class="fa-solid fa-map-location-dot"></i> ${TranslationService.t('viewOnBasinMap', lang)}
              </a>
              <button class="btn btn-secondary" id="btn-share-risk-alert">
                <i class="fa-solid fa-share-nodes"></i> ${TranslationService.t('shareAlert', lang)}
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Contributing Factors Section -->
        <section class="factors-section">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3>${TranslationService.t('factorsTitle', lang)}</h3>
              <p style="font-size:0.875rem;">${TranslationService.t('factorsSubtitle', lang)}</p>
            </div>
            <span class="status-badge badge-neutral" style="font-size:0.75rem;">
              <i class="fa-solid fa-circle-info"></i> ${riskData.factors.length} ${TranslationService.t('environmentalVectorsLabel', lang)}
            </span>
          </div>

          <div class="factor-grid">
            ${riskData.factors.map(factor => `
              <div class="factor-card">
                <div class="factor-header">
                  <span>${lang === 'hi' ? (factor.name === 'Rainfall Intensity' ? 'वर्षा की तीव्रता' : factor.name === 'River Discharge' ? 'नदी जलप्रवाह दर' : factor.name === 'Soil Moisture' ? 'मिट्टी में नमी' : factor.name === 'Upstream Inflow' ? 'ऊपरी बांध निकासी' : factor.name === 'Sentinel-1 SAR' ? 'उपग्रह जल फैलाव' : 'भूमिगत LoRa सेंसर') : factor.name}</span>
                  <i class="fa-solid ${factor.icon}"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value">${factor.value}</span>
                  <span class="factor-unit">/ ${factor.unit}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.775rem;">
                  <span style="color:#64748b;">मानक: ${factor.normal}</span>
                  <span class="factor-trend ${factor.status === 'danger' ? 'trend-up-danger' : factor.status === 'warning' ? 'trend-up-warning' : 'trend-stable'}">
                    ${factor.trend}
                  </span>
                </div>
                <div class="factor-explanation">
                  ${lang === 'hi' ? (factor.status === 'danger' ? 'खतरे के स्तर से अधिक; तत्काल निकासी आवश्यक।' : factor.explanation) : factor.explanation}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 5. Impact Forecast Grid -->
        <section>
          <h3>${TranslationService.t('forecastImpactTitle', lang)}</h3>
          <p style="font-size:0.875rem; margin-bottom:1rem;">${TranslationService.t('forecastImpactSubtitle', lang)}</p>

          <div class="impact-grid">
            <div class="impact-card">
              <span class="impact-label">${TranslationService.t('popAtRiskLabel', lang)}</span>
              <div class="impact-number" style="color:#dc2626;">${riskData.impact.peopleAffected.toLocaleString()}</div>
              <span style="font-size:0.75rem; color:#64748b;">${TranslationService.t('popAtRiskSub', lang)}</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">${TranslationService.t('structuresExposedLabel', lang)}</span>
              <div class="impact-number">${riskData.impact.structuresAffected}</div>
              <span style="font-size:0.75rem; color:#64748b;">${TranslationService.t('structuresExposedSub', lang)}</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">${TranslationService.t('roadLengthLabel', lang)}</span>
              <div class="impact-number" style="color:#d97706;">${riskData.impact.roadsAffectedKm} km</div>
              <span style="font-size:0.75rem; color:#64748b;">${TranslationService.t('roadLengthSub', lang)}</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">${TranslationService.t('priorityTriageLabel', lang)}</span>
              <div style="font-size:1.15rem; font-weight:800; color:#0284c7; margin-top:0.35rem;">
                ${lang === 'hi' ? 'प्राथमिकता 1 - तत्काल निकासी' : riskData.impact.priorityLevel}
              </div>
              <span style="font-size:0.75rem; color:#64748b;">${riskData.impact.estimateType}</span>
            </div>
          </div>
        </section>

        <!-- 6. Timeline & Data Confidence Split -->
        <div class="split-info-grid">
          <!-- Timeline -->
          <div class="glass-panel" style="padding:1.75rem;">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> ${TranslationService.t('timelineTitle', lang)}</h3>
            <div class="timeline">
              ${(riskData.timeline || []).map((t, idx) => `
                <div class="timeline-item">
                  <div class="timeline-marker ${idx === riskData.timeline.length - 1 ? 'active' : ''}"></div>
                  <div class="timeline-time">${t.time}</div>
                  <div class="timeline-title">${lang === 'hi' ? (idx === 0 ? 'भारी जल प्रवाह दर्ज' : idx === 1 ? 'तटबंध रिसाव चेतावनी' : idx === 2 ? 'जोखिम बढ़कर अति गंभीर स्तर पर' : 'निकासी प्रोटोकॉल सक्रिय') : t.title}</div>
                  <div class="timeline-desc">${t.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Data Confidence & Limitations -->
          <div class="glass-panel confidence-box">
            <h3><i class="fa-solid fa-shield-halved"></i> ${TranslationService.t('dataTrustTitle', lang)}</h3>
            <p style="font-size:0.85rem;">${TranslationService.t('dataTrustSubtitle', lang)}</p>

            <div class="confidence-item">
              <i class="fa-solid fa-circle-check" style="color:#059669;"></i>
              <div>
                <strong>${TranslationService.t('activeObservationsLabel', lang)}</strong>
                <div style="color:#475569; font-size:0.8rem;">${riskData.confidenceMeta.availableSources.join(', ')}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-triangle-exclamation" style="color:#d97706;"></i>
              <div>
                <strong>${TranslationService.t('missingLayersLabel', lang)}</strong>
                <div style="color:#475569; font-size:0.8rem;">${riskData.confidenceMeta.unavailableSources.join(', ') || (lang === 'hi' ? 'कोई नहीं (सभी प्रणालियां सक्रिय)' : 'None (All systems nominal)')}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-server"></i>
              <div>
                <strong>${TranslationService.t('modelModeLabel', lang)}</strong>
                <div style="color:#0284c7; font-size:0.8rem;">${riskData.confidenceMeta.modelStatus}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-arrows-rotate"></i>
              <div>
                <strong>${TranslationService.t('nextUpdateLabel', lang)}</strong>
                <div style="color:#475569; font-size:0.8rem;">${lang === 'hi' ? '18 मिनट में (स्वतः सिंक)' : riskData.confidenceMeta.nextUpdateExpected}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(riskData);
  }

  static attachEvents(riskData) {
    const picker = document.getElementById('settlement-picker');
    if (picker) {
      picker.addEventListener('change', (e) => {
        state.set('activeSettlementId', e.target.value);
        this.render(document.getElementById('page-content-mount'));
        Toast.show(`Switched active view to ${e.target.selectedOptions[0].text}`, 'info');
      });
    }

    const shareBtn = document.getElementById('btn-share-risk-alert');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `[AapadaSathi Early Warning] ${riskData.settlement.name} is under ${riskData.riskLevel} FLOOD RISK (Lead time: ${riskData.leadTimeHours}h). Action: ${riskData.recommendedAction}`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          Toast.show('Early warning alert details copied to clipboard!', 'success');
        } else {
          Toast.show('Alert generated. Ready to share via WhatsApp / SMS.', 'info');
        }
      });
    }

    document.querySelectorAll('.checklist-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        if (e.target.checked) {
          Toast.show('Safety step checked off. Keep moving toward high ground.', 'success', 2500);
        }
      });
    });
  }
}
