// Farmer Barnaby AI state machine: Patrol, Lantern Search (?), Chase (!), Corner Lunge (!!), Knife Pitch, Gravy Slip, and Pot-Bonk Stun.

import { GROUND_Y, clamp } from '../config.js';
import { spawnCarvingKnife } from '../world/hazards.js';

export function createFarmerBarnaby(startX = -40) {
  return { x: startX, y: GROUND_Y, vx: 110, facing: 1, state: 'patrol', stateTimer: 0, alertLevel: 0, visionRange: 390, strideCycle: 0, hatPop: 0, armSwing: 0, slipTilt: 0, knifeCooldown: 2.2, lungeCooldown: 2.8, lungeWindup: 0, searchTargetX: startX + 260, speech: '', speechTimer: 0, quipIndex: 0, lastKnownTurkeyX: startX + 220 };
}

export function computeVisionCone(f) {
  const reach = f.state === 'chase' ? 430 : f.state === 'search' ? 380 : 335, sw = f.state === 'search' ? Math.sin(f.stateTimer * 3.8) * 0.24 : 0;
  return { originX: f.x + f.facing * 26, originY: f.y - 84, reach, baseAngle: f.facing > 0 ? 0.1 + sw : Math.PI - 0.1 - sw, halfSpread: f.state === 'search' ? 0.34 : 0.27 };
}

export function canFarmerSeeTurkey(f, t) {
  if (t.hidden) return false;
  const dx = t.x - f.x, dy = t.y - 32 - (f.y - 78), d = Math.hypot(dx, dy);
  if (d < 118) return true;
  return d <= computeVisionCone(f).reach && ((f.facing > 0 && dx > -18) || (f.facing < 0 && dx < 18)) && Math.abs(dy) < 175;
}

export function triggerCornerLunge(f, t, p, snd) {
  Object.assign(f, { state: 'lunge', lungeWindup: 0.4, stateTimer: 0.9, lungeCooldown: 3.4, facing: t.x >= f.x ? 1 : -1, vx: 0, hatPop: 12, speech: 'GOTCHA NOW!', speechTimer: 1.1 });
  p.spawnKnifeSparks(f.x + f.facing * 32, f.y - 68, 5); if (snd) snd.playSpottedAlert();
}

