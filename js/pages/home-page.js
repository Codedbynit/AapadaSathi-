/**
 * Page Controller: Home / Landing
 * Complete English & Hindi Localization Support
 */

import { state } from '../state.js';
import { RiskService } from '../services/risk-service.js';
import { AlertService } from '../services/alert-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class HomePage {
  static async render(container) {
    const lang = state.get('activeLanguage') || 'en';
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
                <span>${TranslationService.t('sensorMeshTag', lang)}</span>
              </div>
              <div class="hero-trust-item">
                <i class="fa-solid fa-circle-check" style="color:#059669;"></i>
                <span>${TranslationService.t('verifiedCorridorsTag', lang)}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Live Early-Warning Pulse Widget -->
          <div class="hero-right">
            ${alerts && alerts.length > 0 ? `
            <div class="hero-radar-card floating-widget">
              <div class="radar-card-header">
                <div>
                  <span class="status-badge badge-critical" style="margin-bottom:0.4rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ${TranslationService.t('liveAlertBadge', lang)}
                  </span>
                  <div class="radar-location-title">${lang === 'hi' ? 'मिकिरपारा बस्ती' : 'Mikirpara Settlement'}</div>
                  <div class="radar-location-sub">${lang === 'hi' ? 'माजुली बेसिन, असम • वार्ड 4 नदी तट' : 'Majuli Basin, Assam • Ward 4 Riverbank'}</div>
                </div>
                <span class="status-badge badge-neutral" style="font-size:0.75rem;">
                  <i class="fa-solid fa-clock"></i> -6.5h ${TranslationService.t('leadTimePrefix', lang)}
                </span>
              </div>

              <!-- Score & Urgency Box -->
              <div class="radar-score-box">
                <div class="radar-dial-circle">
                  <span class="radar-dial-num">89</span>
                  <span class="radar-dial-lbl">Score</span>
                </div>
                <div>
                  <div style="font-size:1.05rem; font-weight:800; color:#991b1b;">${TranslationService.t('criticalFloodRisk', lang)}</div>
                  <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.4; margin-top:2px;">
                    ${TranslationService.t('heroCardDesc', lang)}
                  </div>
                </div>
              </div>

              <!-- Sensor Metrics List (Numerical Values Kept Exact) -->
              <div class="radar-metrics-list">
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-cloud-showers-heavy"></i> ${TranslationService.t('rainfall24h', lang)}</span>
                  <span class="radar-metric-val" style="color:#dc2626;">142 mm (+340%)</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-water"></i> ${TranslationService.t('riverGaugeTag', lang)}</span>
                  <span class="radar-metric-val" style="color:#dc2626;">+1.45m ${TranslationService.t('overDangerMark', lang)}</span>
                </div>
                <div class="radar-metric-row">
                  <span class="radar-metric-label"><i class="fa-solid fa-shield-halved"></i> ${TranslationService.t('nearestSafeShelterTag', lang)}</span>
                  <span class="radar-metric-val" style="color:#059669;">Model Higher Secondary (4.2 km)</span>
                </div>
              </div>

              <div style="display:flex; gap:0.65rem;">
                <a href="#safe-route" class="btn btn-emergency" style="flex:1; padding:0.65rem 1rem; font-size:0.875rem;">
                  <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRouteMapBtn', lang)}
                </a>
                <a href="#risk-dashboard" class="btn btn-secondary" style="flex:1; padding:0.65rem 1rem; font-size:0.875rem;">
                  <i class="fa-solid fa-chart-line"></i> ${TranslationService.t('fullAnalysisBtn', lang)}
                </a>
              </div>
            </div>
            ` : `
            <div class="hero-radar-card floating-widget" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem 1.5rem; text-align:center; color:#64748b;">
              <i class="fa-solid fa-satellite-dish" style="font-size:3rem; color:#cbd5e1; margin-bottom:1rem;"></i>
              <h3 style="color:#475569; margin-bottom:0.5rem;">Alert data unavailable</h3>
              <p style="font-size:0.875rem;">AI early-warning models are currently initializing or unavailable. Real data flow is required.</p>
            </div>
            `}
          </div>
        </section>

        <!-- Quick Status Strip: Stays strictly hidden until user scrolls down -->
        <section class="quick-status-grid">
          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-city"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">${settlements ? settlements.length : 0}</div>
              <div class="stat-label">${TranslationService.t('monitoredSettlements', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card" style="border-left:4px solid #dc2626;">
            <div class="stat-icon-wrapper" style="color:#dc2626; background:#fef2f2; border-color:#fecaca;">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#dc2626;">${alerts ? alerts.length : 0} ${TranslationService.t('activeLabel', lang)}</div>
              <div class="stat-label">${TranslationService.t('activeWarnings', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper">
              <i class="fa-solid fa-hourglass-half"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">N/A</div>
              <div class="stat-label">${TranslationService.t('avgLeadTime', lang)}</div>
            </div>
          </div>

          <div class="glass-panel status-stat-card">
            <div class="stat-icon-wrapper" style="color:#059669; background:#ecfdf5; border-color:#a7f3d0;">
              <i class="fa-solid fa-network-wired"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number" style="color:#059669;">1 ${TranslationService.t('liveSourcesLabel', lang)}</div>
              <div class="stat-label">${TranslationService.t('dataHealth', lang)}</div>
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
              <span class="hero-badge" style="border-color:#fecaca; background:#fef2f2; color:#dc2626;">
                <i class="fa-solid fa-bell"></i> ${TranslationService.t('liveFeedBadge', lang)}
              </span>
              <h2>${TranslationService.t('urgentWarningsTitle', lang)}</h2>
            </div>
            <a href="#alerts" class="btn btn-secondary btn-sm">${TranslationService.t('viewAllAlertsBtn', lang)} <i class="fa-solid fa-arrow-right"></i></a>
          </div>

          <div class="alerts-preview-list">
            ${alerts && alerts.length > 0 ? alerts.slice(0, 2).map(alert => `
              <div class="glass-panel alert-item-card severity-${alert.severity.toLowerCase()}">
                <div class="alert-icon-col" style="color:${alert.severity === 'CRITICAL' ? '#dc2626' : '#ea580c'}; background:${alert.severity === 'CRITICAL' ? '#fef2f2' : '#fff7ed'};">
                  <i class="fa-solid fa-water"></i>
                </div>
                <div class="alert-content-col">
                  <div class="alert-title-row">
                    <span class="status-badge ${RiskService.getRiskBadgeClass(alert.severity)}">${alert.severity}</span>
                    <h3 class="alert-title">${lang === 'hi' ? (alert.severity === 'CRITICAL' ? 'अति गंभीर बाढ़ चेतावनी - सुरक्षित स्थान पर जाएं' : alert.title) : alert.title}</h3>
                  </div>
                  <p class="alert-description">${lang === 'hi' ? (alert.severity === 'CRITICAL' ? 'जलस्तर अगले 6.5 घंटे में सुरक्षा बांध को पार करने का अनुमान है। उत्तरी तटबंध निकासी गलियारे का अनुसरण करें।' : alert.message) : alert.message}</p>
                  <div class="alert-meta-row">
                    <span><i class="fa-solid fa-location-dot"></i> ${lang === 'hi' ? (alert.settlementName.replace('Settlement', 'बस्ती')) : alert.settlementName}</span>
                    <span><i class="fa-solid fa-clock"></i> ${TranslationService.t('expectedLabel', lang)} ${alert.expectedImpactAt}</span>
                    <span><i class="fa-solid fa-hourglass"></i> ${TranslationService.t('leadTimeLabel', lang)} <strong>${alert.leadTimeHours}h</strong></span>
                  </div>
                </div>
                <div class="alert-actions-col">
                  <button class="btn btn-primary btn-sm alert-view-action" data-settlement-id="${alert.settlementId}">
                    ${TranslationService.t('viewRiskBtn', lang)}
                  </button>
                  ${alert.evacuationRequired ? `
                    <button class="btn btn-danger btn-sm alert-route-action" data-settlement-id="${alert.settlementId}">
                      <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRouteBtn', lang)}
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('') : `
              <div class="glass-panel" style="padding:2.5rem; text-align:center; color:#64748b; width: 100%;">
                <i class="fa-solid fa-bell-slash" style="font-size:2rem; margin-bottom:1rem; color:#cbd5e1;"></i>
                <h4 style="font-size:1.1rem; color:#0f2b48; margin-bottom:0.25rem;">Alert data unavailable</h4>
                <p style="font-size:0.875rem;">No active alerts from the AI early-warning system at this time.</p>
              </div>
            `}
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
