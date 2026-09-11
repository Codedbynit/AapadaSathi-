/**
 * AapadaSathi Route Layer
 * Renders evacuation corridors, hazard inundation polygons, road blockages, and shelters.
 */

export class RouteLayer {
  /**
   * Render complete evacuation route GeoJSON on a Leaflet map instance
   */
  static renderGeoJson(map, geojsonData, onShelterClick) {
    if (!map || !geojsonData) return null;

    const layerGroup = L.featureGroup();

    L.geoJSON(geojsonData, {
      style: (feature) => {
        const id = feature.properties.id || '';
        if (id === 'corridor-primary') {
          return {
            color: '#10b981',
            weight: 6,
            opacity: 0.95,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round'
          };
        } else if (id === 'corridor-alternate') {
          return {
            color: '#38bdf8',
            weight: 4,
            opacity: 0.65,
            dashArray: '5, 10'
          };
        } else if (id === 'hazard-flood-zone') {
          return {
            color: '#ef4444',
            weight: 2,
            opacity: 0.8,
            fillColor: '#ef4444',
            fillOpacity: 0.28
          };
        }
        return { color: '#ffffff', weight: 2 };
      },
      pointToLayer: (feature, latlng) => {
        const props = feature.properties || {};
        if (props.type === 'SAFE_SHELTER') {
          const shelterIcon = L.divIcon({
            className: 'shelter-pin-marker',
            html: `
              <div style="background:#10b981; color:#ffffff; border:2px solid #ffffff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(16,185,129,0.8); font-size:16px;">
                <i class="fa-solid fa-person-shelter"></i>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          const marker = L.marker(latlng, { icon: shelterIcon });
          marker.bindPopup(`
            <div style="padding:4px;">
              <strong style="color:#10b981; font-size:14px;"><i class="fa-solid fa-shield-halved"></i> ${props.name}</strong>
              <div style="margin-top:4px; font-size:12px; color:#cbd5e1;">Capacity: ${props.capacity} | ${props.occupancy}</div>
              <div style="font-size:11px; color:#38bdf8; margin-top:2px;">${props.elevation}</div>
            </div>
          `);
          return marker;
        } else if (props.type === 'ROAD_BLOCKED') {
          const blockedIcon = L.divIcon({
            className: 'blockage-pin-marker',
            html: `
              <div style="background:#ef4444; color:#ffffff; border:2px solid #ffffff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(239,68,68,0.9); font-size:14px;">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          const marker = L.marker(latlng, { icon: blockedIcon });
          marker.bindPopup(`
            <div style="padding:4px;">
              <strong style="color:#ef4444; font-size:13px;"><i class="fa-solid fa-ban"></i> ${props.name}</strong>
              <div style="margin-top:4px; font-size:12px; color:#fca5a5;">${props.description}</div>
            </div>
          `);
          return marker;
        } else if (props.type === 'AT_RISK_SETTLEMENT') {
          const originIcon = L.divIcon({
            className: 'origin-pin-marker',
            html: `
              <div style="background:#dc2626; color:#ffffff; border:2px solid #ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(220,38,38,0.8); font-size:14px;">
                <i class="fa-solid fa-location-dot"></i>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
          const marker = L.marker(latlng, { icon: originIcon });
          marker.bindPopup(`<strong>${props.name}</strong><br><span style="color:#f87171;">Origin Point (${props.riskLevel} Risk)</span>`);
          return marker;
        }
        return L.circleMarker(latlng, { radius: 6, color: '#38bdf8' });
      }
    }).addTo(layerGroup);

    layerGroup.addTo(map);

    try {
      map.fitBounds(layerGroup.getBounds(), { padding: [40, 40], maxZoom: 14 });
    } catch (e) {
      console.warn('Could not fit bounds for route layer:', e);
    }

    return layerGroup;
  }
}
