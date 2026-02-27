import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';

export class DonutChart {
  constructor(container, options = {}) {
    this.container = container;
    this.size = options.size || 130;
    this.lineWidth = options.lineWidth || 18;
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
    const radius = (this.size - this.lineWidth) / 2 - 6;

    ctx.clearRect(0, 0, this.size, this.size);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + this.lineWidth / 2 + 3, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.2);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Background track with gradient
    const bgGradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    bgGradient.addColorStop(0, rgba(COLORS.borderPrimary, 0.3));
    bgGradient.addColorStop(1, rgba(COLORS.borderPrimary, 0.1));

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = bgGradient;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();

    // Data segments
    let startAngle = -Math.PI / 2;
    for (const segment of this.data) {
      const sweepAngle = segment.value * Math.PI * 2;
      if (sweepAngle < 0.001) continue;

      // Glow effect
      ctx.save();
      ctx.shadowColor = rgba(segment.color, 0.4);
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweepAngle);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();

      // Bright inner edge
      ctx.save();
      ctx.shadowColor = rgba(segment.color, 0.8);
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + 0.05, startAngle + sweepAngle - 0.05);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = this.lineWidth * 0.6;
      ctx.stroke();
      ctx.restore();

      startAngle += sweepAngle;
    }

    // Center info
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = '600 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';

    // Draw inner labels for segments that are large enough
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

          // Label background
          ctx.font = 'bold 14px "Space Grotesk", sans-serif';
          const textWidth = ctx.measureText(segment.innerLabel).width;
          ctx.fillStyle = rgba(COLORS.bgPrimary, 0.8);
          ctx.beginPath();
          ctx.arc(lx, ly, 12, 0, Math.PI * 2);
          ctx.fill();

          // Label text
          ctx.fillStyle = segment.color;
          ctx.fillText(segment.innerLabel, lx, ly + 5);
        }
        angle += sweep;
      }
    }

    // Center label if no inner labels
    if (innerData.length === 0) {
      ctx.fillStyle = COLORS.textSecondary;
      ctx.font = '12px "Space Grotesk", sans-serif';
      ctx.fillText('Elements', cx, cy - 5);
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = COLORS.accentCyan;
      ctx.fillText('H/He', cx, cy + 15);
    }
  }

  destroy() {
    this.canvas.remove();
  }
}
