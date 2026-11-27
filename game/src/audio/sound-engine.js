// Procedural 100% offline Web Audio API synthesizer & adaptive harvest bluegrass soundtrack.

const NOISE_SEED = 0x5455524b;
const HARVEST_SCALE = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86];
const M = {
  title: { bpm: 102, lv: 0.085, sw: 0.14, bj: [62,0,66,69,74,0,69,66,67,0,71,74,71,0,69,66], bs: [38,0,0,0,45,0,0,0,43,0,0,0,45,0,40,0], sn: Array(16).fill(0) },
  explore: { bpm: 120, lv: 0.105, sw: 0.16, bj: [62,66,69,74,71,69,66,64,67,71,74,79,76,74,71,69], bs: [38,0,45,0,38,0,45,42,43,0,50,0,45,0,40,0], sn: [0,0,.25,0,0,0,.25,0,0,0,.25,0,0,0,.28,0] },
  chase: { bpm: 152, lv: 0.115, sw: 0.11, bj: [62,69,74,69,71,74,78,74,67,71,74,79,78,74,71,69], bs: [38,0,45,0,38,42,45,0,43,0,50,0,45,43,42,40], sn: [0,.35,.72,.25,0,.35,.78,.3,0,.35,.72,.25,.4,.35,.85,.45] },
  kitchen: { bpm: 164, lv: 0.118, sw: 0.1, bj: [74,71,69,74,78,74,71,69,79,76,74,71,74,78,81,76], bs: [38,45,38,45,42,45,40,45,43,50,43,50,45,43,42,40], sn: [.3,.4,.85,.35,.3,.45,.9,.4,.3,.4,.85,.35,.5,.45,.95,.55] },
  victory: { bpm: 112, lv: 0.08, sw: 0.14, bj: [74,0,78,81,86,0,81,78,79,0,83,81,78,0,74,0], bs: [38,0,0,0,45,0,0,0,43,0,0,0,45,0,38,0], sn: Array(16).fill(0) },
  caught: { bpm: 90, lv: 0, sw: 0, bj: Array(16).fill(0), bs: Array(16).fill(0), sn: Array(16).fill(0) },
};

export function createSoundEngine() { return new SoundEngine(); }
export function playTurkeyGobble(sound, pitchScale = 1) { if (sound) sound.playGobble(pitchScale); }
export function playKnifeWhoosh(sound) { if (sound) sound.playKnifeThrow(); }
export function playOvenFlameRoar(sound) { if (sound) sound.playOvenBurst(); }
export function playAutumnBanjoTrack(sound, dt, mode) { if (sound) sound.updateAdaptiveMusic(dt, mode); }

export class SoundEngine {
  constructor() {
    this.ctx = null; this.master = null; this.musicGain = null; this.sfxGain = null; this.noiseBuf = null;
    this.muted = false; this.unlocked = false; this.mode = 'title'; this.stepIndex = 0; this.stepTimer = 0;
  }

