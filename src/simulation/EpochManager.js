import { EPOCHS } from '../data/epochs.js';
import { eventBus } from '../core/EventBus.js';

export class EpochManager {
  constructor() {
    this._currentIndex = EPOCHS.length - 1;
    this._visitedEpochs = new Set();
  }

  get currentEpoch() {
    return EPOCHS[this._currentIndex];
  }

  get currentIndex() {
    return this._currentIndex;
  }

  get allEpochs() {
    return EPOCHS;
  }

  get visitedEpochs() {
    return this._visitedEpochs;
  }

  getEpochForTime(timeBYA) {
    const cosmicAge = 14.1 - timeBYA;
    for (let i = EPOCHS.length - 1; i >= 0; i--) {
      if (cosmicAge >= EPOCHS[i].timeStart / 1000) {
        return { epoch: EPOCHS[i], index: i };
      }
    }
    return { epoch: EPOCHS[0], index: 0 };
  }

  updateTime(timeBYA) {
    const { epoch, index } = this.getEpochForTime(timeBYA);
    const changed = index !== this._currentIndex;
    const oldIndex = this._currentIndex;

    this._currentIndex = index;
    this._visitedEpochs.add(epoch.id);

    if (changed) {
      eventBus.emit('epoch:change', {
        epoch,
        index,
        previousIndex: oldIndex,
        previousEpoch: EPOCHS[oldIndex],
      });
    }

    return { epoch, changed };
  }

  getProgress(timeBYA) {
    return Math.max(0, Math.min(1, 1 - timeBYA / 14.1));
  }

  getEpochCardData() {
    const keyEpochs = [
      { epochId: 'planck', label: 'Planck Epoch', stat: '1 tick', time: 'Historical: 1 tick Epoch' },
      { epochId: 'recombination', label: 'Recombination', stat: '300k', time: 'Historical: 30,000 BYA' },
      { epochId: 'first_stars', label: 'First Stars', stat: '1B', time: 'Historical: 135,800 BYA' },
      { epochId: 'reionization', label: 'Reionization', stat: '1B', time: 'Historical: 38,600 BYA' },
      { epochId: 'galaxy_formation', label: 'Galaxy Formation', stat: '5B', time: 'Historical: 201,520 BYA' },
      { epochId: 'stellar_evolution', label: 'Stellar Evolution', stat: '10B', time: 'Historical: 33,620 BYA' },
      { epochId: 'present', label: 'Present', stat: '14.18 BYA', time: 'Now' },
    ];

    return keyEpochs.map(card => ({
      ...card,
      epoch: EPOCHS.find(e => e.id === card.epochId),
    }));
  }

  reset() {
    this._currentIndex = 0;
    this._visitedEpochs.clear();
  }
}
