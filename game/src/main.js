// Featherbreak main bootstrap: fixed-timestep simulation, 2.5D lighting & reflections pipeline, stage transitions, and 3 replay modes.

import { COURSE_LENGTH_PX, FIXED_DT, GROUND_Y, PIXELS_PER_METER, TOTAL_DISTANCE_METERS, VIEW_HEIGHT, VIEW_WIDTH, clamp, getModeConfig } from './config.js';
import { createInputManager } from './input.js';
import { createSoundEngine } from './audio/sound-engine.js';
import { buildEscapeCourse, getStageAtX } from './world/stages.js';
import { spawnCarvingKnife, updateOvensAndKnives } from './world/hazards.js';
import { createTurkey, updateTurkeyMovement } from './entities/turkey.js';
import { createFarmerBarnaby, updateFarmerAI } from './entities/farmer-ai.js';
import { createParticleSystem } from './entities/particles.js';
import { addComboScore, computeEscapeRank, createRunStats, evaluateMedals, loadBestRecord, saveRunRecord, tickComboTimer } from './systems/progression.js';
import { buildMaterialAtlas, fnt, drawRoundedRect as rr } from './render/textures.js';
import { createLightingEngine, renderDynamicLightMap, renderFloorReflections, renderForegroundParallax, renderVolumetricGodRays } from './render/lighting-engine.js';
import { drawCaughtEndScreen, drawEscapedEndScreen, drawGameplayHud, drawPauseOverlay, drawTitleOverlay } from './render/ui-renderer.js';
import { renderAutumnBackdrop } from './render/backdrop-renderer.js';
import { drawAcornDecoyArc, drawFarmerBarnaby, drawTurkeyPippin } from './render/characters-renderer.js';
import { drawCarvingKnife, drawChoppingCleaver, drawFlourClouds, drawGravySpill, drawHangingCopperPot, drawRoastingOven } from './render/hazards-renderer.js';
import { drawAcornProjectiles, drawCollectibles, drawFreedomGate, drawHidingCover, drawPlatforms } from './render/props-renderer.js';

export function createGameState(seed = 1, mode = 'story') {
  const particles = createParticleSystem(); particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0);
  const turkey = createTurkey(700), farmer = createFarmerBarnaby(340);
  Object.assign(farmer, { state: 'chase', speech: 'COME BACK, PLUMPSTER!', speechTimer: 9 });
  return { screen: 'title', mode, seed, time: 0, cameraX: 0, hitstopTimer: 0, lastStageIndex: 0, stageBannerTimer: 0, stageBannerText: '', kitchenVolleyTimer: 3.2, course: buildEscapeCourse(seed), turkey, farmer, particles, stats: createRunStats(getModeConfig(mode).scoreMult), bestRecord: loadBestRecord(), endSummary: null, sound: createSoundEngine(), atlas: null, lighting: null };
}

export function startNewRun(state, nextSeed = null) {
  state.seed = nextSeed ?? ((state.seed % 997) + 1);
  const p = createParticleSystem(); p.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, 0);
  Object.assign(state, { course: buildEscapeCourse(state.seed), turkey: createTurkey(260), farmer: createFarmerBarnaby(-90), particles: p, stats: createRunStats(getModeConfig(state.mode).scoreMult), cameraX: 0, hitstopTimer: 0, lastStageIndex: 0, stageBannerText: 'STAGE 1 · GOLDEN FARMYARD', stageBannerTimer: 2.4, kitchenVolleyTimer: 3.1, endSummary: null, screen: 'playing' });
  state.sound.playGobble(1.05);
}

