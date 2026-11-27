// Storybook character renderer: shaded Pippin the Turkey, plaid-and-apron Farmer Barnaby, lantern vision cone, alert arc, and acorn aim arc.

import { AUTUMN_PALETTE, GROUND_Y, PHYSICS, VIEW_WIDTH } from '../config.js';
import { computeAcornAimVelocity } from '../entities/turkey.js';
import { computeVisionCone } from '../entities/farmer-ai.js';
import { disc, ell, fnt, lgrad, rgrad, drawRoundedRect as rr } from './textures.js';

export function drawTurkeyPippin(ctx, t, camX, time, crown = false, fireGlow = 0) {
  if (t.hidden || (t.invulnTimer > 0 && Math.floor(t.invulnTimer * 18) % 2 === 0)) return;
  const sx = t.x - camX, sy = t.y, air = !t.grounded, ink = AUTUMN_PALETTE.inkDark;
  ctx.save();
  const sh = Math.max(0.32, 1 - Math.max(0, GROUND_Y - sy) / 360);
  ell(ctx, sx, GROUND_Y + 4, 32 * sh, 8 * sh, 0, `rgba(18,8,4,${0.42 * sh})`);
  if (t.dashTimer > 0) {
    ctx.strokeStyle = 'rgba(255,228,128,0.88)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let s = 0; s < 3; s++) { const lx = sx - t.facing * (44 + s * 18), ly = sy - 20 - s * 16; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - t.facing * 44, ly); ctx.stroke(); }
  }
  ctx.translate(sx, sy); ctx.scale(t.facing * t.squashX * 1.28, t.squashY * 1.28); ctx.rotate(Math.min(1, Math.abs(t.vx) / 380) * 0.14);
  if (air || t.dashTimer > 0) { ctx.save(); ctx.translate(4, -36); ctx.rotate(-0.68 + Math.sin(time * 36) * 0.28); drawWing(ctx, '#722d13', '#c86026', '#f2a44e'); ctx.restore(); }

  const tc = ['#7e2115', '#b0351a', '#d85f1e', '#ee9424', '#fac83e', '#ee9424', '#d85f1e', '#b0351a', '#7e2115'], jit = t.panicLevel * Math.sin(time * 36) * 0.05;
  ctx.save(); ctx.translate(-15, -30);
  for (let i = 0; i < 9; i++) {
    ctx.save(); ctx.rotate(-2.45 + i * 0.2 + jit);
    ell(ctx, 0, -26, 7.2, 26, 0, tc[i]); ell(ctx, 0, -37, 6.2, 4.2, 0, '#361209'); ell(ctx, 0, -44, 4.8, 5.2, 0, '#fff3d1');
    ctx.strokeStyle = 'rgba(255,230,175,0.28)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -40); ctx.stroke();
    ell(ctx, 0, -26, 7.2, 26, 0, null, ink, 1.8); ctx.restore();
  }
  ctx.restore();

  const sd = t.grounded ? Math.sin(t.runCycle) * 14 : 11;
  ctx.strokeStyle = '#eda02e'; ctx.lineWidth = 4.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -14); ctx.lineTo(-6 - sd * 0.65, air ? -6 : -2); ctx.lineTo(4 - sd * 0.65, air ? -3 : -1);
  ctx.moveTo(6, -14); ctx.lineTo(8 + sd * 0.85, air ? -5 : -2); ctx.lineTo(18 + sd * 0.85, air ? -2 : -1); ctx.stroke();

  ell(ctx, -2, -28, 25, 21, -0.1, rgrad(ctx, 8, -36, 4, -2, -26, 29, [[0, '#d87d3e'], [0.5, '#8c3d1b'], [1, '#471b0b']]));
  ctx.strokeStyle = 'rgba(255,212,148,0.34)'; ctx.lineWidth = 1.6; for (let sc = 0; sc < 3; sc++) { ctx.beginPath(); ctx.arc(4 + sc * 5, -24 + sc * 4, 6, 0.2, 2.2); ctx.stroke(); }
  ell(ctx, -2, -28, 25, 21, -0.1, null, ink, 2.4);
  ctx.strokeStyle = `rgba(255,212,118,${Math.min(0.94, 0.32 + fireGlow * 0.65)})`; ctx.lineWidth = fireGlow > 0.05 ? 4.2 : 2.2; ctx.beginPath(); ctx.arc(-1, -26, 22, -0.45, 2.3); ctx.stroke();

  ctx.save(); ctx.translate(-3, -32);
  if (air || t.dashTimer > 0) { ctx.rotate(Math.sin(time * 40) * 0.42 - 1.05); drawWing(ctx, '#a84b20', '#e58636', '#ffd27a'); }
  else { ctx.rotate(Math.sin(t.runCycle * 2) * 0.18); ell(ctx, -3, 4, 15, 9, -0.3, lgrad(ctx, -16, -4, 12, 12, [[0, '#c8662a'], [1, '#6f2c12']]), ink, 2.2); }
  ctx.restore();

  rr(ctx, 10, -56, 13, 24, 6, '#924420', ink, 2.2);
  disc(ctx, 18, -56, 14, rgrad(ctx, 21, -60, 2, 18, -56, 15, [[0, '#c96b38'], [1, '#7a3418']]), ink, 2.2);
  ell(ctx, 24 + Math.sin(time * 18), -44, 5.5, 8.5, 0.2, '#e0242c', ink, 1.8);
  const op = t.dashTimer > 0 || t.panicLevel > 0.45 ? 5.5 : 0;
  ctx.fillStyle = '#fbc238'; ctx.beginPath(); ctx.moveTo(29, -60); ctx.lineTo(44, -56 - op * 0.55); ctx.lineTo(29, -52); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (op) { ctx.fillStyle = '#9e191e'; ctx.beginPath(); ctx.moveTo(29, -53); ctx.lineTo(41, -48 + op * 0.45); ctx.lineTo(29, -47); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ell(ctx, 31, -60, 4.5, 7, -0.35, '#e82930', ink, 1.8);
  disc(ctx, 21, -59, 7 * (1 + t.panicLevel * 0.24), '#fff', ink, 1.8); disc(ctx, 23.5, -59, 3.2, '#140905'); disc(ctx, 24.7, -60.5, 1.5, '#fff'); disc(ctx, 22.2, -57.6, 0.9, '#fff');
  ctx.strokeStyle = '#3d190b'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(14, -66); ctx.lineTo(25, -69); ctx.stroke();
  if (t.panicLevel > 0.6 && !crown) ell(ctx, 4, -71, 3, 5, -0.5, '#bfe8ff', '#254254', 1.4);
  if (crown) { ctx.fillStyle = '#ffd94a'; ctx.beginPath(); ctx.moveTo(8, -68); ctx.lineTo(10, -83); ctx.lineTo(16, -74); ctx.lineTo(20, -86); ctx.lineTo(24, -74); ctx.lineTo(29, -82); ctx.lineTo(28, -68); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5e3208'; ctx.lineWidth = 2.2; ctx.stroke(); }
  ctx.restore();
  if (t.speechTimer > 0 && t.speech) drawFarmerSpeechBubble(ctx, sx + (crown ? 22 : t.facing * 12), sy - (crown ? 94 : 104), t.speech);
}

export function drawFarmerBarnaby(ctx, f, camX, time) {
  const sx = f.x - camX; if (sx < -240 || sx > VIEW_WIDTH + 240) return;
  if (f.state === 'lunge' && f.lungeWindup > 0) { const zx = sx + (f.facing > 0 ? 14 : -220); ctx.fillStyle = lgrad(ctx, zx, GROUND_Y, zx + 206, GROUND_Y, [[0, 'rgba(255,58,36,0.48)'], [1, 'rgba(255,58,36,0.06)']]); ctx.fillRect(zx, GROUND_Y - 8, 206, 16); }
  drawLanternVisionCone(ctx, f, camX);

  const ink = AUTUMN_PALETTE.inkDark, ch = f.state === 'chase' || f.state === 'lunge';
  ctx.save(); ell(ctx, sx, GROUND_Y + 4, 44, 11, 0, 'rgba(18,8,4,0.46)');
  ctx.translate(sx, f.y - (f.slipTilt > 0.1 ? 12 : 0)); ctx.scale(f.facing * 1.15, 1.15);
  ctx.rotate(f.slipTilt > 0.05 ? -f.slipTilt * 0.85 : f.state === 'lunge' && f.lungeWindup <= 0 ? 0.28 : ch ? 0.18 : 0.03);
  const st = ch ? Math.sin(f.strideCycle) * 20 + 6 : Math.sin(f.strideCycle) * 12;
  drawLeg(ctx, -14 - st * 0.55, -42, -0.22 * Math.sign(st || 1)); drawLeg(ctx, 6 + st * 0.65, -42, 0.25 * Math.sign(st || 1));

  ctx.save(); ctx.translate(16, -78); ctx.rotate(f.state === 'search' ? -0.45 : -0.1);
  rr(ctx, -6, -6, 26, 13, 6, '#b82924', ink, 2.2); ctx.translate(22, 5);
  ctx.fillStyle = '#c98836'; ctx.fillRect(-9, -5, 18, 6); ctx.fillRect(-9, 17, 18, 5);
  ctx.fillStyle = rgrad(ctx, 0, 9, 2, 0, 9, 14, [[0, '#fffce0'], [1, '#ffbe3d']]); ctx.fillRect(-6, 1, 12, 16);
  ctx.strokeStyle = '#3b2416'; ctx.lineWidth = 1.6; ctx.strokeRect(-6, 1, 12, 16); ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, 17); ctx.stroke(); ctx.restore();

  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -68, 31, 34, 0, 0, 6.28);
  ctx.fillStyle = lgrad(ctx, -30, -96, 30, -40, [[0, '#d1342c'], [0.6, '#a4231d'], [1, '#6e1612']]); ctx.fill(); ctx.clip();
  ctx.strokeStyle = 'rgba(28,10,8,0.36)'; ctx.lineWidth = 3;
  for (let p = -28; p <= 28; p += 12) { ctx.beginPath(); ctx.moveTo(-34, -68 + p); ctx.lineTo(34, -68 + p); ctx.moveTo(p, -104); ctx.lineTo(p, -32); ctx.stroke(); }
  ctx.restore(); ell(ctx, 0, -68, 31, 34, 0, null, ink, 2.6);

  rr(ctx, -24, -74, 48, 42, 12, lgrad(ctx, -24, -84, 24, -32, [[0, '#466da0'], [0.6, '#2d4c77'], [1, '#1d3352']]), ink, 2.6);
  ctx.fillRect(-17, -96, 9, 26); ctx.fillRect(8, -96, 9, 26); rr(ctx, -16, -64, 34, 30, [4, 4, 8, 8], '#f5eedc', 'rgba(72,48,30,0.5)', 1.6);
  disc(ctx, -12, -74, 3.6, '#f7c954'); disc(ctx, 12, -74, 3.6, '#f7c954');

  disc(ctx, 4, -108, 18, rgrad(ctx, 8, -112, 3, 4, -108, 19, [[0, '#fbd2b5'], [1, '#dc9a74']]), ink, 2.4);
  disc(ctx, 11, -104, 5, 'rgba(225,84,68,0.45)'); disc(ctx, 11, -112, 4.8, '#fff'); disc(ctx, 12.8, -112, 2.3, '#1a0c06');
  ctx.strokeStyle = '#4f2814'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(4, -120); ctx.lineTo(18, -114); ctx.stroke();
  if (ch) { ell(ctx, 11, -94, 6.5, 4.8, 0, '#5c1414'); ctx.fillStyle = '#fff'; ctx.fillRect(7, -97, 8, 2.4); }
  ctx.fillStyle = '#5e2e16'; ctx.beginPath(); ctx.moveTo(4, -103); ctx.quadraticCurveTo(16, -108, 24, -99); ctx.quadraticCurveTo(16, -95, 6, -98); ctx.quadraticCurveTo(-2, -95, -9, -100); ctx.quadraticCurveTo(-3, -107, 4, -103); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.8; ctx.stroke();

  ctx.save(); ctx.translate(-8, -76); ctx.rotate(f.state === 'lunge' ? -0.18 : ch ? -0.28 : -0.45);
  rr(ctx, -4, -6, 30, 13, 6, '#c42e28', ink, 2.4); disc(ctx, 24, 0, 6, '#f2be9e', ink, 2);
  ctx.fillStyle = '#5c2d17'; ctx.fillRect(24, -3.5, 22, 7); ctx.strokeRect(24, -3.5, 22, 7);
  ctx.strokeStyle = '#1c242b'; ctx.lineWidth = 6.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(46, 0); ctx.lineTo(58, 0); ctx.moveTo(58, -7); ctx.lineTo(80, -7); ctx.moveTo(58, 7); ctx.lineTo(80, 7); ctx.moveTo(58, -7); ctx.lineTo(58, 7); ctx.stroke();
  ctx.strokeStyle = '#eef7ff'; ctx.lineWidth = 3.2; ctx.stroke(); ctx.restore();

  ctx.save(); ctx.translate(2, -124 - f.hatPop * 0.72); ctx.rotate(-0.14 - f.hatPop * 0.009);
  const hg = lgrad(ctx, -28, -18, 28, 6, [[0, '#fae082'], [1, '#cc8e2a']]);
  ell(ctx, 0, 0, 32, 8.5, 0, hg, ink, 2.4); rr(ctx, -18, -19, 36, 19, [10, 10, 2, 2], hg, ink, 2.4); ctx.fillStyle = '#b82522'; ctx.fillRect(-18, -7, 36, 6); ctx.restore(); ctx.restore();

  const topY = f.y - 196 - f.hatPop * 0.75;
  if (f.alertLevel > 0.08 && f.state !== 'stunned') { ctx.save(); ctx.strokeStyle = ch ? '#ff5538' : '#ffd24d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx, topY + 26, 22, -Math.PI * 0.9, -Math.PI * 0.9 + Math.PI * 0.8 * f.alertLevel); ctx.stroke(); ctx.restore(); }
  if (f.state === 'stunned') { for (let s = 0; s < 3; s++) { const a = time * 5 + (s * 6.28) / 3; disc(ctx, sx + Math.cos(a) * 28, topY + 22 + Math.sin(a) * 7, 6, '#ffe55c', '#5c310a', 2); } if (f.slipTilt <= 0.1) drawPill(ctx, sx, topY - 4, 'STUNNED!', '#5a3a18', '#ffe566'); }
  else if (f.state === 'lunge') drawPill(ctx, sx, topY, '!! LUNGE !!', '#b81d18', '#fff0a8');
  else if (f.state === 'chase') drawPill(ctx, sx, topY, '! CHASING !', '#c92a22', '#fff3c4');
  else if (f.state === 'search') drawPill(ctx, sx, topY, '? SEARCHING ?', '#b86814', '#fff5cc');
  if (f.speechTimer > 0 && f.speech) drawFarmerSpeechBubble(ctx, sx - (f.state === 'stunned' && f.slipTilt <= 0.1 ? 36 : 0), topY - 38, f.speech);
}

