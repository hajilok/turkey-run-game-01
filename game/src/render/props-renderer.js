// Interactive prop renderer: butcher-block counters, hiding covers (pumpkins, haystacks, flour sacks, copper pots), corn/acorn collectibles, and stage gates.

import { AUTUMN_PALETTE, GROUND_Y, VIEW_WIDTH } from '../config.js';

export function drawPlatforms(ctx, course, cameraX) {
  const ink = AUTUMN_PALETTE.inkDark;
  for (const p of course.platforms) {
    const sx = p.x - cameraX;
    if (sx + p.w < -60 || sx > VIEW_WIDTH + 60) continue;
    ctx.save();
    ctx.fillStyle = 'rgba(18,8,4,0.30)'; ctx.beginPath(); ctx.roundRect(sx + 4, p.y + 6, p.w, p.h, 8); ctx.fill();
    if (p.style === 'hay') {
      ctx.fillStyle = '#dfa232'; ctx.beginPath(); ctx.roundRect(sx, p.y, p.w, p.h + 10, 6); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
      ctx.strokeStyle = '#8b4d1d'; ctx.beginPath(); ctx.moveTo(sx + p.w * 0.25, p.y); ctx.lineTo(sx + p.w * 0.25, p.y + p.h + 10); ctx.moveTo(sx + p.w * 0.75, p.y); ctx.lineTo(sx + p.w * 0.75, p.y + p.h + 10); ctx.stroke();
    } else if (p.style === 'counter') {
      ctx.fillStyle = '#5c311b'; ctx.fillRect(sx + 10, p.y + p.h, 14, GROUND_Y - p.y - p.h); ctx.fillRect(sx + p.w - 24, p.y + p.h, 14, GROUND_Y - p.y - p.h);
      ctx.fillStyle = '#472413'; ctx.fillRect(sx + 16, p.y + p.h + 36, p.w - 32, 10);
      ctx.fillStyle = '#e7be84'; ctx.beginPath(); ctx.roundRect(sx, p.y, p.w, p.h, 6); ctx.fill(); ctx.fillStyle = '#f9dca8'; ctx.fillRect(sx + 6, p.y + 3, p.w - 12, 6);
      ctx.strokeStyle = 'rgba(130,74,34,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(sx + 18, p.y + 15); ctx.lineTo(sx + p.w - 18, p.y + 15); ctx.stroke();
      ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.strokeRect(sx, p.y, p.w, p.h);
    } else {
      ctx.fillStyle = p.style === 'shelf' ? '#9e5d33' : '#854d25'; ctx.beginPath(); ctx.roundRect(sx, p.y, p.w, p.h, 5); ctx.fill();
      ctx.fillStyle = '#bd7944'; ctx.fillRect(sx + 4, p.y + 3, p.w - 8, 5); ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawHidingCover(ctx, course, turkey, cameraX, time) {
  const ink = AUTUMN_PALETTE.inkDark;
  for (const spot of course.hidingSpots) {
    const sx = spot.x - cameraX;
    if (sx + spot.w < -60 || sx > VIEW_WIDTH + 60) continue;
    const occ = turkey.hidden && turkey.hideSpot === spot;
    const near = !turkey.hidden && Math.abs(turkey.x - (spot.x + spot.w * 0.5)) < spot.w * 0.65 && Math.abs(turkey.y - GROUND_Y) < 40;
    const wob = occ ? Math.sin(time * 16) * 2.2 : spot.wiggle * Math.sin(time * 28) * 3;
    const cx = sx + spot.w * 0.5;

    ctx.save();
    ctx.fillStyle = 'rgba(20,10,5,0.38)'; ctx.beginPath(); ctx.ellipse(cx, GROUND_Y + 2, spot.w * 0.52, 10, 0, 0, Math.PI * 2); ctx.fill();
    if (occ) {
      const aura = ctx.createRadialGradient(cx, spot.y + spot.h * 0.5, 14, cx, spot.y + spot.h * 0.5, spot.w * 1.05);
      aura.addColorStop(0, 'rgba(130,250,150,0.52)'); aura.addColorStop(0.55, 'rgba(92,224,120,0.22)'); aura.addColorStop(1, 'rgba(92,224,120,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cx, spot.y + spot.h * 0.5, spot.w * 1.05, 0, Math.PI * 2); ctx.fill();
    }
    ctx.translate(cx + wob, spot.y + spot.h);

    if (spot.kind === 'pumpkin') {
      ctx.fillStyle = '#476b2c'; ctx.beginPath(); ctx.moveTo(-6, -spot.h + 8); ctx.quadraticCurveTo(4, -spot.h - 14, 15, -spot.h - 8); ctx.lineTo(10, -spot.h + 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
      for (const rx of [-26, 26, -13, 13, 0]) {
        ctx.fillStyle = rx === 0 ? '#f07d24' : Math.abs(rx) === 13 ? '#e2681a' : '#c95214';
        ctx.beginPath(); ctx.ellipse(rx, -spot.h * 0.45, 22, spot.h * 0.46, 0, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2.6; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,228,150,0.34)'; ctx.beginPath(); ctx.ellipse(-6, -spot.h * 0.56, 9, 18, -0.2, 0, Math.PI * 2); ctx.fill();
    } else if (spot.kind === 'haystack') {
      ctx.fillStyle = '#dfa336'; ctx.beginPath(); ctx.roundRect(-spot.w * 0.5, -spot.h, spot.w, spot.h, 16); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = '#9c5c1d'; ctx.beginPath(); ctx.moveTo(-spot.w * 0.22, -spot.h); ctx.lineTo(-spot.w * 0.22, 0); ctx.moveTo(spot.w * 0.22, -spot.h); ctx.lineTo(spot.w * 0.22, 0); ctx.stroke();
    } else if (spot.kind === 'flour_sack') {
      ctx.fillStyle = '#efe2c6'; ctx.beginPath(); ctx.roundRect(-38, -spot.h + 14, 76, spot.h - 14, 20); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
      ctx.fillStyle = '#e2cfb0'; ctx.beginPath(); ctx.moveTo(-16, -spot.h + 16); ctx.lineTo(-24, -spot.h); ctx.lineTo(24, -spot.h); ctx.lineTo(16, -spot.h + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a33b2a'; ctx.font = '900 13px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FLOUR', 0, -spot.h * 0.36);
    } else if (spot.kind === 'copper_pot') {
      const lift = occ ? -14 : 0;
      const pg = ctx.createLinearGradient(-44, -spot.h, 44, 0);
      pg.addColorStop(0, '#f4a768'); pg.addColorStop(0.55, '#c9622d'); pg.addColorStop(1, '#783217');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(-42, -spot.h + 12, 84, spot.h - 12, 12); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.stroke();
      ctx.strokeStyle = '#f2c15c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(-43, -spot.h * 0.48, 8, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(43, -spot.h * 0.48, 8, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
      ctx.fillStyle = '#d97a42'; ctx.beginPath(); ctx.roundRect(-46, -spot.h + 4 + lift, 92, 13, 6); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#f5c65c'; ctx.beginPath(); ctx.arc(0, -spot.h - 1 + lift, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = '#c8342b'; ctx.beginPath(); ctx.roundRect(-spot.w * 0.5, -spot.h, spot.w, spot.h, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,225,0.42)';
      for (let gx = -spot.w * 0.5 + 8; gx < spot.w * 0.5; gx += 22) ctx.fillRect(gx, -spot.h + 4, 10, spot.h - 8);
      ctx.strokeStyle = ink; ctx.lineWidth = 2.8; ctx.strokeRect(-spot.w * 0.5, -spot.h, spot.w, spot.h);
    }

    if (occ) {
      const ey = spot.kind === 'copper_pot' ? -spot.h + 6 : -spot.h * 0.55;
      ctx.fillStyle = '#1b0d07'; ctx.beginPath(); ctx.roundRect(-27, ey - 12, 54, 24, 12); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-10, ey, 8.5, 0, Math.PI * 2); ctx.arc(10, ey, 8.5, 0, Math.PI * 2); ctx.fill();
      const lx = Math.sin(time * 2.5) * 2.2;
      ctx.fillStyle = '#1a0c06'; ctx.beginPath(); ctx.arc(-10 + lx, ey, 4, 0, Math.PI * 2); ctx.arc(10 + lx, ey, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f5b83d'; ctx.beginPath(); ctx.moveTo(-4, ey + 6); ctx.lineTo(4, ey + 6); ctx.lineTo(0, ey + 13); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1d6b2d'; ctx.beginPath(); ctx.roundRect(-58, -spot.h - 48, 116, 32, 16); ctx.fill();
      ctx.strokeStyle = '#a8ffad'; ctx.lineWidth = 2.8; ctx.stroke();
      ctx.fillStyle = '#efffef'; ctx.font = '900 16px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('HIDDEN!', 0, -spot.h - 26);
    } else if (near) {
      ctx.fillStyle = 'rgba(30,16,9,0.85)'; ctx.beginPath(); ctx.roundRect(-48, -spot.h - 36, 96, 24, 12); ctx.fill();
      ctx.strokeStyle = '#f5c258'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff1cb'; ctx.font = '800 12px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('[S] HIDE', 0, -spot.h - 20);
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
    ctx.save();
    ctx.translate(sx, item.baseY + Math.sin(time * 4.2 + item.bobOffset) * 5);

    if (item.kind === 'corn') {
      ctx.fillStyle = 'rgba(255,224,96,0.24)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(-0.28);
      ctx.fillStyle = '#f8c531';
      ctx.beginPath(); ctx.moveTo(0, -17); ctx.quadraticCurveTo(9, -12, 8, 6); ctx.quadraticCurveTo(0, 13, -8, 6); ctx.quadraticCurveTo(-9, -12, 0, -17); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.strokeStyle = 'rgba(175,108,18,0.55)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.moveTo(0, -15); ctx.lineTo(0, 8); ctx.stroke();
      ctx.fillStyle = '#538c34'; ctx.strokeStyle = ink; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-12, -2); ctx.quadraticCurveTo(-11, 14, 0, 15); ctx.quadraticCurveTo(-5, 6, -5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(12, -2); ctx.quadraticCurveTo(11, 14, 0, 15); ctx.quadraticCurveTo(5, 6, 5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (item.kind === 'acorn') {
      ctx.fillStyle = 'rgba(255,214,118,0.28)'; ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(0.18);
      const ng = ctx.createRadialGradient(-3, 2, 2, 0, 4, 13);
      ng.addColorStop(0, '#e39642'); ng.addColorStop(0.65, '#ad5e22'); ng.addColorStop(1, '#6e3310');
      ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(-10, -2); ctx.quadraticCurveTo(-10, 12, 0, 16); ctx.quadraticCurveTo(10, 12, 10, -2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = '#592c14'; ctx.beginPath(); ctx.ellipse(0, -4, 12, 7.5, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#47210e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -11); ctx.quadraticCurveTo(3, -17, 6, -16); ctx.stroke();
    } else if (item.kind === 'golden_feather') {
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
      g.addColorStop(0, 'rgba(255,246,150,0.90)'); g.addColorStop(1, 'rgba(255,195,55,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(Math.sin(time * 3) * 0.2 - 0.35);
      ctx.fillStyle = '#ffe566'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.quadraticCurveTo(15, -6, 6, 14); ctx.lineTo(0, 22); ctx.lineTo(-6, 14); ctx.quadraticCurveTo(-15, -6, 0, -22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6b3b0e'; ctx.lineWidth = 2.4; ctx.stroke();
    } else if (item.kind === 'berry_tart') {
      ctx.fillStyle = '#e5a458'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 2.3; ctx.stroke();
      ctx.fillStyle = '#d92938'; ctx.beginPath(); ctx.ellipse(0, 1, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

export function drawAcornProjectiles(ctx, course, cameraX) {
  for (const a of course.acorns) {
    ctx.save(); ctx.translate(a.x - cameraX, a.y); ctx.rotate(a.angle);
    ctx.fillStyle = '#c47228'; ctx.beginPath(); ctx.moveTo(-8, -1); ctx.quadraticCurveTo(-8, 10, 0, 13); ctx.quadraticCurveTo(8, 10, 8, -1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = AUTUMN_PALETTE.inkDark; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.fillStyle = '#592c14'; ctx.beginPath(); ctx.ellipse(0, -3, 10, 6, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

export function drawFreedomGate(ctx, course, cameraX, time) {
  for (const gate of course.stageGates) {
    const sx = gate.x - cameraX;
    if (sx < -220 || sx > VIEW_WIDTH + 220) continue;
    if (gate.kind === 'freedom_gate') {
      const g = ctx.createRadialGradient(sx + 40, GROUND_Y - 120, 20, sx + 40, GROUND_Y - 120, 280);
      g.addColorStop(0, 'rgba(255,244,178,0.92)'); g.addColorStop(0.5, 'rgba(255,190,78,0.38)'); g.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx + 40, GROUND_Y - 120, 280, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff5cc'; ctx.beginPath(); ctx.moveTo(sx - 56, GROUND_Y); ctx.lineTo(sx - 56, GROUND_Y - 180); ctx.arc(sx + 10, GROUND_Y - 180, 66, Math.PI, 0); ctx.lineTo(sx + 76, GROUND_Y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5c3018'; ctx.lineWidth = 14; ctx.stroke();
      const pulse = Math.sin(time * 4) * 3;
      ctx.fillStyle = '#2d5c2b'; ctx.beginPath(); ctx.roundRect(sx - 82, GROUND_Y - 294 + pulse, 184, 42, 10); ctx.fill();
      ctx.strokeStyle = '#f5c44c'; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.fillStyle = '#fff7da'; ctx.font = '900 20px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FREEDOM GATE!', sx + 10, GROUND_Y - 266 + pulse);
    } else {
      ctx.fillStyle = '#4e2715'; ctx.fillRect(sx - 18, 96, 36, GROUND_Y - 96);
      ctx.fillStyle = '#6d381d'; ctx.fillRect(sx - 11, 96, 10, GROUND_Y - 96);
      ctx.fillStyle = '#2b150c'; ctx.beginPath(); ctx.roundRect(sx - 104, 118, 208, 42, 10); ctx.fill();
      ctx.strokeStyle = '#f0a846'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffe599'; ctx.font = '800 15px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(gate.title, sx, 145);
    }
  }
}
