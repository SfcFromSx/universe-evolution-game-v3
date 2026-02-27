import { Graph } from '../components/Graph.js';
import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { COLORS } from '../../data/constants.js';
import { rgba } from '../../utils/color.js';

export class UniversalMetrics {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'panel metrics-panel';
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this.update());
  }

  _build() {
    this.el.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">Universal Metrics</span>
        <button class="panel-menu">···</button>
      </div>
      <div class="entropy-chart"></div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-card-label">Thermodynamic State</div>
          <canvas class="thermo-canvas" width="100" height="40"></canvas>
        </div>
        <div class="metric-card">
          <div class="metric-card-label">CMB Fluctuation</div>
          <canvas class="cmb-canvas" width="100" height="40"></canvas>
        </div>
      </div>
    `;

    const chartContainer = this.el.querySelector('.entropy-chart');
    this.graph = new Graph(chartContainer, {
      xLabel: 'BYA',
      yLabel: 'S/kB',
      lineColor: COLORS.accentCyan,
      padding: { top: 8, right: 8, bottom: 22, left: 40 },
    });

    this.thermoCanvas = this.el.querySelector('.thermo-canvas');
    this.thermoCtx = this.thermoCanvas.getContext('2d');
    this.cmbCanvas = this.el.querySelector('.cmb-canvas');
    this.cmbCtx = this.cmbCanvas.getContext('2d');

    this._initGraphData();
  }

  _initGraphData() {
    const data = [];
    for (let t = 14; t >= 0; t -= 0.5) {
      const entropy = Math.pow((14.1 - t) / 14.1, 0.8) * 1000;
      data.push({ x: (14.1 - t).toFixed(1), y: entropy });
    }
    this.graph.setData(data);
  }

  update() {
    const history = store.get('metrics.entropyHistory') || [];
    if (history.length > 2) {
      const graphData = history.map(h => ({
        x: (14.1 - h.time) * 1000,
        y: Math.log10(Math.max(h.entropy, 1)),
      }));
      this.graph.setData(graphData);
    }
    this._renderThermo();
    this._renderCMB();
  }

  _renderThermo() {
    const ctx = this.thermoCtx;
    const w = this.thermoCanvas.width;
    const h = this.thermoCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const temp = store.get('universeState.temperature') || 2.725;
    const time = performance.now() / 1000;

    ctx.strokeStyle = COLORS.accentCyan;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const freq = 0.1 + (temp / 100) * 0.01;
      const amplitude = 8 + Math.log10(Math.max(temp, 1)) * 2;
      const y = h / 2 + Math.sin(x * freq + time * 3) * amplitude *
                Math.sin(x * 0.05 + time) * 0.7;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = rgba(COLORS.accentCyan, 0.4);
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  _renderCMB() {
    const ctx = this.cmbCtx;
    const w = this.cmbCanvas.width;
    const h = this.cmbCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const timeBYA = store.get('universeState.currentTime') || 14.1;
    const cmbStrength = Math.max(0, 1 - timeBYA / 14.1);

    const imageData = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const noise = (Math.sin(x * 0.8 + y * 0.6) * 0.5 + 0.5) *
                      (Math.cos(x * 0.3 - y * 0.9) * 0.5 + 0.5);
        const val = noise * cmbStrength * 255;
        imageData.data[i] = val * 0.2;
        imageData.data[i + 1] = val * 0.6;
        imageData.data[i + 2] = val;
        imageData.data[i + 3] = 180;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  destroy() {
    this.graph.destroy();
    this.el.remove();
  }
}
