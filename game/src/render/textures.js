// Deterministic procedural material atlas & shared Canvas2D shading primitives: bricks, wood grain, hammered copper, and burlap weave.

import { createSeededRng } from '../config.js';

export function buildMaterialAtlas(ctx) {
  return {
    brick: createBrickWallTexture(ctx),
    wood: createWoodGrainTexture(ctx, '#7a4522', '#522911', '#9c5d30'),
    butcherOak: createWoodGrainTexture(ctx, '#dfb272', '#b88246', '#f2cf94'),
    barnTimber: createWoodGrainTexture(ctx, '#582c16', '#38190b', '#753d1e'),
    copper: createCopperPatinaTexture(ctx),
    burlap: createBurlapWeaveTexture(ctx),
  };
}

export function createBrickWallTexture(ctx) {
  const c = makeCanvas(144, 112), g = c.getContext('2d'), rng = createSeededRng(401);
  g.fillStyle = '#2d1410'; g.fillRect(0, 0, 144, 112);
  const tones = ['#6e2b1d', '#7c3221', '#5f2318', '#873a25', '#67271b'];
  for (let r = 0; r < 4; r++) {
    const off = (r % 2) * 36;
    for (let x = -36; x < 144; x += 72) {
      const bx = x + off + 2, by = r * 28 + 2;
      g.fillStyle = tones[Math.floor(rng() * tones.length)]; g.fillRect(bx, by, 68, 24);
      g.fillStyle = 'rgba(255,190,125,0.12)'; g.fillRect(bx, by, 68, 4);
      g.fillStyle = 'rgba(18,6,4,0.22)'; g.fillRect(bx, by + 20, 68, 4);
      for (let s = 0; s < 12; s++) { g.fillStyle = rng() > 0.5 ? 'rgba(255,180,120,0.09)' : 'rgba(20,8,5,0.14)'; g.fillRect(bx + rng() * 64, by + rng() * 20, 2 + rng() * 3, 2); }
    }
  }
  return ctx.createPattern(c, 'repeat');
}

export function createWoodGrainTexture(ctx, base, dark, light) {
  const c = makeCanvas(128, 64), g = c.getContext('2d'), rng = createSeededRng(base.charCodeAt(1) * 97);
  g.fillStyle = base; g.fillRect(0, 0, 128, 64);
  for (let y = 0; y < 64; y += 3) {
    g.strokeStyle = y % 6 === 0 ? dark : light; g.globalAlpha = y % 6 === 0 ? 0.24 : 0.14; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(42, y + (rng() - 0.5) * 4, 86, y + (rng() - 0.5) * 4, 128, y); g.stroke();
  }
  g.globalAlpha = 0.22; g.strokeStyle = dark; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 32); g.lineTo(128, 32); g.stroke(); g.globalAlpha = 1;
  return ctx.createPattern(c, 'repeat');
}

export function createCopperPatinaTexture(ctx) {
  const c = makeCanvas(64, 64), g = c.getContext('2d'), rng = createSeededRng(733);
  g.fillStyle = lgrad(g, 0, 0, 64, 64, [[0, '#f3a765'], [0.5, '#c7622c'], [1, '#7c3216']]); g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 24; i++) {
    g.fillStyle = rng() > 0.45 ? 'rgba(255,232,186,0.16)' : 'rgba(55,18,6,0.14)';
    g.beginPath(); g.arc(rng() * 64, rng() * 64, 3 + rng() * 5, 0, 6.28); g.fill();
  }
  return ctx.createPattern(c, 'repeat');
}

export function createBurlapWeaveTexture(ctx) {
  const c = makeCanvas(32, 32), g = c.getContext('2d');
  g.fillStyle = '#e5cf9c'; g.fillRect(0, 0, 32, 32); g.strokeStyle = 'rgba(130,86,36,0.22)'; g.lineWidth = 1.5;
  for (let i = 0; i < 32; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 32); g.moveTo(0, i); g.lineTo(32, i); g.stroke(); }
  return ctx.createPattern(c, 'repeat');
}

export function drawRoundedRect(ctx, x, y, w, h, r, f, s, lw = 2.4) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw; ctx.stroke(); } }
export function disc(ctx, x, y, r, f, s, lw = 2.2) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw; ctx.stroke(); } }
export function ell(ctx, x, y, rx, ry, rot, f, s, lw = 2.2) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, 6.28); if (f) { ctx.fillStyle = f; ctx.fill(); } if (s) { ctx.strokeStyle = s; ctx.lineWidth = lw; ctx.stroke(); } }
export function lgrad(ctx, x0, y0, x1, y1, st) { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) g.addColorStop(o, c); return g; }
export function rgrad(ctx, x0, y0, r0, x1, y1, r1, st) { const g = ctx.createRadialGradient(x0, y0, r0, x1, y1, r1); for (const [o, c] of st) g.addColorStop(o, c); return g; }
export function glow(ctx, x, y, r, c0, c1 = 'rgba(255,160,60,0)') { disc(ctx, x, y, r, rgrad(ctx, x, y, 4, x, y, r, [[0, c0], [1, c1]])); }
export function fnt(spec) { return `${spec} "Trebuchet MS", sans-serif`; }
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
