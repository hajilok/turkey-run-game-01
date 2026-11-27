// Featherbreak main bootstrap: fixed-timestep simulation, camera tracking, hitstop, stage transitions, and rendering pipeline.

import { COURSE_LENGTH_PX, FIXED_DT, GROUND_Y, PIXELS_PER_METER, TOTAL_DISTANCE_METERS, VIEW_HEIGHT, VIEW_WIDTH, clamp } from './config.js';
import { createInputManager } from './input.js';
import { createSoundEngine } from './audio/sound-engine.js';
import { buildEscapeCourse, getStageAtX } from './world/stages.js';
import { spawnCarvingKnife, updateOvensAndKnives } from './world/hazards.js';
import { createTurkey, updateTurkeyMovement } from './entities/turkey.js';
import { createFarmerBarnaby, updateFarmerAI } from './entities/farmer-ai.js';
import { createParticleSystem } from './entities/particles.js';
import { addComboScore, computeEscapeRank, createRunStats, evaluateMedals, loadBestRecord, saveRunRecord, tickComboTimer } from './systems/progression.js';
import { parseShotQuery, stageCaptureShot } from './systems/shots.js';
import { drawCaughtEndScreen, drawEscapedEndScreen, drawGameplayHud, drawPauseOverlay, drawTitleOverlay } from './render/ui-renderer.js';
import { renderAutumnBackdrop } from './render/backdrop-renderer.js';
import { drawAcornDecoyArc, drawFarmerBarnaby, drawTurkeyPippin } from './render/characters-renderer.js';
import { drawCarvingKnife, drawChoppingCleaver, drawGravySpill, drawHangingCopperPot, drawRoastingOven } from './render/hazards-renderer.js';
import { drawAcornProjectiles, drawCollectibles, drawFreedomGate, drawHidingCover, drawPlatforms } from './render/props-renderer.js';

export function createGameState(seed = 1, mode = 'story') {
  const particles = createParticleSystem(); particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0);
  return { screen: 'title', mode, seed, time: 0, cameraX: 0, hitstopTimer: 0, lastStageIndex: 0, stageBannerTimer: 0, stageBannerText: '', kitchenVolleyTimer: 3.4, course: buildEscapeCourse(seed), turkey: createTurkey(260), farmer: createFarmerBarnaby(-90), particles, stats: createRunStats(), bestRecord: loadBestRecord(), endSummary: null, sound: createSoundEngine(), frozenShot: false };
}
export function startNewRun(state, nextSeed = null) {
  state.seed = nextSeed ?? ((state.seed % 997) + 1);
  const p = createParticleSystem(); p.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0);
  Object.assign(state, { course: buildEscapeCourse(state.seed), turkey: createTurkey(260), farmer: createFarmerBarnaby(-90), particles: p, stats: createRunStats(), cameraX: 0, hitstopTimer: 0, lastStageIndex: 0, stageBannerText: 'STAGE 1 · GOLDEN FARMYARD', stageBannerTimer: 2.4, kitchenVolleyTimer: 3.2, endSummary: null, screen: 'playing', frozenShot: false });
  state.sound.playGobble(1.05);
}

