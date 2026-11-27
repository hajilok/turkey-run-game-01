// Real-time 2.5D lighting engine: glossy perspective floor reflections, offscreen lightmap shadow veil, volumetric god-rays, and foreground silhouettes.

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, VIEW_HEIGHT, VIEW_WIDTH, clamp } from '../config.js';
import { computeVisionCone } from '../entities/farmer-ai.js';
import { getOvenFlameBox } from '../world/hazards.js';
import { ell, glow, lgrad, rgrad } from './textures.js';

export function createLightingEngine() {
  const lm = document.createElement('canvas'); lm.width = 640; lm.height = 360;
  return { lm, lctx: lm.getContext('2d') };
}

export function renderFloorReflections(ctx, state, camX, time) {
  const { course, turkey, farmer } = state, fl = clamp(600 * PIXELS_PER_METER - camX, 0, VIEW_WIDTH);
  if (fl >= VIEW_WIDTH) return;
  ctx.save(); ctx.beginPath(); ctx.rect(fl, GROUND_Y + 2, VIEW_WIDTH - fl, VIEW_HEIGHT - GROUND_Y); ctx.clip();
  for (const ov of course.ovens) {
    const sx = ov.x - camX + ov.rattle; if (sx + ov.w < -240 || sx > VIEW_WIDTH + 240) continue;
    const bl = ov.state === 'blast', pr = ov.state === 'preheat', cx = sx + ov.w * 0.45 - (bl ? 58 : 0), gw = bl ? 215 : pr ? 120 : 75;
    ell(ctx, cx, GROUND_Y + 48, gw, 58, 0, rgrad(ctx, cx, GROUND_Y + 18, 8, cx, GROUND_Y + 56, gw, [[0, bl ? 'rgba(255,222,102,0.58)' : 'rgba(255,148,54,0.30)'], [0.48, bl ? 'rgba(255,112,30,0.30)' : 'rgba(220,76,22,0.12)'], [1, 'rgba(255,80,18,0)']]));
    const f = getOvenFlameBox(ov);
    if (f) { const fx = f.x - camX + f.w * 0.5; ell(ctx, fx + Math.sin(time * 22) * 5, GROUND_Y + 36, f.w * 0.58, 40, 0, lgrad(ctx, fx, GROUND_Y, fx, GROUND_Y + 98, [[0, 'rgba(255,238,136,0.52)'], [0.55, 'rgba(255,118,32,0.24)'], [1, 'rgba(255,80,20,0)']])); }
  }
  const fx = farmer.x - camX;
  if (fx > fl - 100 && fx < VIEW_WIDTH + 100) { ell(ctx, fx + farmer.facing * 52, GROUND_Y + 42, 120, 44, 0, rgrad(ctx, fx + farmer.facing * 42, GROUND_Y + 24, 6, fx + farmer.facing * 52, GROUND_Y + 48, 120, [[0, 'rgba(255,224,128,0.38)'], [1, 'rgba(255,165,60,0)']])); ell(ctx, fx, GROUND_Y + 44, 34, 24, 0, 'rgba(32,54,88,0.28)'); }
  if (!turkey.hidden) { const alt = Math.max(0, GROUND_Y - turkey.y); ell(ctx, turkey.x - camX, GROUND_Y + 26 + alt * 0.28, 36, 17, 0, `rgba(210,104,42,${clamp(0.32 - alt / 420, 0.08, 0.32)})`); }
  for (const sp of course.hidingSpots) if (sp.kind === 'copper_pot') { const px = sp.x + sp.w * 0.5 - camX; if (px > fl - 60 && px < VIEW_WIDTH + 60) ell(ctx, px, GROUND_Y + 34, 38, 22, 0, 'rgba(218,118,56,0.24)'); }
  ctx.fillStyle = 'rgba(255,244,210,0.06)'; for (let y = GROUND_Y + 14; y < VIEW_HEIGHT; y += 22) ctx.fillRect(fl, y, VIEW_WIDTH - fl, 3);
  ctx.restore();
}

