// Expressive Thanksgiving particle effects: barbed turkey feathers, autumn maple leaves, hearth embers, oven flames, gravy splashes, and comic callouts.

import { createSeededRng } from '../config.js';
import { disc, ell, rgrad } from '../render/textures.js';

export function createParticleSystem() { return new ParticleSystem(); }
export function emitFeatherBurst(particles, x, y, count = 12, spread = 1) { particles.spawnFeatherBurst(x, y, count, spread); }
export function emitOvenEmbers(particles, x, y, dirX = -1, count = 8) { particles.spawnOvenFlame(x, y, dirX, count); }
export function emitAutumnLeaves(particles, width, height, stageIndex) { particles.seedAmbient(width, height, stageIndex); }

export class ParticleSystem {
  constructor() {
    this.particles = []; this.callouts = []; this.ambientLeaves = []; this.embers = [];
    this.screenFlash = { color: '#ff5232', alpha: 0 }; this.shakeTime = 0; this.shakeIntensity = 0; this._rng = createSeededRng(1337);
  }
  _r(a, b) { return a + this._rng() * (b - a); }

  seedAmbient(w, h, stageIndex, rng = null) {
    const nx = rng || createSeededRng(701 + stageIndex * 31), pk = (a, b) => a + nx() * (b - a);
    this.ambientLeaves = []; this.embers = [];
    if (stageIndex <= 1) for (let i = 0; i < 28; i++) this.ambientLeaves.push({ x: pk(0, w), y: pk(0, h * 0.88), vx: pk(-42, -16), vy: pk(16, 36), sz: pk(7, 14), a: pk(0, 6.28), va: pk(-2.2, 2.2), sw: pk(0, 6.28), col: LEAVES[Math.floor(nx() * 5)] });
    else for (let i = 0; i < 36; i++) this.embers.push({ x: pk(0, w), y: pk(h * 0.12, h), vx: pk(-20, 20), vy: pk(-72, -22), sz: pk(2.2, 5), ph: pk(0, 6.28), col: nx() > 0.35 ? '#ffc442' : '#ff6a28' });
  }

