// Expressive Thanksgiving particle effects: curved turkey feathers, autumn maple leaves, hearth embers, oven flames, acoustic rings, and comic callouts.

import { createSeededRng } from '../config.js';

const FEATHER_PALETTE = [
  { body: '#8f371c', tip: '#fff0ca', quill: '#331208' },
  { body: '#cf5b1c', tip: '#ffe4a8', quill: '#4a1b08' },
  { body: '#e69422', tip: '#fff4d1', quill: '#522a08' },
  { body: '#6e2324', tip: '#f6d6bc', quill: '#2b0d0e' },
];
const LEAF_PALETTE = ['#d14228', '#e87620', '#f0af2b', '#b52e22', '#db5d22'];

export function createParticleSystem() { return new ParticleSystem(); }
export function emitFeatherBurst(particles, x, y, count = 12, spread = 1) { particles.spawnFeatherBurst(x, y, count, spread); }
export function emitOvenEmbers(particles, x, y, dirX = -1, count = 8) { particles.spawnOvenFlame(x, y, dirX, count); }
export function emitAutumnLeaves(particles, width, height, stageIndex) { particles.seedAmbient(width, height, stageIndex); }

export class ParticleSystem {
  constructor() {
    this.particles = []; this.callouts = []; this.ambientLeaves = []; this.embers = [];
    this.screenFlash = { color: '#ff5232', alpha: 0 };
    this.shakeTime = 0; this.shakeIntensity = 0; this._rng = createSeededRng(1337);
  }

  _rand(a, b) { return a + this._rng() * (b - a); }

  seedAmbient(width, height, stageIndex, rng = null) {
    const next = rng || createSeededRng(701 + stageIndex * 31);
    const pick = (a, b) => a + next() * (b - a);
    this.ambientLeaves = []; this.embers = [];
    if (stageIndex <= 1) {
      for (let i = 0; i < 24; i++) {
        this.ambientLeaves.push({ x: pick(0, width), y: pick(0, height * 0.85), vx: pick(-42, -16), vy: pick(16, 36), size: pick(7, 13), angle: pick(0, Math.PI * 2), vAngle: pick(-2.2, 2.2), sway: pick(0, Math.PI * 2), color: LEAF_PALETTE[Math.floor(next() * LEAF_PALETTE.length)] });
      }
    } else {
      for (let i = 0; i < 32; i++) {
        this.embers.push({ x: pick(0, width), y: pick(height * 0.15, height), vx: pick(-18, 18), vy: pick(-68, -22), size: pick(2, 4.6), phase: pick(0, Math.PI * 2), color: next() > 0.35 ? '#ffb830' : '#ff6424' });
      }
    }
  }

