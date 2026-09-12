/**
 * AapadaSathi Hash-based Router
 * Handles seamless client-side page transitions, browser history, and deep-linking.
 */

import { state } from './state.js';
import { HeaderComponent } from './components/header.js';
import { HomePage } from './pages/home-page.js';
import { RiskDashboardPage } from './pages/risk-dashboard-page.js?v=realdata_v1';
import { RiskMapPage } from './pages/risk-map-page.js';
import { SafeRoutePage } from './pages/safe-route-page.js';
import { AlertsPage } from './pages/alerts-page.js';
import { ResponseDashboardPage } from './pages/response-dashboard-page.js';

import { ScrollObserver } from './utils/scroll-observer.js';

export class Router {
  static routes = {
    '#home': HomePage,
    '#risk-dashboard': RiskDashboardPage,
    '#risk-map': RiskMapPage,
    '#safe-route': SafeRoutePage,
    '#alerts': AlertsPage,
    '#response-dashboard': ResponseDashboardPage
  };

  static init(containerId = 'page-content-mount') {
    this.containerId = containerId;

    window.addEventListener('hashchange', () => this.handleRoute());

    // Listen to language changes to re-render active page immediately
    state.subscribe('activeLanguage', () => {
      HeaderComponent.render();
      this.handleRoute();
    });

    // Initial route handling
    if (!window.location.hash) {
      window.location.hash = '#home';
    } else {
      this.handleRoute();
    }
  }

  static async handleRoute() {
    let hash = window.location.hash || '#home';

    // Normalize hash without parameters
    const cleanHash = hash.split('?')[0];

    const PageClass = this.routes[cleanHash] || HomePage;
    const container = document.getElementById(this.containerId);

    if (!container) return;

    state.set('activeRoute', cleanHash);
    HeaderComponent.updateActiveLinks(cleanHash);

    // Scroll to top smoothly on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      await PageClass.render(container);
      // Trigger smooth scroll reveal animation for newly mounted cards
      setTimeout(() => {
        ScrollObserver.init();
      }, 50);
    } catch (err) {
      console.error(`[Router] Failed to render route ${cleanHash}:`, err);
      container.innerHTML = `
        <div class="glass-panel state-container">
          <div class="state-icon state-icon-error"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3 class="state-title">Error Loading Page</h3>
          <p class="state-desc">${err.message || 'An unexpected error occurred.'}</p>
          <a href="#home" class="btn btn-primary btn-sm"><i class="fa-solid fa-house"></i> Return Home</a>
        </div>
      `;
    }
  }
}
