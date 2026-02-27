import { store } from '../core/StateStore.js';
import { eventBus } from '../core/EventBus.js';
import { Physics } from './Physics.js';
import { Nucleosynthesis } from './Nucleosynthesis.js';
import { GalaxyGenerator } from './GalaxyGenerator.js';
import { CosmicWeb } from './CosmicWeb.js';
import { EpochManager } from './EpochManager.js';
import { CANONICAL_PARAMS, PHYSICS as PHYS } from '../data/constants.js';
import { clamp } from '../utils/math.js';

export class Universe {
  constructor() {
    this.epochManager = new EpochManager();
    this.galaxyGenerator = new GalaxyGenerator();
    this.cosmicWeb = null;
    this._entropyHistory = [];
    this._simTime = 0;
    this._paramsChanged = false;
    this._lastGalaxyCount = 0;
  }

  init() {
    this.recalculate();
    eventBus.on('state:cosmicParameters', () => {
      this._paramsChanged = true;
      this.recalculate();
    });
    eventBus.on('state:universeState.currentTime', () => {
      if (!store.get('simulation.isPlaying')) {
        this._paramsChanged = true;
        this.recalculate();
      }
    });
  }

  recalculate() {
    const params = store.get('cosmicParameters');
    const timeBYA = store.get('universeState.currentTime');
    this._updatePhysics(params, timeBYA);
    this._updateElements(params, timeBYA);
    this._updateGalaxies(params, timeBYA);
    this._updateMetrics(params, timeBYA);
    this._recordEntropy();
    eventBus.emit('universe:updated');
  }

  tick(dt) {
    const params = store.get('cosmicParameters');
    let timeBYA = store.get('universeState.currentTime');

    const timeStep = dt * 0.05;
    timeBYA = Math.max(0, timeBYA - timeStep);
    store.set('universeState.currentTime', timeBYA);

    this.epochManager.updateTime(timeBYA);

    this._updatePhysics(params, timeBYA);
    this._updateElements(params, timeBYA);
    this._updateMetrics(params, timeBYA);
    this._updateGalaxies(params, timeBYA);

    if (this.cosmicWeb) {
      this.cosmicWeb.applyForces(dt);
    }

    this._recordEntropy();
    eventBus.emit('universe:updated');

    if (timeBYA <= 0) {
      store.set('simulation.isComplete', true);
      store.set('simulation.isPlaying', false);
      eventBus.emit('simulation:complete');
    }
  }

  setTime(timeBYA) {
    store.set('universeState.currentTime', clamp(timeBYA, 0, 14.1));
    this.epochManager.updateTime(timeBYA);
    this._paramsChanged = true;
    this.recalculate();
  }

  reset() {
    store.set('universeState.currentTime', 14.1);
    store.set('simulation.isComplete', false);
    store.set('simulation.isPlaying', false);
    this.epochManager.reset();
    this._entropyHistory = [];
    this._paramsChanged = true;
    this._lastGalaxyCount = 0;
    this.recalculate();
  }

  _updatePhysics(params, timeBYA) {
    const scaleFactor = Physics.scaleFactor(timeBYA);
    const temperature = Physics.temperature(scaleFactor);
    const density = Physics.totalDensity(params, scaleFactor);
    const entropy = Physics.entropy(params, scaleFactor);

    store.merge('universeState', {
      scaleFactor,
      temperature: clamp(temperature, 2.725, 1e32),
      density,
      entropy,
      currentEpochIndex: this.epochManager.currentIndex,
    });
  }

  _updateElements(params, timeBYA) {
    const cosmicAge = 14.1 - timeBYA;
    const bbn = Nucleosynthesis.bigBangNucleosynthesis(params);

    if (cosmicAge < 0.01) {
      store.set('elementalDistribution', { hydrogen: 0.75, helium: 0.25, heavy: 0 });
    } else {
      const enriched = Nucleosynthesis.stellarEnrichment(bbn, cosmicAge, params);
      store.set('elementalDistribution', enriched);
    }
  }

  _updateGalaxies(params, timeBYA) {
    const cosmicAge = 14.1 - timeBYA;

    if (cosmicAge < 0.5) {
      if (this._lastGalaxyCount > 0) {
        store.set('galaxies', []);
        this.cosmicWeb = null;
        this._lastGalaxyCount = 0;
      }
      return;
    }

    const baseCount = Math.round(15 + cosmicAge * 2);
    const effectiveCount = clamp(Math.round(
      baseCount * params.gravity * (params.darkMatterDensity / 0.268) * params.starFormationRate
    ), 3, 50);

    const existing = store.get('galaxies') || [];

    // Full regeneration: first time, params changed, or count decreased
    if (existing.length === 0 || this._paramsChanged || effectiveCount < existing.length) {
      const galaxies = this.galaxyGenerator.generateCluster(params, timeBYA, baseCount);
      store.set('galaxies', galaxies);
      this.cosmicWeb = new CosmicWeb(galaxies);
      this._paramsChanged = false;
      this._lastGalaxyCount = galaxies.length;
      return;
    }

    // Same count — no regeneration needed
    if (effectiveCount === existing.length) return;

    // Incremental growth: add new galaxies while preserving existing positions
    const grown = this.galaxyGenerator.addGalaxies(existing, params, cosmicAge, effectiveCount);
    store.set('galaxies', grown);
    this.cosmicWeb = new CosmicWeb(grown);
    this._lastGalaxyCount = grown.length;
  }

  _updateMetrics(params, timeBYA) {
    const cosmicAge = 14.1 - timeBYA;
    const t = cosmicAge / 14.1;

    const baseGalaxies = 2e12;
    const galaxyFactor = params.gravity * (params.darkMatterDensity / 0.268) *
                         params.starFormationRate * params.darkEnergy;
    const totalGalaxies = baseGalaxies * galaxyFactor * Math.pow(t, 2) * (cosmicAge > 1 ? 1 : 0);

    const baseStars = 1e24;
    const totalStars = baseStars * params.starFormationRate * params.gravity *
                       Math.pow(t, 1.5) * (cosmicAge > 0.15 ? 1 : 0);

    const avgTemp = store.get('universeState.temperature');

    store.merge('metrics', {
      totalGalaxies,
      totalStars,
      avgTemperature: avgTemp,
    });
  }

  _recordEntropy() {
    const entropy = store.get('universeState.entropy');
    const time = store.get('universeState.currentTime');
    this._entropyHistory.push({ time, entropy });
    if (this._entropyHistory.length > 200) {
      this._entropyHistory.shift();
    }
    store.set('metrics.entropyHistory', [...this._entropyHistory]);
  }

  getEntropyHistory() {
    return this._entropyHistory;
  }
}
