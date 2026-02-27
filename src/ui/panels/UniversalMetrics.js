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
    this._canvasReady = false;
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this.update());

    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this.el);
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

  _onResize() {
    this._resizeMiniCanvases();
  }

  _initGraphData() {
    const data = [];
    for (let t = 14; t >= 0; t -= 0.5) {
      const cosmicAge = 14.1 - t;
      const fraction = cosmicAge / 14.1;
      const entropy = Math.log10(Math.max(Math.pow(2.725 / Math.max(fraction, 1e-10), 3), 1));
      data.push({ x: cosmicAge, y: entropy });
    }
    this.graph.setData(data);
  }

  update() {
    const history = store.get('metrics.entropyHistory') || [];
    if (history.length > 2) {
      const graphData = history.map(h => ({
        x: 14.1 - h.time,
        y: Math.log10(Math.max(h.entropy, 1)),
      }));
      this.graph.setData(graphData);
    }
  }

  render() {
    if (!this._canvasReady) {
      this._resizeMiniCanvases();
    }
    this._renderThermo();
    this._renderCMB();
  }

  _resizeMiniCanvases() {
    const dpr = window.devicePixelRatio || 1;
    let ready = true;

    for (const canvas of [this.thermoCanvas, this.cmbCanvas]) {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 2 || h < 2) {
        ready = false;
        continue;
      }
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (ready) {
      this._thermoW = Math.round(this.thermoCanvas.getBoundingClientRect().width);
      this._thermoH = Math.round(this.thermoCanvas.getBoundingClientRect().height);
      this._cmbW = Math.round(this.cmbCanvas.getBoundingClientRect().width);
      this._cmbH = Math.round(this.cmbCanvas.getBoundingClientRect().height);
      this._canvasReady = true;
    }
  }

  _renderThermo() {
    const ctx = this.thermoCtx;
    const w = this._thermoW || 0;
    const h = this._thermoH || 0;
    if (w < 2 || h < 2) return;

    ctx.clearRect(0, 0, w, h);

    const temp = store.get('universeState.temperature') || 2.725;
    const time = performance.now() / 1000;

    const logTemp = Math.log10(Math.max(temp, 1));
    const freq = 0.08 + logTemp * 0.015;
    const amplitude = Math.min(h * 0.4, 4 + logTemp * 1.5);
    const speed = 1.5 + Math.min(logTemp * 0.3, 4);

    const hotness = Math.min(1, logTemp / 30);

    const r = Math.round(hotness * 255);
    const g = Math.round((1 - hotness) * 180 + hotness * 100);
    const b = Math.round((1 - hotness) * 255);
    const lineColor = `rgb(${r}, ${g}, ${b})`;
    const glowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 +
        Math.sin(x * freq + time * speed) * amplitude * 0.6 +
        Math.sin(x * freq * 2.3 + time * speed * 1.7) * amplitude * 0.25 +
        Math.sin(x * freq * 0.5 + time * speed * 0.6) * amplitude * 0.15;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  _renderCMB() {
    const ctx = this.cmbCtx;
    const dpr = window.devicePixelRatio || 1;
    const w = this.cmbCanvas.width;
    const h = this.cmbCanvas.height;
    if (w < 2 || h < 2) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const timeBYA = store.get('universeState.currentTime') || 14.1;
    const cosmicAge = 14.1 - timeBYA;
    const recombinationAge = 0.38;

    if (cosmicAge < recombinationAge) {
      // Pre-recombination: hot plasma glow
      const plasmaIntensity = Math.min(1, cosmicAge / recombinationAge);
      const time = performance.now() / 2000;

      for (let py = 0; py < h; py += 2) {
        for (let px = 0; px < w; px += 2) {
          const sx = px / dpr;
          const sy = py / dpr;
          const flicker = 0.6 + 0.4 * Math.sin(sx * 0.3 + time * 2) *
                          Math.cos(sy * 0.4 - time * 1.5);
          const val = flicker * plasmaIntensity * 200;
          const r = Math.min(255, val * 1.2);
          const g = val * 0.4;
          const b = val * 0.1;
          ctx.fillStyle = `rgba(${r|0}, ${g|0}, ${b|0}, 0.7)`;
          ctx.fillRect(px, py, 2, 2);
        }
      }
    } else {
      // Post-recombination: CMB anisotropy pattern
      const cmbStrength = Math.min(1, (cosmicAge - recombinationAge) / 0.3);
      const imageData = ctx.createImageData(w, h);
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const i = (py * w + px) * 4;
          const sx = px / dpr;
          const sy = py / dpr;
          const noise = (Math.sin(sx * 0.8 + sy * 0.6) * 0.5 + 0.5) *
                        (Math.cos(sx * 0.3 - sy * 0.9) * 0.5 + 0.5);
          const val = noise * cmbStrength * 255;
          imageData.data[i] = val * 0.2;
          imageData.data[i + 1] = val * 0.6;
          imageData.data[i + 2] = val;
          imageData.data[i + 3] = 180;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.restore();
  }

  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    this.graph.destroy();
    this.el.remove();
  }
}
