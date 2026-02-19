# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the original Atari Pac-Man source code — a 6502 assembly language port of Pac-Man for the Atari 8-bit computer platform, developed by Roklan Corp for Atari Inc. (Revision 3.0, 10/03/82). Despite the repository name "Pacman-js", this is **not JavaScript** — it is pure 6502 assembly.

## Build & Assembly

There is no build system (no Makefile, package.json, etc.). To assemble, you need a 6502/Atari cross-assembler such as:
- [DASM](https://dasm-assembler.github.io/)
- [MAC/65](https://en.wikipedia.org/wiki/MAC/65) (native Atari)
- [mads](https://mads.atari8.info/)

The main entry point is `PACMAN.ASM`, which includes `SYSTEXT.ASM`.

To run the assembled binary, use an Atari 8-bit emulator (e.g., [Altirra](https://www.virtualdub.org/altirra.html)).

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

- **Zero-page variables** (`PACMAN.ASM`): All global game state lives in zero-page RAM for fast 6502 access — player positions, scores, dot counts, timers, maze data, monster states.
- **Vertical Blank Interrupt (VBI)** (`PAC1.ASM`): Game logic runs synchronized to the TV's vertical blank, a standard Atari 8-bit pattern.
- **Player/Missile Graphics** (`PAC3.ASM`): Atari hardware sprites ("Players" and "Missiles") used for Pac-Man and ghost rendering.
- **POKEY/GTIA/ANTIC registers** (`SYSTEXT.ASM`): Hardware-mapped I/O at fixed addresses for audio, display list, color, and input.

## Git Notes

Documentation files (README.md, LICENSE, CODE_OF_CONDUCT.md, SECURITY.md) appear deleted in the working tree but exist in git history. These were MIT-licensed (Copyright 2023 Dillon Depeel).
