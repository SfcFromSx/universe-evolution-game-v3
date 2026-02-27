import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatCompact } from '../../utils/format.js';

export class StatsBar {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'stats-bar';
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this.update());
  }

  _build() {
    this.el.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Galaxies Formed</div>
        <div class="stat-value cyan" id="stat-galaxies">198.4 T</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Temperature</div>
        <div class="stat-value gold" id="stat-temp">2.72<span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Stars Created</div>
        <div class="stat-value blue" id="stat-stars">1.2 Q</div>
      </div>
    `;

    this.galaxiesEl = this.el.querySelector('#stat-galaxies');
    this.tempEl = this.el.querySelector('#stat-temp');
    this.starsEl = this.el.querySelector('#stat-stars');
  }

  update() {
    const metrics = store.get('metrics');
    if (!metrics) return;

    this.galaxiesEl.textContent = formatCompact(metrics.totalGalaxies);
    this.starsEl.textContent = formatCompact(metrics.totalStars);

    const temp = metrics.avgTemperature;
    if (temp > 1e6) {
      this.tempEl.innerHTML = formatCompact(temp) + '<span class="stat-unit">K</span>';
    } else if (temp > 1000) {
      this.tempEl.innerHTML = (temp / 1000).toFixed(1) + '<span class="stat-unit">KK</span>';
    } else {
      this.tempEl.innerHTML = temp.toFixed(2) + '<span class="stat-unit">K</span>';
    }
  }

  destroy() {
    this.el.remove();
  }
}