export function stepGameSimulation(state, input, dt) {
  state.time += dt;
  if (input.wasPressed('KeyM')) state.sound.toggleMute();
  if (state.screen === 'title') {
    state.sound.updateAdaptiveMusic(dt, 'title');
    const t = state.turkey, f = state.farmer;
    t.x += 108 * dt; t.runCycle += dt * 7.8; t.vx = 280; t.panicLevel = 0.72; t.y = GROUND_Y - Math.max(0, Math.sin(state.time * 4.4)) * 46; t.grounded = t.y >= GROUND_Y - 2;
    Object.assign(f, { x: t.x - 320, strideCycle: f.strideCycle + dt * 6.5, state: 'chase', speech: 'COME BACK, PLUMPSTER!', speechTimer: 1 });
    const k = state.course.knives[0] || (spawnCarvingKnife(state.course, f.x + 150, GROUND_Y - 122, 260, -20, 'farmer'), state.course.knives[0]);
    k.telegraph = 0; k.x = f.x + 135 + ((state.time * 240) % 210); k.y = GROUND_Y - 118 - Math.sin(state.time * 5) * 18; k.angle = state.time * 10; k.trail = [{ x: k.x - 32, y: k.y + 4 }, { x: k.x - 16, y: k.y + 2 }, { x: k.x, y: k.y }];
    if (t.x > 2500) { t.x = 420; f.x = 100; }
    state.cameraX = Math.max(0, t.x - 760); state.particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, 0);
    const clk = input.consumeClickedButton();
    if (clk?.id === 'play' || input.wasPressed('Space') || input.wasPressed('Enter')) startNewRun(state, 1);
    else if (clk?.id?.startsWith('mode_')) state.mode = clk.id.slice(5);
    return;
  }
  if (state.screen === 'paused') {
    const clk = input.consumeClickedButton();
    if (clk?.id === 'resume' || input.wasPressed('Escape') || input.wasPressed('KeyP')) state.screen = 'playing';
    else if (clk?.id === 'restart') startNewRun(state); else if (clk?.id === 'mute') state.sound.toggleMute(); else if (clk?.id === 'title') state.screen = 'title';
    return;
  }
  if (state.screen === 'escaped' || state.screen === 'caught') {
    state.sound.updateAdaptiveMusic(dt, state.screen === 'escaped' ? 'victory' : 'caught');
    state.particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, state.screen === 'escaped' ? 0 : 3);
    const clk = input.consumeClickedButton();
    if (clk?.id === 'restart' || input.wasPressed('Space') || input.wasPressed('Enter') || input.wasPressed('KeyR')) startNewRun(state);
    else if (clk?.id === 'title') state.screen = 'title';
    return;
  }

  const hud = input.consumeClickedButton();
  if (hud?.id === 'mute') state.sound.toggleMute();
  else if (hud?.id === 'pause' || input.wasPressed('Escape') || input.wasPressed('KeyP')) { state.screen = 'paused'; return; }
  if (state.hitstopTimer > 0) { state.hitstopTimer = Math.max(0, state.hitstopTimer - dt); return; }

  const { turkey, farmer, course, particles, stats, sound } = state, mc = getModeConfig(state.mode), st = getStageAtX(turkey.x);
  if (st.index !== state.lastStageIndex) {
    state.lastStageIndex = st.index; state.stageBannerText = `STAGE ${st.index + 1} · ${st.name.toUpperCase()}`; state.stageBannerTimer = 2.6;
    particles.seedAmbient(VIEW_WIDTH, VIEW_HEIGHT, st.index); particles.spawnCallout(turkey.x, turkey.y - 142, `${st.name.toUpperCase()}! +200`, '#ffe57a', 1.2);
    stats.score += Math.round(200 * mc.scoreMult); sound.playCloseCall(3);
  }
  if (state.stageBannerTimer > 0) state.stageBannerTimer = Math.max(0, state.stageBannerTimer - dt);
  sound.updateAdaptiveMusic(dt, st.index === 3 ? 'kitchen' : farmer.state === 'chase' || farmer.state === 'lunge' ? 'chase' : 'explore');

  const onHit = (src, kvx, kvy) => {
    if (turkey.invulnTimer > 0 || turkey.dashTimer > 0) return;
    Object.assign(turkey, { lives: turkey.lives - 1, invulnTimer: 1.75, vx: kvx, vy: kvy, grounded: false, squashX: 1.3, squashY: 0.72 });
    stats.combo = 1; stats.comboTimer = 0; state.hitstopTimer = 0.065;
    particles.spawnFeatherBurst(turkey.x, turkey.y - 32, 16, 1.15); particles.triggerShake(9, 0.25); particles.triggerFlash('#ff4526', 0.34);
    particles.spawnCallout(turkey.x, turkey.y - 68, 'FEATHERS FLYING!', '#ff8466', 1.15); sound.playHit();
    if (turkey.lives <= 0) finalizeRun(state, false, src);
  };
  const onClose = (x, y, label = 'CLOSE SHAVE!') => {
    if (turkey.closeCallTimer > 0) return;
    turkey.closeCallTimer = 0.48; stats.closeCalls += 1;
    particles.spawnCallout(x, y - 74, `${label} +${addComboScore(stats, 150, true)}`, '#ffe27a', 1.1); sound.playCloseCall(stats.combo);
  };

  stats.elapsedSec += dt; tickComboTimer(stats, dt);
  updateTurkeyMovement(turkey, input, course, state.cameraX, dt, particles, sound, stats);
  updateFarmerAI(farmer, turkey, course, st, dt, particles, sound, stats, onHit, onClose, mc.speedMult);
  updateOvensAndKnives(course, turkey, farmer, dt, particles, sound, stats, onHit, onClose, mc.speedMult);

  if (st.index >= 2) {
    state.kitchenVolleyTimer -= dt * mc.speedMult;
    if (state.kitchenVolleyTimer <= 0) {
      state.kitchenVolleyTimer = st.index === 3 ? 3.1 : 4.3;
      spawnCarvingKnife(course, state.cameraX + VIEW_WIDTH - 36, GROUND_Y - (Math.sin(state.time * 3.1) > 0 ? 158 : 58), -(360 + st.index * 24) * mc.speedMult, -12, 'volley');
      sound.playKnifeThrow();
    }
  }

  turkey.panicLevel += ((farmer.state === 'chase' || farmer.state === 'lunge' ? clamp(1 - Math.abs(turkey.x - farmer.x) / 520, 0.35, 1) : 0.1) - turkey.panicLevel) * Math.min(1, dt * 6);
  if (turkey.x > stats.maxDistancePx) {
    const gm = Math.floor(turkey.x / PIXELS_PER_METER) - Math.floor(stats.maxDistancePx / PIXELS_PER_METER);
    if (gm > 0) { stats.score += Math.round(gm * 2 * mc.scoreMult); stats.distanceMeters = Math.max(stats.distanceMeters, Math.floor(turkey.x / PIXELS_PER_METER)); }
    stats.maxDistancePx = turkey.x;
  }
  state.cameraX += (clamp(turkey.x - VIEW_WIDTH * 0.42 + turkey.facing * 60, 0, COURSE_LENGTH_PX - VIEW_WIDTH + 340) - state.cameraX) * Math.min(1, dt * 7.5);
  particles.update(dt, state.cameraX, VIEW_WIDTH, VIEW_HEIGHT, st.index);

  if (turkey.x >= COURSE_LENGTH_PX) {
    if (state.mode === 'endless') {
      stats.loopCount += 1; stats.score += Math.round(1000 * mc.scoreMult); state.course = buildEscapeCourse(state.seed + stats.loopCount * 17);
      turkey.x = 240; farmer.x = -120; stats.maxDistancePx = 240; state.cameraX = 0; state.lastStageIndex = 0;
      particles.spawnCallout(turkey.x, turkey.y - 80, `LOOP ${stats.loopCount + 1}! +1000`, '#ffe56b', 1.3); sound.playVictory();
    } else finalizeRun(state, true);
  }
}

