import { clamp } from '../utils/math.js';

export class Nucleosynthesis {
  static bigBangNucleosynthesis(params) {
    const baryonDensityFactor = 1 + (params.gravity - 1) * 0.2;
    const expansionFactor = params.expansionRate / 73.2;

    let hydrogen = 0.75;
    let helium4 = 0.245;
    let deuterium = 0.003;
    let helium3 = 0.001;
    let lithium = 0.0000001;

    helium4 *= baryonDensityFactor;
    hydrogen = 1 - helium4 - deuterium - helium3 - lithium;

    if (expansionFactor > 1.2) {
      helium4 *= 0.9;
      hydrogen = 1 - helium4 - deuterium - helium3 - lithium;
    }

    return {
      hydrogen: clamp(hydrogen, 0.6, 0.85),
      helium: clamp(helium4 + helium3, 0.15, 0.35),
      heavy: clamp(deuterium + lithium, 0.001, 0.01),
    };
  }

  static stellarEnrichment(bbnRatios, cosmicAge, params) {
    const metalYield = 0.02 * params.starFormationRate * params.gravity;
    const timeFraction = Math.pow(cosmicAge / 14.1, 1.5);
    const heavyProduced = metalYield * timeFraction;

    return {
      hydrogen: clamp(bbnRatios.hydrogen - heavyProduced * 0.7, 0.5, 0.85),
      helium: clamp(bbnRatios.helium - heavyProduced * 0.3 + 0.005 * timeFraction, 0.15, 0.35),
      heavy: clamp(bbnRatios.heavy + heavyProduced, 0.001, 0.05),
    };
  }
}
