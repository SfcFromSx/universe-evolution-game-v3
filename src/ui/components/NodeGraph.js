import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';
import { distance } from '../../utils/math.js';
import { formatCompact } from '../../utils/format.js';
import { t } from '../../core/i18n.js';

const TYPE_COLORS = {
  spiral: '#00e5ff',
  elliptical: '#ffb020',
  irregular: '#ff5566',
  lenticular: '#00ffaa',
};

const TYPE_GLOW = {
  spiral: 'rgba(0, 229, 255, 0.6)',
  elliptical: 'rgba(255, 176, 32, 0.6)',
  irregular: 'rgba(255, 85, 102, 0.6)',
  lenticular: 'rgba(0, 255, 170, 0.6)',
};

function getPreGalaxyStages() {
  return [
    { maxAge: 0.001, label: t('stage.planck'), sub: t('stage.planck.sub') },
    { maxAge: 0.01, label: t('stage.nucleosynthesis'), sub: t('stage.nucleosynthesis.sub') },
    { maxAge: 0.38, label: t('stage.photon'), sub: t('stage.photon.sub') },
    { maxAge: 0.5, label: t('stage.darkAges'), sub: t('stage.darkAges.sub') },
  ];
}

export class NodeGraph {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';

    this.container.appendChild(this.canvas);

    this.galaxies = [];
    this.hoveredGalaxy = null;
    this.selectedGalaxy = null;
    this._offset = { x: 0, y: 0 };
    this._zoom = 1;
    this._time = 0;
    this._isActive = true;
    this._needsCenter = true;
    this._isDragging = false;
    this._dragStart = { x: 0, y: 0 };
    this._offsetStart = { x: 0, y: 0 };
    this._cosmicAge = 0;
    this._galaxyGeneration = 0;
    this._viewMode = 'filament-field';
    this._protoParticles = this._initProtoParticles();

    this._resizeHandler = () => this._resize();
    this._mouseMoveHandler = (e) => this._onMouseMove(e);
    this._mouseDownHandler = (e) => this._onMouseDown(e);
    this._mouseUpHandler = (e) => this._onMouseUp(e);
    this._clickHandler = (e) => this._onClick(e);
    this._wheelHandler = (e) => this._onWheel(e);

    window.addEventListener('resize', this._resizeHandler);
    this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
    this.canvas.addEventListener('mousedown', this._mouseDownHandler);
    window.addEventListener('mouseup', this._mouseUpHandler);
    this.canvas.addEventListener('click', this._clickHandler);
    this.canvas.addEventListener('wheel', this._wheelHandler, { passive: false });

