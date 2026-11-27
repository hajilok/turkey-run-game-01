// Sleek walnut-and-brass HUD with PB pace marker, bright golden-hour Title Screen, Pause Menu, and illuminated Escaped / Caught End Screens.

import { AUTUMN_PALETTE, COURSE_LENGTH_PX, PIXELS_PER_METER, REPLAY_MODES, STAGE_DEFINITIONS, TOTAL_DISTANCE_METERS, VIEW_HEIGHT, VIEW_WIDTH, clamp } from '../config.js';
import { getStageAtX } from '../world/stages.js';
import { disc, ell, fnt, lgrad, rgrad, drawRoundedRect as rr } from './textures.js';

export function drawGameplayHud(ctx, state, input) {
  const { turkey, farmer, stats, sound, mode, bestRecord } = state, st = getStageAtX(turkey.x), m = Math.min(TOTAL_DISTANCE_METERS, Math.floor(turkey.x / PIXELS_PER_METER));
  if ((farmer.state === 'chase' || farmer.state === 'lunge') && !turkey.hidden) {
    const p = (0.12 + Math.sin(state.time * 9) * 0.05) * clamp(1 - Math.abs(turkey.x - farmer.x) / 480, 0.15, 0.85);
    ctx.fillStyle = rgrad(ctx, 640, 360, 270, 640, 360, 790, [[0, 'rgba(220,38,22,0)'], [1, `rgba(220,38,22,${p})`]]); ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
  drawPanel(ctx, 18, 12, 294, 78, 14);
  ctx.fillStyle = '#f8d58d'; ctx.font = fnt('900 13px'); ctx.textAlign = 'left'; ctx.fillText('LIVES', 34, 33);
  for (let i = 0; i < turkey.maxLives; i++) drawHeart(ctx, 98 + i * 32, 29, i < turkey.lives);
  ctx.fillStyle = '#ffe59c'; ctx.font = fnt('900 14px'); ctx.textAlign = 'right'; ctx.fillText(`ACORNS: ${turkey.acorns}`, 296, 33);
  ctx.fillStyle = '#f8d58d'; ctx.font = fnt('800 12px'); ctx.textAlign = 'left'; ctx.fillText('DASH', 34, 69);
  const dp = turkey.dashCooldown <= 0 ? 1 : clamp(1 - turkey.dashCooldown / 1.5, 0, 1);
  rr(ctx, 80, 55, 132, 18, 9, '#221009'); rr(ctx, 82, 57, Math.max(8, 128 * dp), 14, 7, dp >= 0.99 ? '#56cc5c' : '#f09c32');
  ctx.fillStyle = '#fff9e6'; ctx.font = fnt('900 11px'); ctx.textAlign = 'center'; ctx.fillText(dp >= 0.99 ? 'READY [SHIFT]' : 'CHARGING', 146, 68);
  const stTxt = turkey.hidden ? 'HIDDEN' : farmer.state === 'chase' || farmer.state === 'lunge' ? 'SPOTTED!' : farmer.state === 'stunned' ? 'STUNNED!' : farmer.state === 'search' ? 'SEARCHING' : 'CLEAR';
  const stBg = turkey.hidden ? '#21632c' : farmer.state === 'chase' || farmer.state === 'lunge' ? '#b8251d' : farmer.state === 'stunned' || farmer.state === 'search' ? '#a66014' : '#3a4f38';
  rr(ctx, 220, 53, 80, 22, 10, stBg); ctx.fillStyle = '#fff9e8'; ctx.fillText(stTxt, 260, 68);
  drawStageProgressBar(ctx, st, turkey, farmer, m, mode, stats.loopCount, bestRecord?.bestDistance || 0);
  drawPanel(ctx, 906, 12, 356, 78, 14);
  ctx.fillStyle = '#f8d58d'; ctx.font = fnt('900 13px'); ctx.textAlign = 'left'; ctx.fillText(mode === 'frenzy' ? 'SCORE (2X)' : 'SCORE', 924, 33);
  ctx.fillStyle = '#fff9e6'; ctx.font = fnt('900 30px'); ctx.fillText(stats.score.toLocaleString('en-US'), 924, 69);
  if (stats.combo > 1) { rr(ctx, 1058, 20, 82, 28, 12, '#d9481e', '#ffe27a', 2); ctx.fillStyle = '#fff8dc'; ctx.font = fnt('900 15px'); ctx.textAlign = 'center'; ctx.fillText(`x${stats.combo} COMBO`, 1099, 39); }
  const btns = [{ id: 'mute', x: 1154, y: 24, w: 46, h: 44, label: sound.isMuted() ? 'OFF' : 'SFX', fontSize: 13, style: 'secondary' }, { id: 'pause', x: 1208, y: 24, w: 42, h: 44, label: 'II', fontSize: 16, style: 'secondary' }];
  input.setButtons(btns); const h = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, h === b);
}

