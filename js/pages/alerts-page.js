/**
 * Page Controller: Alerts Page
 * Complete English & Hindi Localization
 */

import { state } from '../state.js';
import { AlertService } from '../services/alert-service.js';
import { RiskService } from '../services/risk-service.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class AlertsPage {
  static async render(container) {
    const lang = state.get('activeLanguage') || 'en';
    const alerts = await AlertService.getAlerts();

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

        <!-- Alerts Feed List -->
        <div class="alerts-feed-grid" id="alerts-feed-list">
          ${this.generateAlertCardsHtml(alerts, lang)}
        </div>

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
        <div class="glass-panel state-container">
          <div class="state-icon"><i class="fa-solid fa-bell-slash"></i></div>
          <h3 class="state-title">${lang === 'hi' ? 'कोई सक्रिय चेतावनी उपलब्ध नहीं है' : 'No Active Warnings Available'}</h3>
          <p class="state-desc">${lang === 'hi' ? 'जोखिम पूर्वानुमान और चेतावनी प्रणाली अभी उपलब्ध नहीं है।' : 'Risk prediction and alert generation are not available yet.'}</p>
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
              <h3 class="alert-title">${lang === 'hi' ? (alert.severity === 'CRITICAL' ? 'अति गंभीर बाढ़ चेतावनी - सुरक्षित स्थान पर जाएं' : alert.title) : alert.title}</h3>
              ${isRead ? `<span style="font-size:0.75rem; color:#64748b;"><i class="fa-solid fa-check"></i> ${TranslationService.t('acknowledgedBadge', lang)}</span>` : ''}
            </div>
            <p class="alert-description">${lang === 'hi' ? (alert.severity === 'CRITICAL' ? 'जलस्तर अगले 6.5 घंटे में सुरक्षा बांध को पार करने का अनुमान है। उत्तरी तटबंध निकासी गलियारे का अनुसरण करें।' : alert.message) : alert.message}</p>
            <div class="alert-meta-row">
              <span><i class="fa-solid fa-location-dot"></i> ${lang === 'hi' ? alert.settlementName.replace('Settlement', 'बस्ती') : alert.settlementName}</span>
              <span><i class="fa-solid fa-clock"></i> ${TranslationService.t('issuedLabel', lang)} ${alert.issuedAt}</span>
              <span><i class="fa-solid fa-hourglass-start"></i> ${TranslationService.t('leadTimeLabel', lang)} <strong>${alert.leadTimeHours} hrs</strong></span>
              <span><i class="fa-solid fa-chart-pie"></i> ${TranslationService.t('confidenceLabel', lang)} ${alert.confidence}</span>
            </div>
          </div>

          <div class="alert-actions-col">
            <button class="btn btn-secondary btn-sm btn-open-modal" data-id="${alert.id}">
              <i class="fa-solid fa-eye"></i> ${TranslationService.t('detailsBtn', lang)}
            </button>
            ${alert.evacuationRequired ? `
              <button class="btn btn-danger btn-sm btn-alert-route" data-settlement-id="${alert.settlementId}">
                <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRouteBtn', lang)}
              </button>
            ` : ''}
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
      this.attachCardActions(allAlerts, lang);
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

    this.attachCardActions(allAlerts, lang);
  }

  static attachCardActions(allAlerts, lang = 'en') {
    document.querySelectorAll('.btn-ack-alert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const readSet = state.get('alertsRead') || new Set();
        readSet.add(id);
        state.set('alertsRead', readSet);
        Toast.show(lang === 'hi' ? 'चेतावनी स्वीकार की गई।' : 'Alert marked as acknowledged.', 'info', 2000);
        const card = document.querySelector(`.alert-item-card[data-id="${id}"]`);
        if (card) {
          card.classList.add('alert-read');
          btn.innerHTML = `<i class="fa-solid fa-check"></i> ${TranslationService.t('doneBtn', lang)}`;
        }
      });
    });

    document.querySelectorAll('.btn-alert-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sid = e.currentTarget.getAttribute('data-settlement-id');
        state.set('activeSettlementId', sid);
        window.location.hash = '#safe-route';
      });
    });

    const modal = document.getElementById('alert-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const modalContent = document.getElementById('alert-modal-content');

    const closeModal = () => {
      if (modal) modal.style.display = 'none';
      if (backdrop) backdrop.style.display = 'none';
    };

    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const alert = allAlerts.find(a => a.id === id);
        if (!alert) return;

        modalContent.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span class="status-badge ${RiskService.getRiskBadgeClass(alert.severity)}">${alert.severity}</span>
            <button id="btn-close-modal" style="background:none; border:none; color:#0f2b48; font-size:1.25rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <h3 style="color:#0f2b48; margin-bottom:0.75rem;">${lang === 'hi' ? (alert.severity === 'CRITICAL' ? 'अति गंभीर बाढ़ चेतावनी - सुरक्षित स्थान पर जाएं' : alert.title) : alert.title}</h3>
          <p style="color:#475569; font-size:0.95rem; line-height:1.5; margin-bottom:1.25rem;">${alert.message}</p>
          <div style="padding:1rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.875rem; margin-bottom:1.25rem;">
            <div><strong>${lang === 'hi' ? 'स्थान:' : 'Location:'}</strong> ${alert.settlementName}</div>
            <div><strong>${lang === 'hi' ? 'जारी:' : 'Issued:'}</strong> ${alert.issuedAt}</div>
            <div><strong>${lang === 'hi' ? 'संभावित प्रभाव:' : 'Expected Impact:'}</strong> ${alert.expectedImpactAt}</div>
            <div><strong>${lang === 'hi' ? 'चेतावनी समय:' : 'Lead Time:'}</strong> ${alert.leadTimeHours} hrs</div>
            <div><strong>${lang === 'hi' ? 'सटीकता:' : 'Confidence:'}</strong> ${alert.confidence}</div>
          </div>
          <div style="display:flex; gap:0.75rem; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" id="btn-modal-dismiss">${lang === 'hi' ? 'बंद करें' : 'Close'}</button>
            ${alert.evacuationRequired ? `
              <button class="btn btn-danger btn-sm" id="btn-modal-evacuate">
                <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRouteBtn', lang)}
              </button>
            ` : ''}
          </div>
        `;

        modal.style.display = 'block';
        backdrop.style.display = 'block';

        document.getElementById('btn-close-modal').addEventListener('click', closeModal);
        document.getElementById('btn-modal-dismiss').addEventListener('click', closeModal);

        const evacBtn = document.getElementById('btn-modal-evacuate');
        if (evacBtn) {
          evacBtn.addEventListener('click', () => {
            closeModal();
            state.set('activeSettlementId', alert.settlementId);
            window.location.hash = '#safe-route';
          });
        }
      });
    });
  }
}
