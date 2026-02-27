import { engine } from './core/Engine.js';
import { store } from './core/StateStore.js';
import { eventBus } from './core/EventBus.js';
import { Universe } from './simulation/Universe.js';
import { App } from './ui/App.js';
import { ParticleSystem } from './rendering/ParticleSystem.js';
import { animations } from './rendering/Animations.js';
import { getQuoteForEpoch } from './data/philosophicalQuotes.js';
import { t, getLang } from './core/i18n.js';

document.documentElement.lang = getLang();

const universe = new Universe();
const app = new App();
let particles = null;

function init() {
  universe.init();
  app.init();

  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    particles = new ParticleSystem(bgCanvas);
  }

  engine.onUpdate((dt) => {
    universe.tick(dt);
  });

  engine.onRender((dt) => {
    if (particles) {
      particles.update(dt);
      particles.render();
    }
    animations.update(dt);
    app.render(dt);
  });

  eventBus.on('epoch:change', ({ epoch, previousEpoch }) => {
    showCosmicFlash();
    const quote = getQuoteForEpoch(epoch.id);
    if (quote) {
      showNotification(epoch.name, `"${quote.text}" — ${quote.author}`);
    }
  });

  eventBus.on('simulation:complete', () => {
    showNotification(t('notify.simComplete'), t('notify.simCompleteBody'));
  });

  eventBus.on('simulation:reset', () => {
    universe.reset();
  });

  engine.start();
}

function showCosmicFlash() {
  const flash = document.createElement('div');
  flash.className = 'cosmic-flash-overlay';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1000);
}

function showNotification(title, body) {
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-body">${body}</div>
  `;
  const root = document.getElementById('notification-root');
  root.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

document.addEventListener('DOMContentLoaded', init);