export function stepGameSimulation(state, input, dt) {
  state.time += dt;
  if (input.wasPressed('KeyM')) state.sound.toggleMute();

  if (state.screen === 'title') {
    state.sound.updateAdaptiveMusic(dt, 'title');
    if (!state.frozenShot) {
      state.turkey.x += 92 * dt; state.turkey.runCycle += dt * 7;
      state.farmer.x = state.turkey.x - 310; state.farmer.strideCycle += dt * 5.8; state.farmer.state = 'patrol';
      if (state.turkey.x > 2600) { state.turkey.x = 320; state.farmer.x = 10; }
      state.cameraX = Math.max(0, state.turkey.x - 760);
      state.particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, 0);
    }
    const clk = input.consumeClickedButton();
    if (clk?.id === 'play' || input.wasPressed('Space') || input.wasPressed('Enter')) startNewRun(state, 1);
    else if (clk?.id === 'mode_story') state.mode = 'story';
    else if (clk?.id === 'mode_endless') state.mode = 'endless';
    return;
  }

  if (state.screen === 'paused') {
    const clk = input.consumeClickedButton();
    if (clk?.id === 'resume' || input.wasPressed('Escape') || input.wasPressed('KeyP')) state.screen = 'playing';
    else if (clk?.id === 'restart') startNewRun(state);
    else if (clk?.id === 'mute') state.sound.toggleMute();
    else if (clk?.id === 'title') state.screen = 'title';
    return;
  }

  if (state.screen === 'escaped' || state.screen === 'caught') {
    state.sound.updateAdaptiveMusic(dt, state.screen === 'escaped' ? 'victory' : 'caught');
    if (!state.frozenShot) state.particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, state.screen === 'escaped' ? 0 : 3);
    const clk = input.consumeClickedButton();
    if (clk?.id === 'restart' || input.wasPressed('Space') || input.wasPressed('Enter') || input.wasPressed('KeyR')) startNewRun(state);
    else if (clk?.id === 'title') state.screen = 'title';
    return;
  }

  const hudBtn = input.consumeClickedButton();
  if (hudBtn?.id === 'mute') state.sound.toggleMute();
  else if (hudBtn?.id === 'pause' || input.wasPressed('Escape') || input.wasPressed('KeyP')) { state.screen = 'paused'; return; }
  if (state.frozenShot) return;
  if (state.hitstopTimer > 0) { state.hitstopTimer = Math.max(0, state.hitstopTimer - dt); return; }

  const { turkey, farmer, course, particles, stats, sound } = state;
  const stage = getStageAtX(turkey.x);
  if (stage.index !== state.lastStageIndex) {
    state.lastStageIndex = stage.index;
    state.stageBannerText = `STAGE ${stage.index + 1} · ${stage.name.toUpperCase()}`; state.stageBannerTimer = 2.6;
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, stage.index);
    particles.spawnCallout(turkey.x, turkey.y - 95, `${stage.name.toUpperCase()}! +200`, '#ffe57a', 1.2);
    stats.score += 200; sound.playCloseCall(3);
  }
  if (state.stageBannerTimer > 0) state.stageBannerTimer = Math.max(0, state.stageBannerTimer - dt);
  sound.updateAdaptiveMusic(dt, stage.index === 3 ? 'kitchen' : farmer.state === 'chase' || farmer.state === 'lunge' ? 'chase' : 'explore');

  const onHit = (src, kvx, kvy) => {
    if (turkey.invulnTimer > 0 || turkey.dashTimer > 0) return;
    turkey.lives -= 1; turkey.invulnTimer = 1.45; turkey.vx = kvx; turkey.vy = kvy; turkey.grounded = false;
    turkey.squashX = 1.3; turkey.squashY = 0.72; stats.combo = 1; stats.comboTimer = 0; state.hitstopTimer = 0.065;
    particles.spawnFeatherBurst(turkey.x, turkey.y - 32, 16, 1.15); particles.triggerShake(9, 0.25); particles.triggerFlash('#ff4526', 0.34);
    particles.spawnCallout(turkey.x, turkey.y - 68, 'FEATHERS FLYING!', '#ff8466', 1.15); sound.playHit();
    if (turkey.lives <= 0) finalizeRun(state, false, src);
  };
  const onClose = (x, y, label = 'CLOSE SHAVE!') => {
    if (turkey.closeCallTimer > 0) return;
    turkey.closeCallTimer = 0.48; stats.closeCalls += 1;
    particles.spawnCallout(x, y, `${label} +${addComboScore(stats, 150, true)}`, '#ffe27a', 1.1); sound.playCloseCall(stats.combo);
  };

  stats.elapsedSec += dt; tickComboTimer(stats, dt);
  updateTurkeyMovement(turkey, input, course, state.cameraX, dt, particles, sound, stats);
  updateFarmerAI(farmer, turkey, course, stage, dt, particles, sound, stats, onHit, onClose);
  updateOvensAndKnives(course, turkey, farmer, dt, particles, sound, stats, onHit, onClose);

  if (stage.index >= 2) {
    state.kitchenVolleyTimer -= dt;
    if (state.kitchenVolleyTimer <= 0) {
      state.kitchenVolleyTimer = stage.index === 3 ? 2.5 : 3.6;
      spawnCarvingKnife(course, state.cameraX + VIEW_WIDTH - 36, GROUND_Y - (Math.sin(state.time * 3.1) > 0 ? 155 : 58), -(440 + stage.index * 32), -14, 'volley');
      sound.playKnifeThrow();
    }
  }

  const targetPanic = farmer.state === 'chase' || farmer.state === 'lunge' ? clamp(1 - Math.abs(turkey.x - farmer.x) / 520, 0.35, 1) : 0.1;
  turkey.panicLevel += (targetPanic - turkey.panicLevel) * Math.min(1, dt * 6);

  if (turkey.x > stats.maxDistancePx) {
    const gm = Math.floor(turkey.x / PIXELS_PER_METER) - Math.floor(stats.maxDistancePx / PIXELS_PER_METER);
    if (gm > 0) { stats.score += gm * 2; stats.distanceMeters = Math.max(stats.distanceMeters, Math.floor(turkey.x / PIXELS_PER_METER)); }
    stats.maxDistancePx = turkey.x;
  }

  const targetCam = clamp(turkey.x - VIEW_WIDTH * 0.42 + turkey.facing * 60, 0, COURSE_LENGTH_PX - VIEW_WIDTH + 240);
  state.cameraX += (targetCam - state.cameraX) * Math.min(1, dt * 7.5);
  particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, stage.index);

  if (turkey.x >= COURSE_LENGTH_PX) {
    if (state.mode === 'endless') {
      stats.loopCount += 1; stats.score += 1000; state.course = buildEscapeCourse(state.seed + stats.loopCount * 17);
      turkey.x = 240; farmer.x = -120; stats.maxDistancePx = 240; state.cameraX = 0; state.lastStageIndex = 0;
      particles.spawnCallout(turkey.x, turkey.y - 80, `LOOP ${stats.loopCount + 1}! +1000`, '#ffe56b', 1.3); sound.playVictory();
    } else finalizeRun(state, true);
  }
}