  unlock() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      if (!this.ctx) {
        this.ctx = new Ctx();
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-16, this.ctx.currentTime); comp.ratio.setValueAtTime(4, this.ctx.currentTime);
        this.master = this.ctx.createGain(); this.musicGain = this.ctx.createGain(); this.sfxGain = this.ctx.createGain();
        this.master.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
        this.musicGain.gain.setValueAtTime(0.1, this.ctx.currentTime); this.sfxGain.gain.setValueAtTime(0.62, this.ctx.currentTime);
        this.musicGain.connect(this.master); this.sfxGain.connect(this.master); this.master.connect(comp); comp.connect(this.ctx.destination);
        this.noiseBuf = buildNoiseBuffer(this.ctx);
      }
      this.unlocked = true;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return true;
    } catch { return false; }
  }

  setMuted(flag) { this.muted = Boolean(flag); if (this.ctx && this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.02); }
  toggleMute() { this.setMuted(!this.muted); return this.muted; }
  isMuted() { return this.muted; }
  ready() { return Boolean(!this.muted && this.ctx && this.unlocked && this.ctx.state !== 'closed'); }

  updateAdaptiveMusic(dt, mode = 'explore') {
    if (M[mode] && mode !== this.mode) { this.mode = mode; this.stepTimer = Math.min(this.stepTimer, 0.05); }
    if (!this.ready() || this.ctx.state !== 'running') return;
    const p = M[this.mode], now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(p.lv, now, 0.14);
    if (p.lv <= 0) return;
    const eighth = 60 / p.bpm / 2, len = eighth * ((this.stepIndex & 1) === 1 ? 1 - p.sw : 1 + p.sw);
    this.stepTimer += Math.min(dt, 0.1);
    if (this.stepTimer < len) return;
    this.stepTimer -= len;
    const i = this.stepIndex % 16, t = now + 0.015;
    if (p.bj[i] > 0) this._banjo(midiToHz(p.bj[i]), t, eighth * 1.35, i % 4 === 0 ? 0.55 : 0.4, this.musicGain);
    if (p.bs[i] > 0) this._bass(midiToHz(p.bs[i]), t, eighth * 1.85, 0.65, this.musicGain);
    if (p.sn[i] > 0) this._noise(t, 0.045, 2400, 1700, 2.2, 0.3 * p.sn[i], this.musicGain);
    this.stepIndex = (this.stepIndex + 1) % 16;
  }

  playJump() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.14, 'triangle', 270, 640, 0.25); this._noise(t, 0.11, 1300, 2400, 1.5, 0.15); }
  playFlutter() { if (this.ready()) this._noise(this.ctx.currentTime, 0.08, 1150, 2000, 1.7, 0.15); }
  playDash() { if (!this.ready()) return; const t = this.ctx.currentTime; this._noise(t, 0.22, 520, 2300, 1.1, 0.3); this._tone(t, 0.15, 'sawtooth', 220, 540, 0.11); }
  playHide() { if (!this.ready()) return; const t = this.ctx.currentTime; this._noise(t, 0.12, 1850, 2600, 1.6, 0.18); this._tone(t + 0.02, 0.11, 'sine', 165, 95, 0.15); }
  playAcornToss() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.06, 'triangle', 680, 1020, 0.18); this._tone(t + 0.03, 0.14, 'sine', 920, 540, 0.12); }
  playAcornHit() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.07, 'triangle', 1240, 860, 0.26); this._noise(t, 0.035, 2400, 3100, 1.0, 0.18); }
  playOvenWarn() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.06, 'square', 122, 88, 0.13); this._tone(t + 0.08, 0.06, 'square', 136, 92, 0.13); this._noise(t + 0.04, 0.38, 540, 2500, 2.0, 0.2); }
  playOvenBurst() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.36, 'sawtooth', 132, 48, 0.2); this._noise(t, 0.45, 1100, 260, 1.2, 0.36); }
  playOvenSlam() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.2, 'triangle', 148, 46, 0.38); this._tone(t, 0.24, 'square', 292, 232, 0.15); this._noise(t, 0.08, 920, 420, 1.3, 0.28); }
  playKnifeThrow() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.18, 'sine', 2680, 2820, 0.13); this._tone(t, 0.15, 'sine', 4020, 4180, 0.08); this._noise(t, 0.15, 3200, 1400, 3.0, 0.19); }
  playHit() { if (!this.ready()) return; const t = this.ctx.currentTime; this._tone(t, 0.17, 'triangle', 175, 56, 0.35); this._tone(t + 0.01, 0.22, 'sawtooth', 680, 410, 0.22); }

  playGobble(pitchScale = 1) {
    if (!this.ready()) return;
    const s = Math.max(0.6, Math.min(1.8, pitchScale));
    const t = this.ctx.currentTime;
    try {
      const osc = this.ctx.createOscillator(), lfo = this.ctx.createOscillator(), lg = this.ctx.createGain(), flt = this.ctx.createBiquadFilter(), env = this.ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(380 * s, t); osc.frequency.exponentialRampToValueAtTime(295 * s, t + 0.32);
      lfo.frequency.setValueAtTime(28 * Math.sqrt(s), t); lg.gain.setValueAtTime(98 * s, t);
      flt.type = 'bandpass'; flt.frequency.setValueAtTime(1040 * s, t); flt.Q.setValueAtTime(3.0, t);
      env.gain.setValueAtTime(0.001, t); env.gain.linearRampToValueAtTime(0.28, t + 0.025); env.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      lfo.connect(lg); lg.connect(osc.frequency); osc.connect(flt); flt.connect(env); env.connect(this.sfxGain);
      osc.start(t); lfo.start(t); osc.stop(t + 0.34); lfo.stop(t + 0.34);
    } catch {}
  }

  playPotBonk() {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    [345, 528, 786].forEach((f, i) => this._tone(t, 0.38 - i * 0.06, i === 0 ? 'triangle' : 'sine', f, f * 0.96, 0.24 / (i + 1)));
    this._tone(t + 0.06, 0.38, 'sawtooth', 460, 150, 0.14);
  }

  playSpottedAlert() {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    [74, 80, 81].forEach((n, i) => this._tone(t + i * 0.06, i === 2 ? 0.22 : 0.075, 'sawtooth', midiToHz(n) * 0.96, midiToHz(n), 0.22));
  }

  playCloseCall(combo = 1) {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    const idx = Math.max(0, Math.min(HARVEST_SCALE.length - 3, combo - 1));
    for (let i = 0; i < 3; i++) this._banjo(midiToHz(HARVEST_SCALE[idx + i]), t + i * 0.046, 0.25, 0.5, this.sfxGain);
  }

  playCollect(kind = 'corn') {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    if (kind === 'golden_feather') [78, 81, 86].forEach((n, i) => this._tone(t + i * 0.055, 0.22, 'triangle', midiToHz(n), midiToHz(n), 0.2));
    else if (kind === 'acorn') this._tone(t, 0.08, 'triangle', midiToHz(76), midiToHz(83), 0.2);
    else { this._tone(t, 0.09, 'sine', midiToHz(74), midiToHz(74), 0.22); this._tone(t + 0.05, 0.14, 'triangle', midiToHz(81), midiToHz(81), 0.2); }
  }

  playVictory() {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    [62, 66, 69, 71, 74, 78, 81].forEach((n, i) => this._banjo(midiToHz(n), t + i * 0.072, 0.28, 0.5, this.sfxGain));
    const ct = t + 0.54;
    [62, 66, 69, 74, 78, 86].forEach((n, i) => this._banjo(midiToHz(n), ct + i * 0.016, 0.72, 0.4, this.sfxGain));
    this._bass(midiToHz(38), ct, 0.75, 0.65, this.sfxGain);
  }

  playCaught() {
    if (!this.ready()) return;
    const t = this.ctx.currentTime;
    [69, 68, 67, 66].forEach((n, i) => { const f = midiToHz(n); this._tone(t + i * 0.22, i === 3 ? 0.52 : 0.2, 'sawtooth', f, i === 3 ? f * 0.87 : f, 0.2); });
    this._tone(t + 0.92, 0.32, 'sine', 1480, 1465, 0.2);
  }

  _banjo(freq, time, dur, vol, dest) {
    try {
      const osc = this.ctx.createOscillator(), flt = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time);
      flt.type = 'lowpass'; flt.frequency.setValueAtTime(Math.min(4000, freq * 6), time); flt.frequency.exponentialRampToValueAtTime(Math.max(400, freq * 1.5), time + dur * 0.65);
      g.gain.setValueAtTime(0.001, time); g.gain.linearRampToValueAtTime(vol, time + 0.006); g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(flt); flt.connect(g); g.connect(dest || this.sfxGain); osc.start(time); osc.stop(time + dur + 0.02);
    } catch {}
  }

  _bass(freq, time, dur, vol, dest) {
    try {
      const osc = this.ctx.createOscillator(), flt = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, time); flt.type = 'lowpass'; flt.frequency.setValueAtTime(340, time);
      g.gain.setValueAtTime(0.001, time); g.gain.linearRampToValueAtTime(vol, time + 0.01); g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(flt); flt.connect(g); g.connect(dest || this.sfxGain); osc.start(time); osc.stop(time + dur + 0.02);
    } catch {}
  }

  _tone(time, dur, type, f0, f1, peak) {
    try {
      const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(Math.max(20, f0), time);
      if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), time + dur);
      g.gain.setValueAtTime(0.001, time); g.gain.linearRampToValueAtTime(peak, time + 0.008); g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(g); g.connect(this.sfxGain); osc.start(time); osc.stop(time + dur + 0.02);
    } catch {}
  }

  _noise(time, dur, f0, f1, q, peak, dest) {
    if (!this.noiseBuf) return;
    try {
      const src = this.ctx.createBufferSource(), flt = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      src.buffer = this.noiseBuf; src.loop = true; flt.type = 'bandpass'; flt.frequency.setValueAtTime(f0, time);
      if (f1 !== f0) flt.frequency.exponentialRampToValueAtTime(f1, time + dur);
      flt.Q.setValueAtTime(q, time); g.gain.setValueAtTime(0.001, time); g.gain.linearRampToValueAtTime(peak, time + 0.01); g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      src.connect(flt); flt.connect(g); g.connect(dest || this.sfxGain); src.start(time); src.stop(time + dur + 0.02);
    } catch {}
  }
}

function midiToHz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
function buildNoiseBuffer(ctx) {
  try {
    const rate = ctx.sampleRate || 44100, len = Math.floor(rate * 1.4), buf = ctx.createBuffer(1, len, rate), ch = buf.getChannelData(0);
    let s = NOISE_SEED;
    for (let i = 0; i < len; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; ch[i] = (s / 0xffffffff) * 2 - 1; }
    return buf;
  } catch { return null; }
}
