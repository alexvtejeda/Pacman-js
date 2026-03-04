// pac1.js — Translated from PAC1.ASM
// VBI subroutines, attract mode sequences, tunnel logic, sound/speed updates.
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

// ─── VBSUBS — VBI subroutine dispatcher ──────────────────────────────────────
// Called every frame from VBLANK. Dispatches to attract/game sub-handlers.
// Source: PAC1.ASM, label VBSUBS
export function VBSUBS() { /* TODO */ }

// ─── VBATTR — VBI attract mode handler ───────────────────────────────────────
export function VBATTR() { /* TODO */ }

// ─── VBGAME — VBI game mode handler ──────────────────────────────────────────
export function VBGAME() { /* TODO */ }

// ─── VTUNES — play intro tune ─────────────────────────────────────────────────
export function VTUNES() { /* TODO */ }

// ─── VINTRO — intro sequence ──────────────────────────────────────────────────
export function VINTRO() { /* TODO */ }

// ─── VSTART — increment READYF to start game ─────────────────────────────────
export function VSTART() { /* TODO */ }

// ─── VSTRT1 — start sequence step 1 ──────────────────────────────────────────
export function VSTRT1() { /* TODO */ }

// ─── VSTRT2 — start sequence step 2 ──────────────────────────────────────────
export function VSTRT2() { /* TODO */ }

// ─── VREADY — handle READYF / RESETF states ───────────────────────────────────
export function VREADY() { /* TODO */ }

// ─── VRSTGM — restore game state after death/reset ───────────────────────────
export function VRSTGM() { /* TODO */ }

// ─── VRESET / CRESET — handle RESETF countdown ───────────────────────────────
export function VRESET() { /* TODO */ }
export function CRESET() { /* TODO */ }

// ─── VGONE1 / VGONE2 — game over sequence ────────────────────────────────────
export function VGONE1() { /* TODO */ }
export function VGONE2() { /* TODO */ }

// ─── VSQUIT — VBI early exit ─────────────────────────────────────────────────
export function VSQUIT() { /* TODO */ }

// ─── VBOPT2 / VBOPT3 — option screen VBI steps ───────────────────────────────
export function VBOPT2() { /* TODO */ }
export function VBOPT3() { /* TODO */ }

// ─── VPLAYR / VPLYUD — update player display ──────────────────────────────────
export function VPLAYR() { /* TODO */ }
export function VPLYUD() { /* TODO */ }

// ─── VSWAP — swap player data ─────────────────────────────────────────────────
export function VSWAP1() { /* TODO */ }
export function VSWAP2() { /* TODO */ }
export function VSWAP3() { /* TODO */ }
export function VSWAP4() { /* TODO */ }

// ─── VBFIZI / VBFIZX — fizzle (death) animation ─────────────────────────────
export function VBFIZI() { /* TODO */ }
export function VBFIZX() { /* TODO */ }

// ─── VCOLLS — collision processing ───────────────────────────────────────────
export function VCOLLS() { /* TODO */ }

// ─── VCONTN — continue / level-end processing ────────────────────────────────
export function VCONTN() { /* TODO */ }

// ─── TUNNEL — handle tunnel wrap-around ───────────────────────────────────────
// Source: PAC1.ASM, label TUNNEL
export function TUNNEL() { /* TODO */ }

// ─── UDMONS — update monster positions ───────────────────────────────────────
export function UDMONS() { /* TODO */ }

// ─── SPDUPD — update speed sequences ─────────────────────────────────────────
export function SPDUPD() { /* TODO */ }

// ─── VFRUIT — fruit timer and display ────────────────────────────────────────
export function VFRUIT() { /* TODO */ }

// ─── VGULPR — gulp (eat ghost) processing ────────────────────────────────────
export function VGULPR() { /* TODO */ }

// ─── VTWEET — tweet sound handler ────────────────────────────────────────────
export function VTWEET() { /* TODO */ }

// ─── VEATER / VEATRS / VEATRX — dot-eating sound ─────────────────────────────
export function VEATER() { /* TODO */ }
export function VEATRS() { /* TODO */ }
export function VEATRX() { /* TODO */ }

// ─── VCHASE — chase sound handler ────────────────────────────────────────────
export function VCHASE() { /* TODO */ }

// ─── VFIZZL / VFIZDN / VFIZFZ / VFIZUP / VFIZSW — fizzle sound ──────────────
export function VFIZZL() { /* TODO */ }
export function VFIZDN() { /* TODO */ }
export function VFIZFZ() { /* TODO */ }
export function VFIZUP() { /* TODO */ }
export function VFIZSW() { /* TODO */ }

// ─── VFLRDY / VFLIDN — flight (blue ghost) sound ─────────────────────────────
export function VFLRDY() { /* TODO */ }
export function VFLIDN() { /* TODO */ }

// ─── VRVERB / VRVRBX — reverse (ghost eaten) sequence ────────────────────────
export function VRVERB() { /* TODO */ }
export function VRVRBX() { /* TODO */ }

// ─── Attract mode sub-sequences (CKATS2..CKATSQ) ─────────────────────────────
export function CKATS2() { /* TODO */ }
export function CKATS3() { /* TODO */ }
export function CKATS4() { /* TODO */ }
export function CKATS5() { /* TODO */ }
export function CKATS6() { /* TODO */ }

// ─── ASTART — attract start ───────────────────────────────────────────────────
export function ASTART() { /* TODO */ }

// ─── COLCHK — collision check ────────────────────────────────────────────────
export function COLCHK() { /* TODO */ }

// ─── CLRHIT — clear hit registers ────────────────────────────────────────────
export function CLRHIT() { /* TODO */ }

// ─── CHASER — chase sequence ─────────────────────────────────────────────────
export function CHASER() { /* TODO */ }
