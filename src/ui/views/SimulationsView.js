import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';

export class SimulationsView {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.style.padding = '20px';
    this.el.style.overflowY = 'auto';
    this.el.style.height = '100%';
    this._build();
    this.container.appendChild(this.el);
  }

  _build() {
    this._updateContent();
  }

  _updateContent() {
    const saves = store.listSaves();

    this.el.innerHTML = `
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">Saved Simulations</span>
          <button class="btn btn-primary" id="save-sim-btn">Save Current</button>
        </div>
        <div style="color:var(--text-secondary);font-size:12px;margin-bottom:16px">
          Save your current universe state and load it later. Compare different parameter configurations.
        </div>
        <div id="save-name-input" style="display:none;margin-bottom:12px">
          <input type="text" placeholder="Simulation name..."
            style="background:var(--bg-secondary);border:1px solid var(--border-primary);color:var(--text-primary);padding:8px 12px;border-radius:6px;font-size:13px;width:300px;outline:none;margin-right:8px"
            id="sim-name-field">
          <button class="btn btn-primary" id="confirm-save-btn">Save</button>
        </div>
        <div id="saves-list">
          ${saves.length === 0 ? '<div style="color:var(--text-tertiary);text-align:center;padding:30px">No saved simulations yet.</div>' : ''}
          ${saves.map(s => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg-secondary);border-radius:8px;margin-bottom:8px;border:1px solid var(--border-primary)">
              <div>
                <div style="font-family:'Space Grotesk',sans-serif;font-weight:600;color:var(--text-primary)">${s.name}</div>
                <div style="font-size:11px;color:var(--text-tertiary)">${new Date(s.timestamp).toLocaleString()}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn load-sim-btn" data-name="${s.name}">Load</button>
                <button class="btn delete-sim-btn" data-name="${s.name}" style="color:var(--danger)">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const saveBtn = this.el.querySelector('#save-sim-btn');
    const nameInput = this.el.querySelector('#save-name-input');
    const nameField = this.el.querySelector('#sim-name-field');
    const confirmBtn = this.el.querySelector('#confirm-save-btn');

    saveBtn.addEventListener('click', () => {
      nameInput.style.display = 'flex';
      nameField.focus();
    });

    confirmBtn.addEventListener('click', () => {
      const name = nameField.value.trim();
      if (name) {
        store.save(name);
        this._updateContent();
      }
    });

    nameField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') confirmBtn.click();
    });

    this.el.querySelectorAll('.load-sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        store.load(btn.dataset.name);
        eventBus.emit('universe:updated');
      });
    });

    this.el.querySelectorAll('.delete-sim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const saves = JSON.parse(localStorage.getItem('cosmopoeia_saves') || '{}');
        delete saves[btn.dataset.name];
        localStorage.setItem('cosmopoeia_saves', JSON.stringify(saves));
        this._updateContent();
      });
    });
  }

  render() {}

  destroy() {
    this.el.remove();
  }
}
