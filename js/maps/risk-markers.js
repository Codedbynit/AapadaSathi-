/**
 * AapadaSathi Risk Markers
 * Creates animated, color-coded Leaflet markers with rich glass popups.
 */

export class RiskMarkers {
  /**
   * Create custom Leaflet DivIcon based on risk severity
   */
  static createDivIcon(settlement) {
    const level = (settlement.riskLevel || 'LOW').toLowerCase();

    // Display real river discharge from Open-Meteo, not a placeholder score
    const discharge = settlement.river_discharge_m3s;
    const displayValue = (discharge !== null && discharge !== undefined)
      ? Math.round(discharge * 10) / 10
      : 'N/A';

    let markerClass = 'marker-low';
    let size = 32;

    if (level === 'critical') {
      markerClass = 'marker-critical';
      size = 38;
    } else if (level === 'high') {
      markerClass = 'marker-high';
      size = 34;
    } else if (level === 'moderate') {
      markerClass = 'marker-moderate';
      size = 30;
    }

    const html = `
      <div class="custom-risk-marker ${markerClass}" style="width:${size}px; height:${size}px; font-size:${size * 0.34}px; line-height:1.1; display:flex; flex-direction:column; align-items:center; justify-content:center;" aria-label="${settlement.name}: river discharge ${displayValue} m³/s">
        <span>${displayValue}</span>
      </div>
    `;

    return L.divIcon({
      className: 'custom-risk-marker-container',
      html: html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  }

  /**
   * Bind rich interactive popup to settlement marker
   */
  static bindPopup(marker, settlement, onSelectSettlement, onNavigateSafeRoute) {
    const level = settlement.riskLevel || 'LOW';
    let badgeClass = 'badge-low';
    if (level === 'CRITICAL') badgeClass = 'badge-critical';
    else if (level === 'HIGH') badgeClass = 'badge-high';
    else if (level === 'MODERATE') badgeClass = 'badge-moderate';

    const content = document.createElement('div');
    content.className = 'map-popup-inner';
    content.innerHTML = `
      <div class="map-popup-header">
        <span class="map-popup-title">${settlement.name}</span>
        <span class="status-badge ${badgeClass}">${level || 'Unavailable'}</span>
      </div>
      <div class="map-popup-body">
        <div><strong>Hazard:</strong> ${settlement.hazardType || 'Unknown'}</div>
        <div><strong>Risk Score:</strong> ${settlement.riskScore !== undefined ? settlement.riskScore + '/100' : 'N/A'}</div>
        <div><strong>River Discharge:</strong> ${settlement.river_discharge_m3s !== null && settlement.river_discharge_m3s !== undefined ? settlement.river_discharge_m3s + ' m³/s' : 'Unavailable'}</div>
        <div><strong>Estimated Lead Time:</strong> <span style="color:#38bdf8; font-weight:bold;">${settlement.leadTimeHours !== undefined ? settlement.leadTimeHours + ' hrs' : 'N/A'}</span></div>
        <div><strong>Confidence:</strong> ${settlement.confidence || 'N/A'}</div>
        <div><strong>Population:</strong> ${settlement.population.toLocaleString()}</div>
        <div><strong>Data Source:</strong> Open-Meteo Flood Forecast</div>
      </div>
      <div class="map-popup-action" style="display:flex; gap:0.5rem; margin-top:0.75rem;">
        <button class="btn btn-primary btn-sm popup-view-btn" style="flex:1;">
          <i class="fa-solid fa-chart-line"></i> View Risk
        </button>
        ${settlement.evacuationRequired ? `
          <button class="btn btn-danger btn-sm popup-route-btn" style="flex:1;">
            <i class="fa-solid fa-person-walking-arrow-right"></i> Safe Route
          </button>
        ` : ''}
      </div>
    `;

    // Attach click listeners safely
    content.querySelector('.popup-view-btn').addEventListener('click', () => {
      if (typeof onSelectSettlement === 'function') {
        onSelectSettlement(settlement.id);
      }
    });

    const routeBtn = content.querySelector('.popup-route-btn');
    if (routeBtn) {
      routeBtn.addEventListener('click', () => {
        if (typeof onNavigateSafeRoute === 'function') {
          onNavigateSafeRoute(settlement.id);
        }
      });
    }

    marker.bindPopup(content, { maxWidth: 300 });
  }
}