export function renderGameFrame(ctx, state, input) {
  const { turkey, farmer, course, particles, atlas, lighting } = state, st = getStageAtX(turkey.x), sh = particles.getShakeOffset();
  ctx.save(); ctx.translate(sh.x, sh.y);
  renderAutumnBackdrop(ctx, state.cameraX, state.time, turkey.x, atlas);
  renderFloorReflections(ctx, state, state.cameraX, state.time);
  drawFreedomGate(ctx, course, state.cameraX, state.time);
  drawPlatforms(ctx, course, state.cameraX, atlas);
  drawGravySpill(ctx, course, state.cameraX, state.time);
  drawCollectibles(ctx, course, state.cameraX, state.time);
  drawHangingCopperPot(ctx, course, state.cameraX);

  let fg = 0;
  for (const ov of course.ovens) { drawRoastingOven(ctx, ov, state.cameraX, state.time, atlas); if (ov.state === 'blast') { const d = Math.hypot(turkey.x - ov.x, turkey.y - ov.y); if (d < 280) fg = Math.max(fg, 1 - d / 280); } }
  for (const cl of course.cleavers) drawChoppingCleaver(ctx, cl, state.cameraX, state.time);
  drawHidingCover(ctx, course, turkey, state.cameraX, state.time, atlas);
  drawFarmerBarnaby(ctx, farmer, state.cameraX, state.time);
  drawTurkeyPippin(ctx, turkey, state.cameraX, state.time, state.screen === 'escaped', fg);
  for (const k of course.knives) drawCarvingKnife(ctx, k, state.cameraX, state.time);
  drawAcornProjectiles(ctx, course, state.cameraX);
  drawFlourClouds(ctx, course, state.cameraX, state.time);
  if (state.screen === 'playing') drawAcornDecoyArc(ctx, turkey, input, state.cameraX, course);
  particles.render(ctx, state.cameraX, st.index);
  if (lighting) renderDynamicLightMap(ctx, lighting, state, state.cameraX, st.index, state.time);
  renderVolumetricGodRays(ctx, state.cameraX, state.time, st.index);
  renderForegroundParallax(ctx, state.cameraX, state.time, st.index);
  ctx.restore();

  if (state.screen === 'playing' && state.stageBannerTimer > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, state.stageBannerTimer / 0.6);
    rr(ctx, 410, 108, 460, 44, 16, 'rgba(34,16,9,0.88)', '#f5c258', 3);
    ctx.fillStyle = '#ffe588'; ctx.font = fnt('900 19px'); ctx.textAlign = 'center'; ctx.fillText(state.stageBannerText, 640, 136); ctx.restore();
  }

  if (state.screen === 'title') drawTitleOverlay(ctx, state, input);
  else if (state.screen === 'playing') drawGameplayHud(ctx, state, input);
  else if (state.screen === 'paused') { drawGameplayHud(ctx, state, input); drawPauseOverlay(ctx, state, input); }
  else if (state.screen === 'escaped') drawEscapedEndScreen(ctx, state, input);
  else if (state.screen === 'caught') drawCaughtEndScreen(ctx, state, input);
}

