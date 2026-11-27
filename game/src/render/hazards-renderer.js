// Thanksgiving hazard renderer: antique 425°F cast-iron roasting ovens, Damascus carving knives, chopping cleavers, hanging copper pots, and gravy spills.

import { AUTUMN_PALETTE, GROUND_Y, VIEW_WIDTH } from '../config.js';
import { getOvenFlameBox } from '../world/hazards.js';

export function drawRoastingOven(ctx, oven, cameraX, time) {
  const sx = oven.x - cameraX + oven.rattle;
  if (sx + oven.w < -240 || sx > VIEW_WIDTH + 240) return;

  ctx.save();
  ctx.fillStyle = 'rgba(14,6,3,0.45)';
  ctx.beginPath(); ctx.ellipse(sx + oven.w * 0.5, GROUND_Y + 3, oven.w * 0.62, 12, 0, 0, Math.PI * 2); ctx.fill();

  if (oven.state === 'preheat' || oven.state === 'blast') {
    const rad = oven.state === 'blast' ? 270 : 160;
    const aura = ctx.createRadialGradient(sx - 18, oven.y + 66, 14, sx - 18, oven.y + 66, rad);
    aura.addColorStop(0, oven.state === 'blast' ? 'rgba(255,178,52,0.62)' : 'rgba(255,120,35,0.34)');
    aura.addColorStop(0.55, 'rgba(255,108,28,0.20)'); aura.addColorStop(1, 'rgba(255,80,18,0)');
    ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(sx - 18, oven.y + 66, rad, 0, Math.PI * 2); ctx.fill();
  }

  // Chimney + simmering copper pot on burner top
  ctx.fillStyle = '#2a2426'; ctx.fillRect(sx + oven.w - 30, oven.y - 46, 20, 50);
  ctx.strokeStyle = '#140f10'; ctx.lineWidth = 2.8; ctx.strokeRect(sx + oven.w - 30, oven.y - 46, 20, 50);
  ctx.fillStyle = '#d46c32'; ctx.beginPath(); ctx.roundRect(sx + 16, oven.y - 22, 42, 22, [4, 4, 8, 8]); ctx.fill();
  ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,245,225,0.45)'; ctx.lineWidth = 2.2;
  for (let s = 0; s < 2; s++) {
    const wx = sx + 28 + s * 16 + Math.sin(time * 4 + s) * 3;
    ctx.beginPath(); ctx.moveTo(wx, oven.y - 26); ctx.quadraticCurveTo(wx + 6, oven.y - 38, wx - 3, oven.y - 50); ctx.stroke();
  }

  // Cast-iron legs & riveted stove body
  ctx.fillStyle = '#1c1718'; ctx.fillRect(sx + 8, oven.y + oven.h - 6, 12, 8); ctx.fillRect(sx + oven.w - 20, oven.y + oven.h - 6, 12, 8);
  const bg = ctx.createLinearGradient(sx, oven.y, sx + oven.w, oven.y);
  bg.addColorStop(0, '#4c4345'); bg.addColorStop(0.5, '#2b2527'); bg.addColorStop(1, '#1a1516');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(sx, oven.y, oven.w, oven.h - 4, [10, 10, 4, 4]); ctx.fill();
  ctx.strokeStyle = '#120d0e'; ctx.lineWidth = 3.2; ctx.stroke();

  // Brass top trim & vintage stove control knobs
  ctx.fillStyle = '#e0a248'; ctx.fillRect(sx - 4, oven.y + 1, oven.w + 8, 9); ctx.strokeRect(sx - 4, oven.y + 1, oven.w + 8, 9);
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = '#f7cb68'; ctx.beginPath(); ctx.arc(sx + 24 + k * 28, oven.y + 22, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1.8; ctx.stroke();
  }

  // Glowing firebox cavity
  const mx = sx + 12, my = oven.y + 36, mw = oven.w - 24, mh = 68;
  const fg = ctx.createLinearGradient(mx, my, mx, my + mh);
  if (oven.state === 'slammed') { fg.addColorStop(0, '#2a2224'); fg.addColorStop(1, '#1c1618'); }
  else { fg.addColorStop(0, '#fff09c'); fg.addColorStop(0.45, '#ff781f'); fg.addColorStop(1, '#a81c10'); }
  ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 7); ctx.fill();
  ctx.strokeStyle = '#181213'; ctx.lineWidth = 2.8; ctx.stroke();
  if (oven.state !== 'slammed') {
    ctx.strokeStyle = 'rgba(30,14,10,0.55)';
    for (let g = 1; g <= 3; g++) { ctx.beginPath(); ctx.moveTo(mx + 4, my + g * 17); ctx.lineTo(mx + mw - 4, my + g * 17); ctx.stroke(); }
  }

  const doorW = Math.max(12, mw * (1 - oven.doorOpen * 0.78));
  ctx.fillStyle = oven.state === 'slammed' ? '#4f5d52' : '#3c3437';
  ctx.beginPath(); ctx.roundRect(mx + mw - doorW, my, doorW, mh, 5); ctx.fill(); ctx.strokeStyle = '#120d0e'; ctx.stroke();

  // Interactive Brass Slam Latch Target
  ctx.fillStyle = oven.state === 'slammed' ? '#95e89a' : '#ffd866';
  ctx.beginPath(); ctx.arc(oven.latchX - cameraX + oven.rattle, oven.latchY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#24120a'; ctx.lineWidth = 2.4; ctx.stroke();

  // Brass Temperature Dial ("425°F OVEN")
  const dx = sx + oven.w * 0.5, dy = oven.y - 44;
  ctx.fillStyle = oven.state === 'blast' ? '#bd2419' : oven.state === 'preheat' ? '#d96b1f' : '#362620';
  ctx.beginPath(); ctx.roundRect(dx - 58, dy - 16, 116, 30, 14); ctx.fill();
  ctx.strokeStyle = '#f8ca5e'; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.fillStyle = '#fff7dc'; ctx.font = '900 15px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(oven.state === 'slammed' ? 'OVEN SHUT!' : `${Math.round(oven.tempF)}°F OVEN`, dx, dy + 5);

  const flame = getOvenFlameBox(oven);
  if (flame) {
    const fx = flame.x - cameraX;
    const ox = oven.facing < 0 ? sx + 8 : sx + oven.w - 8;
    const tx = oven.facing < 0 ? fx : fx + flame.w;
    const cy = flame.y + flame.h * 0.5;
    const wv = Math.sin(time * 28) * 9;
    const out = ctx.createLinearGradient(ox, cy, tx, cy);
    out.addColorStop(0, 'rgba(255,130,28,0.96)'); out.addColorStop(0.62, 'rgba(235,56,20,0.84)'); out.addColorStop(1, 'rgba(215,32,12,0)');
    ctx.fillStyle = out; ctx.beginPath(); ctx.moveTo(ox, cy - 28); ctx.quadraticCurveTo((ox + tx) * 0.5, cy - 48 + wv, tx, cy + wv * 0.5); ctx.quadraticCurveTo((ox + tx) * 0.5, cy + 48 - wv, ox, cy + 28); ctx.closePath(); ctx.fill();
    const inn = ctx.createLinearGradient(ox, cy, (ox + tx) * 0.55, cy);
    inn.addColorStop(0, 'rgba(255,252,215,0.98)'); inn.addColorStop(0.6, 'rgba(255,208,74,0.84)'); inn.addColorStop(1, 'rgba(255,155,35,0)');
    ctx.fillStyle = inn; ctx.beginPath(); ctx.moveTo(ox, cy - 14); ctx.quadraticCurveTo((ox + tx) * 0.45, cy - 23 - wv * 0.6, tx * 0.72 + ox * 0.28, cy); ctx.quadraticCurveTo((ox + tx) * 0.45, cy + 23 + wv * 0.6, ox, cy + 14); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function drawCarvingKnife(ctx, knife, cameraX, time) {
  const sx = knife.x - cameraX;
  if (sx < -120 || sx > VIEW_WIDTH + 120) return;
  ctx.save();
  if (knife.telegraph > 0) {
    ctx.strokeStyle = 'rgba(255,85,55,0.76)'; ctx.lineWidth = 3; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(sx, knife.y); ctx.lineTo(sx + Math.sign(knife.vx) * 260, knife.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#fff2c2'; ctx.beginPath(); ctx.arc(sx, knife.y, 9 + Math.sin(time * 32) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore(); return;
  }
  for (let i = 1; i < knife.trail.length; i++) {
    const p0 = knife.trail[i - 1], p1 = knife.trail[i];
    ctx.strokeStyle = `rgba(255,224,195,${(i / knife.trail.length) * 0.56})`;
    ctx.lineWidth = 4 + (i / knife.trail.length) * 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p0.x - cameraX, p0.y); ctx.lineTo(p1.x - cameraX, p1.y); ctx.stroke();
  }
  ctx.translate(sx, knife.y); ctx.rotate(knife.angle); ctx.scale(1.26, 1.26);
  const bl = ctx.createLinearGradient(-12, -10, 34, 8);
  bl.addColorStop(0, '#d2dde8'); bl.addColorStop(0.5, '#fff'); bl.addColorStop(1, '#8c9fae');
  ctx.fillStyle = bl; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(36, -4); ctx.quadraticCurveTo(28, 10, -6, 8); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1b2026'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(28, -2); ctx.stroke();
  ctx.fillStyle = '#e8b34c'; ctx.fillRect(-10, -9, 6, 18);
  ctx.fillStyle = '#5c2d17'; ctx.beginPath(); ctx.roundRect(-34, -7, 25, 14, 5); ctx.fill();
  ctx.strokeStyle = '#1c0e08'; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.fillStyle = '#f5ca69'; ctx.beginPath(); ctx.arc(-26, 0, 2.2, 0, Math.PI * 2); ctx.arc(-16, 0, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawChoppingCleaver(ctx, cl, cameraX, time) {
  const sx = cl.x - cameraX;
  if (sx < -100 || sx > VIEW_WIDTH + 100) return;
  ctx.save();
  const a = cl.state === 'glint' ? 0.55 + Math.sin(time * 36) * 0.25 : cl.state === 'chop' ? 0.75 : 0.2;
  ctx.fillStyle = `rgba(255,65,45,${a})`; ctx.beginPath(); ctx.ellipse(sx, GROUND_Y + 2, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#382a27'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, cl.y - 72); ctx.stroke();
  ctx.translate(sx, cl.y);
  ctx.fillStyle = '#6b3519'; ctx.beginPath(); ctx.roundRect(-10, -104, 20, 34, 6); ctx.fill();
  ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.6; ctx.stroke();
  const g = ctx.createLinearGradient(-22, -72, 22, 0);
  g.addColorStop(0, '#eef5fa'); g.addColorStop(0.55, '#b6c5d1'); g.addColorStop(1, '#7a8d9c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-24, -72, 48, 72, [4, 4, 12, 4]); ctx.fill();
  ctx.strokeStyle = '#1b2229'; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.fillRect(-20, -10, 40, 6);
  ctx.fillStyle = '#2d1c16'; ctx.beginPath(); ctx.arc(11, -56, 5.5, 0, Math.PI * 2); ctx.fill();
  if (cl.state === 'glint') {
    const s = 14 + cl.glint * 16; ctx.strokeStyle = '#fff5b0'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-s, -12); ctx.lineTo(s, -12); ctx.moveTo(0, -12 - s); ctx.lineTo(0, -12 + s); ctx.stroke();
  }
  ctx.restore();
}

export function drawHangingCopperPot(ctx, course, cameraX) {
  for (const pot of course.hangingPots) {
    const sx = pot.x - cameraX;
    if (sx < -80 || sx > VIEW_WIDTH + 80) continue;
    ctx.save();
    const sw = pot.state === 'hanging' ? Math.sin(pot.sway) * 6 : 0;
    if (pot.state === 'hanging') {
      ctx.strokeStyle = '#c9a063'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + sw, pot.y - 24); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,228,120,0.8)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(sx + sw * 0.5, pot.ropeTopY + 56, 11, 0, 6.28); ctx.stroke();
    }
    ctx.translate(sx + sw, pot.y);
    if (pot.kind === 'copper_pot') {
      const g = ctx.createLinearGradient(-28, -20, 28, 20); g.addColorStop(0, '#f7ae6e'); g.addColorStop(0.6, '#c7612c'); g.addColorStop(1, '#783015');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-28, -20, 56, 42, [4, 4, 14, 14]); ctx.fill(); ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.8; ctx.stroke();
    } else {
      ctx.fillStyle = '#995b2a'; ctx.beginPath(); ctx.moveTo(-24, -20); ctx.lineTo(24, -20); ctx.lineTo(19, 22); ctx.lineTo(-19, 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.8; ctx.stroke(); ctx.fillStyle = '#4c4648'; ctx.fillRect(-23, -10, 46, 5); ctx.fillRect(-21, 8, 42, 5);
    }
    ctx.restore();
  }
}

export function drawGravySpill(ctx, course, cameraX, time) {
  for (const sp of course.gravySpills) {
    const sx = sp.x - cameraX;
    if (sx + sp.w < -40 || sx > VIEW_WIDTH + 40) continue;
    ctx.save();
    ctx.fillStyle = '#6b3b17'; ctx.beginPath(); ctx.ellipse(sx + sp.w * 0.5, GROUND_Y + 3, sp.w * 0.52, 9, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#9c5f28'; ctx.beginPath(); ctx.ellipse(sx + sp.w * 0.5, GROUND_Y + 1, sp.w * 0.44, 6, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = 'rgba(255,226,155,0.5)'; ctx.beginPath(); ctx.ellipse(sx + sp.w * 0.45 + Math.sin(time * 3 + sp.x * 0.02) * 8, GROUND_Y, sp.w * 0.16, 2.5, 0, 0, 6.28); ctx.fill();
    ctx.restore();
  }
}