export function drawStageProgressBar(ctx, st, turkey, farmer, meters, mode, loops, pb = 0) {
  drawPanel(ctx, 328, 12, 562, 78, 14);
  ctx.fillStyle = '#ffe599'; ctx.font = fnt('900 15px'); ctx.textAlign = 'left'; ctx.fillText(`STAGE ${st.index + 1}: ${st.name.toUpperCase()}`, 346, 34);
  ctx.fillStyle = '#fff5dc'; ctx.textAlign = 'right';
  ctx.fillText(`DISTANCE ${mode === 'endless' ? `${meters + loops * TOTAL_DISTANCE_METERS}m (LOOP ${loops + 1})` : `${meters}m / ${TOTAL_DISTANCE_METERS}m`}`, 872, 34);
  const rx = 348, ry = 54, rw = 522, prog = clamp(turkey.x / COURSE_LENGTH_PX, 0, 1);
  rr(ctx, rx, ry, rw, 14, 7, '#221109'); rr(ctx, rx + 2, ry + 2, Math.max(10, (rw - 4) * prog), 10, 5, lgrad(ctx, rx, 0, rx + rw, 0, [[0, '#f2b738'], [0.65, '#f07b28'], [1, '#58c958']]));
  ctx.font = fnt('800 10px'); ctx.textAlign = 'center';
  for (let i = 0; i < 4; i++) { const tx = rx + (i / 4) * rw; if (i) { ctx.fillStyle = '#f5c258'; ctx.fillRect(tx - 1, ry - 2, 2, 18); } ctx.fillStyle = st.index === i ? '#ffe580' : '#bda484'; ctx.fillText(STAGE_DEFINITIONS[i].shortName, tx + rw * 0.125, ry + 27); }
  if (pb > 40) { const px = rx + clamp(pb / TOTAL_DISTANCE_METERS, 0, 1) * rw; ctx.fillStyle = '#9ef5a2'; ctx.fillRect(px - 1, ry - 7, 2, 12); ctx.fillText('PB', px, ry - 9); }
  disc(ctx, rx + clamp(farmer.x / COURSE_LENGTH_PX, 0, 1) * rw, ry + 7, 6, '#e83d2e', '#fff1c9', 1.8); disc(ctx, rx + prog * rw, ry + 7, 8, '#ffe55c', '#241108', 2);
}

