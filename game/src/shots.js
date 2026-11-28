// Deterministic screenshot staging for FEATHERBREAK captures (the kit-endorsed
// `?shot=` pattern, like the starter's shots.json: `?shot=start&seed=1`).
// Only active when the page URL carries `?shot=<id>`; normal play is untouched.
// Each setup drops the live simulation into a real mid-action state and lets it
// run, so every capture is a genuine render of the game's own code in a browser.

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, VIEW_WIDTH, clamp } from './config.js';
import { spawnCarvingKnife } from './world/hazards.js';

export function applyShotSetup(state, shotId, hooks) {
  if (!shotId || shotId === 'title') return;
  if (shotId === 'kitchen') setupKitchen(state, hooks.startNewRun);
  else if (shotId === 'barn') setupBarn(state, hooks.startNewRun, hooks.input);
  else if (shotId === 'escaped') setupEscaped(state, hooks.startNewRun, hooks.finalizeRun);
}

// Keep a teleported run's score honest: no stage-change bonus, no distance
// score for the jump from the spawn point to the staged position.
function settleTeleport(state, stageIndex) {
  state.lastStageIndex = stageIndex;
  state.stats.maxDistancePx = state.turkey.x;
  state.stats.distanceMeters = Math.floor(state.turkey.x / PIXELS_PER_METER);
}

// Hold every nearby hazard quiet for the shutter: ovens mid-blast, cleavers
// raised, gravy unable to trip the farmer while the shot is staged. Ovens
// face left, so only blast one whose flame box cannot reach the turkey —
// unless the turkey is hidden, in which case every nearby oven can blast.
function freezeHazardsForShot(course, x, turkeyHidden = false) {
  for (const ov of course.ovens) {
    if (Math.abs(ov.x - x) >= 900) continue;
    const flameReaches = !turkeyHidden && ov.x - 206 <= x + 14 && ov.x + ov.w >= x - 40;
    Object.assign(ov, flameReaches ? { state: 'idle', timer: 2.5 } : { state: 'blast', timer: 3.0, flamePower: 1, doorOpen: 1, tempF: 425 });
  }
  for (const cl of course.cleavers) if (Math.abs(cl.x - x) < 1500) Object.assign(cl, { state: 'raised', timer: 2.5 });
  for (const sp of course.gravySpills) sp.slipCooldown = 9;
}

function frameCamera(state) {
  state.cameraX = clamp(state.turkey.x - VIEW_WIDTH * 0.42, 0, COURSE_LENGTH_PX - VIEW_WIDTH + 340);
}

// Peak kitchen action: oven about to blast, farmer closing in for a knife throw,
// a volley knife already in the air, combo live — the "dodging the oven and the
// carving knife" beat at full density.
function setupKitchen(state, startNewRun) {
  startNewRun(state, 1);
  const { turkey: t, farmer: f, course, stats } = state;
  t.x = 900 * PIXELS_PER_METER + 2400; t.y = GROUND_Y; t.vx = 120; t.runCycle = 1.2; t.panicLevel = 0.9;
  // Stand clear of the nearest oven's flame lane so it can blast on camera.
  let ovR = null;
  for (const ov of course.ovens) if (ov.x > t.x && (!ovR || ov.x < ovR.x)) ovR = ov;
  if (ovR && ovR.x - t.x < 340) t.x = ovR.x - 320;
  Object.assign(t, { lives: 2, acorns: 6 });
  Object.assign(stats, { score: 8108, combo: 2, comboTimer: 4.8, closeCalls: 6 });
  Object.assign(f, { x: t.x - 340, state: 'search', stateTimer: 2.5, searchTargetX: t.x + 60, facing: 1, knifeCooldown: 0.05, lungeCooldown: 5, speech: '', speechTimer: 0 });
  freezeHazardsForShot(course, t.x, false);
  spawnCarvingKnife(course, t.x + 480, GROUND_Y - 160, -430, -30, 'farmer');
  state.stageBannerText = 'STAGE 4 · THE ROASTING KITCHEN'; state.stageBannerTimer = 2.4;
  settleTeleport(state, 3);
  frameCamera(state);
}

// Barn stealth: Pippin hidden in a pumpkin while Barnaby searches the bay,
// oven preheating nearby, volley knife inbound — the ghost-evade beat.
function setupBarn(state, startNewRun, input) {
  startNewRun(state, 1);
  const { turkey: t, farmer: f, course, stats } = state;
  t.x = 300 * PIXELS_PER_METER + 2400; t.y = GROUND_Y;
  let spot = null;
  for (const s of course.hidingSpots) if (s.stageIndex === 1 && Math.abs(s.x - t.x) < 900) { spot = s; break; }
  if (spot) { t.hidden = true; t.hideSpot = spot; spot.occupied = true; t.x = spot.x + spot.w * 0.5; input?.setForceHideHeld(true); }
  Object.assign(t, { lives: 2, acorns: 6 });
  Object.assign(stats, { score: 4020, combo: 3, comboTimer: 4.8 });
  Object.assign(f, { x: t.x - 420, state: 'search', stateTimer: 3.4, searchTargetX: t.x + 40, facing: 1, speech: 'HERE, TURKEY-TURKEY...', speechTimer: 9 });
  freezeHazardsForShot(course, t.x, true);
  spawnCarvingKnife(course, t.x + 560, GROUND_Y - 200, -380, -20, 'volley');
  state.stageBannerText = 'STAGE 2 · HARVEST BARN'; state.stageBannerTimer = 2.4;
  settleTeleport(state, 1);
  frameCamera(state);
}

// Escaped end screen: a full S-rank run through the Freedom Gate.
function setupEscaped(state, startNewRun, finalizeRun) {
  startNewRun(state, 1);
  Object.assign(state.turkey, { lives: 3 });
  Object.assign(state.stats, { score: 17050, closeCalls: 17, ovensSlammed: 1, potsBonked: 1, gravySlips: 1, flourBlinds: 0, stealthEvades: 0, goldenFeathers: 0, elapsedSec: 39.3, distanceMeters: 1200 });
  finalizeRun(state, true);
}