  spawnFeatherBurst(x, y, count = 12, spread = 1) {
    for (let i = 0; i < count; i++) {
      const a = (i / Math.max(1, count)) * 6.28 + this._rand(-0.4, 0.4), spd = this._rand(75, 225) * spread;
      this.particles.push({ type: 'feather', x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 65 * spread, rot: this._rand(0, 6.28), vRot: this._rand(-5, 5), sway: this._rand(0, 6.28), len: this._rand(13, 20), wid: this._rand(5, 7.5), pal: FEATHER_PALETTE[i % 4], age: 0, life: this._rand(0.95, 1.55) });
    }
  }
  spawnDustPuff(x, y, d = 0, n = 5) { for (let i = 0; i < n; i++) this.particles.push({ type: 'dust', x: x + this._rand(-8, 8), y: y + this._rand(-4, 2), vx: d * this._rand(30, 85) + this._rand(-35, 35), vy: this._rand(-55, -14), radius: this._rand(5, 11), color: '#dfbf8f', age: 0, life: this._rand(0.32, 0.56) }); }
  spawnFlourCloud(x, y) { for (let i = 0; i < 14; i++) { const a = this._rand(0, 6.28), s = this._rand(35, 130); this.particles.push({ type: 'dust', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 35, radius: this._rand(11, 22), color: '#fff8ea', age: 0, life: this._rand(0.55, 0.9) }); } }
  spawnOvenFlame(x, y, d = -1, n = 8) { for (let i = 0; i < n; i++) this.particles.push({ type: 'flame', x: x + this._rand(-8, 8), y: y + this._rand(-22, 22), vx: d * this._rand(160, 340), vy: this._rand(-75, 45), radius: this._rand(8, 18), age: 0, life: this._rand(0.28, 0.52) }); }
  spawnKnifeSparks(x, y, n = 8) { for (let i = 0; i < n; i++) { const a = this._rand(0, 6.28), s = this._rand(120, 290); this.particles.push({ type: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 50, color: i % 2 === 0 ? '#fff' : '#ffe27a', age: 0, life: this._rand(0.2, 0.36) }); } }
  spawnAcornRing(x, y) { this.particles.push({ type: 'ring', x, y, radius: 10, maxRadius: 96, age: 0, life: 0.55 }); }
  spawnStars(x, y, n = 6) { for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n)) * 6.28; this.particles.push({ type: 'star', x, y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 90 - 70, radius: this._rand(6, 10), rot: a, age: 0, life: 0.72 }); } }

  spawnCallout(x, y, text, color = '#ffe27a', scale = 1) { this.callouts.push({ x, y, vy: -56, text, color, scale, age: 0, life: 1.15 }); }
  triggerShake(intensity, duration) { this.shakeIntensity = Math.max(this.shakeIntensity, intensity); this.shakeTime = Math.max(this.shakeTime, duration); }
  triggerFlash(color, alpha) { this.screenFlash.color = color; this.screenFlash.alpha = Math.max(this.screenFlash.alpha, alpha); }
  getShakeOffset() { return this.shakeTime <= 0 ? { x: 0, y: 0 } : { x: Math.sin(this.shakeTime * 95) * this.shakeIntensity, y: Math.cos(this.shakeTime * 115) * this.shakeIntensity * 0.7 }; }

  update(dt, cameraX, viewWidth, viewHeight, stageIndex) {
    if (this.shakeTime > 0) { this.shakeTime = Math.max(0, this.shakeTime - dt); this.shakeIntensity *= Math.max(0, 1 - dt * 5); }
    if (this.screenFlash.alpha > 0) this.screenFlash.alpha = Math.max(0, this.screenFlash.alpha - dt * 2.4);
    if (stageIndex <= 1 && this.ambientLeaves.length === 0) this.seedAmbient(viewWidth, viewHeight, stageIndex);
    else if (stageIndex >= 2 && this.embers.length === 0) this.seedAmbient(viewWidth, viewHeight, stageIndex);

    for (const lf of this.ambientLeaves) {
      lf.sway += dt * 2.2; lf.x += (lf.vx + Math.sin(lf.sway) * 18) * dt; lf.y += lf.vy * dt; lf.angle += lf.vAngle * dt;
      if (lf.x < -30) lf.x = viewWidth + 24;
      if (lf.y > viewHeight + 24) { lf.y = -20; lf.x = this._rand(0, viewWidth); }
    }
    for (const em of this.embers) {
      em.phase += dt * 4.5; em.x += (em.vx + Math.sin(em.phase) * 16) * dt; em.y += em.vy * dt;
      if (em.y < -20) { em.y = viewHeight + 12; em.x = this._rand(0, viewWidth); }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.age += dt;
      if (p.age >= p.life) { this.particles.splice(i, 1); continue; }
      if (p.type === 'feather') { p.sway += dt * 6; p.vx *= Math.max(0, 1 - dt * 2.6); p.vy = Math.min(88, p.vy + 220 * dt); p.x += (p.vx + Math.sin(p.sway) * 32) * dt; p.y += p.vy * dt; p.rot += p.vRot * dt; }
      else if (p.type === 'dust') { p.vx *= Math.max(0, 1 - dt * 3); p.x += p.vx * dt; p.y += p.vy * dt; p.radius += dt * 16; }
      else if (p.type === 'flame') { p.x += p.vx * dt; p.y += (p.vy - 45) * dt; p.vx *= Math.max(0, 1 - dt * 2.2); }
      else if (p.type === 'spark') { p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      else if (p.type === 'star') { p.vy += 280 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8; }
      else if (p.type === 'ring') p.radius = 10 + (p.age / p.life) * p.maxRadius;
    }
    if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i]; c.age += dt; c.y += c.vy * dt; c.vy *= Math.max(0, 1 - dt * 2.4);
      if (c.age >= c.life) this.callouts.splice(i, 1);
    }
  }

  render(ctx, cameraX, stageIndex = 0) {
    ctx.save();
    if (stageIndex <= 1) {
      for (const lf of this.ambientLeaves) {
        ctx.save(); ctx.translate(lf.x, lf.y); ctx.rotate(lf.angle); ctx.fillStyle = lf.color;
        ctx.beginPath(); ctx.moveTo(0, -lf.size); ctx.lineTo(lf.size * 0.65, -lf.size * 0.15); ctx.lineTo(lf.size * 0.4, lf.size * 0.75);
        ctx.lineTo(0, lf.size * 0.4); ctx.lineTo(-lf.size * 0.4, lf.size * 0.75); ctx.lineTo(-lf.size * 0.65, -lf.size * 0.15); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    } else {
      for (const em of this.embers) {
        ctx.fillStyle = em.color; ctx.globalAlpha = Math.max(0.1, 0.55 + Math.sin(em.phase) * 0.35);
        ctx.beginPath(); ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    for (const p of this.particles) {
      const sx = p.x - cameraX, t = p.age / p.life;
      ctx.globalAlpha = Math.max(0, 1 - t);
      if (p.type === 'feather') {
        ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.pal.body; ctx.beginPath(); ctx.ellipse(0, 0, p.len * 0.5, p.wid * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.pal.tip; ctx.beginPath(); ctx.ellipse(p.len * 0.32, 0, p.len * 0.18, p.wid * 0.36, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = p.pal.quill; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-p.len * 0.55, 0); ctx.lineTo(p.len * 0.45, 0); ctx.stroke(); ctx.restore();
      } else if (p.type === 'dust') { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(sx, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }
      else if (p.type === 'flame') {
        const r = Math.max(2, p.radius * (1 - t * 0.45)), g = ctx.createRadialGradient(sx, p.y, r * 0.12, sx, p.y, r);
        if (t < 0.35) { g.addColorStop(0, 'rgba(255,248,195,0.85)'); g.addColorStop(0.55, 'rgba(255,165,42,0.55)'); g.addColorStop(1, 'rgba(230,72,20,0)'); }
        else { g.addColorStop(0, 'rgba(255,145,36,0.72)'); g.addColorStop(0.6, 'rgba(215,48,18,0.35)'); g.addColorStop(1, 'rgba(160,22,10,0)'); }
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, p.y, r, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'spark') { ctx.strokeStyle = p.color; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(sx, p.y); ctx.lineTo(sx - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke(); }
      else if (p.type === 'ring') { ctx.strokeStyle = '#ffe588'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(sx, p.y, p.radius, 0, Math.PI * 2); ctx.stroke(); }
      else if (p.type === 'star') {
        ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot); ctx.fillStyle = '#ffe55c'; ctx.beginPath();
        for (let k = 0; k < 10; k++) { const r = k % 2 === 0 ? p.radius : p.radius * 0.45, a = (k * Math.PI) / 5; if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5c310a'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      }
    }

    ctx.globalAlpha = 1;
    for (const c of this.callouts) {
      const t = c.age / c.life;
      ctx.save(); ctx.globalAlpha = t < 0.72 ? 1 : Math.max(0, (1 - t) / 0.28);
      ctx.font = `900 ${Math.round(21 * c.scale)}px "Trebuchet MS", sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.lineWidth = 5; ctx.strokeStyle = '#241108'; ctx.strokeText(c.text, c.x - cameraX, c.y);
      ctx.fillStyle = c.color; ctx.fillText(c.text, c.x - cameraX, c.y); ctx.restore();
    }
    if (this.screenFlash.alpha > 0.01) { ctx.globalAlpha = this.screenFlash.alpha; ctx.fillStyle = this.screenFlash.color; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }
    ctx.restore();
  }
}
