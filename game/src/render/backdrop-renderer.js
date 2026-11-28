// Studio 2.5D parallax Thanksgiving backdrop renderer with procedural textures, painterly foliage, architectural bays, and oblique perspective floors.

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, STAGE_DEFINITIONS, VIEW_HEIGHT, VIEW_WIDTH, clamp, lerp } from '../config.js';
import { disc, ell, fnt, glow, lgrad, rgrad, drawRoundedRect as rr } from './textures.js';

export function renderAutumnBackdrop(ctx, cameraX, time, stageBlendPos, atlas = null) {
  const m = clamp(stageBlendPos / PIXELS_PER_METER, 0, 1200), i = clamp(Math.floor(m / 300), 0, 3);
  const st = STAGE_DEFINITIONS[i], nx = STAGE_DEFINITIONS[Math.min(3, i + 1)];
  const bl = i < 3 && (i + 1) * 300 - m < 28 ? clamp(1 - ((i + 1) * 300 - m) / 28, 0, 1) : 0;
  ctx.fillStyle = lgrad(ctx, 0, 0, 0, GROUND_Y, [[0, mixHex(st.skyTop, nx.skyTop, bl)], [0.54, mixHex(st.skyMid, nx.skyMid, bl)], [1, mixHex(st.skyLow, nx.skyLow, bl)]]);
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  const fE = 300 * PIXELS_PER_METER, bE = 600 * PIXELS_PER_METER, pE = 900 * PIXELS_PER_METER, lw = cameraX - 200, rw = cameraX + VIEW_WIDTH + 200;
  if (lw < fE + 160) renderFarmyardStage(ctx, cameraX, time, fE, atlas);
  if (rw > fE - 160 && lw < bE + 160) renderHarvestBarnStage(ctx, cameraX, time, fE, bE, atlas);
  if (rw > bE - 160 && lw < pE + 160) renderApplewoodPantryStage(ctx, cameraX, time, bE, pE, atlas);
  if (rw > pE - 160) renderRoastingKitchenStage(ctx, cameraX, time, pE, atlas);
  renderPerspectiveStageFloor(ctx, cameraX, fE, bE, pE);
}