export function drawTitleOverlay(ctx, state, input) {
  ctx.fillStyle = lgrad(ctx, 0, 0, 0, 355, [[0, 'rgba(38,16,22,0.52)'], [0.75, 'rgba(38,16,12,0.20)'], [1, 'rgba(38,16,12,0)']]); ctx.fillRect(0, 0, VIEW_WIDTH, 355);
  const ty = 102 + Math.sin(state.time * 2.2) * 3;
  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  rr(ctx, 340, ty + 14, 600, 38, 19, '#8f261e', '#f8cb5c', 3);
  ctx.font = '900 94px "Trebuchet MS", Impact, sans-serif'; ctx.lineWidth = 14; ctx.strokeStyle = '#241008'; ctx.strokeText('FEATHERBREAK', 640, ty);
  ctx.fillStyle = lgrad(ctx, 0, ty - 78, 0, ty + 10, [[0, '#fff9d6'], [0.48, '#f9c23c'], [1, '#e0641c']]); ctx.fillText('FEATHERBREAK', 640, ty);
  ctx.fillStyle = '#fff7de'; ctx.font = fnt('900 20px'); ctx.fillText('THE GREAT THANKSGIVING ESCAPE', 640, ty + 39); ctx.restore();
  const btns = [
    { id: 'play', x: 450, y: 174, w: 380, h: 68, label: 'PLAY ESCAPE', fontSize: 32, style: 'primary' },
    { id: 'mode_story', x: 308, y: 256, w: 210, h: 44, label: REPLAY_MODES[0].label, fontSize: 15, style: state.mode === 'story' ? 'green' : 'secondary' },
    { id: 'mode_endless', x: 535, y: 256, w: 210, h: 44, label: REPLAY_MODES[1].label, fontSize: 15, style: state.mode === 'endless' ? 'green' : 'secondary' },
    { id: 'mode_frenzy', x: 762, y: 256, w: 210, h: 44, label: REPLAY_MODES[2].label, fontSize: 15, style: state.mode === 'frenzy' ? 'green' : 'secondary' },
  ];
  input.setButtons(btns); const h = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, h === b);
  rr(ctx, 220, 680, 840, 28, 14, 'rgba(26,12,7,0.82)', 'rgba(245,196,94,0.62)', 1.8);
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#ffebb5'; ctx.font = fnt('800 13px');
  ctx.fillText('A/D MOVE  ·  SPACE JUMP & FLUTTER  ·  S HIDE IN COVER  ·  SHIFT DASH  ·  CLICK TOSS ACORN', 640, 699); ctx.restore();
}

export function drawEscapedEndScreen(ctx, state, input) { renderEndScreen(ctx, state, input, true); }
export function drawCaughtEndScreen(ctx, state, input) { renderEndScreen(ctx, state, input, false); }

export function drawPauseOverlay(ctx, state, input) {
  ctx.fillStyle = 'rgba(18,9,5,0.68)'; ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawPanel(ctx, 380, 128, 520, 456, 20, 'rgba(42,21,12,0.95)', '#f5c258');
  ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = '#ffe588'; ctx.font = fnt('900 44px'); ctx.fillText('PAUSED', 640, 192);
  ctx.fillStyle = '#f5dec0'; ctx.font = fnt('700 15px');
  ctx.fillText('Tip: Click Acorns at oven latches, flour sacks, or hanging pots!', 640, 230);
  ctx.fillText('Lure Barnaby across gravy spills for a comic slip bonus!', 640, 252); ctx.restore();
  const btns = [{ id: 'resume', x: 480, y: 286, w: 320, h: 56, label: 'RESUME ESCAPE', fontSize: 22, style: 'green' }, { id: 'restart', x: 480, y: 358, w: 320, h: 54, label: 'RESTART RUN', fontSize: 21, style: 'primary' }, { id: 'mute', x: 480, y: 428, w: 320, h: 48, label: state.sound.isMuted() ? 'SOUND: OFF' : 'SOUND: ON', fontSize: 18, style: 'secondary' }, { id: 'title', x: 480, y: 492, w: 320, h: 48, label: 'TITLE MENU', fontSize: 18, style: 'secondary' }];
  input.setButtons(btns); const h = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, h === b);
}

