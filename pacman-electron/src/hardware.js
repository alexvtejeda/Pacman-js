// hardware.js — GTIA / POKEY / ANTIC / PIA hardware register emulation
// Called by runtime.js readMem/writeMem for addresses $D000-$D4FF

import { mem, random } from './runtime.js';
import { updateChannel } from './audio.js';
// input.js writes its state directly to mem[0xD01F] and mem[0xD300]
// so hardware.js does not need to import input.js

// ─── Read ─────────────────────────────────────────────────────────────────────

export function readHW(addr) {
  // GTIA: collision registers are read-only game-state, written by renderer
  // All stored in mem[] directly — just return them.

  // POKEY RANDOM — return fresh random value
  if (addr === 0xD20A) return random();

  // CONSOL ($D01F) — maintained by input.js via mem[0xD01F] writes
  // PORTA ($D300) — maintained by input.js via mem[0xD300] writes
  // Both fall through to the default mem[] read below

  // Everything else: return from mem[] (hardware regs shadow-copied on write)
  return mem[addr];
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function writeHW(addr, val) {
  // HITCLR ($D01E) — zero all collision registers
  if (addr === 0xD01E) {
    for (let i = 0xD000; i <= 0xD00F; i++) mem[i] = 0;
    return;
  }

  // WSYNC ($D40A) — wait for horizontal sync, no-op in JS
  if (addr === 0xD40A) return;

  // POKEY audio channels — forward to audio.js
  if (addr >= 0xD200 && addr <= 0xD207) {
    mem[addr] = val;
    const ch = (addr - 0xD200) >> 1;  // channels 0-3
    const freqAddr = 0xD200 + ch * 2;
    const ctrlAddr = freqAddr + 1;
    updateChannel(ch, mem[freqAddr], mem[ctrlAddr]);
    return;
  }

  // ANTIC PMBASE — also update our shadow
  // ANTIC CHBASE — used by renderer to locate charset
  // All other writes: store in mem[]
  mem[addr] = val;
}
