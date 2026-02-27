import { SeededRandom } from '../utils/random.js';

export class CosmicWeb {
  constructor(galaxies) {
    this.galaxies = galaxies;
    this.filaments = [];
    this.voids = [];
    this._buildStructure();
  }

  _buildStructure() {
    this.filaments = [];

    const galaxyMap = new Map();
    for (const g of this.galaxies) {
      galaxyMap.set(g.id, g);
    }

    const seen = new Set();
    for (const g of this.galaxies) {
      for (const connId of g.connections) {
        const key = [g.id, connId].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);

        const target = galaxyMap.get(connId);
        if (!target) continue;

        this.filaments.push({
          from: g,
          to: target,
          strength: this._filamentStrength(g, target),
        });
      }
    }
  }

  _filamentStrength(a, b) {
    const dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    const massFactor = Math.log10(a.mass + b.mass) / 24;
    return Math.max(0.1, 1 - dist) * massFactor;
  }

  getClusterCenter() {
    if (this.galaxies.length === 0) return { x: 0.5, y: 0.5 };
    let cx = 0, cy = 0, totalMass = 0;
    for (const g of this.galaxies) {
      cx += g.x * g.mass;
      cy += g.y * g.mass;
      totalMass += g.mass;
    }
    return { x: cx / totalMass, y: cy / totalMass };
  }

  applyForces(dt) {
    const repulsionStrength = 0.0005;
    const attractionStrength = 0.0001;
    const damping = 0.95;

    for (const g of this.galaxies) {
      if (!g.vx) g.vx = 0;
      if (!g.vy) g.vy = 0;

      for (const other of this.galaxies) {
        if (g === other) continue;
        const dx = g.x - other.x;
        const dy = g.y - other.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
        const force = repulsionStrength / (dist * dist);
        g.vx += (dx / dist) * force;
        g.vy += (dy / dist) * force;
      }

      const galaxyMap = new Map(this.galaxies.map(g => [g.id, g]));
      for (const connId of g.connections) {
        const target = galaxyMap.get(connId);
        if (!target) continue;
        const dx = target.x - g.x;
        const dy = target.y - g.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idealDist = 0.15;
        const force = (dist - idealDist) * attractionStrength;
        g.vx += (dx / dist) * force;
        g.vy += (dy / dist) * force;
      }

      g.vx *= damping;
      g.vy *= damping;
      g.x += g.vx;
      g.y += g.vy;
      g.x = Math.max(0.05, Math.min(0.95, g.x));
      g.y = Math.max(0.05, Math.min(0.95, g.y));
    }
  }
}
