// Hand-crafted parchment & copper-brass HUD, Stage Progress Bar, Title Screen, Pause Menu, and Escaped / Caught End Screens.

import { AUTUMN_PALETTE, COURSE_LENGTH_PX, PIXELS_PER_METER, REPLAY_MODES, STAGE_DEFINITIONS, TOTAL_DISTANCE_METERS, VIEW_HEIGHT, VIEW_WIDTH, clamp } from '../config.js';
import { getStageAtX } from '../world/stages.js';

export function drawGameplayHud(ctx, state, input) {
  const { turkey, farmer, stats, sound, mode } = state;
  const stage = getStageAtX(turkey.x);
  const meters = Math.min(TOTAL_DISTANCE_METERS, Math.floor(turkey.x / PIXELS_PER_METER));

  if ((farmer.state === 'chase' || farmer.state === 'lunge') && !turkey.hidden) {
    const pulse = (0.14 + Math.sin(state.time * 9) * 0.06) * clamp(1 - Math.abs(turkey.x - farmer.x) / 480, 0.15, 0.85);
    const vig = ctx.createRadialGradient(VIEW_WIDTH * 0.5, VIEW_HEIGHT * 0.5, VIEW_HEIGHT * 0.36, VIEW_WIDTH * 0.5, VIEW_HEIGHT * 0.5, VIEW_WIDTH * 0.62);
    vig.addColorStop(0, 'rgba(220,38,22,0)'); vig.addColorStop(1, `rgba(220,38,22,${pulse})`);
    ctx.fillStyle = vig; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }

  drawPanel(ctx, 18, 14, 294, 82, 14);
  const f = (s) => `${s} "Trebuchet MS", sans-serif`;
  ctx.fillStyle = '#f8d58d'; ctx.font = f('900 13px'); ctx.textAlign = 'left'; ctx.fillText('LIVES', 34, 36);
  for (let i = 0; i < turkey.maxLives; i++) drawHeart(ctx, 98 + i * 32, 32, i < turkey.lives);
  ctx.fillStyle = '#ffe59c'; ctx.font = f('900 14px'); ctx.textAlign = 'right'; ctx.fillText(`ACORNS: ${turkey.acorns}`, 296, 36);

  ctx.fillStyle = '#f8d58d'; ctx.font = f('800 12px'); ctx.textAlign = 'left'; ctx.fillText('DASH', 34, 72);
  const dp = turkey.dashCooldown <= 0 ? 1 : clamp(1 - turkey.dashCooldown / 1.55, 0, 1);
  rr(ctx, 80, 58, 132, 18, 9, '#221009');
  rr(ctx, 82, 60, Math.max(8, 128 * dp), 14, 7, dp >= 0.99 ? '#56cc5c' : '#f09c32');
  ctx.fillStyle = '#fff9e6'; ctx.font = f('900 11px'); ctx.textAlign = 'center';
  ctx.fillText(dp >= 0.99 ? 'READY [SHIFT]' : 'CHARGING', 146, 71);

  const stTxt = turkey.hidden ? 'HIDDEN' : farmer.state === 'chase' || farmer.state === 'lunge' ? 'SPOTTED!' : farmer.state === 'search' ? 'SEARCHING' : 'CLEAR';
  const stBg = turkey.hidden ? '#21632c' : farmer.state === 'chase' || farmer.state === 'lunge' ? '#b8251d' : farmer.state === 'search' ? '#a66014' : '#3a4f38';
  rr(ctx, 220, 56, 80, 22, 10, stBg);
  ctx.fillStyle = '#fff9e8'; ctx.fillText(stTxt, 260, 71);

  drawStageProgressBar(ctx, stage, turkey, farmer, meters, mode, stats.loopCount);

  drawPanel(ctx, 906, 14, 356, 82, 14);
  ctx.fillStyle = '#f8d58d'; ctx.font = f('900 13px'); ctx.textAlign = 'left'; ctx.fillText('SCORE', 924, 36);
  ctx.fillStyle = '#fff9e6'; ctx.font = f('900 30px'); ctx.fillText(stats.score.toLocaleString('en-US'), 924, 72);
  if (stats.combo > 1) {
    rr(ctx, 1058, 22, 82, 28, 12, '#d9481e', '#ffe27a', 2);
    ctx.fillStyle = '#fff8dc'; ctx.font = f('900 15px'); ctx.textAlign = 'center'; ctx.fillText(`x${stats.combo} COMBO`, 1099, 41);
  }

  const btns = [
    { id: 'mute', x: 1154, y: 26, w: 46, h: 46, label: sound.isMuted() ? 'OFF' : 'SFX', fontSize: 13, style: 'secondary' },
    { id: 'pause', x: 1208, y: 26, w: 42, h: 46, label: 'II', fontSize: 16, style: 'secondary' },
  ];
  input.setButtons(btns);
  const hov = input.getHoveredButton();
  for (const b of btns) drawButton(ctx, b, hov === b);

  ctx.save();
  rr(ctx, VIEW_WIDTH * 0.5 - 390, VIEW_HEIGHT - 38, 780, 28, 12, 'rgba(24,12,7,0.74)');
  ctx.fillStyle = '#f6dfb4'; ctx.font = f('800 13px'); ctx.textAlign = 'center';
  ctx.fillText('A/D MOVE  ·  SPACE JUMP & FLUTTER  ·  S HIDE IN COVER  ·  SHIFT DASH  ·  CLICK TOSS ACORN', VIEW_WIDTH * 0.5, VIEW_HEIGHT - 19);
  ctx.restore();
}

