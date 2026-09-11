/**
 * Page Controller: Resident Risk Dashboard
 * Complete English & Hindi Localization
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';
import { FloodApi } from '../api/flood-api.js';

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

    const settlements = await RiskService.getAllSettlements();
    const riskData = await RiskService.getRisk(settlementId);

    const level = riskData.riskLevel;
    const score = riskData.riskScore;
    const color = RiskService.getRiskColor(level);
    const badgeClass = RiskService.getRiskBadgeClass(level);

    // Fetch REAL flood data from backend
    let liveRiverDischarge = null;
    try {
      // Using requested coordinates 26.2, 92.5
      const floodRes = await FloodApi.getRiverDischarge(26.2, 92.5);
      if (floodRes && floodRes.data && floodRes.data.river_discharge_m3s !== undefined) {
        liveRiverDischarge = floodRes.data.river_discharge_m3s;
      }
    } catch (e) {
      console.warn("Failed to load real flood data:", e);
    }

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
