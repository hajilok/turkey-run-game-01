// Core game constants, autumn palette, stage progression metadata, 3 replay modes, and seeded PRNG.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const GROUND_Y = 588;
export const PIXELS_PER_METER = 12;
export const TOTAL_DISTANCE_METERS = 1200;
export const COURSE_LENGTH_PX = TOTAL_DISTANCE_METERS * PIXELS_PER_METER;
export const FIXED_DT = 1 / 60;

export const PHYSICS = {
  gravity: 1620, flutterGravity: 410, maxFallSpeed: 820, maxFlutterFall: 165,
  runAccel: 2680, airAccel: 1800, groundDrag: 11.5, airDrag: 3.0,
  maxRunSpeed: 382, dashSpeed: 745, dashDuration: 0.24, dashCooldown: 1.5,
  jumpVelocity: -655, hayBounceVelocity: -845, coyoteTime: 0.13, jumpBufferTime: 0.14, invulnDuration: 1.75,
  closeCallRadius: 72, closeCallCooldown: 0.44, acornSpeed: 780, acornGravity: 960,
};

export const STAGE_DEFINITIONS = [
  { id: 'farmyard', index: 0, name: 'Golden Farmyard', shortName: 'FARMYARD', startMeter: 0, endMeter: 300, skyTop: '#3e294a', skyMid: '#c45e36', skyLow: '#fbb24c', farmerSpeed: 294, knifeInterval: 3.1 },
  { id: 'barn', index: 1, name: 'Harvest Barn', shortName: 'BARN', startMeter: 300, endMeter: 600, skyTop: '#24120c', skyMid: '#562916', skyLow: '#8f4c24', farmerSpeed: 318, knifeInterval: 2.55 },
  { id: 'pantry', index: 2, name: 'Applewood Pantry', shortName: 'PANTRY', startMeter: 600, endMeter: 900, skyTop: '#221417', skyMid: '#502c25', skyLow: '#935232', farmerSpeed: 340, knifeInterval: 2.1 },
  { id: 'kitchen', index: 3, name: 'The Roasting Kitchen', shortName: 'KITCHEN', startMeter: 900, endMeter: 1200, skyTop: '#1d0d10', skyMid: '#521d15', skyLow: '#ad3f20', farmerSpeed: 364, knifeInterval: 1.72 },
];

export const REPLAY_MODES = [
  { id: 'story', label: 'STORY ESCAPE', desc: '4 Stages to Freedom (1,200m)', scoreMult: 1, speedMult: 1 },
  { id: 'endless', label: 'ENDLESS HARVEST', desc: 'Looping High-Score Chase', scoreMult: 1.25, speedMult: 1.05 },
  { id: 'frenzy', label: "CHEF'S FRENZY", desc: 'Turbo Kitchen · 2x Score', scoreMult: 2, speedMult: 1.2 },
];

export const AUTUMN_PALETTE = {
  inkDark: '#1e100a', inkWarm: '#3d1f11', parchment: '#fdf0d5', parchmentEdge: '#d9a45b',
  gold: '#f5b83d', goldBright: '#ffe57f', pumpkin: '#e56b1f', cranberry: '#b5282c',
  crimsonGlow: '#ff4b3a', copper: '#c96838', copperBright: '#f19b58', sage: '#537a43',
  forest: '#2b472b', barnRed: '#8f2920', ovenIron: '#2c2627', ovenEmber: '#ff6f1f',
  steelLight: '#eef3f7', steelMid: '#9aaab8', cream: '#fff8ea',
};

export function createSeededRng(seed = 1) {
  let s = (seed >>> 0) || 1;
  return function nextRandom() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getModeConfig(modeId) { return REPLAY_MODES.find((m) => m.id === modeId) || REPLAY_MODES[0]; }
export function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