export function drawStageProgressBar(ctx, stage, turkey, farmer, meters, mode, loopCount) {
  drawPanel(ctx, 328, 14, 562, 82, 14);
  const f = (t) => `${t} "Trebuchet MS", sans-serif`;
  ctx.fillStyle = '#ffe599'; ctx.font = f('900 15px'); ctx.textAlign = 'left'; ctx.fillText(`STAGE ${stage.index + 1}: ${stage.name.toUpperCase()}`, 346, 37);
  ctx.fillStyle = '#fff5dc'; ctx.textAlign = 'right';
  ctx.fillText(`DISTANCE ${mode === 'endless' ? `${meters + loopCount * TOTAL_DISTANCE_METERS}m (LOOP ${loopCount + 1})` : `${meters}m / ${TOTAL_DISTANCE_METERS}m`}`, 872, 37);
  const rx = 348, ry = 58, rw = 522, prog = clamp(turkey.x / COURSE_LENGTH_PX, 0, 1);
  rr(ctx, rx, ry, rw, 14, 7, '#221109');
  const rg = ctx.createLinearGradient(rx, 0, rx + rw, 0);
  rg.addColorStop(0, '#f2b738'); rg.addColorStop(0.65, '#f07b28'); rg.addColorStop(1, '#58c958');
  rr(ctx, rx + 2, ry + 2, Math.max(10, (rw - 4) * prog), 10, 5, rg);
  ctx.font = f('800 10px'); ctx.textAlign = 'center';
  for (let i = 0; i < 4; i++) {
    const tx = rx + (i / 4) * rw;
    if (i > 0) { ctx.fillStyle = '#f5c258'; ctx.fillRect(tx - 1, ry - 2, 2, 18); }
    ctx.fillStyle = stage.index === i ? '#ffe580' : '#bda484'; ctx.fillText(STAGE_DEFINITIONS[i].shortName, tx + rw * 0.125, ry + 28);
  }
  ctx.fillStyle = '#e83d2e'; ctx.beginPath(); ctx.arc(rx + clamp(farmer.x / COURSE_LENGTH_PX, 0, 1) * rw, ry + 7, 6, 0, 6.28); ctx.fill(); ctx.strokeStyle = '#fff1c9'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.fillStyle = '#ffe55c'; ctx.beginPath(); ctx.arc(rx + prog * rw, ry + 7, 8, 0, 6.28); ctx.fill(); ctx.strokeStyle = '#241108'; ctx.lineWidth = 2; ctx.stroke();
}

