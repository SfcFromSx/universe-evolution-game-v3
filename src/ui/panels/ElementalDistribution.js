import { DonutChart } from '../components/DonutChart.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { COLORS } from '../../data/constants.js';
import { formatPercent } from '../../utils/format.js';

export class ElementalDistribution {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'panel elemental-panel';
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this.update());
  }

  _build() {
    this.el.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">Elemental Distribution</span>
        <button class="panel-menu">···</button>
      </div>
      <div class="elemental-content">
        <div class="elemental-chart-wrap"></div>
        <div class="elemental-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: ${COLORS.hydrogen}"></span>
            <span class="legend-label">H:</span>
            <span class="legend-value" id="h-value">74%</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: ${COLORS.helium}"></span>
            <span class="legend-label">He:</span>
            <span class="legend-value" id="he-value">25%</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: ${COLORS.heavy}"></span>
            <span class="legend-label">Heavy:</span>
            <span class="legend-value" id="heavy-value">1%</span>
          </div>
        </div>
      </div>
    `;

    const chartWrap = this.el.querySelector('.elemental-chart-wrap');
    this.donut = new DonutChart(chartWrap, {
      size: 110,
      lineWidth: 14,
      data: this._getChartData(),
    });

    this.hVal = this.el.querySelector('#h-value');
    this.heVal = this.el.querySelector('#he-value');
    this.heavyVal = this.el.querySelector('#heavy-value');
  }

  _getChartData() {
    const dist = store.get('elementalDistribution') || { hydrogen: 0.74, helium: 0.25, heavy: 0.01 };
    return [
      { value: dist.hydrogen, color: COLORS.hydrogen, innerLabel: 'H' },
      { value: dist.helium, color: COLORS.helium, innerLabel: 'He' },
      { value: dist.heavy, color: COLORS.heavy, innerLabel: '' },
    ];
  }

  update() {
    const dist = store.get('elementalDistribution');
    if (!dist) return;

    this.donut.setData(this._getChartData());
    this.hVal.textContent = formatPercent(dist.hydrogen);
    this.heVal.textContent = formatPercent(dist.helium);
    this.heavyVal.textContent = formatPercent(dist.heavy, 2);
  }

  destroy() {
    this.donut.destroy();
    this.el.remove();
  }
}
