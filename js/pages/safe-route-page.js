/**
 * Page Controller: Safe Route / Evacuation Guidance
 * Complete English & Hindi Localization
 */

import { state } from '../state.js';
import { RouteService } from '../services/route-service.js';
import { RiskService } from '../services/risk-service.js';
import { MapController } from '../maps/map-controller.js';
import { RouteLayer } from '../maps/route-layer.js';
import { TranslationService } from '../services/translation-service.js';
import { Toast } from '../components/toast.js';

export class SafeRoutePage {
  static mapController = null;

  static async render(container) {
    const settlementId = state.get('activeSettlementId');
    const lang = state.get('activeLanguage') || 'en';

    const riskData = await RiskService.getRisk(settlementId);
    const routeData = await RouteService.getRoute(settlementId);
    const geojsonData = await RouteService.getGeoJson();

    // If evacuation is not recommended
    if (!riskData.evacuationRequired) {
      container.innerHTML = `
        <div class="safe-route-container fade-in">
          <div class="glass-panel" style="padding:3.5rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1.25rem;">
            <div class="state-icon" style="background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <h2 style="color:#0f2b48;">
              ${lang === 'hi' ? 'वर्तमान में निकासी की सिफारिश नहीं की गई है' : 'Evacuation is Not Currently Recommended'}
            </h2>
            <p style="max-width:540px; color:#475569;">
              ${lang === 'hi' 
                ? `<strong>${riskData.settlement.name}</strong> वर्तमान में <strong>कम जोखिम</strong> स्तर पर है। आपदा प्रबंधन द्वारा कोई निकासी आदेश जारी नहीं किया गया है।` 
                : `<strong>${riskData.settlement.name}</strong> is currently at <strong>${riskData.riskLevel} RISK</strong>. No immediate evacuation has been mandated by district disaster authorities.`}
            </p>
            <div style="display:flex; gap:1rem; margin-top:1rem; flex-wrap:wrap; justify-content:center;">
              <a href="#risk-dashboard" class="btn btn-primary">
                <i class="fa-solid fa-gauge-high"></i> ${lang === 'hi' ? 'जोखिम डैशबोर्ड देखें' : 'Monitor Risk Dashboard'}
              </a>
              <button class="btn btn-secondary" id="btn-demo-critical-route">
                <i class="fa-solid fa-triangle-exclamation"></i> ${lang === 'hi' ? 'अति गंभीर बस्ती का मार्ग देखें (मिकिरपारा)' : 'Simulate Critical Settlement (Mikirpara)'}
              </button>
            </div>
          </div>
        </div>
      `;

      const simBtn = document.getElementById('btn-demo-critical-route');
      if (simBtn) {
        simBtn.addEventListener('click', () => {
          state.set('activeSettlementId', 'settlement-01');
          this.render(container);
          Toast.show('Switched to Mikirpara (Critical Flood Route Active)', 'info');
        });
      }
      return;
    }

    // Active Evacuation Corridor
    const translatedInstructions = lang === 'hi' ? [
      { step: 1, title: "मिकिरपारा वार्ड 4 से उत्तर दिशा में प्रस्थान करें", detail: "मुख्य गांव मार्ग से होते हुए ऊंचे पीडब्ल्यूडी तटबंध की ओर जाएं। नदी की ओर न जाएं।" },
      { step: 2, title: "उत्तरी ऊंचे पक्के तटबंध गलियारे पर आएं", detail: "दाएं मुड़कर ऊंचे पक्के तटबंध (एनएच-715ए स्पर) पर आएं। सड़क साफ है और सोलर लाइट्स चालू हैं।" },
      { step: 3, title: "सावधानी: दक्षिण पुलिया बाईपास (किमी 3.2) से बचें", detail: "निचली पुलिया पानी में बह गई है। एसडीआरएफ के पीले कोन निर्देशों का पालन करते हुए ऊपरी रिज पर रहें।" },
      { step: 4, title: "मेडिकल सहायता जांच चौकी (किमी 2.8) पार करें", detail: "जिला आपदा प्रबंधन प्राधिकरण के स्वयंसेवक पीने के पानी और प्राथमिक चिकित्सा के साथ तैनात हैं।" },
      { step: 5, title: "मॉडल हायर सेकेंडरी सुरक्षित आश्रय केंद्र पहुंचें", detail: "गेट नंबर 1 से प्रवेश करें। पंजीकरण, भोजन, शुद्ध जल और बिजली बैकअप उपलब्ध है।" }
    ] : routeData.instructions;

    container.innerHTML = `
      <div class="safe-route-container fade-in">
        <!-- 1. Urgent Evacuation Banner -->
        <div class="glass-panel evac-banner">
          <div class="evac-banner-left">
            <div class="evac-banner-icon" aria-hidden="true">
              <i class="fa-solid fa-person-running"></i>
            </div>
            <div class="evac-banner-text">
              <h2>${TranslationService.t('activeEvacuationCorridorTitle', lang)} ${lang === 'hi' ? routeData.settlementName.replace('Settlement', 'बस्ती') : routeData.settlementName}</h2>
              <p>${TranslationService.t('verifiedSafeRouteDesc', lang)}</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <a href="tel:112" class="btn btn-emergency btn-sm">
              <i class="fa-solid fa-phone"></i> ${TranslationService.t('callEmergency112Btn', lang)}
            </a>
            <button class="btn btn-secondary btn-sm" id="btn-share-evac-route">
              <i class="fa-solid fa-share-nodes"></i> ${TranslationService.t('shareRouteBtn', lang)}
            </button>
          </div>
        </div>

        <!-- 2. Route Metrics Bar -->
        <div class="route-metrics-bar">
          <div class="route-metric-card">
            <i class="fa-solid fa-route route-metric-icon"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">${routeData.distanceKm} km</span>
              <span class="route-metric-label">${TranslationService.t('corridorDistanceLabel', lang)}</span>
            </div>
          </div>

          <div class="route-metric-card">
            <i class="fa-solid fa-person-walking route-metric-icon" style="color:#059669;"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">~${routeData.estimatedMinutesFoot} mins</span>
              <span class="route-metric-label">${TranslationService.t('onFootLabel', lang)}</span>
            </div>
          </div>

          <div class="route-metric-card">
            <i class="fa-solid fa-car route-metric-icon"></i>
            <div class="route-metric-content">
              <span class="route-metric-value">~${routeData.estimatedMinutesVehicle} mins</span>
              <span class="route-metric-label">${TranslationService.t('authorizedVehicleLabel', lang)}</span>
            </div>
          </div>

          <div class="route-metric-card" style="border-left:3px solid #059669;">
            <i class="fa-solid fa-circle-check route-metric-icon" style="color:#059669;"></i>
            <div class="route-metric-content">
              <span class="route-metric-value" style="color:#059669; font-size:1rem;">${lang === 'hi' ? 'सत्यापित सुरक्षित' : routeData.routeStatus}</span>
              <span class="route-metric-label">${lang === 'hi' ? '15 मिनट पूर्व सत्यापित' : routeData.lastVerifiedAt}</span>
            </div>
          </div>
        </div>

        <!-- 3. Split Layout: Interactive Map & Step Guidance -->
        <div class="route-split-layout">
          <!-- Left/Top: Route Map -->
          <div class="route-map-panel">
            <div id="leaflet-route-map" role="region" aria-label="Interactive evacuation route map"></div>

            <!-- Floating Route Badge -->
            <div class="route-map-badge">
              <span style="display:inline-block; width:12px; height:4px; background:#059669; border-radius:2px;"></span>
              <span>${TranslationService.t('greenLineLegend', lang)}</span>
            </div>
          </div>

          <!-- Right/Bottom: Turn-by-Turn Guide & Destination Shelter -->
          <div class="glass-panel route-guide-panel">
            <!-- Safe Shelter Destination Card -->
            <div class="shelter-destination-card">
              <span class="shelter-badge"><i class="fa-solid fa-person-shelter"></i> ${TranslationService.t('designatedRefugeBadge', lang)}</span>
              <h3 class="shelter-name">${lang === 'hi' ? 'मॉडल हायर सेकेंडरी चक्रवात व बाढ़ आश्रय केंद्र' : routeData.shelterDetails.name}</h3>
              <div style="font-size:0.825rem; color:#0284c7;">
                <i class="fa-solid fa-mountain"></i> ${lang === 'hi' ? '+14 मी ऊंचा सुरक्षित स्थान' : routeData.shelterDetails.elevation} &bull; ${lang === 'hi' ? 'क्षमता:' : 'Capacity:'} ${routeData.shelterDetails.capacity}
              </div>
              <div style="font-size:0.8rem; color:#059669; font-weight:700;">
                <i class="fa-solid fa-users"></i> ${lang === 'hi' ? '32% भरा - पर्याप्त स्थान उपलब्ध' : routeData.shelterDetails.occupancyStatus}
              </div>
              <div class="shelter-amenities">
                ${(lang === 'hi' ? ['शुद्ध पेयजल', 'प्राथमिक उपचार केंद्र', '24/7 जनरेटर बिजली', 'सूखा राशन व भोजन', 'महिला व बच्चों हेतु अलग स्वच्छता सुविधा'] : routeData.shelterDetails.amenities).map(a => `
                  <span class="amenity-tag"><i class="fa-solid fa-check"></i> ${a}</span>
                `).join('')}
              </div>
              <div style="font-size:0.775rem; color:#475569; margin-top:0.25rem;">
                <i class="fa-solid fa-phone"></i> ${lang === 'hi' ? 'प्रभारी संपर्क:' : 'In-Charge:'} <strong>${routeData.shelterDetails.contact}</strong>
              </div>
            </div>

            <!-- Road Hazard Warning -->
            <div class="road-block-alert">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>${TranslationService.t('criticalRoadHazardTitle', lang)}</strong>
                <div>${TranslationService.t('roadHazardDesc', lang)}</div>
              </div>
            </div>

            <!-- Numbered Steps -->
            <div>
              <h4 style="margin-bottom:1rem; font-size:1.05rem; color:#0f2b48;">
                <i class="fa-solid fa-list-ol"></i> ${TranslationService.t('stepByStepGuidanceTitle', lang)}
              </h4>
              <div class="route-steps-list">
                ${translatedInstructions.map((step, idx) => `
                  <div class="route-step-item">
                    <div class="step-bullet ${idx === translatedInstructions.length - 1 ? 'shelter-bullet' : ''}">
                      ${idx === translatedInstructions.length - 1 ? '<i class="fa-solid fa-check"></i>' : step.step}
                    </div>
                    <div class="step-text">${step.title}</div>
                    <div class="step-subtext">${step.detail}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Explicit Early Guidance Limitation Notice -->
            <div style="padding:0.85rem 1.15rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.8rem; color:#64748b; line-height:1.5;">
              <strong style="color:#0f2b48;">${TranslationService.t('officialNoticeTitle', lang)}</strong> ${TranslationService.t('officialNoticeDesc', lang)}
            </div>
          </div>
        </div>
      </div>
    `;

    this.initRouteMap(geojsonData);
    this.attachEvents(routeData);
  }

  static initRouteMap(geojsonData) {
    if (this.mapController) {
      this.mapController.destroy();
    }

    this.mapController = new MapController('leaflet-route-map', {
      center: [26.9780, 94.2050],
      zoom: 12
    });

    const map = this.mapController.init();
    if (!map) return;

    RouteLayer.renderGeoJson(map, geojsonData);
  }

  static attachEvents(routeData) {
    const shareBtn = document.getElementById('btn-share-evac-route');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = `[AapadaSathi Safe Route] Evacuate ${routeData.settlementName} via North Embankment to ${routeData.shelterName} (${routeData.distanceKm} km, ~${routeData.estimatedMinutesFoot}m foot). Stay off South Culvert km 3.2. Helpline: 112.`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          Toast.show('Evacuation corridor directions copied to clipboard!', 'success');
        } else {
          Toast.show('Route ready to share.', 'info');
        }
      });
    }
  }
}
