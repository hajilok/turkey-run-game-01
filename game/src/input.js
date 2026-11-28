// Keyboard & mouse controller with jump buffering, pointer mapping, and clickable UI zones.

import { VIEW_WIDTH, VIEW_HEIGHT, clamp } from './config.js';

export function createInputManager(canvas) { return new InputManager(canvas); }
export function getMouseAimWorldPos(input, cameraX) { return { x: cameraX + input.pointer.x, y: input.pointer.y }; }
export function consumeDashOrHideAction(input) { return { dash: input.consumeDashBuffer(), hide: input.isHideHeld() }; }

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas; this.keys = new Set(); this.justPressed = new Set();
    this.pointer = { x: VIEW_WIDTH * 0.62, y: VIEW_HEIGHT * 0.55, down: false, justClicked: false, justRightClicked: false, active: false };
    this.jumpBufferTimer = 0; this.dashBuffered = false; this.uiButtons = []; this.onUserGesture = null;

    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => { this.keys.clear(); this.pointer.down = false; });
    canvas.addEventListener('mousemove', (e) => this.mapPointer(e));
    canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
    window.addEventListener('mouseup', () => { this.pointer.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleKeyDown(e) {
    const c = e.code;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) e.preventDefault();
    if (!this.keys.has(c)) {
      this.justPressed.add(c);
      if (c === 'Space' || c === 'KeyW' || c === 'ArrowUp') this.jumpBufferTimer = 0.13;
      if (c === 'ShiftLeft' || c === 'ShiftRight') this.dashBuffered = true;
    }
    this.keys.add(c);
    if (this.onUserGesture) this.onUserGesture();
  }

  mapPointer(e) {
    const r = this.canvas.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    this.pointer.x = clamp(((e.clientX - r.left) / r.width) * VIEW_WIDTH, 0, VIEW_WIDTH);
    this.pointer.y = clamp(((e.clientY - r.top) / r.height) * VIEW_HEIGHT, 0, VIEW_HEIGHT);
    this.pointer.active = true;
  }

  handlePointerDown(e) {
    this.mapPointer(e);
    if (this.onUserGesture) this.onUserGesture();
    if (e.button === 2) { this.pointer.justRightClicked = true; this.dashBuffered = true; }
    else if (e.button === 0) { this.pointer.down = true; this.pointer.justClicked = true; }
  }

  getMoveX() { return (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0); }
  isJumpHeld() { return this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp'); }
  isHideHeld() { return this._forceHideHeld || this.keys.has('KeyS') || this.keys.has('ArrowDown') || this.keys.has('KeyE'); }
  // Screenshot staging only: hold the turkey in cover without a key press.
  setForceHideHeld(v) { this._forceHideHeld = Boolean(v); }
  wasPressed(code) { return this.justPressed.has(code); }
  consumeJumpBuffer() { if (this.jumpBufferTimer > 0) { this.jumpBufferTimer = 0; return true; } return false; }
  consumeDashBuffer() { if (this.dashBuffered) { this.dashBuffered = false; return true; } return false; }
  setButtons(buttons) { this.uiButtons = buttons; }
  getHoveredButton() { return this.uiButtons.find((b) => this.pointer.x >= b.x && this.pointer.x <= b.x + b.w && this.pointer.y >= b.y && this.pointer.y <= b.y + b.h) || null; }
  consumeClickedButton() { if (!this.pointer.justClicked) return null; const h = this.getHoveredButton(); if (h) { this.pointer.justClicked = false; return h; } return null; }
  endFrame(dt) { this.justPressed.clear(); this.pointer.justClicked = false; this.pointer.justRightClicked = false; this.dashBuffered = false; if (this.jumpBufferTimer > 0) this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt); }
}
