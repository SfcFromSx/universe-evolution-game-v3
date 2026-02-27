import { eventBus } from './EventBus.js';
import { CANONICAL_PARAMS } from '../data/constants.js';
import { EPOCHS } from '../data/epochs.js';

function createInitialState() {
  return {
    cosmicParameters: { ...CANONICAL_PARAMS },
    universeState: {
      currentEpochIndex: EPOCHS.length - 1,
      currentTime: 14.1,
      scaleFactor: 1.0,
      temperature: 2.725,
      entropy: 1e88,
      density: 9.47e-27,
    },
    elementalDistribution: {
      hydrogen: 0.74,
      helium: 0.25,
      heavy: 0.01,
    },
    galaxies: [],
    metrics: {
      totalGalaxies: 198.4e12,
      totalStars: 1.2e15,
      avgTemperature: 2.725,
      entropyHistory: [],
    },
    simulation: {
      isPlaying: false,
      speed: 1,
      isComplete: false,
    },
    ui: {
      activeView: 'dashboard',
      selectedGalaxy: null,
      showWelcome: true,
    },
  };
}

class StateStore {
  constructor() {
    this._state = createInitialState();
    this._history = [];
  }

  get state() {
    return this._state;
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this._state);
  }

  set(path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (obj[key] === undefined) obj[key] = {};
      return obj[key];
    }, this._state);
    const oldValue = target[last];
    target[last] = value;
    eventBus.emit('state:change', { path, value, oldValue });
    eventBus.emit(`state:${path}`, { value, oldValue });
  }

  update(path, updater) {
    const current = this.get(path);
    this.set(path, updater(current));
  }

  merge(path, partial) {
    const current = this.get(path);
    if (typeof current === 'object' && !Array.isArray(current)) {
      this.set(path, { ...current, ...partial });
    }
  }

  reset() {
    this._state = createInitialState();
    eventBus.emit('state:reset');
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this._state));
  }

  restore(snapshot) {
    this._state = JSON.parse(JSON.stringify(snapshot));
    eventBus.emit('state:reset');
  }

  save(name) {
    const saves = this._loadSaves();
    saves[name] = {
      state: this.snapshot(),
      timestamp: Date.now(),
    };
    localStorage.setItem('cosmopoeia_saves', JSON.stringify(saves));
  }

  load(name) {
    const saves = this._loadSaves();
    if (saves[name]) {
      this.restore(saves[name].state);
      return true;
    }
    return false;
  }

  listSaves() {
    return Object.entries(this._loadSaves()).map(([name, data]) => ({
      name,
      timestamp: data.timestamp,
    }));
  }

  _loadSaves() {
    try {
      return JSON.parse(localStorage.getItem('cosmopoeia_saves') || '{}');
    } catch {
      return {};
    }
  }
}

export const store = new StateStore();
