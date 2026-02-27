import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';
import { distance } from '../../utils/math.js';
import { formatCompact } from '../../utils/format.js';

const TYPE_COLORS = {
  spiral: '#00d4ff',
  elliptical: '#ffaa00',
  irregular: '#ff4466',
  lenticular: '#00ff88',
};

export class NodeGraph {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.galaxies = [];
    this.hoveredGalaxy = null;
    this.selectedGalaxy = null;
    this._offset = { x: 0, y: 0 };
    this._zoom = 1;
    this._time = 0;

    this._resize();
    window.addEventListener('resize', () => this._resize());
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));
    this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  setGalaxies(galaxies) {
    this.galaxies = galaxies;
  }

  _toScreen(gx, gy) {
    return {
      x: (gx * this.width * this._zoom) + this._offset.x,
      y: (gy * this.height * this._zoom) + this._offset.y,
    };
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    this.hoveredGalaxy = null;
    for (const g of this.galaxies) {
      const pos = this._toScreen(g.x, g.y);
      if (distance(mx, my, pos.x, pos.y) < g.radius + 8) {
        this.hoveredGalaxy = g;
        break;
      }
    }
    this.canvas.style.cursor = this.hoveredGalaxy ? 'pointer' : 'default';
  }

  _onClick(e) {
    if (this.hoveredGalaxy) {
      this.selectedGalaxy = this.hoveredGalaxy;
    } else {
      this.selectedGalaxy = null;
    }
  }

  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    this._zoom = Math.max(0.5, Math.min(3, this._zoom * delta));
  }

  render(dt) {
    this._time += dt;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.galaxies.length === 0) {
      ctx.fillStyle = COLORS.textTertiary;
      ctx.font = '14px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No galaxies yet — advance time to see the cosmic web form',
        this.width / 2, this.height / 2);
      return;
    }

    this._renderEdges(ctx);
    this._renderNodes(ctx);
    this._renderLabels(ctx);
    if (this.hoveredGalaxy) this._renderTooltip(ctx, this.hoveredGalaxy);
  }

  _renderEdges(ctx) {
    const galaxyMap = new Map(this.galaxies.map(g => [g.id, g]));
    const rendered = new Set();

    for (const g of this.galaxies) {
      for (const connId of g.connections) {
        const key = [g.id, connId].sort().join('-');
        if (rendered.has(key)) continue;
        rendered.add(key);

        const target = galaxyMap.get(connId);
        if (!target) continue;

        const from = this._toScreen(g.x, g.y);
        const to = this._toScreen(target.x, target.y);
        const isHighlighted = (this.hoveredGalaxy === g || this.hoveredGalaxy === target ||
                               this.selectedGalaxy === g || this.selectedGalaxy === target);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);

        const midX = (from.x + to.x) / 2 + Math.sin(this._time * 0.5) * 3;
        const midY = (from.y + to.y) / 2 + Math.cos(this._time * 0.7) * 3;
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);

        const alpha = isHighlighted ? 0.6 : 0.15;
        ctx.strokeStyle = rgba(COLORS.accentCyan, alpha);
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        if (isHighlighted) {
          ctx.save();
          ctx.shadowColor = rgba(COLORS.accentCyan, 0.3);
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
      const color = TYPE_COLORS[g.type] || COLORS.accentCyan;
      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;
      const pulse = 1 + Math.sin(this._time * 2 + g.x * 10) * 0.05;
      const r = g.radius * pulse * (isHighlighted ? 1.3 : 1);

      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 3);
      gradient.addColorStop(0, rgba(color, 0.3));
      gradient.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(pos.x - r * 3, pos.y - r * 3, r * 6, r * 6);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.8);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = rgba(color, 0.6);
      ctx.shadowBlur = isHighlighted ? 20 : 10;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
  }

  _renderLabels(ctx) {
    ctx.font = '10px "Inter", sans-serif';
    ctx.textAlign = 'center';

    for (const g of this.galaxies) {
      if (g.radius < 6 && g !== this.hoveredGalaxy && g !== this.selectedGalaxy) continue;

      const pos = this._toScreen(g.x, g.y);
      const isHighlighted = g === this.hoveredGalaxy || g === this.selectedGalaxy;

      ctx.fillStyle = isHighlighted ? COLORS.textPrimary : rgba(COLORS.textSecondary, 0.8);
      ctx.font = isHighlighted ? '11px "Inter", sans-serif' : '9px "Inter", sans-serif';
      ctx.fillText(g.name, pos.x, pos.y - g.radius - 8);

      ctx.fillStyle = rgba(COLORS.textTertiary, 0.7);
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`(Z=${g.redshift.toFixed(2)})`, pos.x, pos.y - g.radius + 2);
    }
  }

  _renderTooltip(ctx, galaxy) {
    const pos = this._toScreen(galaxy.x, galaxy.y);
    const lines = [
      galaxy.name,
      `Type: ${galaxy.type}`,
      `Mass: ${formatCompact(galaxy.mass)} M☉`,
      `Stars: ${formatCompact(galaxy.starCount)}`,
      `Redshift: ${galaxy.redshift.toFixed(3)}`,
      `Metallicity: ${(galaxy.metallicity * 100).toFixed(2)}%`,
    ];

    const padding = 10;
    const lineHeight = 16;
    const width = 160;
    const height = lines.length * lineHeight + padding * 2;
    let tx = pos.x + galaxy.radius + 15;
    let ty = pos.y - height / 2;

    if (tx + width > this.width) tx = pos.x - galaxy.radius - 15 - width;
    if (ty < 10) ty = 10;
    if (ty + height > this.height - 10) ty = this.height - 10 - height;

    ctx.fillStyle = rgba(COLORS.bgSecondary, 0.95);
    ctx.strokeStyle = COLORS.borderPrimary;
    ctx.lineWidth = 1;
    ctx.beginPath();
    this._roundRect(ctx, tx, ty, width, height, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.accentCyan;
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lines[0], tx + padding, ty + padding + 12);

    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '10px "Inter", sans-serif';
    for (let i = 1; i < lines.length; i++) {
      ctx.fillText(lines[i], tx + padding, ty + padding + 12 + i * lineHeight);
    }
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }

  destroy() {
    this.canvas.remove();
  }
}
