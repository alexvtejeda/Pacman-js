# TRANSLATION GUIDE — Atari Pac-Man 6502 → JavaScript

This document is the complete reference for translating subroutines from the
six Atari 6502 assembly files (PACMAN.ASM, PAC1-4.ASM) into JavaScript stubs
in `translated/*.js`. Read it in full before writing a single line of JS.

---

## 1. Context

You are translating **subroutine by subroutine** from 1982 Atari Pac-Man 6502
assembly into JavaScript. The runtime platform (`src/runtime.js`) provides all
the 6502 primitives you need. You will **never** import Electron, canvas,
Web Audio, or Node APIs — those are handled by `src/*.js`.

Your output for each subroutine should be a plain JS function body that calls
the runtime helpers. No classes, no promises, no async/await.

---

## 2. Imports Available

All translated files already have this import at the top:

```js
import {
  cpu, mem, zp, setZP, readMem, writeMem,
  readAbsX, readAbsY, writeAbsX, writeAbsY,
  readIndY, writeIndY, readZPX,
  setNZ, setNZC, adc, sbc, and, ora, eor, bit, cmp,
  asl, lsr, rol, ror, inc, dec,
  push, pop, random, ADDR,
} from '../src/runtime.js';
```

**Never cache a read.** Always call `mem[addr]` or `readMem(addr)` fresh each
time — the hardware may change the value.

---

## 3. Memory Access Patterns

### Direct zero-page / absolute reads

```asm
LDA PMVPOS      ; read zero-page variable
```
```js
cpu.A = setNZ(mem[ADDR.PMVPOS]);
```

For hardware registers ($D000-$D4FF), use `readMem`/`writeMem`:

```asm
LDA CONSOL      ; $D01F — hardware read
STA AUDF1       ; $D200 — hardware write
```
```js
cpu.A = setNZ(readMem(ADDR.CONSOL));
writeMem(ADDR.AUDF1, cpu.A);
```

For regular RAM you can use `mem[]` directly:
```js
mem[ADDR.DLICNT] = 0;
cpu.A = setNZ(mem[ADDR.ATSEQU]);
```

### Indexed addressing

```asm
LDA HPOSP0,X    ; absolute indexed X
STA AUDF1,Y     ; absolute indexed Y
```
```js
cpu.A = setNZ(readAbsX(ADDR.HPOSP0));   // base + cpu.X
writeMem(ADDR.AUDF1 + cpu.Y, cpu.A);    // or: writeAbsY(ADDR.AUDF1)
```

Direct `mem[]` indexing when address is RAM (not hardware):
```js
cpu.A = setNZ(mem[ADDR.M1VPOS + cpu.X]);
mem[ADDR.M1DIRT + cpu.X] = cpu.A;
```

### Indirect indexed (zp),Y

```asm
LDA (PIXGET),Y
STA (PIXPUT),Y
```
```js
cpu.A = setNZ(readIndY(ADDR.PIXGET));
writeIndY(ADDR.PIXPUT, cpu.A);
```

The PIXGET/PIXPUT variables are 2-byte zero-page pointers. `readIndY` reads the
16-bit address from zp[PIXGET..PIXGET+1], adds cpu.Y, and returns the byte at
that address.

### Zero-page pointer manipulation (for 16-bit arithmetic)

```asm
CLC
LDA PACSCN
ADC #$28
STA PACSCN
BCC NOCARRY
INC PACSCN+1
NOCARRY:
```
```js
{
  const lo = mem[ADDR.PACSCN] + 0x28;
  cpu.C = lo > 0xFF;
  mem[ADDR.PACSCN] = lo & 0xFF;
  if (cpu.C) mem[ADDR.PACSCN + 1] = (mem[ADDR.PACSCN + 1] + 1) & 0xFF;
}
```

---

## 4. Every 6502 Opcode → JS

### Load / Store

| Opcode | JS |
|--------|----|
| `LDA val` | `cpu.A = setNZ(val & 0xFF)` |
| `LDX val` | `cpu.X = setNZ(val & 0xFF)` |
| `LDY val` | `cpu.Y = setNZ(val & 0xFF)` |
| `STA addr` | `mem[addr] = cpu.A` or `writeMem(addr, cpu.A)` |
| `STX addr` | `mem[addr] = cpu.X` |
| `STY addr` | `mem[addr] = cpu.Y` |
| `TAX` | `cpu.X = setNZ(cpu.A)` |
| `TAY` | `cpu.Y = setNZ(cpu.A)` |
| `TXA` | `cpu.A = setNZ(cpu.X)` |
| `TYA` | `cpu.A = setNZ(cpu.Y)` |
| `TSX` | `cpu.X = setNZ(cpu.SP)` |
| `TXS` | `cpu.SP = cpu.X` (no flag change) |

