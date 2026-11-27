// Pippin the Turkey controller: responsive run, jump + feather-flutter glide, bounce-hay launches, stealth cover, gobble-dash, and acorn toss.

import { GROUND_Y, PHYSICS, clamp } from '../config.js';
import { spawnAcornProjectile } from '../world/hazards.js';

export function createTurkey(startX = 240) {
  return { x: startX, y: GROUND_Y, vx: 0, vy: 0, w: 50, h: 58, facing: 1, grounded: true, coyoteTimer: 0, fluttering: false, flutterFuel: 1, dashTimer: 0, dashCooldown: 0, hidden: false, hideSpot: null, lives: 3, maxLives: 3, acorns: 4, maxAcorns: 6, invulnTimer: 0, closeCallTimer: 0, squashX: 1, squashY: 1, runCycle: 0, wingAngle: 0, panicLevel: 0, speech: '', speechTimer: 0, onGravy: false, tailGlow: 0 };
}

export function triggerGobbleDash(t, dirIn, p, snd) {
  if (t.dashCooldown > 0 || t.dashTimer > 0) return false;
  if (t.hidden) { t.hidden = false; if (t.hideSpot) t.hideSpot.occupied = false; t.hideSpot = null; }
  const dir = dirIn || t.facing;
  Object.assign(t, { facing: dir, dashTimer: PHYSICS.dashDuration, dashCooldown: PHYSICS.dashCooldown, vx: dir * PHYSICS.dashSpeed, vy: Math.min(t.vy, -95), squashX: 1.34, squashY: 0.74 });
  p.spawnFeatherBurst(t.x - dir * 16, t.y - 28, 10, 0.9); if (snd) { snd.playDash(); snd.playGobble(1.18); }
  return true;
}

export function toggleStealthCover(t, course, wantsHide, p, snd) {
  let spot = null;
  for (const s of course.hidingSpots) if (t.x >= s.x - 14 && t.x <= s.x + s.w + 14 && Math.abs(t.y - GROUND_Y) < 36) { spot = s; break; }
  if (wantsHide && spot && t.dashTimer <= 0) {
    if (!t.hidden) {
      t.hidden = true; t.hideSpot = spot; spot.occupied = true; spot.wiggle = 1; t.vx *= 0.2; t.x = spot.x + spot.w * 0.5;
      if (spot.kind === 'flour_sack') p.spawnFlourCloud(t.x, GROUND_Y - 38); else p.spawnDustPuff(t.x, GROUND_Y - 12, 0, 5);
      p.spawnCallout(t.x, spot.y - 18, 'HIDDEN!', '#a8f0a4', 0.95); if (snd) snd.playHide();
    } else { spot.occupied = true; t.hideSpot = spot; }
    return;
  }
  if (t.hidden) { if (t.hideSpot) t.hideSpot.occupied = false; t.hidden = false; t.hideSpot = null; }
}

export function computeAcornAimVelocity(t, tx, ty) {
  const ox = t.x + t.facing * 18, oy = t.y - 42, dx = tx - ox, dy = ty - oy, dist = Math.max(40, Math.hypot(dx, dy));
  const tm = Math.max(0.14, dist / clamp(dist * 2.1, 480, PHYSICS.acornSpeed));
  const vx = dx / tm, vy = (dy - 0.5 * PHYSICS.acornGravity * tm * tm) / tm, mag = Math.hypot(vx, vy), sc = mag > 0 ? Math.min(mag, 880) / mag : 1;
  return { originX: ox, originY: oy, vx: vx * sc, vy: vy * sc };
}

export function throwAcornDecoy(t, course, tx, ty, p, snd) {
  if (t.acorns <= 0) return false;
  t.acorns -= 1; t.facing = tx >= t.x ? 1 : -1;
  const aim = computeAcornAimVelocity(t, tx, ty);
  spawnAcornProjectile(course, aim.originX, aim.originY, aim.vx, aim.vy);
  t.squashX = 1.15; t.squashY = 0.88; p.spawnFeatherBurst(aim.originX, aim.originY, 3, 0.45); if (snd) snd.playAcornToss();
  return true;
}

