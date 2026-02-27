import { UniversalMetrics } from '../panels/UniversalMetrics.js';
import { ElementalDistribution } from '../panels/ElementalDistribution.js';
import { StatsBar } from '../panels/StatsBar.js';
import { CosmicParameters } from '../panels/CosmicParameters.js';
import { EpochTimeline } from '../panels/EpochTimeline.js';
import { NodeGraph } from '../components/NodeGraph.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';

export class DashboardView {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'dashboard';
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
            <span class="panel-title" id="cluster-label">Galactic Web: Cluster-7</span>
            <div style="display:flex;gap:8px;align-items:center">
              <select class="view-mode-select">
                <option value="node-graph">Node-Graph</option>
                <option value="heatmap">Heatmap</option>
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

    this._updateNodeGraph();
  }

  _updateNodeGraph() {
    const galaxies = store.get('galaxies') || [];
    this.nodeGraph.setGalaxies(galaxies);
    const clusterNum = Math.max(1, Math.floor(galaxies.length / 4));
    const label = this.el.querySelector('#cluster-label');
    if (label) label.textContent = `Galactic Web: Cluster-${clusterNum}`;
  }

  render(dt) {
    this.nodeGraph.render(dt);
  }

  destroy() {
    this.metrics.destroy();
    this.elemental.destroy();
    this.cosmicParams.destroy();
    this.timeline.destroy();
    this.nodeGraph.destroy();
    this.el.remove();
  }
}
