import { lerp, easeOutCubic, easeInOutCubic } from '../utils/math.js';

class Tween {
  constructor(from, to, duration, easing, onUpdate, onComplete) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.elapsed = 0;
    this.done = false;
  }

  update(dt) {
    if (this.done) return;
    this.elapsed += dt * 1000;
    const t = Math.min(this.elapsed / this.duration, 1);
    const easedT = this.easing(t);
    const value = lerp(this.from, this.to, easedT);
    this.onUpdate(value);
    if (t >= 1) {
      this.done = true;
      this.onComplete?.();
    }
  }
}

class AnimationManager {
  constructor() {
    this._tweens = [];
  }

  tween(from, to, duration, easing = easeOutCubic) {
    return new Promise((resolve) => {
      const tween = new Tween(from, to, duration, easing, (v) => {
        tween._currentValue = v;
      }, resolve);
      this._tweens.push(tween);
    });
  }

  animate(from, to, duration, onUpdate, easing = easeOutCubic) {
    return new Promise((resolve) => {
      const tween = new Tween(from, to, duration, easing, onUpdate, resolve);
      this._tweens.push(tween);
    });
  }

  update(dt) {
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      this._tweens[i].update(dt);
      if (this._tweens[i].done) {
        this._tweens.splice(i, 1);
      }
    }
  }
}

export const animations = new AnimationManager();

export class AnimatedValue {
  constructor(initialValue, smoothing = 0.1) {
    this.target = initialValue;
    this.current = initialValue;
    this.smoothing = smoothing;
  }

  set(value) {
    this.target = value;
  }

  setImmediate(value) {
    this.target = value;
    this.current = value;
  }

  update(dt) {
    this.current = lerp(this.current, this.target, Math.min(1, this.smoothing * dt * 60));
  }

  get value() {
    return this.current;
  }
}
