// Thanksgiving hazards & interactive props: 425°F roasting ovens, carving knives, chopping cleavers, gravy spills, hanging pots, and acorn decoys.

import { GROUND_Y, PHYSICS, clamp } from '../config.js';

export function createRoastingOven(x, stageIndex, facing = -1, phaseOffset = 0) {
  return { x, y: GROUND_Y - 122, w: 112, h: 122, facing, stageIndex, state: 'idle', timer: 1.4 + (phaseOffset % 1.8), tempF: 325, doorOpen: 0, flamePower: 0, rattle: 0, latchX: x + (facing < 0 ? 14 : 98), latchY: GROUND_Y - 76, slammedCount: 0 };
}
export function createChoppingCleaver(x, restY, stageIndex, phaseOffset = 0) {
  const ry = Math.max(255, restY - 36);
  return { x, anchorY: Math.max(96, restY - 190), restY: ry, chopY: GROUND_Y - 24, y: ry, w: 30, h: 92, stageIndex, state: 'raised', timer: 1.1 + (phaseOffset % 1.4), glint: 0 };
}
export function createHangingPot(x, ropeTopY, kind = 'copper_pot') { return { x, ropeTopY, y: ropeTopY + 112, vy: 0, radius: 30, kind, state: 'hanging', sway: 0, bonked: false }; }
export function createGravySpill(x, width = 128) { return { x, y: GROUND_Y - 6, w: width, h: 14, shimmer: 0 }; }
export function spawnCarvingKnife(course, x, y, vx, vy, source = 'farmer') { course.knives.push({ x, y, vx, vy, angle: Math.atan2(vy, vx), spinSpeed: vx >= 0 ? 12.5 : -12.5, radius: 22, life: 4.0, source, telegraph: source === 'volley' ? 0.48 : 0.08, trail: [], grazed: false }); }
export function spawnAcornProjectile(course, x, y, vx, vy) { course.acorns.push({ x, y, vx, vy, angle: 0, life: 2.6, active: true }); }
export function slamOvenDoor(oven, particles, sound) {
  if (oven.state === 'slammed') return false;
  Object.assign(oven, { state: 'slammed', timer: 4.6, doorOpen: 0, flamePower: 0, tempF: 240, slammedCount: oven.slammedCount + 1 });
  particles.spawnKnifeSparks(oven.latchX, oven.latchY, 10); particles.spawnCallout(oven.x + oven.w * 0.5, oven.y - 24, 'OVEN SLAM! +200', '#ffe27a', 1.15); particles.triggerShake(5, 0.16);
  if (sound) sound.playOvenSlam();
  return true;
}
export function dropHangingPot(pot, particles, sound) {
  if (pot.state !== 'hanging') return false;
  pot.state = 'falling'; pot.vy = 60; particles.spawnKnifeSparks(pot.x, pot.ropeTopY + 55, 6);
  if (sound) sound.playAcornHit();
  return true;
}
export function getOvenFlameBox(oven) {
  if (oven.state !== 'blast' || oven.flamePower < 0.25) return null;
  const r = 135 + oven.flamePower * 65;
  return { x: oven.facing < 0 ? oven.x - r : oven.x + oven.w, y: oven.y + 26, w: r, h: 76 };
}

