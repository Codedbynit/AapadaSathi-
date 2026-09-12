import { ApiClient } from '../api/api-client.js';

export class SosModal {
  static currentStep = 1;
  static realLat = null;
  static realLon = null;
  static locationStatus = 'pending'; // 'pending' | 'granted' | 'denied'
  static generatedTimestamp = null;
  static selectedEmergencyType = '';
  static preparedPayload = null;

  static init() {
    this.createModalHtml();
    this.attachEventListeners();
  }

  static createModalHtml() {
    if (document.getElementById('sos-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sos-modal-overlay';
    overlay.className = 'sos-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'sos-modal-title');

    overlay.innerHTML = `
      <div class="sos-modal-card">
        <div class="sos-modal-header" style="background:#fef2f2; border-bottom:1px solid #fecaca; padding:1.1rem 1.4rem; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:0.6rem; color:#dc2626; font-weight:800; font-size:1.1rem;" id="sos-modal-title">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:1.25rem;"></i>
            <span id="sos-header-text">EMERGENCY SOS</span>
          </div>
          <button type="button" class="sos-close-btn" id="btn-sos-close-x" aria-label="Close Emergency SOS Modal" style="background:none; border:none; color:#64748b; font-size:1.25rem; cursor:pointer; padding:0.2rem;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="sos-modal-body" id="sos-modal-body" style="padding:1.4rem; display:flex; flex-direction:column; gap:1.15rem;">
          <!-- Content dynamically rendered per step -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  static open() {
    this.createModalHtml();
    this.currentStep = 1;
    this.realLat = null;
    this.realLon = null;
    this.locationStatus = 'pending';
    this.generatedTimestamp = null;
    this.selectedEmergencyType = '';
    this.preparedPayload = null;

    const overlay = document.getElementById('sos-modal-overlay');
    if (overlay) {
      this.renderStep1();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  static close() {
    const overlay = document.getElementById('sos-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  static renderStep1() {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'EMERGENCY SOS';

    if (!body) return;

    body.innerHTML = `
      <div style="text-align:center; padding:0.5rem 0;">
        <div style="width:64px; height:64px; border-radius:50%; background:#fef2f2; border:2px solid #fecaca; display:flex; align-items:center; justify-content:center; color:#dc2626; font-size:1.8rem; margin:0 auto 1rem;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="font-size:1.15rem; font-weight:800; color:#0f2b48; margin-bottom:0.5rem;">Confirm Emergency Action</h3>
        <p style="font-size:0.925rem; color:#475569; line-height:1.5;">Are you sure you want to send an emergency SOS?</p>
      </div>
      <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
        <button type="button" class="btn btn-secondary" id="btn-sos-cancel-1" style="flex:1;">Cancel</button>
        <button type="button" class="btn btn-danger" id="btn-sos-continue-1" style="flex:1;">Continue</button>
      </div>
    `;

    document.getElementById('btn-sos-cancel-1')?.addEventListener('click', () => this.close());
    document.getElementById('btn-sos-continue-1')?.addEventListener('click', () => {
      this.generatedTimestamp = new Date().toISOString();
      this.requestLocationAndRenderStep2();
    });
  }

  static requestLocationAndRenderStep2() {
    this.currentStep = 2;
    this.renderStep2Loading();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.realLat = pos.coords.latitude;
          this.realLon = pos.coords.longitude;
          this.locationStatus = 'granted';
          this.renderStep2();
        },
        (err) => {
          console.warn('[SosModal] Geolocation permission denied or failed:', err.message);
          this.realLat = null;
          this.realLon = null;
          this.locationStatus = 'denied';
          this.renderStep2();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      this.realLat = null;
      this.realLon = null;
      this.locationStatus = 'denied';
      this.renderStep2();
    }
  }

  static renderStep2Loading() {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'SOS LOCATION & TYPE';

    if (!body) return;

    body.innerHTML = `
      <div style="text-align:center; padding:1.5rem 0;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:#0284c7; margin-bottom:1rem;"></i>
        <div style="font-size:0.95rem; font-weight:700; color:#0f2b48;">Fetching location...</div>
        <div style="font-size:0.825rem; color:#64748b; margin-top:0.35rem;">Requesting real browser location permission</div>
      </div>
    `;
  }

  static renderStep2() {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'SOS DETAILS';

    if (!body) return;

    const locationHtml = this.locationStatus === 'granted'
      ? `<div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem; color:#166534;">
           <div style="font-weight:700; margin-bottom:0.25rem;"><i class="fa-solid fa-location-dot"></i> SOS LOCATION</div>
           <div>Latitude: <strong>${this.realLat}</strong></div>
           <div>Longitude: <strong>${this.realLon}</strong></div>
           <div style="margin-top:0.25rem; font-size:0.75rem; color:#475569;">Timestamp: ${this.generatedTimestamp}</div>
         </div>`
      : `<div style="background:#fef2f2; border:1px solid #fecaca; padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem; color:#991b1b;">
           <div style="font-weight:700; margin-bottom:0.25rem;"><i class="fa-solid fa-location-crosshairs"></i> SOS LOCATION</div>
           <div>Location permission was denied. SOS location is unavailable.</div>
           <div style="margin-top:0.25rem; font-size:0.75rem; color:#475569;">Timestamp: ${this.generatedTimestamp}</div>
         </div>`;

    body.innerHTML = `
      ${locationHtml}

      <div style="display:flex; flex-direction:column; gap:0.4rem;">
        <label for="sos-emergency-type" style="font-size:0.875rem; font-weight:700; color:#0f2b48;">
          Emergency Type <span style="color:#dc2626;">*</span>
        </label>
        <select id="sos-emergency-type" class="lang-select" style="width:100%; padding:0.65rem 0.85rem; font-size:0.9rem;">
          <option value="" disabled ${!this.selectedEmergencyType ? 'selected' : ''}>-- Select Emergency Type --</option>
          <option value="Flood" ${this.selectedEmergencyType === 'Flood' ? 'selected' : ''}>Flood</option>
          <option value="Fire" ${this.selectedEmergencyType === 'Fire' ? 'selected' : ''}>Fire</option>
          <option value="Medical" ${this.selectedEmergencyType === 'Medical' ? 'selected' : ''}>Medical</option>
          <option value="Other" ${this.selectedEmergencyType === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>

      <div style="display:flex; gap:0.75rem; margin-top:0.5rem;">
        <button type="button" class="btn btn-secondary" id="btn-sos-cancel-2" style="flex:1;">CANCEL</button>
        <button type="button" class="btn btn-danger" id="btn-sos-confirm" style="flex:1;" ${!this.selectedEmergencyType ? 'disabled' : ''}>CONFIRM SOS</button>
      </div>
    `;

    const selectEl = document.getElementById('sos-emergency-type');
    const confirmBtn = document.getElementById('btn-sos-confirm');

    selectEl?.addEventListener('change', (e) => {
      this.selectedEmergencyType = e.target.value;
      if (confirmBtn) {
        confirmBtn.disabled = !this.selectedEmergencyType;
      }
    });

    document.getElementById('btn-sos-cancel-2')?.addEventListener('click', () => this.close());
    confirmBtn?.addEventListener('click', async () => {
      if (!this.selectedEmergencyType) return;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

      const payload = {
        emergency_type: this.selectedEmergencyType.toUpperCase(),
        latitude: this.realLat,
        longitude: this.realLon,
        timestamp: this.generatedTimestamp
      };

      try {
        const response = await ApiClient.post('/sos', payload);
        const data = response.data || {};
        if (data.success) {
          this.preparedPayload = {
            ...payload,
            sos_id: data.sos_id,
            status: data.status,
            notification_status: data.notification_status
          };
          this.renderStep3Success();
        } else if (data.sos_id && data.notification_status === 'FAILED') {
          this.preparedPayload = {
            ...payload,
            sos_id: data.sos_id,
            status: data.status,
            notification_status: data.notification_status
          };
          this.renderStep3Failed('SOS request was received, but the SMS could not be sent.');
        } else {
          this.renderStep3Error('SOS request could not be submitted.');
        }
      } catch (err) {
        console.warn('[SosModal] Backend submission failed:', err);
        const data = err.response?.data || {};
        if (data.sos_id && data.notification_status === 'FAILED') {
          this.preparedPayload = {
            ...payload,
            sos_id: data.sos_id,
            status: data.status,
            notification_status: data.notification_status
          };
          this.renderStep3Failed('SOS request was received, but the SMS could not be sent.');
        } else {
          this.renderStep3Error('SOS request could not be submitted.');
        }
      }
    });
  }

  static renderStep3Success() {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'SOS SENT';

    if (!body || !this.preparedPayload) return;

    const locText = (this.preparedPayload.latitude !== null && this.preparedPayload.longitude !== null)
      ? `Latitude: ${this.preparedPayload.latitude}, Longitude: ${this.preparedPayload.longitude}`
      : 'Location permission was denied. SOS location is unavailable.';

    body.innerHTML = `
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:1.25rem; border-radius:var(--radius-md); text-align:center;">
        <div style="width:48px; height:48px; border-radius:50%; background:#dcfce7; color:#166534; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 0.75rem;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size:1.1rem; font-weight:800; color:#166534; margin-bottom:0.25rem;">SOS request received</h3>
        <p style="font-size:0.825rem; color:#15803d; font-weight:600;">SOS sent successfully.</p>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:1rem; border-radius:var(--radius-md); font-size:0.85rem; color:#334155; display:flex; flex-direction:column; gap:0.4rem;">
        <div><strong>SOS Reference ID:</strong> ${this.preparedPayload.sos_id || 'N/A'}</div>
        <div><strong>Emergency Type:</strong> ${this.preparedPayload.emergency_type}</div>
        <div><strong>Location:</strong> ${locText}</div>
        <div><strong>Timestamp:</strong> ${this.preparedPayload.timestamp}</div>
        <div><strong>Status:</strong> RECEIVED</div>
        <div><strong>Notification Status:</strong> SENT</div>
      </div>

      <div style="margin-top:0.5rem;">
        <button type="button" class="btn btn-primary" id="btn-sos-close" style="width:100%;">Close</button>
      </div>
    `;

    document.getElementById('btn-sos-close')?.addEventListener('click', () => this.close());
  }

  static renderStep3Failed(message = 'SOS request was received, but the SMS could not be sent.') {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'SOS RECEIVED';

    if (!body || !this.preparedPayload) return;

    const locText = (this.preparedPayload.latitude !== null && this.preparedPayload.longitude !== null)
      ? `Latitude: ${this.preparedPayload.latitude}, Longitude: ${this.preparedPayload.longitude}`
      : 'Location permission was denied. SOS location is unavailable.';

    body.innerHTML = `
      <div style="background:#fffbe6; border:1px solid #ffe58f; padding:1.25rem; border-radius:var(--radius-md); text-align:center;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fff1b8; color:#d48806; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 0.75rem;">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 style="font-size:1.1rem; font-weight:800; color:#d48806; margin-bottom:0.25rem;">SOS request received</h3>
        <p style="font-size:0.825rem; color:#ad6800; font-weight:600;">${message}</p>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:1rem; border-radius:var(--radius-md); font-size:0.85rem; color:#334155; display:flex; flex-direction:column; gap:0.4rem;">
        <div><strong>SOS Reference ID:</strong> ${this.preparedPayload.sos_id || 'N/A'}</div>
        <div><strong>Emergency Type:</strong> ${this.preparedPayload.emergency_type}</div>
        <div><strong>Location:</strong> ${locText}</div>
        <div><strong>Timestamp:</strong> ${this.preparedPayload.timestamp}</div>
        <div><strong>Status:</strong> RECEIVED</div>
        <div><strong>Notification Status:</strong> FAILED</div>
      </div>

      <div style="margin-top:0.5rem;">
        <button type="button" class="btn btn-secondary" id="btn-sos-close" style="width:100%;">Close</button>
      </div>
    `;

    document.getElementById('btn-sos-close')?.addEventListener('click', () => this.close());
  }

  static renderStep3Error(errorMessage) {
    const body = document.getElementById('sos-modal-body');
    const headerText = document.getElementById('sos-header-text');
    if (headerText) headerText.innerText = 'SOS SUBMISSION FAILED';

    if (!body) return;

    body.innerHTML = `
      <div style="background:#fef2f2; border:1px solid #fecaca; padding:1.25rem; border-radius:var(--radius-md); text-align:center;">
        <div style="width:48px; height:48px; border-radius:50%; background:#fee2e2; color:#dc2626; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 0.75rem;">
          <i class="fa-solid fa-xmark"></i>
        </div>
        <h3 style="font-size:1.1rem; font-weight:800; color:#991b1b; margin-bottom:0.25rem;">${errorMessage || 'SOS request could not be submitted.'}</h3>
        <p style="font-size:0.825rem; color:#b91c1c; font-weight:600;">Please call emergency helpline (112) for immediate assistance.</p>
      </div>

      <div style="margin-top:0.5rem;">
        <button type="button" class="btn btn-secondary" id="btn-sos-close" style="width:100%;">Close</button>
      </div>
    `;

    document.getElementById('btn-sos-close')?.addEventListener('click', () => this.close());
  }

  static attachEventListeners() {
    document.getElementById('btn-sos-close-x')?.addEventListener('click', () => this.close());

    const overlay = document.getElementById('sos-modal-overlay');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) {
        this.close();
      }
    });
  }
}
