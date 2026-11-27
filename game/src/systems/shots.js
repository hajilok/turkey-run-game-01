// Compact deterministic scene staging for real browser captures (?shot=kitchen|title|stealth|escaped|caught).

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, VIEW_HEIGHT, VIEW_WIDTH } from '../config.js';
import { computeEscapeRank, evaluateMedals } from './progression.js';

export function parseShotQuery() {
  try { const p = new URLSearchParams(window.location.search), s = p.get('shot'); return s ? { shot: s.toLowerCase(), seed: Number(p.get('seed')) || 1 } : null; }
  catch { return null; }
}

export function stageCaptureShot(state, shotName) {
  const { turkey, farmer, course, particles, stats } = state;
  state.time = 4.2;

  if (shotName === 'title') {
    state.screen = 'title'; state.cameraX = 110;
    const fx = 560;
    course.platforms = course.platforms.filter((p) => p.x < 380 || p.x > 880);
    course.ovens = course.ovens.filter((o) => Math.abs(o.x - (state.cameraX + VIEW_WIDTH)) > 220);
    Object.assign(turkey, { x: fx + 365, y: GROUND_Y - 58, vx: 340, facing: 1, grounded: false, dashTimer: 0.14, panicLevel: 0.78 });
    Object.assign(farmer, { x: fx - 180, facing: 1, state: 'chase', hatPop: 14, speech: 'COME BACK, PLUMPSTER!', speechTimer: 2.0 });
    course.knives = [makeKnife(fx + 115, GROUND_Y - 122, 460, -18, -0.35)];
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0); particles.spawnFeatherBurst(turkey.x - 32, turkey.y - 26, 9, 0.85);
    return;
  }

  if (shotName === 'stealth' || shotName === 'farmyard') {
    state.screen = 'playing';
    const spot = course.hidingSpots.find((s) => s.stageIndex === 0 && s.kind === 'pumpkin') || course.hidingSpots[0];
    const cx = spot.x + spot.w * 0.5;
    state.cameraX = Math.max(0, cx - 610);
    Object.assign(turkey, { x: cx, y: GROUND_Y, hidden: true, hideSpot: spot, lives: 3, acorns: 4 });
    spot.occupied = true;
    Object.assign(farmer, { x: cx - 245, facing: 1, state: 'search', stateTimer: 1.4, speech: 'HMM? IN THAT PUMPKIN?', speechTimer: 2.0 });
    course.knives = [makeKnife(cx + 210, GROUND_Y - 196, 450, -20, 0.42)];
    course.collectibles.push({ x: cx + 345, y: GROUND_Y - 210, baseY: GROUND_Y - 210, kind: 'golden_feather', radius: 20, collected: false, bobOffset: 0 });
    Object.assign(stats, { score: 1380, combo: 2, comboTimer: 3.2, distanceMeters: Math.floor(cx / PIXELS_PER_METER) });
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0); particles.spawnAcornRing(cx + 285, GROUND_Y - 12);
    particles.spawnCallout(cx + 14, spot.y - 86, 'GHOST EVADE! +180', '#9ef5a2', 1.18);
    return;
  }

  if (shotName === 'kitchen' || shotName === 'play') {
    state.screen = 'playing';
    const ko = course.ovens.filter((o) => o.stageIndex === 3);
    const oven = ko[1] || ko[0];
    Object.assign(oven, { state: 'blast', doorOpen: 1.0, flamePower: 1.0, tempF: 425 });
    // Align camera so Left=Sunset Window+Herbs, Center=ONE Hero Menu Chalkboard, Right=Pie Shelves+6PM Clock
    state.cameraX = 900 * PIXELS_PER_METER + 1480;
    oven.x = state.cameraX + 706; oven.latchX = oven.x + 14;
    course.ovens = course.ovens.filter((o) => o === oven || Math.abs(o.x - oven.x) > 340);
    course.hidingSpots = course.hidingSpots.filter((s) => Math.abs(s.x - (oven.x - 360)) > 240 && Math.abs(s.x - oven.x) > 190);
    course.hidingSpots.push({ id: 'hide_hero_pot', x: oven.x + 215, y: GROUND_Y - 76, w: 92, h: 76, kind: 'copper_pot', label: 'COPPER KETTLE', stageIndex: 3, wiggle: 0, occupied: false, evadeAwarded: false });

    Object.assign(turkey, { x: oven.x - 115, y: GROUND_Y - 166, vx: 520, vy: -80, facing: 1, grounded: false, dashTimer: 0.16, dashCooldown: 0.35, panicLevel: 0.96, lives: 2, acorns: 3, speech: '' });
    Object.assign(farmer, { x: oven.x - 412, facing: 1, state: 'chase', hatPop: 16, strideCycle: 1.1, speech: 'GET IN THE ROASTER!', speechTimer: 2.0 });
    course.knives = [makeKnife(oven.x - 235, GROUND_Y - 226, 510, -12, -0.45), makeKnife(oven.x + 186, GROUND_Y - 242, -460, 15, 2.7)];
    course.acorns = [{ x: oven.x - 18, y: GROUND_Y - 118, vx: 380, vy: 120, angle: 0.7, life: 1.5, active: true }];
    course.gravySpills.push({ x: oven.x - 320, y: GROUND_Y - 6, w: 132, h: 14, shimmer: 0 });
    Object.assign(stats, { score: 4850, combo: 3, comboTimer: 3.8, closeCalls: 5, distanceMeters: Math.floor(turkey.x / PIXELS_PER_METER) });
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 3); particles.spawnFeatherBurst(turkey.x - 48, turkey.y - 24, 12, 1.0);
    particles.spawnOvenFlame(oven.x - 44, oven.y + 62, -1, 7); particles.spawnCallout(turkey.x + 18, turkey.y - 108, 'CLOSE SHAVE! +150', '#ffe27a', 1.18);
    return;
  }

    if (shotName === 'escaped' || shotName === 'end') {
    state.screen = 'escaped'; state.cameraX = COURSE_LENGTH_PX - 920;
    Object.assign(turkey, { x: COURSE_LENGTH_PX + 150, y: GROUND_Y - 135, facing: 1, grounded: false, fluttering: true, speech: 'FREE AT LAST!', speechTimer: 2.0 });
    Object.assign(farmer, { x: COURSE_LENGTH_PX - 20, facing: 1, state: 'stunned', hatPop: 12 });
    Object.assign(stats, { score: 6420, distanceMeters: 1200, closeCalls: 7, ovensSlammed: 2, potsBonked: 1, stealthEvades: 2, goldenFeathers: 3, elapsedSec: 58.4 });
    const raw = { ...stats, escaped: true, livesRemaining: 3 };
    state.endSummary = { ...raw, stageName: 'The Roasting Kitchen', caughtBy: '', rank: computeEscapeRank(raw), medals: evaluateMedals(raw) };
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0); particles.spawnFeatherBurst(turkey.x - 20, turkey.y - 20, 16, 1.1);
  }
}

function makeKnife(x, y, vx, vy, angle) {
  const sx = Math.sign(vx) * 32;
  return { x, y, vx, vy, angle, spinSpeed: vx >= 0 ? 13 : -13, radius: 22, life: 3, source: 'farmer', telegraph: 0, grazed: false, trail: [{ x: x - sx * 3, y: y + 14 }, { x: x - sx * 2, y: y + 9 }, { x: x - sx, y: y + 4 }, { x, y }] };
}
