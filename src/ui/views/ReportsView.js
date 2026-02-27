import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatCompact } from '../../utils/format.js';
import { CANONICAL_PARAMS } from '../../data/constants.js';

export class ReportsView {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.style.padding = '20px';
    this.el.style.overflowY = 'auto';
    this.el.style.height = '100%';
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this._updateReports());
  }

  _build() {
    this.el.innerHTML = `<div id="reports-content"></div>`;
    this._updateReports();
  }

  _updateReports() {
    const params = store.get('cosmicParameters');
    const metrics = store.get('metrics');
    const timeBYA = store.get('universeState.currentTime');
    const elements = store.get('elementalDistribution');
    const cosmicAge = 14.1 - timeBYA;

    const deviations = {};
    for (const key of Object.keys(CANONICAL_PARAMS)) {
      const canonical = CANONICAL_PARAMS[key];
      const current = params[key];
      deviations[key] = ((current - canonical) / canonical * 100).toFixed(1);
    }

    const container = this.el.querySelector('#reports-content');
    container.innerHTML = `
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">Universe Status Report</span>
        </div>
        <div style="color:var(--text-secondary);line-height:1.8;font-size:13px">
          <p>At <strong style="color:var(--accent-cyan)">${cosmicAge.toFixed(2)} billion years</strong> since the Big Bang,
          your universe has formed <strong style="color:var(--accent-cyan)">${formatCompact(metrics.totalGalaxies)}</strong> galaxies
          containing a total of <strong style="color:var(--accent-cyan)">${formatCompact(metrics.totalStars)}</strong> stars.</p>
          <p style="margin-top:12px">The average cosmic temperature stands at <strong style="color:var(--accent-gold)">${metrics.avgTemperature.toFixed(2)} K</strong>.
          Elemental composition is ${(elements.hydrogen * 100).toFixed(1)}% hydrogen, ${(elements.helium * 100).toFixed(1)}% helium,
          and ${(elements.heavy * 100).toFixed(2)}% heavier elements.</p>
        </div>
      </div>

      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">Parameter Deviation from Canonical Universe</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${Object.entries(deviations).map(([key, dev]) => `
            <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;text-align:center">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--text-tertiary);margin-bottom:4px">${key.replace(/([A-Z])/g, ' $1')}</div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:${Math.abs(parseFloat(dev)) < 5 ? 'var(--success)' : Math.abs(parseFloat(dev)) < 20 ? 'var(--warning)' : 'var(--danger)'}">${dev > 0 ? '+' : ''}${dev}%</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Key Observations</span>
        </div>
        <div style="color:var(--text-secondary);line-height:1.8;font-size:13px">
          ${this._generateObservations(params, metrics, elements)}
        </div>
      </div>
    `;
  }

  _generateObservations(params, metrics, elements) {
    const observations = [];

    if (params.gravity > 1.3) {
      observations.push('High gravity is accelerating star formation but reducing galaxy lifespans.');
    } else if (params.gravity < 0.7) {
      observations.push('Low gravity is preventing efficient gravitational collapse. Fewer structures forming.');
    }

    if (params.darkEnergy > 1.5) {
      observations.push('Excessive dark energy is driving accelerated expansion, tearing structures apart.');
    } else if (params.darkEnergy < 0.5) {
      observations.push('Low dark energy may lead to eventual gravitational collapse of the universe.');
    }

    if (elements.heavy > 0.02) {
      observations.push('Heavy element enrichment has reached levels compatible with rocky planet formation.');
    }

    if (metrics.totalGalaxies > 1e12) {
      observations.push('Galaxy count has reached the trillions — a rich cosmic web has formed.');
    }

    if (observations.length === 0) {
      observations.push('Parameters are within normal ranges. Universe is evolving as expected.');
    }

    return observations.map(o => `<p style="margin-bottom:8px;padding-left:12px;border-left:2px solid var(--accent-cyan)">• ${o}</p>`).join('');
  }

  render() {}

  destroy() {
    this.el.remove();
  }
}