function renderEndScreen(ctx, state, input, esc) {
  const s = state.endSummary;
  ctx.fillStyle = lgrad(ctx, 0, 0, VIEW_WIDTH, 0, [[0, esc ? 'rgba(38,18,9,0.56)' : 'rgba(38,12,10,0.58)'], [0.66, esc ? 'rgba(38,18,9,0.28)' : 'rgba(38,12,10,0.44)'], [1, 'rgba(28,14,6,0.08)']]);
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (!esc) {
    ctx.save(); ctx.translate(215, 510); ell(ctx, 0, 12, 124, 24, 0, '#d8e2ea', AUTUMN_PALETTE.inkDark, 3.5);
    ctx.fillStyle = '#1b0d07'; ctx.fillRect(-52, -16, 104, 24); disc(ctx, -16, -4, 9, '#fff'); disc(ctx, 16, -4, 9, '#fff'); disc(ctx, -14, -4, 4, '#180a05'); disc(ctx, 18, -4, 4, '#180a05');
    ctx.fillStyle = lgrad(ctx, -90, -110, 90, -10, [[0, '#fff'], [0.45, '#cfdbe4'], [1, '#7c8d9c']]); ctx.beginPath(); ctx.arc(0, -16, 94, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    disc(ctx, 0, -115, 13, '#f5c258', AUTUMN_PALETTE.inkDark, 3); ctx.restore();
  }
  const hx = esc ? 426 : 640; ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  const head = esc ? 'ESCAPED DINNER!' : 'CAUGHT FOR DINNER!';
  ctx.font = '900 72px "Trebuchet MS", Impact, sans-serif'; ctx.lineWidth = 12; ctx.strokeStyle = '#241008'; ctx.strokeText(head, hx, 114);
  ctx.fillStyle = esc ? '#ffe975' : '#ff7b54'; ctx.fillText(head, hx, 114);
  const sub = esc ? 'Pippin soared past the Freedom Gate — pumpkin pie for Farmer Barnaby!' : `Caught by ${s.caughtBy || 'Farmer Barnaby'} in ${s.stageName} — dash again!`;
  ctx.font = fnt('800 19px'); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,9,4,0.9)'; ctx.strokeText(sub, hx, 150); ctx.fillStyle = '#fff7de'; ctx.fillText(sub, hx, 150); ctx.restore();

  const cx = esc ? 64 : 448, cy = 178, mx = cx + 114, my = cy + 148;
  drawPanel(ctx, cx, cy, 724, 298, 22, 'rgba(46,24,13,0.93)', esc ? '#fad05e' : '#eb7046');
  disc(ctx, mx, my, 78, rgrad(ctx, mx - 15, my - 15, 12, mx, my, 84, [[0, esc ? '#fff6b5' : '#ffd09c'], [0.55, esc ? '#f4b029' : '#d65d2a'], [1, esc ? '#a85911' : '#7d2415']]), '#fff5cc', 4.5);
  ctx.save(); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.fillStyle = '#2d1208'; ctx.font = fnt('900 15px'); ctx.fillText('ESCAPE RANK', mx, my - 34);
  ctx.font = '900 78px "Trebuchet MS", Impact, sans-serif'; ctx.fillStyle = '#fffce8'; ctx.lineWidth = 7; ctx.strokeStyle = '#2d1208'; ctx.strokeText(s.rank, mx, my + 34); ctx.fillText(s.rank, mx, my + 34); ctx.restore();

  const cols = [['FINAL SCORE', s.score.toLocaleString('en-US'), '#ffe880'], ['DISTANCE', `${s.distanceMeters.toLocaleString('en-US')}m`, '#fff7de'], ['BEST SCORE', Math.max(s.score, state.bestRecord.bestScore).toLocaleString('en-US'), '#9ef5a2'], ['CLOSE CALLS', `${s.closeCalls}`, '#ffbc6e'], ['TRAPS SPRUNG', `${s.ovensSlammed + s.potsBonked + s.gravySlips + s.flourBlinds}`, '#ffa872'], ['RUN TIME', `${s.elapsedSec.toFixed(1)}s`, '#eedcc0']];
  ctx.save();
  for (let i = 0; i < 6; i++) { const sx = cx + 224 + (i % 3) * 164, sy = cy + 52 + Math.floor(i / 3) * 82; ctx.fillStyle = '#dfc092'; ctx.font = fnt('800 13px'); ctx.textAlign = 'left'; ctx.fillText(cols[i][0], sx, sy); ctx.fillStyle = cols[i][2]; ctx.font = fnt('900 26px'); ctx.fillText(cols[i][1], sx, sy + 30); }
  ctx.fillStyle = '#f8cf6e'; ctx.font = fnt('900 14px'); ctx.fillText('MEDALS EARNED:', cx + 224, cy + 226);
  const meds = s.medals.length ? s.medals.slice(0, 3) : [{ label: 'Keep Dashing!' }];
  for (let m = 0; m < meds.length; m++) { const x = cx + 224 + m * 160; rr(ctx, x, cy + 238, 148, 36, 10, 'rgba(248,196,68,0.22)', '#f8c85c', 2); ctx.fillStyle = '#fff9de'; ctx.font = fnt('800 13px'); ctx.textAlign = 'center'; ctx.fillText(`★ ${meds[m].label}`, x + 74, cy + 261); }
  ctx.restore();
  const bx = esc ? cx + 34 : 336, btns = [{ id: 'restart', x: bx, y: 506, w: 360, h: 78, label: 'PLAY AGAIN (RESTART)', fontSize: 26, style: 'green' }, { id: 'title', x: bx + 382, y: 506, w: 256, h: 78, label: 'TITLE MENU', fontSize: 24, style: 'primary' }];
  input.setButtons(btns); const h = input.getHoveredButton(); for (const b of btns) drawButton(ctx, b, h === b);
}