### Arithmetic

| Opcode | JS |
|--------|----|
| `ADC val` | `adc(val)` — modifies cpu.A, cpu.C, cpu.V, cpu.N, cpu.Z |
| `SBC val` | `sbc(val)` — modifies cpu.A, cpu.C, cpu.V, cpu.N, cpu.Z |
| `INC addr` | `mem[addr] = inc(mem[addr])` |
| `DEC addr` | `mem[addr] = dec(mem[addr])` |
| `INX` | `cpu.X = inc(cpu.X)` |
| `DEX` | `cpu.X = dec(cpu.X)` |
| `INY` | `cpu.Y = inc(cpu.Y)` |
| `DEY` | `cpu.Y = dec(cpu.Y)` |
| `CLC` | `cpu.C = false` |
| `SEC` | `cpu.C = true` |
| `CLD` | `cpu.D = false` |
| `SED` | `cpu.D = true` |

### Logic

| Opcode | JS |
|--------|----|
| `AND val` | `and(val)` — modifies cpu.A, cpu.N, cpu.Z |
| `ORA val` | `ora(val)` — modifies cpu.A, cpu.N, cpu.Z |
| `EOR val` | `eor(val)` — modifies cpu.A, cpu.N, cpu.Z |
| `BIT addr` | `bit(mem[addr])` — sets N, V, Z |

### Shift / Rotate

| Opcode | JS |
|--------|----|
| `ASL` (accumulator) | `cpu.A = asl(cpu.A)` |
| `ASL addr` | `mem[addr] = asl(mem[addr])` |
| `LSR` (accumulator) | `cpu.A = lsr(cpu.A)` |
| `LSR addr` | `mem[addr] = lsr(mem[addr])` |
| `ROL` (accumulator) | `cpu.A = rol(cpu.A)` |
| `ROL addr` | `mem[addr] = rol(mem[addr])` |
| `ROR` (accumulator) | `cpu.A = ror(cpu.A)` |
| `ROR addr` | `mem[addr] = ror(mem[addr])` |

### Compare

| Opcode | JS |
|--------|----|
| `CMP val` | `cmp(cpu.A, val)` |
| `CPX val` | `cmp(cpu.X, val)` |
| `CPY val` | `cmp(cpu.Y, val)` |

### Stack

| Opcode | JS |
|--------|----|
| `PHA` | `push(cpu.A)` |
| `PLA` | `cpu.A = setNZ(pop())` |
| `PHX` | `push(cpu.X)` |
| `PLX` | `cpu.X = setNZ(pop())` |

---

## 5. Control Flow — Branches and Jumps

Branches in 6502 are conditional gotos. In JS, translate them to `if` statements.
The condition depends on which flag was set by the preceding operation.

### Branch conditions

| Branch | Condition | JS test |
|--------|-----------|---------|
| `BEQ label` | Z=1 (equal) | `if (cpu.Z)` |
| `BNE label` | Z=0 (not equal) | `if (!cpu.Z)` |
| `BCS label` | C=1 | `if (cpu.C)` |
| `BCC label` | C=0 | `if (!cpu.C)` |
| `BMI label` | N=1 (negative) | `if (cpu.N)` |
| `BPL label` | N=0 (positive) | `if (!cpu.N)` |
| `BVS label` | V=1 (overflow) | `if (cpu.V)` |
| `BVC label` | V=0 | `if (!cpu.V)` |

### Forward branches (skip over code)

```asm
LDA GMOVRF
BEQ GAMCNS       ; jump forward if zero
LDA ATTIMR
BNE PCTRIG       ; jump forward if non-zero
LDA #4
BNE PCEXT1
GAMCNS ...
```
```js
cpu.A = setNZ(mem[ADDR.GMOVRF]);
if (!cpu.Z) {                        // BEQ GAMCNS → if (!Z) do the block
  cpu.A = setNZ(mem[ADDR.ATTIMR]);
  if (!cpu.Z) {                      // BNE PCTRIG → if (!Z) skip to PCTRIG
    // ... (PCTRIG block)
    return; // or goto PCTRIG (use PCTRIG() call)
  }
  cpu.A = setNZ(4);
  // BNE PCEXT1 always branches here since A=4≠0
  return PCEXT1(); // tail-call
}
// GAMCNS:
```

