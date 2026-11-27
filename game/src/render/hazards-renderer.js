// Thanksgiving hazard renderer: 3D-beveled 425°F cast-iron & brick roasting ovens, Damascus knives, cleavers, copper pots, gravy spills, and flour clouds.

import { AUTUMN_PALETTE, GROUND_Y, VIEW_WIDTH } from '../config.js';
import { getOvenFlameBox } from '../world/hazards.js';
import { disc, ell, fnt, lgrad, rgrad, drawRoundedRect as rr } from './textures.js';

export function drawRoastingOven(ctx, oven, cameraX, time, atlas = null) {
  const sx = oven.x - cameraX + oven.rattle;
  if (sx + oven.w < -240 || sx > VIEW_WIDTH + 240) return;
  ctx.save();
  ell(ctx, sx + oven.w * 0.5, GROUND_Y + 4, oven.w * 0.64, 12, 0, 'rgba(14,6,3,0.48)');

  if (oven.state === 'preheat' || oven.state === 'blast') {
    const rad = oven.state === 'blast' ? 280 : 165;
    disc(ctx, sx - 18, oven.y + 66, rad, rgrad(ctx, sx - 18, oven.y + 66, 14, sx - 18, oven.y + 66, rad, [[0, oven.state === 'blast' ? 'rgba(255,186,62,0.64)' : 'rgba(255,126,38,0.36)'], [0.55, 'rgba(255,108,28,0.20)'], [1, 'rgba(255,80,18,0)']]));
  }

  const isBrick = oven.variant === 'brick_roaster';
  ctx.fillStyle = isBrick ? '#7c3422' : '#2a2426'; ctx.fillRect(sx + oven.w - 30, oven.y - 42, 20, 44);
  ctx.strokeStyle = '#140f10'; ctx.lineWidth = 2.4; ctx.strokeRect(sx + oven.w - 30, oven.y - 42, 20, 44);

  rr(ctx, sx + 14, oven.y - 20, 42, 20, [4, 4, 8, 8], lgrad(ctx, sx + 14, oven.y - 22, sx + 56, oven.y, [[0, '#f8ba7a'], [0.55, '#cf652d'], [1, '#7c3216']]), AUTUMN_PALETTE.inkDark, 2.2);
  ctx.strokeStyle = 'rgba(255,245,225,0.46)'; ctx.lineWidth = 2;
  for (let s = 0; s < 2; s++) { const wx = sx + 26 + s * 16 + Math.sin(time * 4 + s) * 3; ctx.beginPath(); ctx.moveTo(wx, oven.y - 23); ctx.quadraticCurveTo(wx + 6, oven.y - 34, wx - 3, oven.y - 44); ctx.stroke(); }

  ctx.fillStyle = '#1c1718'; ctx.fillRect(sx + 8, oven.y + oven.h - 6, 12, 8); ctx.fillRect(sx + oven.w - 20, oven.y + oven.h - 6, 12, 8);
  ctx.fillStyle = isBrick ? '#5c2317' : '#181415';
  ctx.beginPath(); ctx.moveTo(sx + oven.w, oven.y + 4); ctx.lineTo(sx + oven.w + 12, oven.y - 4); ctx.lineTo(sx + oven.w + 12, oven.y + oven.h - 10); ctx.lineTo(sx + oven.w, oven.y + oven.h - 4); ctx.closePath(); ctx.fill();

  if (isBrick) rr(ctx, sx, oven.y, oven.w, oven.h - 4, [16, 16, 4, 4], atlas ? atlas.brick : '#8c3926', '#2a120a', 3);
  else {
    rr(ctx, sx, oven.y, oven.w, oven.h - 4, [10, 10, 4, 4], lgrad(ctx, sx, oven.y, sx + oven.w, oven.y, [[0, '#544a4d'], [0.5, '#2d2729'], [1, '#191416']]), '#120d0e', 3);
    ctx.fillStyle = '#e5a84c'; ctx.fillRect(sx - 4, oven.y + 1, oven.w + 8, 9); ctx.strokeRect(sx - 4, oven.y + 1, oven.w + 8, 9);
    for (let k = 0; k < 3; k++) disc(ctx, sx + 24 + k * 28, oven.y + 22, 5.5, '#f8cf6e', '#1a1210', 1.6);
  }

  const mx = sx + 12, my = oven.y + 36, mw = oven.w - 24, mh = 68;
  rr(ctx, mx, my, mw, mh, isBrick ? [22, 22, 5, 5] : 7, lgrad(ctx, mx, my, mx, my + mh, oven.state === 'slammed' ? [[0, '#2a2224'], [1, '#1c1618']] : [[0, '#fff4ad'], [0.45, '#ff7d1f'], [1, '#a81c10']]), '#181213', 2.6);
  if (oven.state !== 'slammed') {
    for (let c = 0; c < 4; c++) ell(ctx, mx + 14 + c * 19, my + mh - 6, 9, 5, 0, 'rgba(255,244,175,0.65)');
    ctx.strokeStyle = 'rgba(28,12,8,0.58)'; ctx.lineWidth = 2;
    for (let g = 1; g <= 3; g++) { ctx.beginPath(); ctx.moveTo(mx + 4, my + g * 17); ctx.lineTo(mx + mw - 4, my + g * 17); ctx.stroke(); }
  }
  const dw = Math.max(12, mw * (1 - oven.doorOpen * 0.78));
  rr(ctx, mx + mw - dw, my, dw, mh, 5, oven.state === 'slammed' ? '#4f5d52' : '#3c3437', '#120d0e', 2.4);
  disc(ctx, oven.latchX - cameraX + oven.rattle, oven.latchY, 9, oven.state === 'slammed' ? '#95e89a' : '#ffdc6e', '#24120a', 2.2);

  const dx = sx + oven.w * 0.5, dy = oven.y - 62;
  if (dx > 66 && dx < VIEW_WIDTH - 66) {
    rr(ctx, dx - 56, dy - 14, 112, 28, 14, oven.state === 'blast' ? '#c22419' : oven.state === 'preheat' ? '#d96b1f' : '#362620', '#f8ca5e', 2.5);
    ctx.fillStyle = '#fff7dc'; ctx.font = fnt('900 14px'); ctx.textAlign = 'center';
    ctx.fillText(oven.state === 'slammed' ? 'OVEN SHUT!' : `${Math.round(oven.tempF)}°F OVEN`, dx, dy + 5);
  }

  const flame = getOvenFlameBox(oven);
  if (flame) {
    const fx = flame.x - cameraX, ox = oven.facing < 0 ? sx + 8 : sx + oven.w - 8, tx = oven.facing < 0 ? fx : fx + flame.w, cy = flame.y + flame.h * 0.5, wv = Math.sin(time * 28) * 10;
    ctx.fillStyle = lgrad(ctx, ox, cy, tx, cy, [[0, 'rgba(255,142,32,0.96)'], [0.62, 'rgba(235,58,20,0.85)'], [1, 'rgba(215,32,12,0)']]);
    ctx.beginPath(); ctx.moveTo(ox, cy - 28); ctx.quadraticCurveTo((ox + tx) * 0.5, cy - 50 + wv, tx, cy + wv * 0.5); ctx.quadraticCurveTo((ox + tx) * 0.5, cy + 50 - wv, ox, cy + 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lgrad(ctx, ox, cy, (ox + tx) * 0.55, cy, [[0, 'rgba(255,254,224,0.98)'], [0.6, 'rgba(255,212,78,0.86)'], [1, 'rgba(255,155,35,0)']]);
    ctx.beginPath(); ctx.moveTo(ox, cy - 14); ctx.quadraticCurveTo((ox + tx) * 0.45, cy - 24 - wv * 0.6, tx * 0.74 + ox * 0.26, cy); ctx.quadraticCurveTo((ox + tx) * 0.45, cy + 24 + wv * 0.6, ox, cy + 14); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawCarvingKnife(ctx, knife, cameraX, time) {
  const sx = knife.x - cameraX;
  if (sx < -120 || sx > VIEW_WIDTH + 120) return;
  ctx.save();
  if (knife.telegraph > 0) {
    ctx.strokeStyle = 'rgba(255,85,55,0.78)'; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(sx, knife.y); ctx.lineTo(sx + Math.sign(knife.vx) * 260, knife.y); ctx.stroke(); ctx.setLineDash([]);
    disc(ctx, sx, knife.y, 9 + Math.sin(time * 32) * 3, '#fff2c2'); ctx.restore(); return;
  }
  for (let i = 1; i < knife.trail.length; i++) {
    const p0 = knife.trail[i - 1], p1 = knife.trail[i], f = i / knife.trail.length;
    ctx.strokeStyle = `rgba(255,244,218,${f * 0.78})`; ctx.lineWidth = 4 + f * 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p0.x - cameraX, p0.y); ctx.lineTo(p1.x - cameraX, p1.y); ctx.stroke();
  }
  ctx.translate(sx, knife.y); ctx.rotate(knife.angle); ctx.scale(1.34, 1.34);
  ctx.fillStyle = lgrad(ctx, -12, -10, 36, 10, [[0, '#e2eef8'], [0.45, '#ffffff'], [1, '#7e93a4']]);
  ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(36, -4); ctx.quadraticCurveTo(28, 10, -6, 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1b2026'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.strokeStyle = '#fff9d6'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -4.5); ctx.lineTo(32, -2.5); ctx.moveTo(26, -9); ctx.lineTo(26, 3); ctx.moveTo(20, -3); ctx.lineTo(32, -3); ctx.stroke();
  ctx.fillStyle = '#ebba52'; ctx.fillRect(-10, -9, 6, 18);
  rr(ctx, -34, -7, 25, 14, 5, '#5c2d17', '#1c0e08', 2.2); disc(ctx, -26, 0, 2.2, '#f5ca69'); disc(ctx, -16, 0, 2.2, '#f5ca69'); ctx.restore();
}

export function drawChoppingCleaver(ctx, cl, cameraX, time) {
  const sx = cl.x - cameraX;
  if (sx < -100 || sx > VIEW_WIDTH + 100) return;
  ctx.save();
  ell(ctx, sx, GROUND_Y + 3, 28, 7, 0, `rgba(255,65,45,${cl.state === 'glint' ? 0.55 + Math.sin(time * 36) * 0.25 : cl.state === 'chop' ? 0.78 : 0.22})`);
  ctx.strokeStyle = '#382a27'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, cl.y - 72); ctx.stroke();
  ctx.translate(sx, cl.y);
  rr(ctx, -10, -104, 20, 34, 6, '#6b3519', AUTUMN_PALETTE.inkDark, 2.4);
  rr(ctx, -24, -72, 48, 72, [4, 4, 12, 4], lgrad(ctx, -22, -72, 22, 0, [[0, '#f2f7fc'], [0.55, '#b6c5d1'], [1, '#718494']]), '#1b2229', 2.6);
  ctx.fillStyle = '#fff'; ctx.fillRect(-20, -10, 40, 6); disc(ctx, 11, -56, 5.5, '#2d1c16');
  if (cl.state === 'glint') { const s = 14 + cl.glint * 16; ctx.strokeStyle = '#fff5b0'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-s, -12); ctx.lineTo(s, -12); ctx.moveTo(0, -12 - s); ctx.lineTo(0, -12 + s); ctx.stroke(); }
  ctx.restore();
}

export function drawHangingCopperPot(ctx, course, cameraX) {
  for (const pot of course.hangingPots) {
    const sx = pot.x - cameraX;
    if (sx < -80 || sx > VIEW_WIDTH + 80) continue;
    ctx.save(); const sw = pot.state === 'hanging' ? Math.sin(pot.sway) * 6 : 0;
    if (pot.state === 'hanging') {
      ctx.strokeStyle = '#c9a063'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + sw, pot.y - 24); ctx.stroke();
      disc(ctx, sx + sw * 0.5, pot.ropeTopY + 56, 11, null, 'rgba(255,228,120,0.85)', 2.2);
    }
    ctx.translate(sx + sw, pot.y);
    if (pot.kind === 'copper_pot') {
      rr(ctx, -28, -20, 56, 42, [4, 4, 14, 14], lgrad(ctx, -28, -20, 28, 20, [[0, '#f8b97c'], [0.55, '#c7612c'], [1, '#783015']]), AUTUMN_PALETTE.inkDark, 2.6);
      ctx.fillStyle = 'rgba(255,244,210,0.34)'; ctx.fillRect(-18, -14, 8, 28);
    } else {
      ctx.fillStyle = '#995b2a'; ctx.beginPath(); ctx.moveTo(-24, -20); ctx.lineTo(24, -20); ctx.lineTo(19, 22); ctx.lineTo(-19, 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.6; ctx.stroke(); ctx.fillStyle = '#4c4648'; ctx.fillRect(-23, -10, 46, 5); ctx.fillRect(-21, 8, 42, 5);
    }
    ctx.restore();
  }
}

export function drawGravySpill(ctx, course, cameraX, time) {
  for (const sp of course.gravySpills) {
    const sx = sp.x - cameraX;
    if (sx + sp.w < -40 || sx > VIEW_WIDTH + 40) continue;
    ell(ctx, sx + sp.w * 0.5, GROUND_Y + 4, sp.w * 0.52, 10, 0, '#5e3112');
    ell(ctx, sx + sp.w * 0.5, GROUND_Y + 2, sp.w * 0.44, 6.5, 0, '#9c5f28');
    ell(ctx, sx + sp.w * 0.45 + Math.sin(time * 3 + sp.x * 0.02) * 8, GROUND_Y, sp.w * 0.18, 2.6, 0, 'rgba(255,232,165,0.58)');
  }
}

export function drawFlourClouds(ctx, course, cameraX, time) {
  for (const fc of course.flourClouds) {
    const sx = fc.x - cameraX;
    if (sx < -160 || sx > VIEW_WIDTH + 160) continue;
    ctx.save(); ctx.globalAlpha = Math.min(0.82, fc.timer / fc.maxTimer);
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + time * 0.8, rx = sx + Math.cos(a) * 38, ry = fc.y + Math.sin(a) * 24;
      disc(ctx, rx, ry, 52, rgrad(ctx, rx, ry, 6, rx, ry, 52, [[0, 'rgba(255,252,240,0.88)'], [1, 'rgba(245,234,210,0)']]));
    }
    ctx.restore();
  }
}
