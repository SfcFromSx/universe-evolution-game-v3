import { clamp, mapRange } from '../../utils/math.js';

export class VerticalSlider {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      min: options.min || 0,
      max: options.max || 100,
      step: options.step || 1,
      value: options.value || 50,
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
    this.el.className = 'vertical-slider-group';

    this.sliderWrap = document.createElement('div');
    this.sliderWrap.className = 'vertical-slider';

    // Track
    this.track = document.createElement('div');
    this.track.className = 'vertical-slider-track';

    // Fill
    this.fill = document.createElement('div');
    this.fill.className = 'vertical-slider-fill';

    // Thumb
    this.thumb = document.createElement('div');
    this.thumb.className = 'vertical-slider-thumb';

    // Value display on thumb
    this.thumbValue = document.createElement('span');
    this.thumbValue.className = 'vertical-slider-thumb-value';
    this.thumb.appendChild(this.thumbValue);

    this.track.appendChild(this.fill);
    this.track.appendChild(this.thumb);
    this.sliderWrap.appendChild(this.track);

    // Ticks
    if (this.options.ticks) {
      const ticksEl = document.createElement('div');
      ticksEl.className = 'vertical-slider-ticks';
      for (const tick of this.options.ticks) {
        const t = document.createElement('span');
        t.className = 'vertical-slider-tick';
        t.textContent = tick;
        ticksEl.appendChild(t);
      }
      this.sliderWrap.appendChild(ticksEl);
    }

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

    // Touch events
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
    const y = (e.clientY - rect.top) / rect.height;
    const raw = mapRange(clamp(1 - y, 0, 1), 0, 1, this.options.min, this.options.max);
    const stepped = Math.round(raw / this.options.step) * this.options.step;
    this._value = clamp(stepped, this.options.min, this.options.max);
    this._updateVisual();
    if (this.options.onChange) {
      this.options.onChange(this._value);
    }
  }

  _updateVisual() {
    const pct = ((this._value - this.options.min) / (this.options.max - this.options.min)) * 100;
    this.fill.style.height = pct + '%';
    this.thumb.style.bottom = pct + '%';

    let display = this._value.toFixed(1);
    this.thumbValue.textContent = display;
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
