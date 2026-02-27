import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';
import { clamp } from '../../utils/math.js';

export class Gauge {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      size: options.size || 100,
      min: options.min || 0,
      max: options.max || 2,
      value: options.value || 1,
      label: options.label || '',
      sublabel: options.sublabel || '',
      unit: options.unit || '',
      color: options.color || COLORS.accentCyan,
      arcStart: options.arcStart || Math.PI * 0.8,
      arcEnd: options.arcEnd || Math.PI * 2.2,
      lineWidth: options.lineWidth || 8,
      onChange: options.onChange || null,
    };

    this._value = this.options.value;
    this._displayValue = this._value;
    this._dragging = false;
    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'gauge-container';
    this.el.style.width = this.options.size + 'px';

    this.canvas = document.createElement('canvas');
    const size = this.options.size;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.canvas.className = 'gauge-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(dpr, dpr);

    this.overlay = document.createElement('div');
    this.overlay.className = 'gauge-value-overlay';
    this.valueEl = document.createElement('div');
    this.valueEl.className = 'gauge-value-number';
    this.unitEl = document.createElement('span');
    this.unitEl.className = 'gauge-value-unit';
    this.unitEl.textContent = this.options.unit;
    this.overlay.appendChild(this.valueEl);
    this.overlay.appendChild(this.unitEl);

    // Add sublabel if provided
    if (this.options.sublabel) {
      this.sublabelEl = document.createElement('div');
      this.sublabelEl.className = 'gauge-sublabel';
      this.sublabelEl.textContent = this.options.sublabel;
      this.el.appendChild(this.sublabelEl);
    }

    this.el.appendChild(this.canvas);
    this.el.appendChild(this.overlay);
    this.container.appendChild(this.el);

    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('mouseup', () => this._onMouseUp());

    this.render();
  }

  _onMouseDown(e) {
    this._dragging = true;
    this._updateFromMouse(e);
    this.canvas.style.cursor = 'grabbing';
  }

  _onMouseMove(e) {
    if (!this._dragging) return;
    this._updateFromMouse(e);
  }

  _onMouseUp() {
    this._dragging = false;
    this.canvas.style.cursor = 'grab';
  }

  _updateFromMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mx = e.clientX - rect.left - cx;
    const my = e.clientY - rect.top - cy;
    let angle = Math.atan2(my, mx);
    if (angle < 0) angle += Math.PI * 2;

    const arcStart = this.options.arcStart;
    const arcEnd = this.options.arcEnd;
    const arcRange = arcEnd - arcStart;

    let normalized = (angle - arcStart) / arcRange;
    if (normalized < -0.1) normalized += Math.PI * 2 / arcRange;
    normalized = clamp(normalized, 0, 1);

    const newValue = this.options.min + normalized * (this.options.max - this.options.min);
    this.setValue(newValue);
    if (this.options.onChange) {
      this.options.onChange(this._value);
    }
  }

  setValue(v) {
    this._value = clamp(v, this.options.min, this.options.max);
    this.render();
  }

  getValue() {
    return this._value;
  }

  render() {
    const ctx = this.ctx;
    const size = this.options.size;
    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - this.options.lineWidth * 2) / 2 - 6;
    const { arcStart, arcEnd, lineWidth, min, max, color } = this.options;

    ctx.clearRect(0, 0, size, size);

    // Background track with subtle gradient
    const bgGradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    bgGradient.addColorStop(0, rgba(COLORS.borderPrimary, 0.4));
    bgGradient.addColorStop(1, rgba(COLORS.borderPrimary, 0.2));

    ctx.beginPath();
    ctx.arc(cx, cy, radius, arcStart, arcEnd);
    ctx.strokeStyle = bgGradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Calculate value angle
    const valueRatio = (this._value - min) / (max - min);
    const valueAngle = arcStart + valueRatio * (arcEnd - arcStart);

    // Value arc with glow
    const valueGradient = ctx.createLinearGradient(
      cx + Math.cos(arcStart) * radius,
      cy + Math.sin(arcStart) * radius,
      cx + Math.cos(valueAngle) * radius,
      cy + Math.sin(valueAngle) * radius
    );
    valueGradient.addColorStop(0, color);
    valueGradient.addColorStop(1, this._brightenColor(color, 20));

    // Outer glow
    ctx.save();
    ctx.shadowColor = rgba(color, 0.5);
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, arcStart, valueAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Inner bright line
    ctx.save();
    ctx.shadowColor = rgba(color, 0.8);
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.max(arcStart, valueAngle - 0.5), valueAngle);
    ctx.strokeStyle = this._brightenColor(color, 40);
    ctx.lineWidth = lineWidth * 0.7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Tick marks
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const tickAngle = arcStart + (arcEnd - arcStart) * (i / tickCount);
      const tickInnerR = radius - lineWidth / 2 - 4;
      const tickOuterR = radius + lineWidth / 2 + 2;

      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(tickAngle) * tickInnerR,
        cy + Math.sin(tickAngle) * tickInnerR
      );
      ctx.lineTo(
        cx + Math.cos(tickAngle) * tickOuterR,
        cy + Math.sin(tickAngle) * tickOuterR
      );
      ctx.strokeStyle = rgba(COLORS.textTertiary, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Update value display
    let displayValue;
    if (this.options.unit === '%') {
      displayValue = (this._value * 100).toFixed(1);
    } else if (this.options.unit === 'G') {
      displayValue = this._value.toFixed(2);
    } else {
      displayValue = this._value.toFixed(1);
    }
    this.valueEl.textContent = displayValue;
    this.valueEl.style.color = color;
  }

  _brightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  destroy() {
    this.el.remove();
  }
}
