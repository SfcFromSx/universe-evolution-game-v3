import { generateGalaxyName, resetNameGenerator } from '../data/galaxyNames.js';
import { SeededRandom } from '../utils/random.js';
import { clamp } from '../utils/math.js';

const GALAXY_TYPES = ['spiral', 'elliptical', 'irregular', 'lenticular'];
const TYPE_WEIGHTS = [0.6, 0.2, 0.12, 0.08];

export class GalaxyGenerator {
  constructor(seed = 42) {
    this.rng = new SeededRandom(seed);
  }

  generateCluster(params, timeBYA, count = 25) {
    resetNameGenerator();
    const galaxies = [];
    const cosmicAge = 14.1 - timeBYA;

    if (cosmicAge < 0.5) return galaxies;

    const effectiveCount = Math.max(1, Math.round(
      count * params.gravity * (params.darkMatterDensity / 0.268) * params.starFormationRate
    ));

    const actualCount = clamp(effectiveCount, 3, 50);

    for (let i = 0; i < actualCount; i++) {
      galaxies.push(this._generateGalaxy(params, cosmicAge, i, actualCount));
    }

    this._generateConnections(galaxies);
    return galaxies;
  }

  _generateGalaxy(params, cosmicAge, index, total) {
    const angle = (index / total) * Math.PI * 2 + this.rng.gaussian(0, 0.3);
    const radius = this.rng.range(0.15, 0.85);
    const x = 0.5 + Math.cos(angle) * radius * 0.4 + this.rng.gaussian(0, 0.05);
    const y = 0.5 + Math.sin(angle) * radius * 0.4 + this.rng.gaussian(0, 0.05);
    const z = this.rng.gaussian(0, 0.1);

    const massFactor = params.gravity * (params.darkMatterDensity / 0.268);
    const mass = Math.pow(10, this.rng.range(9, 13)) * massFactor;

    const starCountBase = mass * params.starFormationRate * 1e-2;
    const starCount = starCountBase * this.rng.range(0.5, 2.0);

    const type = this._pickType();
    const redshift = clamp(this.rng.range(0.001, 0.2) * (1 + z * 0.5), 0.001, 2);
    const metallicity = clamp(0.001 + (cosmicAge / 14.1) * 0.03 * params.starFormationRate, 0.001, 0.05);

    return {
      id: `galaxy_${index}`,
      name: generateGalaxyName(index),
      x: clamp(x, 0.05, 0.95),
      y: clamp(y, 0.05, 0.95),
      z,
      mass,
      starCount,
      type,
      redshift,
      metallicity,
      age: cosmicAge * this.rng.range(0.3, 1.0),
      connections: [],
      radius: Math.pow(mass / 1e12, 0.3) * 12 + 3,
    };
  }

  _pickType() {
    const r = this.rng.next();
    let cumulative = 0;
    for (let i = 0; i < GALAXY_TYPES.length; i++) {
      cumulative += TYPE_WEIGHTS[i];
      if (r < cumulative) return GALAXY_TYPES[i];
    }
    return GALAXY_TYPES[0];
  }

  _generateConnections(galaxies) {
    for (let i = 0; i < galaxies.length; i++) {
      const g = galaxies[i];
      const distances = galaxies
        .map((other, j) => ({
          index: j,
          dist: Math.sqrt(
            Math.pow(g.x - other.x, 2) +
            Math.pow(g.y - other.y, 2)
          ),
        }))
        .filter(d => d.index !== i)
        .sort((a, b) => a.dist - b.dist);

      const connectionCount = Math.min(
        Math.floor(this.rng.range(1, 4)),
        distances.length
      );

      for (let c = 0; c < connectionCount; c++) {
        const targetId = galaxies[distances[c].index].id;
        if (!g.connections.includes(targetId)) {
          g.connections.push(targetId);
        }
      }
    }
  }
}
