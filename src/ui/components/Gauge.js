import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';
import { clamp } from '../../utils/math.js';

export class Gauge {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      size: options.size || 90,
      min: options.min || 0,
      max: options.max || 2,
      value: options.value || 1,
      label: options.label || '',
      unit: options.unit || '',
      color: options.color || COLORS.accentCyan,
      arcStart: options.arcStart || Math.PI * 0.8,
      arcEnd: options.arcEnd || Math.PI * 2.2,
      lineWidth: options.lineWidth || 6,
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
  }

  _onMouseMove(e) {
    if (!this._dragging) return;
    this._updateFromMouse(e);
  }

  _onMouseUp() {
    this._dragging = false;
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
    const radius = (size - this.options.lineWidth * 2) / 2 - 4;
    const { arcStart, arcEnd, lineWidth, min, max, color } = this.options;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, arcStart, arcEnd);
    ctx.strokeStyle = rgba(COLORS.borderPrimary, 0.6);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    const valueAngle = arcStart + ((this._value - min) / (max - min)) * (arcEnd - arcStart);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, arcStart, valueAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = rgba(color, 0.5);
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.max(arcStart, valueAngle - 0.3), valueAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    let displayValue;
    if (this.options.unit === '%') {
      displayValue = (this._value * 100).toFixed(1) + '%';
    } else {
      displayValue = this._value.toFixed(2);
    }
    this.valueEl.textContent = displayValue;
  }

  destroy() {
    this.el.remove();
  }
}
