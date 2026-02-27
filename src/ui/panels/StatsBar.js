import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatCompact, formatTemperature } from '../../utils/format.js';

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
        <div class="stat-label">Galaxies</div>
        <div class="stat-value cyan" id="stat-galaxies">198.4 T</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Temp</div>
        <div class="stat-value gold" id="stat-temp">2.72<span class="stat-unit">K</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Stars</div>
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
    this.tempEl.innerHTML = formatTemperature(temp);
  }

  destroy() {
    this.el.remove();
  }
}
