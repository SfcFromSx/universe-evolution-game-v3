import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';

export class Graph {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.options = {
      lineColor: options.lineColor || COLORS.accentCyan,
      fillColor: options.fillColor || rgba(COLORS.accentCyan, 0.1),
      gridColor: options.gridColor || rgba(COLORS.borderPrimary, 0.5),
      textColor: options.textColor || COLORS.textTertiary,
      lineWidth: options.lineWidth || 2,
      showGrid: options.showGrid !== false,
      showLabels: options.showLabels !== false,
      xLabel: options.xLabel || '',
      yLabel: options.yLabel || '',
      padding: options.padding || { top: 10, right: 10, bottom: 25, left: 45 },
      animate: options.animate !== false,
      ...options,
    };

    this.data = [];
    this._animatedData = [];
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const p = this.options.padding;
    const w = this.width - p.left - p.right;
    const h = this.height - p.top - p.bottom;

    ctx.clearRect(0, 0, this.width, this.height);

    if (this.data.length < 2) return;

    const xValues = this.data.map(d => d.x);
    const yValues = this.data.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues) * 0.9;
    const yMax = Math.max(...yValues) * 1.1;

    const toX = (v) => p.left + ((v - xMin) / (xMax - xMin || 1)) * w;
    const toY = (v) => p.top + h - ((v - yMin) / (yMax - yMin || 1)) * h;

    if (this.options.showGrid) {
      ctx.strokeStyle = this.options.gridColor;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = p.top + (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(p.left, y);
        ctx.lineTo(p.left + w, y);
        ctx.stroke();
      }
    }

    if (this.options.showLabels) {
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = this.options.textColor;
      ctx.textAlign = 'right';
      for (let i = 0; i <= 4; i++) {
        const val = yMin + (yMax - yMin) * (1 - i / 4);
        const y = p.top + (h / 4) * i;
        let label;
        if (val >= 1e6) label = (val / 1e6).toFixed(0) + 'M';
        else if (val >= 1e3) label = (val / 1e3).toFixed(0) + 'K';
        else label = val.toFixed(0);
        ctx.fillText(label, p.left - 6, y + 3);
      }
      ctx.textAlign = 'center';
      const xSteps = Math.min(5, this.data.length);
      for (let i = 0; i <= xSteps; i++) {
        const val = xMin + (xMax - xMin) * (i / xSteps);
        const x = toX(val);
        ctx.fillText(val.toFixed(0), x, this.height - 4);
      }
    }

    ctx.beginPath();
    ctx.moveTo(toX(this.data[0].x), toY(this.data[0].y));
    for (let i = 1; i < this.data.length; i++) {
      ctx.lineTo(toX(this.data[i].x), toY(this.data[i].y));
    }
    ctx.strokeStyle = this.options.lineColor;
    ctx.lineWidth = this.options.lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.lineTo(toX(this.data[this.data.length - 1].x), p.top + h);
    ctx.lineTo(toX(this.data[0].x), p.top + h);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, p.top, 0, p.top + h);
    gradient.addColorStop(0, rgba(COLORS.accentCyan, 0.25));
    gradient.addColorStop(1, rgba(COLORS.accentCyan, 0.02));
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  destroy() {
    window.removeEventListener('resize', this._resize);
    this.canvas.remove();
  }
}