### Loop patterns

#### Count-down loop (DEX + BPL)

```asm
LDX #7
LOOP STA AUDF1,X
     DEX
     BPL LOOP
```
```js
for (let i = 7; i >= 0; i--) {
  writeMem(ADDR.AUDF1 + i, cpu.A);
}
```

#### Count-up loop (INX + BNE)

```asm
LDX #0
LOOP LDA TABLE,X
     STA DEST,X
     INX
     BNE LOOP
```
```js
for (let i = 0; i < 256; i++) {
  mem[ADDR.DEST + i] = mem[ADDR.TABLE + i];
}
```

#### Loop with early exit

```asm
LDX #3
LOOP LDA M1STAT,X
     BNE FOUND
     DEX
     BPL LOOP
     BRK  ; or RTS
FOUND ...
```
```js
let found = false;
for (let i = 3; i >= 0; i--) {
  cpu.X = i;
  cpu.A = setNZ(mem[ADDR.M1STAT + i]);
  if (!cpu.Z) { found = true; break; }
}
if (found) {
  // FOUND: block
}
```

### Subroutine calls

```asm
JSR VBSUBS
```
```js
VBSUBS();
```

### Tail-calls (JSR at end of subroutine / JMP)

```asm
MNTSCH JMP MCHASE
```
```js
function MNTSCH() { return MCHASE(); }
```

Or inline as the last statement:

```asm
JSR MAZHND
RTS
```
```js
MAZHND();  // last call before return — JS returns automatically
```

---

## 6. Common Patterns in This Codebase

### RTCLOK timing

Many routines wait for a clock tick or use RTCLOK+2 (the 60Hz byte counter):

```asm
SKIRTS LDA RTCLOK+2
ISKIRT INC MSKIRT
       ...
```
The game typically compares RTCLOK+2 to a saved value to detect frame passage.
In JS, RTCLOK is updated by `tickRTCLOK()` in gameloop.js each frame, so any
logic that `CMP RTCLOK+2` and branches on equality is checking "has one frame
passed?".

Pattern: compare, branch if equal means "not yet":
```asm
LDA SAVED
CMP RTCLOK+2
BEQ NOTYET
```
```js
if (mem[ADDR.SAVED] === mem[ADDR.RTCLOK + 2]) return; // BEQ NOTYET
```

### STICK0 / PORTA direction values

Joystick bits (active-low, set by input.js):

| Direction | STICK0 value |
|-----------|--------------|
| All released (idle) | $0F |
| Up | $0E |
| Down | $0D |
| Left | $0B |
| Right | $07 |

The game reads `mem[ADDR.STICK0]` and uses AND + CMP to test individual bits.

```asm
LDA STICK0
AND #8        ; test right bit
BNE NOTRIGHT  ; branch if bit is SET (not pressed)
```
```js
cpu.A = setNZ(mem[ADDR.STICK0]);
and(8);
if (!cpu.Z) {  // BNE NOTRIGHT
  // ...
}
```

### CONSOL bits (F2/F3/F4 keys)

CONSOL at $D01F is active-low: bit clear = key pressed.

```
bit 0 = START (F4)
bit 1 = SELECT (F3)
bit 2 = OPTION (F2)
$07 = all released
$06 = START pressed
$05 = SELECT pressed
$03 = OPTION pressed
```

```asm
LDA CONSOL
CMP #7        ; no buttons pressed
BEQ LOOP
```
```js
cpu.A = setNZ(readMem(ADDR.CONSOL));
cmp(cpu.A, 7);
if (cpu.Z) return; // BEQ LOOP
```

### P/M graphics: writing sprite bitmaps

The game writes sprite bytes directly to memory pages at the P/M base address.
Player 0 is at `PMBASE_VALUE + $100`, Player 1 at `+$200`, etc.
The byte offset within the page = scanline Y position.

```asm
LDA #>PMADDR  ; high byte = $28 for PMADDR=$2800
STA PMBASE    ; tell ANTIC where P/M data is
```

In JS: the renderer reads `mem[ADDR.PMBASE] << 8` to find the P/M base, then
scans each player's page for non-zero bytes.