export function updateFarmerAI(f, t, course, st, dt, p, snd, stats, onHit, onClose, speedMult = 1) {
  f.hatPop = Math.max(0, f.hatPop - dt * 42); f.slipTilt = Math.max(0, f.slipTilt - dt * 0.9);
  f.knifeCooldown = Math.max(0, f.knifeCooldown - dt * speedMult); f.lungeCooldown = Math.max(0, f.lungeCooldown - dt * speedMult);
  if (f.speechTimer > 0) f.speechTimer = Math.max(0, f.speechTimer - dt);

  if (t.x - f.x > 880 && f.state !== 'stunned') {
    f.x = t.x - 620; f.facing = 1;
    if (f.state === 'patrol') Object.assign(f, { state: 'search', stateTimer: 2.6, searchTargetX: t.x + 80 });
  }
  if (f.state === 'stunned') {
    f.stateTimer -= dt; f.vx *= Math.max(0, 1 - dt * 7); f.x += f.vx * dt;
    if (f.stateTimer <= 0) Object.assign(f, { state: 'search', stateTimer: 2.5, searchTargetX: t.x, speech: 'OH, YOU LITTLE RASCAL!', speechTimer: 1.6 });
    return;
  }
  if (course.decoys.length && f.state !== 'lunge') {
    const dc = course.decoys[course.decoys.length - 1];
    if (Math.abs(dc.x - f.x) < 480 && (f.state !== 'chase' || t.hidden)) {
      Object.assign(f, { state: 'search', stateTimer: 3.2, searchTargetX: dc.x, facing: dc.x >= f.x ? 1 : -1 });
      if (f.speechTimer <= 0) { f.speech = 'EH? WHAT WAS THAT?'; f.speechTimer = 1.6; }
    }
  }

  const sees = canFarmerSeeTurkey(f, t), spd = st.farmerSpeed * speedMult;
  if (f.state === 'lunge') {
    f.stateTimer -= dt;
    if (f.lungeWindup > 0) { f.lungeWindup -= dt; if (f.lungeWindup <= 0) { f.vx = f.facing * spd * 1.85; p.spawnDustPuff(f.x, GROUND_Y, -f.facing, 7); } }
    else {
      f.x += f.vx * dt; f.vx *= Math.max(0, 1 - dt * 2.8); f.strideCycle += dt * 16;
      if (!t.hidden) {
        const dx = Math.abs(t.x - f.x), dy = Math.abs(t.y - f.y);
        if (dx < 46 && dy < 54) { if (t.dashTimer > 0) onClose(t.x, t.y - 54, 'MATADOR DODGE!'); else onHit('FARMER BARNABY', f.facing * 280, -320); }
        else if (dx < 82 && dy < 110 && t.y < GROUND_Y - 38) onClose(t.x, t.y - 52, 'LEAP OVER!');
      }
    }
    if (f.stateTimer <= 0) Object.assign(f, { state: sees ? 'chase' : 'search', stateTimer: 2.4, searchTargetX: f.lastKnownTurkeyX });
    return;
  }

  if (sees) {
    f.lastKnownTurkeyX = t.x; f.alertLevel = clamp(f.alertLevel + dt * 2.8, 0, 1);
    if (f.state !== 'chase') {
      Object.assign(f, { state: 'chase', hatPop: 20, speech: CHASE_QUIPS[f.quipIndex++ % 4], speechTimer: 1.9 });
      stats.timesSpotted += 1; p.spawnCallout(f.x, f.y - 144, '! SPOTTED !', '#ff6b4a', 1.15); if (snd) snd.playSpottedAlert();
    }
  } else {
    f.alertLevel = Math.max(0, f.alertLevel - dt * 0.45);
    if (f.state === 'chase') Object.assign(f, { state: 'search', stateTimer: 3.8, searchTargetX: f.lastKnownTurkeyX + f.facing * 95, speech: SEARCH_QUIPS[f.quipIndex++ % 4], speechTimer: 2.1 });
  }

  if (f.state === 'chase') {
    const toT = t.x - f.x, d = Math.abs(toT); f.facing = toT >= 0 ? 1 : -1;
    f.vx += (f.facing * spd * (d > 380 ? 1.16 : d < 150 ? 0.96 : 1.04) - f.vx) * Math.min(1, dt * 6);
    f.x += f.vx * dt; f.strideCycle += dt * Math.abs(f.vx) * 0.036;
    if (d < 175 && d > 64 && f.lungeCooldown <= 0 && t.y > GROUND_Y - 120) { triggerCornerLunge(f, t, p, snd); return; }
    if (d > 210 && d < 590 && f.knifeCooldown <= 0) {
      f.knifeCooldown = st.knifeInterval; f.armSwing = 1;
      spawnCarvingKnife(course, f.x + f.facing * 32, f.y - 78, f.facing * (470 + st.index * 45), clamp((t.y - 35 - (f.y - 78)) * 1.4, -220, 40) - 55, 'farmer');
      if (snd) snd.playKnifeThrow();
    }
    if (!t.hidden && d < 42 && Math.abs(t.y - f.y) < 56) { if (t.dashTimer > 0) onClose(t.x, t.y - 50, 'SLIP PAST!'); else onHit('FARMER BARNABY', f.facing * 260, -310); }
  } else if (f.state === 'search') {
    f.stateTimer -= dt; const dx = f.searchTargetX - f.x;
    if (Math.abs(dx) > 24) { f.facing = dx >= 0 ? 1 : -1; f.vx = f.facing * spd * 0.52; f.x += f.vx * dt; f.strideCycle += dt * 6; }
    else { f.vx = 0; f.facing = Math.floor(f.stateTimer * 2) % 2 === 0 ? 1 : -1; }
    if (t.hidden && t.hideSpot && !t.hideSpot.evadeAwarded && Math.abs(f.x - t.x) < 115) {
      t.hideSpot.evadeAwarded = true; stats.stealthEvades += 1; stats.score += Math.round(180 * stats.combo * (stats.scoreMult || 1));
      p.spawnCallout(t.x, t.hideSpot.y - 172, 'GHOST EVADE! +180', '#9ef5a2', 1.15); if (snd) snd.playCloseCall(stats.combo);
    }
    if (f.stateTimer <= 0) { f.state = 'patrol'; f.facing = 1; }
  } else {
    f.vx += (f.facing * spd * 0.56 - f.vx) * Math.min(1, dt * 4); f.x += f.vx * dt; f.strideCycle += dt * 5.2;
    if (f.x < t.x - 560) f.facing = 1;
  }
  f.armSwing = Math.max(0, f.armSwing - dt * 3.5); f.x = clamp(f.x, 30, course.lengthPx - 90);
}

const CHASE_QUIPS = ['GET IN THE ROASTER!', 'COME HERE, PLUMPSTER!', 'DINNER BELL IS RINGIN!', 'NO ESCAPIN THE GRAVY!'];
const SEARCH_QUIPS = ['HMM? IN THAT PUMPKIN?', 'WHERE DID THAT BIRD GO?', 'I HEAR FEATHERS...', 'HERE, TURKEY-TURKEY...'];
