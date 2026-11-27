// Expressive storybook character renderer: Pippin the Turkey, Farmer Barnaby, volumetric lantern vision cone, comic speech bubbles, and acorn aim arc.

import { AUTUMN_PALETTE, GROUND_Y, PHYSICS, VIEW_WIDTH } from '../config.js';
import { computeAcornAimVelocity } from '../entities/turkey.js';
import { computeVisionCone } from '../entities/farmer-ai.js';

export function drawTurkeyPippin(ctx, turkey, cameraX, time, withCrown = false, fireGlow = 0) {
  if (turkey.hidden) return;
  if (turkey.invulnTimer > 0 && Math.floor(turkey.invulnTimer * 18) % 2 === 0) return;

  const sx = turkey.x - cameraX;
  const sy = turkey.y;
  const airborne = !turkey.grounded;
  const ink = AUTUMN_PALETTE.inkDark;

  ctx.save();
  const shScale = Math.max(0.32, 1 - Math.max(0, GROUND_Y - sy) / 360);
  ctx.fillStyle = `rgba(18,8,4,${0.42 * shScale})`;
  ctx.beginPath(); ctx.ellipse(sx, GROUND_Y + 3, 30 * shScale, 8 * shScale, 0, 0, Math.PI * 2); ctx.fill();

  if (turkey.dashTimer > 0) {
    ctx.strokeStyle = 'rgba(255,224,120,0.85)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let s = 0; s < 3; s++) {
      const lx = sx - turkey.facing * (42 + s * 18);
      const ly = sy - 20 - s * 16;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - turkey.facing * 42, ly); ctx.stroke();
    }
  }

  ctx.translate(sx, sy);
  ctx.scale(turkey.facing * turkey.squashX * 1.28, turkey.squashY * 1.28);
  ctx.rotate(Math.min(1, Math.abs(turkey.vx) / 380) * 0.14);

  if (airborne || turkey.dashTimer > 0) {
    ctx.save(); ctx.translate(4, -36); ctx.rotate(-0.65 + Math.sin(time * 36) * 0.25);
    drawWing(ctx, '#7a3316', '#c96228'); ctx.restore();
  }

  // Lush 9-feather fanned autumn tail plumage
  const tailCols = ['#8a2618', '#b83c1c', '#dc621e', '#f09424', '#f9c63c', '#f09424', '#dc621e', '#b83c1c', '#8a2618'];
  const jitter = turkey.panicLevel * Math.sin(time * 36) * 0.05;
  ctx.save(); ctx.translate(-15, -30);
  for (let i = 0; i < 9; i++) {
    ctx.save(); ctx.rotate(-2.45 + i * 0.20 + jitter);
    ctx.fillStyle = tailCols[i]; ctx.beginPath(); ctx.ellipse(0, -25, 7, 25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff2ce'; ctx.beginPath(); ctx.ellipse(0, -42, 4.8, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -25, 7, 25, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Legs
  const stride = turkey.grounded ? Math.sin(turkey.runCycle) * 14 : 11;
  ctx.strokeStyle = '#eda02e'; ctx.lineWidth = 4.6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -14); ctx.lineTo(-6 - stride * 0.65, airborne ? -6 : -2); ctx.lineTo(3 - stride * 0.65, airborne ? -3 : -1);
  ctx.moveTo(6, -14); ctx.lineTo(8 + stride * 0.85, airborne ? -5 : -2); ctx.lineTo(17 + stride * 0.85, airborne ? -2 : -1);
  ctx.stroke();

  // Body + oven bounce rim light
  const bg = ctx.createRadialGradient(5, -35, 4, -2, -26, 28);
  bg.addColorStop(0, '#c46a34'); bg.addColorStop(0.55, '#863c1b'); bg.addColorStop(1, '#4f200e');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(-2, -28, 25, 21, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
  if (fireGlow > 0.05) {
    ctx.strokeStyle = `rgba(255,190,72,${Math.min(0.85, fireGlow * 0.85)})`; ctx.lineWidth = 4.2;
    ctx.beginPath(); ctx.arc(-1, -26, 22, 0.35, 2.35); ctx.stroke();
  }

  // Expressive outstretched flapping wing
  ctx.save(); ctx.translate(-3, -32);
  if (airborne || turkey.dashTimer > 0) {
    ctx.rotate(Math.sin(time * 40) * 0.42 - 1.05); drawWing(ctx, '#a64d22', '#e58538');
  } else {
    ctx.rotate(Math.sin(turkey.runCycle * 2) * 0.18);
    ctx.fillStyle = '#9e4b22'; ctx.beginPath(); ctx.ellipse(-3, 4, 15, 9, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 2.4; ctx.stroke();
  }
  ctx.restore();

  // Neck, Head, Wattle, Open Squawking Beak, Snood & Wide Panicked Eye
  ctx.fillStyle = '#8d4220'; ctx.beginPath(); ctx.roundRect(10, -56, 13, 24, 6); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#a04e27'; ctx.beginPath(); ctx.arc(18, -56, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#df262c'; ctx.beginPath(); ctx.ellipse(24 + Math.sin(time * 18), -44, 5.5, 8.5, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();

  const open = turkey.dashTimer > 0 || turkey.panicLevel > 0.45 ? 5.5 : 0;
  ctx.fillStyle = '#fbc238'; ctx.beginPath(); ctx.moveTo(29, -60); ctx.lineTo(44, -56 - open * 0.55); ctx.lineTo(29, -52); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (open > 0) {
    ctx.fillStyle = '#a81e20'; ctx.beginPath(); ctx.moveTo(29, -53); ctx.lineTo(41, -48 + open * 0.45); ctx.lineTo(29, -47); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = '#e52b31'; ctx.beginPath(); ctx.ellipse(31, -60, 4.5, 7, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  const eScale = 1 + turkey.panicLevel * 0.24;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(21, -59, 7 * eScale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#140905'; ctx.beginPath(); ctx.arc(23.5, -59, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(24.7, -60.5, 1.4, 0, Math.PI * 2); ctx.fill();

  if (turkey.panicLevel > 0.6 && !withCrown) {
    ctx.fillStyle = '#bfe8ff'; ctx.beginPath(); ctx.ellipse(4, -71, 3, 5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#254254'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  if (withCrown) {
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath(); ctx.moveTo(8, -68); ctx.lineTo(10, -83); ctx.lineTo(16, -74); ctx.lineTo(20, -86); ctx.lineTo(24, -74); ctx.lineTo(29, -82); ctx.lineTo(28, -68); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5e3208'; ctx.lineWidth = 2.2; ctx.stroke();
  }
  ctx.restore();

  if (turkey.speechTimer > 0 && turkey.speech) drawFarmerSpeechBubble(ctx, sx + turkey.facing * 12, sy - 104, turkey.speech);
}

export function drawFarmerBarnaby(ctx, farmer, cameraX, time) {
  const sx = farmer.x - cameraX;
  if (sx < -240 || sx > VIEW_WIDTH + 240) return;
  drawLanternVisionCone(ctx, farmer, cameraX);

  const ink = AUTUMN_PALETTE.inkDark;
  const chasing = farmer.state === 'chase' || farmer.state === 'lunge';
  ctx.save();
  ctx.fillStyle = 'rgba(18,8,4,0.44)'; ctx.beginPath(); ctx.ellipse(sx, GROUND_Y + 4, 42, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(sx, farmer.y);
  ctx.scale(farmer.facing * 1.15, 1.15);
  ctx.rotate(farmer.state === 'lunge' && farmer.lungeWindup <= 0 ? 0.28 : chasing ? 0.18 : 0.03);

  const stride = chasing ? Math.sin(farmer.strideCycle) * 20 + 6 : Math.sin(farmer.strideCycle) * 12;
  drawBootLeg(ctx, -14 - stride * 0.55, -42, -0.22 * Math.sign(stride || 1));
  drawBootLeg(ctx, 6 + stride * 0.65, -42, 0.25 * Math.sign(stride || 1));

  // Back arm with glowing brass lantern
  ctx.save(); ctx.translate(16, -78); ctx.rotate(farmer.state === 'search' ? -0.45 : -0.1);
  ctx.fillStyle = '#b82924'; ctx.beginPath(); ctx.roundRect(-6, -6, 26, 13, 6); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.translate(22, 5); ctx.fillStyle = '#3b2416'; ctx.fillRect(-8, -4, 16, 6);
  ctx.fillStyle = '#fff2ad'; ctx.fillRect(-6, 2, 12, 15); ctx.strokeRect(-6, 2, 12, 15);
  ctx.fillStyle = '#3b2416'; ctx.fillRect(-8, 17, 16, 5); ctx.restore();

  // Plaid flannel torso + denim overalls
  ctx.fillStyle = '#b82924'; ctx.beginPath(); ctx.ellipse(0, -68, 31, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(35,15,10,0.34)'; ctx.beginPath(); ctx.moveTo(-26, -74); ctx.lineTo(26, -74); ctx.moveTo(-28, -60); ctx.lineTo(28, -60); ctx.stroke();
  ctx.fillStyle = '#365887'; ctx.beginPath(); ctx.roundRect(-24, -74, 48, 42, 12); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.fillRect(-17, -96, 9, 26); ctx.fillRect(8, -96, 9, 26);
  ctx.fillStyle = '#f5c54e'; ctx.beginPath(); ctx.arc(-12, -74, 3.6, 0, Math.PI * 2); ctx.arc(12, -74, 3.6, 0, Math.PI * 2); ctx.fill();

  // Expressive head, shouting mouth & bushy handlebar mustache
  ctx.fillStyle = '#f3bfa0'; ctx.beginPath(); ctx.arc(4, -108, 18, 0, 6.28); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(225,92,78,0.45)'; ctx.beginPath(); ctx.arc(11, -104, 5, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(11, -112, 4.8, 0, 6.28); ctx.fill();
  ctx.fillStyle = '#1a0c06'; ctx.beginPath(); ctx.arc(12.8, -112, 2.3, 0, 6.28); ctx.fill();
  ctx.strokeStyle = '#4f2814'; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(4, -120); ctx.lineTo(18, -114); ctx.stroke();
  if (chasing) { ctx.fillStyle = '#5c1414'; ctx.beginPath(); ctx.ellipse(11, -94, 6.5, 4.8, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(7, -97, 8, 2.4); }
  ctx.fillStyle = '#5e2e16'; ctx.beginPath(); ctx.moveTo(4, -103); ctx.quadraticCurveTo(16, -108, 24, -99); ctx.quadraticCurveTo(16, -95, 6, -98); ctx.quadraticCurveTo(-2, -95, -9, -100); ctx.quadraticCurveTo(-3, -107, 4, -103); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();

  // Front arm thrusting gleaming silver two-pronged carving fork FORWARD!
  ctx.save(); ctx.translate(-8, -76); ctx.rotate(farmer.state === 'lunge' ? -0.18 : chasing ? -0.28 : -0.45);
  ctx.fillStyle = '#c42e28'; ctx.beginPath(); ctx.roundRect(-4, -6, 30, 13, 6); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.fillStyle = '#6b381b'; ctx.fillRect(22, -3.5, 24, 7); ctx.strokeRect(22, -3.5, 24, 7);
  ctx.strokeStyle = '#eef6fc'; ctx.lineWidth = 3.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(46, 0); ctx.lineTo(58, 0); ctx.moveTo(58, -7); ctx.lineTo(78, -7); ctx.moveTo(58, 7); ctx.lineTo(78, 7); ctx.moveTo(58, -7); ctx.lineTo(58, 7); ctx.stroke();
  ctx.restore();

  // Woven straw hat popping up cleanly
  ctx.save(); ctx.translate(2, -124 - farmer.hatPop * 0.72); ctx.rotate(-0.14 - farmer.hatPop * 0.009);
  ctx.fillStyle = '#eab954'; ctx.beginPath(); ctx.ellipse(0, 0, 32, 8.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.fillStyle = '#f5ca69'; ctx.beginPath(); ctx.roundRect(-18, -19, 36, 19, [10, 10, 2, 2]); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b82522'; ctx.fillRect(-18, -7, 36, 6); ctx.restore();
  ctx.restore();

  const topY = farmer.y - 198 - farmer.hatPop * 0.75;
  if (farmer.state === 'stunned') {
    for (let s = 0; s < 3; s++) {
      const a = time * 5 + (s * Math.PI * 2) / 3;
      ctx.fillStyle = '#ffe55c'; ctx.beginPath(); ctx.arc(sx + Math.cos(a) * 28, topY + 22 + Math.sin(a) * 7, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5c310a'; ctx.lineWidth = 2; ctx.stroke();
    }
    drawPill(ctx, sx, topY - 4, 'STUNNED!', '#5a3a18', '#ffe566');
  } else if (farmer.state === 'lunge') drawPill(ctx, sx, topY, '!! LUNGE !!', '#b81d18', '#fff0a8');
  else if (farmer.state === 'chase') drawPill(ctx, sx, topY, '! CHASING !', '#c92a22', '#fff3c4');
  else if (farmer.state === 'search') drawPill(ctx, sx, topY, '? SEARCHING ?', '#b86814', '#fff5cc');

  if (farmer.speechTimer > 0 && farmer.speech) drawFarmerSpeechBubble(ctx, sx, topY - 40, farmer.speech);
}

export function drawLanternVisionCone(ctx, farmer, cameraX) {
  if (farmer.state === 'stunned') return;
  const cone = computeVisionCone(farmer);
  const ox = cone.originX - cameraX;
  const oy = cone.originY;
  const isChase = farmer.state === 'chase' || farmer.state === 'lunge';
  const isSearch = farmer.state === 'search';
  ctx.save();
  const g = ctx.createRadialGradient(ox, oy, 14, ox, oy, cone.reach);
  if (isChase) { g.addColorStop(0, 'rgba(255,118,52,0.40)'); g.addColorStop(0.65, 'rgba(255,85,42,0.14)'); g.addColorStop(1, 'rgba(255,65,35,0)'); }
  else if (isSearch) { g.addColorStop(0, 'rgba(255,228,118,0.56)'); g.addColorStop(0.7, 'rgba(255,194,72,0.22)'); g.addColorStop(1, 'rgba(255,180,60,0)'); }
  else { g.addColorStop(0, 'rgba(255,226,138,0.30)'); g.addColorStop(1, 'rgba(255,200,95,0)'); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, cone.reach, cone.baseAngle - cone.halfSpread, cone.baseAngle + cone.halfSpread); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function drawFarmerSpeechBubble(ctx, x, y, text, bg = '#fff7e0', ink = '#24120a') {
  ctx.save(); ctx.font = '900 14px "Trebuchet MS", sans-serif';
  const w = Math.max(108, ctx.measureText(text).width + 26);
  const bx = Math.max(16 + w * 0.5, Math.min(VIEW_WIDTH - 16 - w * 0.5, x));
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(bx - w * 0.5, y - 16, w, 32, 12); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 6, y + 16); ctx.lineTo(bx + 6, y + 16); ctx.lineTo(bx, y + 24); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(text, bx, y + 5); ctx.restore();
}

export function drawAcornDecoyArc(ctx, turkey, input, cameraX) {
  if (turkey.hidden || turkey.acorns <= 0 || !input.pointer.active) return;
  const aim = computeAcornAimVelocity(turkey, cameraX + input.pointer.x, input.pointer.y);
  ctx.save();
  for (let i = 1; i <= 7; i++) {
    const t = i * 0.055;
    ctx.fillStyle = `rgba(255,236,178,${0.72 - i * 0.08})`;
    ctx.beginPath(); ctx.arc(aim.originX + aim.vx * t - cameraX, aim.originY + aim.vy * t + 0.5 * PHYSICS.acornGravity * t * t, 3.6 - i * 0.25, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawWing(ctx, darkFill, tipFill) {
  ctx.fillStyle = darkFill;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-18, -14, -34, -4); ctx.quadraticCurveTo(-24, 10, -14, 12); ctx.quadraticCurveTo(-6, 12, 0, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.fillStyle = tipFill; ctx.beginPath(); ctx.ellipse(-22, -1, 9, 4.2, -0.2, 0, Math.PI * 2); ctx.ellipse(-15, 5, 8, 3.8, -0.1, 0, Math.PI * 2); ctx.fill();
}

function drawBootLeg(ctx, x, y, tilt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.fillStyle = '#2d476c'; ctx.beginPath(); ctx.roundRect(-8, 0, 17, 30, 6); ctx.fill();
  ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.8; ctx.stroke();
  ctx.fillStyle = '#3d2214'; ctx.beginPath(); ctx.roundRect(-10, 26, 24, 14, 5); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawPill(ctx, x, y, text, bg, fg) {
  ctx.save(); ctx.font = '900 14px "Trebuchet MS", sans-serif';
  const w = Math.max(96, ctx.measureText(text).width + 24);
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x - w * 0.5, y - 14, w, 28, 14); ctx.fill();
  ctx.strokeStyle = fg; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 5); ctx.restore();
}