When the translation writes sprites:
```asm
LDA sprite_byte
STA (PIXPUT),Y    ; PIXPUT is a 2-byte zero-page pointer
```
```js
writeIndY(ADDR.PIXPUT, cpu.A);
```

### BCD scoring (SCOREX array)

Score is stored as 6 BCD bytes in `mem[ADDR.SCOREX]`. The game uses:
- `cpu.D = true` before `adc()` calls involving score
- The actual display maps score digits directly to character codes

```asm
SED               ; cpu.D = true
LDA SCOREX+4
ADC #$10          ; add 100 points (BCD)
STA SCOREX+4
CLD               ; cpu.D = false
```
```js
cpu.D = true;
cpu.A = setNZ(mem[ADDR.SCOREX + 4]);
adc(0x10);
mem[ADDR.SCOREX + 4] = cpu.A;
cpu.D = false;
```

### Monster status byte (M1STAT..M4STAT)

Status values (from game comments):
- `0` = not active / in pen
- `1` = start path (exiting pen)
- `2` = following start path
- `8` = chasing
- `$10` = frightened (blue)
- `$20` = eyes-only (going home)

The monster handler in PAC4 dispatches on these values.

### Direction encoding

Direction bits (for DIRT/DIR variables):
- `1` = up
- `2` = down
- `4` = left
- `8` = right

MAZHND returns a bitmask of allowed directions.

---

## 7. What NOT To Do

1. **Never import DOM, Electron, canvas, or Node APIs.** Only use `../src/runtime.js` imports.

2. **Never cache a read from mem[].** Always read fresh. Hardware registers (RANDOM, CONSOL, etc.) change between accesses.

3. **Never skip flag updates.** Every ALU operation must call the appropriate setter (`setNZ`, `setNZC`, `adc`, etc.). The next branch depends on the flags.

4. **Never use `return` to simulate a branch to a label mid-function unless that label is the function's natural exit.** If a label is in the middle, use `if`/`else` blocks.

5. **Never use `async`/`await`, Promises, or callbacks.** All game logic is synchronous.

6. **Never omit X/Y register updates when the code uses them.** `cpu.X` and `cpu.Y` persist between calls just like the real registers.

7. **Do not use `===` for multi-byte comparisons.** The 6502 CMP is always byte-sized.

---

## 8. Worked Examples from This Codebase

### Example 1: CLRAUD (PAC2.ASM)

```asm
CLRAUD LDY #7
CLRAUL LDA #0
       STA AUDF1,Y
       DEY
       BPL CLRAUL
       RTS
```

```js
export function CLRAUD() {
  for (let i = 7; i >= 0; i--) {
    writeMem(ADDR.AUDF1 + i, 0);
  }
}
```

### Example 2: SKIRTS (PAC2.ASM) — timing + early exit

```asm
SKIRTS LDA RTCLOK+2
ISKIRT INC MSKIRT
SKIRTX RTS
```

This loads RTCLOK+2 but doesn't compare it here (context: called every frame,
the increment advances an animation counter):

```js
export function SKIRTS() {
  cpu.A = setNZ(mem[ADDR.RTCLOK + 2]);  // LDA RTCLOK+2
  // ISKIRT:
  mem[ADDR.MSKIRT] = inc(mem[ADDR.MSKIRT]);  // INC MSKIRT
  // SKIRTX: RTS
}
```

### Example 3: VBLANK dispatcher (PACMAN.ASM)

```asm
VBLANK LDA #0
       STA DLICNT
       DEC BCOUNT
       JSR VBSUBS
       LDA ATSEQU
       BNE VBEXIT
       LDA VFREEZ
       BNE VBEXIT
       JSR TUNNEL
VBEXIT JMP XITVBV
```

```js
export function VBLANK() {
  mem[ADDR.DLICNT] = 0;
  mem[ADDR.BCOUNT] = (mem[ADDR.BCOUNT] - 1 + 256) & 0xFF;
  VBSUBS();
  cpu.A = setNZ(mem[ADDR.ATSEQU]);
  if (!cpu.Z) return;  // BNE VBEXIT
  cpu.A = setNZ(mem[ADDR.VFREEZ]);
  if (!cpu.Z) return;  // BNE VBEXIT
  TUNNEL();
  // XITVBV is the OS VBI return — no-op in JS (just return)
}
```

### Example 4: Monster loop with indexed access (PAC4.ASM)

```asm
CKINBX LDX #3
NMEYLP LDA M1STAT,X
       ...
       DEX
       BPL NMEYLP
```

