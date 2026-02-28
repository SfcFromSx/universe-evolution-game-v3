import { UniversalMetrics } from '../panels/UniversalMetrics.js';
import { ElementalDistribution } from '../panels/ElementalDistribution.js';
import { StatsBar } from '../panels/StatsBar.js';
import { CosmicParameters } from '../panels/CosmicParameters.js';
import { EpochTimeline } from '../panels/EpochTimeline.js';
import { NodeGraph } from '../components/NodeGraph.js';
import { SolarSystem3D } from '../components/SolarSystem3D.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { t } from '../../core/i18n.js';

export class DashboardView {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'dashboard';
    this._lastGalaxies = null;
    this._lastGalaxyLen = -1;
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this._updateNodeGraph());
  }

  _build() {
    this.el.innerHTML = `
      <div class="dashboard-left" id="dash-left"></div>
      <div class="dashboard-center" id="dash-center">
        <div class="panel galactic-web-panel" id="galactic-panel">
          <div class="panel-header">
            <span class="panel-title" id="cluster-label">${t('web.title')}: ${t('web.cluster')}-7</span>
            <div style="display:flex;gap:8px;align-items:center">
              <select class="view-mode-select" id="galactic-view-mode">
                <option value="filament-field">${t('web.filamentField')}</option>
                <option value="node-graph">${t('web.nodeGraph')}</option>
                <option value="heatmap">${t('web.heatmap')}</option>
              </select>
              <button class="panel-menu">···</button>
            </div>
          </div>
          <div class="galactic-web-content" id="galactic-content"></div>
        </div>
      </div>
      <div class="dashboard-right" id="dash-right"></div>
      <div class="dashboard-bottom" id="dash-bottom"></div>
    `;

    const left = this.el.querySelector('#dash-left');
    const right = this.el.querySelector('#dash-right');
    const bottom = this.el.querySelector('#dash-bottom');
    const galacticContent = this.el.querySelector('#galactic-content');

    this.metrics = new UniversalMetrics(left);
    this.elemental = new ElementalDistribution(left);
    this.stats = new StatsBar(left);
    this.cosmicParams = new CosmicParameters(right);
    this.timeline = new EpochTimeline(bottom);
    this.nodeGraph = new NodeGraph(galacticContent);
    this.solarSystem = new SolarSystem3D(galacticContent);
    this.solarSystem.hide();

    const viewModeSelect = this.el.querySelector('#galactic-view-mode');
    if (viewModeSelect) {
      viewModeSelect.addEventListener('change', () => {
        this.nodeGraph.setViewMode(viewModeSelect.value);
      });
    }

    this._updateNodeGraph();
  }

  _updateNodeGraph() {
    const timeBYA = store.get('universeState.currentTime') || 14.1;
    const cosmicAge = 14.1 - timeBYA;
    this.nodeGraph.setCosmicAge(cosmicAge);

    const galaxies = store.get('galaxies') || [];
    const ref = galaxies;
    const len = galaxies.length;

    if (ref !== this._lastGalaxies || len !== this._lastGalaxyLen) {
      const isNewGen = this._lastGalaxies === null ||
        (this._lastGalaxyLen === 0 && len > 0) ||
        (this._lastGalaxyLen > 0 && len === 0) ||
        Math.abs(len - this._lastGalaxyLen) > 5;

      this._lastGalaxies = ref;
      this._lastGalaxyLen = len;
      this.nodeGraph.setGalaxies(galaxies, isNewGen);

      const label = this.el.querySelector('#cluster-label');
      if (label) {
        if (len > 0) {
          const clusterNum = Math.max(1, Math.floor(len / 4));
          if (clusterNum >= 4) {
            label.textContent = t('web.solarSystem');
            this.nodeGraph.hide();
            this.solarSystem.show();
          } else {
            label.textContent = `${t('web.title')}: ${t('web.cluster')}-${clusterNum}`;
            this.nodeGraph.show();
            this.solarSystem.hide();
          }
        } else {
          label.textContent = `${t('web.title')}: ${t('web.forming')}`;
          this.nodeGraph.show();
          this.solarSystem.hide();
        }
      }
    }
  }

  render(dt) {
    this.nodeGraph.render(dt);
    this.solarSystem.render();
    this.metrics.render();
  }

  destroy() {
    this.metrics.destroy();
    this.elemental.destroy();
    this.cosmicParams.destroy();
    this.timeline.destroy();
    this.nodeGraph.destroy();
    this.solarSystem.destroy();
    this.el.remove();
  }
}