    setTimeout(() => this._resize(), 0);
    this._setupResizeObserver();
  }

  _initProtoParticles() {
    const particles = [];
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2 + (i * 2.399);
      const r = 0.1 + (i / 80) * 0.35;
      particles.push({
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r,
        vx: Math.cos(angle + Math.PI / 2) * 0.0003,
        vy: Math.sin(angle + Math.PI / 2) * 0.0003,
        size: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    return particles;
  }

  _setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this._resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(() => this._resize());
      });
      this._resizeObserver.observe(this.container);
    }
  }

  _resize() {
    if (!this.container || !this.canvas) return;

    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.max(1, rect.width * dpr);
    this.canvas.height = Math.max(1, rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = rect.width;
    this.height = rect.height;

    if (this._needsCenter) {
      this._centerView();
    }
  }

  _centerView() {
    if (this.galaxies.length === 0 || !this.width || !this.height) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const g of this.galaxies) {
      minX = Math.min(minX, g.x);
      maxX = Math.max(maxX, g.x);
      minY = Math.min(minY, g.y);
      maxY = Math.max(maxY, g.y);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this._offset.x = this.width / 2 - centerX * this.width * this._zoom;
    this._offset.y = this.height / 2 - centerY * this.height * this._zoom;
    this._needsCenter = false;
  }

  setCosmicAge(age) {
    this._cosmicAge = age;
  }

  setGalaxies(galaxies, isNewGeneration = false) {
    const hadGalaxies = this.galaxies.length > 0;
    this.galaxies = galaxies;
    if (isNewGeneration || (!hadGalaxies && galaxies.length > 0)) {
      this._galaxyGeneration++;
      this._needsCenter = true;
      this._centerView();
    }
  }

  _toScreen(gx, gy) {
    return {
      x: (gx * this.width * this._zoom) + this._offset.x,
      y: (gy * this.height * this._zoom) + this._offset.y,
    };
  }

  _toGalaxy(sx, sy) {
    return {
      x: (sx - this._offset.x) / (this.width * this._zoom),
      y: (sy - this._offset.y) / (this.height * this._zoom),
    };
  }

  _onMouseDown(e) {
    if (e.button !== 0) return;
    this._isDragging = false;
    this._dragStart.x = e.clientX;
    this._dragStart.y = e.clientY;
    this._offsetStart.x = this._offset.x;
    this._offsetStart.y = this._offset.y;
    this._dragMoved = false;
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (e.buttons === 1 && this._dragStart) {
      const dx = e.clientX - this._dragStart.x;
      const dy = e.clientY - this._dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        this._isDragging = true;
        this._dragMoved = true;
      }
      if (this._isDragging) {
        this._offset.x = this._offsetStart.x + dx;
        this._offset.y = this._offsetStart.y + dy;
        this.canvas.style.cursor = 'grabbing';
        return;
      }
    }

    this.hoveredGalaxy = null;
    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);
      if (distance(mx, my, pos.x, pos.y) < g.radius + 8) {
        this.hoveredGalaxy = g;
        break;
      }
    }
    this.canvas.style.cursor = this.hoveredGalaxy ? 'pointer' : 'grab';
  }

  _onMouseUp() {
    this._isDragging = false;
    if (this.canvas) {
      this.canvas.style.cursor = this.hoveredGalaxy ? 'pointer' : 'grab';
    }
  }

  _onClick() {
    if (this._dragMoved) {
      this._dragMoved = false;
      return;
    }
    this.selectedGalaxy = this.hoveredGalaxy || null;
  }

  _onWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const beforeZoom = this._toGalaxy(mx, my);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this._zoom = Math.max(0.3, Math.min(5, this._zoom * delta));
    const afterZoom = this._toGalaxy(mx, my);
    this._offset.x += (afterZoom.x - beforeZoom.x) * this.width * this._zoom;
    this._offset.y += (afterZoom.y - beforeZoom.y) * this.height * this._zoom;
  }

  setViewMode(mode) {
    if (mode === 'heatmap' || mode === 'node-graph' || mode === 'filament-field') {
      this._viewMode = mode;
      return;
    }
    this._viewMode = 'filament-field';
  }

  render(dt) {
    if (!this._isActive || !this.ctx) return;

    this._time += dt || 0;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = 'rgba(5, 7, 10, 0.3)';
    ctx.fillRect(0, 0, this.width, this.height);

    this._renderGrid(ctx);

    if (this.galaxies.length === 0) {
      this._renderPreGalaxyState(ctx);
      return;
    }

    if (this._viewMode === 'heatmap') {
      this._renderHeatmap(ctx);
      return;
    }

    if (this._viewMode === 'filament-field') {
      this._renderFilamentField(ctx);
    } else {
      this._renderEdges(ctx);
      this._renderNodes(ctx);
      this._renderLabels(ctx);
    }

    if (this.hoveredGalaxy) {
      this._renderTooltip(ctx, this.hoveredGalaxy);
    }
    if (this.selectedGalaxy) {
      this._renderSelectionIndicator(ctx);
    }
  }

  // --- Pre-galaxy animated empty state ---

  _renderPreGalaxyState(ctx) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const age = this._cosmicAge;
    const time = this._time;

    // Determine stage
    const stages = getPreGalaxyStages();
    let stage = stages[stages.length - 1];
    for (const s of stages) {
      if (age < s.maxAge) { stage = s; break; }
    }

    const formationProgress = Math.min(1, Math.max(0, (age - 0.1) / 0.4));

    // Animate proto-particles
    this._updateProtoParticles(age, formationProgress);
    this._renderProtoParticles(ctx, cx, cy, age, formationProgress);

    // Central glow
    const glowR = Math.min(this.width, this.height) * (0.15 + formationProgress * 0.1);
    const pulse = 1 + Math.sin(time * 1.5) * 0.08;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * pulse);

    if (age < 0.01) {
      grad.addColorStop(0, 'rgba(255, 200, 100, 0.25)');
      grad.addColorStop(0.5, 'rgba(255, 120, 50, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (age < 0.38) {
      grad.addColorStop(0, 'rgba(255, 160, 60, 0.15)');
      grad.addColorStop(0.5, 'rgba(200, 80, 20, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      grad.addColorStop(0, 'rgba(0, 80, 180, 0.12)');
      grad.addColorStop(0.5, 'rgba(0, 40, 100, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Expanding ring for early universe
    if (age < 0.05) {
      const ringT = (time * 0.3) % 1;
      const ringR = glowR * 0.3 + ringT * glowR * 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 200, 100, ${0.3 * (1 - ringT)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Galaxy formation progress bar
    if (age >= 0.1 && age < 0.5) {
      const barW = 160;
      const barH = 4;
      const barX = cx - barW / 2;
      const barY = cy + 80;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this._roundRect(ctx, barX, barY, barW, barH, 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      this._roundRect(ctx, barX, barY, barW * formationProgress, barH, 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${t('web.galaxyFormation')}: ${Math.round(formationProgress * 100)}%`, cx, barY + 18);
    }

    // Epoch label
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stage.label, cx, cy + 50);

    ctx.fillStyle = COLORS.textTertiary;
    ctx.font = '11px "Inter", sans-serif';
    ctx.fillText(stage.sub, cx, cy + 68);

    // Cosmic age counter
    ctx.fillStyle = rgba(COLORS.accentCyan, 0.5);
    ctx.font = '10px "JetBrains Mono", monospace';
    const ageStr = age < 0.001 ? '< 1 MYA' :
      age < 1 ? `${(age * 1000).toFixed(0)} MYA` :
        `${age.toFixed(2)} BYA`;
    ctx.fillText(`${t('web.cosmicAge')}: ${ageStr}`, cx, cy + 105);
  }

  _updateProtoParticles(age, formationProgress) {
    const clusterStrength = formationProgress * 0.002;
    for (const p of this._protoParticles) {
      // Orbital drift
      p.x += p.vx;
      p.y += p.vy;

      // Gravitational pull toward center as formation progresses
      const dx = 0.5 - p.x;
      const dy = 0.5 - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.01) {
        p.vx += (dx / dist) * clusterStrength;
        p.vy += (dy / dist) * clusterStrength;
      }

      // Damping
      p.vx *= 0.998;
      p.vy *= 0.998;

      // Wrap around
      if (p.x < 0.02) p.x = 0.98;
      if (p.x > 0.98) p.x = 0.02;
      if (p.y < 0.02) p.y = 0.98;
      if (p.y > 0.98) p.y = 0.02;
    }
  }

  _renderProtoParticles(ctx, cx, cy, age, formationProgress) {
    const w = this.width;
    const h = this.height;
    const t = this._time;

    for (const p of this._protoParticles) {
      const sx = p.x * w;
      const sy = p.y * h;
      const pulse = 1 + Math.sin(t * p.speed + p.phase) * 0.4;
      const r = p.size * pulse * (0.6 + formationProgress * 0.8);

      let alpha;
      if (age < 0.01) {
        alpha = 0.15 + pulse * 0.1;
      } else if (age < 0.38) {
        alpha = 0.1 + formationProgress * 0.15;
      } else {
        alpha = 0.2 + formationProgress * 0.3;
      }

      // Particle glow
      const pg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
      if (age < 0.38) {
        pg.addColorStop(0, `rgba(255, 180, 80, ${alpha})`);
        pg.addColorStop(1, 'rgba(255, 180, 80, 0)');
      } else {
        pg.addColorStop(0, `rgba(60, 160, 255, ${alpha})`);
        pg.addColorStop(1, 'rgba(60, 160, 255, 0)');
      }
      ctx.fillStyle = pg;
      ctx.fillRect(sx - r * 4, sy - r * 4, r * 8, r * 8);

      // Particle core
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      if (age < 0.38) {
        ctx.fillStyle = `rgba(255, 220, 150, ${alpha * 1.5})`;
      } else {
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 1.5})`;
      }
      ctx.fill();
    }

    // Draw faint filament hints between close particles during late pre-galaxy
    if (formationProgress > 0.3) {
      ctx.strokeStyle = `rgba(0, 180, 255, ${formationProgress * 0.1})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < this._protoParticles.length; i++) {
        const a = this._protoParticles[i];
        for (let j = i + 1; j < this._protoParticles.length; j++) {
          const b = this._protoParticles[j];
          const d = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
          if (d < 0.08) {
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
    }
  }

  // --- Galaxy rendering ---

  _renderGrid(ctx) {
    const gridSize = Math.max(30, 60 * this._zoom);
    const offsetX = this._offset.x % gridSize;
    const offsetY = this._offset.y % gridSize;

    ctx.strokeStyle = 'rgba(30, 60, 90, 0.2)';
    ctx.lineWidth = 1;

    for (let x = offsetX; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = offsetY; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 60, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  _renderHeatmap(ctx) {
    const gridRes = 48;
    const grid = new Float64Array(gridRes * gridRes);

    for (const g of this.galaxies) {
      const gx = Math.max(0, Math.min(1, g.x));
      const gy = Math.max(0, Math.min(1, g.y));
      const weight = Math.log10(Math.max(1, (g.starCount || 1e6)));
      const ix = Math.floor(gx * gridRes) % gridRes;
      const iy = Math.floor(gy * gridRes) % gridRes;
      grid[iy * gridRes + ix] += weight;
      const spread = 1;
      for (let dy = -spread; dy <= spread; dy++) {
        for (let dx = -spread; dx <= spread; dx++) {
          const nx = ix + dx;
          const ny = iy + dy;
          if (nx >= 0 && nx < gridRes && ny >= 0 && ny < gridRes && (dx !== 0 || dy !== 0)) {
            const falloff = 1 / (1 + Math.sqrt(dx * dx + dy * dy));
            grid[ny * gridRes + nx] += weight * falloff * 0.4;
          }
        }
      }
    }

    let maxVal = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] > maxVal) maxVal = grid[i];
    }
    if (maxVal <= 0) maxVal = 1;

    const cellW = (this.width * this._zoom) / gridRes;
    const cellH = (this.height * this._zoom) / gridRes;

    for (let iy = 0; iy < gridRes; iy++) {
      for (let ix = 0; ix < gridRes; ix++) {
        const val = grid[iy * gridRes + ix];
        if (val <= 0) continue;
        const t = Math.min(1, val / maxVal);
        const pos = this._toScreen(ix / gridRes, iy / gridRes);
        const next = this._toScreen((ix + 1) / gridRes, (iy + 1) / gridRes);
        const w = Math.ceil(next.x - pos.x) + 1;
        const h = Math.ceil(next.y - pos.y) + 1;
        if (w < 1 || h < 1) continue;
        let r, g, b, a;
        if (t < 0.25) {
          const s = t / 0.25;
          r = 5 + s * 15;
          g = 20 + s * 60;
          b = 50 + s * 120;
          a = 0.4 + s * 0.5;
        } else if (t < 0.55) {
          const s = (t - 0.25) / 0.3;
          r = 20 + s * 0;
          g = 80 + s * 149;
          b = 170 + s * 85;
          a = 0.9;
        } else if (t < 0.85) {
          const s = (t - 0.55) / 0.3;
          r = 20 + s * 220;
          g = 229 + s * 26;
          b = 255 + s * (-255);
          a = 0.95;
        } else {
          const s = (t - 0.85) / 0.15;
          r = 240 + s * 15;
          g = 255;
          b = 0 + s * 255;
          a = 0.95;
        }
        ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
        ctx.fillRect(Math.floor(pos.x), Math.floor(pos.y), w, h);
      }
    }
  }

  _renderFilamentField(ctx) {
    const center = this._getWeightedScreenCenter();
    this._renderFilamentBackdrop(ctx, center);
    const field = this._computeSectorField(center, 18, 4);
    this._renderSectorField(ctx, center, field);
    this._renderFilamentStreams(ctx);
    this._renderFilamentHubs(ctx);
    this._renderFilamentLabels(ctx);
  }

  _getWeightedScreenCenter() {
    if (this.galaxies.length === 0) {
      return { x: this.width / 2, y: this.height / 2 };
    }

    let x = 0;
    let y = 0;
    let total = 0;
    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);
      const weight = Math.max(0.1, Math.log10(Math.max(10, g.mass)));
      x += pos.x * weight;
      y += pos.y * weight;
      total += weight;
    }

    if (total <= 0) {
      return { x: this.width / 2, y: this.height / 2 };
    }
    return { x: x / total, y: y / total };
  }

  _renderFilamentBackdrop(ctx, center) {
    const maxRadius = Math.max(80, Math.min(this.width, this.height) * 0.48);

    const radial = ctx.createRadialGradient(
      center.x,
      center.y,
      maxRadius * 0.1,
      center.x,
      center.y,
      maxRadius
    );
    radial.addColorStop(0, 'rgba(14, 34, 58, 0.40)');
    radial.addColorStop(0.55, 'rgba(8, 20, 36, 0.22)');
    radial.addColorStop(1, 'rgba(2, 7, 14, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, this.width, this.height);

    const ringCount = 4;
    for (let i = 1; i <= ringCount; i++) {
      const ringT = i / ringCount;
      const pulse = 1 + Math.sin(this._time * 0.6 + i) * 0.015;
      ctx.beginPath();
      ctx.arc(center.x, center.y, maxRadius * ringT * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(85, 190, 255, ${0.08 - ringT * 0.012})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const spokeCount = 18;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2 + this._time * 0.01;
      const x2 = center.x + Math.cos(a) * maxRadius;
      const y2 = center.y + Math.sin(a) * maxRadius;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(90, 165, 220, 0.035)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _computeSectorField(center, sectorCount, ringCount) {
    const maxRadius = Math.max(80, Math.min(this.width, this.height) * 0.48);
    const values = new Float64Array(sectorCount * ringCount);

    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);
      const dx = pos.x - center.x;
      const dy = pos.y - center.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius * 1.05) continue;

      const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
      const sector = Math.min(sectorCount - 1, Math.floor((angle / (Math.PI * 2)) * sectorCount));
      const ring = Math.min(ringCount - 1, Math.floor((dist / maxRadius) * ringCount));
      const weight = Math.log10(Math.max(10, g.starCount || 10));
      const coreIndex = ring * sectorCount + sector;

      values[coreIndex] += weight;
      values[ring * sectorCount + ((sector - 1 + sectorCount) % sectorCount)] += weight * 0.14;
      values[ring * sectorCount + ((sector + 1) % sectorCount)] += weight * 0.14;
    }

    let maxValue = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > maxValue) maxValue = values[i];
    }

    return {
      values,
      maxValue: maxValue || 1,
      sectorCount,
      ringCount,
      maxRadius,
    };
  }

  _renderSectorField(ctx, center, field) {
    const { values, maxValue, sectorCount, ringCount, maxRadius } = field;
    const gap = (Math.PI * 2) / sectorCount * 0.12;

    for (let ring = 0; ring < ringCount; ring++) {
      const innerR = (ring / ringCount) * maxRadius;
      const outerR = ((ring + 1) / ringCount) * maxRadius;

      for (let sector = 0; sector < sectorCount; sector++) {
        const idx = ring * sectorCount + sector;
        const value = values[idx];
        if (value <= 0) continue;

        const intensity = Math.min(1, value / maxValue);
        const start = (sector / sectorCount) * Math.PI * 2 + gap * 0.5;
        const end = ((sector + 1) / sectorCount) * Math.PI * 2 - gap * 0.5;
        if (end <= start) continue;

        const hue = 188 - intensity * 30;
        const lightness = 32 + intensity * 28;
        const alpha = 0.05 + intensity * 0.33;
        ctx.fillStyle = `hsla(${hue}, 92%, ${lightness}%, ${alpha})`;

        ctx.beginPath();
        ctx.moveTo(center.x + Math.cos(start) * innerR, center.y + Math.sin(start) * innerR);
        ctx.arc(center.x, center.y, outerR, start, end);
        ctx.lineTo(center.x + Math.cos(end) * innerR, center.y + Math.sin(end) * innerR);
        ctx.arc(center.x, center.y, innerR, end, start, true);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  _traceFilamentPath(ctx, from, to, key) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / dist;
    const ny = dx / dist;
    const hash = this._hashString(key);
    const bendSeed = ((hash % 13) - 6) / 6;
    const bend = Math.min(60, dist * 0.24) * bendSeed;
    const sway = Math.sin(this._time * 0.7 + hash * 0.001) * 6;
    const ctrlX = (from.x + to.x) / 2 + nx * (bend + sway);
    const ctrlY = (from.y + to.y) / 2 + ny * (bend + sway);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(ctrlX, ctrlY, to.x, to.y);
  }

  _renderFilamentStreams(ctx) {
    const galaxyMap = new Map(this.galaxies.map(g => [g.id, g]));
    const rendered = new Set();

    for (const g of this.galaxies) {
      if (!g.connections || g.connections.length === 0) continue;

      for (const connId of g.connections) {
        const key = [g.id, connId].sort().join('-');
        if (rendered.has(key)) continue;
        rendered.add(key);

        const target = galaxyMap.get(connId);
        if (!target) continue;

        const from = this._toScreen(g.x, g.y);
        const to = this._toScreen(target.x, target.y);
        if ((from.x < -60 && to.x < -60) ||
          (from.x > this.width + 60 && to.x > this.width + 60) ||
          (from.y < -60 && to.y < -60) ||
          (from.y > this.height + 60 && to.y > this.height + 60)) {
          continue;
        }

        const isHighlighted = this.hoveredGalaxy === g || this.hoveredGalaxy === target ||
          this.selectedGalaxy === g || this.selectedGalaxy === target;
        const massScale = Math.log10(Math.max(10, g.mass + target.mass)) / 13;
        const strength = Math.max(0.2, Math.min(1, massScale));

        this._traceFilamentPath(ctx, from, to, key);
        ctx.strokeStyle = `rgba(70, 120, 200, ${0.10 + strength * 0.18})`;
        ctx.lineWidth = (isHighlighted ? 5 : 3) + strength * 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        this._traceFilamentPath(ctx, from, to, key);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(160, 240, 255, 0.95)'
          : `rgba(125, 220, 255, ${0.28 + strength * 0.42})`;
        ctx.lineWidth = (isHighlighted ? 2.4 : 1.1) + strength * 1.5;
        ctx.stroke();

        this._traceFilamentPath(ctx, from, to, key);
        ctx.save();
        ctx.setLineDash([10, 14]);
        ctx.lineDashOffset = -((this._time * 95) + (this._hashString(key) % 40));
        ctx.strokeStyle = isHighlighted
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(200, 245, 255, 0.55)';
        ctx.lineWidth = isHighlighted ? 1.8 : 1;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _renderFilamentHubs(ctx) {
    let maxMass = 1;
    for (const g of this.galaxies) {
      const v = Math.log10(Math.max(10, g.mass));
      if (v > maxMass) maxMass = v;
    }

    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);
      if (pos.x < -60 || pos.x > this.width + 60 || pos.y < -60 || pos.y > this.height + 60) {
        continue;
      }

      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;
      const color = TYPE_COLORS[g.type] || COLORS.accentCyan;
      const glow = TYPE_GLOW[g.type] || TYPE_GLOW.spiral;
      const massT = Math.log10(Math.max(10, g.mass)) / maxMass;
      const pulse = 1 + Math.sin(this._time * 2.1 + g.x * 8 + g.y * 10) * 0.08;
      const radius = (3 + massT * 7) * pulse * (isHighlighted ? 1.25 : 1);

      const halo = ctx.createRadialGradient(pos.x, pos.y, radius * 0.5, pos.x, pos.y, radius * 3.5);
      halo.addColorStop(0, rgba(color, 0.35));
      halo.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(pos.x - radius * 3.5, pos.y - radius * 3.5, radius * 7, radius * 7);

      if (isHighlighted) {
        ctx.save();
        ctx.shadowColor = glow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.22);
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.9);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  _renderFilamentLabels(ctx) {
    const candidates = [...this.galaxies]
      .sort((a, b) => b.mass - a.mass)
      .slice(0, 4);
    if (this.hoveredGalaxy && !candidates.includes(this.hoveredGalaxy)) {
      candidates.push(this.hoveredGalaxy);
    }
    if (this.selectedGalaxy && !candidates.includes(this.selectedGalaxy)) {
      candidates.push(this.selectedGalaxy);
    }

    for (const g of candidates) {
      const pos = this._toScreen(g.x, g.y);
      if (pos.x < 0 || pos.x > this.width || pos.y < 0 || pos.y > this.height) {
        continue;
      }

      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;
      ctx.fillStyle = isHighlighted ? COLORS.textPrimary : rgba(COLORS.textSecondary, 0.92);
      ctx.font = isHighlighted ? 'bold 12px "Space Grotesk", sans-serif' : '10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.name, pos.x, pos.y - 12);
    }
  }

  _renderEdges(ctx) {
    const galaxyMap = new Map(this.galaxies.map(g => [g.id, g]));
    const rendered = new Set();

    for (const g of this.galaxies) {
      if (!g.connections || g.connections.length === 0) continue;

      for (const connId of g.connections) {
        const key = [g.id, connId].sort().join('-');
        if (rendered.has(key)) continue;
        rendered.add(key);

        const target = galaxyMap.get(connId);
        if (!target) continue;

        const from = this._toScreen(g.x, g.y);
        const to = this._toScreen(target.x, target.y);

        if ((from.x < -50 && to.x < -50) ||
          (from.x > this.width + 50 && to.x > this.width + 50) ||
          (from.y < -50 && to.y < -50) ||
          (from.y > this.height + 50 && to.y > this.height + 50)) {
          continue;
        }

        const isHighlighted = (this.hoveredGalaxy === g || this.hoveredGalaxy === target ||
          this.selectedGalaxy === g || this.selectedGalaxy === target);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        const midX = (from.x + to.x) / 2 + Math.sin(this._time * 0.5 + g.x * 5) * 8;
        const midY = (from.y + to.y) / 2 + Math.cos(this._time * 0.7 + g.y * 5) * 8;
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);

        const alpha = isHighlighted ? 0.6 : 0.2;
        const lineWidth = isHighlighted ? 2.5 : 1;

        if (isHighlighted) {
          ctx.save();
          ctx.shadowColor = rgba(COLORS.accentCyan, 0.5);
          ctx.shadowBlur = 12;
          ctx.strokeStyle = rgba(COLORS.accentCyan, 0.3);
          ctx.lineWidth = lineWidth + 6;
          ctx.stroke();
          ctx.restore();
        }

        ctx.strokeStyle = rgba(COLORS.accentCyan, alpha);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (isHighlighted) {
          const flowOffset = (this._time * 80) % 40;
          ctx.save();
          ctx.setLineDash([6, 14]);
          ctx.lineDashOffset = -flowOffset;
          ctx.strokeStyle = rgba(COLORS.accentCyan, 0.9);
          ctx.lineWidth = 2;
          ctx.shadowColor = COLORS.accentCyan;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  _renderNodes(ctx) {
    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);

      if (pos.x < -50 || pos.x > this.width + 50 ||
        pos.y < -50 || pos.y > this.height + 50) {
        continue;
      }

      const color = TYPE_COLORS[g.type] || COLORS.accentCyan;
      const glowColor = TYPE_GLOW[g.type] || TYPE_GLOW.spiral;
      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;
      const pulse = 1 + Math.sin(this._time * 2 + g.x * 10) * 0.06;
      const r = Math.max(4, g.radius * pulse * (isHighlighted ? 1.3 : 1));

      const outerGradient = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r * 3);
      outerGradient.addColorStop(0, rgba(color, 0.3));
      outerGradient.addColorStop(0.5, rgba(color, 0.1));
      outerGradient.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = outerGradient;
      ctx.fillRect(pos.x - r * 3, pos.y - r * 3, r * 6, r * 6);

      if (isHighlighted) {
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.3);
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.9);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isHighlighted ? 20 : 10;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      if (isHighlighted) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.5);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  _renderLabels(ctx) {
    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);

      if (pos.x < 0 || pos.x > this.width ||
        pos.y < 0 || pos.y > this.height) {
        continue;
      }

      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;
      const r = g.radius;

      if (r < 6 && !isHighlighted) continue;

      ctx.fillStyle = isHighlighted ? COLORS.textPrimary : rgba(COLORS.textSecondary, 0.9);
      ctx.font = isHighlighted ?
        `bold ${Math.max(11, 12 * this._zoom)}px "Space Grotesk", sans-serif` :
        `${Math.max(9, 10 * this._zoom)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';

      const labelY = pos.y - r - 10;
      ctx.fillText(g.name, pos.x, labelY);

      ctx.fillStyle = rgba(COLORS.textTertiary, 0.8);
      ctx.font = `${Math.max(8, 9 * this._zoom)}px "JetBrains Mono", monospace`;
      const typeLabel = g.type.charAt(0).toUpperCase() + g.type.slice(1);
      ctx.fillText(`${typeLabel} Z=${g.redshift.toFixed(2)}`, pos.x, labelY + 12);

      if (isHighlighted) {
        ctx.fillStyle = rgba(COLORS.accentCyan, 0.9);
        ctx.font = `${Math.max(8, 9 * this._zoom)}px "JetBrains Mono", monospace`;
        ctx.fillText(`${formatCompact(g.starCount)} ${t('galaxy.starsUnit')}`, pos.x, pos.y + r + 12);
      }
    }
  }

  _renderTooltip(ctx, galaxy) {
    const pos = this._toScreen(galaxy.x, galaxy.y);
    const color = TYPE_COLORS[galaxy.type] || COLORS.accentCyan;

    const lines = [
      galaxy.name,
      `${galaxy.type.charAt(0).toUpperCase() + galaxy.type.slice(1)} ${t('galaxy.type')}`,
      `${t('galaxy.mass')}: ${formatCompact(galaxy.mass)} M☉`,
      `${t('galaxy.stars')}: ${formatCompact(galaxy.starCount)}`,
      `${t('galaxy.redshift')}: ${galaxy.redshift.toFixed(3)}`,
    ];

    const padding = 12;
    const lineHeight = 16;
    const width = 160;
    const height = lines.length * lineHeight + padding * 2;

    let tx = pos.x + galaxy.radius + 15;
    let ty = pos.y - height / 2;

    if (tx + width > this.width) tx = pos.x - galaxy.radius - 15 - width;
    if (ty < 10) ty = 10;
    if (ty + height > this.height - 10) ty = this.height - 10 - height;

    ctx.save();
    ctx.shadowColor = rgba(color, 0.3);
    ctx.shadowBlur = 15;
    ctx.fillStyle = rgba(COLORS.bgSecondary, 0.95);
    this._roundRect(ctx, tx, ty, width, height, 10);
    ctx.fill();
    ctx.strokeStyle = rgba(color, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = color;
    ctx.fillRect(tx, ty, 3, height);

    ctx.fillStyle = color;
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lines[0], tx + padding + 4, ty + padding + 12);

    ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + padding, ty + padding + 16);
    ctx.lineTo(tx + width - padding, ty + padding + 16);
    ctx.stroke();

    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '10px "Inter", sans-serif';
    for (let i = 1; i < lines.length; i++) {
      ctx.fillText(lines[i], tx + padding + 4, ty + padding + 12 + i * lineHeight);
    }
  }

  _renderSelectionIndicator(ctx) {
    if (!this.selectedGalaxy) return;

    const pos = this._toScreen(this.selectedGalaxy.x, this.selectedGalaxy.y);
    const r = this.selectedGalaxy.radius * 2;
    const pulse = 1 + Math.sin(this._time * 3) * 0.1;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -this._time * 20;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  show() {
    if (this.canvas) this.canvas.style.display = 'block';
  }

  hide() {
    if (this.canvas) this.canvas.style.display = 'none';
  }

  destroy() {
    this._isActive = false;

    window.removeEventListener('resize', this._resizeHandler);
    window.removeEventListener('mouseup', this._mouseUpHandler);

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
      this.canvas.removeEventListener('mousedown', this._mouseDownHandler);
      this.canvas.removeEventListener('click', this._clickHandler);
      this.canvas.removeEventListener('wheel', this._wheelHandler);
      this.canvas.remove();
      this.canvas = null;
    }

    this.container = null;
    this.ctx = null;
  }
}
