// 5-layer parallax Thanksgiving backdrop renderer: Golden Farmyard -> Harvest Barn -> Applewood Pantry -> Roasting Kitchen -> Freedom Meadow.

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, STAGE_DEFINITIONS, VIEW_HEIGHT, VIEW_WIDTH, clamp, lerp } from '../config.js';

export function renderAutumnBackdrop(ctx, cameraX, time, stageBlendPos) {
  const meters = clamp(stageBlendPos / PIXELS_PER_METER, 0, 1200);
  const idx = clamp(Math.floor(meters / 300), 0, 3);
  const st = STAGE_DEFINITIONS[idx];
  const nxt = STAGE_DEFINITIONS[Math.min(3, idx + 1)];
  const dist = (idx + 1) * 300 - meters;
  const blend = idx < 3 && dist < 28 ? clamp(1 - dist / 28, 0, 1) : 0;

  const bg = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  bg.addColorStop(0, mixHex(st.skyTop, nxt.skyTop, blend));
  bg.addColorStop(0.55, mixHex(st.skyMid, nxt.skyMid, blend));
  bg.addColorStop(1, mixHex(st.skyLow, nxt.skyLow, blend));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const farmEnd = 300 * PIXELS_PER_METER;
  const barnEnd = 600 * PIXELS_PER_METER;
  const pantryEnd = 900 * PIXELS_PER_METER;
  const lw = cameraX - 200;
  const rw = cameraX + VIEW_WIDTH + 200;

  if (lw < farmEnd + 160) renderFarmyardStage(ctx, cameraX, time, farmEnd);
  if (rw > farmEnd - 160 && lw < barnEnd + 160) renderHarvestBarnStage(ctx, cameraX, time, farmEnd, barnEnd);
  if (rw > barnEnd - 160 && lw < pantryEnd + 160) renderApplewoodPantryStage(ctx, cameraX, time, barnEnd, pantryEnd);
  if (rw > pantryEnd - 160) renderRoastingKitchenStage(ctx, cameraX, time, pantryEnd);
  renderStageFloor(ctx, cameraX, farmEnd, barnEnd, pantryEnd);
}

