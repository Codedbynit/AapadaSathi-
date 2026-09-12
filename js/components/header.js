/**
 * AapadaSathi Shared Header Component
 * Includes dedicated Admin Portal button and strictly English / Hindi language support.
 */

import { state } from '../state.js';
import { TranslationService } from '../services/translation-service.js';
import { SosModal } from './sos-modal.js';

export class HeaderComponent {
  static render(containerId = 'app-header-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentLang = state.get('activeLanguage') || 'en';
    const currentRoute = state.get('activeRoute') || '#home';

    container.innerHTML = `
      <header class="app-header glass-header">
        <div class="header-inner">
          <!-- Logo & Brand -->
          <a href="#home" class="brand-link" id="nav-brand">
            <div class="brand-icon-wrapper" aria-hidden="true">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div class="brand-text-group">
              <span class="brand-name">AapadaSathi</span>
              <span class="brand-tagline">${TranslationService.t('tagline', currentLang)}</span>
            </div>
          </a>

          <!-- Desktop Navigation - Clean, Single Line -->
          <nav class="desktop-nav" aria-label="Main Navigation">
            <a href="#home" class="nav-link ${currentRoute === '#home' ? 'active' : ''}" data-nav="home">
              <i class="fa-solid fa-house"></i> <span>${TranslationService.t('home', currentLang)}</span>
            </a>
            <a href="#risk-map" class="nav-link ${currentRoute === '#risk-map' ? 'active' : ''}" data-nav="risk-map">
              <i class="fa-solid fa-map-location-dot"></i> <span>${TranslationService.t('riskMap', currentLang)}</span>
            </a>
            <a href="#risk-dashboard" class="nav-link ${currentRoute === '#risk-dashboard' ? 'active' : ''}" data-nav="risk-dashboard">
              <i class="fa-solid fa-gauge-high"></i> <span>${TranslationService.t('riskDashboard', currentLang)}</span>
            </a>
            <a href="#safe-route" class="nav-link ${currentRoute === '#safe-route' ? 'active' : ''}" data-nav="safe-route">
              <i class="fa-solid fa-person-walking-arrow-right"></i> <span>${TranslationService.t('safeRoute', currentLang)}</span>
            </a>
            <a href="#alerts" class="nav-link ${currentRoute === '#alerts' ? 'active' : ''}" data-nav="alerts">
              <i class="fa-solid fa-triangle-exclamation"></i> <span>${TranslationService.t('alerts', currentLang)}</span>
            </a>
          </nav>

          <!-- Header Actions: SOS Button, Admin Button, Emergency Call, Language Selector -->
          <div class="header-actions">
            <!-- Emergency SOS Trigger Button -->
            <button type="button" class="header-sos-btn" id="btn-header-sos" aria-label="Trigger Emergency SOS">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>SOS</span>
            </button>

            <!-- Dedicated Admin Portal Button -->
            <a href="#response-dashboard" class="header-admin-btn ${currentRoute === '#response-dashboard' ? 'active' : ''}" id="btn-header-admin" title="Admin Incident Command Portal">
              <i class="fa-solid fa-lock"></i>
              <span>${TranslationService.t('adminPortal', currentLang)}</span>
            </a>

            <!-- Emergency Quick Hotline Badge -->
            <a href="tel:112" class="header-hotline-badge" title="National Emergency Helpline: 112">
              <i class="fa-solid fa-phone-volume"></i>
              <span>${TranslationService.t('emergencyHelpline', currentLang)}</span>
            </a>

            <!-- Language Switcher: English and Hindi Only -->
            <div class="lang-selector">
              <select class="lang-select" id="header-lang-select" aria-label="Select Language">
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
              </select>
            </div>

            <!-- Mobile Drawer Button -->
            <button class="mobile-menu-toggle" id="btn-mobile-menu" aria-label="Open Navigation Menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Drawer Menu -->
      <div class="mobile-drawer" id="mobile-drawer">
        <div class="mobile-drawer-inner">
          <div class="mobile-drawer-header">
            <div class="brand-link">
              <div class="brand-icon-wrapper">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <span class="brand-name">AapadaSathi</span>
            </div>
            <button class="mobile-drawer-close" id="btn-close-drawer" aria-label="Close Menu">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <nav class="mobile-nav-links">
            <a href="#home" class="mobile-nav-link ${currentRoute === '#home' ? 'active' : ''}">
              <i class="fa-solid fa-house"></i> ${TranslationService.t('home', currentLang)}
            </a>
            <a href="#risk-map" class="mobile-nav-link ${currentRoute === '#risk-map' ? 'active' : ''}">
              <i class="fa-solid fa-map-location-dot"></i> ${TranslationService.t('riskMap', currentLang)}
            </a>
            <a href="#risk-dashboard" class="mobile-nav-link ${currentRoute === '#risk-dashboard' ? 'active' : ''}">
              <i class="fa-solid fa-gauge-high"></i> ${TranslationService.t('riskDashboard', currentLang)}
            </a>
            <a href="#safe-route" class="mobile-nav-link ${currentRoute === '#safe-route' ? 'active' : ''}">
              <i class="fa-solid fa-person-walking-arrow-right"></i> ${TranslationService.t('safeRoute', currentLang)}
            </a>
            <a href="#alerts" class="mobile-nav-link ${currentRoute === '#alerts' ? 'active' : ''}">
              <i class="fa-solid fa-triangle-exclamation"></i> ${TranslationService.t('alerts', currentLang)}
            </a>
            <a href="#response-dashboard" class="mobile-nav-link ${currentRoute === '#response-dashboard' ? 'active' : ''}">
              <i class="fa-solid fa-lock"></i> ${TranslationService.t('adminPortal', currentLang)}
            </a>
          </nav>

          <div style="margin-top:auto; padding-top:1.5rem; border-top:1px solid #e2e8f0; display:flex; flex-direction:column; gap:0.75rem;">
            <button type="button" class="btn btn-danger btn-sm" id="btn-mobile-sos" style="width:100%; justify-content:center;">
              <i class="fa-solid fa-triangle-exclamation"></i> EMERGENCY SOS
            </button>
            <a href="tel:112" class="btn btn-secondary btn-sm" style="width:100%; justify-content:center;">
              <i class="fa-solid fa-phone"></i> ${TranslationService.t('emergencyHelplineFull', currentLang)}
            </a>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  static attachEventListeners() {
    const drawer = document.getElementById('mobile-drawer');

    const sosBtn = document.getElementById('btn-header-sos');
    if (sosBtn) {
      sosBtn.addEventListener('click', () => SosModal.open());
    }

    const mobileSosBtn = document.getElementById('btn-mobile-sos');
    if (mobileSosBtn) {
      mobileSosBtn.addEventListener('click', () => {
        if (drawer) drawer.classList.remove('open');
        SosModal.open();
      });
    }
    const langSelect = document.getElementById('header-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        state.set('activeLanguage', e.target.value);
      });
    }

    const mobileToggle = document.getElementById('btn-mobile-menu');
    const drawerClose = document.getElementById('btn-close-drawer');

    if (mobileToggle && drawer) {
      mobileToggle.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (drawerClose && drawer) {
      drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    }

    const drawerLinks = document.querySelectorAll('.mobile-nav-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (drawer) drawer.classList.remove('open');
      });
    });
  }

  static updateActiveLinks(route) {
    document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item, .header-admin-btn').forEach(link => {
      const href = link.getAttribute('href');
      if (href === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