export function updateTurkeyMovement(t, input, course, cameraX, dt, p, snd, stats) {
  const mv = input.getMoveX();
  if (t.invulnTimer > 0) t.invulnTimer = Math.max(0, t.invulnTimer - dt);
  if (t.dashCooldown > 0) t.dashCooldown = Math.max(0, t.dashCooldown - dt);
  if (t.closeCallTimer > 0) t.closeCallTimer = Math.max(0, t.closeCallTimer - dt);
  if (t.speechTimer > 0) t.speechTimer = Math.max(0, t.speechTimer - dt);
  t.squashX += (1 - t.squashX) * Math.min(1, dt * 14); t.squashY += (1 - t.squashY) * Math.min(1, dt * 14);
  for (const pl of course.platforms) if (pl.bounceAnim > 0) pl.bounceAnim = Math.max(0, pl.bounceAnim - dt * 5);

  toggleStealthCover(t, course, input.isHideHeld(), p, snd);
  if (input.consumeDashBuffer()) triggerGobbleDash(t, mv, p, snd);
  if (input.pointer.justClicked && !input.getHoveredButton()) throwAcornDecoy(t, course, cameraX + input.pointer.x, input.pointer.y, p, snd);

  if (t.hidden) {
    t.vx = 0; t.vy = 0; if (t.hideSpot) t.hideSpot.wiggle = Math.max(0, t.hideSpot.wiggle - dt * 2.5);
    if (input.consumeJumpBuffer()) {
      if (t.hideSpot) t.hideSpot.occupied = false;
      Object.assign(t, { hidden: false, hideSpot: null, vy: PHYSICS.jumpVelocity * 0.92, grounded: false, squashX: 0.78, squashY: 1.26, invulnTimer: Math.max(t.invulnTimer, 0.42) });
      if (snd) snd.playJump();
    }
    return;
  }

  t.onGravy = t.grounded && course.gravySpills.some((s) => t.x > s.x && t.x < s.x + s.w && Math.abs(t.y - GROUND_Y) < 12);
  if (t.dashTimer > 0) { t.dashTimer -= dt; if (Math.random() < dt * 36) p.spawnFeatherBurst(t.x - t.facing * 20, t.y - 26, 1, 0.35); }
  else {
    const ac = t.grounded ? (t.onGravy ? PHYSICS.runAccel * 0.48 : PHYSICS.runAccel) : PHYSICS.airAccel;
    const dr = t.grounded ? (t.onGravy ? 2.2 : PHYSICS.groundDrag) : PHYSICS.airDrag;
    const ms = t.onGravy ? PHYSICS.maxRunSpeed * 1.24 : PHYSICS.maxRunSpeed;
    if (mv) { t.facing = mv; t.vx = clamp(t.vx + mv * ac * dt, -ms, ms); } else { t.vx *= Math.max(0, 1 - dr * dt); if (Math.abs(t.vx) < 8) t.vx = 0; }
  }

  if (t.grounded) { t.coyoteTimer = PHYSICS.coyoteTime; t.flutterFuel = 1; } else if (t.coyoteTimer > 0) t.coyoteTimer = Math.max(0, t.coyoteTimer - dt);
  if (t.coyoteTimer > 0 && input.consumeJumpBuffer()) {
    Object.assign(t, { vy: PHYSICS.jumpVelocity, grounded: false, coyoteTimer: 0, squashX: 0.78, squashY: 1.28 });
    p.spawnDustPuff(t.x, t.y, -t.facing, 5); if (snd) snd.playJump();
  }

  t.fluttering = false;
  if (!t.grounded && t.vy > 20 && input.isJumpHeld() && t.flutterFuel > 0) {
    t.fluttering = true; t.flutterFuel = Math.max(0, t.flutterFuel - dt * 0.9); t.vy = Math.min(t.vy + PHYSICS.flutterGravity * dt, PHYSICS.maxFlutterFall);
    if (Math.random() < dt * 10) p.spawnFeatherBurst(t.x, t.y - 20, 1, 0.25);
  } else { if (!input.isJumpHeld() && t.vy < -210) t.vy *= 0.86; t.vy = Math.min(t.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed); }

  const py = t.y; t.x = clamp(t.x + t.vx * dt, 70, course.lengthPx + 180); t.y += t.vy * dt; t.grounded = false;
  if (t.vy >= 0 && !input.isHideHeld()) {
    for (const pl of course.platforms) {
      if (t.x + 18 > pl.x && t.x - 18 < pl.x + pl.w && py <= pl.y + 12 && t.y >= pl.y) {
        t.y = pl.y;
        if (pl.bounce) {
          Object.assign(t, { vy: PHYSICS.hayBounceVelocity, grounded: false, flutterFuel: 1, squashX: 0.72, squashY: 1.34 });
          pl.bounceAnim = 1; p.spawnDustPuff(t.x, pl.y, 0, 8); p.spawnCallout(t.x, pl.y - 36, 'HAY BOUNCE!', '#ffe57a', 0.95); if (snd) snd.playHayBounce();
        } else { if (t.vy > 240) { t.squashX = 1.22; t.squashY = 0.82; p.spawnDustPuff(t.x, t.y, 0, 4); } t.vy = 0; t.grounded = true; }
        break;
      }
    }
  }
  if (t.y >= GROUND_Y) { if (py < GROUND_Y - 12 && t.vy > 240) { t.squashX = 1.24; t.squashY = 0.8; p.spawnDustPuff(t.x, GROUND_Y, 0, 5); } t.y = GROUND_Y; t.vy = 0; t.grounded = true; }
  if (t.grounded && Math.abs(t.vx) > 25) { t.runCycle += dt * Math.abs(t.vx) * 0.045; if (Math.random() < dt * 7) p.spawnDustPuff(t.x - t.facing * 14, t.y, -t.facing, 1); }

  const mult = stats.scoreMult || 1;
  for (const it of course.collectibles) {
    if (it.collected || Math.hypot(t.x - it.x, t.y - 30 - it.y) >= it.radius + 30) continue;
    it.collected = true;
    if (it.kind === 'corn') { stats.cornCollected += 1; const pts = Math.round(50 * stats.combo * mult); stats.score += pts; p.spawnCallout(it.x, it.y - 16, `+${pts}`, '#ffe27a', 0.85); }
    else if (it.kind === 'acorn') { t.acorns = Math.min(t.maxAcorns, t.acorns + 2); stats.score += Math.round(40 * mult); p.spawnCallout(it.x, it.y - 16, '+2 ACORNS', '#e8b97b', 0.9); }
    else if (it.kind === 'golden_feather') { stats.goldenFeathers += 1; const pts = Math.round(250 * stats.combo * mult); stats.score += pts; p.spawnFeatherBurst(it.x, it.y, 12, 1); p.spawnCallout(it.x, it.y - 24, `GOLDEN PLUME! +${pts}`, '#fff08a', 1.15); }
    else if (it.kind === 'berry_tart') { t.lives = Math.min(t.maxLives, t.lives + 1); stats.score += Math.round(150 * mult); p.spawnCallout(it.x, it.y - 20, '+1 HEART!', '#ff8c9e', 1.1); }
    if (snd) snd.playCollect(it.kind);
  }
}