export function updateOvensAndKnives(course, turkey, farmer, dt, particles, sound, stats, onTurkeyHit, onCloseCall) {
  for (const oven of course.ovens) {
    if (Math.abs(oven.x - turkey.x) > 1650) continue;
    oven.timer -= dt;
    const spd = 1 + oven.stageIndex * 0.14;
    if (oven.state === 'slammed') {
      oven.doorOpen = Math.max(0, oven.doorOpen - dt * 8); oven.flamePower = 0; oven.tempF = clamp(oven.tempF + dt * 15, 220, 310); oven.rattle = 0;
      if (oven.timer <= 0) { oven.state = 'idle'; oven.timer = 1.6; }
    } else if (oven.state === 'idle') {
      oven.doorOpen = Math.max(0, oven.doorOpen - dt * 5); oven.flamePower = Math.max(0, oven.flamePower - dt * 4); oven.tempF = clamp(oven.tempF - dt * 40, 320, 425); oven.rattle = 0;
      if (oven.timer <= 0) { oven.state = 'preheat'; oven.timer = 0.72 / spd; if (Math.abs(oven.x - turkey.x) < 760 && sound) sound.playOvenWarn(); }
    } else if (oven.state === 'preheat') {
      oven.tempF = clamp(oven.tempF + dt * 160, 320, 435); oven.rattle = Math.sin(oven.timer * 52) * 3.2; oven.doorOpen = 0.16 + Math.abs(Math.sin(oven.timer * 34)) * 0.1;
      if (Math.random() < dt * 14) particles.spawnOvenFlame(oven.x + (oven.facing < 0 ? 4 : oven.w - 4), oven.y + 62, oven.facing, 1);
      if (oven.timer <= 0) { oven.state = 'blast'; oven.timer = 1.35; if (Math.abs(oven.x - turkey.x) < 780 && sound) sound.playOvenBurst(); particles.spawnOvenFlame(oven.x + (oven.facing < 0 ? 0 : oven.w), oven.y + 64, oven.facing, 10); }
    } else if (oven.state === 'blast') {
      oven.doorOpen = Math.min(1, oven.doorOpen + dt * 7); oven.flamePower = Math.min(1, oven.flamePower + dt * 6); oven.tempF = 425 + Math.sin(oven.timer * 18) * 10; oven.rattle = Math.sin(oven.timer * 30) * 1.2;
      if (Math.random() < dt * 20) particles.spawnOvenFlame(oven.x + (oven.facing < 0 ? -12 : oven.w + 12), oven.y + 64, oven.facing, 2);
      if (oven.timer <= 0) { oven.state = 'idle'; oven.timer = Math.max(1.25, 2.2 - oven.stageIndex * 0.22); }
    }
    const flame = getOvenFlameBox(oven);
    if (flame && !turkey.hidden) {
      if (turkey.x + 18 > flame.x + 16 && turkey.x - 18 < flame.x + flame.w - 14 && turkey.y + 12 > flame.y + 10 && turkey.y - 44 < flame.y + flame.h - 10) {
        if (turkey.dashTimer > 0) onCloseCall(turkey.x, turkey.y - 40, 'FLAME DASH!');
        else onTurkeyHit('ROASTING OVEN', oven.facing * 260, -340);
      } else if (turkey.x > flame.x - 42 && turkey.x < flame.x + flame.w + 42 && turkey.y > flame.y - 72 && turkey.y < flame.y + flame.h + 18 && Math.abs(turkey.vx) > 220) {
        onCloseCall(turkey.x, turkey.y - 44, 'CLOSE SHAVE!');
      }
    }
    if (oven.state === 'slammed' && farmer.state === 'chase' && Math.abs(farmer.x - (oven.x + oven.w * 0.5)) < 68 && oven.timer > 3.2) {
      farmer.state = 'stunned'; farmer.stateTimer = 2.4; farmer.speech = 'OW! HOT IRON!'; farmer.speechTimer = 1.8; particles.spawnStars(farmer.x, farmer.y - 115, 6);
    }
  }

  for (const cl of course.cleavers) {
    if (Math.abs(cl.x - turkey.x) > 1500) continue;
    cl.timer -= dt;
    if (cl.state === 'raised') { cl.y += (cl.restY - cl.y) * Math.min(1, dt * 8); cl.glint = 0; if (cl.timer <= 0) { cl.state = 'glint'; cl.timer = 0.52; } }
    else if (cl.state === 'glint') { cl.glint = 1 - cl.timer / 0.52; if (cl.timer <= 0) { cl.state = 'chop'; cl.timer = 0.28; if (Math.abs(cl.x - turkey.x) < 700 && sound) sound.playKnifeThrow(); } }
    else if (cl.state === 'chop') {
      cl.y = Math.min(cl.chopY, cl.y + dt * 1950);
      if (cl.y >= cl.chopY && cl.timer > 0.14) { particles.spawnKnifeSparks(cl.x, cl.chopY, 5); cl.timer = 0.14; }
      if (cl.timer <= 0) { cl.state = 'retract'; cl.timer = 0.72; }
    } else if (cl.state === 'retract') { cl.y = Math.max(cl.restY, cl.y - dt * 520); if (cl.timer <= 0) { cl.state = 'raised'; cl.timer = Math.max(0.85, 1.55 - cl.stageIndex * 0.18); } }
    if (!turkey.hidden && cl.state === 'chop') {
      const dx = Math.abs(turkey.x - cl.x), dy = Math.abs(turkey.y - 26 - (cl.y - 28));
      if (dx < 26 && dy < 44) { if (turkey.dashTimer > 0) onCloseCall(turkey.x, turkey.y - 44, 'BLADE DASH!'); else onTurkeyHit('CARVING CLEAVER', turkey.x < cl.x ? -240 : 240, -320); }
      else if (dx < 62 && dy < 66) onCloseCall(turkey.x, turkey.y - 46, 'CLOSE SHAVE!');
    }
  }

  for (let i = course.knives.length - 1; i >= 0; i--) {
    const k = course.knives[i]; k.life -= dt;
    if (k.telegraph > 0) { k.telegraph -= dt; continue; }
    k.x += k.vx * dt; k.y += k.vy * dt; k.vy += 120 * dt; k.angle += k.spinSpeed * dt;
    k.trail.push({ x: k.x, y: k.y }); if (k.trail.length > 9) k.trail.shift();
    if (k.y >= GROUND_Y - 12 || k.life <= 0) { if (k.y >= GROUND_Y - 12) particles.spawnKnifeSparks(k.x, GROUND_Y - 12, 6); course.knives.splice(i, 1); continue; }
    if (!turkey.hidden) {
      const dist = Math.hypot(turkey.x - k.x, turkey.y - 28 - k.y);
      if (dist < 28) {
        if (turkey.dashTimer > 0) { if (!k.grazed) { k.grazed = true; onCloseCall(turkey.x, turkey.y - 46, 'KNIFE DODGE!'); } }
        else { onTurkeyHit('CARVING KNIFE', k.vx >= 0 ? 250 : -250, -300); course.knives.splice(i, 1); continue; }
      } else if (dist < PHYSICS.closeCallRadius && !k.grazed) { k.grazed = true; onCloseCall(turkey.x, turkey.y - 48, 'CLOSE SHAVE!'); }
    }
  }

  for (const pot of course.hangingPots) {
    pot.sway += dt * 2.2;
    if (pot.state === 'falling') {
      pot.vy += 1450 * dt; pot.y += pot.vy * dt;
      if (!pot.bonked && Math.abs(pot.x - farmer.x) < 62 && pot.y >= farmer.y - 126 && pot.y <= farmer.y) {
        pot.bonked = true; pot.state = 'landed'; pot.y = GROUND_Y - 22;
        farmer.state = 'stunned'; farmer.stateTimer = 3.2; farmer.hatPop = 28; farmer.speech = 'OOOF! MY GRAVY!'; farmer.speechTimer = 2.4;
        stats.potsBonked += 1; stats.score += 300 * stats.combo;
        particles.spawnStars(farmer.x, farmer.y - 120, 8); particles.spawnCallout(farmer.x, farmer.y - 146, 'POT BONK! +300', '#ffe27a', 1.25); particles.triggerShake(8, 0.25);
        if (sound) sound.playPotBonk();
      } else if (pot.y >= GROUND_Y - 24) { pot.y = GROUND_Y - 24; pot.state = 'landed'; particles.spawnDustPuff(pot.x, GROUND_Y - 6, 0, 8); if (sound) sound.playPotBonk(); }
    }
  }

  for (let i = course.acorns.length - 1; i >= 0; i--) {
    const a = course.acorns[i]; a.life -= dt; a.x += a.vx * dt; a.y += a.vy * dt; a.vy += PHYSICS.acornGravity * dt; a.angle += dt * 14;
    let hit = false;
    for (const pot of course.hangingPots) { if (pot.state === 'hanging' && Math.abs(a.x - pot.x) < 28 && a.y >= pot.ropeTopY && a.y <= pot.y + 34) { dropHangingPot(pot, particles, sound); hit = true; break; } }
    if (!hit) for (const oven of course.ovens) { if (oven.state !== 'slammed' && Math.abs(a.x - oven.latchX) < 42 && Math.abs(a.y - oven.latchY) < 46) { if (slamOvenDoor(oven, particles, sound)) { stats.ovensSlammed += 1; stats.score += 200 * stats.combo; } hit = true; break; } }
    if (!hit && farmer.state !== 'stunned' && Math.abs(a.x - farmer.x) < 36 && a.y >= farmer.y - 120 && a.y <= farmer.y - 20) {
      farmer.hatPop = 18; farmer.vx *= 0.25; farmer.speech = 'HEY! WATCH THE HAT!'; farmer.speechTimer = 1.5;
      particles.spawnKnifeSparks(a.x, a.y, 5); particles.spawnCallout(farmer.x, farmer.y - 135, 'ACORN BOOP! +80', '#ffd27d', 1.0); stats.score += 80;
      if (sound) sound.playAcornHit(); hit = true;
    }
    if (!hit && a.y >= GROUND_Y - 8) { course.decoys.push({ x: a.x, y: GROUND_Y - 10, timer: 4.0 }); particles.spawnAcornRing(a.x, GROUND_Y - 12); particles.spawnDustPuff(a.x, GROUND_Y - 4, 0, 4); if (sound) sound.playAcornHit(); hit = true; }
    if (hit || a.life <= 0) course.acorns.splice(i, 1);
  }
  for (let i = course.decoys.length - 1; i >= 0; i--) { course.decoys[i].timer -= dt; if (course.decoys[i].timer <= 0) course.decoys.splice(i, 1); }
}
