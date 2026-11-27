// Run scoring, close-call combo tracking, mastery medals, escape rank grading, and safe persistence.

const STORAGE_KEY = 'featherbreak_records_v1';

export const MEDAL_CATALOG = [
  { id: 'unplucked', label: 'Unplucked', desc: 'Escape with all 3 hearts intact' },
  { id: 'close_shaver', label: 'Close Shaver', desc: 'Pull off 4+ Close-Call dodges' },
  { id: 'oven_slammer', label: 'Oven Slammer', desc: 'Slam a blazing oven door with an acorn' },
  { id: 'pot_bonker', label: 'Pot Bonker', desc: 'Drop a copper pot onto Farmer Barnaby' },
  { id: 'ghost_gobbler', label: 'Ghost Gobbler', desc: 'Slip past Barnaby while hidden in cover' },
  { id: 'golden_plume', label: 'Golden Plume', desc: 'Collect 3+ Golden Harvest Feathers' },
];

export function loadBestRecord() {
  const empty = { bestScore: 0, bestDistance: 0, bestRank: '-', escapes: 0, runs: 0, unlockedMedals: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw);
    return { bestScore: Number(p.bestScore) || 0, bestDistance: Number(p.bestDistance) || 0, bestRank: typeof p.bestRank === 'string' ? p.bestRank : '-', escapes: Number(p.escapes) || 0, runs: Number(p.runs) || 0, unlockedMedals: Array.isArray(p.unlockedMedals) ? p.unlockedMedals : [] };
  } catch { return empty; }
}

export function saveRunRecord(summary) {
  const prev = loadBestRecord(), ord = { S: 4, A: 3, B: 2, C: 1, '-': 0 };
  const next = {
    bestScore: Math.max(prev.bestScore, summary.score),
    bestDistance: Math.max(prev.bestDistance, summary.distanceMeters),
    bestRank: (ord[summary.rank] || 0) >= (ord[prev.bestRank] || 0) ? summary.rank : prev.bestRank,
    escapes: prev.escapes + (summary.escaped ? 1 : 0),
    runs: prev.runs + 1,
    unlockedMedals: Array.from(new Set([...prev.unlockedMedals, ...summary.medals.map((m) => m.id)])),
  };
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function computeEscapeRank(s) {
  if (!s.escaped) return s.distanceMeters >= 900 || s.score >= 3800 ? 'B' : 'C';
  let r = (s.score >= 5200 ? 3 : s.score >= 3600 ? 2 : 1) + (s.livesRemaining >= 3 ? 2 : s.livesRemaining >= 2 ? 1 : 0);
  if (s.closeCalls >= 4) r++;
  if (s.ovensSlammed + s.potsBonked >= 1) r++;
  if (s.elapsedSec <= 68) r++;
  return r >= 6 ? 'S' : r >= 4 ? 'A' : r >= 2 ? 'B' : 'C';
}

export function evaluateMedals(s) {
  const out = [];
  if (s.escaped && s.livesRemaining >= 3) out.push(MEDAL_CATALOG[0]);
  if (s.closeCalls >= 4) out.push(MEDAL_CATALOG[1]);
  if (s.ovensSlammed >= 1) out.push(MEDAL_CATALOG[2]);
  if (s.potsBonked >= 1) out.push(MEDAL_CATALOG[3]);
  if (s.stealthEvades >= 1) out.push(MEDAL_CATALOG[4]);
  if (s.goldenFeathers >= 3) out.push(MEDAL_CATALOG[5]);
  return out;
}

export function createRunStats() {
  return { score: 0, distanceMeters: 0, maxDistancePx: 0, combo: 1, comboTimer: 0, closeCalls: 0, cornCollected: 0, goldenFeathers: 0, ovensSlammed: 0, potsBonked: 0, stealthEvades: 0, timesSpotted: 0, elapsedSec: 0, loopCount: 0 };
}

export function addComboScore(stats, basePoints, bumpCombo = false) {
  if (bumpCombo) { stats.combo = Math.min(6, stats.combo + 1); stats.comboTimer = 4.6; }
  else if (stats.comboTimer > 0) stats.comboTimer = Math.min(4.6, stats.comboTimer + 0.9);
  const gained = Math.round(basePoints * stats.combo);
  stats.score += gained;
  return gained;
}

export function tickComboTimer(stats, dt) {
  if (stats.comboTimer > 0) { stats.comboTimer -= dt; if (stats.comboTimer <= 0) { stats.comboTimer = 0; stats.combo = 1; } }
}
