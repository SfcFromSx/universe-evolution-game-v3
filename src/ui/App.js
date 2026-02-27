import { Sidebar } from './Sidebar.js';
import { DashboardView } from './views/DashboardView.js';
import { DataView } from './views/DataView.js';
import { ReportsView } from './views/ReportsView.js';
import { SimulationsView } from './views/SimulationsView.js';
import { InsightsView } from './views/InsightsView.js';
import { store } from '../core/StateStore.js';
import { eventBus } from '../core/EventBus.js';

export class App {
  constructor() {
    this.sidebar = null;
    this.currentView = null;
    this.viewContainer = null;
  }

  init() {
    const sidebarEl = document.getElementById('sidebar');
    this.viewContainer = document.getElementById('view-container');

    this.sidebar = new Sidebar(sidebarEl);

    eventBus.on('state:ui.activeView', ({ value }) => {
      this._switchView(value);
    });

    if (store.get('ui.showWelcome')) {
      this._showWelcome();
    } else {
      this._switchView('dashboard');
    }
  }

  _showWelcome() {
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay';
    overlay.innerHTML = `
      <div class="welcome-content">
        <h1 class="welcome-title">COSMOPOEIA</h1>
        <p class="welcome-text">
          14.1 billion years ago, everything that would ever exist was compressed into a point
          smaller than an atom. Then it expanded. And from that expansion came hydrogen, stars,
          galaxies, planets, and — eventually — you, sitting here, wondering how it all works.<br><br>
          Now it's your turn to try.
        </p>
        <button class="welcome-btn" id="welcome-begin">BEGIN</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#welcome-begin').addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.8s ease';
      setTimeout(() => {
        overlay.remove();
        store.set('ui.showWelcome', false);
        this._switchView('dashboard');
      }, 800);
    });
  }

  _switchView(viewId) {
    if (this.currentView) {
      this.currentView.destroy();
      this.currentView = null;
    }

    this.viewContainer.innerHTML = '';

    switch (viewId) {
      case 'dashboard':
        this.currentView = new DashboardView(this.viewContainer);
        break;
      case 'data':
        this.currentView = new DataView(this.viewContainer);
        break;
      case 'reports':
        this.currentView = new ReportsView(this.viewContainer);
        break;
      case 'simulations':
        this.currentView = new SimulationsView(this.viewContainer);
        break;
      case 'insights':
        this.currentView = new InsightsView(this.viewContainer);
        break;
      default:
        this.currentView = new DashboardView(this.viewContainer);
    }
  }

  render(dt) {
    if (this.currentView && this.currentView.render) {
      this.currentView.render(dt);
    }
  }
}
