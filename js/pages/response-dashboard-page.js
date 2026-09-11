/**
 * Page Controller: Official Response Dashboard
 * Multi-settlement operational oversight, ML Trust Metrics, Data Pipeline Health, Alert Composer
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { ResponseService } from '../services/response-service.js';
import { AlertService } from '../services/alert-service.js';
import { Toast } from '../components/toast.js';

export class ResponseDashboardPage {
  static async render(container) {
    const settlements = await RiskService.getAllSettlements();
    const overview = await ResponseService.getOverview();

    // Sort settlements descending by risk score for priority queue
    const sortedSettlements = [...settlements].sort((a, b) => b.riskScore - a.riskScore);

    container.innerHTML = `
      <div class="response-container fade-in">
        <!-- Operational Header -->
        <div class="glass-panel response-header">
          <div class="response-title-group">
            <span class="hero-badge" style="margin-bottom:0.5rem;"><i class="fa-solid fa-headset"></i> Incident Command System</span>
            <h1>Disaster Response Operational Dashboard</h1>
            <p>Brahmaputra Basin (Majuli District & Adjacent Sectors) &bull; Live Telemetry Feed</p>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span class="status-badge badge-low"><i class="fa-solid fa-signal"></i> Network Sync: Optimal</span>
            <button class="btn btn-secondary btn-sm" id="btn-refresh-telemetry">
              <i class="fa-solid fa-arrows-rotate"></i> Refresh Telemetry
            </button>
          </div>
        </div>

        <!-- 1. Overview Metrics Strip -->
        <div class="response-metrics-grid">
          <div class="glass-panel resp-stat-card" style="border-left:4px solid #ef4444;">
            <span class="resp-stat-label">High/Critical Settlements</span>
            <div class="resp-stat-val" style="color:#f87171;">${overview.metrics.activeHighRiskSettlements} of ${overview.metrics.monitoredSettlements}</div>
            <span class="resp-stat-sub">Requires active monitoring</span>
          </div>

          <div class="glass-panel resp-stat-card" style="border-left:4px solid #ea580c;">
            <span class="resp-stat-label">Exposed Population</span>
            <div class="resp-stat-val" style="color:#fb923c;">${overview.metrics.totalExposedPopulation.toLocaleString()}</div>
            <span class="resp-stat-sub">Within projected flood inundation</span>
          </div>

          <div class="glass-panel resp-stat-card" style="border-left:4px solid #10b981;">
            <span class="resp-stat-label">Designated Relief Hubs</span>
            <div class="resp-stat-val" style="color:#34d399;">${overview.metrics.activeSheltersReady} Active</div>
            <span class="resp-stat-sub">Stockpiled with rations & power</span>
          </div>

          <div class="glass-panel resp-stat-card">
            <span class="resp-stat-label">Roads Cut-Off</span>
            <div class="resp-stat-val" style="color:#f59e0b;">${overview.metrics.impassableRoadKm} km</div>
            <span class="resp-stat-sub">Impassable culvert breaches</span>
          </div>

          <div class="glass-panel resp-stat-card">
            <span class="resp-stat-label">Average Warning Lead Time</span>
            <div class="resp-stat-val" style="color:#38bdf8;">~${overview.metrics.averageLeadTimeHours}h</div>
            <span class="resp-stat-sub">Sufficient for staged evacuation</span>
          </div>
        </div>

        <!-- 2. Priority Settlement Action Queue -->
        <div class="glass-panel" style="padding:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <h3><i class="fa-solid fa-list-check"></i> Settlement Priority Evacuation Queue</h3>
              <p style="font-size:0.875rem;">Ranked by multi-factor risk urgency and vulnerable population count.</p>
            </div>
            <a href="#risk-map" class="btn btn-secondary btn-sm">
              <i class="fa-solid fa-map-location-dot"></i> View All on Geospatial Map
            </a>
          </div>

          <div class="priority-table-wrapper">
            <table class="priority-table" aria-label="Settlement evacuation priority queue">
              <thead>
                <tr>
                  <th>Settlement</th>
                  <th>Hazard</th>
                  <th>Risk Score</th>
                  <th>Lead Time</th>
                  <th>Population</th>
                  <th>Evacuation</th>
                  <th>Last Update</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${sortedSettlements.map(s => `
                  <tr>
                    <td>
                      <strong style="color:#ffffff;">${s.name}</strong>
                      <div style="font-size:0.75rem; color:#94a3b8;">${s.district}, ${s.state}</div>
                    </td>
                    <td>${s.hazardType}</td>
                    <td>
                      <span class="status-badge ${RiskService.getRiskBadgeClass(s.riskLevel)}">${s.riskScore}/100</span>
                    </td>
                    <td><strong style="color:#38bdf8;">${s.leadTimeHours} hrs</strong></td>
                    <td>${s.population.toLocaleString()}</td>
                    <td>
                      ${s.evacuationRequired 
                        ? '<span style="color:#f87171; font-weight:700;"><i class="fa-solid fa-bell"></i> Mandated</span>' 
                        : '<span style="color:#94a3b8;">Standby</span>'}
                    </td>
                    <td style="font-size:0.8rem; color:#cbd5e1;">${s.updatedAt}</td>
                    <td>
                      <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-secondary btn-sm resp-inspect-btn" data-id="${s.id}">
                          Inspect
                        </button>
                        ${s.evacuationRequired ? `
                          <button class="btn btn-danger btn-sm resp-route-btn" data-id="${s.id}">
                            Route
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

        <!-- 3. Two Column: Model Trust Panel & Data Pipeline Health -->
        <div class="operational-dual-grid">
          <!-- Model Trust Panel -->
          <div class="glass-panel trust-metrics-card">
            <div>
              <span class="hero-badge"><i class="fa-solid fa-scale-balanced"></i> Model Reliability</span>
              <h3 style="margin-top:0.4rem;">Hydrological Ensemble Trust Metrics</h3>
              <p style="font-size:0.85rem;">Historical holdout evaluation metrics for the settlement early warning model.</p>
            </div>

            <div class="metrics-row">
              <div class="metric-box">
                <div class="metric-val">${overview.modelEvaluation.precision}</div>
                <div class="metric-label">Precision (True Hazard Accuracy)</div>
              </div>
              <div class="metric-box">
                <div class="metric-val">${overview.modelEvaluation.recall}</div>
                <div class="metric-label">Recall (Inundation Detection)</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#34d399;">${overview.modelEvaluation.falseAlarmRate}</div>
                <div class="metric-label">False Alarm Rate</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#ffffff;">${overview.modelEvaluation.evaluatedIncidents}</div>
                <div class="metric-label">Holdout Incident Events</div>
              </div>
            </div>

            <div style="padding:0.75rem; background:rgba(255,255,255,0.04); border-radius:8px; border:1px solid rgba(255,255,255,0.08); font-size:0.78rem; color:#94a3b8; line-height:1.45;">
              <strong style="color:#ffffff;">Disclaimer:</strong> ${overview.modelEvaluation.disclaimer}
            </div>
          </div>

          <!-- Data-Source Health Pipeline -->
          <div class="glass-panel trust-metrics-card">
            <div>
              <span class="hero-badge"><i class="fa-solid fa-network-wired"></i> Sensor Mesh</span>
              <h3 style="margin-top:0.4rem;">Live Ingestion Pipeline Health</h3>
              <p style="font-size:0.85rem;">Status of remote sensing, Doppler radar, and hydrological telemetry streams.</p>
            </div>

            <div class="pipeline-list">
              ${overview.dataSources.map(ds => `
                <div class="pipeline-item">
                  <div class="pipeline-name">
                    <i class="fa-solid fa-server" style="color:var(--color-accent);"></i>
                    <span>${ds.name}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:1rem;">
                    <span style="font-size:0.75rem; color:#94a3b8;">${ds.latency}</span>
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
            <span class="hero-badge"><i class="fa-solid fa-bullhorn"></i> Dispatch Console</span>
            <h3 style="margin-top:0.4rem;">Emergency Multi-Channel Alert Composer</h3>
            <p style="font-size:0.85rem;">Draft and preview settlement-targeted early warnings for cellular push and SMS dispatch.</p>
          </div>

          <form id="alert-composer-form" class="composer-form-grid" onsubmit="return false;">
            <div>
              <label for="comp-settlement" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">Target Settlement</label>
              <select id="comp-settlement" class="composer-select">
                ${settlements.map(s => `<option value="${s.id}">${s.name} (${s.riskLevel})</option>`).join('')}
              </select>
            </div>

            <div>
              <label for="comp-hazard" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">Hazard Scenario</label>
              <select id="comp-hazard" class="composer-select">
                <option value="Flash Riverine Flooding">Flash Riverine Flooding</option>
                <option value="Embankment Breach">Embankment Breach</option>
                <option value="Erosion & High Water">Erosion & High Water</option>
              </select>
            </div>

            <div>
              <label for="comp-lang" style="display:block; font-size:0.825rem; font-weight:600; margin-bottom:0.4rem;">Language Output</label>
              <select id="comp-lang" class="composer-select">
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="as">অসমীয়া (Assamese)</option>
              </select>
            </div>
          </form>

          <!-- Real-Time Previews -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
            <div class="composer-preview-box">
              <span class="preview-badge"><i class="fa-solid fa-comment-sms"></i> Simulated Cellular SMS (160 char)</span>
              <div class="preview-text" id="sms-preview-text">
                [AapadaSathi ALERT] Mikirpara Settlement: Predicted Flood risk level is HIGH. Evacuate via North Embankment to designated safe shelter. Helpline: 112.
              </div>
            </div>

            <div class="composer-preview-box">
              <span class="preview-badge"><i class="fa-solid fa-mobile-screen"></i> In-App Emergency Push Notification</span>
              <div class="preview-text" id="push-preview-text">
                ⚠️ [URGENT] AapadaSathi: Water surge projected in ~6.5 hrs. High-ground evacuation corridor active to Model Higher Secondary. Follow route in app.
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-top:0.5rem;">
            <div style="font-size:0.8rem; color:#94a3b8;">
              <i class="fa-solid fa-lock"></i> Live SMS Gateway disabled in Hackathon Sandbox mode for telecom safety.
            </div>
            <button class="btn btn-primary" id="btn-broadcast-demo">
              <i class="fa-solid fa-paper-plane"></i> Broadcast Simulated Alert
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(settlements);
  }

  static attachEvents(settlements) {
    // Refresh telemetry
    const refreshBtn = document.getElementById('btn-refresh-telemetry');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        Toast.show('Telemetry data refreshed from CWC & IMD Doppler sensors.', 'success');
      });
    }

    // Inspect buttons
    document.querySelectorAll('.resp-inspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#risk-dashboard';
      });
    });

    // Route buttons
    document.querySelectorAll('.resp-route-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        state.set('activeSettlementId', id);
        window.location.hash = '#safe-route';
      });
    });

    // Alert composer dynamic updates
    const selSettlement = document.getElementById('comp-settlement');
    const selHazard = document.getElementById('comp-hazard');
    const selLang = document.getElementById('comp-lang');
    const smsBox = document.getElementById('sms-preview-text');
    const pushBox = document.getElementById('push-preview-text');

    const updatePreview = () => {
      const sId = selSettlement.value;
      const sObj = settlements.find(s => s.id === sId) || settlements[0];
      const hazard = selHazard.value;
      const lang = selLang.value;

      if (lang === 'hi') {
        smsBox.innerText = `[आपदा साथी चेतावनी] ${sObj.name}: ${hazard} का उच्च जोखिम अनुमानित है। कृपया उत्तरी तटबंध मार्ग से सुरक्षित आश्रय की ओर प्रस्थान करें। हेल्पलाइन: 112.`;
        pushBox.innerText = `⚠️ [तत्काल] आपदा साथी: ${sObj.name} में बाढ़ का खतरा। सुरक्षित निकासी मार्ग देखने हेतु ऐप खोलें।`;
      } else if (lang === 'as') {
        smsBox.innerText = `[আপদা সাথী সতৰ্কবাণী] ${sObj.name}: ${hazard}ৰ উচ্চ আশংকা। অনুগ্ৰহ কৰি উত্তৰ মথাউৰিৰে সুৰক্ষিত আশ্ৰয় শিবিৰলৈ যাওক। হেল্পলাইন: ১১২।`;
        pushBox.innerText = `⚠️ [জৰুৰী] আপদা সাথী: ${sObj.name}ত বানপানীৰ আশংকা। সুৰক্ষিত পথৰ বাবে এপ চাওক।`;
      } else {
        smsBox.innerText = `[AapadaSathi ALERT] ${sObj.name}: Predicted ${hazard} risk level is HIGH. Evacuate via North Embankment to designated safe shelter. Helpline: 112.`;
        pushBox.innerText = `⚠️ [URGENT] AapadaSathi: Water surge projected in ~${sObj.leadTimeHours} hrs. High-ground evacuation corridor active to Model Higher Secondary. Follow route in app.`;
      }
    };

    if (selSettlement) selSettlement.addEventListener('change', updatePreview);
    if (selHazard) selHazard.addEventListener('change', updatePreview);
    if (selLang) selLang.addEventListener('change', updatePreview);

    // Broadcast demo button
    const broadcastBtn = document.getElementById('btn-broadcast-demo');
    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', () => {
        Toast.show('Simulated broadcast dispatched to emergency response nodes!', 'danger', 4000);
      });
    }
  }
}
