/**
 * Page Controller: Resident Risk Dashboard
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class RiskDashboardPage {
  static async render(container) {
    const settlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage');

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

    // Circumference calculation for circular gauge: r=70 => C = 2 * PI * 70 = ~440
    const circumference = 440;
    const strokeOffset = circumference - (score / 100) * circumference;

    container.innerHTML = `
      <div class="dashboard-container fade-in">
        <!-- 1. Top Context Bar -->
        <div class="glass-panel context-bar">
          <div class="context-location">
            <div class="context-location-icon" style="background:${color}22; border-color:${color}; color:${color};">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h1 class="context-title" id="current-settlement-name">${riskData.settlement.name}</h1>
              <div class="context-subtitle">${riskData.settlement.district} District, ${riskData.settlement.state} &bull; Coordinates: ${riskData.settlement.coordinates[0].toFixed(3)}°N, ${riskData.settlement.coordinates[1].toFixed(3)}°E</div>
            </div>
          </div>

          <div class="context-meta">
            <div class="freshness-tag">
              <i class="fa-solid fa-rotate"></i> Updated: ${riskData.updatedAt}
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
              <span class="hazard-pill"><i class="fa-solid fa-water"></i> ${riskData.hazard}</span>
              <span class="status-badge ${badgeClass}">${riskData.riskLevel} RISK</span>
            </div>

            <!-- Visual Risk Gauge Ring -->
            <div class="risk-gauge-container" role="img" aria-label="Risk score ${score} out of 100, ${riskData.riskLevel}">
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
                <div class="risk-gauge-label" style="color:${color};">${riskData.riskLevel}</div>
              </div>
            </div>

            <p class="risk-explanation-text">
              ${riskData.explanation}
            </p>

            <div style="display:flex; gap:1rem; width:100%; justify-content:center; flex-wrap:wrap;">
              <div class="risk-lead-time-box">
                <i class="fa-solid fa-hourglass-start" style="color:var(--color-accent);"></i>
                <span>Lead Time: <span class="lead-time-val">${riskData.leadTimeHours} hrs</span></span>
              </div>
              <div class="risk-lead-time-box">
                <i class="fa-solid fa-chart-pie" style="color:var(--color-accent);"></i>
                <span>Confidence: <strong>${riskData.confidence}</strong></span>
              </div>
            </div>
          </div>

          <!-- 3. Recommended Action Card (Prominent Life-Safety Center) -->
          <div class="glass-panel action-priority-card" style="border-left-color:${color};">
            <div>
              <div class="action-header-row">
                <div>
                  <span class="hero-badge" style="background:rgba(255,255,255,0.08); border-color:var(--color-border); margin-bottom:0.5rem;">
                    <i class="fa-solid fa-person-running"></i> Priority Action Required
                  </span>
                  <h2 class="action-main-instruction">${riskData.recommendedAction}</h2>
                </div>
                ${riskData.evacuationRequired ? `
                  <span class="action-urgency-badge">
                    <i class="fa-solid fa-bell"></i> URGENT ACTION
                  </span>
                ` : `
                  <span class="status-badge badge-neutral">STANDBY</span>
                `}
              </div>

              <!-- Interactive Resident Checklist -->
              <div class="checklist-container">
                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-1" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step1', lang)}</div>
                    <div class="checklist-desc">Move elderly, children, and livestock to designated high-terrace shelter hubs first.</div>
                  </div>
                </label>

                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-2" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step2', lang)}</div>
                    <div class="checklist-desc">Secure dry rations, waterproof torch, charged powerbank, and essential identity documents.</div>
                  </div>
                </label>

                <label class="checklist-item">
                  <input type="checkbox" class="checklist-checkbox" id="chk-3" />
                  <div class="checklist-text">
                    <div class="checklist-title">${TranslationService.t('step3', lang)}</div>
                    <div class="checklist-desc">Avoid walking or driving through moving water. Stay off South Embankment culvert km 3.2.</div>
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
                  <i class="fa-solid fa-circle-check"></i> Evacuation Not Triggered
                </button>
              `}
              <a href="#risk-map" class="btn btn-secondary">
                <i class="fa-solid fa-map-location-dot"></i> View on Basin Map
              </a>
              <button class="btn btn-secondary" id="btn-share-risk-alert">
                <i class="fa-solid fa-share-nodes"></i> ${TranslationService.t('shareAlert', lang)}
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Contributing Factors ("Why this warning exists") -->
        <section class="factors-section">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3>${TranslationService.t('factorsTitle', lang)}</h3>
              <p style="font-size:0.875rem;">Underlying hydrological, meteorological, and telemetry sensors driving this assessment.</p>
            </div>
            <span class="status-badge badge-neutral" style="font-size:0.75rem;">
              <i class="fa-solid fa-circle-info"></i> ${riskData.factors.length} Environmental Vectors
            </span>
          </div>

          <div class="factor-grid">
            ${riskData.factors.map(factor => `
              <div class="factor-card">
                <div class="factor-header">
                  <span>${factor.name}</span>
                  <i class="fa-solid ${factor.icon}"></i>
                </div>
                <div class="factor-value-row">
                  <span class="factor-value">${factor.value}</span>
                  <span class="factor-unit">/ ${factor.unit}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.775rem;">
                  <span style="color:#94a3b8;">Ref: ${factor.normal}</span>
                  <span class="factor-trend ${factor.status === 'danger' ? 'trend-up-danger' : factor.status === 'warning' ? 'trend-up-warning' : 'trend-stable'}">
                    ${factor.trend}
                  </span>
                </div>
                <div class="factor-explanation">${factor.explanation}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 5. Impact Forecast Grid -->
        <section>
          <h3>Forecast Impact & Exposure Estimates</h3>
          <p style="font-size:0.875rem; margin-bottom:1rem;">Simulated potential damage in the absence of evacuation within lead-time window.</p>

          <div class="impact-grid">
            <div class="impact-card">
              <span class="impact-label">Pop. In Hazard Footprint</span>
              <div class="impact-number" style="color:#f87171;">${riskData.impact.peopleAffected.toLocaleString()}</div>
              <span style="font-size:0.75rem; color:#cbd5e1;">Residents requiring relocation</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">Structures Exposed</span>
              <div class="impact-number">${riskData.impact.structuresAffected}</div>
              <span style="font-size:0.75rem; color:#cbd5e1;">Residential & agricultural units</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">Road Length At Risk</span>
              <div class="impact-number" style="color:#fbbf24;">${riskData.impact.roadsAffectedKm} km</div>
              <span style="font-size:0.75rem; color:#cbd5e1;">Inundated or washed out</span>
            </div>

            <div class="impact-card">
              <span class="impact-label">Priority Triage</span>
              <div style="font-size:1.15rem; font-weight:700; color:#38bdf8; margin-top:0.35rem;">
                ${riskData.impact.priorityLevel}
              </div>
              <span style="font-size:0.75rem; color:#94a3b8;">${riskData.impact.estimateType}</span>
            </div>
          </div>
        </section>

        <!-- 6. Timeline & Data Confidence Split -->
        <div class="split-info-grid">
          <!-- Timeline -->
          <div class="glass-panel" style="padding:1.5rem;">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Incident & Escalation Timeline</h3>
            <div class="timeline">
              ${(riskData.timeline || []).map((t, idx) => `
                <div class="timeline-item">
                  <div class="timeline-marker ${idx === riskData.timeline.length - 1 ? 'active' : ''}"></div>
                  <div class="timeline-time">${t.time}</div>
                  <div class="timeline-title">${t.title}</div>
                  <div class="timeline-desc">${t.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Data Confidence & Limitations -->
          <div class="glass-panel confidence-box">
            <h3><i class="fa-solid fa-shield-halved"></i> Data Transparency & Trust</h3>
            <p style="font-size:0.85rem;">Clear disclosure of available vs unavailable observation layers.</p>

            <div class="confidence-item">
              <i class="fa-solid fa-circle-check" style="color:#34d399;"></i>
              <div>
                <strong>Active Observations:</strong>
                <div style="color:#cbd5e1; font-size:0.8rem;">${riskData.confidenceMeta.availableSources.join(', ')}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-triangle-exclamation" style="color:#fbbf24;"></i>
              <div>
                <strong>Missing / Obscured Layers:</strong>
                <div style="color:#cbd5e1; font-size:0.8rem;">${riskData.confidenceMeta.unavailableSources.join(', ') || 'None (All systems nominal)'}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-server"></i>
              <div>
                <strong>Model Processing Mode:</strong>
                <div style="color:#38bdf8; font-size:0.8rem;">${riskData.confidenceMeta.modelStatus}</div>
              </div>
            </div>

            <div class="confidence-item">
              <i class="fa-solid fa-arrows-rotate"></i>
              <div>
                <strong>Next Scheduled Hydrological Update:</strong>
                <div style="color:#cbd5e1; font-size:0.8rem;">${riskData.confidenceMeta.nextUpdateExpected}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents(riskData);
  }

  static attachEvents(riskData) {
    // Settlement dropdown switcher
    const picker = document.getElementById('settlement-picker');
    if (picker) {
      picker.addEventListener('change', (e) => {
        state.set('activeSettlementId', e.target.value);
        this.render(document.getElementById('page-content-mount'));
        Toast.show(`Switched active view to ${e.target.selectedOptions[0].text}`, 'info');
      });
    }

    // Share button
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

    // Interactive checklist persistence in memory
    document.querySelectorAll('.checklist-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        if (e.target.checked) {
          Toast.show('Safety step checked off. Keep moving toward high ground.', 'success', 2500);
        }
      });
    });
  }
}
