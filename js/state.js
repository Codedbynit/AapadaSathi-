/**
 * AapadaSathi Reactive State Management
 * Single source of truth with pub/sub event subscription.
 */

import { CONFIG } from './config.js';

class AppState {
  constructor() {
    this.state = {
      activeSettlementId: CONFIG.DEFAULT_SETTLEMENT_ID,
      activeLanguage: CONFIG.DEFAULT_LANGUAGE,
      activeRole: CONFIG.DEFAULT_PERSONA,
      activeRoute: '#home',
      activeHazardFilter: 'ALL',
      activeSeverityFilter: 'ALL',
      searchQuery: '',
      isMockMode: CONFIG.USE_MOCK_DATA,
      alertsRead: new Set()
    };

    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] === value) return;
    const oldValue = this.state[key];
    this.state[key] = value;
    this.emit(key, value, oldValue);
    this.emit('*', this.state);
  }

  update(partialState) {
    for (const [key, value] of Object.entries(partialState)) {
      this.set(key, value);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in subscriber for event "${event}":`, err);
        }
      });
    }
  }
}

export const state = new AppState();