export function drawLanternVisionCone(ctx, f, camX) {
  if (f.state === 'stunned') return;
  const c = computeVisionCone(f), ox = c.originX - camX, oy = c.originY;
  const st = f.state === 'chase' || f.state === 'lunge' ? [[0, 'rgba(255,126,56,0.44)'], [0.65, 'rgba(255,85,42,0.16)'], [1, 'rgba(255,65,35,0)']] : f.state === 'search' ? [[0, 'rgba(255,232,124,0.62)'], [0.7, 'rgba(255,198,74,0.24)'], [1, 'rgba(255,180,60,0)']] : [[0, 'rgba(255,226,138,0.32)'], [1, 'rgba(255,200,95,0)']];
  ctx.save(); ctx.fillStyle = rgrad(ctx, ox, oy, 14, ox, oy, c.reach, st); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, c.reach, c.baseAngle - c.halfSpread, c.baseAngle + c.halfSpread); ctx.closePath(); ctx.fill(); ctx.restore();
}

export function drawFarmerSpeechBubble(ctx, x, y, text, bg = '#fff7e0', ink = '#24120a') {
  ctx.save(); ctx.font = fnt('900 14px'); const w = Math.max(108, ctx.measureText(text).width + 26), bx = Math.max(16 + w * 0.5, Math.min(VIEW_WIDTH - 16 - w * 0.5, x));
  rr(ctx, bx - w * 0.5, y - 16, w, 32, 12, bg, ink, 2.4); ctx.beginPath(); ctx.moveTo(bx - 6, y + 16); ctx.lineTo(bx + 6, y + 16); ctx.lineTo(bx, y + 24); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(text, bx, y + 5); ctx.restore();
}

