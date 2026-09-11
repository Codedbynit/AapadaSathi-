/**
 * Page Controller: Official Response Dashboard (Admin Incident Command Portal)
 * Complete English & Hindi Localization
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { ResponseService } from '../services/response-service.js';
import { AlertService } from '../services/alert-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class ResponseDashboardPage {
  static async render(container) {
    const lang = state.get('activeLanguage') || 'en';
    const settlements = await RiskService.getAllSettlements();
    const overview = await ResponseService.getOverview();

    if (!overview) {
      container.innerHTML = `
        <div class="response-container fade-in">
          <div class="glass-panel response-header" style="text-align:center; padding: 4rem;">
            <i class="fa-solid fa-server" style="font-size:3rem; color:#cbd5e1; margin-bottom:1rem;"></i>
            <h2>Admin Portal Data Unavailable</h2>
            <p>The centralized incident command backend is currently offline.</p>
          </div>
        </div>
      `;
      return;
    }

    const sortedSettlements = [...settlements].sort((a, b) => b.riskScore - a.riskScore);

    container.innerHTML = `
      <div class="response-container fade-in">
        <!-- Operational Header -->
        <div class="glass-panel response-header">
          <div class="response-title-group">
            <span class="hero-badge" style="margin-bottom:0.5rem;"><i class="fa-solid fa-lock"></i> ${TranslationService.t('adminPortal', lang)}</span>
            <h1>${TranslationService.t('adminDashboardTitle', lang)}</h1>
            <p>${TranslationService.t('adminDashboardSubtitle', lang)}</p>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span class="status-badge badge-low"><i class="fa-solid fa-signal"></i> ${TranslationService.t('networkSyncOptimal', lang)}</span>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-telemetry">
              <i class="fa-solid fa-arrows-rotate"></i> ${TranslationService.t('refreshTelemetryBtn', lang)}
            </button>
          </div>
        </div>

        <!-- 1. Overview Metrics Strip -->
        <div class="response-metrics-grid">
          <div class="glass-panel resp-stat-card" style="border-left:4px solid #dc2626;">
            <span class="resp-stat-label">${TranslationService.t('highCriticalSettlementsLabel', lang)}</span>
            <div class="resp-stat-val" style="color:#dc2626;">${overview.metrics.activeHighRiskSettlements} / ${overview.metrics.monitoredSettlements}</div>
            <span class="resp-stat-sub">${TranslationService.t('highCriticalSub', lang)}</span>
          </div>

          <div class="glass-panel resp-stat-card" style="border-left:4px solid #ea580c;">
            <span class="resp-stat-label">${TranslationService.t('exposedPopulationLabel', lang)}</span>
            <div class="resp-stat-val" style="color:#ea580c;">${overview.metrics.totalExposedPopulation.toLocaleString()}</div>
            <span class="resp-stat-sub">${TranslationService.t('exposedPopSub', lang)}</span>
          </div>

          <div class="glass-panel resp-stat-card" style="border-left:4px solid #059669;">
            <span class="resp-stat-label">${TranslationService.t('designatedReliefHubsLabel', lang)}</span>
            <div class="resp-stat-val" style="color:#059669;">${overview.metrics.activeSheltersReady}</div>
            <span class="resp-stat-sub">${TranslationService.t('designatedReliefSub', lang)}</span>
          </div>

          <div class="glass-panel resp-stat-card">
            <span class="resp-stat-label">${TranslationService.t('roadsCutOffLabel', lang)}</span>
            <div class="resp-stat-val" style="color:#d97706;">${overview.metrics.impassableRoadKm} km</div>
            <span class="resp-stat-sub">${TranslationService.t('roadsCutOffSub', lang)}</span>
          </div>

          <div class="glass-panel resp-stat-card">
            <span class="resp-stat-label">${TranslationService.t('avgLeadTimeLabel', lang)}</span>
            <div class="resp-stat-val" style="color:#0284c7;">~${overview.metrics.averageLeadTimeHours}h</div>
            <span class="resp-stat-sub">${TranslationService.t('avgLeadTimeSub', lang)}</span>
          </div>
        </div>

        <!-- 2. Priority Settlement Action Queue -->
        <div class="glass-panel" style="padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3><i class="fa-solid fa-list-check"></i> ${TranslationService.t('priorityQueueTitle', lang)}</h3>
              <p style="font-size:0.875rem;">${TranslationService.t('priorityQueueSubtitle', lang)}</p>
            </div>
            <a href="#risk-map" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-map-location-dot"></i> ${TranslationService.t('viewOnBasinMap', lang)}
            </a>
          </div>

          <div class="priority-table-wrapper">
            <table class="priority-table" aria-label="Settlement evacuation priority queue">
              <thead>
                <tr>
                  <th>${TranslationService.t('colSettlement', lang)}</th>
                  <th>${TranslationService.t('colHazard', lang)}</th>
                  <th>${TranslationService.t('colRiskScore', lang)}</th>
                  <th>${TranslationService.t('colLeadTime', lang)}</th>
                  <th>${TranslationService.t('colPopulation', lang)}</th>
                  <th>${TranslationService.t('colEvacuation', lang)}</th>
                  <th>${TranslationService.t('colLastUpdate', lang)}</th>
                  <th>${TranslationService.t('colAction', lang)}</th>
                </tr>
              </thead>
              <tbody>
                ${sortedSettlements.map(s => `
                  <tr>
                    <td>
                      <strong style="color:#0f2b48;">${lang === 'hi' ? s.name.replace('Settlement', 'बस्ती') : s.name}</strong>
                      <div style="font-size:0.75rem; color:#64748b;">${s.district}, ${s.state}</div>
                    </td>
                    <td>${s.hazardType}</td>
                    <td>
                      <span class="status-badge ${RiskService.getRiskBadgeClass(s.riskLevel)}">${s.riskScore}/100</span>
                    </td>
                    <td><strong style="color:#0284c7;">${s.leadTimeHours} hrs</strong></td>
                    <td>${s.population.toLocaleString()}</td>
                    <td>
                      ${s.evacuationRequired 
                        ? `<span style="color:#dc2626; font-weight:700;"><i class="fa-solid fa-bell"></i> ${TranslationService.t('mandatedBadge', lang)}</span>` 
                        : `<span style="color:#64748b;">${TranslationService.t('standbyBadge', lang)}</span>`}
                    </td>
                    <td style="font-size:0.8rem; color:#475569;">${s.updatedAt}</td>
                    <td>
                      <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-secondary btn-sm resp-inspect-btn" data-id="${s.id}">
                          ${TranslationService.t('inspectBtn', lang)}
                        </button>
                        ${s.evacuationRequired ? `
                          <button class="btn btn-danger btn-sm resp-route-btn" data-id="${s.id}">
                            ${TranslationService.t('routeBtn', lang)}
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Two Column: Trust Metrics & Data Health -->
        <div class="operational-dual-grid">
          <!-- Model Trust Panel -->
          <div class="glass-panel trust-metrics-card">
            <div>
              <span class="hero-badge"><i class="fa-solid fa-scale-balanced"></i> ${TranslationService.t('modelReliabilityBadge', lang)}</span>
              <h3 style="margin-top:0.4rem;">${TranslationService.t('hydrologicalEnsembleTitle', lang)}</h3>
              <p style="font-size:0.85rem;">${TranslationService.t('hydrologicalEnsembleSubtitle', lang)}</p>
            </div>

            <div class="metrics-row">
              <div class="metric-box">
                <div class="metric-val">${overview.modelEvaluation.precision}</div>
                <div class="metric-label">${TranslationService.t('precisionLabel', lang)}</div>
              </div>
              <div class="metric-box">
                <div class="metric-val">${overview.modelEvaluation.recall}</div>
                <div class="metric-label">${TranslationService.t('recallLabel', lang)}</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#059669;">${overview.modelEvaluation.falseAlarmRate}</div>
                <div class="metric-label">${TranslationService.t('falseAlarmLabel', lang)}</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#0f2b48;">${overview.modelEvaluation.evaluatedIncidents}</div>
                <div class="metric-label">${TranslationService.t('holdoutIncidentsLabel', lang)}</div>
              </div>
            </div>

            <div style="padding:0.75rem; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; font-size:0.78rem; color:#64748b; line-height:1.45;">
              <strong style="color:#0f2b48;">Disclaimer:</strong> ${overview.modelEvaluation.disclaimer}
            </div>
          </div>

          <!-- Data-Source Health Pipeline -->
          <div class="glass-panel trust-metrics-card">
            <div>
              <span class="hero-badge"><i class="fa-solid fa-network-wired"></i> ${TranslationService.t('sensorMeshBadge', lang)}</span>
              <h3 style="margin-top:0.4rem;">${TranslationService.t('liveIngestionTitle', lang)}</h3>
              <p style="font-size:0.85rem;">${TranslationService.t('liveIngestionSubtitle', lang)}</p>
            </div>

            <div class="pipeline-list">
              ${overview.dataSources.map(ds => `
                <div class="pipeline-item">
                  <div class="pipeline-name">
                    <i class="fa-solid fa-server" style="color:#0284c7;"></i>
                    <span>${ds.name}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:1rem;">
                    <span style="font-size:0.75rem; color:#64748b;">${ds.latency}</span>
                    <span class="pipeline-status-ok"><i class="fa-solid fa-circle-check"></i> ${ds.status}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4. Emergency Alert Composer (Multi-channel Broadcast Sandbox) -->
        <div class="glass-panel alert-composer-card">
          <div>
            <span class="hero-badge"><i class="fa-solid fa-bullhorn"></i> ${TranslationService.t('dispatchConsoleBadge', lang)}</span>
            <h3 style="margin-top:0.4rem;">${TranslationService.t('emergencyComposerTitle', lang)}</h3>
            <p style="font-size:0.85rem;">${TranslationService.t('emergencyComposerSubtitle', lang)}</p>
          </div>

          <form id="alert-composer-form" class="composer-form-grid" onsubmit="return false;">
            <div>
              <label for="comp-settlement" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">${TranslationService.t('targetSettlementLabel', lang)}</label>
              <select id="comp-settlement" class="composer-select">
                ${settlements.map(s => `<option value="${s.id}">${s.name} (${s.riskLevel})</option>`).join('')}
              </select>
            </div>

            <div>
              <label for="comp-hazard" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">${TranslationService.t('hazardScenarioLabel', lang)}</label>
              <select id="comp-hazard" class="composer-select">
                <option value="Flash Riverine Flooding">${lang === 'hi' ? 'आकस्मिक नदी बाढ़' : 'Flash Riverine Flooding'}</option>
                <option value="Embankment Breach">${lang === 'hi' ? 'तटबंध टूटना' : 'Embankment Breach'}</option>
                <option value="Erosion & High Water">${lang === 'hi' ? 'नदी कटाव व उच्च जलस्तर' : 'Erosion & High Water'}</option>
              </select>
            </div>

            <div>
              <label for="comp-lang" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">${TranslationService.t('languageOutputLabel', lang)}</label>
              <select id="comp-lang" class="composer-select">
                <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${lang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
              </select>
            </div>
          </form>

          <!-- Real-Time Previews -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
            <div class="composer-preview-box">
              <span class="preview-badge"><i class="fa-solid fa-comment-sms"></i> ${lang === 'hi' ? 'मोबाइल एसएमएस पूर्वदर्शन (160 अक्षर)' : 'Simulated Cellular SMS (160 char)'}</span>
              <div class="preview-text" id="sms-preview-text">
                ${lang === 'hi' 
                  ? '[आपदा साथी चेतावनी] मिकिरपारा बस्ती: बाढ़ का उच्च जोखिम अनुमानित है। कृपया उत्तरी तटबंध मार्ग से सुरक्षित आश्रय की ओर प्रस्थान करें। हेल्पलाइन: 112.'
                  : '[AapadaSathi ALERT] Mikirpara Settlement: Predicted Flood risk level is HIGH. Evacuate via North Embankment to designated safe shelter. Helpline: 112.'}
              </div>
            </div>

            <div class="composer-preview-box">
              <span class="preview-badge"><i class="fa-solid fa-mobile-screen"></i> ${lang === 'hi' ? 'ऐप आपातकालीन पुश सूचना पूर्वदर्शन' : 'In-App Emergency Push Notification'}</span>
              <div class="preview-text" id="push-preview-text">
                ${lang === 'hi'
                  ? '⚠️ [तत्काल] आपदा साथी: जलस्तर लगभग 6.5 घंटे में बढ़ने का अनुमान। मॉडल हायर सेकेंडरी हेतु सुरक्षित निकासी गलियारा सक्रिय है।'
                  : '⚠️ [URGENT] AapadaSathi: Water surge projected in ~6.5 hrs. High-ground evacuation corridor active to Model Higher Secondary. Follow route in app.'}
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-top:0.5rem;">
            <div style="font-size:0.8rem; color:#64748b;">
              <i class="fa-solid fa-lock"></i> ${lang === 'hi' ? 'दूरसंचार सुरक्षा हेतु परीक्षण मोड में वास्तविक एसएमएस प्रेषण निष्क्रिय है।' : 'Live SMS Gateway disabled in Hackathon Sandbox mode for telecom safety.'}
            </div>
            <button class="btn btn-primary" id="btn-broadcast-demo">
              <i class="fa-solid fa-paper-plane"></i> ${TranslationService.t('broadcastDemoBtn', lang)}
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(settlements);
  }

  static attachEvents(settlements) {
    const refreshBtn = document.getElementById('btn-refresh-telemetry');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        Toast.show('Telemetry data refreshed from CWC & IMD Doppler sensors.', 'success');
      });
    }

    document.querySelectorAll('.resp-inspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#risk-dashboard';
      });
    });

    document.querySelectorAll('.resp-route-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#safe-route';
      });
    });

    const broadcastBtn = document.getElementById('btn-broadcast-demo');
    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', () => {
        Toast.show('Simulated broadcast dispatched to emergency response nodes!', 'danger', 4000);
      });
    }
  }
}