export function renderDynamicLightMap(ctx, lighting, state, cameraX, stageIndex, time) {
  const { lm, lctx } = lighting, { course, turkey, farmer } = state;
  const veil = stageIndex === 0 ? 0.07 : stageIndex === 1 ? 0.18 : stageIndex === 2 ? 0.28 : 0.32;
  lctx.save(); lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, 640, 360);
  lctx.fillStyle = stageIndex === 0 ? `rgba(48,18,22,${veil})` : `rgba(22,8,14,${veil})`; lctx.fillRect(0, 0, 640, 360);
  lctx.globalCompositeOperation = 'destination-out';

  const punch = (x, y, r, s = 1) => {
    if (x < -r || x > VIEW_WIDTH + r) return;
    const g = rgrad(lctx, x * 0.5, y * 0.5, r * 0.04, x * 0.5, y * 0.5, r * 0.5, [[0, `rgba(0,0,0,${s})`], [0.55, `rgba(0,0,0,${s * 0.55})`], [1, 'rgba(0,0,0,0)']]);
    lctx.fillStyle = g; lctx.beginPath(); lctx.arc(x * 0.5, y * 0.5, r * 0.5, 0, 6.28); lctx.fill();
  };
  punch(turkey.x - cameraX, turkey.y - 36, 230, 0.94);
  if (farmer.state !== 'stunned') {
    const c = computeVisionCone(farmer);
    punch(c.originX - cameraX, c.originY, 180, 0.92);
    punch(c.originX - cameraX + Math.cos(c.baseAngle) * 185, c.originY + Math.sin(c.baseAngle) * 110, 220, 0.8);
  }
  for (const ov of course.ovens) {
    const ox = ov.x - cameraX + ov.w * 0.5;
    if (ox > -320 && ox < VIEW_WIDTH + 320) punch(ox - (ov.state === 'blast' ? 75 : 0), ov.y + 62, ov.state === 'blast' ? 360 : ov.state === 'preheat' ? 240 : 145, 1);
  }
  const gateX = COURSE_LENGTH_PX - cameraX;
  if (gateX < VIEW_WIDTH + 360) punch(gateX + 120, GROUND_Y - 130, 520, 1);
  if (stageIndex >= 1) {
    const step = stageIndex === 3 ? 190 : 320, off = -(cameraX * 0.86) % step;
    for (let px = off - step; px < VIEW_WIDTH + step; px += step) punch(px, 210, 200, 0.65);
  }
  lctx.restore();

  ctx.save(); ctx.drawImage(lm, 0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.globalCompositeOperation = 'lighter';
  for (const ov of course.ovens) {
    if (ov.state === 'slammed') continue;
    const ox = ov.x - cameraX + ov.rattle;
    if (ox < -260 || ox > VIEW_WIDTH + 260) continue;
    const fl = 0.88 + Math.sin(time * 19 + ov.x) * 0.12;
    if (ov.state === 'blast') glow(ctx, ox - 52, ov.y + 66, 230, `rgba(255,148,42,${0.27 * fl})`);
    else if (ov.state === 'preheat') glow(ctx, ox + 12, ov.y + 64, 130, `rgba(255,120,38,${0.18 * fl})`);
  }
  if (farmer.state !== 'stunned') glow(ctx, farmer.x - cameraX + farmer.facing * 32, farmer.y - 82, 80, 'rgba(255,222,126,0.22)');
  if (gateX < VIEW_WIDTH + 280) glow(ctx, gateX + 45, GROUND_Y - 120, 320, 'rgba(255,228,136,0.24)');
  ctx.restore();
}

export function renderVolumetricGodRays(ctx, cameraX, time, stageIndex) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (stageIndex === 0) {
    for (let i = 0; i < 4; i++) {
      const rx = ((i * 360 + 180 - cameraX * 0.25) % (VIEW_WIDTH + 440)) - 120;
      ctx.fillStyle = lgrad(ctx, rx, 0, rx - 160, GROUND_Y, [[0, 'rgba(255,232,150,0.13)'], [1, 'rgba(255,195,90,0)']]);
      ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 128, 0); ctx.lineTo(rx - 75, GROUND_Y); ctx.lineTo(rx - 205, GROUND_Y); ctx.closePath(); ctx.fill();
    }
  } else if (stageIndex === 1) {
    for (let i = 0; i < 32; i++) {
      const mx = ((i * 157 + time * 14 - cameraX * 0.5) % VIEW_WIDTH + VIEW_WIDTH) % VIEW_WIDTH;
      const my = 135 + ((i * 93 + Math.sin(time * 1.4 + i) * 26) % 415);
      ctx.fillStyle = `rgba(255,238,162,${0.28 + 0.26 * Math.sin(time * 3 + i * 1.7)})`;
      ctx.beginPath(); ctx.arc(mx, my, 1.8 + (i % 3) * 0.85, 0, 6.28); ctx.fill();
    }
  } else if (stageIndex === 3) {
    ctx.strokeStyle = 'rgba(255,208,124,0.09)'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const hx = ((i * 230 + 60 - cameraX * 0.9) % (VIEW_WIDTH + 200) + VIEW_WIDTH + 200) % (VIEW_WIDTH + 200) - 100;
      ctx.beginPath();
      for (let y = GROUND_Y - 12; y > 260; y -= 24) { const x = hx + Math.sin(y * 0.04 + time * 6 + i) * 7; if (y === GROUND_Y - 12) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function renderForegroundParallax(ctx, cameraX, time, stageIndex) {
  ctx.save();
  // Soft cinematic edge vignette framing bottom corners without obscuring floor reflections or gameplay
  const g = lgrad(ctx, 0, VIEW_HEIGHT - 36, 0, VIEW_HEIGHT, [[0, 'rgba(14,6,3,0)'], [1, 'rgba(14,6,3,0.42)']]);
  ctx.fillStyle = g; ctx.fillRect(0, VIEW_HEIGHT - 36, VIEW_WIDTH, 36);
  if (stageIndex === 0) {
    const sc = -(cameraX * 1.24) % 720;
    ctx.fillStyle = 'rgba(26,12,7,0.52)';
    for (let x = sc - 720; x < VIEW_WIDTH + 720; x += 360) ell(ctx, x + 28, 718, 42, 16, -0.1, 'rgba(26,12,7,0.52)');
  }
  ctx.restore();
}
