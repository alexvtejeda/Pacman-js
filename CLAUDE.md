# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the original Atari Pac-Man source code — a 6502 assembly language port of Pac-Man for the Atari 8-bit computer platform, developed by Roklan Corp for Atari Inc. (Revision 3.0, 10/03/82). Despite the repository name "Pacman-js", this is **not JavaScript** — it is pure 6502 assembly in MADS-compatible syntax.

## Build & Run

MADS assembler is bundled in the repo. To assemble:

```bash
./Mad-Assembler-2.1.6/bin/linux_x86_64/mads PACMAN.ASM -o:pacman.xex
```

This produces `pacman.xex` (~14KB). To run:

```bash
atari800 -nobasic pacman.xex
```

Press **F4** (START) to begin the game; arrow keys control Pac-Man (mapped to joystick in `~/.atari800.cfg`).

## Source Syntax

The source was originally written for the MAC/65 assembler on native Atari hardware and has been converted to MADS syntax. Key differences from "raw" MAC/65:

| MAC/65 original | MADS (used here) |
|-----------------|------------------|
| `INCLUDE file`  | `ICL 'file'`     |
| `DS n`          | `.DS n`          |
| `DB val`        | `.BYTE val`      |
| `DW val`        | `.WORD val`      |
| `HIGH expr`     | `>expr`          |
| `LOW expr`      | `<expr`          |
| `ASL A`         | `ASL`            |
| `EJECT`/`LIST I`| removed          |

Any future edits to the `.ASM` files must use MADS syntax.

## Code Architecture

```
PACMAN.ASM      — Entry point; zero-page variable definitions for all game state
  └─ SYSTEXT.ASM  — OS equates and hardware register addresses (display, audio, I/O)

PAC1.ASM        — Vertical blank interrupt handler; attract mode sequences
PAC2.ASM        — Core gameplay: eating mechanics, skirt animations, rerack (maze reset)
PAC3.ASM        — Initialization: Player/Missile graphics setup, color palettes, maze init
PAC4.ASM        — Monster (ghost) AI: movement, direction logic, eye-only (killed ghost) mode

PACDAT1.ASM     — Sprite bitmaps for Pac-Man and ghosts
PACDAT2.ASM     — Extended game data and sprites
PACDAT3.ASM     — Additional game data
ATARISYS.ASM    — Empty placeholder file
```

### Key Architectural Patterns

- **Zero-page variables** (`PACMAN.ASM`): All global game state lives in zero-page RAM (starting at `$0018`) for fast 6502 access — player positions, scores, dot counts, timers, maze data, monster states.
- **Vertical Blank Interrupt (VBI)** (`PAC1.ASM`): Game logic runs synchronized to the TV's vertical blank, a standard Atari 8-bit pattern.
- **Player/Missile Graphics** (`PAC3.ASM`): Atari hardware sprites ("Players" and "Missiles") used for Pac-Man and ghost rendering.
- **POKEY/GTIA/ANTIC registers** (`SYSTEXT.ASM`): Hardware-mapped I/O at fixed addresses for audio, display list, color, and input.

## Known Fix vs. Cartridge ROM

`PAC2.ASM` has a typo fix: `UDXPAC` → `UDXPACS`. The cartridge ROM versions found online have this bug, which causes a crash on level completion. This disk version does not.

## Electron JS Translation Platform (`pacman-electron/`)

A second sub-project exists: a complete Electron runtime that hosts a subroutine-by-subroutine JavaScript translation of the 6502 assembly.

### To run
```bash
cd pacman-electron && npm install && npm start
```

To package a distributable: `npm run make` (output in `out/`; packaging configured in `forge.config.js`)

### Architecture
| File | Role |
|------|------|
| `main.js` | Electron main process — opens a fixed 480×576 `BrowserWindow` loading `index.html` |
| `index.html` | Shell: 480×576 `<canvas id="screen">`, loads `src/gameloop.js` as ES module entry point |
| `src/runtime.js` | 64KB `mem[]`, `cpu{}` registers, all 6502 ALU helpers (`adc`/`sbc`/BCD, shifts, compare, stack), `ADDR` symbol table |
| `src/hardware.js` | Dispatches `$D000–$D4FF` reads/writes (GTIA/POKEY/ANTIC/PIA) |
| `src/audio.js` | 4-channel POKEY → Web Audio (standard POKEY freq formula) |
| `src/input.js` | Arrow keys → `STICK0`/`PORTA`; F2/F3/F4 → `CONSOL ($D01F)` |
| `src/renderer.js` | ANTIC mode-4 maze (40×24 2bpp) + Player/Missile sprite rendering + collision writes to `$D008–$D00F` |
| `src/gameloop.js` | 60fps loop: `tickRTCLOK → VBLANK() → render()`; wires `registerHardware()` callback to break circular deps |
| `src/data.js` | All `PACDATx` tables as `Uint8Arrays`, copied into `mem[]` starting at `$4000` |
| `translated/*.js` | Subroutine stubs — one file per ASM source (`pacman.js`, `pac1.js`–`pac4.js`) |
| `TRANSLATION_GUIDE.md` | Complete opcode→JS reference for filling in stubs |

**Key addresses:** `ADDR.PACMAZ = 0x1400` (GAMMEM=`$0800` + `$0C00`); `PACCHR` at `$4000`; `DATMAZ` at `$4398`.

**No circular imports:** `runtime.js` exposes `registerHardware(r,w)` callback; `input.js` writes directly to `mem[]`.

## Repository Notes

- `rawCode/` — original unmodified MAC/65 source files before MADS conversion (reference only).
- `clean_for_llm.py` — strips blank lines from an ASM file for LLM token efficiency. Output goes to `rawCode/<filename>`. Usage: `python3 clean_for_llm.py PAC1.ASM`
- `benchmarking/` — unrelated x86 "Hello World" assembly experiments from LLM comparisons.
- `tasks/todo.md` — historical log of completed work.
- `clean_zone_ids.sh` — removes Windows `Zone.Identifier` files from the MADS assembler directory (run after downloading on WSL).
- Documentation files (README.md, LICENSE, etc.) appear deleted in the working tree but exist in git history (MIT-licensed, Copyright 2023 Dillon Depeel).