export function renderFarmyardStage(ctx, cameraX, time, farmEnd) {
  const clipRight = clamp(farmEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (clipRight <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, clipRight, GROUND_Y);
  ctx.clip();

  const sunX = 910 - cameraX * 0.05;
  drawGlow(ctx, sunX, 175, 270, 'rgba(255,245,195,0.95)', 'rgba(235,118,52,0)');
  fillDisc(ctx, sunX, 175, 54, '#fff3c4');

  ctx.fillStyle = 'rgba(255,225,175,0.24)';
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 310 - cameraX * 0.08 + time * 8) % (VIEW_WIDTH + 320)) - 140;
    const cy = 92 + (i % 3) * 42;
    ctx.beginPath(); ctx.ellipse(cx, cy, 88, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 42, cy - 10, 56, 18, 0, 0, Math.PI * 2); ctx.fill();
  }

  drawHills(ctx, cameraX * 0.16, 370, 48, 0.0032, '#6c3430');
  drawHills(ctx, cameraX * 0.30, 432, 34, 0.0045, '#8b4125');

  const treeCols = ['#c94226', '#e07a22', '#eba92d', '#a62c24', '#d66024'];
  for (let i = -1; i < 16; i++) {
    const wx = i * 190;
    const sx = wx - cameraX * 0.32;
    if (sx < -120 || sx > VIEW_WIDTH + 120) continue;
    const ty = 432 + Math.sin(wx * 0.0045 + 1.2) * 26;
    ctx.fillStyle = '#472515';
    ctx.fillRect(sx - 6, ty - 26, 12, 50);
    const col = treeCols[Math.abs(i) % treeCols.length];
    fillDisc(ctx, sx - 24, ty - 28, 25, col);
    fillDisc(ctx, sx + 25, ty - 30, 26, col);
    fillDisc(ctx, sx, ty - 44, 34, col);
    fillDisc(ctx, sx + 8, ty - 52, 19, 'rgba(255,228,138,0.28)');
  }

  for (let b = 0; b < 3; b++) {
    const bx = 420 + b * 980 - cameraX * 0.44;
    if (bx < -220 || bx > VIEW_WIDTH + 220) continue;
    ctx.fillStyle = '#9c5c42'; ctx.fillRect(bx + 118, 345, 42, 165);
    ctx.fillStyle = '#6c382a'; ctx.beginPath(); ctx.arc(bx + 139, 345, 21, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#8d251e';
    ctx.beginPath();
    ctx.moveTo(bx, 510); ctx.lineTo(bx, 405); ctx.lineTo(bx + 25, 360); ctx.lineTo(bx + 65, 342);
    ctx.lineTo(bx + 105, 360); ctx.lineTo(bx + 130, 405); ctx.lineTo(bx + 130, 510); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f8e6c6'; ctx.lineWidth = 4; ctx.strokeRect(bx + 42, 434, 46, 74);
    ctx.beginPath(); ctx.moveTo(bx + 42, 434); ctx.lineTo(bx + 88, 508); ctx.moveTo(bx + 88, 434); ctx.lineTo(bx + 42, 508); ctx.stroke();

    const mx = bx - 52;
    ctx.strokeStyle = '#4e2b1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx - 16, 510); ctx.lineTo(mx - 4, 342); ctx.lineTo(mx + 4, 342); ctx.lineTo(mx + 16, 510); ctx.stroke();
    ctx.save(); ctx.translate(mx, 346); ctx.rotate(time * 0.9 + b); ctx.fillStyle = '#d9b584';
    for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-3, 4, 6, 32); }
    ctx.restore();
  }

  ctx.fillStyle = '#6f4820'; ctx.fillRect(0, 508, VIEW_WIDTH, GROUND_Y - 508);
  const fScroll = -(cameraX * 0.72) % 140;
  ctx.fillStyle = '#5e391b'; ctx.fillRect(0, 526, VIEW_WIDTH, 10); ctx.fillRect(0, 554, VIEW_WIDTH, 10);
  for (let fx = fScroll - 140; fx < VIEW_WIDTH + 140; fx += 140) {
    ctx.fillStyle = '#754925'; ctx.fillRect(fx, 504, 16, 98);
    ctx.fillStyle = '#996436'; ctx.fillRect(fx + 2, 504, 5, 98);
  }
  ctx.fillStyle = 'rgba(255,224,140,0.08)';
  for (let r = 0; r < 4; r++) {
    const rx = ((r * 380 - cameraX * 0.35) % (VIEW_WIDTH + 400)) - 120;
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx + 120, 0); ctx.lineTo(rx - 90, GROUND_Y); ctx.lineTo(rx - 210, GROUND_Y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export function renderHarvestBarnStage(ctx, cameraX, time, barnStart, barnEnd) {
  const left = clamp(barnStart - cameraX, 0, VIEW_WIDTH);
  const right = clamp(barnEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (right <= left) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, GROUND_Y); ctx.clip();
  ctx.strokeStyle = 'rgba(26,12,6,0.38)'; ctx.lineWidth = 2;
  for (let y = 70; y < GROUND_Y; y += 44) { ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); }

  for (let wx = Math.floor((barnStart + 120) / 420) * 420; wx < barnEnd; wx += 420) {
    const sx = (wx - barnStart) - (cameraX - barnStart) * 0.78;
    if (sx < -240 || sx > VIEW_WIDTH + 240) continue;
    ctx.fillStyle = '#f8c365'; ctx.fillRect(sx - 44, 118, 88, 96);
    ctx.strokeStyle = '#3c1e10'; ctx.lineWidth = 7; ctx.strokeRect(sx - 44, 118, 88, 96);
    ctx.beginPath(); ctx.moveTo(sx, 118); ctx.lineTo(sx, 214); ctx.moveTo(sx - 44, 166); ctx.lineTo(sx + 44, 166); ctx.stroke();
    const beam = ctx.createLinearGradient(sx, 140, sx - 160, GROUND_Y);
    beam.addColorStop(0, 'rgba(255,222,130,0.28)'); beam.addColorStop(1, 'rgba(255,200,100,0.02)');
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(sx - 40, 214); ctx.lineTo(sx + 40, 214); ctx.lineTo(sx - 120, GROUND_Y); ctx.lineTo(sx - 230, GROUND_Y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a2614'; ctx.fillRect(sx + 150, 0, 36, GROUND_Y);
    ctx.fillStyle = '#63351c'; ctx.fillRect(sx + 155, 0, 10, GROUND_Y);
    const lx = sx + 88 + Math.sin(time * 1.8 + wx * 0.01) * 5;
    ctx.strokeStyle = '#2a160c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx + 88, 0); ctx.lineTo(lx, 142); ctx.stroke();
    drawGlow(ctx, lx, 158, 92, 'rgba(255,224,128,0.85)');
    ctx.fillStyle = '#ffe58f'; ctx.fillRect(lx - 7, 148, 14, 18);
  }
  ctx.fillStyle = '#361a0e'; ctx.fillRect(left, 0, right - left, 52);
  ctx.restore();
}

export function renderApplewoodPantryStage(ctx, cameraX, time, pantryStart, pantryEnd) {
  const left = clamp(pantryStart - cameraX, 0, VIEW_WIDTH);
  const right = clamp(pantryEnd - cameraX + 40, 0, VIEW_WIDTH);
  if (right <= left) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, right - left, GROUND_Y); ctx.clip();
  ctx.fillStyle = '#42241c'; ctx.fillRect(left, 440, right - left, GROUND_Y - 440);
  ctx.fillStyle = '#6c3e26'; ctx.fillRect(left, 434, right - left, 10);

  const jarCols = ['#d93829', '#f0a732', '#6fa143', '#c85a32', '#e8c468'];
  for (let wx = Math.floor(pantryStart / 320) * 320; wx < pantryEnd + 320; wx += 320) {
    const sx = (wx - pantryStart) - (cameraX - pantryStart) * 0.8;
    if (sx < -260 || sx > VIEW_WIDTH + 260) continue;
    ctx.fillStyle = '#381e18'; ctx.fillRect(sx, 118, 224, 304);
    ctx.strokeStyle = '#693a24'; ctx.lineWidth = 6; ctx.strokeRect(sx, 118, 224, 304);
    for (let row = 0; row < 3; row++) {
      const sy = 200 + row * 94;
      ctx.fillStyle = '#7c482a'; ctx.fillRect(sx + 4, sy, 216, 12);
      for (let j = 0; j < 5; j++) {
        const jx = sx + 22 + j * 40;
        const jh = 34 + ((j + row) % 2) * 10;
        ctx.fillStyle = jarCols[(j + row * 2) % jarCols.length];
        ctx.beginPath(); ctx.roundRect(jx, sy - jh, 24, jh, 6); ctx.fill();
        ctx.fillStyle = 'rgba(255,250,230,0.36)'; ctx.fillRect(jx + 4, sy - jh + 5, 5, jh - 12);
        ctx.fillStyle = '#d49a4c'; ctx.fillRect(jx + 2, sy - jh - 6, 20, 6);
      }
    }
    drawGlow(ctx, sx + 265, 248, 115, 'rgba(255,200,110,0.40)');
  }
  ctx.fillStyle = '#2d1612'; ctx.fillRect(left, 0, right - left, 48);
  ctx.restore();
}

