// Thanksgiving hazards & comic traps: 425°F ovens, Damascus knives, cleavers, hanging pots, gravy slips, flour-sack blinds, and acorn decoys.

import { GROUND_Y, PHYSICS, clamp } from '../config.js';

export function createRoastingOven(x, stageIndex, facing = -1, phaseOffset = 0) {
  return { x, y: GROUND_Y - 122, w: 112, h: 122, facing, stageIndex, variant: stageIndex <= 1 ? 'brick_roaster' : 'cast_iron', state: 'idle', timer: 1.4 + (phaseOffset % 1.8), tempF: 325, doorOpen: 0, flamePower: 0, rattle: 0, latchX: x + (facing < 0 ? 14 : 98), latchY: GROUND_Y - 76, slammedCount: 0 };
}
export function createChoppingCleaver(x, restY, stageIndex, phaseOffset = 0) { const ry = Math.max(250, restY - 36); return { x, anchorY: Math.max(96, restY - 190), restY: ry, chopY: GROUND_Y - 24, y: ry, w: 30, h: 92, stageIndex, state: 'raised', timer: 1.1 + (phaseOffset % 1.4), glint: 0 }; }
export function createHangingPot(x, ropeTopY, kind = 'copper_pot') { return { x, ropeTopY, y: ropeTopY + 112, vy: 0, radius: 30, kind, state: 'hanging', sway: 0, bonked: false }; }
export function createGravySpill(x, width = 128) { return { x, y: GROUND_Y - 6, w: width, h: 14, shimmer: 0, slipCooldown: 0 }; }
export function spawnCarvingKnife(course, x, y, vx, vy, source = 'farmer') { course.knives.push({ x, y, vx, vy, angle: Math.atan2(vy, vx), spinSpeed: vx >= 0 ? 12.5 : -12.5, radius: 22, life: 4, source, telegraph: source === 'volley' ? 0.62 : 0.08, trail: [], grazed: false }); }
export function spawnAcornProjectile(course, x, y, vx, vy) { course.acorns.push({ x, y, vx, vy, angle: 0, life: 2.6, active: true }); }

export function slamOvenDoor(ov, p, snd) {
  if (ov.state === 'slammed') return false;
  Object.assign(ov, { state: 'slammed', timer: 4.6, doorOpen: 0, flamePower: 0, tempF: 240, slammedCount: ov.slammedCount + 1 });
  p.spawnKnifeSparks(ov.latchX, ov.latchY, 10); p.spawnCallout(ov.x + ov.w * 0.5, ov.y - 26, 'OVEN SLAM! +200', '#ffe27a', 1.15); p.triggerShake(5, 0.16);
  if (snd) snd.playOvenSlam(); return true;
}
export function dropHangingPot(pot, p, snd) {
  if (pot.state !== 'hanging') return false;
  pot.state = 'falling'; pot.vy = 60; p.spawnKnifeSparks(pot.x, pot.ropeTopY + 55, 6); if (snd) snd.playAcornHit(); return true;
}
export function triggerFlourCloudBlind(course, sp, p, snd) {
  if (sp.flourBurst) return false;
  sp.flourBurst = true; sp.wiggle = 1.2; const cx = sp.x + sp.w * 0.5, cy = GROUND_Y - 56;
  course.flourClouds.push({ x: cx, y: cy, radius: 108, timer: 4.5, maxTimer: 4.5, blinded: false });
  p.spawnFlourCloud(cx, cy); p.spawnCallout(cx, sp.y - 28, 'FLOUR POOF!', '#fff8ea', 1.05); if (snd) snd.playFlourBurst(); return true;
}
export function getOvenFlameBox(ov) {
  if (ov.state !== 'blast' || ov.flamePower < 0.25) return null;
  const r = 138 + ov.flamePower * 68;
  return { x: ov.facing < 0 ? ov.x - r : ov.x + ov.w, y: ov.y + 26, w: r, h: 76 };
}