```js
export function CKINBX() {
  for (let i = 3; i >= 0; i--) {
    cpu.X = i;
    cpu.A = setNZ(mem[ADDR.M1STAT + i]);
    // ... process each monster
  }
}
```

### Example 5: P/M sprite write via indirect pointer (PAC3.ASM)

```asm
MOVPAC LDX PMSEQU     ; animation frame index
...
PPLOOP LDA (PIXGET),Y  ; read from sprite table
       STA (PIXPUT),Y  ; write to P/M page
       INY
       CPY #10
       BNE PPLOOP
```

```js
function PPLOOP() {
  cpu.Y = 0;
  while (true) {
    cpu.A = setNZ(readIndY(ADDR.PIXGET));
    writeIndY(ADDR.PIXPUT, cpu.A);
    cpu.Y = inc(cpu.Y);
    cmp(cpu.Y, 10);
    if (!cpu.Z) continue;  // BNE PPLOOP
    break;
  }
}
```

---

## 9. Key Address Summary

All addresses are in `ADDR` from runtime.js. The most-used ones:

| Name | Address | Purpose |
|------|---------|---------|
| `ADDR.DLICNT` | $0018 | DLI count (zeroed each VBI) |
| `ADDR.ATSEQU` | $001F | Attract sequence# (0=game mode) |
| `ADDR.GMOVRF` | $0020 | Game-over flag |
| `ADDR.RRFLAG` | $0026 | Rerack (level complete) flag |
| `ADDR.RRSEQU` | $0027 | Rerack sequence step |
| `ADDR.BCOUNT` | $0045 | Bounce debounce counter |
| `ADDR.M1VPOS` | $0085 | Monster 1 vertical position |
| `ADDR.PMVPOS` | $0089 | Pac-Man vertical position |
| `ADDR.M1HPOS` | $008A | Monster 1 horizontal position |
| `ADDR.PMHPOS` | $008E | Pac-Man horizontal position |
| `ADDR.M1DIRT` | $008F | Monster 1 direction |
| `ADDR.M1STAT` | $00CE | Monster 1 status |
| `ADDR.PMSTAT` | $00AA | Pac-Man status |
| `ADDR.PMNDIR` | $00AC | Pac-Man new direction (from joystick) |
| `ADDR.VFREEZ` | $00E5 | Freeze flag (pause all monster AI) |
| `ADDR.RTCLOK` | $0012 | 60Hz clock (3 bytes; +2 = fast byte) |
| `ADDR.STICK0` | $0278 | Joystick 0 OS shadow |
| `ADDR.CONSOL` | $D01F | Console keys (F2/F3/F4) |
| `ADDR.PACMAZ` | $1400 | Active maze screen memory (40×24) |
| `ADDR.PMADDR` | $2800 | Player/Missile graphics base |
| `ADDR.PACCHR` | $4000 | Pac-Man character set bitmap data |
| `ADDR.DATMAZ` | $4398 | Original maze data (source for PACMAZ) |

---

## 10. File-by-file Translation Order

Translate in this order to minimize forward-reference issues:

1. **pac3.js** — MAZHND, INITPM, P1INIT (no deps on pac1/pac2/pac4)
2. **pac2.js** — CLRAUD, SETUP, NEWGAM, RERACK (deps: pac3.INITPM)
3. **pac4.js** — ghost AI (deps: pac3.MAZHND)
4. **pac1.js** — VBI dispatcher (deps: pac2, pac3, pac4)
5. **pacman.js** — VBLANK entry (deps: pac1, pac2, pac3)

Within each file, translate subroutines in top-to-bottom source order so callee
functions exist before caller functions reference them.

---

## 11. Verification Checklist

After translating each subroutine:

- [ ] Every `LDA`/`LDX`/`LDY` calls `setNZ()` and stores into `cpu.A/X/Y`
- [ ] Every `STA` at hardware range uses `writeMem()`, not `mem[]`
- [ ] Every `CMP`/`CPX`/`CPY` calls `cmp()`
- [ ] Every branch reads the correct flag (`cpu.Z`, `cpu.C`, `cpu.N`)
- [ ] `DEX`/`INX` etc. call `dec()`/`inc()` which update flags
- [ ] BCD operations bracket with `cpu.D = true` / `cpu.D = false`
- [ ] Loops terminate (no infinite loops for untranslated branches)
- [ ] No imported symbols that don't exist in runtime.js
