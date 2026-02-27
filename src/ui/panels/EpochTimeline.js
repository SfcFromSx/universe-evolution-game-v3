import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { EPOCHS } from '../../data/epochs.js';
import { COLORS } from '../../data/constants.js';
import { clamp } from '../../utils/math.js';
import { formatTimeBYA } from '../../utils/format.js';

const DISPLAY_EPOCHS = [
  { idx: 0,  label: 'Planck Epoch' },
  { idx: 8,  label: 'Recombination' },
  { idx: 10, label: 'First Stars' },
  { idx: 12, label: 'Galaxy Form.' },
  { idx: 14, label: 'Present' },
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
        <span class="timeline-title">Epoch Chronology: Big Bang (0) → 14.1 BYA (Present)</span>
        <div class="timeline-controls">
          <button class="btn btn-icon" id="timeline-reset" title="Reset">⟲</button>
          <button class="btn btn-icon" id="timeline-play" title="Play/Pause">▶</button>
          <div class="timeline-speed" id="timeline-speed">1x</div>
          <button class="btn btn-icon" id="timeline-faster" title="Faster">⏩</button>
        </div>
      </div>
      <div class="timeline-bar-container" id="timeline-bar-container">
        <div class="timeline-bar">
          <div class="timeline-bar-fill" id="timeline-fill"></div>
        </div>
        <div class="timeline-markers" id="timeline-markers"></div>
        <div class="timeline-scrubber" id="timeline-scrubber">
          <div class="timeline-scrubber-label" id="scrubber-label">PRESENT</div>
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
    for (const de of DISPLAY_EPOCHS) {
      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      const pct = (de.idx / (EPOCHS.length - 1)) * 100;
      marker.style.left = pct + '%';

      const label = document.createElement('span');
      label.className = 'timeline-marker-label';
      label.textContent = de.label;
      marker.appendChild(label);

      marker.addEventListener('click', () => {
        eventBus.emit('timeline:jumpToEpoch', de.idx);
      });

      markersContainer.appendChild(marker);
    }
  }

  _buildCards() {
    const cardsContainer = this.el.querySelector('#epoch-cards');
    const cardData = [
      { name: 'Planck Epoch', time: 'Historical: 1 tick', stat: '∞' },
      { name: 'Recombination', time: '380,000 yr', stat: '300k' },
      { name: 'First Stars', time: '~150 Myr', stat: '1B' },
      { name: 'Galaxy Formation', time: '1-6 Byr', stat: '5B' },
      { name: 'Stellar Evolution', time: '6-10 Byr', stat: '10B' },
      { name: 'Present Era', time: '13.8 Byr', stat: '14.18 BYA' },
    ];

    for (const card of cardData) {
      const el = document.createElement('div');
      el.className = 'epoch-card';
      el.innerHTML = `
        <div class="epoch-card-name">${card.name}</div>
        <div class="epoch-card-time">${card.time}</div>
        <div class="epoch-card-stat">${card.stat}</div>
      `;
      cardsContainer.appendChild(el);
    }
  }

  _bindEvents() {
    const playBtn = this.el.querySelector('#timeline-play');
    const resetBtn = this.el.querySelector('#timeline-reset');
    const fasterBtn = this.el.querySelector('#timeline-faster');
    const barContainer = this.el.querySelector('#timeline-bar-container');
    const scrubber = this.el.querySelector('#timeline-scrubber');

    playBtn.addEventListener('click', () => {
      const playing = store.get('simulation.isPlaying');
      store.set('simulation.isPlaying', !playing);
      if (store.get('simulation.isComplete')) {
        store.set('universeState.currentTime', 14.1);
        store.set('simulation.isComplete', false);
      }
      playBtn.textContent = !playing ? '⏸' : '▶';
    });

    resetBtn.addEventListener('click', () => {
      eventBus.emit('simulation:reset');
      playBtn.textContent = '▶';
    });

    fasterBtn.addEventListener('click', () => {
      const speeds = [1, 2, 5, 10, 50, 100];
      const current = store.get('simulation.speed');
      const idx = speeds.indexOf(current);
      const next = speeds[(idx + 1) % speeds.length];
      store.set('simulation.speed', next);
      this.el.querySelector('#timeline-speed').textContent = next + 'x';
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

    eventBus.on('timeline:jumpToEpoch', (idx) => {
      const epoch = EPOCHS[idx];
      if (epoch) {
        store.set('universeState.currentTime', epoch.timeBYA);
      }
    });
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

    if (fill) fill.style.width = pct + '%';
    if (scrubber) scrubber.style.left = pct + '%';
    if (label) label.textContent = timeBYA <= 0.01 ? 'PRESENT' : formatTimeBYA(timeBYA);

    const markers = this.el.querySelectorAll('.timeline-marker');
    markers.forEach((marker, i) => {
      const markerPct = (DISPLAY_EPOCHS[i].idx / (EPOCHS.length - 1)) * 100;
      marker.classList.toggle('passed', pct >= markerPct);
      marker.classList.toggle('active', Math.abs(pct - markerPct) < 3);
    });

    const cards = this.el.querySelectorAll('.epoch-card');
    const currentIdx = store.get('universeState.currentEpochIndex') || 0;
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === Math.min(currentIdx, cards.length - 1));
    });
  }

  destroy() {
    this.el.remove();
  }
}
