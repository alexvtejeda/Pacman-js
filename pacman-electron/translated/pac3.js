// pac3.js — Translated from PAC3.ASM
// Initialization: Player/Missile graphics setup, color palettes, maze init.
// Also: Pac-Man movement, direction input, dot-eating, maze navigation.
//
// Translation note: See TRANSLATION_GUIDE.md for opcode→JS mapping.

import {
  cpu, mem, zp, setZP, readMem, writeMem,
  readAbsX, readAbsY, writeAbsX, writeAbsY,
  readIndY, writeIndY, readZPX,
  setNZ, setNZC, adc, sbc, and, ora, eor, bit, cmp,
  asl, lsr, rol, ror, inc, dec,
  push, pop, random, ADDR,
} from '../src/runtime.js';

import { DATMAZ } from '../src/data.js';

// ─── INITPM — clear all P/M graphics pages ───────────────────────────────────
export function INITPM() {
  // LDX #0 / LDA #0 / STA PMADDR+$300,X / INX / BNE loop  (clears 256 bytes)
  // Actually: 4 players × 256 bytes each + missiles = 5 × 256 = 1280 bytes
  const pmBase = ADDR.PMADDR;
  for (let i = 0; i < 0x500; i++) {
    mem[pmBase + i] = 0;
  }
}

// ─── SETCLR / SETCLL — set initial color registers ───────────────────────────
export function SETCLR() { /* TODO */ }

// ─── P1INIT — initialize player 1 screen from DATMAZ ─────────────────────────
// Copies DATMAZ maze data into PACMAZ (active screen memory).
export function P1INIT() {
  // LDX #0 / LDA DATMAZ,X / STA PACMAZ,X / INX / CPX #sizeofDATMAZ / BNE loop
  for (let i = 0; i < DATMAZ.length; i++) {
    mem[ADDR.PACMAZ + i] = DATMAZ[i];
  }
}

// ─── SAVEP1 — save player 1 screen ───────────────────────────────────────────
export function SAVEP1() { /* TODO */ }

// ─── SAVEP2 — save player 2 screen ───────────────────────────────────────────
export function SAVEP2() { /* TODO */ }

// ─── PMSTIK — read joystick and update Pac-Man direction ──────────────────────
export function PMSTIK() { /* TODO */ }

// ─── PMUDST — update Pac-Man direction from STICK0 ───────────────────────────
export function PMUDST() { /* TODO */ }

// ─── PUDSAM / PUDSTK — process joystick input ────────────────────────────────
export function PUDSAM() { /* TODO */ }
export function PUDSTK() { /* TODO */ }

// ─── PACTST — test Pac-Man movement direction ────────────────────────────────
export function PACTST() { /* TODO */ }

// ─── PACUP — move Pac-Man upward ──────────────────────────────────────────────
export function PACUP() { /* TODO */ }

// ─── PACDN — move Pac-Man downward ───────────────────────────────────────────
export function PACDN() { /* TODO */ }

// ─── PACRT — move Pac-Man rightward ──────────────────────────────────────────
export function PACRT() { /* TODO */ }

// ─── PACLF — move Pac-Man leftward ───────────────────────────────────────────
export function PACLF() { /* TODO */ }

// ─── PACSTP — stop Pac-Man (PACDOT sprite) ───────────────────────────────────
export function PACSTP() { /* TODO */ }

// ─── PACOPN — open Pac-Man mouth ─────────────────────────────────────────────
export function PACOPN() { /* TODO */ }

// ─── MOVPAC — write Pac-Man sprite to P/M memory ─────────────────────────────
export function MOVPAC() { /* TODO */ }

// ─── MUNCHY — check for dot eating ───────────────────────────────────────────
export function MUNCHY() { /* TODO */ }

// ─── INCDOT — increment dot eaten counter ────────────────────────────────────
export function INCDOT() { /* TODO */ }

// ─── CHKMAX — check for max dots (level complete) ────────────────────────────
export function CHKMAX() { /* TODO */ }

// ─── DOTTST / DT2TST / DT3TST / DT4TST — dot test helpers ───────────────────
export function DOTTST() { /* TODO */ }
export function DT2TST() { /* TODO */ }
export function DT3TST() { /* TODO */ }
export function DT4TST() { /* TODO */ }

// ─── EATSML — eat small dot ───────────────────────────────────────────────────
export function EATSML() { /* TODO */ }

// ─── ZEATER / SEATER — zero/set eat flag ──────────────────────────────────────
export function ZEATER() { /* TODO */ }
export function SEATER() { /* TODO */ }

// ─── MAZHND — maze handler: determine allowed directions ─────────────────────
// Key function for both Pac-Man and ghost movement decision-making.
export function MAZHND() { /* TODO */ }

// ─── PSCORE / PSCOR1 / PSCORX — add to player score ─────────────────────────
export function PSCORE() { /* TODO */ }
export function PSCOR1() { /* TODO */ }
export function PSCORX() { /* TODO */ }

// ─── KSCORE — display score ───────────────────────────────────────────────────
export function KSCORE() { /* TODO */ }

// ─── BLINKR / BLNKON / BLNKOF — big dot blink ───────────────────────────────
export function BLINKR() { /* TODO */ }
export function BLNKON() { /* TODO */ }
export function BLNKOF() { /* TODO */ }

// ─── BONUSP / CKBONS / CKBON2 — bonus Pac-Man life check ────────────────────
export function BONUSP() { /* TODO */ }
export function CKBONS() { /* TODO */ }
export function CKBON2() { /* TODO */ }

// ─── VCHASE / VCHADN / VCHASX — chase sound VBI handlers ────────────────────
export function VCHASE() { /* TODO */ }
export function VCHADN() { /* TODO */ }
export function VCHASX() { /* TODO */ }

// ─── STWHIN — start whine (chase sound) ──────────────────────────────────────
export function STWHIN() { /* TODO */ }

// ─── FRUITY / FRUITX / FRTST1 / FRTST2 — fruit display and test ─────────────
export function FRUITY() { /* TODO */ }
export function FRUITX() { /* TODO */ }
export function FRTST1() { /* TODO */ }
export function FRTST2() { /* TODO */ }

// ─── DOTFND / HORFND / VRTFND — dot/wall find helpers ───────────────────────
export function DOTFND() { /* TODO */ }
export function HORFND() { /* TODO */ }
export function VRTFND() { /* TODO */ }