export function drawTitleOverlay(ctx, state, input) {
  const f = (t) => `${t} "Trebuchet MS", sans-serif`, cx = VIEW_WIDTH * 0.5;
  const g = ctx.createRadialGradient(cx, VIEW_HEIGHT * 0.38, 120, cx, VIEW_HEIGHT * 0.5, VIEW_WIDTH * 0.7);
  g.addColorStop(0, 'rgba(30,14,8,0.34)'); g.addColorStop(1, 'rgba(18,8,4,0.68)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const ty = 136 + Math.sin(state.time * 2.2) * 4;
  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  rr(ctx, cx - 295, ty + 14, 590, 40, 20, '#8f261e', '#f5c258', 3);
  ctx.font = '900 92px "Trebuchet MS", Impact, sans-serif'; ctx.lineWidth = 14; ctx.strokeStyle = '#241008'; ctx.strokeText('FEATHERBREAK', cx, ty);
  const tg = ctx.createLinearGradient(0, ty - 76, 0, ty + 10);
  tg.addColorStop(0, '#fff7cf'); tg.addColorStop(0.5, '#f8be3a'); tg.addColorStop(1, '#e0641c');
  ctx.fillStyle = tg; ctx.fillText('FEATHERBREAK', cx, ty);
  ctx.fillStyle = '#fff5d8'; ctx.font = f('900 21px'); ctx.fillText('THE GREAT THANKSGIVING ESCAPE', cx, ty + 41);
  ctx.fillStyle = '#fce8be'; ctx.font = f('800 17px'); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(24,10,5,0.85)';
  const hook = 'Outrun Farmer Barnaby · Hide in Pumpkins · Dodge 425°F Ovens & Carving Knives';
  ctx.strokeText(hook, cx, ty + 78); ctx.fillText(hook, cx, ty + 78); ctx.restore();

  const btns = [
    { id: 'play', x: cx - 185, y: 242, w: 370, h: 70, label: 'PLAY ESCAPE', fontSize: 32, style: 'primary' },
    { id: 'mode_story', x: cx - 244, y: 328, w: 234, h: 46, label: REPLAY_MODES[0].label, fontSize: 16, style: state.mode === 'story' ? 'green' : 'secondary' },
    { id: 'mode_endless', x: cx + 10, y: 328, w: 234, h: 46, label: REPLAY_MODES[1].label, fontSize: 16, style: state.mode === 'endless' ? 'green' : 'secondary' },
  ];
  input.setButtons(btns); const hov = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, hov === b);

  drawPanel(ctx, cx - 480, 610, 960, 88, 16, 'rgba(34,16,9,0.92)');
  ctx.save(); ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe599'; ctx.font = f('900 16px'); ctx.fillText('A/D MOVE  ·  SPACE JUMP & FLUTTER  ·  S HIDE  ·  SHIFT DASH  ·  MOUSE CLICK TOSS ACORN', cx, 643);
  ctx.fillStyle = '#f2d9b1'; ctx.font = f('800 14px');
  const rec = state.bestRecord;
  ctx.fillText(rec.runs > 0
    ? `BEST SCORE: ${rec.bestScore.toLocaleString('en-US')}   ·   BEST DISTANCE: ${rec.bestDistance}m   ·   ESCAPES: ${rec.escapes}   ·   MEDALS: ${rec.unlockedMedals.length}/6`
    : '4 STAGES: GOLDEN FARMYARD  →  HARVEST BARN  →  APPLEWOOD PANTRY  →  ROASTING KITCHEN  →  FREEDOM', cx, 675);
  ctx.restore();
}

export function drawEscapedEndScreen(ctx, state, input) { renderEndScreen(ctx, state, input, true); }
export function drawCaughtEndScreen(ctx, state, input) { renderEndScreen(ctx, state, input, false); }

export function drawPauseOverlay(ctx, state, input) {
  const cx = VIEW_WIDTH * 0.5;
  ctx.fillStyle = 'rgba(18,9,5,0.72)'; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawPanel(ctx, cx - 260, 128, 520, 456, 20, 'rgba(42,21,12,0.95)', '#f5c258');
  ctx.save(); ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe588'; ctx.font = '900 44px "Trebuchet MS", sans-serif'; ctx.fillText('PAUSED', cx, 192);
  ctx.fillStyle = '#f5dec0'; ctx.font = '700 15px "Trebuchet MS", sans-serif';
  ctx.fillText('Tip: Click an Acorn at brass oven latches to SLAM them shut,', cx, 230);
  ctx.fillText('or snipe hanging copper pots to BONK Farmer Barnaby!', cx, 252); ctx.restore();
  const btns = [
    { id: 'resume', x: cx - 160, y: 286, w: 320, h: 56, label: 'RESUME ESCAPE', fontSize: 22, style: 'green' },
    { id: 'restart', x: cx - 160, y: 358, w: 320, h: 54, label: 'RESTART RUN', fontSize: 21, style: 'primary' },
    { id: 'mute', x: cx - 160, y: 428, w: 320, h: 48, label: state.sound.isMuted() ? 'SOUND: OFF' : 'SOUND: ON', fontSize: 18, style: 'secondary' },
    { id: 'title', x: cx - 160, y: 492, w: 320, h: 48, label: 'TITLE MENU', fontSize: 18, style: 'secondary' },
  ];
  input.setButtons(btns); const hov = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, hov === b);
}

