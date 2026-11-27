// Multi-stage course generator: Golden Farmyard -> Harvest Barn -> Applewood Pantry -> Roasting Kitchen -> Freedom Gate.

import { COURSE_LENGTH_PX, GROUND_Y, PIXELS_PER_METER, STAGE_DEFINITIONS, createSeededRng } from '../config.js';
import { createChoppingCleaver, createGravySpill, createHangingPot, createRoastingOven } from './hazards.js';

export function getStageAtX(worldX) {
  const meters = Math.max(0, worldX / PIXELS_PER_METER);
  for (let i = STAGE_DEFINITIONS.length - 1; i >= 0; i--) { if (meters >= STAGE_DEFINITIONS[i].startMeter) return STAGE_DEFINITIONS[i]; }
  return STAGE_DEFINITIONS[0];
}

export function createHidingSpot(x, kind, stageIndex) {
  const specs = { pumpkin: { w: 94, h: 78, label: 'PUMPKIN COVER' }, haystack: { w: 122, h: 92, label: 'HAY BALE' }, flour_sack: { w: 88, h: 82, label: 'FLOUR SACKS' }, copper_pot: { w: 92, h: 76, label: 'COPPER KETTLE' }, tablecloth: { w: 128, h: 88, label: 'TABLE DRAPE' } };
  const s = specs[kind] ?? specs.pumpkin;
  return { id: `hide_${Math.round(x)}`, x, y: GROUND_Y - s.h, w: s.w, h: s.h, kind, label: s.label, stageIndex, wiggle: 0, occupied: false, evadeAwarded: false };
}

export function createPlatform(x, y, w, h, style) { return { x, y, w, h, style }; }

export function createCollectible(x, y, kind) {
  return { x, y, baseY: y, kind, radius: kind === 'golden_feather' ? 20 : kind === 'berry_tart' ? 18 : 14, collected: false, bobOffset: (x * 0.013) % (Math.PI * 2) };
}

export function buildEscapeCourse(seed = 1) {
  const rng = createSeededRng(seed);
  const platforms = [], hidingSpots = [], ovens = [], cleavers = [], hangingPots = [], gravySpills = [], collectibles = [];
  const stageGates = [
    { x: 300 * PIXELS_PER_METER, stageIndex: 1, title: 'HARVEST BARN', kind: 'barn_door' },
    { x: 600 * PIXELS_PER_METER, stageIndex: 2, title: 'APPLEWOOD PANTRY', kind: 'pantry_arch' },
    { x: 900 * PIXELS_PER_METER, stageIndex: 3, title: 'THE ROASTING KITCHEN', kind: 'kitchen_doors' },
    { x: COURSE_LENGTH_PX, stageIndex: 4, title: 'FREEDOM GATE', kind: 'freedom_gate' },
  ];

  for (let s = 0; s < 4; s++) {
    const start = s * 300 * PIXELS_PER_METER, end = (s + 1) * 300 * PIXELS_PER_METER, step = s === 3 ? 460 : s === 2 ? 500 : 540;
    let cursor = start + (s === 0 ? 440 : 280), beat = 0;
    while (cursor < end - 300) {
      const x = cursor + (rng() - 0.5) * 65;
      const platStyle = s === 0 ? (beat % 2 === 0 ? 'hay' : 'fence') : s === 1 ? 'rafter' : s === 2 ? 'shelf' : 'counter';
      const platW = (s === 3 ? 190 : 165) + rng() * 60, platY = GROUND_Y - (beat % 2 === 0 ? 124 : 186);
      platforms.push(createPlatform(x - 30, platY, platW, 24, platStyle));
      for (let c = 0; c < 3; c++) collectibles.push(createCollectible(x + 10 + c * 48, platY - 40 - (c === 1 ? 18 : 0), 'corn'));

      const placeOven = (s === 0 && (beat === 2 || beat === 4)) || (s === 1 && beat % 2 === 1) || (s === 2 && beat % 2 === 1) || (s === 3 && beat % 2 === 0);
      const ovenX = x + (s === 3 ? 255 : 230);
      if ((beat % 2 === 0 || (s === 0 && beat === 1)) && !placeOven) {
        const hk = s === 0 ? (beat % 4 === 0 ? 'pumpkin' : 'haystack') : s === 1 ? 'haystack' : s === 2 ? 'flour_sack' : beat % 4 === 0 ? 'copper_pot' : 'tablecloth';
        hidingSpots.push(createHidingSpot(x + 175, hk, s));
      } else if (placeOven && s === 3) hidingSpots.push(createHidingSpot(x - 135, 'copper_pot', s));

      if (placeOven) ovens.push(createRoastingOven(ovenX, s, -1, rng() * 2.2));
      if ((s === 1 && beat % 3 === 1) || (s === 2 && beat % 2 === 0) || (s === 3 && beat % 2 === 1)) cleavers.push(createChoppingCleaver(x + 70, platY - 12, s, rng() * 2.5));
      if (beat % 2 === 1) hangingPots.push(createHangingPot(x + 140, s >= 2 ? 128 : 142, s <= 1 ? 'cider_bucket' : 'copper_pot'));
      if (s >= 2 && beat % 2 === 0) gravySpills.push(createGravySpill(x + 310, 118 + rng() * 32));
      if (beat % 2 === 0) collectibles.push(createCollectible(x + 215, GROUND_Y - 46, 'acorn'));
      if (beat === 3 || (s === 3 && beat === 4)) collectibles.push(createCollectible(x + platW * 0.5, platY - 72, 'golden_feather'));
      if (s === 2 && beat === 2) collectibles.push(createCollectible(x + platW * 0.45, platY - 58, 'berry_tart'));
      cursor += step; beat += 1;
    }
  }
  return { seed, lengthPx: COURSE_LENGTH_PX, platforms, hidingSpots, ovens, cleavers, hangingPots, gravySpills, collectibles, stageGates, knives: [], acorns: [], decoys: [] };
}
