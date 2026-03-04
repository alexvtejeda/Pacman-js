// pac4.js — Translated from PAC4.ASM
// Monster (ghost) AI: movement, direction logic, eye-only (killed ghost) mode,
// start paths, pattern-following, and intermission sequence.
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

import { MAZHND } from './pac3.js';

// ─── EYONLY — process "eyes only" (killed ghost) movement ────────────────────
// Ghosts revert to eyes-only mode and return to the monster pen.
export function EYONLY() { /* TODO */ }

// ─── EYHOME — send ghost home ────────────────────────────────────────────────
export function EYHOME() { /* TODO */ }

// ─── TSTEYV — test eye vertical position ─────────────────────────────────────
export function TSTEYV() { /* TODO */ }

// ─── GTWEET — ghost tweet sound (eyes going home) ────────────────────────────
export function GTWEET() { /* TODO */ }

// ─── CKINBX — check if ghost is in pen box ───────────────────────────────────
export function CKINBX() { /* TODO */ }

// ─── MONOUT — process monster startup/exit from pen ──────────────────────────
export function MONOUT() { /* TODO */ }

// ─── PNKMOT — pink ghost motion ───────────────────────────────────────────────
export function PNKMOT() { /* TODO */ }

// ─── GRNMOT — green ghost motion ─────────────────────────────────────────────
export function GRNMOT() { /* TODO */ }

// ─── YELMOT — yellow ghost motion ────────────────────────────────────────────
export function YELMOT() { /* TODO */ }

// ─── STRDIR / STRSTS — store direction / status for monster X ────────────────
export function STRDIR() { /* TODO */ }
export function STRSTS() { /* TODO */ }

// ─── PNKOUT / GRNOUT / REDOUT / YELOUT — ghost exit direction logic ──────────
export function PNKOUT() { /* TODO */ }
export function GRNOUT() { /* TODO */ }
export function REDOUT() { /* TODO */ }
export function YELOUT() { /* TODO */ }

// ─── PNKMIN / PNKMDN / GRNMIN / YELMIN — minimum-distance direction ──────────
export function PNKMIN() { /* TODO */ }
export function PNKMDN() { /* TODO */ }
export function GRNMIN() { /* TODO */ }
export function YELMIN() { /* TODO */ }

// ─── REINCR — re-increment after start sequence ───────────────────────────────
export function REINCR() { /* TODO */ }

// ─── STRTMN — start monster movement sequences ───────────────────────────────
export function STRTMN() { /* TODO */ }

// ─── CKSSQL / CKSMUP / CKM1UP / CKM2UP — check start sequence levels ─────────
export function CKSSQL() { /* TODO */ }
export function CKSMUP() { /* TODO */ }
export function CKM1UP() { /* TODO */ }
export function CKM2UP() { /* TODO */ }

// ─── BOUNCE — bouncing motion (in-pen oscillation) ───────────────────────────
export function BOUNCE() { /* TODO */ }

// ─── MONSTR — monster state dispatcher ───────────────────────────────────────
export function MONSTR() { /* TODO */ }

// ─── MSTRTP — monster start path follower ────────────────────────────────────
export function MSTRTP() { /* TODO */ }

// ─── MPATRN / MPTRN1 / MPTRN2 — monster pattern follower ────────────────────
export function MPATRN() { /* TODO */ }
export function MPTRN1() { /* TODO */ }
export function MPTRN2() { /* TODO */ }

// ─── MCHASE / SCHASE / SECURE / SEEPAC — monster chasing Pac-Man ─────────────
export function MCHASE() { /* TODO */ }
export function SCHASE() { /* TODO */ }
export function SECURE() { /* TODO */ }
export function SEEPAC() { /* TODO */ }

// ─── SEEKPS / SEKPS1 / SEKPS2 — seek Pac-Man position ───────────────────────
export function SEEKPS() { /* TODO */ }
export function SEKPS1() { /* TODO */ }
export function SEKPS2() { /* TODO */ }

// ─── SEEUPP / SEEUP1 / SEEUP2 — see upward ───────────────────────────────────
export function SEEUPP() { /* TODO */ }
export function SEEUP1() { /* TODO */ }
export function SEEUP2() { /* TODO */ }