function renderEndScreen(ctx, state, input, escaped) {
  const s = state.endSummary, f = (t) => `${t} "Trebuchet MS", sans-serif`;
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  g.addColorStop(0, escaped ? 'rgba(42,22,10,0.36)' : 'rgba(38,12,10,0.48)'); g.addColorStop(1, 'rgba(18,8,4,0.68)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  if (!escaped) {
    ctx.save(); ctx.translate(215, 520);
    ctx.fillStyle = '#d8e2ea'; ctx.beginPath(); ctx.ellipse(0, 12, 124, 24, 0, 0, 6.28); ctx.fill(); ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.fillStyle = '#1b0d07'; ctx.fillRect(-52, -16, 104, 24);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-16, -4, 9, 0, 6.28); ctx.arc(16, -4, 9, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#180a05'; ctx.beginPath(); ctx.arc(-14, -4, 4, 0, 6.28); ctx.arc(18, -4, 4, 0, 6.28); ctx.fill();
    const dg = ctx.createLinearGradient(-90, -110, 90, -10);
    dg.addColorStop(0, '#fff'); dg.addColorStop(0.45, '#cfdbe4'); dg.addColorStop(1, '#7c8d9c');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, -16, 94, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f5c258'; ctx.beginPath(); ctx.arc(0, -115, 13, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const head = escaped ? 'ESCAPED DINNER!' : 'CAUGHT FOR DINNER!';
  ctx.font = '900 72px "Trebuchet MS", Impact, sans-serif'; ctx.lineWidth = 12; ctx.strokeStyle = '#241008'; ctx.strokeText(head, VIEW_WIDTH * 0.5, 122);
  ctx.fillStyle = escaped ? '#ffe56b' : '#ff7b54'; ctx.fillText(head, VIEW_WIDTH * 0.5, 122);
  const sub = escaped ? 'Pippin soared past the Freedom Gate — Farmer Barnaby is eating pumpkin pie tonight!' : `Caught by ${s.caughtBy || 'Farmer Barnaby'} in ${s.stageName} — give it another dash!`;
  ctx.font = f('800 20px'); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,9,4,0.9)'; ctx.strokeText(sub, VIEW_WIDTH * 0.5, 160);
  ctx.fillStyle = '#fff5dc'; ctx.fillText(sub, VIEW_WIDTH * 0.5, 160); ctx.restore();

  const cardX = escaped ? 86 : 450, cardY = 186, mx = cardX + 114, my = cardY + 146;
  drawPanel(ctx, cardX, cardY, 726, 296, 20, 'rgba(38,19,11,0.93)', escaped ? '#f7c852' : '#eb7046');
  const mg = ctx.createRadialGradient(mx - 15, my - 15, 12, mx, my, 82);
  mg.addColorStop(0, escaped ? '#fff4a8' : '#ffd09c'); mg.addColorStop(0.55, escaped ? '#f2ab27' : '#d65d2a'); mg.addColorStop(1, escaped ? '#a85911' : '#7d2415');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 76, 0, 6.28); ctx.fill(); ctx.strokeStyle = '#fff3c4'; ctx.lineWidth = 4.5; ctx.stroke();

  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.fillStyle = '#2d1208'; ctx.font = f('900 15px'); ctx.fillText('ESCAPE RANK', mx, my - 32);
  ctx.font = '900 76px "Trebuchet MS", Impact, sans-serif'; ctx.fillStyle = '#fffbe8'; ctx.lineWidth = 7; ctx.strokeStyle = '#2d1208';
  ctx.strokeText(s.rank, mx, my + 34); ctx.fillText(s.rank, mx, my + 34); ctx.restore();

  const cols = [
    ['FINAL SCORE', s.score.toLocaleString('en-US'), '#ffe57a'], ['DISTANCE', `${s.distanceMeters.toLocaleString('en-US')}m`, '#fff5dc'],
    ['BEST SCORE', Math.max(s.score, state.bestRecord.bestScore).toLocaleString('en-US'), '#9cf29e'], ['CLOSE CALLS', `${s.closeCalls}`, '#ffb566'],
    ['OVENS SLAMMED', `${s.ovensSlammed}`, '#ffa270'], ['RUN TIME', `${s.elapsedSec.toFixed(1)}s`, '#e8d7b8'],
  ];
  ctx.save();
  for (let i = 0; i < cols.length; i++) {
    const sx = cardX + 224 + (i % 3) * 164, sy = cardY + 52 + Math.floor(i / 3) * 82;
    ctx.fillStyle = '#d9b584'; ctx.font = f('800 13px'); ctx.textAlign = 'left'; ctx.fillText(cols[i][0], sx, sy);
    ctx.fillStyle = cols[i][2]; ctx.font = f('900 25px'); ctx.fillText(cols[i][1], sx, sy + 30);
  }
  ctx.fillStyle = '#f5ca69'; ctx.font = f('900 14px'); ctx.fillText('MEDALS EARNED:', cardX + 224, cardY + 226);
  const meds = s.medals.length > 0 ? s.medals.slice(0, 3) : [{ label: 'Keep Dashing!' }];
  for (let m = 0; m < meds.length; m++) {
    const x = cardX + 224 + m * 160;
    rr(ctx, x, cardY + 238, 148, 34, 10, 'rgba(245,184,61,0.2)', '#f5c258', 2);
    ctx.fillStyle = '#fff7da'; ctx.font = f('800 13px'); ctx.textAlign = 'center'; ctx.fillText(`★ ${meds[m].label}`, x + 74, cardY + 260);
  }
  ctx.restore();

  const bx = escaped ? cardX + 42 : VIEW_WIDTH * 0.5 - 292;
  const btns = [
    { id: 'restart', x: bx, y: 514, w: 344, h: 74, label: 'PLAY AGAIN (RESTART)', fontSize: 25, style: 'green' },
    { id: 'title', x: bx + 366, y: 514, w: 240, h: 74, label: 'TITLE MENU', fontSize: 23, style: 'primary' },
  ];
  input.setButtons(btns);
  const hov = input.getHoveredButton();
  for (const b of btns) drawButton(ctx, b, hov === b);
}