export function renderGameFrame(ctx, state, input) {
  const { turkey, farmer, course, particles } = state;
  const stage = getStageAtX(turkey.x);
  const shake = particles.getShakeOffset();

  ctx.save(); ctx.translate(shake.x, shake.y);
  renderAutumnBackdrop(ctx, state.cameraX, state.time, turkey.x);
  drawFreedomGate(ctx, course, state.cameraX, state.time);
  drawPlatforms(ctx, course, state.cameraX);
  drawGravySpill(ctx, course, state.cameraX, state.time);
  drawCollectibles(ctx, course, state.cameraX, state.time);
  drawHangingCopperPot(ctx, course, state.cameraX);

  let ovenFireGlow = 0;
  for (const oven of course.ovens) {
    drawRoastingOven(ctx, oven, state.cameraX, state.time);
    if (oven.state === 'blast') { const d = Math.hypot(turkey.x - oven.x, turkey.y - oven.y); if (d < 280) ovenFireGlow = Math.max(ovenFireGlow, 1 - d / 280); }
  }
  for (const cl of course.cleavers) drawChoppingCleaver(ctx, cl, state.cameraX, state.time);
  drawHidingCover(ctx, course, turkey, state.cameraX, state.time);
  drawFarmerBarnaby(ctx, farmer, state.cameraX, state.time);
  drawTurkeyPippin(ctx, turkey, state.cameraX, state.time, state.screen === 'escaped', ovenFireGlow);
  for (const knife of course.knives) drawCarvingKnife(ctx, knife, state.cameraX, state.time);
  drawAcornProjectiles(ctx, course, state.cameraX);
  if (state.screen === 'playing') drawAcornDecoyArc(ctx, turkey, input, state.cameraX);
  particles.render(ctx, state.cameraX, stage.index);
  ctx.restore();

  if (state.screen === 'playing' && state.stageBannerTimer > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, state.stageBannerTimer / 0.6);
    ctx.fillStyle = 'rgba(34,16,9,0.88)'; ctx.beginPath(); ctx.roundRect(VIEW_WIDTH * 0.5 - 230, 114, 460, 46, 16); ctx.fill();
    ctx.strokeStyle = '#f5c258'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#ffe588'; ctx.font = '900 20px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(state.stageBannerText, VIEW_WIDTH * 0.5, 144); ctx.restore();
  }

  if (state.screen === 'title') drawTitleOverlay(ctx, state, input);
  else if (state.screen === 'playing') drawGameplayHud(ctx, state, input);
  else if (state.screen === 'paused') { drawGameplayHud(ctx, state, input); drawPauseOverlay(ctx, state, input); }
  else if (state.screen === 'escaped') drawEscapedEndScreen(ctx, state, input);
  else if (state.screen === 'caught') drawCaughtEndScreen(ctx, state, input);
}

export function bootstrapGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const input = createInputManager(canvas);
  const shotCfg = parseShotQuery();
  const state = createGameState(shotCfg ? shotCfg.seed : 1, 'story');
  input.onUserGesture = () => state.sound.unlock();

  if (shotCfg) {
    stageCaptureShot(state, shotCfg.shot);
    state.frozenShot = true;
    renderGameFrame(ctx, state, input);
    window.__FEATHERBREAK_READY__ = true;
    return;
  }

  let lastTs = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.05, Math.max(0, (now - lastTs) / 1000));
    lastTs = now;
    while (acc >= FIXED_DT) { stepGameSimulation(state, input, FIXED_DT); input.endFrame(FIXED_DT); acc -= FIXED_DT; }
    renderGameFrame(ctx, state, input);
    requestAnimationFrame(frame);
  }
  renderGameFrame(ctx, state, input);
  requestAnimationFrame(frame);
}

function finalizeRun(state, escaped, caughtBy = '') {
  state.screen = escaped ? 'escaped' : 'caught';
  const stage = getStageAtX(state.turkey.x);
  const m = state.mode === 'endless' ? state.stats.loopCount * TOTAL_DISTANCE_METERS + Math.floor(state.turkey.x / PIXELS_PER_METER) : escaped ? TOTAL_DISTANCE_METERS : Math.floor(state.turkey.x / PIXELS_PER_METER);
  state.stats.distanceMeters = Math.max(state.stats.distanceMeters, m);
  if (escaped) state.stats.score += 1000 + state.turkey.lives * 300;
  const raw = { ...state.stats, escaped, livesRemaining: state.turkey.lives };
  state.endSummary = { ...raw, stageName: stage.name, caughtBy, rank: computeEscapeRank(raw), medals: evaluateMedals(raw) };
  state.bestRecord = saveRunRecord(state.endSummary);
  if (escaped) { state.particles.spawnFeatherBurst(state.turkey.x, state.turkey.y - 36, 20, 1.25); state.sound.playVictory(); }
  else { state.particles.triggerShake(10, 0.32); state.sound.playCaught(); }
}

bootstrapGame();
