import { Gauge } from '../components/Gauge.js';
import { Slider } from '../components/Slider.js';
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
      <div class="expansion-rate-display">
        <div class="expansion-arrows">
          <span class="expansion-arrow active">H</span>
          <span class="expansion-arrow active">₀</span>
        </div>
        <span class="expansion-arrow active" style="margin: 0 4px">→</span>
        <div>
          <span class="expansion-value" id="expansion-value">${params.expansionRate.toFixed(1)}</span>
          <span class="expansion-unit"> km/s/Mpc</span>
        </div>
      </div>
      <div id="param-sliders"></div>
    `;

    const gaugesContainer = this.el.querySelector('#param-gauges');
    const slidersContainer = this.el.querySelector('#param-sliders');

    const gravityWrap = document.createElement('div');
    gravityWrap.className = 'param-gauge-card';
    gravityWrap.innerHTML = '<div class="param-gauge-label">Gravity</div><div class="gauge-mount" id="gravity-gauge"></div><div class="gauge-sublabel">Strength</div>';
    gaugesContainer.appendChild(gravityWrap);

    const dmWrap = document.createElement('div');
    dmWrap.className = 'param-gauge-card';
    dmWrap.innerHTML = '<div class="param-gauge-label">Dark Matter</div><div class="gauge-mount" id="dm-gauge"></div><div class="gauge-sublabel">Density</div>';
    gaugesContainer.appendChild(dmWrap);

    this.gravityGauge = new Gauge(this.el.querySelector('#gravity-gauge'), {
      size: 100,
      min: PARAM_RANGES.gravity.min,
      max: PARAM_RANGES.gravity.max,
      value: params.gravity,
      unit: 'G',
      color: COLORS.accentCyan,
      onChange: (v) => this._onParamChange('gravity', v),
    });

    this.dmGauge = new Gauge(this.el.querySelector('#dm-gauge'), {
      size: 100,
      min: PARAM_RANGES.darkMatterDensity.min,
      max: PARAM_RANGES.darkMatterDensity.max,
      value: params.darkMatterDensity,
      unit: '%',
      color: COLORS.accentGold,
      onChange: (v) => this._onParamChange('darkMatterDensity', v),
    });

    this.expansionSlider = new Slider(slidersContainer, {
      ...PARAM_RANGES.expansionRate,
      value: params.expansionRate,
      label: 'Cosmic Expansion Rate',
      unit: '',
      ticks: ['0', '50', '100', '150'],
      onChange: (v) => {
        this._onParamChange('expansionRate', v);
        this.el.querySelector('#expansion-value').textContent = v.toFixed(1);
      },
    });

    this.sfrSlider = new Slider(slidersContainer, {
      ...PARAM_RANGES.starFormationRate,
      value: params.starFormationRate,
      label: 'Star Formation Rate',
      unit: 'x',
      ticks: ['0.0x', '0.5', '1.0x', '1.5', '2.0x', '2.5x'],
      onChange: (v) => this._onParamChange('starFormationRate', v),
    });

    this.photonSlider = new Slider(slidersContainer, {
      ...PARAM_RANGES.photonDensity,
      value: params.photonDensity,
      label: 'Photon Density',
      unit: 'x',
      ticks: ['0.1x', '0.5', '1.0x', '1.5x'],
      onChange: (v) => this._onParamChange('photonDensity', v),
    });

    this.deSlider = new Slider(slidersContainer, {
      ...PARAM_RANGES.darkEnergy,
      value: params.darkEnergy,
      label: 'Dark Energy (Λ)',
      unit: 'x',
      ticks: ['0.0x', '0.5', '1.0x', '1.5', '2.0x'],
      onChange: (v) => this._onParamChange('darkEnergy', v),
    });
  }

  _onParamChange(param, value) {
    store.set(`cosmicParameters.${param}`, value);
  }

  destroy() {
    this.gravityGauge.destroy();
    this.dmGauge.destroy();
    this.el.remove();
  }
}
