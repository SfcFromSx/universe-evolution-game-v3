import { eventBus } from './EventBus.js';
import { store } from './StateStore.js';

export class Engine {
  constructor() {
    this._lastTime = 0;
    this._accumulator = 0;
    this._tickRate = 1000 / 60;
    this._rafId = null;
    this._updateCallbacks = [];
    this._renderCallbacks = [];
    this._running = false;
  }

  onUpdate(callback) {
    this._updateCallbacks.push(callback);
  }

  onRender(callback) {
    this._renderCallbacks.push(callback);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._loop(this._lastTime);
    eventBus.emit('engine:start');
  }

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    eventBus.emit('engine:stop');
  }

  _loop(now) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame((t) => this._loop(t));

    const dt = Math.min(now - this._lastTime, 100);
    this._lastTime = now;

    const simState = store.get('simulation');
    if (simState.isPlaying && !simState.isComplete) {
      this._accumulator += dt;
      while (this._accumulator >= this._tickRate) {
        this._accumulator -= this._tickRate;
        const simDt = (this._tickRate / 1000) * simState.speed;
        for (const cb of this._updateCallbacks) {
          cb(simDt, store.state);
        }
      }
    }

    for (const cb of this._renderCallbacks) {
      cb(dt / 1000, store.state);
    }
  }
}

export const engine = new Engine();
