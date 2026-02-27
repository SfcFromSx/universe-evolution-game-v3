import { store } from '../../core/StateStore.js';
import { eventBus } from '../../core/EventBus.js';
import { formatCompact } from '../../utils/format.js';

export class DataView {
  constructor(container) {
    this.container = container;
    this.el = document.createElement('div');
    this.el.style.padding = '20px';
    this.el.style.overflowY = 'auto';
    this.el.style.height = '100%';
    this._sortCol = 'mass';
    this._sortAsc = false;
    this._filter = '';
    this._build();
    this.container.appendChild(this.el);
    eventBus.on('universe:updated', () => this._updateTable());
  }

  _build() {
    this.el.innerHTML = `
      <div class="panel" style="height:100%;display:flex;flex-direction:column">
        <div class="panel-header">
          <span class="panel-title">Galaxy Catalog</span>
          <input type="text" placeholder="Search galaxies..."
            style="background:var(--bg-secondary);border:1px solid var(--border-primary);color:var(--text-primary);padding:5px 10px;border-radius:6px;font-size:12px;width:200px;outline:none"
            id="galaxy-search">
        </div>
        <div style="flex:1;overflow:auto" id="table-container"></div>
      </div>
    `;

    this.el.querySelector('#galaxy-search').addEventListener('input', (e) => {
      this._filter = e.target.value.toLowerCase();
      this._updateTable();
    });

    this._updateTable();
  }

  _updateTable() {
    const galaxies = store.get('galaxies') || [];
    const filtered = galaxies.filter(g =>
      !this._filter || g.name.toLowerCase().includes(this._filter)
    );

    filtered.sort((a, b) => {
      const va = a[this._sortCol];
      const vb = b[this._sortCol];
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return this._sortAsc ? cmp : -cmp;
    });

    const container = this.el.querySelector('#table-container');
    if (filtered.length === 0) {
      container.innerHTML = `<div style="color:var(--text-tertiary);text-align:center;padding:40px">No galaxies formed yet. Advance the simulation timeline.</div>`;
      return;
    }

    const cols = [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'mass', label: 'Mass (M☉)', fmt: formatCompact },
      { key: 'starCount', label: 'Stars', fmt: formatCompact },
      { key: 'redshift', label: 'Redshift', fmt: v => v.toFixed(3) },
      { key: 'metallicity', label: 'Metallicity', fmt: v => (v * 100).toFixed(2) + '%' },
      { key: 'age', label: 'Age (Byr)', fmt: v => v.toFixed(1) },
    ];

    let html = '<table style="width:100%;border-collapse:collapse;font-size:12px">';
    html += '<thead><tr>';
    for (const col of cols) {
      const arrow = this._sortCol === col.key ? (this._sortAsc ? ' ▲' : ' ▼') : '';
      html += `<th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border-primary);color:var(--text-secondary);font-size:10px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;cursor:pointer" data-col="${col.key}">${col.label}${arrow}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const g of filtered) {
      html += '<tr style="border-bottom:1px solid var(--border-primary);transition:background 0.15s" onmouseover="this.style.background=\'var(--bg-tertiary)\'" onmouseout="this.style.background=\'transparent\'">';
      for (const col of cols) {
        const val = col.fmt ? col.fmt(g[col.key]) : g[col.key];
        const style = col.key === 'name'
          ? 'color:var(--accent-cyan);font-weight:500'
          : 'color:var(--text-primary);font-family:"JetBrains Mono",monospace;font-size:11px';
        html += `<td style="padding:8px 10px;${style}">${val}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;

    container.querySelectorAll('th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        if (this._sortCol === col) this._sortAsc = !this._sortAsc;
        else { this._sortCol = col; this._sortAsc = true; }
        this._updateTable();
      });
    });
  }

  render() {}

  destroy() {
    this.el.remove();
  }
}
