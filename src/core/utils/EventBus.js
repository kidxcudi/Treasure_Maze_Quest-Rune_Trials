// src/core/utils/EventBus.js
export const EventBus = {
  events: new Map(),

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  },

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(cb => cb(data));
    }
  },

  off(event, callback) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event).filter(cb => cb !== callback);
      this.events.set(event, callbacks);
    }
  }
};