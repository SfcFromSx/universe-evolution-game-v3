import { clamp, mapRange } from '../../utils/math.js';

export class Slider {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      min: options.min || 0,
      max: options.max || 1,
      step: options.step || 0.01,
      value: options.value || 0.5,
      label: options.label || '',
      unit: options.unit || '',
      ticks: options.ticks || null,
      onChange: options.onChange || null,
    };

    this._value = this.options.value;
    this._dragging = false;
    this._build();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'param-slider-group';

    this.header = document.createElement('div');
    this.header.className = 'param-slider-header';

    this.labelEl = document.createElement('span');
    this.labelEl.className = 'param-slider-label';
    this.labelEl.textContent = this.options.label;

    this.valueEl = document.createElement('span');
    this.valueEl.className = 'param-slider-value';

    this.header.appendChild(this.labelEl);
    this.header.appendChild(this.valueEl);

    this.sliderWrap = document.createElement('div');
    this.sliderWrap.className = 'custom-slider';

    this.track = document.createElement('div');
    this.track.className = 'slider-track';

    this.fill = document.createElement('div');
    this.fill.className = 'slider-fill';

    this.thumb = document.createElement('div');
    this.thumb.className = 'slider-thumb';

    this.track.appendChild(this.fill);
    this.track.appendChild(this.thumb);
    this.sliderWrap.appendChild(this.track);

    if (this.options.ticks) {
      const ticksEl = document.createElement('div');
      ticksEl.className = 'slider-ticks';
      for (const tick of this.options.ticks) {
        const t = document.createElement('span');
        t.className = 'slider-tick';
        t.textContent = tick;
        ticksEl.appendChild(t);
      }
      this.sliderWrap.appendChild(ticksEl);
    }

    this.el.appendChild(this.header);
    this.el.appendChild(this.sliderWrap);
    this.container.appendChild(this.el);

    this._bindEvents();
    this._updateVisual();
  }

  _bindEvents() {
    const startDrag = (e) => {
      e.preventDefault();
      this._dragging = true;
      this.thumb.classList.add('dragging');
      this._updateFromPointer(e);
    };

    const moveDrag = (e) => {
      if (!this._dragging) return;
      this._updateFromPointer(e);
    };

    const endDrag = () => {
      this._dragging = false;
      this.thumb.classList.remove('dragging');
    };

    this.sliderWrap.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    this.sliderWrap.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._dragging = true;
      this.thumb.classList.add('dragging');
      this._updateFromPointer(e.touches[0]);
    });
    window.addEventListener('touchmove', (e) => {
      if (!this._dragging) return;
      this._updateFromPointer(e.touches[0]);
    });
    window.addEventListener('touchend', endDrag);
  }

  _updateFromPointer(e) {
    const rect = this.track.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const raw = mapRange(clamp(x, 0, 1), 0, 1, this.options.min, this.options.max);
    const stepped = Math.round(raw / this.options.step) * this.options.step;
    this._value = clamp(stepped, this.options.min, this.options.max);
    this._updateVisual();
    if (this.options.onChange) {
      this.options.onChange(this._value);
    }
  }

  _updateVisual() {
    const pct = ((this._value - this.options.min) / (this.options.max - this.options.min)) * 100;
    this.fill.style.width = pct + '%';
    this.thumb.style.left = pct + '%';

    let display = this._value.toFixed(1);
    if (this.options.unit) display += this.options.unit;
    this.valueEl.textContent = display;
  }

  setValue(v) {
    this._value = clamp(v, this.options.min, this.options.max);
    this._updateVisual();
  }

  getValue() {
    return this._value;
  }

  destroy() {
    this.el.remove();
  }
}