export function renderRoastingKitchenStage(ctx, cameraX, time, kitchenStart) {
  const left = clamp(kitchenStart - cameraX, 0, VIEW_WIDTH);
  if (left >= VIEW_WIDTH) return;
  ctx.save(); ctx.beginPath(); ctx.rect(left, 0, VIEW_WIDTH - left, GROUND_Y); ctx.clip();

  const gateX = COURSE_LENGTH_PX + 10 - cameraX;
  const kRight = Math.min(VIEW_WIDTH, gateX - 4);
  const brickW = 68;
  const offX = -(cameraX * 0.72) % brickW;
  for (let row = 0; row < 16; row++) {
    const sh = (row % 2) * 34;
    const y = 60 + row * 28;
    for (let x = offX - brickW; x < kRight + brickW; x += brickW) {
      const idx = Math.floor((x + cameraX * 0.72) / brickW) + row * 5;
      ctx.fillStyle = idx % 3 === 0 ? 'rgba(155,60,36,0.36)' : 'rgba(110,38,24,0.24)';
      ctx.fillRect(x + sh + 2, y + 2, brickW - 5, 23);
    }
  }
  if (kRight > left) {
    ctx.fillStyle = '#612d21'; ctx.fillRect(left, 444, kRight - left, GROUND_Y - 444);
    ctx.fillStyle = '#dc8a48'; ctx.fillRect(left, 438, kRight - left, 8);
  }

  // 3 Distinct Non-Repeating Storytelling Bays across the Roasting Kitchen!
  const b0 = Math.max(0, Math.floor((cameraX - kitchenStart - 400) / 430)), b1 = Math.ceil((cameraX - kitchenStart + VIEW_WIDTH + 400) / 430);
  for (let b = b0; b <= b1; b++) {
    const sx = b * 430 + 190 - (cameraX - kitchenStart) * 0.84;
    if (sx < -260 || sx > Math.min(VIEW_WIDTH + 260, gateX - 165)) continue;
    const v = ((b % 3) + 3) % 3;
    if (v === 0) { drawKitchenWindow(ctx, sx, 178); drawHerbRack(ctx, sx + 148, 176); }
    else if (v === 1) { drawSconce(ctx, sx - 118, 224, time); drawMenuBoard(ctx, sx - 104, 150, 214, 146); drawSconce(ctx, sx + 126, 224, time); }
    else { drawPieShelf(ctx, sx - 76, 162, time); drawDinnerClock(ctx, sx + 132, 198); }
  }

  // Radiant Sunlit Freedom Meadow beyond Freedom Gate
  if (gateX < VIEW_WIDTH + 60) {
    const fx = Math.max(left, gateX), sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#4f3550'); sky.addColorStop(0.45, '#d96e38'); sky.addColorStop(1, '#ffe082');
    ctx.fillStyle = sky; ctx.fillRect(fx, 0, VIEW_WIDTH - fx, GROUND_Y);
    drawGlow(ctx, gateX + 255, 220, 240, 'rgba(255,248,198,0.92)'); fillDisc(ctx, gateX + 255, 220, 48, '#fff7d1');
    ctx.fillStyle = '#7d3a24'; ctx.beginPath(); ctx.moveTo(fx, GROUND_Y); ctx.quadraticCurveTo(fx + 240, 380, VIEW_WIDTH + 40, 450); ctx.lineTo(VIEW_WIDTH + 40, GROUND_Y); ctx.closePath(); ctx.fill();
    for (const [dx, col] of [[110, '#e87622'], [220, '#d43c26'], [340, '#f2b12e']]) {
      ctx.fillStyle = '#472515'; ctx.fillRect(gateX + dx - 6, 440, 12, 80);
      fillDisc(ctx, gateX + dx - 20, 426, 24, col); fillDisc(ctx, gateX + dx + 20, 424, 25, col); fillDisc(ctx, gateX + dx, 410, 32, col);
    }
  }

  // Overhead Copper Pendant Lamps with warm downward light cones
  if (kRight > left) {
    ctx.fillStyle = '#241816'; ctx.fillRect(left, 68, kRight - left, 10);
    const off = -(cameraX * 0.88) % 190;
    for (let px = off - 190; px < kRight - 22; px += 190) {
      if (px < left - 40) continue;
      const cone = ctx.createLinearGradient(px, 112, px, 450);
      cone.addColorStop(0, 'rgba(255,220,130,0.16)'); cone.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = cone;
      ctx.beginPath(); ctx.moveTo(px - 22, 118); ctx.lineTo(px + 22, 118); ctx.lineTo(px + 96, 450); ctx.lineTo(px - 96, 450); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3d2f2c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, 76); ctx.lineTo(px, 102); ctx.stroke();
      fillDisc(ctx, px, 117, 9, '#fff2b0');
      const dg = ctx.createLinearGradient(px - 26, 98, px + 26, 120);
      dg.addColorStop(0, '#f5aa6a'); dg.addColorStop(0.55, '#c9622e'); dg.addColorStop(1, '#7a3318');
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(px, 118, 24, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#26120a'; ctx.lineWidth = 2.4; ctx.stroke();
    }
  }

  const hw = ctx.createLinearGradient(0, GROUND_Y, 0, 260);
  hw.addColorStop(0, `rgba(255,118,38,${0.14 + Math.sin(time * 6.5) * 0.03})`);
  hw.addColorStop(1, 'rgba(255,118,38,0)');
  ctx.fillStyle = hw; ctx.fillRect(left, 260, Math.max(0, kRight - left), GROUND_Y - 260);
  ctx.restore();
}

