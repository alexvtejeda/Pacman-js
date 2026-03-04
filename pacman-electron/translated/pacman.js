// pacman.js — Translated from PACMAN.ASM
// Entry point, zero-page init, VBLANK handler, DLI handlers, main LOOP.
//
// Translation note: This file is translated subroutine-by-subroutine from the
// original 6502 assembly. See TRANSLATION_GUIDE.md for the opcode→JS mapping.

import {
  cpu, mem, zp, setZP, readMem, writeMem,
  readAbsX, readAbsY, writeAbsX, writeAbsY,
  readIndY, writeIndY, readZPX,
  setNZ, setNZC, adc, sbc, and, ora, eor, bit, cmp,
  asl, lsr, rol, ror, inc, dec,
  push, pop, random, ADDR,
} from '../src/runtime.js';

import { VBSUBS, TUNNEL } from './pac1.js';
import { SETUP, NEWGAM, CLRAUD } from './pac2.js';
import { INITPM, P1INIT, SAVEP1, SAVEP2 } from './pac3.js';

// ─── VBLANK — vertical blank interrupt handler ────────────────────────────────
// Called every frame by gameloop.js at 60fps (instead of via NMI vector).
// Original: PACMAN.ASM line 545

export function VBLANK() {
  // LDA #0 / STA DLICNT
  mem[ADDR.DLICNT] = 0;
  // DEC BCOUNT
  mem[ADDR.BCOUNT] = (mem[ADDR.BCOUNT] - 1 + 256) & 0xFF;
  // JSR VBSUBS
  VBSUBS();
  // LDA ATSEQU / BNE VBEXIT
  if (mem[ADDR.ATSEQU] !== 0) return;
  // LDA VFREEZ / BNE VBEXIT
  if (mem[ADDR.VFREEZ] !== 0) return;
  // JSR TUNNEL
  TUNNEL();
  // VBEXIT: JMP XITVBV — handled by returning from this function
}

// ─── INIT — first-time initialization ────────────────────────────────────────
// TODO: Translate PACMAN.ASM INIT section
export function INIT() { /* TODO */ }

// ─── REINIT — new game setup ──────────────────────────────────────────────────
// TODO: Translate PACMAN.ASM REINIT section
export function REINIT() { /* TODO */ }

// ─── PACGAM — wait for RTCLOK tick then set display list ─────────────────────
// TODO: Translate PACMAN.ASM PACGAM section
export function PACGAM() { /* TODO */ }

// ─── LOOP — main game loop (runs continuously outside VBI) ───────────────────
// TODO: Translate PACMAN.ASM LOOP section
export function LOOP() { /* TODO */ }

// ─── DLIV — display list interrupt vector ────────────────────────────────────
// Updates color registers mid-screen. Called by renderer's DLI simulation.
// TODO: Translate PACMAN.ASM DLIV section
export function DLIV() { /* TODO */ }

// ─── OPDLIV — option/title screen DLI vector ─────────────────────────────────
// TODO: Translate PACMAN.ASM OPDLIV section
export function OPDLIV() { /* TODO */ }

// ─── SET1PL / SET2PL — set up 1-player or 2-player score display ─────────────
export function SET1PL() { /* TODO */ }
export function SET2PL() { /* TODO */ }

// ─── OPTTTL — option title screen setup ──────────────────────────────────────
export function OPTTTL() { /* TODO */ }

// ─── CSTART — console START key handler ──────────────────────────────────────
export function CSTART() { /* TODO */ }

// ─── CSELEC — console SELECT key handler ─────────────────────────────────────
export function CSELEC() { /* TODO */ }

// ─── COPTON — console OPTION key handler ─────────────────────────────────────
export function COPTON() { /* TODO */ }
