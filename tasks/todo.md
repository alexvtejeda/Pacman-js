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