export function renderFarmyardStage(ctx, cameraX, time, farmEnd, atlas) {
  const cr = clamp(farmEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (cr <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cr, GROUND_Y); ctx.clip();
  const sunX = 930 - cameraX * 0.05;
  glow(ctx, sunX, 178, 320, 'rgba(255,248,200,0.95)', 'rgba(240,126,52,0)'); disc(ctx, sunX, 178, 56, '#fff6cc');
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 290 - cameraX * 0.07 + time * 7) % (VIEW_WIDTH + 340)) - 150, cy = 84 + (i % 3) * 44;
    ctx.fillStyle = lgrad(ctx, cx, cy - 24, cx, cy + 20, [[0, 'rgba(255,244,210,0.42)'], [1, 'rgba(235,134,76,0.12)']]);
    ctx.beginPath(); ctx.ellipse(cx, cy, 94, 22, 0, 0, 6.28); ctx.ellipse(cx + 46, cy - 11, 58, 19, 0, 0, 6.28); ctx.ellipse(cx - 48, cy - 6, 48, 16, 0, 0, 6.28); ctx.fill();
  }
  drawHills(ctx, cameraX * 0.14, 348, 52, 0.0029, '#622e36'); drawHills(ctx, cameraX * 0.26, 412, 36, 0.0042, '#8b3e24'); drawHills(ctx, cameraX * 0.36, 464, 22, 0.0056, '#a95424');
  const pals = [['#8c2418', '#cb4624', '#f4a236'], ['#9e3d16', '#e07a22', '#ffd15c'], ['#751c1a', '#b83222', '#ed7a32'], ['#8a4b16', '#d88e24', '#ffe074']];
  for (let i = -1; i < 16; i++) { const wx = i * 195, sx = wx - cameraX * 0.32; if (sx > -130 && sx < VIEW_WIDTH + 130) drawTree(ctx, sx, 442 + Math.sin(wx * 0.0042 + 1.2) * 24, 0.85 + (Math.abs(i) % 3) * 0.16, pals[Math.abs(i) & 3]); }
  for (let b = 0; b < 3; b++) {
    const bx = 430 + b * 960 - cameraX * 0.44; if (bx < -230 || bx > VIEW_WIDTH + 230) continue;
    ctx.fillStyle = lgrad(ctx, bx + 122, 0, bx + 168, 0, [[0, '#b57452'], [0.6, '#8c5138'], [1, '#5d3222']]); ctx.fillRect(bx + 122, 336, 46, 174);
    ctx.fillStyle = '#5c3124'; ctx.beginPath(); ctx.arc(bx + 145, 336, 23, Math.PI, 0); ctx.fill();
    poly(ctx, [[bx, 510], [bx, 402], [bx + 26, 355], [bx + 68, 334], [bx + 110, 355], [bx + 136, 402], [bx + 136, 510]], '#99271e');
    ctx.strokeStyle = 'rgba(42,10,8,0.28)'; ctx.lineWidth = 2; for (let px = bx + 16; px < bx + 132; px += 16) ln(ctx, px, 396, px, 510);
    poly(ctx, [[bx - 4, 404], [bx + 26, 354], [bx + 68, 332], [bx + 110, 354], [bx + 140, 404]], null, '#fbe9c8', 5, false);
    ctx.fillStyle = '#6c1b14'; ctx.fillRect(bx + 44, 430, 48, 78); ctx.strokeStyle = '#f8e6c6'; ctx.lineWidth = 4; ctx.strokeRect(bx + 44, 430, 48, 78);
    ln(ctx, bx + 44, 430, bx + 92, 508); ln(ctx, bx + 92, 430, bx + 44, 508);
    ctx.fillStyle = '#ffe592'; ctx.fillRect(bx + 54, 372, 28, 28); ctx.strokeRect(bx + 54, 372, 28, 28);
    const mx = bx - 56; poly(ctx, [[mx - 18, 510], [mx - 4, 336], [mx + 4, 336], [mx + 18, 510]], null, '#472414', 3.2, false);
    ctx.save(); ctx.translate(mx, 340); ctx.rotate(time * 0.9 + b); ctx.fillStyle = '#e5c08a'; ctx.strokeStyle = '#472414'; ctx.lineWidth = 1.6;
    for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-4, 5, 8, 36); ctx.strokeRect(-4, 5, 8, 36); }
    ctx.restore();
  }
  ctx.fillStyle = lgrad(ctx, 0, 496, 0, GROUND_Y, [[0, '#966224'], [1, '#5e3916']]); ctx.fillRect(0, 496, VIEW_WIDTH, GROUND_Y - 496);
  ctx.fillStyle = atlas ? atlas.wood : '#6b401e'; ctx.fillRect(0, 516, VIEW_WIDTH, 11); ctx.fillRect(0, 546, VIEW_WIDTH, 11);
  for (let fx = (-(cameraX * 0.72) % 146) - 146; fx < VIEW_WIDTH + 146; fx += 146) {
    ctx.fillStyle = '#6e4220'; ctx.fillRect(fx, 492, 18, 96); ctx.fillStyle = '#a36b38'; ctx.fillRect(fx + 2, 492, 6, 96);
    ctx.strokeStyle = '#261208'; ctx.lineWidth = 1.8; ctx.strokeRect(fx, 492, 18, 96);
  }
  ctx.restore();
}

