import { store } from '../../core/StateStore.js';
import { QUOTES_BY_EPOCH, ACHIEVEMENTS } from '../../data/philosophicalQuotes.js';
import { EPOCHS } from '../../data/epochs.js';
import { t } from '../../core/i18n.js';

export class InsightsView {
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
    let quotesHtml = '';
    for (const epoch of EPOCHS) {
      const quotes = QUOTES_BY_EPOCH[epoch.id];
      if (!quotes) continue;
      const epochName = t(`epochData.${epoch.id}`);
      quotesHtml += `
        <div class="panel" style="margin-bottom:12px">
          <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:${epoch.color};margin-bottom:12px">${epochName}</div>
          ${quotes.map(q => `
            <div style="margin-bottom:12px;padding:12px;background:var(--bg-secondary);border-radius:8px;border-left:3px solid ${epoch.color}">
              <div style="font-style:italic;color:var(--text-primary);font-size:14px;line-height:1.6">"${q.text}"</div>
              <div style="color:var(--text-tertiary);font-size:11px;margin-top:6px;text-align:right">— ${q.author}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    let achievementsHtml = ACHIEVEMENTS.map(a => `
      <div style="background:var(--bg-secondary);border:1px solid var(--border-primary);border-radius:8px;padding:14px;text-align:center">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:var(--accent-cyan);margin-bottom:4px">${t(`achieve.${a.id}`)}</div>
        <div style="font-size:10px;color:var(--text-tertiary);margin-bottom:8px">${t(`achieve.${a.id}.cond`)}</div>
        <div style="font-style:italic;font-size:11px;color:var(--text-secondary);line-height:1.5">"${a.quote}"</div>
        <div style="font-size:10px;color:var(--text-tertiary);margin-top:4px">— ${a.author}</div>
      </div>
    `).join('');

    this.el.innerHTML = `
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">${t('insights.title')}</span>
        </div>
        <div style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:16px">
          ${t('insights.description')}
        </div>
      </div>
      ${quotesHtml}
      <div class="panel" style="margin-bottom:16px">
        <div class="panel-header">
          <span class="panel-title">${t('insights.achievements')}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
          ${achievementsHtml}
        </div>
      </div>
    `;
  }

  render() {}

  destroy() {
    this.el.remove();
  }
}
