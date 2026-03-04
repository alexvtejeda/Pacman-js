// renderer.js — Canvas 2D renderer for maze and Player/Missile sprites
// Atari native resolution: 160×192 (ANTIC mode 4, 2bpp)
// Canvas resolution: 480×576 (3× scale)

import { mem, ADDR } from './runtime.js';

const SCALE = 3;
const NATIVE_W = 160;
const NATIVE_H = 192;

let canvas, ctx;

export function initRenderer() {
  canvas = document.getElementById('screen');
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

// Atari color byte → CSS color string
// Atari color: [7:4] = hue (0-15), [3:1] = luminance (0-7), [0] = unused
const HUE_TABLE = [
  '#808080', '#a8a800', '#a84800', '#882800',  // 0-3 grey/olive/orange/brown
  '#c80000', '#e80080', '#c000c0', '#6000c0',  // 4-7 red/pink/purple/violet
  '#0000c8', '#0040c0', '#0080c0', '#00a0c0',  // 8-B blue/cyan variants
  '#00a840', '#00a800', '#508000', '#808000',  // C-F green/yellow-green
];

function atariColor(byte) {
  const hue = (byte >> 4) & 0x0F;
  const lum = (byte >> 1) & 0x07;
  // Parse base hue color and scale luminance
  const base = parseInt(HUE_TABLE[hue].slice(1), 16);
  const r = Math.min(255, ((base >> 16) & 0xFF) + lum * 20);
  const g = Math.min(255, ((base >>  8) & 0xFF) + lum * 20);
  const b = Math.min(255, ( base        & 0xFF) + lum * 20);
  return `rgb(${r},${g},${b})`;
}

// ─── Maze rendering ───────────────────────────────────────────────────────────
// ANTIC mode 4: 40 chars × 24 rows, each char is 8×8 pixels at 2bpp
// Color mapping: char bits 00→COLPF1, 01→COLPF0, 10→COLPF2, 11→COLPF3
// (simplified: use COLPF2 for wall, COLPF1 for dots, COLBK for background)

export function renderMaze() {
  const chbaseHigh = mem[ADDR.CHBASE];        // high byte written to $D409
  const charBase = (chbaseHigh << 8) & 0xFFFF;
  const mazeBase = ADDR.PACMAZ;

  const colBK  = atariColor(mem[ADDR.COLBK]);
  const colPF0 = atariColor(mem[ADDR.COLPF0]);
  const colPF1 = atariColor(mem[ADDR.COLPF1]);
  const colPF2 = atariColor(mem[ADDR.COLPF2]);
  const colPF3 = atariColor(mem[ADDR.COLPF3]);

  const colors = [colBK, colPF0, colPF1, colPF2, colPF3];

  for (let row = 0; row < 24; row++) {
    for (let col = 0; col < 40; col++) {
      const charIdx = mem[mazeBase + row * 40 + col];
      const bitmapBase = charBase + (charIdx & 0x7F) * 8;

      for (let line = 0; line < 8; line++) {
        const byte = mem[bitmapBase + line];
        for (let bit = 0; bit < 4; bit++) {
          // 2bpp: bits 7-6, 5-4, 3-2, 1-0 → pixel pairs
          const shift = 6 - bit * 2;
          const colorIdx = (byte >> shift) & 0x03;
          ctx.fillStyle = colors[colorIdx + 1]; // +1: 0→colPF0, 1→colPF1, etc.
          const px = (col * 4 + bit) * SCALE;
          const py = (row * 8 + line) * SCALE;
          ctx.fillRect(px, py, SCALE, SCALE);
        }
      }
    }
  }
}

// ─── Sprite (P/M) rendering ───────────────────────────────────────────────────
// PM base = $2800. Single-line resolution (double-line would be SIZEP bit).
// Player N data is at PMBASE + (N+1)*$100. Byte offset in page = scan line Y.
// Width is 8 pixels, positioned by HPOSP0-3.

export function renderSprites() {
  const pmBase = (mem[ADDR.PMBASE] << 8) & 0xFFFF;

  for (let p = 0; p < 4; p++) {
    const pageBase = pmBase + (p + 1) * 0x100; // players 0-3 occupy pages 1-4
    const hpos = mem[0xD000 + p];               // HPOSP0-3
    const color = atariColor(mem[0xD012 + p]);  // COLPM0-3

    // Scan the 256-byte page for the sprite bitmap
    for (let scanline = 0; scanline < 256; scanline++) {
      const byte = mem[pageBase + scanline];
      if (byte === 0) continue;

      // Draw 8 pixels at this scanline
      for (let bit = 7; bit >= 0; bit--) {
        if (byte & (1 << bit)) {
          const px = (hpos + (7 - bit) - 1) * SCALE; // HPOS is 1-based on Atari
          const py = scanline * SCALE;
          ctx.fillStyle = color;
          ctx.fillRect(px, py, SCALE, SCALE);
        }
      }
    }
  }
}

// ─── Collision detection ──────────────────────────────────────────────────────
// After rendering, check bounding boxes and update collision registers in mem[].

export function updateCollisions() {
  // Clear collision registers (HITCLR equivalent)
  for (let i = 0xD000; i <= 0xD00F; i++) mem[i] = 0;

  const pmBase = (mem[ADDR.PMBASE] << 8) & 0xFFFF;

  // Build bounding boxes for each player (ghosts 0-2, Pac-Man = 3)
  const boxes = [];
  for (let p = 0; p < 4; p++) {
    const pageBase = pmBase + (p + 1) * 0x100;
    const hpos = mem[0xD000 + p];
    let minY = 256, maxY = -1;
    for (let scanline = 0; scanline < 256; scanline++) {
      if (mem[pageBase + scanline]) {
        if (scanline < minY) minY = scanline;
        if (scanline > maxY) maxY = scanline;
      }
    }
    boxes.push({ x: hpos, y: minY, w: 8, h: maxY - minY + 1 });
  }

  const pac = boxes[3];

  // P0PL, P1PL, P2PL (player-to-player: Pac-Man vs each ghost)
  for (let g = 0; g < 3; g++) {
    const ghost = boxes[g];
    if (pac.x < ghost.x + ghost.w && pac.x + pac.w > ghost.x &&
        pac.y < ghost.y + ghost.h && pac.y + pac.h > ghost.y) {
      mem[0xD00C + g] = 0x08; // P0PL bit: player 3 (Pac-Man) hit player g
    }
  }
}

// ─── Main render call ─────────────────────────────────────────────────────────

export function render() {
  ctx.fillStyle = atariColor(mem[ADDR.COLBK]);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  renderMaze();
  renderSprites();
  updateCollisions();
}
