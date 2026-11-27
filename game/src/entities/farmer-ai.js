// Farmer Barnaby AI state machine: Patrol, Lantern Search (?), Chase (!), Corner Lunge (!!), Carving Knife Pitch, and Pot-Bonk Stun.

import { GROUND_Y, clamp } from '../config.js';
import { spawnCarvingKnife } from '../world/hazards.js';

const CHASE_QUIPS = ['GET IN THE ROASTER!', 'COME HERE, PLUMPSTER!', 'DINNER BELL IS RINGIN!', 'NO ESCAPIN THE GRAVY!'];
const SEARCH_QUIPS = ['WHERE DID THAT BIRD GO?', 'HMM? IN THAT PUMPKIN?', 'I HEAR FEATHERS...', 'HERE, TURKEY-TURKEY...'];

export function createFarmerBarnaby(startX = -40) {
  return { x: startX, y: GROUND_Y, vx: 110, facing: 1, state: 'patrol', stateTimer: 0, alertLevel: 0, visionRange: 390, strideCycle: 0, hatPop: 0, armSwing: 0, knifeCooldown: 2.2, lungeCooldown: 2.8, lungeWindup: 0, searchTargetX: startX + 260, speech: '', speechTimer: 0, quipIndex: 0, lastKnownTurkeyX: startX + 220 };
}

export function computeVisionCone(farmer) {
  const reach = farmer.state === 'chase' ? 430 : farmer.state === 'search' ? 375 : 330;
  const sweep = farmer.state === 'search' ? Math.sin(farmer.stateTimer * 3.8) * 0.24 : 0;
  return { originX: farmer.x + farmer.facing * 26, originY: farmer.y - 84, reach, baseAngle: farmer.facing > 0 ? 0.1 + sweep : Math.PI - 0.1 - sweep, halfSpread: farmer.state === 'search' ? 0.34 : 0.27 };
}

export function canFarmerSeeTurkey(farmer, turkey) {
  if (turkey.hidden) return false;
  const dx = turkey.x - farmer.x, dy = turkey.y - 32 - (farmer.y - 78), dist = Math.hypot(dx, dy);
  if (dist < 118) return true;
  if (dist > computeVisionCone(farmer).reach) return false;
  return ((farmer.facing > 0 && dx > -18) || (farmer.facing < 0 && dx < 18)) && Math.abs(dy) < 175;
}

export function triggerCornerLunge(farmer, turkey, particles, sound) {
  farmer.state = 'lunge'; farmer.lungeWindup = 0.38; farmer.stateTimer = 0.88; farmer.lungeCooldown = 3.4;
  farmer.facing = turkey.x >= farmer.x ? 1 : -1; farmer.vx = 0; farmer.hatPop = 12; farmer.speech = 'GOTCHA NOW!'; farmer.speechTimer = 1.1;
  particles.spawnKnifeSparks(farmer.x + farmer.facing * 32, farmer.y - 68, 5);
  if (sound) sound.playSpottedAlert();
}

