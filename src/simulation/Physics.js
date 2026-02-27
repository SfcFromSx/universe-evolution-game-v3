import { PHYSICS, CANONICAL_PARAMS } from '../data/constants.js';
import { clamp } from '../utils/math.js';

export class Physics {
  static hubbleParameter(params, scaleFactor) {
    const a = Math.max(scaleFactor, 1e-30);
    const omegaM = params.darkMatterDensity + 0.049;
    const omegaR = 9.1e-5 * params.photonDensity;
    const omegaL = 0.683 * params.darkEnergy;
    const omegaK = 1 - omegaM - omegaR - omegaL;

    const H2 = params.expansionRate * params.expansionRate * (
      omegaR / (a * a * a * a) +
      omegaM / (a * a * a) +
      omegaK / (a * a) +
      omegaL
    );

    return Math.sqrt(Math.max(0, H2));
  }

  static scaleFactor(timeBYA) {
    const t = PHYSICS.AGE_UNIVERSE - timeBYA;
    if (t <= 0) return 1e-30;
    return clamp(t / PHYSICS.AGE_UNIVERSE, 1e-30, 1);
  }

  static temperature(scaleFactor) {
    if (scaleFactor <= 0) return 1e32;
    return PHYSICS.Tcmb0 / scaleFactor;
  }

  static matterDensity(params, scaleFactor) {
    const a3 = scaleFactor * scaleFactor * scaleFactor;
    const rho0 = PHYSICS.CRITICAL_DENSITY * (params.darkMatterDensity + 0.049);
    return rho0 / Math.max(a3, 1e-90);
  }

  static radiationDensity(params, scaleFactor) {
    const a4 = Math.pow(scaleFactor, 4);
    const rho0 = PHYSICS.CRITICAL_DENSITY * 9.1e-5 * params.photonDensity;
    return rho0 / Math.max(a4, 1e-120);
  }

  static totalDensity(params, scaleFactor) {
    return this.matterDensity(params, scaleFactor) +
           this.radiationDensity(params, scaleFactor) +
           PHYSICS.CRITICAL_DENSITY * 0.683 * params.darkEnergy;
  }

  static entropy(params, scaleFactor, volume = 1) {
    const T = this.temperature(scaleFactor);
    const S = volume * Math.pow(T, 3) * params.photonDensity;
    return S;
  }

  static jeansMass(params, temperature, density) {
    const G = PHYSICS.G * params.gravity;
    if (density <= 0 || G <= 0) return Infinity;
    const cs = Math.sqrt(PHYSICS.kB * temperature / PHYSICS.mH);
    return Math.pow(cs, 3) / (6 * Math.sqrt(Math.pow(G, 3) * density / Math.PI));
  }

  static galaxyFormationRate(params, timeBYA) {
    const t = PHYSICS.AGE_UNIVERSE - timeBYA;
    if (t < 0.5) return 0;

    const peakTime = 3.0 * (2.0 - params.gravity);
    const width = 2.0;
    const rate = Math.exp(-0.5 * Math.pow((t - peakTime) / width, 2));
    const dmBoost = params.darkMatterDensity / CANONICAL_PARAMS.darkMatterDensity;
    const gravBoost = params.gravity;

    return rate * dmBoost * gravBoost * params.starFormationRate;
  }

  static starFormationRate(params, timeBYA) {
    const t = PHYSICS.AGE_UNIVERSE - timeBYA;
    if (t < 0.15) return 0;

    const peakTime = 3.5;
    const rate = Math.exp(-0.5 * Math.pow((t - peakTime) / 2.5, 2));
    return rate * params.starFormationRate * params.gravity;
  }

  static elementalDistribution(params, timeBYA) {
    const t = PHYSICS.AGE_UNIVERSE - timeBYA;
    const bbnH = 0.75 - 0.01 * (params.gravity - 1);
    const bbnHe = 0.245 + 0.005 * (params.gravity - 1);
    const bbnHeavy = 0.005;

    const enrichmentRate = params.starFormationRate * params.gravity;
    const heavyFraction = clamp(bbnHeavy + 0.005 * Math.pow(t / 14.1, 2) * enrichmentRate, 0, 0.05);
    const heFraction = clamp(bbnHe + 0.005 * (t / 14.1) * enrichmentRate, 0, 0.30);
    const hFraction = clamp(1 - heFraction - heavyFraction, 0, 1);

    return {
      hydrogen: hFraction,
      helium: heFraction,
      heavy: heavyFraction,
    };
  }

  static willUniverseCollapse(params) {
    const omegaTotal = params.darkMatterDensity + 0.049 +
                       9.1e-5 * params.photonDensity +
                       0.683 * params.darkEnergy;
    return params.darkEnergy < 0.3 && params.gravity > 1.5 && omegaTotal > 1.2;
  }

  static isLifeCompatible(params) {
    const gravOk = params.gravity > 0.8 && params.gravity < 1.3;
    const dmOk = params.darkMatterDensity > 0.2 && params.darkMatterDensity < 0.35;
    const deOk = params.darkEnergy > 0.5 && params.darkEnergy < 1.5;
    const sfrOk = params.starFormationRate > 0.5 && params.starFormationRate < 2.0;
    return gravOk && dmOk && deOk && sfrOk;
  }
}
