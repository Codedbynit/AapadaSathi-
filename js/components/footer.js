/**
 * AapadaSathi Shared Footer Component
 */

export class FooterComponent {
  static render(containerId = 'app-footer-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <footer class="app-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="brand-link">
              <div class="brand-icon-wrapper" style="width:36px; height:36px; font-size:1.05rem;">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <span class="brand-name" style="font-size:1.2rem;">AapadaSathi</span>
            </div>
            <p>AI-assisted settlement-level disaster early warning and evacuation guidance platform. Turning multi-sensor forecasts into immediate life-saving actions.</p>
          </div>

          <div>
            <h4 class="footer-heading">Resident Navigation</h4>
            <ul class="footer-links">
              <li><a href="#home"><i class="fa-solid fa-house"></i> Home</a></li>
              <li><a href="#risk-map"><i class="fa-solid fa-map-location-dot"></i> Live Risk Map</a></li>
              <li><a href="#risk-dashboard"><i class="fa-solid fa-gauge-high"></i> My Settlement</a></li>
              <li><a href="#safe-route"><i class="fa-solid fa-person-walking-arrow-right"></i> Safe Evacuation Route</a></li>
              <li><a href="#alerts"><i class="fa-solid fa-triangle-exclamation"></i> Active Warnings</a></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-heading">Data Ingestion</h4>
            <ul class="footer-links">
              <li><span style="color:#475569;"><i class="fa-solid fa-satellite"></i> Copernicus Sentinel-1</span></li>
              <li><span style="color:#475569;"><i class="fa-solid fa-cloud-showers-heavy"></i> IMD Doppler Radar</span></li>
              <li><span style="color:#475569;"><i class="fa-solid fa-water"></i> CWC Telemetry Gauges</span></li>
              <li><span style="color:#475569;"><i class="fa-solid fa-tower-broadcast"></i> LoRa Basin Sensors</span></li>
            </ul>
          </div>

          <div>
            <h4 class="footer-heading">Emergency &amp; Admin</h4>
            <ul class="footer-links">
              <li><strong style="color:#dc2626;"><i class="fa-solid fa-phone"></i> National Emergency: 112</strong></li>
              <li><strong style="color:#0284c7;"><i class="fa-solid fa-headset"></i> State Disaster (SDRF): 1070</strong></li>
              <li><span style="color:#475569;">Medical Helpline: 108</span></li>
              <li style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid #e2e8f0;">
                <a href="#response-dashboard" style="color:#0f2b48; font-weight:700;">
                  <i class="fa-solid fa-lock"></i> Official Responder Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div>
            <strong>Notice:</strong> Prototype Demonstration for Hackathon Evaluation. Data shown includes simulated hydrological ensembles. Follow official state disaster directives in actual emergencies.
          </div>
          <div>
            &copy; ${new Date().getFullYear()} AapadaSathi Platform &bull; Built with HTML5, CSS3, Vanilla JavaScript &amp; Leaflet.
          </div>
        </div>
      </footer>
    `;
  }
}