export function updateFarmerAI(farmer, turkey, course, stage, dt, particles, sound, stats, onTurkeyHit, onCloseCall) {
  farmer.hatPop = Math.max(0, farmer.hatPop - dt * 42);
  farmer.knifeCooldown = Math.max(0, farmer.knifeCooldown - dt);
  farmer.lungeCooldown = Math.max(0, farmer.lungeCooldown - dt);
  if (farmer.speechTimer > 0) farmer.speechTimer = Math.max(0, farmer.speechTimer - dt);

  if (turkey.x - farmer.x > 880 && farmer.state !== 'stunned') {
    farmer.x = turkey.x - 620; farmer.facing = 1;
    if (farmer.state === 'patrol') { farmer.state = 'search'; farmer.stateTimer = 2.6; farmer.searchTargetX = turkey.x + 80; }
  }
  if (farmer.state === 'stunned') {
    farmer.stateTimer -= dt; farmer.vx *= Math.max(0, 1 - dt * 8); farmer.x += farmer.vx * dt;
    if (farmer.stateTimer <= 0) { farmer.state = 'search'; farmer.stateTimer = 2.5; farmer.searchTargetX = turkey.x; farmer.speech = 'OH, YOU LITTLE RASCAL!'; farmer.speechTimer = 1.6; }
    return;
  }
  if (course.decoys.length > 0 && farmer.state !== 'lunge') {
    const decoy = course.decoys[course.decoys.length - 1];
    if (Math.abs(decoy.x - farmer.x) < 480 && (farmer.state !== 'chase' || turkey.hidden)) {
      farmer.state = 'search'; farmer.stateTimer = 3.2; farmer.searchTargetX = decoy.x; farmer.facing = decoy.x >= farmer.x ? 1 : -1;
      if (farmer.speechTimer <= 0) { farmer.speech = 'EH? WHAT WAS THAT?'; farmer.speechTimer = 1.6; }
    }
  }

  const sees = canFarmerSeeTurkey(farmer, turkey), spd = stage.farmerSpeed;
  if (farmer.state === 'lunge') {
    farmer.stateTimer -= dt;
    if (farmer.lungeWindup > 0) {
      farmer.lungeWindup -= dt;
      if (farmer.lungeWindup <= 0) { farmer.vx = farmer.facing * spd * 1.85; particles.spawnDustPuff(farmer.x, GROUND_Y, -farmer.facing, 7); }
    } else {
      farmer.x += farmer.vx * dt; farmer.vx *= Math.max(0, 1 - dt * 2.8); farmer.strideCycle += dt * 16;
      if (!turkey.hidden) {
        const dx = Math.abs(turkey.x - farmer.x), dy = Math.abs(turkey.y - farmer.y);
        if (dx < 46 && dy < 54) { if (turkey.dashTimer > 0) onCloseCall(turkey.x, turkey.y - 54, 'MATADOR DODGE!'); else onTurkeyHit('FARMER BARNABY', farmer.facing * 280, -320); }
        else if (dx < 82 && dy < 110 && turkey.y < GROUND_Y - 38) onCloseCall(turkey.x, turkey.y - 52, 'LEAP OVER!');
      }
    }
    if (farmer.stateTimer <= 0) { farmer.state = sees ? 'chase' : 'search'; farmer.stateTimer = 2.4; farmer.searchTargetX = farmer.lastKnownTurkeyX; }
    return;
  }

  if (sees) {
    farmer.lastKnownTurkeyX = turkey.x; farmer.alertLevel = clamp(farmer.alertLevel + dt * 2.8, 0, 1);
    if (farmer.state !== 'chase') {
      farmer.state = 'chase'; farmer.hatPop = 20; farmer.speech = CHASE_QUIPS[farmer.quipIndex++ % CHASE_QUIPS.length]; farmer.speechTimer = 1.9;
      stats.timesSpotted += 1; particles.spawnCallout(farmer.x, farmer.y - 144, '! SPOTTED !', '#ff6b4a', 1.15); if (sound) sound.playSpottedAlert();
    }
  } else {
    farmer.alertLevel = Math.max(0, farmer.alertLevel - dt * 0.55);
    if (farmer.state === 'chase') { farmer.state = 'search'; farmer.stateTimer = 3.6; farmer.searchTargetX = farmer.lastKnownTurkeyX + farmer.facing * 90; farmer.speech = SEARCH_QUIPS[farmer.quipIndex++ % SEARCH_QUIPS.length]; farmer.speechTimer = 1.9; }
  }

  if (farmer.state === 'chase') {
    const toT = turkey.x - farmer.x, dist = Math.abs(toT);
    farmer.facing = toT >= 0 ? 1 : -1;
    const boost = dist > 380 ? 1.16 : dist < 150 ? 0.96 : 1.04;
    farmer.vx += (farmer.facing * spd * boost - farmer.vx) * Math.min(1, dt * 6);
    farmer.x += farmer.vx * dt; farmer.strideCycle += dt * Math.abs(farmer.vx) * 0.036;
    if (dist < 175 && dist > 64 && farmer.lungeCooldown <= 0 && turkey.y > GROUND_Y - 120) { triggerCornerLunge(farmer, turkey, particles, sound); return; }
    if (dist > 220 && dist < 590 && farmer.knifeCooldown <= 0) {
      farmer.knifeCooldown = stage.knifeInterval; farmer.armSwing = 1.0;
      spawnCarvingKnife(course, farmer.x + farmer.facing * 32, farmer.y - 78, farmer.facing * (470 + stage.index * 45), clamp((turkey.y - 35 - (farmer.y - 78)) * 1.4, -220, 40) - 55, 'farmer');
      if (sound) sound.playKnifeThrow();
    }
    if (!turkey.hidden && dist < 42 && Math.abs(turkey.y - farmer.y) < 56) {
      if (turkey.dashTimer > 0) onCloseCall(turkey.x, turkey.y - 50, 'SLIP PAST!');
      else onTurkeyHit('FARMER BARNABY', farmer.facing * 260, -310);
    }
  } else if (farmer.state === 'search') {
    farmer.stateTimer -= dt;
    const dx = farmer.searchTargetX - farmer.x;
    if (Math.abs(dx) > 24) { farmer.facing = dx >= 0 ? 1 : -1; farmer.vx = farmer.facing * spd * 0.52; farmer.x += farmer.vx * dt; farmer.strideCycle += dt * 6; }
    else { farmer.vx = 0; farmer.facing = Math.floor(farmer.stateTimer * 2) % 2 === 0 ? 1 : -1; }
    if (turkey.hidden && turkey.hideSpot && !turkey.hideSpot.evadeAwarded && Math.abs(farmer.x - turkey.x) < 95) {
      turkey.hideSpot.evadeAwarded = true; stats.stealthEvades += 1; stats.score += 180 * stats.combo;
      particles.spawnCallout(turkey.x, turkey.hideSpot.y - 36, 'GHOST EVADE! +180', '#9ef5a2', 1.1); if (sound) sound.playCloseCall(stats.combo);
    }
    if (farmer.stateTimer <= 0) { farmer.state = 'patrol'; farmer.facing = 1; }
  } else {
    farmer.vx += (farmer.facing * spd * 0.56 - farmer.vx) * Math.min(1, dt * 4);
    farmer.x += farmer.vx * dt; farmer.strideCycle += dt * 5.2;
    if (farmer.x < turkey.x - 560) farmer.facing = 1;
  }
  farmer.armSwing = Math.max(0, farmer.armSwing - dt * 3.5);
  farmer.x = clamp(farmer.x, 30, course.lengthPx - 90);
}