function drawKitchenWindow(ctx, sx, cy) {
  ctx.save();
  const path = () => { ctx.beginPath(); ctx.moveTo(sx - 66, cy + 130); ctx.lineTo(sx - 66, cy); ctx.arc(sx, cy, 66, Math.PI, 0); ctx.lineTo(sx + 66, cy + 130); ctx.closePath(); };
  path();
  const wg = ctx.createLinearGradient(sx, cy - 66, sx, cy + 130);
  wg.addColorStop(0, '#5a3656'); wg.addColorStop(0.5, '#e07238'); wg.addColorStop(1, '#ffd974');
  ctx.fillStyle = wg; ctx.fill();
  fillDisc(ctx, sx + 18, cy + 20, 22, '#fff3c4'); fillDisc(ctx, sx - 30, cy + 108, 34, '#82281e'); fillDisc(ctx, sx + 28, cy + 112, 36, '#82281e');
  ctx.strokeStyle = '#3b1e14'; ctx.lineWidth = 8; path(); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, cy - 66); ctx.lineTo(sx, cy + 130); ctx.moveTo(sx - 66, cy + 36); ctx.lineTo(sx + 66, cy + 36); ctx.stroke();
  const bm = ctx.createLinearGradient(sx, cy + 40, sx + 90, GROUND_Y);
  bm.addColorStop(0, 'rgba(255,224,130,0.16)'); bm.addColorStop(1, 'rgba(255,195,95,0)');
  ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(sx - 56, cy + 130); ctx.lineTo(sx + 56, cy + 130); ctx.lineTo(sx + 145, GROUND_Y); ctx.lineTo(sx - 15, GROUND_Y); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawHerbRack(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#2d1a14'; ctx.fillRect(x - 56, y, 112, 8);
  ctx.strokeStyle = '#c4a16a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 36, y + 8); ctx.lineTo(x - 36, y + 76); ctx.stroke();
  for (let i = 0; i < 4; i++) fillDisc(ctx, x - 36 + (i % 2 === 0 ? -6 : 6), y + 26 + i * 15, 8, i % 2 === 0 ? '#f5ebd1' : '#c93828');
  ctx.strokeStyle = '#5f9446'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x - 6, y + 70); ctx.moveTo(x, y + 8); ctx.lineTo(x + 8, y + 66); ctx.stroke();
  ctx.strokeStyle = '#332420'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 38, y + 8); ctx.lineTo(x + 38, y + 48); ctx.stroke();
  fillDisc(ctx, x + 38, y + 72, 24, '#d97136');
  ctx.strokeStyle = '#26120a'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x + 38, y + 72, 24, 0, Math.PI * 2); ctx.stroke();
  fillDisc(ctx, x + 31, y + 65, 7, 'rgba(255,242,200,0.42)');
  ctx.restore();
}

