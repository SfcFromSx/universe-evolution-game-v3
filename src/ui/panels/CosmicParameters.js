import { Gauge } from '../components/Gauge.js';
import { VerticalSlider } from '../components/VerticalSlider.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { PARAM_RANGES, COLORS } from '../../data/constants.js';

export class CosmicParameters {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'panel cosmic-params-panel';
    this._build();
    this.container.appendChild(this.el);
  }

  _build() {
    const params = store.get('cosmicParameters');

    this.el.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">Cosmic Parameters</span>
        <button class="panel-menu">···</button>
      </div>
      <div class="param-gauges" id="param-gauges"></div>
      <div class="expansion-rate-section">
        <div class="expansion-rate-title">Cosmic Expansion Rate</div>
        <div class="expansion-rate-content">
          <div class="expansion-sliders">
            <div class="expansion-slider-col">
              <div class="h-zero-indicator top">
                <span class="h-zero-label">H₀</span>
                <span class="h-zero-arrow">↓</span>
              </div>
              <div class="expansion-slider-mount" id="expansion-slider"></div>
              <div class="h-zero-indicator bottom">
                <span class="h-zero-arrow">↑</span>
                <span class="h-zero-label">H₀</span>
              </div>
            </div>
            <div class="expansion-ticks">
              <span>60-80</span>
              <span>60-70</span>
            </div>
          </div>
          <div class="expansion-gauge">
            <div class="expansion-gauge-value" id="expansion-value">${params.expansionRate.toFixed(1)}</div>
            <div class="expansion-gauge-unit">km/s/Mpc</div>
            <div class="expansion-gauge-h0">H₀</div>
          </div>
        </div>
      </div>
      <div id="param-sliders"></div>
    `;

    const gaugesContainer = this.el.querySelector('#param-gauges');
    const slidersContainer = this.el.querySelector('#param-sliders');

    // Gravity gauge
    const gravityWrap = document.createElement('div');
    gravityWrap.className = 'param-gauge-card';
    gravityWrap.innerHTML = `
      <div class="param-gauge-label">Gravity</div>
      <div class="gauge-mount" id="gravity-gauge"></div>
      <div class="gauge-scale">
        <span>0.0</span>
        <span style="color: var(--accent-cyan);">Strength</span>
        <span>2.0</span>
      </div>
    `;
    gaugesContainer.appendChild(gravityWrap);

    // Dark Matter gauge
    const dmWrap = document.createElement('div');
    dmWrap.className = 'param-gauge-card';
    dmWrap.innerHTML = `
      <div class="param-gauge-label">Dark Matter</div>
      <div class="gauge-mount" id="dm-gauge"></div>
      <div class="gauge-scale">
        <span>0%</span>
        <span style="color: var(--accent-gold);">Density</span>
        <span>50%</span>
      </div>
    `;
    gaugesContainer.appendChild(dmWrap);

    this.gravityGauge = new Gauge(this.el.querySelector('#gravity-gauge'), {
      size: 90,
      min: PARAM_RANGES.gravity.min,
      max: PARAM_RANGES.gravity.max,
      value: params.gravity,
      unit: 'G',
      color: COLORS.accentCyan,
      onChange: (v) => this._onParamChange('gravity', v),
    });

    this.dmGauge = new Gauge(this.el.querySelector('#dm-gauge'), {
      size: 90,
      min: PARAM_RANGES.darkMatterDensity.min,
      max: PARAM_RANGES.darkMatterDensity.max,
      value: params.darkMatterDensity,
      unit: '%',
      color: COLORS.accentGold,
      onChange: (v) => this._onParamChange('darkMatterDensity', v),
    });

    // Expansion rate vertical slider
    this.expansionSlider = new VerticalSlider(this.el.querySelector('#expansion-slider'), {
      ...PARAM_RANGES.expansionRate,
      value: params.expansionRate,
      onChange: (v) => {
        this._onParamChange('expansionRate', v);
        this.el.querySelector('#expansion-value').textContent = v.toFixed(1);
      },
    });

    // Other sliders
    this.sfrSlider = this._createSlider(slidersContainer, {
      ...PARAM_RANGES.starFormationRate,
      value: params.starFormationRate,
      label: 'Star Formation Rate',
      unit: 'x',
      ticks: ['0.0x', '0.5', '1.0x', '1.5', '2.0x', '2.5x'],
      onChange: (v) => this._onParamChange('starFormationRate', v),
    });

    this.photonSlider = this._createSlider(slidersContainer, {
      ...PARAM_RANGES.photonDensity,
      value: params.photonDensity,
      label: 'Photon Density',
      unit: 'x',
      ticks: ['0.1x', '0.5', '1.0x', '1.5x'],
      onChange: (v) => this._onParamChange('photonDensity', v),
    });

    this.deSlider = this._createSlider(slidersContainer, {
      ...PARAM_RANGES.darkEnergy,
      value: params.darkEnergy,
      label: 'Dark Energy (Λ)',
      unit: 'x',
      ticks: ['0.0x', '0.5', '1.0x', '1.5', '2.0x'],
      onChange: (v) => this._onParamChange('darkEnergy', v),
    });
  }

  _createSlider(container, options) {
    const group = document.createElement('div');
    group.className = 'param-slider-group';

    const header = document.createElement('div');
    header.className = 'param-slider-header';

    const label = document.createElement('span');
    label.className = 'param-slider-label';
    label.textContent = options.label;

    const value = document.createElement('span');
    value.className = 'param-slider-value';
    value.textContent = options.value.toFixed(1) + (options.unit || '');

    header.appendChild(label);
    header.appendChild(value);

    const sliderWrap = document.createElement('div');
    sliderWrap.className = 'custom-slider';

    const track = document.createElement('div');
    track.className = 'slider-track';

    const fill = document.createElement('div');
    fill.className = 'slider-fill';

    const thumb = document.createElement('div');
    thumb.className = 'slider-thumb';

    track.appendChild(fill);
    track.appendChild(thumb);
    sliderWrap.appendChild(track);

    if (options.ticks) {
      const ticksEl = document.createElement('div');
      ticksEl.className = 'slider-ticks';
      for (const tick of options.ticks) {
        const t = document.createElement('span');
        t.className = 'slider-tick';
        t.textContent = tick;
        ticksEl.appendChild(t);
      }
      sliderWrap.appendChild(ticksEl);
    }

    group.appendChild(header);
    group.appendChild(sliderWrap);
    container.appendChild(group);

    // Simple slider binding
    const updateVisual = () => {
      const pct = ((options.value - options.min) / (options.max - options.min)) * 100;
      fill.style.width = pct + '%';
      thumb.style.left = pct + '%';
      value.textContent = options.value.toFixed(1) + (options.unit || '');
    };

    const startDrag = (e) => {
      e.preventDefault();
      thumb.classList.add('dragging');
      updateFromPointer(e);

      const moveDrag = (e) => updateFromPointer(e);
      const endDrag = () => {
        thumb.classList.remove('dragging');
        window.removeEventListener('mousemove', moveDrag);
        window.removeEventListener('mouseup', endDrag);
      };

      window.addEventListener('mousemove', moveDrag);
      window.addEventListener('mouseup', endDrag);
    };

    const updateFromPointer = (e) => {
      const rect = track.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const raw = x * (options.max - options.min) + options.min;
      const stepped = Math.round(raw / options.step) * options.step;
      options.value = Math.max(options.min, Math.min(options.max, stepped));
      updateVisual();
      if (options.onChange) options.onChange(options.value);
    };

    sliderWrap.addEventListener('mousedown', startDrag);
    updateVisual();

    return { setValue: (v) => { options.value = v; updateVisual(); } };
  }

  _onParamChange(param, value) {
    store.set(`cosmicParameters.${param}`, value);
  }

  destroy() {
    this.gravityGauge.destroy();
    this.dmGauge.destroy();
    this.expansionSlider.destroy();
    this.el.remove();
  }
}