  spawnFeatherBurst(x, y, n = 12, sp = 1) { for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n)) * 6.28 + this._r(-0.4, 0.4), v = this._r(75, 225) * sp; this.particles.push({ t: 'feather', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 65 * sp, rot: this._r(0, 6.28), vr: this._r(-5, 5), sw: this._r(0, 6.28), len: this._r(14, 21), wid: this._r(5.5, 8), pal: FEATHERS[i & 3], age: 0, life: this._r(0.95, 1.55) }); } }
  spawnDustPuff(x, y, d = 0, n = 5) { for (let i = 0; i < n; i++) this.particles.push({ t: 'dust', x: x + this._r(-8, 8), y: y + this._r(-4, 2), vx: d * this._r(30, 85) + this._r(-35, 35), vy: this._r(-55, -14), r: this._r(5, 11), col: '#dfbf8f', age: 0, life: this._r(0.32, 0.56) }); }
  spawnGravySplash(x, y, n = 10) { for (let i = 0; i < n; i++) this.particles.push({ t: 'drop', x: x + this._r(-16, 16), y, vx: this._r(-150, 150), vy: this._r(-260, -90), r: this._r(4, 7.5), col: i % 2 ? '#c9853b' : '#8c5220', age: 0, life: this._r(0.45, 0.72) }); }
  spawnFlourCloud(x, y) { for (let i = 0; i < 16; i++) { const a = this._r(0, 6.28), v = this._r(35, 145); this.particles.push({ t: 'dust', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 35, r: this._r(13, 25), col: '#fff8ea', age: 0, life: this._r(0.65, 1.05) }); } }
  spawnOvenFlame(x, y, d = -1, n = 8) { for (let i = 0; i < n; i++) this.particles.push({ t: 'flame', x: x + this._r(-8, 8), y: y + this._r(-22, 22), vx: d * this._r(160, 340), vy: this._r(-75, 45), r: this._r(9, 20), age: 0, life: this._r(0.28, 0.52) }); }
  spawnKnifeSparks(x, y, n = 8) { for (let i = 0; i < n; i++) { const a = this._r(0, 6.28), v = this._r(120, 290); this.particles.push({ t: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 50, col: i % 2 ? '#ffe27a' : '#fff', age: 0, life: this._r(0.2, 0.36) }); } }
  spawnAcornRing(x, y) { this.particles.push({ t: 'ring', x, y, r: 10, maxR: 96, age: 0, life: 0.55 }); }
  spawnStars(x, y, n = 6) { for (let i = 0; i < n; i++) { const a = (i / Math.max(1, n)) * 6.28; this.particles.push({ t: 'star', x, y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 90 - 70, r: this._r(6, 10), rot: a, age: 0, life: 0.72 }); } }
  spawnCallout(x, y, text, color = '#ffe27a', scale = 1) {
    let cy = y;
    for (const c of this.callouts) if (Math.abs(c.x - x) < 170 && Math.abs(c.y - cy) < 34) cy = c.y - 34;
    this.callouts.push({ x, y: Math.max(118, cy), vy: -48, text, color, scale, age: 0, life: 1.2 });
  }
  triggerShake(i, d) { this.shakeIntensity = Math.max(this.shakeIntensity, i); this.shakeTime = Math.max(this.shakeTime, d); }
  triggerFlash(c, a) { this.screenFlash.color = c; this.screenFlash.alpha = Math.max(this.screenFlash.alpha, a); }
  getShakeOffset() { return this.shakeTime <= 0 ? { x: 0, y: 0 } : { x: Math.sin(this.shakeTime * 95) * this.shakeIntensity, y: Math.cos(this.shakeTime * 115) * this.shakeIntensity * 0.7 }; }

  update(dt, cameraX, w, h, st) {
    if (this.shakeTime > 0) { this.shakeTime = Math.max(0, this.shakeTime - dt); this.shakeIntensity *= Math.max(0, 1 - dt * 5); }
    if (this.screenFlash.alpha > 0) this.screenFlash.alpha = Math.max(0, this.screenFlash.alpha - dt * 2.4);
    if ((st <= 1 && !this.ambientLeaves.length) || (st >= 2 && !this.embers.length)) this.seedAmbient(w, h, st);
    for (const lf of this.ambientLeaves) { lf.sw += dt * 2.2; lf.x += (lf.vx + Math.sin(lf.sw) * 18) * dt; lf.y += lf.vy * dt; lf.a += lf.va * dt; if (lf.x < -30) lf.x = w + 24; if (lf.y > h + 24) { lf.y = -20; lf.x = this._r(0, w); } }
    for (const em of this.embers) { em.ph += dt * 4.5; em.x += (em.vx + Math.sin(em.ph) * 16) * dt; em.y += em.vy * dt; if (em.y < -20) { em.y = h + 12; em.x = this._r(0, w); } }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.age += dt; if (p.age >= p.life) { this.particles.splice(i, 1); continue; }
      if (p.t === 'feather') { p.sw += dt * 6; p.vx *= Math.max(0, 1 - dt * 2.6); p.vy = Math.min(88, p.vy + 220 * dt); p.x += (p.vx + Math.sin(p.sw) * 32) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
      else if (p.t === 'dust') { p.vx *= Math.max(0, 1 - dt * 3); p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 16; }
      else if (p.t === 'drop') { p.vy += 760 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      else if (p.t === 'flame') { p.x += p.vx * dt; p.y += (p.vy - 45) * dt; p.vx *= Math.max(0, 1 - dt * 2.2); }
      else if (p.t === 'spark') { p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      else if (p.t === 'star') { p.vy += 280 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8; }
      else if (p.t === 'ring') p.r = 10 + (p.age / p.life) * p.maxR;
    }
    if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
    for (let i = this.callouts.length - 1; i >= 0; i--) { const c = this.callouts[i]; c.age += dt; c.y += c.vy * dt; c.vy *= Math.max(0, 1 - dt * 2.4); if (c.age >= c.life) this.callouts.splice(i, 1); }
  }

  render(ctx, cameraX, st = 0) {
    ctx.save();
    if (st <= 1) for (const lf of this.ambientLeaves) {
      ctx.save(); ctx.translate(lf.x, lf.y); ctx.rotate(lf.a); ctx.fillStyle = lf.col;
      ctx.beginPath(); ctx.moveTo(0, -lf.sz); ctx.lineTo(lf.sz * 0.65, -lf.sz * 0.15); ctx.lineTo(lf.sz * 0.4, lf.sz * 0.75); ctx.lineTo(0, lf.sz * 0.4); ctx.lineTo(-lf.sz * 0.4, lf.sz * 0.75); ctx.lineTo(-lf.sz * 0.65, -lf.sz * 0.15); ctx.closePath(); ctx.fill(); ctx.restore();
    } else for (const em of this.embers) {
      const a = Math.max(0.15, 0.65 + Math.sin(em.ph) * 0.35), r = em.sz * 2.4;
      disc(ctx, em.x, em.y, r, rgrad(ctx, em.x, em.y, 0.5, em.x, em.y, r, [[0, `rgba(255,245,190,${a})`], [0.45, em.col], [1, 'rgba(255,90,20,0)']]));
    }
    for (const p of this.particles) {
      const sx = p.x - cameraX, u = p.age / p.life; ctx.globalAlpha = Math.max(0, 1 - u);
      if (p.t === 'feather') {
        ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot);
        ell(ctx, 0, 0, p.len * 0.5, p.wid * 0.5, 0, p.pal.b); ell(ctx, p.len * 0.32, 0, p.len * 0.18, p.wid * 0.36, 0, p.pal.t);
        ctx.strokeStyle = p.pal.q; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-p.len * 0.55, 0); ctx.lineTo(p.len * 0.45, 0); ctx.stroke(); ctx.restore();
      } else if (p.t === 'dust' || p.t === 'drop') disc(ctx, sx, p.y, p.r, p.col);
      else if (p.t === 'flame') { const r = Math.max(2, p.r * (1 - u * 0.45)); disc(ctx, sx, p.y, r, rgrad(ctx, sx, p.y, r * 0.12, sx, p.y, r, [[0, u < 0.35 ? 'rgba(255,250,205,0.92)' : 'rgba(255,155,40,0.78)'], [0.55, 'rgba(245,95,22,0.48)'], [1, 'rgba(180,24,10,0)']])); }
      else if (p.t === 'spark') { ctx.strokeStyle = p.col; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(sx, p.y); ctx.lineTo(sx - p.vx * 0.035, p.y - p.vy * 0.035); ctx.stroke(); }
      else if (p.t === 'ring') disc(ctx, sx, p.y, p.r, null, '#ffe588', 3.5);
      else if (p.t === 'star') {
        ctx.save(); ctx.translate(sx, p.y); ctx.rotate(p.rot); ctx.fillStyle = '#ffe55c'; ctx.beginPath();
        for (let k = 0; k < 10; k++) { const r = k % 2 ? p.r * 0.45 : p.r, a = (k * Math.PI) / 5; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5c310a'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    for (const c of this.callouts) {
      const u = c.age / c.life; ctx.save(); ctx.globalAlpha = u < 0.72 ? 1 : Math.max(0, (1 - u) / 0.28);
      ctx.font = `900 ${Math.round(21 * c.scale)}px "Trebuchet MS", sans-serif`; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      ctx.lineWidth = 5; ctx.strokeStyle = '#241108'; ctx.strokeText(c.text, c.x - cameraX, c.y); ctx.fillStyle = c.color; ctx.fillText(c.text, c.x - cameraX, c.y); ctx.restore();
    }
    if (this.screenFlash.alpha > 0.01) { ctx.globalAlpha = this.screenFlash.alpha; ctx.fillStyle = this.screenFlash.color; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); }
    ctx.restore();
  }
}

const FEATHERS = [{ b: '#8f371c', t: '#fff0ca', q: '#331208' }, { b: '#cf5b1c', t: '#ffe4a8', q: '#4a1b08' }, { b: '#e69422', t: '#fff4d1', q: '#522a08' }, { b: '#6e2324', t: '#f6d6bc', q: '#2b0d0e' }];
const LEAVES = ['#d14228', '#e87620', '#f0af2b', '#b52e22', '#db5d22'];
