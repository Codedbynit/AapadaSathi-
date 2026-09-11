/**
 * AapadaSathi Shared Header Component
 * Streamlined public interface - 100% focused on resident safety and fast evacuation.
 */

import { state } from '../state.js';
import { TranslationService } from '../services/translation-service.js';

export class HeaderComponent {
  static render(containerId = 'app-header-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentLang = state.get('activeLanguage');
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
              <span class="brand-tagline" data-i18n="tagline">${TranslationService.t('tagline', currentLang)}</span>
            </div>
          </a>

          <!-- Desktop Navigation - Resident Public Focus -->
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

          <!-- Header Actions (Emergency Hotline, Language Selector, Mobile Hamburger) -->
          <div class="header-actions">
            <!-- Emergency Quick Hotline Badge -->
            <a href="tel:112" class="header-hotline-badge" title="National Emergency Helpline">
              <i class="fa-solid fa-phone-volume"></i>
              <span>Emergency <strong>112</strong></span>
            </a>

            <!-- Language Switcher -->
            <div class="lang-selector">
              <select class="lang-select" id="header-lang-select" aria-label="Select Language">
                <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिन्दी</option>
                <option value="as" ${currentLang === 'as' ? 'selected' : ''}>অসমীয়া</option>
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
          </nav>

          <div style="margin-top:auto; padding-top:1.5rem; border-top:1px solid #e2e8f0;">
            <a href="tel:112" class="btn btn-danger btn-sm" style="width:100%; justify-content:center; margin-bottom:1rem;">
              <i class="fa-solid fa-phone"></i> National Emergency: 112
            </a>
            <div style="text-align:center;">
              <a href="#response-dashboard" class="official-portal-link" style="font-size:0.775rem; color:#64748b; text-decoration:none;">
                <i class="fa-solid fa-lock"></i> Official Responder Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  static attachEventListeners() {
    const langSelect = document.getElementById('header-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        state.set('activeLanguage', e.target.value);
      });
    }

    const mobileToggle = document.getElementById('btn-mobile-menu');
    const drawer = document.getElementById('mobile-drawer');
    const drawerClose = document.getElementById('btn-close-drawer');

    if (mobileToggle && drawer) {
      mobileToggle.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (drawerClose && drawer) {
      drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
    }

    const drawerLinks = document.querySelectorAll('.mobile-nav-link, .official-portal-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (drawer) drawer.classList.remove('open');
      });
    });
  }

  static updateActiveLinks(route) {
    document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}
