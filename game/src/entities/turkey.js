// Pippin the Turkey controller: responsive run, jump + feather-flutter glide, stealth cover, gobble-dash, and mouse-aimed acorn toss.

import { GROUND_Y, PHYSICS, clamp } from '../config.js';
import { spawnAcornProjectile } from '../world/hazards.js';

export function createTurkey(startX = 240) {
  return { x: startX, y: GROUND_Y, vx: 0, vy: 0, w: 50, h: 58, facing: 1, grounded: true, coyoteTimer: 0, fluttering: false, flutterFuel: 1.0, dashTimer: 0, dashCooldown: 0, hidden: false, hideSpot: null, lives: 3, maxLives: 3, acorns: 4, maxAcorns: 6, invulnTimer: 0, closeCallTimer: 0, squashX: 1, squashY: 1, runCycle: 0, wingAngle: 0, panicLevel: 0, speech: '', speechTimer: 0, onGravy: false, tailGlow: 0 };
}

export function triggerGobbleDash(turkey, moveDir, particles, sound) {
  if (turkey.dashCooldown > 0 || turkey.dashTimer > 0) return false;
  if (turkey.hidden) { turkey.hidden = false; if (turkey.hideSpot) turkey.hideSpot.occupied = false; turkey.hideSpot = null; }
  const dir = moveDir !== 0 ? moveDir : turkey.facing;
  turkey.facing = dir; turkey.dashTimer = PHYSICS.dashDuration; turkey.dashCooldown = PHYSICS.dashCooldown;
  turkey.vx = dir * PHYSICS.dashSpeed; turkey.vy = Math.min(turkey.vy, -95);
  turkey.squashX = 1.34; turkey.squashY = 0.74; turkey.speech = 'GOBBLE-GO!'; turkey.speechTimer = 0.75;
  particles.spawnFeatherBurst(turkey.x - dir * 16, turkey.y - 28, 10, 0.9);
  if (sound) { sound.playDash(); sound.playGobble(1.18); }
  return true;
}

export function toggleStealthCover(turkey, course, wantsHide, particles, sound) {
  let spot = null;
  for (const s of course.hidingSpots) { if (turkey.x >= s.x + 6 && turkey.x <= s.x + s.w - 6 && Math.abs(turkey.y - GROUND_Y) < 28) { spot = s; break; } }
  if (wantsHide && spot && turkey.dashTimer <= 0) {
    if (!turkey.hidden) {
      turkey.hidden = true; turkey.hideSpot = spot; spot.occupied = true; spot.wiggle = 1.0; turkey.vx *= 0.2; turkey.x = spot.x + spot.w * 0.5;
      if (spot.kind === 'flour_sack') particles.spawnFlourCloud(turkey.x, GROUND_Y - 38); else particles.spawnDustPuff(turkey.x, GROUND_Y - 12, 0, 5);
      particles.spawnCallout(turkey.x, spot.y - 16, 'HIDDEN!', '#a8f0a4', 0.95);
      if (sound) sound.playHide();
    } else { spot.occupied = true; turkey.hideSpot = spot; }
    return;
  }
  if (turkey.hidden) { if (turkey.hideSpot) turkey.hideSpot.occupied = false; turkey.hidden = false; turkey.hideSpot = null; }
}

export function computeAcornAimVelocity(turkey, targetWorldX, targetWorldY) {
  const originX = turkey.x + turkey.facing * 18, originY = turkey.y - 42;
  const dx = targetWorldX - originX, dy = targetWorldY - originY, dist = Math.max(40, Math.hypot(dx, dy));
  const t = Math.max(0.14, dist / clamp(dist * 2.1, 480, PHYSICS.acornSpeed));
  const vx = dx / t, vy = (dy - 0.5 * PHYSICS.acornGravity * t * t) / t;
  const mag = Math.hypot(vx, vy), scale = mag > 0 ? Math.min(mag, 880) / mag : 1;
  return { originX, originY, vx: vx * scale, vy: vy * scale };
}