function drawMenuBoard(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#5c311b'; ctx.beginPath(); ctx.roundRect(x - 7, y - 7, w + 14, h + 14, 10); ctx.fill(); ctx.strokeStyle = '#e09a4e'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#1e2c24'; ctx.fillRect(x, y, w, h);
  const cx = x + w * 0.5, f = (s) => `${s} "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center'; ctx.fillStyle = '#f5ecd4'; ctx.font = f('900 15px'); ctx.fillText('THANKSGIVING MENU', cx, y + 30);
  ctx.strokeStyle = 'rgba(245,224,175,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 24, y + 39); ctx.lineTo(x + w - 24, y + 39); ctx.stroke();
  ctx.fillStyle = '#f8c646'; ctx.font = f('900 20px'); ctx.fillText('1. ROAST TURKEY', cx, y + 70);
  ctx.fillStyle = '#dfd4be'; ctx.font = f('800 14px'); ctx.fillText('2. CRANBERRY GLAZE', cx, y + 100); ctx.fillText('3. PUMPKIN PIE', cx, y + 124);
  ctx.strokeStyle = '#ff4b36'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 20, y + 66); ctx.lineTo(x + w - 20, y + 60); ctx.stroke();
  ctx.restore();
}

function drawSconce(ctx, x, y, time) {
  drawGlow(ctx, x, y, 76, `rgba(255,210,110,${0.42 * (0.88 + Math.sin(time * 7 + x) * 0.12)})`);
  ctx.fillStyle = '#d49a44'; ctx.fillRect(x - 4, y + 6, 8, 16);
  ctx.fillStyle = '#fff3b8'; ctx.beginPath(); ctx.ellipse(x, y, 6, 9, 0, 0, Math.PI * 2); ctx.fill();
}

function drawPieShelf(ctx, x, y, time) {
  ctx.save();
  for (let row = 0; row < 2; row++) {
    const sy = y + 54 + row * 78;
    ctx.fillStyle = '#754224'; ctx.fillRect(x, sy, 164, 11);
    ctx.strokeStyle = '#241108'; ctx.lineWidth = 2; ctx.strokeRect(x, sy, 164, 11);
    if (row === 0) {
      ctx.fillStyle = '#d6994d';
      ctx.beginPath(); ctx.moveTo(x + 14, sy); ctx.lineTo(x + 22, sy - 16); ctx.lineTo(x + 76, sy - 16); ctx.lineTo(x + 84, sy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e56f1f'; ctx.beginPath(); ctx.ellipse(x + 49, sy - 16, 28, 8, 0, 0, Math.PI * 2); ctx.fill();
      fillDisc(ctx, x + 49, sy - 20, 6, '#fff8ea');
      ctx.strokeStyle = 'rgba(255,245,225,0.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 48, sy - 28); ctx.quadraticCurveTo(x + 56 + Math.sin(time * 3) * 3, sy - 42, x + 44, sy - 54); ctx.stroke();
      for (let j = 0; j < 2; j++) {
        ctx.fillStyle = j === 0 ? '#c9262e' : '#f0a630'; ctx.beginPath(); ctx.roundRect(x + 98 + j * 30, sy - 34, 22, 34, 6); ctx.fill();
        ctx.fillStyle = '#d9a14c'; ctx.fillRect(x + 100 + j * 30, sy - 39, 18, 6);
      }
    } else {
      fillDisc(ctx, x + 44, sy - 18, 19, '#d46d34');
      for (let k = 0; k < 3; k++) { ctx.fillStyle = ['#e8d4ad', '#628f3d', '#b83226'][k]; ctx.fillRect(x + 82 + k * 24, sy - 28, 18, 28); }
    }
  }
  ctx.restore();
}

function drawDinnerClock(ctx, cx, cy) {
  ctx.save();
  fillDisc(ctx, cx, cy, 34, '#5c311b');
  ctx.strokeStyle = '#e8b34c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
  fillDisc(ctx, cx, cy, 27, '#fbf0d5');
  ctx.strokeStyle = '#24120a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 2, cy + 16); ctx.moveTo(cx, cy); ctx.lineTo(cx - 8, cy - 18); ctx.stroke();
  fillDisc(ctx, cx, cy, 3.5, '#c92a22');
  ctx.restore();
}

function renderStageFloor(ctx, cameraX, farmEnd, barnEnd, pantryEnd) {
  const floorH = VIEW_HEIGHT - GROUND_Y;
  ctx.fillStyle = '#3c2214'; ctx.fillRect(0, GROUND_Y, VIEW_WIDTH, floorH);
  const secs = [
    { s: -400, e: farmEnd, top: '#8c622e', body: '#4a2e16', m: 'farm' },
    { s: farmEnd, e: barnEnd, top: '#8a562a', body: '#442613', m: 'barn' },
    { s: barnEnd, e: pantryEnd, top: '#8b6346', body: '#462b1c', m: 'pantry' },
    { s: pantryEnd, e: COURSE_LENGTH_PX + 2000, top: '#c4714a', body: '#4e251d', m: 'kitchen' },
  ];
  for (const sec of secs) {
    const sx = clamp(sec.s - cameraX, 0, VIEW_WIDTH);
    const ex = clamp(sec.e - cameraX, 0, VIEW_WIDTH);
    if (ex <= sx) continue;
    ctx.fillStyle = sec.body; ctx.fillRect(sx, GROUND_Y, ex - sx, floorH);
    ctx.fillStyle = sec.top; ctx.fillRect(sx, GROUND_Y, ex - sx, 24);
    if (sec.m === 'farm') {
      ctx.fillStyle = '#c4862e';
      for (let wx = Math.floor((cameraX + sx) / 48) * 48; wx < cameraX + ex + 48; wx += 48) {
        const x = wx - cameraX;
        ctx.beginPath(); ctx.moveTo(x, GROUND_Y + 2); ctx.lineTo(x + 7, GROUND_Y - 10); ctx.lineTo(x + 14, GROUND_Y + 2); ctx.fill();
      }
    } else if (sec.m === 'kitchen') {
      for (let wx = Math.floor((cameraX + sx) / 64) * 64; wx < cameraX + ex + 64; wx += 64) {
        const i = Math.floor(wx / 64);
        const dx = Math.max(sx, wx - cameraX);
        const dw = Math.min(ex, wx - cameraX + 64) - dx;
        if (dw <= 0) continue;
        ctx.fillStyle = i % 2 === 0 ? '#f0d8b2' : '#a8472e'; ctx.fillRect(dx, GROUND_Y, dw, 24);
        ctx.fillStyle = i % 2 === 0 ? '#8c3723' : '#c9ad85'; ctx.fillRect(dx, GROUND_Y + 24, dw, 28);
      }
    } else if (sec.m === 'barn') {
      ctx.strokeStyle = '#331a0d'; ctx.lineWidth = 2;
      for (let wx = Math.floor((cameraX + sx) / 96) * 96; wx < cameraX + ex + 96; wx += 96) {
        const x = wx - cameraX;
        ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.lineTo(x, GROUND_Y + 38); ctx.stroke();
      }
    }
  }
  ctx.fillStyle = '#24120a'; ctx.fillRect(0, GROUND_Y - 2, VIEW_WIDTH, 4);
}

function drawHills(ctx, scrollX, baseY, amp, freq, col) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_WIDTH + 40; x += 36) ctx.lineTo(x, baseY + Math.sin((x + scrollX) * freq) * amp);
  ctx.lineTo(VIEW_WIDTH, GROUND_Y); ctx.closePath(); ctx.fill();
}

function fillDisc(ctx, x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function drawGlow(ctx, x, y, r, c0, c1 = 'rgba(255,160,60,0)') {
  const g = ctx.createRadialGradient(x, y, 4, x, y, r);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function mixHex(a, b, t) {
  const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ca = p(a); const cb = p(b);
  return `rgb(${Math.round(lerp(ca[0], cb[0], t))},${Math.round(lerp(ca[1], cb[1], t))},${Math.round(lerp(ca[2], cb[2], t))})`;
}