// ─── SEEDWN / SEEDN1 / SEEDN2 — see downward ────────────────────────────────
export function SEEDWN() { /* TODO */ }
export function SEEDN1() { /* TODO */ }
export function SEEDN2() { /* TODO */ }

// ─── SEELFT / SEELF1 / SEELF2 — see leftward ────────────────────────────────
export function SEELFT() { /* TODO */ }
export function SEELF1() { /* TODO */ }
export function SEELF2() { /* TODO */ }

// ─── SEERGT / SEERT1 / SEERT2 — see rightward ───────────────────────────────
export function SEERGT() { /* TODO */ }
export function SEERT1() { /* TODO */ }
export function SEERT2() { /* TODO */ }

// ─── SEEVRT / SEEVRL / SEEVR1 / SEEVR? — vertical range check ───────────────
export function SEEVRT() { /* TODO */ }
export function SEEVRL() { /* TODO */ }
export function SEEVR1() { /* TODO */ }

// ─── SEEHR? / SEEHRL — horizontal range check ────────────────────────────────
export function SEEHRX() { /* TODO */ }
export function SEEHRL() { /* TODO */ }
export function SEEHR1() { /* TODO */ }

// ─── MDIRCT — monster direction calculation ───────────────────────────────────
export function MDIRCT() { /* TODO */ }

// ─── SAMEMD / SAMMDR / SETMDR — same/set direction helpers ───────────────────
export function SAMEMD() { /* TODO */ }
export function SAMMDR() { /* TODO */ }
export function SETMDR() { /* TODO */ }

// ─── SAMPTH / SETPAT / MNPATH — pattern path logic ───────────────────────────
export function SAMPTH() { /* TODO */ }
export function SETPAT() { /* TODO */ }
export function MNPATH() { /* TODO */ }

// ─── SMPTRN — same pattern ───────────────────────────────────────────────────
export function SMPTRN() { /* TODO */ }

// ─── FINDST — find start direction ───────────────────────────────────────────
export function FINDST() { /* TODO */ }

// ─── MHONLY — horizontal-only movement ───────────────────────────────────────
export function MHONLY() { /* TODO */ }

// ─── MNEYES — monster eyes (killed ghost navigation) ─────────────────────────
export function MNEYES() { /* TODO */ }

// ─── MWRITE — write monster sprite to P/M memory ─────────────────────────────
export function MWRITE() { /* TODO */ }

// ─── MONHND — monster P/M write handler ──────────────────────────────────────
export function MONHND() { /* TODO */ }

// ─── MNSKRT / MSKL54 — monster skirt ────────────────────────────────────────
export function MNSKRT() { /* TODO */ }
export function MSKL54() { /* TODO */ }

// ─── DNTEST / UPTEST / LFTEST / RTTEST — movement direction tests ────────────
export function DNTEST() { /* TODO */ }
export function UPTEST() { /* TODO */ }
export function LFTEST() { /* TODO */ }
export function RTTEST() { /* TODO */ }

// ─── MVRTOK / MHRZOK — vertical / horizontal movement OK checks ──────────────
export function MVRTOK() { /* TODO */ }
export function MHRZOK() { /* TODO */ }

// ─── STRTMN helpers ───────────────────────────────────────────────────────────
export function MSTLUP() { /* TODO */ }
export function MSTLDN() { /* TODO */ }
export function MSTLLF() { /* TODO */ }
export function MSTLRT() { /* TODO */ }
export function NOMMOT() { /* TODO */ }
export function GOHOME() { /* TODO */ }

// ─── TSTEYE / TSUPSQ / STSQST / NXTBNC — eye/up-sequence helpers ─────────────
export function TSTEYE() { /* TODO */ }
export function TSUPSQ() { /* TODO */ }
export function STSQST() { /* TODO */ }
export function NXTBNC() { /* TODO */ }

// ─── INTMIS — intermission sequence ──────────────────────────────────────────
export function INTMIS() { /* TODO */ }

// ─── INITPT — initialize pattern ─────────────────────────────────────────────
export function INITPT() { /* TODO */ }
