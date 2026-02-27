import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';

export class RadarChart {
  constructor(container, options = {}) {
    this.container = container;
    this.size = options.size || 120;
    this.data = options.data || [];

    this.canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = this.size + 'px';
    this.canvas.style.height = this.size + 'px';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);

    this.container.appendChild(this.canvas);
    this.render();
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const cx = this.size / 2;
    const cy = this.size / 2;
    const radius = (this.size / 2) - 20;

    ctx.clearRect(0, 0, this.size, this.size);

    // Draw background web (concentric polygons)
    const levels = 4;
    ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.3);
    ctx.lineWidth = 1;

    for (let level = 1; level <= levels; level++) {
      const r = (radius * level) / levels;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.2);
      ctx.stroke();
    }

    // Draw data polygon
    if (this.data.length >= 3) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
        const value = this.data[i]?.value || 0;
        const r = radius * value;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, rgba(COLORS.accentCyan, 0.1));
      gradient.addColorStop(0.5, rgba(COLORS.accentCyan, 0.2));
      gradient.addColorStop(1, rgba(COLORS.accentCyan, 0.05));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke line
      ctx.strokeStyle = COLORS.accentCyan;
      ctx.lineWidth = 2;
      ctx.shadowColor = COLORS.accentCyan;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw data points
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
        const item = this.data[i];
        const value = item?.value || 0;
        const r = radius * value;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(item.color, 0.3);
        ctx.fill();

        // Inner dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label at vertex
        const labelAngle = angle;
        const labelR = radius + 15;
        const lx = cx + Math.cos(labelAngle) * labelR;
        const ly = cy + Math.sin(labelAngle) * labelR;

        ctx.fillStyle = item.color;
        ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label || '', lx, ly);
      }
    }

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.accentCyan;
    ctx.fill();
  }

  destroy() {
    this.canvas.remove();
  }
}
