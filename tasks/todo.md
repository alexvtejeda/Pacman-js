# Goal: Compile source code and run in atari800

## Context
The `.ASM` files in this repo are the original 1982 Atari Pac-Man source code.
They need to be assembled into a `.xex` binary, then run in atari800.

## Todo

- [x] Install MADS assembler (used Mad-Assembler-2.1.6 from repo)
- [x] Fix 8 INCLUDE paths in PACMAN.ASM (removed Atari disk drive prefixes D1:/D2:)
- [x] Fix assembler syntax differences (DS→.DS, INCLUDE→ICL, DB→.BYTE, DW→.WORD, HIGH/LOW→>/<, removed EJECT/LIST directives, stripped EOF markers, fixed UDXPAC typo)
- [x] Successfully assembled: `pacman.xex` (14KB, 5536 lines, 3 passes)
- [x] Run compiled binary: `atari800 -nobasic pacman.xex`
- [x] Verify the game runs correctly — no crash on level completion!

## Review

Successfully compiled the 1982 Atari Pac-Man source code (Disk Version, Revision 3.0)
into a working `pacman.xex` binary using MADS 2.1.6.

**Changes made to source files:**
- `PACMAN.ASM`: removed Atari disk drive prefixes (`D1:`/`D2:`) from 8 INCLUDE paths,
  converted MAC/65 directives to MADS syntax (`DS`→`.DS`, `INCLUDE`→`ICL`, removed `EJECT`/`LIST`)
- All `.ASM` files: converted `DB`→`.BYTE`, `DW`→`.WORD`, `HIGH`/`LOW` operators→`>`/`<`,
  accumulator instructions (`ASL A`→`ASL`), stripped trailing Atari EOF markers (`\x1a`)
- `PAC2.ASM`: fixed typo `UDXPAC`→`UDXPACS` (label was defined with S but called without)

**Result:** The compiled disk version runs without the level-completion crash
that exists in the pre-built cartridge ROM versions found online.

## Notes
- PACMAN.ASM has INCLUDE paths like `D2:SYSTEXT.ASM` and `D1:PAC1.ASM`
  that need to become `SYSTEXT.ASM` and `PAC1.ASM`
- The source is the "DISK VERSION" (runs as .xex, not cartridge)
- The previously tested ROM was the cartridge version (.rom)
- The level-completion crash observed in the ROM may or may not exist in
  this source — we'll find out after compiling

---

# Goal: Electron Platform for Atari Pac-Man JS Translation

## Todo

- [x] `package.json` + `main.js` + `index.html` (Electron shell, 480×576)
- [x] `src/runtime.js` (mem[], cpu{}, all 6502 ALU helpers, ADDR constants)
- [x] `src/hardware.js` (GTIA/POKEY/ANTIC/PIA register dispatch)
- [x] `src/audio.js` (4-channel POKEY → Web Audio API)
- [x] `src/input.js` (arrow keys → STICK0/PORTA, F2/F3/F4 → CONSOL)
- [x] `src/renderer.js` (canvas 2D: maze from PACMAZ, sprites from P/M pages)
- [x] `src/gameloop.js` (60fps requestAnimationFrame loop)
- [x] `src/data.js` (all PACDATx tables as Uint8Arrays, loaded into mem[])
- [x] `translated/pacman.js` (VBLANK entry + stubs)
- [x] `translated/pac1.js` (VBSUBS, TUNNEL + stubs)
- [x] `translated/pac2.js` (CLRAUD, RERACK, READY + stubs)
- [x] `translated/pac3.js` (INITPM, P1INIT, MAZHND + stubs)
- [x] `translated/pac4.js` (ghost AI + stubs)
- [x] `TRANSLATION_GUIDE.md` (complete opcode→JS reference for small LLM)

## Review

Built the complete Electron platform for the 6502→JS translation project.

**Files created:** 16 files in `pacman-electron/`

**Architecture:**
- `src/runtime.js` — core 6502 contract: 64KB mem[], cpu registers, all ALU
  helpers (adc/sbc with BCD, all shifts, compare, stack push/pop), and the full
  ADDR symbol table with every zero-page variable and hardware register.
- `src/hardware.js` — dispatches $D000-$D4FF reads/writes: HITCLR clears
  collisions, POKEY audio writes forwarded to audio.js, WSYNC is a no-op.
- `src/audio.js` — 4 Web Audio oscillators mapped to POKEY channels via the
  standard POKEY frequency formula (1789790 / (2*(freq+1))).
- `src/input.js` — arrow keys map to Atari joystick bits; F2/F3/F4 map to
  CONSOL register. Writes directly to mem[] (no circular imports).
- `src/renderer.js` — ANTIC mode 4 maze rendering (40×24 chars, 2bpp color),
  Player/Missile sprite rendering (scans 256-byte pages for bitmap), and
  bounding-box collision detection that writes to $D008-$D00F.
- `src/data.js` — all static tables from PACDAT1/2/3.ASM parsed and embedded
  as Uint8Arrays. `initData()` copies them into mem[] at assembled addresses
  starting at $4000 and patches ADDR with exact table addresses.
- `src/gameloop.js` — wires hardware dispatch (breaking circular deps via
  `registerHardware()`), calls initInput()/initRenderer()/initData(), then
  runs the 60fps loop: tickRTCLOK → VBLANK() → render().

**Key design decisions:**
- No circular imports: runtime.js uses a `registerHardware()` callback pattern;
  input.js writes state directly to mem[] so hardware.js needs no import of it.
- ADDR constants cover all zero-page vars ($0018-$00FF), OS equates, hardware
  registers, memory layout, and all PACDATx table addresses.
- TRANSLATION_GUIDE.md gives the small LLM every opcode→JS mapping, all common
  patterns (RTCLOK timing, STICK0 reading, P/M writes, BCD scoring), worked
  examples, and a per-file translation order with verification checklist.

**To run:** `cd pacman-electron && npm install && npm start`
(Electron window opens with black canvas; no JS errors in DevTools until
translated/*.js stubs are filled in by the small LLM.)
