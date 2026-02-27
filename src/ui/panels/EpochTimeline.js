import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { EPOCHS } from '../../data/epochs.js';
import { clamp } from '../../utils/math.js';
import { formatTimeBYA } from '../../utils/format.js';

const EPOCH_CARDS = [
  { id: 0, name: 'Planck Epoch', time: 'Historical: 1 tick', stat: '∞', bya: 14.1 },
  { id: 1, name: 'Recombination', time: 'Historical: 380,000 BYA', stat: '300k', bya: 13.7 },
  { id: 2, name: 'First Stars', time: 'Historical: 150,000 BYA', stat: '1B', bya: 13.1 },
  { id: 3, name: 'Galaxy Formation', time: 'Historical: 1B BYA', stat: '5B', bya: 9.1 },
  { id: 4, name: 'Stellar Evolution', time: 'Historical: 5B BYA', stat: '10B', bya: 4.1 },
  { id: 5, name: 'Present Era', time: 'Historical: 14.1 BYA', stat: '14.1B', bya: 0 },
];

export class EpochTimeline {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.className = 'panel epoch-timeline';
    this._dragging = false;
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this.update());
  }

  _build() {
    this.el.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-title-section">
          <span class="timeline-title">Epoch Chronology: Big Bang (0) → 14.1 BYA (Present)</span>
          <div class="time-counter">
            <span class="time-counter-label">T-</span>
            <span class="time-counter-value" id="time-counter">14.1000</span>
            <span class="time-counter-unit">BYA</span>
          </div>
        </div>
        <div class="timeline-controls">
          <button class="btn btn-icon" id="timeline-reset" title="Reset">⟲</button>
          <button class="btn btn-icon timeline-play-btn" id="timeline-play" title="Play/Pause">▶</button>
          <div class="timeline-speed" id="timeline-speed">1x</div>
        </div>
      </div>
      <div class="timeline-progress-section">
        <div class="timeline-bar-container" id="timeline-bar-container">
          <div class="timeline-bar">
            <div class="timeline-bar-fill" id="timeline-fill"></div>
          </div>
          <div class="timeline-markers" id="timeline-markers"></div>
          <div class="timeline-scrubber" id="timeline-scrubber">
            <div class="timeline-scrubber-label" id="scrubber-label">PRESENT</div>
          </div>
          <div class="present-marker">PRESENT</div>
        </div>
        <div class="timeline-metrics">
          <div class="timeline-metric">
            <span class="metric-label">Current Time</span>
            <span class="metric-value" id="current-time">14.1 BYA</span>
          </div>
          <div class="timeline-metric">
            <span class="metric-label">Progress</span>
            <span class="metric-value" id="progress-percent">0%</span>
          </div>
          <div class="timeline-metric">
            <span class="metric-label">Epoch</span>
            <span class="metric-value" id="current-epoch">Present Era</span>
          </div>
        </div>
      </div>
      <div class="epoch-cards" id="epoch-cards"></div>
    `;

    this._buildMarkers();
    this._buildCards();
    this._bindEvents();
    this.update();
  }

  _buildMarkers() {
    const markersContainer = this.el.querySelector('#timeline-markers');
    const markerPositions = [0, 20, 40, 60, 80, 100];
    const markerLabels = ['0', '3B', '6B', '9B', '12B', '14.1B'];

    for (let i = 0; i < markerPositions.length; i++) {
      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      marker.style.left = markerPositions[i] + '%';
      marker.dataset.position = markerPositions[i];

      const label = document.createElement('span');
      label.className = 'timeline-marker-label';
      label.textContent = markerLabels[i];
      marker.appendChild(label);

      marker.addEventListener('click', () => {
        const timeBYA = 14.1 * (1 - markerPositions[i] / 100);
        store.set('universeState.currentTime', timeBYA);
      });

      markersContainer.appendChild(marker);
    }
  }

  _buildCards() {
    const cardsContainer = this.el.querySelector('#epoch-cards');

    for (const card of EPOCH_CARDS) {
      const el = document.createElement('div');
      el.className = 'epoch-card';
      el.dataset.bya = card.bya;
      el.innerHTML = `
        <div class="epoch-card-header">
          <div class="epoch-card-name">${card.name}</div>
          <div class="epoch-card-time">${card.time}</div>
        </div>
        <div class="epoch-card-stat">${card.stat}</div>
      `;

      el.addEventListener('click', () => {
        store.set('universeState.currentTime', card.bya);
      });

      cardsContainer.appendChild(el);
    }
  }

  _bindEvents() {
    const playBtn = this.el.querySelector('#timeline-play');
    const resetBtn = this.el.querySelector('#timeline-reset');
    const barContainer = this.el.querySelector('#timeline-bar-container');
    const scrubber = this.el.querySelector('#timeline-scrubber');

    playBtn.addEventListener('click', () => {
      const playing = store.get('simulation.isPlaying');
      store.set('simulation.isPlaying', !playing);
      if (store.get('simulation.isComplete')) {
        store.set('universeState.currentTime', 14.1);
        store.set('simulation.isComplete', false);
      }
      this._updatePlayButton(!playing);
    });

    resetBtn.addEventListener('click', () => {
      eventBus.emit('simulation:reset');
      this._updatePlayButton(false);
    });

    const startDrag = (e) => {
      this._dragging = true;
      scrubber.classList.add('dragging');
      this._updateScrubFromMouse(e, barContainer);
    };

    barContainer.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', (e) => {
      if (!this._dragging) return;
      this._updateScrubFromMouse(e, barContainer);
    });
    window.addEventListener('mouseup', () => {
      this._dragging = false;
      scrubber.classList.remove('dragging');
    });

    // Speed control click
    const speedBtn = this.el.querySelector('#timeline-speed');
    speedBtn.addEventListener('click', () => {
      const speeds = [1, 2, 5, 10, 50, 100];
      const current = store.get('simulation.speed');
      const idx = speeds.indexOf(current);
      const next = speeds[(idx + 1) % speeds.length];
      store.set('simulation.speed', next);
      speedBtn.textContent = next + 'x';
    });
  }

  _updatePlayButton(isPlaying) {
    const playBtn = this.el.querySelector('#timeline-play');
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    playBtn.classList.toggle('playing', isPlaying);
  }

  _updateScrubFromMouse(e, barContainer) {
    const rect = barContainer.getBoundingClientRect();
    const pct = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const timeBYA = 14.1 * (1 - pct);
    store.set('universeState.currentTime', timeBYA);
  }

  update() {
    const timeBYA = store.get('universeState.currentTime') || 14.1;
    const progress = clamp(1 - timeBYA / 14.1, 0, 1);
    const pct = progress * 100;

    const fill = this.el.querySelector('#timeline-fill');
    const scrubber = this.el.querySelector('#timeline-scrubber');
    const label = this.el.querySelector('#scrubber-label');
    const currentTimeEl = this.el.querySelector('#current-time');
    const progressEl = this.el.querySelector('#progress-percent');
    const epochEl = this.el.querySelector('#current-epoch');
    const timeCounter = this.el.querySelector('#time-counter');

    if (fill) fill.style.width = pct + '%';
    if (scrubber) scrubber.style.left = pct + '%';
    if (label) label.textContent = timeBYA <= 0.01 ? 'PRESENT' : formatTimeBYA(timeBYA);

    // Update time counter near title
    if (timeCounter) timeCounter.textContent = timeBYA.toFixed(4);

    // Update metrics
    if (currentTimeEl) currentTimeEl.textContent = timeBYA <= 0.01 ? 'PRESENT' : timeBYA.toFixed(2) + ' BYA';
    if (progressEl) progressEl.textContent = Math.round(pct) + '%';

    // Find current epoch card index
    let currentCardIndex = 0;
    for (let i = EPOCH_CARDS.length - 1; i >= 0; i--) {
      if (timeBYA <= EPOCH_CARDS[i].bya) {
        currentCardIndex = i;
        break;
      }
    }
    if (epochEl) epochEl.textContent = EPOCH_CARDS[currentCardIndex].name;

    // Update markers
    const markers = this.el.querySelectorAll('.timeline-marker');
    markers.forEach((marker) => {
      const markerPct = parseFloat(marker.dataset.position);
      marker.classList.toggle('passed', pct >= markerPct);
      marker.classList.toggle('active', Math.abs(pct - markerPct) < 5);
    });

    // Update cards - only the current epoch is active
    const cards = this.el.querySelectorAll('.epoch-card');
    cards.forEach((card, i) => {
      const isPast = timeBYA < parseFloat(card.dataset.bya);
      card.classList.toggle('active', i === currentCardIndex);
      card.classList.toggle('past', isPast && i !== currentCardIndex);
    });

    // Update play button state
    const isPlaying = store.get('simulation.isPlaying');
    this._updatePlayButton(isPlaying);

    // Update speed display
    const speed = store.get('simulation.speed');
    const speedEl = this.el.querySelector('#timeline-speed');
    if (speedEl) speedEl.textContent = speed + 'x';
  }

  destroy() {
    this.el.remove();
  }
}
