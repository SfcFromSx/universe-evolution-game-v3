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
      fillColor: options.fillColor || rgba(COLORS.accentCyan, 0.15),
      gridColor: options.gridColor || rgba(COLORS.borderPrimary, 0.4),
      textColor: options.textColor || COLORS.textTertiary,
      lineWidth: options.lineWidth || 2.5,
      showGrid: options.showGrid !== false,
      showLabels: options.showLabels !== false,
      xLabel: options.xLabel || '',
      yLabel: options.yLabel || '',
      padding: options.padding || { top: 15, right: 15, bottom: 30, left: 50 },
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

    // Draw grid lines
    if (this.options.showGrid) {
      ctx.strokeStyle = this.options.gridColor;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);

      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = p.top + (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(p.left, y);
        ctx.lineTo(p.left + w, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= 4; i++) {
        const x = p.left + (w / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, p.top);
        ctx.lineTo(x, p.top + h);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Draw axis lines
    ctx.strokeStyle = rgba(COLORS.textTertiary, 0.6);
    ctx.lineWidth = 1;

    // X axis
    ctx.beginPath();
    ctx.moveTo(p.left, p.top + h);
    ctx.lineTo(p.left + w, p.top + h);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(p.left, p.top);
    ctx.lineTo(p.left, p.top + h);
    ctx.stroke();

    // Draw labels
    if (this.options.showLabels) {
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = this.options.textColor;
      ctx.textAlign = 'right';

      // Y-axis labels
      for (let i = 0; i <= 4; i++) {
        const val = yMin + (yMax - yMin) * (1 - i / 4);
        const y = p.top + (h / 4) * i;
        let label;
        if (val >= 1e6) label = (val / 1e6).toFixed(0) + 'M';
        else if (val >= 1e3) label = (val / 1e3).toFixed(0) + 'K';
        else label = val.toFixed(0);
        ctx.fillText(label, p.left - 8, y + 3);
      }

      // X-axis labels
      ctx.textAlign = 'center';
      const xSteps = Math.min(5, this.data.length);
      for (let i = 0; i <= xSteps; i++) {
        const val = xMin + (xMax - xMin) * (i / xSteps);
        const x = toX(val);
        ctx.fillText(val.toFixed(0), x, this.height - 8);
      }
    }

    // Draw area fill with gradient
    const gradient = ctx.createLinearGradient(0, p.top, 0, p.top + h);
    gradient.addColorStop(0, rgba(this.options.lineColor, 0.3));
    gradient.addColorStop(0.5, rgba(this.options.lineColor, 0.1));
    gradient.addColorStop(1, rgba(this.options.lineColor, 0.02));

    ctx.beginPath();
    ctx.moveTo(toX(this.data[0].x), toY(this.data[0].y));
    for (let i = 1; i < this.data.length; i++) {
      // Smooth curve using quadratic bezier
      const prev = this.data[i - 1];
      const curr = this.data[i];
      const prevX = toX(prev.x);
      const prevY = toY(prev.y);
      const currX = toX(curr.x);
      const currY = toY(curr.y);
      const cpX = (prevX + currX) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + currY) / 2);
    }
    ctx.lineTo(toX(this.data[this.data.length - 1].x), toY(this.data[this.data.length - 1].y));
    ctx.lineTo(toX(this.data[this.data.length - 1].x), p.top + h);
    ctx.lineTo(toX(this.data[0].x), p.top + h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line with glow
    ctx.save();
    ctx.shadowColor = rgba(this.options.lineColor, 0.5);
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(toX(this.data[0].x), toY(this.data[0].y));
    for (let i = 1; i < this.data.length; i++) {
      const prev = this.data[i - 1];
      const curr = this.data[i];
      const prevX = toX(prev.x);
      const prevY = toY(prev.y);
      const currX = toX(curr.x);
      const currY = toY(curr.y);
      const cpX = (prevX + currX) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, (prevY + currY) / 2);
    }
    ctx.lineTo(toX(this.data[this.data.length - 1].x), toY(this.data[this.data.length - 1].y));
    ctx.strokeStyle = this.options.lineColor;
    ctx.lineWidth = this.options.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Draw data points
    for (let i = 0; i < this.data.length; i += Math.ceil(this.data.length / 15)) {
      const x = toX(this.data[i].x);
      const y = toY(this.data[i].y);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = this.options.lineColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.bgPrimary;
      ctx.fill();
    }

    // Draw axis labels
    if (this.options.yLabel) {
      ctx.save();
      ctx.translate(12, this.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.fillStyle = COLORS.textTertiary;
      ctx.textAlign = 'center';
      ctx.fillText(this.options.yLabel, 0, 0);
      ctx.restore();
    }

    if (this.options.xLabel) {
      ctx.font = '10px "Space Grotesk", sans-serif';
      ctx.fillStyle = COLORS.textTertiary;
      ctx.textAlign = 'right';
      ctx.fillText(this.options.xLabel, this.width - p.right, this.height - 8);
    }
  }

  destroy() {
    window.removeEventListener('resize', this._resize);
    this.canvas.remove();
  }
}
