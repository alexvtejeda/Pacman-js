// pac2.js — Translated from PAC2.ASM
// Core gameplay: eating mechanics, fizzle/explosion animations, rerack (maze
// reset), ready/game-over sequences, scoring display, audio routines.
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

// ─── GOBBLE — gobble (eat fruit) sound ───────────────────────────────────────
export function GOBBLE() { /* TODO */ }

// ─── SKIRTS — monster skirt animation ────────────────────────────────────────
export function SKIRTS() { /* TODO */ }

// ─── RERACK — maze reset sequence ────────────────────────────────────────────
export function RERACK() { /* TODO */ }

// ─── READY1 — draw "READY!" text ─────────────────────────────────────────────
export function READY1() { /* TODO */ }

// ─── READY2 — clear "READY!" text area ───────────────────────────────────────
export function READY2() { /* TODO */ }

// ─── READY3 — draw direction arrows ──────────────────────────────────────────
export function READY3() { /* TODO */ }

// ─── UDXPACS — update number of Pac-Man lives on screen ──────────────────────
// Note: Bug fix — original ROM had UDXPAC (missing S), causing crash on level
// completion. This disk version has the correct UDXPACS label.
export function UDXPACS() { /* TODO */ }

// ─── DRAWIT — draw Pac-Man sprite ────────────────────────────────────────────
export function DRAWIT() { /* TODO */ }

// ─── FLSHXU — flash 1UP/2UP text ─────────────────────────────────────────────
export function FLSHXU() { /* TODO */ }

// ─── FLS1ON / FLS2ON — turn on 1UP / 2UP flashing ───────────────────────────
export function FLS1ON() { /* TODO */ }
export function FLS2ON() { /* TODO */ }

// ─── SETUP — initialize P/M graphics and game state ──────────────────────────
export function SETUP() { /* TODO */ }

// ─── NEWGAM — set up new game variables ───────────────────────────────────────
export function NEWGAM() { /* TODO */ }

// ─── CLRAUD — silence all POKEY audio channels ───────────────────────────────
export function CLRAUD() {
  // LDY #7 / LDA #0 / STA AUDF1,Y / DEY / BPL loop
  for (let i = 7; i >= 0; i--) {
    writeMem(ADDR.AUDF1 + i, 0);
  }
}

// ─── NEWGAM sub-routines ──────────────────────────────────────────────────────
export function NEWRK1() { /* TODO */ }
export function NEWRK2() { /* TODO */ }
export function NEWBD0() { /* TODO */ }
export function NEWBD1() { /* TODO */ }
export function NEWBRD() { /* TODO */ }

// ─── SPDINI — initialize speed sequences ─────────────────────────────────────
export function SPDINI() { /* TODO */ }

// ─── STREAT — start eat sequence ─────────────────────────────────────────────
export function STREAT() { /* TODO */ }

// ─── EATER2 — eat dot step 2 ─────────────────────────────────────────────────
export function EATER2() { /* TODO */ }

// ─── EXPPAC — explode Pac-Man (death animation) ──────────────────────────────
export function EXPPAC() { /* TODO */ }

// ─── FIZZIE / FIZCHK — fizzle animation ──────────────────────────────────────
export function FIZZIE() { /* TODO */ }
export function FIZCHK() { /* TODO */ }

// ─── FRUTLP — fruit handling loop ────────────────────────────────────────────
export function FRUTLP() { /* TODO */ }

// ─── PLAYRS / PLYRLP — player lives display ──────────────────────────────────
export function PLAYRS() { /* TODO */ }
export function PLYRLP() { /* TODO */ }

// ─── RSTBOX — reset monster pen box ──────────────────────────────────────────
export function RSTBOX() { /* TODO */ }

// ─── RSTCHL / RSTCHS — reset chase timer ─────────────────────────────────────
export function RSTCHL() { /* TODO */ }
export function RSTCHS() { /* TODO */ }

// ─── RSTFIZ — reset fizzle state ─────────────────────────────────────────────
export function RSTFIZ() { /* TODO */ }

// ─── RSTPLC / RSTPCL — reset player/color state ──────────────────────────────
export function RSTPLC() { /* TODO */ }
export function RSTPCL() { /* TODO */ }

// ─── MONCLR — clear monster data ─────────────────────────────────────────────
export function MONCLR() { /* TODO */ }

// ─── VBFIZI — fizzle VBI step ────────────────────────────────────────────────
export function VBFIZI() { /* TODO */ }

// ─── VRBSTR / VRVBX1 — reverse-ghost VBI handler ─────────────────────────────
export function VRBSTR() { /* TODO */ }
export function VRVBX1() { /* TODO */ }

// ─── VFRUIT — fruit VBI handler ───────────────────────────────────────────────
export function VFRUIT() { /* TODO */ }

// ─── VTWEET — tweet sound VBI handler ────────────────────────────────────────
export function VTWEET() { /* TODO */ }