export function updateOvensAndKnives(course, turkey, farmer, dt, p, snd, stats, onHit, onClose, speedMult = 1) {
  const sm = stats.scoreMult || 1;
  for (const ov of course.ovens) {
    if (Math.abs(ov.x - turkey.x) > 1650) continue;
    ov.timer -= dt * speedMult; const spd = (1 + ov.stageIndex * 0.14) * speedMult;
    if (ov.state === 'slammed') { ov.doorOpen = Math.max(0, ov.doorOpen - dt * 8); ov.flamePower = 0; ov.tempF = clamp(ov.tempF + dt * 15, 220, 310); ov.rattle = 0; if (ov.timer <= 0) { ov.state = 'idle'; ov.timer = 1.6; } }
    else if (ov.state === 'idle') { ov.doorOpen = Math.max(0, ov.doorOpen - dt * 5); ov.flamePower = Math.max(0, ov.flamePower - dt * 4); ov.tempF = clamp(ov.tempF - dt * 40, 320, 425); ov.rattle = 0; if (ov.timer <= 0) { ov.state = 'preheat'; ov.timer = 0.72 / spd; if (Math.abs(ov.x - turkey.x) < 760 && snd) snd.playOvenWarn(); } }
    else if (ov.state === 'preheat') { ov.tempF = clamp(ov.tempF + dt * 160, 320, 435); ov.rattle = Math.sin(ov.timer * 52) * 3.2; ov.doorOpen = 0.16 + Math.abs(Math.sin(ov.timer * 34)) * 0.1; if (Math.random() < dt * 14) p.spawnOvenFlame(ov.x + (ov.facing < 0 ? 4 : ov.w - 4), ov.y + 62, ov.facing, 1); if (ov.timer <= 0) { ov.state = 'blast'; ov.timer = 1.38; if (Math.abs(ov.x - turkey.x) < 780 && snd) snd.playOvenBurst(); p.spawnOvenFlame(ov.x + (ov.facing < 0 ? 0 : ov.w), ov.y + 64, ov.facing, 10); } }
    else if (ov.state === 'blast') { ov.doorOpen = Math.min(1, ov.doorOpen + dt * 7); ov.flamePower = Math.min(1, ov.flamePower + dt * 6); ov.tempF = 425 + Math.sin(ov.timer * 18) * 10; ov.rattle = Math.sin(ov.timer * 30) * 1.2; if (Math.random() < dt * 20) p.spawnOvenFlame(ov.x + (ov.facing < 0 ? -12 : ov.w + 12), ov.y + 64, ov.facing, 2); if (ov.timer <= 0) { ov.state = 'idle'; ov.timer = Math.max(1.2, 2.2 - ov.stageIndex * 0.22); } }
    const fl = getOvenFlameBox(ov);
    if (fl && !turkey.hidden) {
      if (turkey.x + 14 > fl.x + 18 && turkey.x - 14 < fl.x + fl.w - 18 && turkey.y + 8 > fl.y + 20 && turkey.y - 38 < fl.y + fl.h - 12) {
        if (turkey.dashTimer > 0) onClose(turkey.x, turkey.y - 40, 'FLAME DASH!'); else onHit('ROASTING OVEN', ov.facing * 260, -340);
      } else if (turkey.x > fl.x - 44 && turkey.x < fl.x + fl.w + 44 && turkey.y > fl.y - 76 && turkey.y < fl.y + fl.h + 18 && Math.abs(turkey.vx) > 200) onClose(turkey.x, turkey.y - 44, 'CLOSE SHAVE!');
    }
    if (ov.state === 'slammed' && farmer.state === 'chase' && Math.abs(farmer.x - (ov.x + ov.w * 0.5)) < 68 && ov.timer > 3.2) {
      Object.assign(farmer, { state: 'stunned', stateTimer: 2.4, speech: 'OW! HOT IRON!', speechTimer: 1.8 }); p.spawnStars(farmer.x, farmer.y - 115, 6);
    }
  }

  for (const sp of course.gravySpills) {
    if (sp.slipCooldown > 0) sp.slipCooldown = Math.max(0, sp.slipCooldown - dt);
    if (sp.slipCooldown <= 0 && (farmer.state === 'chase' || farmer.state === 'lunge') && farmer.x > sp.x + 14 && farmer.x < sp.x + sp.w - 14) {
      sp.slipCooldown = 5.5; Object.assign(farmer, { state: 'stunned', stateTimer: 2.5, slipTilt: 1, hatPop: 26, vx: farmer.vx * 1.25, speech: 'WHOA—GRAVY!', speechTimer: 2 });
      stats.gravySlips += 1; stats.score += Math.round(250 * stats.combo * sm);
      p.spawnGravySplash(farmer.x, GROUND_Y - 6, 12); p.spawnStars(farmer.x, farmer.y - 108, 6); p.spawnCallout(farmer.x, farmer.y - 276, 'GRAVY SLIP! +250', '#ffe27a', 1.2); p.triggerShake(6, 0.2);
      if (snd) snd.playGravySlip();
    }
  }

  for (const cl of course.cleavers) {
    if (Math.abs(cl.x - turkey.x) > 1500) continue;
    cl.timer -= dt * speedMult;
    if (cl.state === 'raised') { cl.y += (cl.restY - cl.y) * Math.min(1, dt * 8); cl.glint = 0; if (cl.timer <= 0) { cl.state = 'glint'; cl.timer = 0.52; } }
    else if (cl.state === 'glint') { cl.glint = 1 - cl.timer / 0.52; if (cl.timer <= 0) { cl.state = 'chop'; cl.timer = 0.28; if (Math.abs(cl.x - turkey.x) < 700 && snd) snd.playKnifeThrow(); } }
    else if (cl.state === 'chop') { cl.y = Math.min(cl.chopY, cl.y + dt * 1950); if (cl.y >= cl.chopY && cl.timer > 0.14) { p.spawnKnifeSparks(cl.x, cl.chopY, 5); cl.timer = 0.14; } if (cl.timer <= 0) { cl.state = 'retract'; cl.timer = 0.72; } }
    else if (cl.state === 'retract') { cl.y = Math.max(cl.restY, cl.y - dt * 520); if (cl.timer <= 0) { cl.state = 'raised'; cl.timer = Math.max(0.85, 1.55 - cl.stageIndex * 0.18); } }
    if (!turkey.hidden && cl.state === 'chop') {
      const dx = Math.abs(turkey.x - cl.x), dy = Math.abs(turkey.y - 26 - (cl.y - 28));
      if (dx < 26 && dy < 44) { if (turkey.dashTimer > 0) onClose(turkey.x, turkey.y - 44, 'BLADE DASH!'); else onHit('CARVING CLEAVER', turkey.x < cl.x ? -240 : 240, -320); }
      else if (dx < 62 && dy < 66) onClose(turkey.x, turkey.y - 46, 'CLOSE SHAVE!');
    }
  }

  for (let i = course.knives.length - 1; i >= 0; i--) {
    const k = course.knives[i]; k.life -= dt; if (k.telegraph > 0) { k.telegraph -= dt; continue; }
    k.x += k.vx * dt; k.y += k.vy * dt; k.vy += 120 * dt; k.angle += k.spinSpeed * dt; k.trail.push({ x: k.x, y: k.y }); if (k.trail.length > 10) k.trail.shift();
    if (k.y >= GROUND_Y - 12 || k.life <= 0) { if (k.y >= GROUND_Y - 12) p.spawnKnifeSparks(k.x, GROUND_Y - 12, 6); course.knives.splice(i, 1); continue; }
    if (!turkey.hidden) {
      const d = Math.hypot(turkey.x - k.x, turkey.y - 28 - k.y);
      if (d < 28) { if (turkey.dashTimer > 0) { if (!k.grazed) { k.grazed = true; onClose(turkey.x, turkey.y - 46, 'KNIFE DODGE!'); } } else { onHit('CARVING KNIFE', k.vx >= 0 ? 250 : -250, -300); course.knives.splice(i, 1); continue; } }
      else if (d < PHYSICS.closeCallRadius && !k.grazed) { k.grazed = true; onClose(turkey.x, turkey.y - 48, 'CLOSE SHAVE!'); }
    }
  }

  for (const pot of course.hangingPots) {
    pot.sway += dt * 2.2;
    if (pot.state === 'falling') {
      pot.vy += 1450 * dt; pot.y += pot.vy * dt;
      if (!pot.bonked && Math.abs(pot.x - farmer.x) < 64 && pot.y >= farmer.y - 128 && pot.y <= farmer.y) {
        pot.bonked = true; pot.state = 'landed'; pot.y = GROUND_Y - 22;
        Object.assign(farmer, { state: 'stunned', stateTimer: 3.2, hatPop: 28, speech: 'OOOF! MY GRAVY!', speechTimer: 2.4 });
        stats.potsBonked += 1; stats.score += Math.round(300 * stats.combo * sm);
        p.spawnStars(farmer.x, farmer.y - 120, 8); p.spawnCallout(farmer.x, farmer.y - 146, 'POT BONK! +300', '#ffe27a', 1.25); p.triggerShake(8, 0.25); if (snd) snd.playPotBonk();
      } else if (pot.y >= GROUND_Y - 24) { pot.y = GROUND_Y - 24; pot.state = 'landed'; p.spawnDustPuff(pot.x, GROUND_Y - 6, 0, 8); if (snd) snd.playPotBonk(); }
    }
  }

  for (let i = course.acorns.length - 1; i >= 0; i--) {
    const a = course.acorns[i]; a.life -= dt; a.x += a.vx * dt; a.y += a.vy * dt; a.vy += PHYSICS.acornGravity * dt; a.angle += dt * 14;
    let hit = false;
    for (const pot of course.hangingPots) if (pot.state === 'hanging' && Math.abs(a.x - pot.x) < 30 && a.y >= pot.ropeTopY && a.y <= pot.y + 36) { dropHangingPot(pot, p, snd); hit = true; break; }
    if (!hit) for (const ov of course.ovens) if (ov.state !== 'slammed' && Math.abs(a.x - ov.latchX) < 46 && Math.abs(a.y - ov.latchY) < 48) { if (slamOvenDoor(ov, p, snd)) { stats.ovensSlammed += 1; stats.score += Math.round(200 * stats.combo * sm); } hit = true; break; }
    if (!hit) for (const sp of course.hidingSpots) if (sp.kind === 'flour_sack' && !sp.flourBurst && a.x > sp.x && a.x < sp.x + sp.w && a.y > sp.y && a.y < GROUND_Y) { triggerFlourCloudBlind(course, sp, p, snd); hit = true; break; }
    if (!hit && farmer.state !== 'stunned' && Math.abs(a.x - farmer.x) < 36 && a.y >= farmer.y - 120 && a.y <= farmer.y - 20) {
      farmer.hatPop = 18; farmer.vx *= 0.25; farmer.speech = 'HEY! WATCH THE HAT!'; farmer.speechTimer = 1.5;
      p.spawnKnifeSparks(a.x, a.y, 5); p.spawnCallout(farmer.x, farmer.y - 135, 'ACORN BOOP! +80', '#ffd27d', 1); stats.score += 80; if (snd) snd.playAcornHit(); hit = true;
    }
    if (!hit && a.y >= GROUND_Y - 8) { course.decoys.push({ x: a.x, y: GROUND_Y - 10, timer: 4 }); p.spawnAcornRing(a.x, GROUND_Y - 12); p.spawnDustPuff(a.x, GROUND_Y - 4, 0, 4); if (snd) snd.playAcornHit(); hit = true; }
    if (hit || a.life <= 0) course.acorns.splice(i, 1);
  }
  for (let i = course.flourClouds.length - 1; i >= 0; i--) {
    const fc = course.flourClouds[i]; fc.timer -= dt;
    if (!fc.blinded && farmer.state !== 'stunned' && Math.abs(farmer.x - fc.x) < fc.radius) {
      fc.blinded = true; Object.assign(farmer, { state: 'stunned', stateTimer: 2.6, hatPop: 14, speech: "CAN'T SEE A THING!", speechTimer: 2.2 });
      stats.flourBlinds += 1; stats.score += Math.round(220 * stats.combo * sm); p.spawnCallout(farmer.x, farmer.y - 140, 'FLOUR BLIND! +220', '#fff8ea', 1.15);
    }
    if (fc.timer <= 0) course.flourClouds.splice(i, 1);
  }
  for (let i = course.decoys.length - 1; i >= 0; i--) { course.decoys[i].timer -= dt; if (course.decoys[i].timer <= 0) course.decoys.splice(i, 1); }
}
