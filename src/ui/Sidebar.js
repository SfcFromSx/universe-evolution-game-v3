import { store } from '../core/StateStore.js';
import { eventBus } from '../core/EventBus.js';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'grid', label: 'Dashboard' },
  { id: 'data', icon: 'chart', label: 'Data' },
  { id: 'reports', icon: 'doc', label: 'Reports' },
  { id: 'simulations', icon: 'flask', label: 'Simulations' },
  { id: 'insights', icon: 'lightbulb', label: 'Insights' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', icon: 'gear', label: 'Settings' },
];

const ICONS = {
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 3h6v5l4 7H5l4-7V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

export class Sidebar {
  constructor(container) {
    this.container = container;
    this._build();
  }

  _build() {
    const logoSvg = `<svg viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 3c1.5 0 3 .5 4.2 1.3C18.5 7.5 17 10 16 13c-1-3-2.5-5.5-4.2-6.7C13 5.5 14.5 5 16 5zm-6.5 3.2c1.8.8 3.5 3.2 4.5 6.3-2.8-1.5-5.5-2-7.5-1.5.3-1.8 1.2-3.5 3-4.8zM5 16c0-.3 0-.7.1-1 2.3-.8 5.5-.3 8.5 1.3-2.8 2-5 4.5-6 7-.5-.5-1.5-2-2-3.5C5.2 18.5 5 17.3 5 16zm5.5 9c.8-2.2 2.8-4.8 5.5-6.8 1 3 1 6 .2 8.2-1 .4-2 .6-3.2.6-1 0-1.8-.2-2.5-.5v-1.5zm8.5.5c.5-2.3.3-5.2-.7-8 2.5 1.5 4.5 3.5 5.5 5.5-1.2 1.2-2.8 2-4.8 2.5zM25 20c-1-2-3-4-5.5-5.5C22 13.5 24 13 25.5 13c.3 1 .5 2 .5 3 0 1.5-.3 2.8-1 4z"/>
    </svg>`;

    this.container.innerHTML = `
      <div class="sidebar-logo">${logoSvg}</div>
      <nav class="sidebar-nav" id="sidebar-nav"></nav>
      <div class="sidebar-bottom" id="sidebar-bottom"></div>
    `;

    const nav = this.container.querySelector('#sidebar-nav');
    for (const item of NAV_ITEMS) {
      nav.appendChild(this._createItem(item));
    }

    const bottom = this.container.querySelector('#sidebar-bottom');
    for (const item of BOTTOM_ITEMS) {
      bottom.appendChild(this._createItem(item));
    }

    this._setActive(store.get('ui.activeView') || 'dashboard');

    eventBus.on('state:ui.activeView', ({ value }) => this._setActive(value));
  }

  _createItem(item) {
    const btn = document.createElement('button');
    btn.className = 'sidebar-item';
    btn.dataset.view = item.id;
    btn.innerHTML = `
      ${ICONS[item.icon]}
      <span class="sidebar-tooltip">${item.label}</span>
    `;
    btn.addEventListener('click', () => {
      store.set('ui.activeView', item.id);
    });
    return btn;
  }

  _setActive(viewId) {
    const items = this.container.querySelectorAll('.sidebar-item');
    items.forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });
  }
}