function drawPanel(ctx, x, y, w, h, r = 14, bg = 'rgba(38,19,11,0.88)', border = '#e8a848') {
  ctx.save();
  rr(ctx, x + 3, y + 5, w, h, r, 'rgba(12,5,2,0.42)');
  rr(ctx, x, y, w, h, r, bg, border, 3);
  ctx.restore();
}

function drawButton(ctx, btn, hov) {
  ctx.save();
  const l = hov ? -2 : 0;
  rr(ctx, btn.x + 2, btn.y + 6, btn.w, btn.h, 14, 'rgba(14,6,2,0.5)');
  const g = ctx.createLinearGradient(btn.x, btn.y + l, btn.x, btn.y + btn.h + l);
  const p = btn.style === 'primary' ? (hov ? ['#ffca4f', '#e06919'] : ['#f5a92d', '#c95314'])
    : btn.style === 'green' ? (hov ? ['#5cc458', '#2c7a2e'] : ['#43a342', '#225e24'])
    : (hov ? ['#6b3e24', '#422313'] : ['#4f2b18', '#30180c']);
  g.addColorStop(0, p[0]); g.addColorStop(1, p[1]);
  rr(ctx, btn.x, btn.y + l, btn.w, btn.h, 14, g, hov ? '#fff6cc' : '#f5c45e', hov ? 3.5 : 2.6);
  ctx.fillStyle = '#fff9e6'; ctx.font = `900 ${btn.fontSize || 22}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(32,14,6,0.72)';
  ctx.strokeText(btn.label, btn.x + btn.w * 0.5, btn.y + btn.h * 0.5 + l + 1);
  ctx.fillText(btn.label, btn.x + btn.w * 0.5, btn.y + btn.h * 0.5 + l + 1);
  ctx.restore();
}

function rr(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function drawHeart(ctx, cx, cy, filled) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-14, 1, -15, -12, -6, -12); ctx.bezierCurveTo(-1, -12, 0, -7, 0, -5);
  ctx.bezierCurveTo(0, -7, 1, -12, 6, -12); ctx.bezierCurveTo(15, -12, 14, 1, 0, 10); ctx.closePath();
  ctx.fillStyle = filled ? '#eb3636' : 'rgba(52,26,18,0.85)'; ctx.fill();
  ctx.strokeStyle = filled ? '#ffe399' : '#9c6448'; ctx.lineWidth = 2.2; ctx.stroke();
  if (filled) { ctx.fillStyle = 'rgba(255,225,225,0.58)'; ctx.beginPath(); ctx.arc(-5, -5, 2.8, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = '#c47c58'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-3, 0); ctx.lineTo(2, 4); ctx.lineTo(-1, 9); ctx.stroke(); }
  ctx.restore();
}
