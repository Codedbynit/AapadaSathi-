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

    // Display value inside the marker bubble
    // For riskScore: show the score number
    // For discharge-only: show a wave icon (no long numbers inside the dot)
    // For no data: show "?" so marker is still identifiable
    const displayValue = (settlement.riskScore !== undefined && settlement.riskScore !== null)
      ? settlement.riskScore
      : (settlement.river_discharge_m3s !== undefined && settlement.river_discharge_m3s !== null)
        ? '\u{1F30A}'
        : '?';

    // Determine marker appearance
    let markerClass = 'marker-low';
    let size = 44; // larger default for better visibility
    if (settlement.riskScore !== undefined && settlement.riskScore !== null) {
      // Existing risk level determines color
      const level = (settlement.riskLevel || 'LOW').toLowerCase();
      if (level === 'critical') { markerClass = 'marker-critical'; size = 48; }
      else if (level === 'high') { markerClass = 'marker-high'; size = 44; }
      else if (level === 'moderate') { markerClass = 'marker-moderate'; size = 40; }
      else { markerClass = 'marker-low'; size = 44; }
    } else if (settlement.river_discharge_m3s !== undefined && settlement.river_discharge_m3s !== null) {
      // Discharge-only data – use a solid teal marker so it's clearly visible
      markerClass = 'marker-discharge';
      size = 48;
    } else {
      // No data – use grey marker so it's still visible on the map
      markerClass = 'marker-nodata';
      size = 44;
    }

    const fontSize = (displayValue === String.fromCodePoint(0x1F30A) || displayValue === '?')
      ? Math.round(size * 0.42)
      : Math.round(size * 0.34);

    const html = `
      <div class="custom-risk-marker ${markerClass}"
           style="width:${size}px; height:${size}px; font-size:${fontSize}px; line-height:1;"
           aria-label="${settlement.name}">
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
