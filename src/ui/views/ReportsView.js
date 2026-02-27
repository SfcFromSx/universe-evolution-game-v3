import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatCompact, formatTemperature } from '../../utils/format.js';
import { CANONICAL_PARAMS } from '../../data/constants.js';
import { t } from '../../core/i18n.js';

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
          <span class="panel-title">${t('reports.title')}</span>
        </div>
        <div style="color:var(--text-secondary);line-height:1.8;font-size:13px">
          <p>${t('reports.atAge')} <strong style="color:var(--accent-cyan)">${cosmicAge.toFixed(2)} ${t('reports.billionYears')}</strong> ${t('reports.sinceBigBang')}，
          ${t('reports.formed')} <strong style="color:var(--accent-cyan)">${formatCompact(metrics.totalGalaxies)}</strong> ${t('reports.galaxiesContaining')} <strong style="color:var(--accent-cyan)">${formatCompact(metrics.totalStars)}</strong> ${t('reports.starsTotal')}</p>
          <p style="margin-top:12px">${t('reports.avgTempIs')} <strong style="color:var(--accent-gold)">${formatTemperature(metrics.avgTemperature)}</strong>。
          ${t('reports.composition')} ${(elements.hydrogen * 100).toFixed(1)}% ${t('reports.hydrogen')}，${(elements.helium * 100).toFixed(1)}% ${t('reports.helium')}，
          ${t('reports.and')} ${(elements.heavy * 100).toFixed(2)}% ${t('reports.heavyElements')}。</p>
        </div>
      </div>

      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">${t('reports.deviationTitle')}</span>
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
          <span class="panel-title">${t('reports.observationsTitle')}</span>
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
      observations.push(t('obs.highGravity'));
    } else if (params.gravity < 0.7) {
      observations.push(t('obs.lowGravity'));
    }

    if (params.darkEnergy > 1.5) {
      observations.push(t('obs.highDarkEnergy'));
    } else if (params.darkEnergy < 0.5) {
      observations.push(t('obs.lowDarkEnergy'));
    }

    if (elements.heavy > 0.02) {
      observations.push(t('obs.heavyEnrichment'));
    }

    if (metrics.totalGalaxies > 1e12) {
      observations.push(t('obs.trillionGalaxies'));
    }

    if (observations.length === 0) {
      observations.push(t('obs.normal'));
    }

    return observations.map(o => `<p style="margin-bottom:8px;padding-left:12px;border-left:2px solid var(--accent-cyan)">• ${o}</p>`).join('');
  }

  render() {}

  destroy() {
    this.el.remove();
  }
}
