// Core game constants, autumn palette, stage progression metadata, and seeded PRNG.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const GROUND_Y = 602;
export const PIXELS_PER_METER = 12;
export const TOTAL_DISTANCE_METERS = 1200;
export const COURSE_LENGTH_PX = TOTAL_DISTANCE_METERS * PIXELS_PER_METER;
export const FIXED_DT = 1 / 60;

export const PHYSICS = {
  gravity: 1620, flutterGravity: 420, maxFallSpeed: 820, maxFlutterFall: 170,
  runAccel: 2600, airAccel: 1750, groundDrag: 11.5, airDrag: 3.0,
  maxRunSpeed: 375, dashSpeed: 740, dashDuration: 0.24, dashCooldown: 1.55,
  jumpVelocity: -645, coyoteTime: 0.12, jumpBufferTime: 0.13, invulnDuration: 1.45,
  closeCallRadius: 68, closeCallCooldown: 0.45, acornSpeed: 760, acornGravity: 980,
};

export const AUTUMN_PALETTE = {
  inkDark: '#23130c', inkWarm: '#3d1f11', parchment: '#fdf0d5', parchmentEdge: '#d9a45b',
  gold: '#f5b83d', goldBright: '#ffe27a', pumpkin: '#e56b1f', cranberry: '#b5282c',
  crimsonGlow: '#ff4b3a', copper: '#c96838', copperBright: '#f19b58', sage: '#537a43',
  forest: '#2b472b', barnRed: '#8f2920', ovenIron: '#2c2627', ovenEmber: '#ff6f1f',
  steelLight: '#eef3f7', steelMid: '#9aaab8', cream: '#fff8ea',
};

export const STAGE_DEFINITIONS = [
  { id: 'farmyard', index: 0, name: 'Golden Farmyard', shortName: 'FARMYARD', startMeter: 0, endMeter: 300, skyTop: '#4c324a', skyMid: '#be5a38', skyLow: '#f6a84c', farmerSpeed: 295, knifeInterval: 3.1 },
  { id: 'barn', index: 1, name: 'Harvest Barn', shortName: 'BARN', startMeter: 300, endMeter: 600, skyTop: '#2f1912', skyMid: '#5c2d19', skyLow: '#8f4b23', farmerSpeed: 318, knifeInterval: 2.55 },
  { id: 'pantry', index: 2, name: 'Applewood Pantry', shortName: 'PANTRY', startMeter: 600, endMeter: 900, skyTop: '#2a1a1c', skyMid: '#59332c', skyLow: '#9c5a37', farmerSpeed: 340, knifeInterval: 2.15 },
  { id: 'kitchen', index: 3, name: 'The Roasting Kitchen', shortName: 'KITCHEN', startMeter: 900, endMeter: 1200, skyTop: '#241214', skyMid: '#5a2118', skyLow: '#b54524', farmerSpeed: 362, knifeInterval: 1.75 },
];

export const REPLAY_MODES = [
  { id: 'story', label: 'STORY ESCAPE', desc: '4 Stages to Freedom (1,200m)' },
  { id: 'endless', label: 'ENDLESS HARVEST', desc: 'Looping High-Score Chase' },
];

export function createSeededRng(seed = 1) {
  let s = (seed >>> 0) || 1;
  return function nextRandom() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
