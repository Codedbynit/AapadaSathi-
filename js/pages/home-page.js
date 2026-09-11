/**
 * Page Controller: Home / Landing - Two Column Hero & Light Mode
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { AlertService } from '../services/alert-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class HomePage {
  static async render(container) {
    const lang = state.get('activeLanguage');
    const settlements = await RiskService.getAllSettlements();
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
              <span>AI-Assisted Multi-Sensor Early Warnings</span>
            </div>

            <h1 class="hero-title">
              Know the risk <span class="hero-highlight">before it reaches you.</span>
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
                <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRoute', lang)}
              </a>
            </div>

            <!-- Trust Badges Strip -->
            <div class="hero-trust-strip">
              <div class="hero-trust-item">
                <i class="fa-solid fa-phone" style="color:#dc2626;"></i>
                <span>Helpline: <strong>112</strong> / <strong>1070</strong></span>
              </div>
              <div class="hero-trust-item">
                <i class="fa-solid fa-tower-broadcast"></i>
                <span>CWC &amp; IMD Telemetry</span>
              </div>
              <div class="hero-trust-item">
                <i class="fa-solid fa-circle-check" style="color:#059669;"></i>
                <span>Verified Evacuation Corridors</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Live Early-Warning Pulse Widget -->
          <div class="hero-right">
            <div class="hero-radar-card floating-widget">
              <div class="radar-card-header">
                <div>
                  <span class="status-badge badge-critical" style="margin-bottom:0.4rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Live Alert
                  </span>
                  <div class="radar-location-title">Mikirpara Settlement</div>
                  <div class="radar-location-sub">Majuli Basin, Assam &bull; Ward 4 Riverbank</div>
                </div>
                <span class="status-badge badge-neutral" style="font-size:0.75rem;">
                  <i class="fa-solid fa-clock"></i> -6.5h Lead
                </span>
              </div>

              <!-- Score & Urgency Box -->
              <div class="radar-score-box">
                <div class="radar-dial-circle">
                  <span class="radar-dial-num">89</span>
                  <span class="radar-dial-lbl">Score</span>
                </div>
                <div>
                  <div style="font-size:1.05rem; font-weight:800; color:#991b1b;">CRITICAL FLOOD RISK</div>
                  <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.4; margin-top:2px;">
                    Crest surge projected within ~6.5 hours. Evacuation corridor to Model Higher Secondary is active.
                  </div>
                </div>
              </div>

              <!-- Sensor Metrics List -->
              <div class="radar-metrics-list">
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-cloud-showers-heavy"></i> 24h Rainfall:</span>
                  <span class="radar-metric-val" style="color:#dc2626;">142 mm (+340%)</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-water"></i> Nematighat Gauge:</span>
                  <span class="radar-metric-val" style="color:#dc2626;">+1.45m over danger</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-shield-halved"></i> Nearest Safe Shelter:</span>
                  <span class="radar-metric-val" style="color:#059669;">Model Higher Secondary (4.2 km)</span>
                </div>
              </div>

              <div style="display:flex; gap:0.65rem;">
                <a href="#safe-route" class="btn btn-emergency" style="flex:1; padding:0.65rem 1rem; font-size:0.875rem;">
                  <i class="fa-solid fa-person-walking-arrow-right"></i> Safe Route Map
                </a>
                <a href="#risk-dashboard" class="btn btn-secondary" style="flex:1; padding:0.65rem 1rem; font-size:0.875rem;">
                  <i class="fa-solid fa-chart-line"></i> Full Analysis
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Status Strip -->
        <section class="quick-status-grid">
          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-city"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">28</div>
              <div class="stat-label">${TranslationService.t('monitoredSettlements', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card" style="border-left:4px solid #dc2626;">
            <div class="stat-icon-wrapper" style="color:#dc2626; background:#fef2f2; border-color:#fecaca;">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#dc2626;">4 Active</div>
              <div class="stat-label">${TranslationService.t('activeWarnings', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-hourglass-half"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">~8.2 hrs</div>
              <div class="stat-label">${TranslationService.t('avgLeadTime', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper" style="color:#059669; background:#ecfdf5; border-color:#a7f3d0;">
              <i class="fa-solid fa-network-wired"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#059669;">5 of 5 Live</div>
              <div class="stat-label">${TranslationService.t('dataHealth', lang)}</div>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="workflow-section">
          <div class="section-header">
            <span class="hero-badge"><i class="fa-solid fa-diagram-project"></i> Operational Framework</span>
            <h2 class="section-title">How AapadaSathi Works</h2>
            <p>From multi-satellite telemetry to settlement-level decision support in under two minutes.</p>
          </div>

          <div class="workflow-steps-grid">
            <div class="glass-panel step-card">
              <div class="step-number">1</div>
              <i class="fa-solid fa-satellite step-icon"></i>
              <h3 class="step-title">${TranslationService.t('detectTitle', lang)}</h3>
              <p class="step-desc">${TranslationService.t('detectDesc', lang)}</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">2</div>
              <i class="fa-solid fa-brain step-icon"></i>
              <h3 class="step-title">${TranslationService.t('assessTitle', lang)}</h3>
              <p class="step-desc">${TranslationService.t('assessDesc', lang)}</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">3</div>
              <i class="fa-solid fa-bullhorn step-icon"></i>
              <h3 class="step-title">${TranslationService.t('warnTitle', lang)}</h3>
              <p class="step-desc">${TranslationService.t('warnDesc', lang)}</p>
            </div>

            <div class="glass-panel step-card">
              <div class="step-number">4</div>
              <i class="fa-solid fa-person-walking-arrow-right step-icon" style="color:#059669;"></i>
              <h3 class="step-title">${TranslationService.t('guideTitle', lang)}</h3>
              <p class="step-desc">${TranslationService.t('guideDesc', lang)}</p>
            </div>
          </div>
        </section>

        <!-- Active Alerts Preview -->
        <section class="alerts-preview-section">
          <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem;">
            <div>
              <span class="hero-badge" style="border-color:#fecaca; background:#fef2f2; color:#dc2626;"><i class="fa-solid fa-bell"></i> Live Feed</span>
              <h2>Urgent Warnings in Monitored Basin</h2>
            </div>
            <a href="#alerts" class="btn btn-secondary btn-sm">View All Alerts <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="alerts-preview-list">
            ${alerts.slice(0, 2).map(alert => `
              <div class="glass-panel alert-item-card severity-${alert.severity.toLowerCase()}">
                <div class="alert-icon-col" style="color:${alert.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'}; background:${alert.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed'};">
                  <i class="fa-solid fa-water"></i>
                </div>
                <div class="alert-content-col">
                  <div class="alert-title-row">
                    <span class="status-badge ${RiskService.getRiskBadgeClass(alert.severity)}">${alert.severity}</span>
                    <h3 class="alert-title">${alert.title}</h3>
                  </div>
                  <p class="alert-description">${alert.message}</p>
                  <div class="alert-meta-row">
                    <span><i class="fa-solid fa-location-dot"></i> ${alert.settlementName}</span>
                    <span><i class="fa-solid fa-clock"></i> Expected: ${alert.expectedImpactAt}</span>
                    <span><i class="fa-solid fa-hourglass"></i> Lead Time: <strong>${alert.leadTimeHours}h</strong></span>
                  </div>
                </div>
                <div class="alert-actions-col">
                  <button class="btn btn-primary btn-sm alert-view-action" data-settlement-id="${alert.settlementId}">
                    View Risk
                  </button>
                  ${alert.evacuationRequired ? `
                    <button class="btn btn-danger btn-sm alert-route-action" data-settlement-id="${alert.settlementId}">
                      <i class="fa-solid fa-person-walking-arrow-right"></i> Safe Route
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Trust & Multi-Source Fusion Section -->
        <section style="padding:3rem 0;">
          <div class="section-header">
            <span class="hero-badge"><i class="fa-solid fa-shield-heart"></i> Multi-Source Fusion</span>
            <h2>Transparent Geospatial Intelligence</h2>
            <p>Designed for humanitarian transparency, accessibility, and operational reliability.</p>
          </div>

          <div class="trust-grid">
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-network-wired trust-icon"></i>
              <h4>Multi-Sensor Fusion</h4>
              <p>Fuses Copernicus SAR radar imagery, IMD Doppler radars, and river discharge gauges to bypass cloud obstruction.</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-house-chimney trust-icon"></i>
              <h4>Settlement-Scale Granularity</h4>
              <p>Moving beyond coarse district-level warnings down to village and ward topological flood exposure.</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-language trust-icon"></i>
              <h4>Actionable Native Guidance</h4>
              <p>Translates complex millimeter rainfall metrics into immediate plain-language steps in English, Hindi, and Assamese.</p>
            </div>
            <div class="glass-panel trust-card">
              <i class="fa-solid fa-route trust-icon"></i>
              <h4>Verified Evacuation Corridors</h4>
              <p>Directs residents toward high-ground shelters along elevated paths, explicitly avoiding submerged road breaches.</p>
            </div>
          </div>
        </section>
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
          <span class="status-badge ${RiskService.getRiskBadgeClass(m.riskLevel)}">${m.riskLevel}</span>
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
