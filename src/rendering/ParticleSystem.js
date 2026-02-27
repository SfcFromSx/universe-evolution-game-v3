export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._init();
  }

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _init() {
    const count = Math.floor((this.canvas.width * this.canvas.height) / 8000);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.15 + 0.02,
      opacity: Math.random() * 0.4 + 0.1,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.1,
    };
  }

  update(dt) {
    const time = performance.now() / 1000;
    for (const p of this.particles) {
      p.y -= p.speed;
      p.x += p.drift;
      p.opacity = 0.1 + Math.sin(time + p.phase) * 0.15 + 0.15;

      if (p.y < -5) {
        p.y = this.canvas.height + 5;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < -5) p.x = this.canvas.width + 5;
      if (p.x > this.canvas.width + 5) p.x = -5;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity * 0.3})`;
      ctx.fill();

      if (p.size > 1) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity * 0.08})`;
        ctx.fill();
      }
    }
  }
}