export function throwAcornDecoy(turkey, course, targetWorldX, targetWorldY, particles, sound) {
  if (turkey.acorns <= 0) return false;
  turkey.acorns -= 1; turkey.facing = targetWorldX >= turkey.x ? 1 : -1;
  const aim = computeAcornAimVelocity(turkey, targetWorldX, targetWorldY);
  spawnAcornProjectile(course, aim.originX, aim.originY, aim.vx, aim.vy);
  turkey.squashX = 1.15; turkey.squashY = 0.88; particles.spawnFeatherBurst(aim.originX, aim.originY, 3, 0.45);
  if (sound) sound.playAcornToss();
  return true;
}

export function updateTurkeyMovement(turkey, input, course, cameraX, dt, particles, sound, stats) {
  const moveDir = input.getMoveX();
  if (turkey.invulnTimer > 0) turkey.invulnTimer = Math.max(0, turkey.invulnTimer - dt);
  if (turkey.dashCooldown > 0) turkey.dashCooldown = Math.max(0, turkey.dashCooldown - dt);
  if (turkey.closeCallTimer > 0) turkey.closeCallTimer = Math.max(0, turkey.closeCallTimer - dt);
  if (turkey.speechTimer > 0) turkey.speechTimer = Math.max(0, turkey.speechTimer - dt);
  turkey.squashX += (1 - turkey.squashX) * Math.min(1, dt * 14);
  turkey.squashY += (1 - turkey.squashY) * Math.min(1, dt * 14);

  toggleStealthCover(turkey, course, input.isHideHeld(), particles, sound);
  if (input.consumeDashBuffer()) triggerGobbleDash(turkey, moveDir, particles, sound);
  if (input.pointer.justClicked && !input.getHoveredButton()) throwAcornDecoy(turkey, course, cameraX + input.pointer.x, input.pointer.y, particles, sound);

  if (turkey.hidden) {
    turkey.vx = 0; turkey.vy = 0;
    if (turkey.hideSpot) turkey.hideSpot.wiggle = Math.max(0, turkey.hideSpot.wiggle - dt * 2.5);
    if (input.consumeJumpBuffer()) {
      if (turkey.hideSpot) turkey.hideSpot.occupied = false;
      Object.assign(turkey, { hidden: false, hideSpot: null, vy: PHYSICS.jumpVelocity * 0.92, grounded: false, squashX: 0.78, squashY: 1.26 });
      if (sound) sound.playJump();
    }
    return;
  }

  turkey.onGravy = turkey.grounded && course.gravySpills.some((s) => turkey.x > s.x && turkey.x < s.x + s.w && Math.abs(turkey.y - GROUND_Y) < 12);
  if (turkey.dashTimer > 0) {
    turkey.dashTimer -= dt;
    if (Math.random() < dt * 36) particles.spawnFeatherBurst(turkey.x - turkey.facing * 20, turkey.y - 26, 1, 0.35);
  } else {
    const accel = turkey.grounded ? (turkey.onGravy ? PHYSICS.runAccel * 0.48 : PHYSICS.runAccel) : PHYSICS.airAccel;
    const drag = turkey.grounded ? (turkey.onGravy ? 2.2 : PHYSICS.groundDrag) : PHYSICS.airDrag;
    const maxS = turkey.onGravy ? PHYSICS.maxRunSpeed * 1.24 : PHYSICS.maxRunSpeed;
    if (moveDir !== 0) { turkey.facing = moveDir; turkey.vx = clamp(turkey.vx + moveDir * accel * dt, -maxS, maxS); }
    else { turkey.vx *= Math.max(0, 1 - drag * dt); if (Math.abs(turkey.vx) < 8) turkey.vx = 0; }
  }

  if (turkey.grounded) { turkey.coyoteTimer = PHYSICS.coyoteTime; turkey.flutterFuel = 1.0; }
  else if (turkey.coyoteTimer > 0) turkey.coyoteTimer = Math.max(0, turkey.coyoteTimer - dt);

  if (turkey.coyoteTimer > 0 && input.consumeJumpBuffer()) {
    turkey.vy = PHYSICS.jumpVelocity; turkey.grounded = false; turkey.coyoteTimer = 0; turkey.squashX = 0.78; turkey.squashY = 1.28;
    particles.spawnDustPuff(turkey.x, turkey.y, -turkey.facing, 5); if (sound) sound.playJump();
  }

  turkey.fluttering = false;
  if (!turkey.grounded && turkey.vy > 20 && input.isJumpHeld() && turkey.flutterFuel > 0) {
    turkey.fluttering = true; turkey.flutterFuel = Math.max(0, turkey.flutterFuel - dt * 0.9);
    turkey.vy = Math.min(turkey.vy + PHYSICS.flutterGravity * dt, PHYSICS.maxFlutterFall);
    if (Math.random() < dt * 10) particles.spawnFeatherBurst(turkey.x, turkey.y - 20, 1, 0.25);
  } else {
    if (!input.isJumpHeld() && turkey.vy < -210) turkey.vy *= 0.86;
    turkey.vy = Math.min(turkey.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed);
  }

  const prevY = turkey.y;
  turkey.x = clamp(turkey.x + turkey.vx * dt, 70, course.lengthPx + 180);
  turkey.y += turkey.vy * dt; turkey.grounded = false;
  if (turkey.vy >= 0 && !input.isHideHeld()) {
    for (const p of course.platforms) {
      if (turkey.x + 18 > p.x && turkey.x - 18 < p.x + p.w && prevY <= p.y + 10 && turkey.y >= p.y) {
        turkey.y = p.y; if (turkey.vy > 240) { turkey.squashX = 1.22; turkey.squashY = 0.82; particles.spawnDustPuff(turkey.x, turkey.y, 0, 4); }
        turkey.vy = 0; turkey.grounded = true; break;
      }
    }
  }
  if (turkey.y >= GROUND_Y) {
    if (prevY < GROUND_Y - 12 && turkey.vy > 240) { turkey.squashX = 1.24; turkey.squashY = 0.8; particles.spawnDustPuff(turkey.x, GROUND_Y, 0, 5); }
    turkey.y = GROUND_Y; turkey.vy = 0; turkey.grounded = true;
  }

  if (turkey.grounded && Math.abs(turkey.vx) > 25) {
    turkey.runCycle += dt * Math.abs(turkey.vx) * 0.045;
    if (Math.random() < dt * 7) particles.spawnDustPuff(turkey.x - turkey.facing * 14, turkey.y, -turkey.facing, 1);
  }

  for (const item of course.collectibles) {
    if (item.collected || Math.hypot(turkey.x - item.x, turkey.y - 30 - item.y) >= item.radius + 30) continue;
    item.collected = true;
    if (item.kind === 'corn') { stats.cornCollected += 1; const pts = 50 * stats.combo; stats.score += pts; particles.spawnCallout(item.x, item.y - 16, `+${pts}`, '#ffe27a', 0.85); }
    else if (item.kind === 'acorn') { turkey.acorns = Math.min(turkey.maxAcorns, turkey.acorns + 2); stats.score += 40; particles.spawnCallout(item.x, item.y - 16, '+2 ACORNS', '#e8b97b', 0.9); }
    else if (item.kind === 'golden_feather') { stats.goldenFeathers += 1; const pts = 250 * stats.combo; stats.score += pts; particles.spawnFeatherBurst(item.x, item.y, 12, 1.0); particles.spawnCallout(item.x, item.y - 24, `GOLDEN PLUME! +${pts}`, '#fff08a', 1.15); }
    else if (item.kind === 'berry_tart') { turkey.lives = Math.min(turkey.maxLives, turkey.lives + 1); stats.score += 150; particles.spawnCallout(item.x, item.y - 20, '+1 HEART!', '#ff8c9e', 1.1); }
    if (sound) sound.playCollect(item.kind);
  }
}