function drawPanel(ctx, x, y, w, h, r = 14, bg = 'rgba(38,19,11,0.88)', b = '#e8a848') { rr(ctx, x + 3, y + 5, w, h, r, 'rgba(12,5,2,0.42)'); rr(ctx, x, y, w, h, r, bg, b, 3); }
function drawButton(ctx, b, hov) {
  ctx.save(); const l = hov ? -2 : 0; rr(ctx, b.x + 2, b.y + 6, b.w, b.h, 14, 'rgba(14,6,2,0.5)');
  const p = b.style === 'primary' ? (hov ? ['#ffcf58', '#e26c1a'] : ['#f8b032', '#cc5514']) : b.style === 'green' ? (hov ? ['#62cc5c', '#2e8030'] : ['#46ab45', '#236426']) : (hov ? ['#6f4126', '#452514'] : ['#522d1a', '#32190c']);
  rr(ctx, b.x, b.y + l, b.w, b.h, 14, lgrad(ctx, b.x, b.y + l, b.x, b.y + b.h + l, [[0, p[0]], [1, p[1]]]), hov ? '#fff7d2' : '#f8ca62', hov ? 3.5 : 2.6);
  ctx.fillStyle = '#fff9e6'; ctx.font = fnt(`900 ${b.fontSize || 22}px`); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(32,14,6,0.72)';
  ctx.strokeText(b.label, b.x + b.w * 0.5, b.y + b.h * 0.5 + l + 1); ctx.fillText(b.label, b.x + b.w * 0.5, b.y + b.h * 0.5 + l + 1); ctx.restore();
}
function drawHeart(ctx, cx, cy, filled) {
  ctx.save(); ctx.translate(cx, cy);
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-14, 1, -15, -12, -6, -12); ctx.bezierCurveTo(-1, -12, 0, -7, 0, -5); ctx.bezierCurveTo(0, -7, 1, -12, 6, -12); ctx.bezierCurveTo(15, -12, 14, 1, 0, 10); ctx.closePath();
  ctx.fillStyle = filled ? '#eb3636' : 'rgba(52,26,18,0.85)'; ctx.fill(); ctx.strokeStyle = filled ? '#ffe399' : '#9c6448'; ctx.lineWidth = 2.2; ctx.stroke();
  if (filled) disc(ctx, -5, -5, 2.8, 'rgba(255,225,225,0.58)');
  else { ctx.strokeStyle = '#c47c58'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-3, 0); ctx.lineTo(2, 4); ctx.lineTo(-1, 9); ctx.stroke(); }
  ctx.restore();
}