export function renderHarvestBarnStage(ctx, cameraX, time, barnStart, barnEnd, atlas) {
  const left = clamp(barnStart - cameraX, 0, VIEW_WIDTH), right = clamp(barnEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (right <= left) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, GROUND_Y); ctx.clip();
  if (atlas) { ctx.save(); ctx.translate(-(cameraX * 0.65) % 128, 0); ctx.fillStyle = atlas.barnTimber; ctx.fillRect(left - 140, 0, right - left + 280, GROUND_Y); ctx.restore(); }
  ctx.fillStyle = lgrad(ctx, 0, 0, 0, GROUND_Y, [[0, 'rgba(18,7,4,0.36)'], [0.5, 'rgba(65,28,12,0.10)'], [1, 'rgba(28,12,5,0.34)']]); ctx.fillRect(left, 0, right - left, GROUND_Y);
  for (let wx = Math.floor((barnStart + 110) / 420) * 420; wx < barnEnd; wx += 420) {
    const sx = (wx - barnStart) - (cameraX - barnStart) * 0.76; if (sx < -260 || sx > VIEW_WIDTH + 260) continue;
    ctx.fillStyle = lgrad(ctx, sx, 112, sx, 236, [[0, '#5a3656'], [0.5, '#e8823c'], [1, '#ffe284']]); ctx.fillRect(sx - 64, 112, 128, 124);
    disc(ctx, sx + 24, 146, 20, '#fff6cc');
    ctx.fillStyle = '#8b3a20'; ctx.beginPath(); ctx.moveTo(sx - 64, 236); ctx.quadraticCurveTo(sx - 18, 190, sx + 64, 208); ctx.lineTo(sx + 64, 236); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#33170b'; ctx.lineWidth = 8; ctx.strokeRect(sx - 64, 112, 128, 124);
    ctx.lineWidth = 4; ln(ctx, sx, 112, sx, 236); ln(ctx, sx - 64, 174, sx + 64, 174);
    poly(ctx, [[sx - 58, 236], [sx + 58, 236], [sx - 92, GROUND_Y], [sx - 245, GROUND_Y]], lgrad(ctx, sx, 152, sx - 165, GROUND_Y, [[0, 'rgba(255,232,144,0.34)'], [0.6, 'rgba(255,204,102,0.14)'], [1, 'rgba(255,180,80,0.02)']]));
    ctx.fillStyle = '#472312'; ctx.fillRect(sx + 158, 0, 40, GROUND_Y); ctx.fillStyle = '#6c381e'; ctx.fillRect(sx + 164, 0, 12, GROUND_Y);
    ctx.strokeStyle = '#3a1c0e'; ctx.lineWidth = 14; ln(ctx, sx + 160, 140, sx + 100, 62); ln(ctx, sx + 196, 140, sx + 256, 62);
    ctx.fillStyle = '#754418'; ctx.fillRect(sx - 180, 476, 130, 112); ctx.fillStyle = '#9c5f22'; ctx.fillRect(sx - 174, 480, 118, 22);
    const lx = sx + 94 + Math.sin(time * 1.8 + wx * 0.01) * 5;
    ctx.strokeStyle = '#241209'; ctx.lineWidth = 3; ln(ctx, sx + 94, 48, lx, 152);
    glow(ctx, lx, 168, 108, 'rgba(255,226,130,0.88)');
    ctx.fillStyle = '#3b2112'; ctx.fillRect(lx - 10, 152, 20, 6); ctx.fillStyle = '#fff3b5'; ctx.fillRect(lx - 7, 158, 14, 20); ctx.strokeRect(lx - 7, 158, 14, 20);
    drawBarnWallDecor(ctx, sx, time);
  }
  ctx.fillStyle = '#2c140a'; ctx.fillRect(left, 0, right - left, 58); ctx.restore();
}

export function renderApplewoodPantryStage(ctx, cameraX, time, pantryStart, pantryEnd, atlas) {
  const left = clamp(pantryStart - cameraX, 0, VIEW_WIDTH), right = clamp(pantryEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (right <= left) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, GROUND_Y); ctx.clip();
  ctx.fillStyle = atlas ? atlas.wood : '#42241c'; ctx.fillRect(left, 434, right - left, GROUND_Y - 434); ctx.fillStyle = '#824d2c'; ctx.fillRect(left, 428, right - left, 10);
  const jars = ['#d93829', '#f0a732', '#6fa143', '#c85a32', '#e8c468'];
  for (let wx = Math.floor(pantryStart / 320) * 320; wx < pantryEnd + 320; wx += 320) {
    const sx = (wx - pantryStart) - (cameraX - pantryStart) * 0.8; if (sx < -260 || sx > VIEW_WIDTH + 260) continue;
    ctx.fillStyle = '#331a14'; ctx.fillRect(sx, 114, 224, 304); ctx.strokeStyle = '#734126'; ctx.lineWidth = 6; ctx.strokeRect(sx, 114, 224, 304);
    for (let row = 0; row < 3; row++) {
      const sy = 196 + row * 94; ctx.fillStyle = '#8c5330'; ctx.fillRect(sx + 4, sy, 216, 12);
      for (let j = 0; j < 5; j++) {
        const jx = sx + 22 + j * 40, jh = 34 + ((j + row) % 2) * 10;
        rr(ctx, jx, sy - jh, 24, jh, 6, jars[(j + row * 2) % 5]); ctx.fillStyle = 'rgba(255,250,230,0.42)'; ctx.fillRect(jx + 4, sy - jh + 5, 5, jh - 12);
        ctx.fillStyle = '#d49a4c'; ctx.fillRect(jx + 2, sy - jh - 6, 20, 6);
      }
    }
    glow(ctx, sx + 265, 244, 125, 'rgba(255,205,115,0.44)');
  }
  ctx.fillStyle = '#2a1410'; ctx.fillRect(left, 0, right - left, 48); ctx.restore();
}

