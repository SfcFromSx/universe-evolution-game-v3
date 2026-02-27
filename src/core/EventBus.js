export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, callback, context = null) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push({ callback, context });
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const listeners = this._listeners.get(event);
    if (!listeners) return;
    const idx = listeners.findIndex(l => l.callback === callback);
    if (idx !== -1) listeners.splice(idx, 1);
  }

  emit(event, data) {
    const listeners = this._listeners.get(event);
    if (!listeners) return;
    for (const { callback, context } of listeners) {
      try {
        callback.call(context, data);
      } catch (err) {
        console.error(`EventBus error in "${event}":`, err);
      }
    }
  }

  once(event, callback, context = null) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback.call(context, data);
    };
    return this.on(event, wrapper);
  }

  clear() {
    this._listeners.clear();
  }
}

export const eventBus = new EventBus();
