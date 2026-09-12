/**
 * AapadaSathi Application Entrypoint
 * Bootstraps components, state listeners, and hash router.
 */

import { HeaderComponent } from './components/header.js?v=sos_v2';
import { FooterComponent } from './components/footer.js?v=sos_v2';
import { Toast } from './components/toast.js?v=sos_v2';
import { SosModal } from './components/sos-modal.js?v=sos_v2';
import { Router } from './router.js?v=sos_v2';
import { ScrollObserver } from './utils/scroll-observer.js?v=sos_v2';
import { state } from './state.js?v=sos_v2';
import { CONFIG } from './config.js?v=sos_v2';

class App {
  static init() {
    console.log('%c[AapadaSathi] Platform Initialized', 'color:#0284c7; font-weight:bold; font-size:14px;');
    console.log(`[AapadaSathi] Mode: ${CONFIG.USE_MOCK_DATA ? 'Mock High-Fidelity Data' : 'Live FastAPI Backend'}`);

    // Render Shared Components & Modals
    HeaderComponent.render('app-header-container');
    FooterComponent.render('app-footer-container');
    Toast.init();
    SosModal.init();

    // Attach mobile bottom bar links
    this.initMobileBottomNav();

    // Start Router
    Router.init('page-content-mount');

    // Initialize Scroll Animations
    ScrollObserver.init();
  }

  static initMobileBottomNav() {
    const bottomLinks = document.querySelectorAll('.bottom-nav-item');
    bottomLinks.forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        HeaderComponent.updateActiveLinks(href);
      });
    });
  }
}

// Boot once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
