// Interactive 3D-beveled prop renderer: butcher-block counters, bounce-hay bales, hiding covers, golden collectibles, and arched Freedom Gate.

import { AUTUMN_PALETTE, GROUND_Y, VIEW_WIDTH } from '../config.js';
import { disc, ell, fnt, lgrad, rgrad, drawRoundedRect as rr } from './textures.js';

export function drawPlatforms(ctx, course, cameraX, atlas = null) {
  const ink = AUTUMN_PALETTE.inkDark;
  for (const p of course.platforms) {
    const sx = p.x - cameraX;
    if (sx + p.w < -60 || sx > VIEW_WIDTH + 60) continue;
    ctx.save(); rr(ctx, sx + 5, p.y + 8, p.w, p.h, 8, 'rgba(18,8,4,0.34)');
    if (p.style === 'bounce_hay') {
      const sq = p.bounceAnim * 9;
      rr(ctx, sx - sq * 0.5, p.y + sq, p.w + sq, p.h - sq, 10, '#e5a832', ink, 2.6);
      ctx.fillStyle = '#f9cc58'; ctx.fillRect(sx + 4, p.y + sq + 3, p.w - 8, 10);
      ctx.strokeStyle = '#8b4d1d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx + p.w * 0.28, p.y + sq); ctx.lineTo(sx + p.w * 0.28, p.y + p.h); ctx.moveTo(sx + p.w * 0.72, p.y + sq); ctx.lineTo(sx + p.w * 0.72, p.y + p.h); ctx.stroke();
      ctx.strokeStyle = '#fff5b8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx + p.w * 0.5 - 12, p.y + sq + 28); ctx.lineTo(sx + p.w * 0.5, p.y + sq + 16); ctx.lineTo(sx + p.w * 0.5 + 12, p.y + sq + 28); ctx.stroke();
    } else if (p.style === 'hay') {
      rr(ctx, sx, p.y, p.w, p.h + 10, 6, '#dfa232', ink, 2.6);
      ctx.strokeStyle = '#8b4d1d'; ctx.beginPath(); ctx.moveTo(sx + p.w * 0.25, p.y); ctx.lineTo(sx + p.w * 0.25, p.y + p.h + 10); ctx.moveTo(sx + p.w * 0.75, p.y); ctx.lineTo(sx + p.w * 0.75, p.y + p.h + 10); ctx.stroke();
    } else if (p.style === 'counter') {
      ctx.fillStyle = '#4e2715'; ctx.fillRect(sx + 10, p.y + p.h, 14, GROUND_Y - p.y - p.h); ctx.fillRect(sx + p.w - 24, p.y + p.h, 14, GROUND_Y - p.y - p.h);
      ctx.fillStyle = '#3b1c0e'; ctx.fillRect(sx + 16, p.y + p.h + 34, p.w - 32, 10);
      ctx.fillStyle = '#fae0ad'; ctx.beginPath(); ctx.moveTo(sx - 4, p.y); ctx.lineTo(sx + 8, p.y - 9); ctx.lineTo(sx + p.w - 8, p.y - 9); ctx.lineTo(sx + p.w + 4, p.y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
      rr(ctx, sx, p.y, p.w, p.h, 4, atlas ? atlas.butcherOak : '#e7be84', ink, 2.6);
      // Decorative cutting board & bowl accent on counter corner
      rr(ctx, sx + 14, p.y - 12, 34, 6, 2, '#9c5a2c', ink, 1.4);
    } else {
      rr(ctx, sx, p.y, p.w, p.h, 5, atlas ? atlas.wood : (p.style === 'shelf' ? '#9e5d33' : '#854d25'), ink, 2.5);
      ctx.fillStyle = 'rgba(255,224,166,0.28)'; ctx.fillRect(sx + 4, p.y + 3, p.w - 8, 5);
    }
    ctx.restore();
  }
}

export function drawHidingCover(ctx, course, turkey, cameraX, time, atlas = null) {
  const ink = AUTUMN_PALETTE.inkDark;
  for (const spot of course.hidingSpots) {
    const sx = spot.x - cameraX;
    if (sx + spot.w < -60 || sx > VIEW_WIDTH + 60) continue;
    const occ = turkey.hidden && turkey.hideSpot === spot;
    const near = !turkey.hidden && Math.abs(turkey.x - (spot.x + spot.w * 0.5)) < spot.w * 0.65 && Math.abs(turkey.y - GROUND_Y) < 40;
    const wob = occ ? Math.sin(time * 16) * 2.2 : spot.wiggle * Math.sin(time * 28) * 3, cx = sx + spot.w * 0.5;
    ctx.save(); ell(ctx, cx, GROUND_Y + 3, spot.w * 0.54, 10, 0, 'rgba(18,8,4,0.44)');
    if (occ) disc(ctx, cx, spot.y + spot.h * 0.5, spot.w * 1.15, rgrad(ctx, cx, spot.y + spot.h * 0.5, 14, cx, spot.y + spot.h * 0.5, spot.w * 1.15, [[0, 'rgba(135,255,155,0.60)'], [0.55, 'rgba(92,224,120,0.24)'], [1, 'rgba(92,224,120,0)']]));
    ctx.translate(cx + wob, spot.y + spot.h);

    if (spot.kind === 'pumpkin') {
      ctx.fillStyle = '#476b2c'; ctx.beginPath(); ctx.moveTo(-6, -spot.h + 8); ctx.quadraticCurveTo(4, -spot.h - 15, 16, -spot.h - 8); ctx.lineTo(10, -spot.h + 10); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.4; ctx.stroke();
      ctx.strokeStyle = '#5d8a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-4, -spot.h + 2); ctx.bezierCurveTo(-18, -spot.h - 14, -26, -spot.h + 2, -16, -spot.h + 8); ctx.stroke();
      for (const rx of [-26, 26, -13, 13, 0]) ell(ctx, rx, -spot.h * 0.45, 22, spot.h * 0.46, 0, rgrad(ctx, rx - 5, -spot.h * 0.62, 4, rx, -spot.h * 0.45, spot.h * 0.52, [[0, rx === 0 ? '#ffa23c' : '#f28226'], [1, Math.abs(rx) === 26 ? '#9e380d' : '#c95214']]), ink, 2.3);
      ell(ctx, -6, -spot.h * 0.58, 9, 18, -0.2, 'rgba(255,235,165,0.36)');
    } else if (spot.kind === 'haystack') {
      rr(ctx, -spot.w * 0.5, -spot.h, spot.w, spot.h, 16, '#dfa336', ink, 2.6);
      ctx.strokeStyle = '#9c5c1d'; ctx.beginPath(); ctx.moveTo(-spot.w * 0.22, -spot.h); ctx.lineTo(-spot.w * 0.22, 0); ctx.moveTo(spot.w * 0.22, -spot.h); ctx.lineTo(spot.w * 0.22, 0); ctx.stroke();
    } else if (spot.kind === 'flour_sack') {
      rr(ctx, -38, -spot.h + 14, 76, spot.h - 14, 20, atlas ? atlas.burlap : '#efe2c6', ink, 2.6);
      ctx.fillStyle = '#e2cfb0'; ctx.beginPath(); ctx.moveTo(-16, -spot.h + 16); ctx.lineTo(-24, -spot.h); ctx.lineTo(24, -spot.h); ctx.lineTo(16, -spot.h + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a33b2a'; ctx.font = fnt('900 13px'); ctx.textAlign = 'center'; ctx.fillText(spot.flourBurst ? 'POOF!' : 'FLOUR', 0, -spot.h * 0.36);
    } else if (spot.kind === 'copper_pot') {
      const lift = occ ? -14 : 0;
      rr(ctx, -42, -spot.h + 12, 84, spot.h - 12, 12, lgrad(ctx, -44, -spot.h, 44, 0, [[0, '#f8b97c'], [0.55, '#c9622d'], [1, '#783217']]), ink, 2.6);
      ctx.fillStyle = 'rgba(255,245,212,0.28)'; ctx.fillRect(-28, -spot.h + 18, 10, spot.h - 24);
      ctx.strokeStyle = '#f2c15c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-43, -spot.h * 0.48, 8, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(43, -spot.h * 0.48, 8, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      rr(ctx, -46, -spot.h + 4 + lift, 92, 13, 6, '#d97a42', ink, 2.4); disc(ctx, 0, -spot.h - 1 + lift, 8, '#f5c65c', ink, 2.2);
    } else {
      rr(ctx, -spot.w * 0.5, -spot.h, spot.w, spot.h, 8, '#c8342b', ink, 2.6);
      ctx.fillStyle = 'rgba(255,245,225,0.42)'; for (let gx = -spot.w * 0.5 + 8; gx < spot.w * 0.5; gx += 22) ctx.fillRect(gx, -spot.h + 4, 10, spot.h - 8);
    }

    if (occ) {
      const ey = spot.kind === 'copper_pot' ? -spot.h + 6 : -spot.h * 0.55, lx = Math.sin(time * 2.5) * 2.4;
      rr(ctx, -28, ey - 12, 56, 24, 12, '#1b0d07');
      disc(ctx, -10, ey, 8.8, '#fff'); disc(ctx, 10, ey, 8.8, '#fff'); disc(ctx, -10 + lx, ey, 4.2, '#1a0c06'); disc(ctx, 10 + lx, ey, 4.2, '#1a0c06');
      ctx.fillStyle = '#f5b83d'; ctx.beginPath(); ctx.moveTo(-4, ey + 6); ctx.lineTo(4, ey + 6); ctx.lineTo(0, ey + 13); ctx.closePath(); ctx.fill();
      rr(ctx, -58, -spot.h - 62, 116, 32, 16, '#1d6b2d', '#a8ffad', 2.8);
      ctx.fillStyle = '#efffef'; ctx.font = fnt('900 16px'); ctx.textAlign = 'center'; ctx.fillText('HIDDEN!', 0, -spot.h - 40);
    } else if (near) {
      rr(ctx, -48, -spot.h - 36, 96, 24, 12, 'rgba(30,16,9,0.85)', '#f5c258', 2);
      ctx.fillStyle = '#fff1cb'; ctx.font = fnt('800 12px'); ctx.textAlign = 'center'; ctx.fillText('[S] HIDE', 0, -spot.h - 20);
    }
    ctx.restore();
  }
}

export function drawCollectibles(ctx, course, cameraX, time) {
  const ink = AUTUMN_PALETTE.inkDark;
  for (const item of course.collectibles) {
    if (item.collected) continue;
    const sx = item.x - cameraX;
    if (sx < -60 || sx > VIEW_WIDTH + 60) continue;
    ctx.save(); ctx.translate(sx, item.baseY + Math.sin(time * 4.2 + item.bobOffset) * 5);
    if (item.kind === 'corn') {
      disc(ctx, 0, 0, 22, 'rgba(255,224,96,0.24)'); ctx.rotate(-0.28);
      ctx.fillStyle = '#f8c531'; ctx.beginPath(); ctx.moveTo(0, -17); ctx.quadraticCurveTo(9, -12, 8, 6); ctx.quadraticCurveTo(0, 13, -8, 6); ctx.quadraticCurveTo(-9, -12, 0, -17); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(175,108,18,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.moveTo(0, -15); ctx.lineTo(0, 8); ctx.stroke();
      ctx.fillStyle = '#538c34'; ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-11, 14, 0, 15); ctx.quadraticCurveTo(-5, 6, -5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -2); ctx.quadraticCurveTo(11, 14, 0, 15); ctx.quadraticCurveTo(5, 6, 5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (item.kind === 'acorn') {
      disc(ctx, 0, 0, 21, 'rgba(255,214,118,0.28)'); ctx.rotate(0.18);
      ctx.fillStyle = rgrad(ctx, -3, 2, 2, 0, 4, 13, [[0, '#e39642'], [0.65, '#ad5e22'], [1, '#6e3310']]);
      ctx.beginPath(); ctx.moveTo(-10, -2); ctx.quadraticCurveTo(-10, 12, 0, 16); ctx.quadraticCurveTo(10, 12, 10, -2); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#592c14'; ctx.beginPath(); ctx.ellipse(0, -4, 12, 7.5, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#47210e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -11); ctx.quadraticCurveTo(3, -17, 6, -16); ctx.stroke();
    } else if (item.kind === 'golden_feather') {
      disc(ctx, 0, 0, 34, rgrad(ctx, 0, 0, 4, 0, 0, 34, [[0, 'rgba(255,248,158,0.92)'], [1, 'rgba(255,195,55,0)']]));
      ctx.rotate(Math.sin(time * 3) * 0.2 - 0.35);
      ctx.fillStyle = '#ffe566'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(15, -6, 6, 14); ctx.lineTo(0, 22); ctx.lineTo(-6, 14); ctx.quadraticCurveTo(-15, -6, 0, -22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6b3b0e'; ctx.lineWidth = 2.2; ctx.stroke();
    } else if (item.kind === 'berry_tart') { ell(ctx, 0, 4, 16, 11, 0, '#e5a458', ink, 2.2); ell(ctx, 0, 1, 11, 7, 0, '#d92938'); }
    ctx.restore();
  }
}

export function drawAcornProjectiles(ctx, course, cameraX) {
  for (const a of course.acorns) {
    ctx.save(); ctx.translate(a.x - cameraX, a.y); ctx.rotate(a.angle);
    ctx.fillStyle = '#c47228'; ctx.beginPath(); ctx.moveTo(-8, -1); ctx.quadraticCurveTo(-8, 10, 0, 13); ctx.quadraticCurveTo(8, 10, 8, -1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#592c14'; ctx.beginPath(); ctx.ellipse(0, -3, 10, 6, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

export function drawFreedomGate(ctx, course, cameraX, time) {
  for (const gate of course.stageGates) {
    const sx = gate.x - cameraX;
    if (sx < -240 || sx > VIEW_WIDTH + 240) continue;
    if (gate.kind === 'freedom_gate') {
      disc(ctx, sx + 40, GROUND_Y - 120, 300, rgrad(ctx, sx + 40, GROUND_Y - 120, 20, sx + 40, GROUND_Y - 120, 300, [[0, 'rgba(255,248,188,0.94)'], [0.5, 'rgba(255,196,82,0.42)'], [1, 'rgba(255,180,60,0)']]));
      ctx.fillStyle = '#fff6cf'; ctx.beginPath(); ctx.moveTo(sx - 60, GROUND_Y); ctx.lineTo(sx - 60, GROUND_Y - 186); ctx.arc(sx + 10, GROUND_Y - 186, 70, Math.PI, 0); ctx.lineTo(sx + 80, GROUND_Y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5e3218'; ctx.lineWidth = 16; ctx.stroke(); ctx.strokeStyle = '#d99c4e'; ctx.lineWidth = 3; ctx.stroke();
      for (let k = -3; k <= 3; k++) disc(ctx, sx + 10 + k * 14, GROUND_Y - 252 + Math.abs(k) * 4, 8, k % 2 === 0 ? '#d94c24' : '#f2ad2e');
      const pulse = Math.sin(time * 4) * 3;
      rr(ctx, sx - 88, GROUND_Y - 306 + pulse, 196, 44, 12, '#245824', '#f8cb54', 3.5);
      ctx.fillStyle = '#fff8dc'; ctx.font = fnt('900 20px'); ctx.textAlign = 'center'; ctx.fillText('FREEDOM GATE!', sx + 10, GROUND_Y - 277 + pulse);
    } else {
      ctx.fillStyle = '#4e2715'; ctx.fillRect(sx - 18, 92, 36, GROUND_Y - 92); ctx.fillStyle = '#6d381d'; ctx.fillRect(sx - 11, 92, 10, GROUND_Y - 92);
      if (sx > 125 && sx < VIEW_WIDTH - 125) {
        rr(ctx, sx - 104, 166, 208, 42, 10, '#2b150c', '#f0a846', 3);
        ctx.fillStyle = '#ffe599'; ctx.font = fnt('800 15px'); ctx.textAlign = 'center'; ctx.fillText(gate.title, sx, 193);
      }
    }
  }
}
