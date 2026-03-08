# Atari Pac-Man — 6502 Source & JavaScript Translation

This repository contains two things:

1. **The original 1982 Atari Pac-Man source code** (6502 assembly, Disk Version Rev 3.0), developed by Roklan Corp for Atari Inc., converted to MADS assembler syntax and fixed to compile cleanly.
2. **An Electron-based JavaScript translation platform** (`pacman-electron/`) designed to host a subroutine-by-subroutine port of the 6502 game logic into JavaScript, running in a real browser/Electron engine.

---

## Part 1 — 6502 Assembly (the original game)

### Build

MADS assembler is bundled. From the repo root:

```bash
./Mad-Assembler-2.1.6/bin/linux_x86_64/mads PACMAN.ASM -o:pacman.xex
```

Produces `pacman.xex` (~14KB).

### Run

```bash
atari800 -nobasic pacman.xex
```

Press **F4** (START) to begin. Arrow keys control Pac-Man (joystick-mapped in `~/.atari800.cfg`).

### Source files

| File | Role |
|------|------|
| `PACMAN.ASM` | Entry point; all zero-page variable definitions |
| `SYSTEXT.ASM` | Hardware register equates (GTIA/POKEY/ANTIC/PIA) |
| `PAC1.ASM` | VBI handler; attract-mode sequences |
| `PAC2.ASM` | Core gameplay: dot eating, skirt animation, rerack (level reset) |
| `PAC3.ASM` | Init: Player/Missile graphics, color palettes, maze init |
| `PAC4.ASM` | Ghost AI: movement, direction logic, eyes-only mode |
| `PACDAT1-3.ASM` | Sprite bitmaps and static game data tables |

### Notable fix

`PAC2.ASM` corrects the label `UDXPAC` → `UDXPACS`. Pre-built cartridge ROM versions online contain this typo, causing a crash on level completion. This disk version does not.

---

## Part 2 — JavaScript Translation (`pacman-electron/`)

### Goal

Translate every 6502 subroutine into an equivalent JavaScript function, running inside Electron at 60fps with real Web Audio, canvas rendering, and keyboard input. The runtime platform is complete; the translation itself is the remaining work.

### Run (current state)

```bash
cd pacman-electron && npm install && npm start
```

The Electron window opens with a black canvas. No JS errors — the platform boots cleanly — but the game does not yet run because ~240 subroutines are still empty stubs.

### Platform architecture

The `src/` layer is fully built and requires no further changes:

| File | Role |
|------|------|
| `src/runtime.js` | 64KB `mem[]`, `cpu{}` registers, all 6502 ALU helpers (ADC/SBC/BCD, shifts, compare, stack), `ADDR` symbol table |
| `src/hardware.js` | Dispatches `$D000–$D4FF` reads/writes (GTIA/POKEY/ANTIC/PIA) |
| `src/audio.js` | 4-channel POKEY → Web Audio (standard POKEY frequency formula) |
| `src/input.js` | Arrow keys → `STICK0`/`PORTA`; F2/F3/F4 → `CONSOL ($D01F)` |
| `src/renderer.js` | ANTIC mode-4 maze (40×24 2bpp) + Player/Missile sprite rendering + collision detection writes to `$D008–$D00F` |
| `src/gameloop.js` | 60fps loop: `tickRTCLOK → VBLANK() → render()` |
| `src/data.js` | All `PACDATx` tables as `Uint8Arrays`, copied into `mem[]` at `$4000` |

### Translation status

Subroutine stubs live in `translated/`. Each function currently contains `/* TODO */`.

| File | Subroutines | Done |
|------|------------|------|
| `translated/pacman.js` | 13 | 1 (`VBLANK`) |
| `translated/pac1.js` | 55 | 0 |
| `translated/pac2.js` | 40 | 1 (`CLRAUD`) |
| `translated/pac3.js` | 49 | 2 |
| `translated/pac4.js` | 89 | 0 |
| **Total** | **~246** | **~4** |

### What's left to do

Fill in the `/* TODO */` stubs in `translated/*.js` following the opcode→JS mapping in `pacman-electron/TRANSLATION_GUIDE.md`. The recommended translation order (to minimize forward-reference issues):

1. `pac3.js` — `MAZHND`, `INITPM`, `P1INIT` (no deps on other translated files)
2. `pac2.js` — `CLRAUD` ✓, `SETUP`, `NEWGAM`, `RERACK` (deps: `pac3.INITPM`)
3. `pac4.js` — ghost AI (deps: `pac3.MAZHND`)
4. `pac1.js` — VBI dispatcher (deps: pac2, pac3, pac4)
5. `pacman.js` — `VBLANK` ✓, `INIT`, `LOOP`, `REINIT`, console key handlers (deps: pac1, pac2, pac3)

Each translated function must:
- Import only from `../src/runtime.js` (never DOM, Node, or Electron APIs)
- Call `setNZ()`/`adc()`/`cmp()` etc. on every ALU operation — the next branch depends on these flags
- Use `readMem()`/`writeMem()` for hardware-range addresses (`$D000–$D4FF`); `mem[]` directly for RAM
- Never cache a `mem[]` read — hardware registers change between accesses

Refer to `TRANSLATION_GUIDE.md` for the full opcode table, common patterns (RTCLOK timing, BCD scoring, P/M sprite writes, joystick decoding), and worked examples.

---

## Repository layout

```
PACMAN.ASM / PAC1-4.ASM / PACDAT1-3.ASM / SYSTEXT.ASM
                         ← original 6502 source (MADS syntax)
pacman-electron/         ← Electron JS translation platform
  src/                   ← complete runtime (do not modify)
  translated/            ← subroutine stubs to fill in
  TRANSLATION_GUIDE.md   ← opcode→JS reference
rawCode/                 ← original MAC/65 source before conversion (reference only)
Mad-Assembler-2.1.6/     ← bundled MADS assembler binary
clean_for_llm.py         ← strips blank lines from an ASM file for LLM context efficiency
```
