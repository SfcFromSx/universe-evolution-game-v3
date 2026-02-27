import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';

export class DonutChart {
  constructor(container, options = {}) {
    this.container = container;
    this.size = options.size || 120;
    this.lineWidth = options.lineWidth || 16;
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
    const radius = (this.size - this.lineWidth) / 2 - 4;

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.3);
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();

    let startAngle = -Math.PI / 2;
    for (const segment of this.data) {
      const sweepAngle = segment.value * Math.PI * 2;
      if (sweepAngle < 0.001) continue;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.save();
      ctx.shadowColor = rgba(segment.color, 0.3);
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      startAngle += sweepAngle;
    }

    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '600 10px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';

    const innerData = this.data.filter(d => d.innerLabel);
    if (innerData.length > 0) {
      const labelRadius = radius * 0.55;
      let angle = -Math.PI / 2;
      for (const segment of this.data) {
        const sweep = segment.value * Math.PI * 2;
        if (segment.innerLabel && sweep > 0.15) {
          const midAngle = angle + sweep / 2;
          const lx = cx + Math.cos(midAngle) * labelRadius;
          const ly = cy + Math.sin(midAngle) * labelRadius;
          ctx.fillStyle = segment.color;
          ctx.font = 'bold 14px "Space Grotesk", sans-serif';
          ctx.fillText(segment.innerLabel, lx, ly + 5);
        }
        angle += sweep;
      }
    }
  }

  destroy() {
    this.canvas.remove();
  }
}