export function renderRoastingKitchenStage(ctx, cameraX, time, kitchenStart, atlas) {
  const left = clamp(kitchenStart - cameraX, 0, VIEW_WIDTH);
  if (left >= VIEW_WIDTH) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, VIEW_WIDTH - left, GROUND_Y); ctx.clip();
  const gateX = COURSE_LENGTH_PX + 10 - cameraX, kRight = Math.min(VIEW_WIDTH, gateX - 4);
  if (kRight > left) {
    if (atlas) { ctx.save(); ctx.translate(-(cameraX * 0.72) % 144, 0); ctx.fillStyle = atlas.brick; ctx.fillRect(left - 160, 50, kRight - left + 320, GROUND_Y - 50); ctx.restore(); }
    ctx.fillStyle = lgrad(ctx, 0, 50, 0, GROUND_Y, [[0, 'rgba(18,7,6,0.52)'], [0.55, 'rgba(55,18,12,0.14)'], [1, 'rgba(32,12,8,0.40)']]); ctx.fillRect(left, 50, kRight - left, GROUND_Y - 50);
    ctx.fillStyle = atlas ? atlas.barnTimber : '#58281c'; ctx.fillRect(left, 444, kRight - left, GROUND_Y - 444);
    ctx.fillStyle = '#e39a50'; ctx.fillRect(left, 438, kRight - left, 8); ctx.fillStyle = '#2a130c'; ctx.fillRect(left, 446, kRight - left, 3);
  }
  const b0 = Math.max(0, Math.floor((cameraX - kitchenStart - 400) / 430)), b1 = Math.ceil((cameraX - kitchenStart + VIEW_WIDTH + 400) / 430);
  for (let b = b0; b <= b1; b++) {
    const sx = b * 430 + 190 - (cameraX - kitchenStart) * 0.84; if (sx < -260 || sx > Math.min(VIEW_WIDTH + 260, gateX - 165)) continue;
    const v = ((b % 3) + 3) % 3;
    if (v === 0) { drawKitchenWindow(ctx, sx, 174); drawHerbRack(ctx, sx + 148, 174); }
    else if (v === 1) { drawSconce(ctx, sx - 122, 220, time); drawMenuBoard(ctx, sx - 106, 146, 218, 146); drawSconce(ctx, sx + 128, 220, time); }
    else { drawPieShelf(ctx, sx - 76, 158, time); drawDinnerClock(ctx, sx + 132, 194); }
  }
  if (gateX < VIEW_WIDTH + 80) {
    const fx = Math.max(left, gateX - 24);
    ctx.fillStyle = lgrad(ctx, 0, 0, 0, GROUND_Y, [[0, '#442c4c'], [0.42, '#dc7236'], [1, '#ffe58a']]); ctx.fillRect(fx, 0, VIEW_WIDTH - fx, GROUND_Y);
    glow(ctx, gateX + 240, 200, 290, 'rgba(255,250,204,0.95)'); disc(ctx, gateX + 240, 200, 52, '#fff8d4');
    ctx.fillStyle = '#8b4124'; ctx.beginPath(); ctx.moveTo(fx, GROUND_Y); ctx.quadraticCurveTo(fx + 220, 392, VIEW_WIDTH + 40, 446); ctx.lineTo(VIEW_WIDTH + 40, GROUND_Y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a85924'; ctx.beginPath(); ctx.moveTo(fx, GROUND_Y); ctx.quadraticCurveTo(fx + 180, 466, VIEW_WIDTH + 40, 494); ctx.lineTo(VIEW_WIDTH + 40, GROUND_Y); ctx.closePath(); ctx.fill();
    const fp = [['#9e3d16', '#e07a22', '#ffd15c'], ['#751c1a', '#c93c24', '#f28b30'], ['#8a4b16', '#e59c24', '#ffe57a']];
    for (let t = 0; t < 3; t++) drawTree(ctx, gateX + 120 + t * 115, 488 - (t === 1 ? 14 : 0), 0.88, fp[t]);
    if (gateX - 58 > left) { ctx.fillStyle = '#472a20'; ctx.fillRect(gateX - 56, 0, 46, GROUND_Y); ctx.fillStyle = '#6c4230'; ctx.fillRect(gateX - 48, 0, 14, GROUND_Y); }
  }
  if (kRight > left) {
    ctx.fillStyle = '#241816'; ctx.fillRect(left, 68, kRight - left, 10);
    for (let px = (-(cameraX * 0.88) % 190) - 190; px < kRight - 22; px += 190) {
      if (px < left - 40) continue;
      poly(ctx, [[px - 22, 118], [px + 22, 118], [px + 104, 450], [px - 104, 450]], lgrad(ctx, px, 112, px, 450, [[0, 'rgba(255,224,136,0.20)'], [1, 'rgba(255,190,90,0)']]));
      ctx.strokeStyle = '#3d2f2c'; ctx.lineWidth = 3; ln(ctx, px, 76, px, 102); disc(ctx, px, 117, 9, '#fff6bc');
      ctx.fillStyle = lgrad(ctx, px - 26, 98, px + 26, 120, [[0, '#f7b676'], [0.55, '#c9622e'], [1, '#7a3318']]);
      ctx.beginPath(); ctx.arc(px, 118, 24, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#221009'; ctx.lineWidth = 2.4; ctx.stroke();
    }
  }
  ctx.fillStyle = lgrad(ctx, 0, GROUND_Y, 0, 260, [[0, `rgba(255,124,42,${0.16 + Math.sin(time * 6.5) * 0.03})`], [1, 'rgba(255,118,38,0)']]);
  ctx.fillRect(left, 260, Math.max(0, kRight - left), GROUND_Y - 260); ctx.restore();
}

export function renderPerspectiveStageFloor(ctx, cameraX, farmEnd, barnEnd, pantryEnd) {
  const fh = VIEW_HEIGHT - GROUND_Y;
  for (const sec of [{ s: -400, e: farmEnd, m: 'farm' }, { s: farmEnd, e: barnEnd, m: 'barn' }, { s: barnEnd, e: pantryEnd, m: 'pantry' }, { s: pantryEnd, e: COURSE_LENGTH_PX + 2000, m: 'kitchen' }]) {
    const sx = clamp(sec.s - cameraX, 0, VIEW_WIDTH), ex = clamp(sec.e - cameraX, 0, VIEW_WIDTH); if (ex <= sx) continue;
    ctx.save(); ctx.beginPath(); ctx.rect(sx, GROUND_Y, ex - sx, fh); ctx.clip();
    if (sec.m === 'kitchen' || sec.m === 'pantry') {
      const rows = [0, 24, 54, 92, fh], lA = sec.m === 'kitchen' ? '#f3dfc0' : '#c9b394', dA = sec.m === 'kitchen' ? '#a6432b' : '#6b422d', lB = sec.m === 'kitchen' ? '#dfcaa5' : '#b29b7c', dB = sec.m === 'kitchen' ? '#8c3521' : '#583422';
      for (let r = 0; r < 4; r++) {
        const y0 = GROUND_Y + rows[r], y1 = GROUND_Y + rows[r + 1], s0 = 1 + r * 0.16, s1 = 1 + (r + 1) * 0.16;
        for (let i = Math.floor((cameraX + sx - 320) / 74) - 2; i <= Math.ceil((cameraX + ex + 320) / 74) + 2; i++) {
          const w0 = i * 74 - cameraX, w1 = w0 + 74, p0 = 640 + (w0 - 640) * s0, p1 = 640 + (w1 - 640) * s0, q0 = 640 + (w0 - 640) * s1, q1 = 640 + (w1 - 640) * s1;
          if (Math.max(p1, q1) < sx - 4 || Math.min(p0, q0) > ex + 4) continue;
          const ev = ((i + r) & 1) === 0; poly(ctx, [[p0, y0], [p1, y0], [q1, y1], [q0, y1]], r < 2 ? (ev ? lA : dA) : (ev ? lB : dB), 'rgba(34,14,9,0.22)', 1.4);
        }
      }
      ctx.fillStyle = lgrad(ctx, 0, GROUND_Y, 0, VIEW_HEIGHT, [[0, 'rgba(20,8,5,0.28)'], [0.24, 'rgba(255,232,185,0.06)'], [1, 'rgba(18,7,4,0.45)']]); ctx.fillRect(sx, GROUND_Y, ex - sx, fh);
    } else if (sec.m === 'barn') {
      ctx.fillStyle = lgrad(ctx, 0, GROUND_Y, 0, VIEW_HEIGHT, [[0, '#8d572a'], [0.55, '#683c1c'], [1, '#3b1f0d']]); ctx.fillRect(sx, GROUND_Y, ex - sx, fh);
      ctx.strokeStyle = 'rgba(28,12,5,0.44)'; ctx.lineWidth = 2;
      for (const dy of [22, 48, 80, 114]) ln(ctx, sx, GROUND_Y + dy, ex, GROUND_Y + dy);
      for (let wx = Math.floor((cameraX + sx - 200) / 110) * 110; wx < cameraX + ex + 240; wx += 110) {
        const x0 = wx - cameraX; ctx.strokeStyle = 'rgba(28,12,5,0.44)'; ln(ctx, x0, GROUND_Y, 640 + (x0 - 640) * 1.48, VIEW_HEIGHT);
        ctx.strokeStyle = '#dfa036'; ln(ctx, x0 + 18, GROUND_Y + 34, x0 + 36, GROUND_Y + 38); ln(ctx, x0 + 54, GROUND_Y + 72, x0 + 74, GROUND_Y + 67);
      }
    } else {
      ctx.fillStyle = lgrad(ctx, 0, GROUND_Y, 0, VIEW_HEIGHT, [[0, '#a67434'], [0.25, '#8a5926'], [0.7, '#643d1a'], [1, '#3d230e']]); ctx.fillRect(sx, GROUND_Y, ex - sx, fh);
      ctx.fillStyle = '#759138'; ctx.fillRect(sx, GROUND_Y, ex - sx, 14); ctx.fillStyle = '#536b28'; ctx.fillRect(sx, VIEW_HEIGHT - 22, ex - sx, 22);
      for (let wx = Math.floor((cameraX + sx) / 56) * 56; wx < cameraX + ex + 56; wx += 56) {
        const x = wx - cameraX, h = Math.abs(Math.sin(wx * 0.031));
        poly(ctx, [[x, GROUND_Y + 4], [x + 6, GROUND_Y - 10 - h * 5], [x + 12, GROUND_Y + 4]], '#99b044');
        ell(ctx, x + 22, GROUND_Y + 34 + h * 52, 8, 3.5, h * 2, h > 0.5 ? '#c84b24' : '#e69926');
      }
    }
    ctx.restore();
  }
  ctx.fillStyle = '#24120a'; ctx.fillRect(0, GROUND_Y - 2, VIEW_WIDTH, 4);
}

function drawTree(ctx, x, y, sc, pal) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.fillStyle = '#472515'; ctx.beginPath(); ctx.moveTo(-9, 34); ctx.quadraticCurveTo(-6, -4, -12, -26); ctx.lineTo(-4, -26); ctx.lineTo(0, -14); ctx.lineTo(7, -28); ctx.lineTo(14, -25); ctx.quadraticCurveTo(6, -2, 10, 34); ctx.closePath(); ctx.fill();
  for (const [px, py, r, ci] of [[-26, -34, 24, 0], [26, -36, 25, 0], [0, -52, 34, 1], [-18, -48, 22, 1], [18, -50, 22, 1], [6, -62, 18, 2], [-10, -58, 15, 2]]) disc(ctx, px, py, r, pal[ci]);
  ctx.restore();
}
function drawKitchenWindow(ctx, sx, cy) {
  ctx.save();
  const p = () => { ctx.beginPath(); ctx.moveTo(sx - 66, cy + 130); ctx.lineTo(sx - 66, cy); ctx.arc(sx, cy, 66, Math.PI, 0); ctx.lineTo(sx + 66, cy + 130); ctx.closePath(); };
  p(); ctx.fillStyle = lgrad(ctx, sx, cy - 66, sx, cy + 130, [[0, '#5a3656'], [0.5, '#e87838'], [1, '#ffe07c']]); ctx.fill();
  disc(ctx, sx + 18, cy + 20, 22, '#fff5c8'); disc(ctx, sx - 30, cy + 108, 34, '#82281e'); disc(ctx, sx + 28, cy + 112, 36, '#82281e');
  ctx.strokeStyle = '#3b1e14'; ctx.lineWidth = 8; p(); ctx.stroke(); ctx.lineWidth = 4; ln(ctx, sx, cy - 66, sx, cy + 130); ln(ctx, sx - 66, cy + 36, sx + 66, cy + 36);
  poly(ctx, [[sx - 56, cy + 130], [sx + 56, cy + 130], [sx + 150, GROUND_Y], [sx - 18, GROUND_Y]], lgrad(ctx, sx, cy + 40, sx + 90, GROUND_Y, [[0, 'rgba(255,228,136,0.20)'], [1, 'rgba(255,195,95,0)']])); ctx.restore();
}
function drawHerbRack(ctx, x, y) {
  ctx.save(); ctx.fillStyle = '#2d1a14'; ctx.fillRect(x - 56, y, 112, 8);
  ctx.strokeStyle = '#c4a16a'; ctx.lineWidth = 3; ln(ctx, x - 36, y + 8, x - 36, y + 76);
  for (let i = 0; i < 4; i++) disc(ctx, x - 36 + (i % 2 === 0 ? -6 : 6), y + 26 + i * 15, 8, i % 2 === 0 ? '#f5ebd1' : '#c93828');
  ctx.strokeStyle = '#5f9446'; ctx.lineWidth = 4; ln(ctx, x, y + 8, x - 6, y + 70); ln(ctx, x, y + 8, x + 8, y + 66);
  ctx.strokeStyle = '#332420'; ctx.lineWidth = 5; ln(ctx, x + 38, y + 8, x + 38, y + 48);
  disc(ctx, x + 38, y + 72, 24, rgrad(ctx, x + 32, y + 66, 3, x + 38, y + 72, 24, [[0, '#f8be82'], [0.55, '#d1682e'], [1, '#7a3114']]), '#26120a', 2.4); ctx.restore();
}
function drawMenuBoard(ctx, x, y, w, h) {
  ctx.save(); rr(ctx, x - 2, y - 1, w + 14, h + 16, 10, 'rgba(12,5,2,0.42)'); rr(ctx, x - 7, y - 7, w + 14, h + 14, 10, '#5c311b', '#e5a454', 3);
  ctx.fillStyle = '#1b2922'; ctx.fillRect(x, y, w, h); const cx = x + w * 0.5;
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5ecd4'; ctx.font = fnt('900 15px'); ctx.fillText('THANKSGIVING MENU', cx, y + 30);
  ctx.strokeStyle = 'rgba(245,224,175,0.4)'; ctx.lineWidth = 1.5; ln(ctx, x + 24, y + 39, x + w - 24, y + 39);
  ctx.fillStyle = '#f8c646'; ctx.font = fnt('900 20px'); ctx.fillText('1. ROAST TURKEY', cx, y + 70);
  ctx.fillStyle = '#dfd4be'; ctx.font = fnt('800 14px'); ctx.fillText('2. CRANBERRY GLAZE', cx, y + 100); ctx.fillText('3. PUMPKIN PIE', cx, y + 124);
  ctx.strokeStyle = '#ff4b36'; ctx.lineWidth = 4; ln(ctx, x + 20, y + 66, x + w - 20, y + 60); ctx.restore();
}
function drawSconce(ctx, x, y, time) { glow(ctx, x, y, 82, `rgba(255,214,118,${0.48 * (0.88 + Math.sin(time * 7 + x) * 0.12)})`); ctx.fillStyle = '#d49a44'; ctx.fillRect(x - 4, y + 6, 8, 16); ell(ctx, x, y, 6, 9, 0, '#fff5be'); }
function drawPieShelf(ctx, x, y, time) {
  ctx.save();
  for (let r = 0; r < 2; r++) {
    const sy = y + 54 + r * 78; ctx.fillStyle = '#754224'; ctx.fillRect(x, sy, 164, 11); ctx.strokeStyle = '#241108'; ctx.lineWidth = 2; ctx.strokeRect(x, sy, 164, 11);
    if (r === 0) {
      poly(ctx, [[x + 14, sy], [x + 22, sy - 16], [x + 76, sy - 16], [x + 84, sy]], '#d6994d');
      ell(ctx, x + 49, sy - 16, 28, 8, 0, '#e56f1f'); disc(ctx, x + 49, sy - 20, 6, '#fff8ea');
      ctx.strokeStyle = 'rgba(255,245,225,0.48)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 48, sy - 28); ctx.quadraticCurveTo(x + 56 + Math.sin(time * 3) * 3, sy - 42, x + 44, sy - 54); ctx.stroke();
      for (let j = 0; j < 2; j++) { rr(ctx, x + 98 + j * 30, sy - 34, 22, 34, 6, j === 0 ? '#c9262e' : '#f0a630'); ctx.fillStyle = '#d9a14c'; ctx.fillRect(x + 100 + j * 30, sy - 39, 18, 6); }
    } else { disc(ctx, x + 44, sy - 18, 19, '#d46d34'); for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#e8d4ad', '#628f3d', '#b83226'][k]; ctx.fillRect(x + 82 + k * 24, sy - 28, 18, 28); } }
  }
  ctx.restore();
}
function drawDinnerClock(ctx, cx, cy) {
  ctx.save(); disc(ctx, cx, cy, 34, '#5c311b', '#e8b34c', 3); disc(ctx, cx, cy, 27, '#fbf0d5');
  ctx.strokeStyle = '#24120a'; ctx.lineWidth = 3; ln(ctx, cx, cy, cx - 2, cy + 16); ln(ctx, cx, cy, cx - 8, cy - 18); disc(ctx, cx, cy, 3.5, '#c92a22'); ctx.restore();
}
function drawBarnWallDecor(ctx, sx, time) {
  ctx.save();
  // Hanging garlic braid, left of the window.
  const gx = sx - 248;
  ctx.strokeStyle = '#c8a86a'; ctx.lineWidth = 3; ln(ctx, gx, 84, gx, 196);
  for (let i = 0; i < 4; i++) { const gy = 108 + i * 24; disc(ctx, gx + (i % 2 ? -7 : 7), gy, 9, '#f5ebd1', '#8a6a3a', 1.6); disc(ctx, gx + (i % 2 ? 7 : -7), gy + 6, 7, '#efe0c0', '#8a6a3a', 1.4); }
  // Horseshoe and rope coil on the wall right of the beam.
  ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx + 224, 306, 20, Math.PI * 0.15, Math.PI * 0.85, false); ctx.stroke();
  disc(ctx, sx + 205, 300, 3.4, '#d8b25e'); disc(ctx, sx + 243, 300, 3.4, '#d8b25e');
  ctx.strokeStyle = '#b98d4e'; ctx.lineWidth = 4;
  for (let r = 8; r <= 20; r += 6) { ctx.beginPath(); ctx.arc(sx + 224, 158, r, 0, 6.28); ctx.stroke(); }
  // Grain sacks at the wall base, right of the beam.
  for (const [ox, w, h] of [[214, 52, 58], [262, 44, 48]]) {
    rr(ctx, sx + ox, GROUND_Y - h, w, h, 12, '#a8824e', '#5e3a1a', 2);
    ctx.strokeStyle = '#5e3a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx + ox + 6, GROUND_Y - h + 12); ctx.lineTo(sx + ox + w - 6, GROUND_Y - h + 12); ctx.stroke();
  }
  ctx.restore();
}
function drawHills(ctx, sx, by, amp, f, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_WIDTH + 40; x += 36) ctx.lineTo(x, by + Math.sin((x + sx) * f) * amp);
  ctx.lineTo(VIEW_WIDTH, GROUND_Y); ctx.closePath(); ctx.fill();
}
function poly(ctx, pts, fill, stroke, lw = 2, close = true) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (close) ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function ln(ctx, x0, y0, x1, y1) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function mixHex(a, b, t) { const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], ca = p(a), cb = p(b); return `rgb(${Math.round(lerp(ca[0], cb[0], t))},${Math.round(lerp(ca[1], cb[1], t))},${Math.round(lerp(ca[2], cb[2], t))})`; }
