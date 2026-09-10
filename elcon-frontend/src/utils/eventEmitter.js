export const eventEmitter = {
  events: {},

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return () => this.off(eventName, callback);
  },

  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  },

  emit(eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
};

export const CATEGORY_EVENTS = {
  CATEGORY_ADDED: 'category:added',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted'
};