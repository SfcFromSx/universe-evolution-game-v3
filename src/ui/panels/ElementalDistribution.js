import { RadarChart } from '../components/RadarChart.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatPercent } from '../../utils/format.js';
import { t } from '../../core/i18n.js';

const ELEMENT_COLORS = {
  hydrogen: '#00e5ff',
  helium: '#ffb020',
  heavy: '#ff4466'
};

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
        <span class="panel-title">${t('elements.title')}</span>
        <button class="panel-menu">···</button>
      </div>
      <div class="elemental-content">
        <div class="elemental-chart-wrap" id="chart-wrap"></div>
        <div class="elemental-legend">
          <div class="legend-item" data-type="hydrogen">
            <span class="legend-dot" style="background: ${ELEMENT_COLORS.hydrogen}; box-shadow: 0 0 8px ${ELEMENT_COLORS.hydrogen};"></span>
            <div class="legend-info">
              <span class="legend-label">${t('elements.hydrogen')}</span>
              <span class="legend-value" id="h-value">74.0%</span>
            </div>
          </div>
          <div class="legend-item" data-type="helium">
            <span class="legend-dot" style="background: ${ELEMENT_COLORS.helium}; box-shadow: 0 0 8px ${ELEMENT_COLORS.helium};"></span>
            <div class="legend-info">
              <span class="legend-label">${t('elements.helium')}</span>
              <span class="legend-value" id="he-value">25.0%</span>
            </div>
          </div>
          <div class="legend-item" data-type="heavy">
            <span class="legend-dot" style="background: ${ELEMENT_COLORS.heavy}; box-shadow: 0 0 8px ${ELEMENT_COLORS.heavy};"></span>
            <div class="legend-info">
              <span class="legend-label">${t('elements.heavy')}</span>
              <span class="legend-value" id="heavy-value">1.0%</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const chartWrap = this.el.querySelector('#chart-wrap');
    const containerHeight = this.container.clientHeight || 200;
    const chartSize = Math.min(130, Math.max(90, containerHeight - 60));

    this.radarChart = new RadarChart(chartWrap, {
      size: chartSize,
      data: this._getChartData(),
    });

    this.hVal = this.el.querySelector('#h-value');
    this.heVal = this.el.querySelector('#he-value');
    this.heavyVal = this.el.querySelector('#heavy-value');

    this._resizeObserver = new ResizeObserver(() => {
      const newHeight = this.el.clientHeight || 200;
      const newSize = Math.min(130, Math.max(90, newHeight - 60));
      if (Math.abs(newSize - this.radarChart.size) > 20) {
        this.radarChart.destroy();
        this.radarChart = new RadarChart(chartWrap, {
          size: newSize,
          data: this._getChartData(),
        });
      }
    });
    this._resizeObserver.observe(this.el);
  }

  _getChartData() {
    const dist = store.get('elementalDistribution') || { hydrogen: 0.74, helium: 0.25, heavy: 0.01 };

    return [
      { value: dist.hydrogen, color: ELEMENT_COLORS.hydrogen, label: 'H' },
      { value: dist.helium, color: ELEMENT_COLORS.helium, label: 'He' },
      { value: Math.max(dist.heavy, 0.03), color: ELEMENT_COLORS.heavy, label: 'Z' },
    ];
  }

  update() {
    const dist = store.get('elementalDistribution');
    if (!dist) return;

    this.radarChart.setData(this._getChartData());
    this.hVal.textContent = formatPercent(dist.hydrogen);
    this.heVal.textContent = formatPercent(dist.helium);
    this.heavyVal.textContent = formatPercent(dist.heavy, 2);
  }

  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    this.radarChart.destroy();
    this.el.remove();
  }
}