export function bootstrapGame() {
  const canvas = document.getElementById('game-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d'), input = createInputManager(canvas), state = createGameState(1, 'story');
  state.atlas = buildMaterialAtlas(ctx); state.lighting = createLightingEngine();
  input.onUserGesture = () => state.sound.unlock();
  let lastTs = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.05, Math.max(0, (now - lastTs) / 1000)); lastTs = now;
    while (acc >= FIXED_DT) { stepGameSimulation(state, input, FIXED_DT); input.endFrame(FIXED_DT); acc -= FIXED_DT; }
    renderGameFrame(ctx, state, input); requestAnimationFrame(frame);
  }
  renderGameFrame(ctx, state, input); requestAnimationFrame(frame);
}

function finalizeRun(state, escaped, caughtBy = '') {
  state.screen = escaped ? 'escaped' : 'caught';
  const st = getStageAtX(state.turkey.x);
  const m = state.mode === 'endless' ? state.stats.loopCount * TOTAL_DISTANCE_METERS + Math.floor(state.turkey.x / PIXELS_PER_METER) : escaped ? TOTAL_DISTANCE_METERS : Math.floor(state.turkey.x / PIXELS_PER_METER);
  state.stats.distanceMeters = escaped && state.mode !== 'endless' ? TOTAL_DISTANCE_METERS : Math.max(state.stats.distanceMeters, m);
  if (escaped) {
    state.stats.score += Math.round((1000 + state.turkey.lives * 300) * (state.stats.scoreMult || 1));
    state.course.knives = []; state.course.acorns = [];
    Object.assign(state.turkey, { x: COURSE_LENGTH_PX + 150, y: GROUND_Y - 126, grounded: false, hidden: false, invulnTimer: 0, facing: 1, squashX: 1, squashY: 1, speech: 'FREE AT LAST!', speechTimer: 9 });
    Object.assign(state.farmer, { x: COURSE_LENGTH_PX - 38, state: 'stunned', stateTimer: 9, slipTilt: 0, speech: 'NEXT YEAR, TURKEY!', speechTimer: 9 });
    state.cameraX = COURSE_LENGTH_PX - VIEW_WIDTH + 305;
  }
  const raw = { ...state.stats, escaped, livesRemaining: state.turkey.lives };
  state.endSummary = { ...raw, stageName: st.name, caughtBy, rank: computeEscapeRank(raw), medals: evaluateMedals(raw) };
  state.bestRecord = saveRunRecord(state.endSummary);
  if (escaped) { state.particles.spawnFeatherBurst(state.turkey.x, state.turkey.y - 36, 22, 1.3); state.sound.playVictory(); }
  else { state.particles.triggerShake(10, 0.32); state.sound.playCaught(); }
}

bootstrapGame();