export function drawAcornDecoyArc(ctx, t, input, camX, course = null) {
  if (t.hidden || t.acorns <= 0 || !input.pointer.active) return;
  const wx = camX + input.pointer.x, wy = input.pointer.y;
  let tx = wx, ty = wy, locked = false;
  if (course) {
    for (const p of course.hangingPots) if (p.state === 'hanging' && Math.hypot(p.x - wx, p.y - 24 - wy) < 130) { tx = p.x; ty = p.y - 24; locked = true; break; }
    if (!locked) for (const o of course.ovens) if (o.state !== 'slammed' && Math.hypot(o.latchX - wx, o.latchY - wy) < 120) { tx = o.latchX; ty = o.latchY; locked = true; break; }
  }
  const a = computeAcornAimVelocity(t, tx, ty);
  for (let i = 1; i <= 7; i++) { const u = i * 0.052; disc(ctx, a.originX + a.vx * u - camX, a.originY + a.vy * u + 0.5 * PHYSICS.acornGravity * u * u, 4 - i * 0.25, `rgba(255,240,168,${0.82 - i * 0.07})`, '#241108', 1.2); }
  if (!locked) return;
  const px = tx - camX, py = ty;
  disc(ctx, px, py, 13, null, '#ffe57a', 2.4);
  ctx.strokeStyle = '#ffe57a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 18, py); ctx.lineTo(px - 7, py); ctx.moveTo(px + 7, py); ctx.lineTo(px + 18, py); ctx.moveTo(px, py - 18); ctx.lineTo(px, py - 7); ctx.moveTo(px, py + 7); ctx.lineTo(px, py + 18); ctx.stroke();
}

function drawWing(ctx, d, m, t) {
  ctx.fillStyle = d; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-18, -16, -36, -4); ctx.quadraticCurveTo(-26, 10, -14, 13); ctx.quadraticCurveTo(-6, 12, 0, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2; ctx.stroke(); ell(ctx, -22, -2, 10, 4.4, -0.2, m); ell(ctx, -15, 5, 8.5, 4, -0.1, m); ell(ctx, -28, -3, 5, 2.5, -0.2, t);
}
function drawLeg(ctx, x, y, tilt) { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); rr(ctx, -8, 0, 17, 30, 6, '#2b456a', AUTUMN_PALETTE.inkDark, 2.4); rr(ctx, -10, 26, 24, 14, 5, '#3d2214', AUTUMN_PALETTE.inkDark, 2.4); ctx.restore(); }
function drawPill(ctx, x, y, text, bg, fg) { ctx.save(); ctx.font = fnt('900 14px'); const w = Math.max(96, ctx.measureText(text).width + 24); rr(ctx, x - w * 0.5, y - 14, w, 28, 14, bg, fg, 2.2); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 5); ctx.restore(); }
