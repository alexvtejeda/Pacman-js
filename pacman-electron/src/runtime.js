// runtime.js — 6502 runtime platform for Atari Pac-Man
// This is the core contract that all translated/*.js files code against.
// DO NOT import Electron, DOM, or Node APIs here.
// DO NOT import other src/ modules here (breaks circular deps).

// ─── Memory ──────────────────────────────────────────────────────────────────

export const mem = new Uint8Array(65536);

// Hardware dispatch — registered at startup by gameloop.js via registerHardware()
let _readHW = (addr) => mem[addr];
let _writeHW = (addr, val) => { mem[addr] = val; };

// Called by gameloop.js after importing hardware.js
export function registerHardware(r, w) {
  _readHW = r;
  _writeHW = w;
}

// Hardware register range
const HW_LO = 0xD000;
const HW_HI = 0xD4FF;

export function readMem(addr) {
  addr &= 0xFFFF;
  if (addr >= HW_LO && addr <= HW_HI) return _readHW(addr);
  return mem[addr];
}

export function writeMem(addr, val) {
  addr &= 0xFFFF;
  val &= 0xFF;
  if (addr >= HW_LO && addr <= HW_HI) { _writeHW(addr, val); return; }
  mem[addr] = val;
}

// Zero-page convenience
export function zp(addr)           { return mem[addr & 0xFF]; }
export function setZP(addr, val)   { mem[addr & 0xFF] = val & 0xFF; }

// Indexed / indirect addressing
export function readAbsX(base)     { return readMem((base + cpu.X) & 0xFFFF); }
export function readAbsY(base)     { return readMem((base + cpu.Y) & 0xFFFF); }
export function writeAbsX(base, v) { writeMem((base + cpu.X) & 0xFFFF, v); }
export function writeAbsY(base, v) { writeMem((base + cpu.Y) & 0xFFFF, v); }

export function readZPX(zaddr)  { return mem[(zaddr + cpu.X) & 0xFF]; }
export function readZPY(zaddr)  { return mem[(zaddr + cpu.Y) & 0xFF]; }
export function writeZPX(zaddr, v) { mem[(zaddr + cpu.X) & 0xFF] = v & 0xFF; }
export function writeZPY(zaddr, v) { mem[(zaddr + cpu.Y) & 0xFF] = v & 0xFF; }

// (zp,X) indirect — read 2-byte pointer from zero-page+X, then read at pointer
export function readIndX(zaddr) {
  const ptr = (zaddr + cpu.X) & 0xFF;
  const lo = mem[ptr], hi = mem[(ptr + 1) & 0xFF];
  return readMem(lo | (hi << 8));
}
export function writeIndX(zaddr, v) {
  const ptr = (zaddr + cpu.X) & 0xFF;
  const lo = mem[ptr], hi = mem[(ptr + 1) & 0xFF];
  writeMem(lo | (hi << 8), v);
}

// (zp),Y indirect — read 2-byte pointer from zero-page, add Y, then read
export function readIndY(zaddr) {
  const lo = mem[zaddr & 0xFF], hi = mem[(zaddr + 1) & 0xFF];
  return readMem(((lo | (hi << 8)) + cpu.Y) & 0xFFFF);
}
export function writeIndY(zaddr, v) {
  const lo = mem[zaddr & 0xFF], hi = mem[(zaddr + 1) & 0xFF];
  writeMem(((lo | (hi << 8)) + cpu.Y) & 0xFFFF, v);
}

// ─── CPU Registers ───────────────────────────────────────────────────────────

export const cpu = {
  A: 0, X: 0, Y: 0,
  SP: 0xFF,
  N: false, V: false, Z: false, C: false, D: false,
};

// ─── Flag Helpers ─────────────────────────────────────────────────────────────

export function setNZ(val) {
  val &= 0xFF;
  cpu.N = (val & 0x80) !== 0;
  cpu.Z = val === 0;
  return val;
}

// Sets N, Z, and C from a raw 9-bit result (bit 8 = carry)
export function setNZC(val) {
  cpu.C = (val & 0x100) !== 0;
  return setNZ(val);
}

// ─── ALU ─────────────────────────────────────────────────────────────────────

export function adc(val) {
  val &= 0xFF;
  if (cpu.D) {
    // BCD addition (used for scoring)
    let lo = (cpu.A & 0x0F) + (val & 0x0F) + (cpu.C ? 1 : 0);
    if (lo > 9) lo += 6;
    let hi = (cpu.A >> 4) + (val >> 4) + (lo > 15 ? 1 : 0);
    if (hi > 9) hi += 6;
    const result = ((hi & 0x0F) << 4) | (lo & 0x0F);
    cpu.C = hi > 15;
    cpu.V = false; // simplified — not needed for Pac-Man scoring
    cpu.A = setNZ(result);
  } else {
    const result = cpu.A + val + (cpu.C ? 1 : 0);
    cpu.V = (~(cpu.A ^ val) & (cpu.A ^ result) & 0x80) !== 0;
    cpu.A = setNZC(result);
  }
}

export function sbc(val) {
  val &= 0xFF;
  if (cpu.D) {
    let lo = (cpu.A & 0x0F) - (val & 0x0F) - (cpu.C ? 0 : 1);
    if (lo < 0) lo -= 6;
    let hi = (cpu.A >> 4) - (val >> 4) - (lo < 0 ? 1 : 0);
    if (hi < 0) hi -= 6;
    const result = ((hi & 0x0F) << 4) | (lo & 0x0F);
    cpu.C = hi >= 0;
    cpu.A = setNZ(result);
  } else {
    const result = cpu.A - val - (cpu.C ? 0 : 1);
    cpu.V = ((cpu.A ^ val) & (cpu.A ^ result) & 0x80) !== 0;
    cpu.C = result >= 0;
    cpu.A = setNZ(result & 0xFF);
  }
}

export function and(val) { cpu.A = setNZ(cpu.A & val); }
export function ora(val) { cpu.A = setNZ(cpu.A | val); }
export function eor(val) { cpu.A = setNZ(cpu.A ^ val); }

export function bit(val) {
  val &= 0xFF;
  cpu.N = (val & 0x80) !== 0;
  cpu.V = (val & 0x40) !== 0;
  cpu.Z = (cpu.A & val) === 0;
}

// CMP / CPX / CPY — compare a with b, set N/Z/C
export function cmp(a, b) {
  a &= 0xFF; b &= 0xFF;
  const result = a - b;
  cpu.C = result >= 0;
  cpu.N = (result & 0x80) !== 0;
  cpu.Z = (result & 0xFF) === 0;
}

export function asl(val) {
  val &= 0xFF;
  cpu.C = (val & 0x80) !== 0;
  return setNZ((val << 1) & 0xFF);
}

export function lsr(val) {
  val &= 0xFF;
  cpu.C = (val & 0x01) !== 0;
  return setNZ(val >> 1);
}

export function rol(val) {
  val &= 0xFF;
  const result = ((val << 1) | (cpu.C ? 1 : 0)) & 0xFF;
  cpu.C = (val & 0x80) !== 0;
  return setNZ(result);
}

export function ror(val) {
  val &= 0xFF;
  const result = (val >> 1) | (cpu.C ? 0x80 : 0);
  cpu.C = (val & 0x01) !== 0;
  return setNZ(result);
}

export function inc(val) { return setNZ((val + 1) & 0xFF); }
export function dec(val) { return setNZ((val - 1 + 256) & 0xFF); }

// ─── Stack ────────────────────────────────────────────────────────────────────

export function push(val) {
  mem[0x0100 + cpu.SP] = val & 0xFF;
  cpu.SP = (cpu.SP - 1) & 0xFF;
}

export function pop() {
  cpu.SP = (cpu.SP + 1) & 0xFF;
  return mem[0x0100 + cpu.SP];
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

// Pseudo-random — mirrors POKEY RANDOM register behavior (simple LFSR)
let _rngState = 0xACE1;
export function random() {
  _rngState ^= _rngState << 13;
  _rngState ^= _rngState >> 7;
  _rngState ^= _rngState << 5;
  const val = _rngState & 0xFF;
  mem[ADDR.RANDOM] = val;
  return val;
}

// RTCLOK is a 3-byte 60Hz counter at $0012-$0014
export function tickRTCLOK() {
  let lo = mem[0x0014] + 1;
  if (lo > 0xFF) { lo = 0; let mid = mem[0x0013] + 1; if (mid > 0xFF) { mid = 0; mem[0x0012] = (mem[0x0012] + 1) & 0xFF; } mem[0x0013] = mid; }
  mem[0x0014] = lo;
}

// ─── ADDR Constants ──────────────────────────────────────────────────────────
// All symbolic names from PACMAN.ASM and SYSTEXT.ASM

export const ADDR = {
  // ── OS Equates (SYSTEXT.ASM) ──
  DOSVEC:  0x000A,
  DOSINI:  0x000C,
  POKMSK:  0x0010,
  BRKKEY:  0x0011,
  RTCLOK:  0x0012,   // 3 bytes: $0012-$0014

  ATRACT:  0x004D,
  DRKMSK:  0x004E,
  COLRSH:  0x004F,

  VDSLST:  0x0200,
  VIMIRQ:  0x0216,
  SRTIMR:  0x022B,
  SDMCTL:  0x022F,
  SDLSTL:  0x0230,
  SDLSTH:  0x0231,
  SSKCTL:  0x0232,
  LPENH:   0x0234,
  LPENV:   0x0235,
  GPRIOR:  0x026F,
  PADDL0:  0x0270,
  STICK0:  0x0278,
  STRIG0:  0x0284,
  STRIG1:  0x0285,
  SHFLK:   0x02BE,
  PCOLR0:  0x02C0,
  PCOLR1:  0x02C1,
  PCOLR2:  0x02C2,
  PCOLR3:  0x02C3,
  COLOR0:  0x02C4,
  COLOR1:  0x02C5,
  COLOR2:  0x02C6,
  COLOR3:  0x02C7,
  MEMLO:   0x02E7,
  KEYDEL:  0x02F1,
  CHART:   0x02F3,
  CHBAS:   0x02F4,
  CH:      0x02FC,

  DDEVIC:  0x0300,
  DUNIT:   0x0301,
  DCOMND:  0x0302,
  DSTATS:  0x0303,
  DBUFLO:  0x0304,
  DBUFHI:  0x0305,
  DTIMLO:  0x0306,
  DBYTLO:  0x0308,
  DBYTHI:  0x0309,
  DAUX1:   0x030A,
  DAUX2:   0x030B,
  ICCOM:   0x0342,
  ICBAL:   0x0344,
  ICBAH:   0x0345,
  ICBLL:   0x0348,
  ICBLH:   0x0349,
  ICAX1:   0x034A,
  ICAX2:   0x034B,

  // ── Hardware Registers (SYSTEXT.ASM) ──
  // GTIA ($D000-$D01F) — write = player/missile regs; read = collision regs
  HPOSP0:  0xD000,
  HPOSP1:  0xD001,
  HPOSP2:  0xD002,
  HPOSP3:  0xD003,
  M0PF:    0xD000,  // read: missile-0 to playfield collision
  M1PF:    0xD001,
  M2PF:    0xD002,
  M3PF:    0xD003,
  HPOSM0:  0xD004,
  HPOSM1:  0xD005,
  HPOSM2:  0xD006,
  HPOSM3:  0xD007,
  P0PF:    0xD004,  // read: player-0 to playfield collision
  P1PF:    0xD005,
  P2PF:    0xD006,
  P3PF:    0xD007,
  M0PL:    0xD008,  // read: missile-0 to player collision
  M1PL:    0xD009,
  M2PL:    0xD00A,
  M3PL:    0xD00B,
  SIZEP0:  0xD008,  // write: player size
  SIZEP1:  0xD009,
  SIZEP2:  0xD00A,
  SIZEP3:  0xD00B,
  P0PL:    0xD00C,  // read: player-0 to player collision
  P1PL:    0xD00D,
  P2PL:    0xD00E,
  P3PL:    0xD00F,
  SIZEM:   0xD00C,  // write: all missile sizes
  GRAFP0:  0xD00D,
  GRAFP1:  0xD00E,
  GRAFP2:  0xD00F,
  GRAFP3:  0xD010,
  TRIG0:   0xD010,
  GRAFM:   0xD011,
  COLPM0:  0xD012,
  COLPM1:  0xD013,
  COLPM2:  0xD014,
  COLPM3:  0xD015,
  COLPF0:  0xD016,
  COLPF1:  0xD017,
  COLPF2:  0xD018,
  COLPF3:  0xD019,
  COLBK:   0xD01A,
  PRIOR:   0xD01B,
  VDELAY:  0xD01C,
  GRACTL:  0xD01D,
  HITCLR:  0xD01E,
  CONSOL:  0xD01F,

  // POKEY ($D200-$D20F)
  AUDF1:   0xD200,
  AUDC1:   0xD201,
  AUDF2:   0xD202,
  AUDC2:   0xD203,
  AUDF3:   0xD204,
  AUDC3:   0xD205,
  AUDF4:   0xD206,
  AUDC4:   0xD207,
  AUDCTL:  0xD208,
  ALLPOT:  0xD208,
  KBCODE:  0xD209,
  STIMER:  0xD209,
  RANDOM:  0xD20A,
  SERIN:   0xD20A,
  SKREST:  0xD20A,
  POTGO:   0xD20B,
  SEROUT:  0xD20C,
  IRQEN:   0xD20E,
  IRQST:   0xD20E,
  SKCTL:   0xD20F,
  SKSTAT:  0xD20F,

  // PIA ($D300)
  PORTA:   0xD300,

  // ANTIC ($D400-$D40F)
  DMACTL:  0xD400,
  CHACTL:  0xD401,
  DLISTL:  0xD402,
  DLISTH:  0xD403,
  HSCROL:  0xD404,
  VSCROL:  0xD405,
  PMBASE:  0xD407,
  CHBASE:  0xD409,
  WSYNC:   0xD40A,
  VCOUNT:  0xD40B,
  PENH:    0xD40C,
  PENV:    0xD40D,
  NMIEN:   0xD40E,
  NMIRES:  0xD40F,
  NMIST:   0xD40F,

  // ── Zero-page game variables (PACMAN.ASM) ──
  // Starting at $0018
  DLICNT:  0x0018,
  OPTION:  0x0019,
  NUMPLY:  0x001A,
  DIFOPT:  0x001B,
  RSTRTF:  0x001C,
  ATCLOK:  0x001D,
  ATTIMR:  0x001E,
  ATSEQU:  0x001F,

  GMOVRF:  0x0020,
  READYF:  0x0021,
  INTROF:  0x0022,
  SWAPPF:  0x0023,
  RESETF:  0x0024,
  RESETT:  0x0025,
  RRFLAG:  0x0026,
  RRSEQU:  0x0027,
  RRTIMR:  0x0028,
  RRFLCT:  0x0029,
  TEMLOC:  0x002A,
  PLYNUM:  0x002B,
  XPACP1:  0x002C,
  XPACP2:  0x002D,
  BPACP1:  0x002E,
  BPACP2:  0x002F,
  MAZCT1:  0x0030,
  MAZCT2:  0x0031,
  BIGDT1:  0x0032,
  BIGDT2:  0x0033,
  DTCTL1:  0x0034,
  DTCTL2:  0x0035,
  DTCTM1:  0x0036,
  DTCTM2:  0x0037,
  SCNSC1:  0x0038,  // 2 bytes
  SCNSC2:  0x003A,  // 2 bytes
  PIXGET:  0x003C,  // 2 bytes
  PIXPUT:  0x003E,  // 2 bytes
  PACCLR:  0x0040,

  // $0043
  FRUTP1:  0x0043,
  FRUTP2:  0x0044,
  BCOUNT:  0x0045,
  SAVCNS:  0x0046,
  TUNLOC:  0x0047,  // 2 bytes

  // $005A
  M1DELY:  0x005A,
  M2DELY:  0x005B,
  M3DELY:  0x005C,
  M4DELY:  0x005D,
  ACOLR1:  0x005E,
  ACOLR2:  0x005F,
  ACOLR3:  0x0060,
  ACOLR4:  0x0061,
  INTCNT:  0x0062,
  INTCLK:  0x0063,

  // $0080
  PACSCN:  0x0080,  // 2 bytes
  PACBYT:  0x0082,
  PVSAVE:  0x0083,
  PHSAVE:  0x0084,
  M1VPOS:  0x0085,
  M2VPOS:  0x0086,
  M3VPOS:  0x0087,
  M4VPOS:  0x0088,
  PMVPOS:  0x0089,
  M1HPOS:  0x008A,
  M2HPOS:  0x008B,
  M3HPOS:  0x008C,
  M4HPOS:  0x008D,
  PMHPOS:  0x008E,
  M1DIRT:  0x008F,
  M2DIRT:  0x0090,
  M3DIRT:  0x0091,
  M4DIRT:  0x0092,
  PMODIR:  0x0093,
  SCOREX:  0x0094,  // 6 bytes
  CARRYB:  0x009A,
  PAUSEF:  0x009B,
  WHINEY:  0x009C,
  FRUTMR:  0x009D,  // 2 bytes
  FRUFLG:  0x009F,
  FRUCLR:  0x00A0,
  FRSCRF:  0x00A1,
  FRSCRT:  0x00A2,
  NOTCNT:  0x00A3,
  VSAVER:  0x00A4,
  HSAVER:  0x00A5,
  PACMAP:  0x00A6,
  PACCNT:  0x00A7,
  PACADV:  0x00A8,
  PACDLY:  0x00A9,
  PMSTAT:  0x00AA,
  PMSEQU:  0x00AB,
  PMNDIR:  0x00AC,
  CHASET:  0x00AD,
  MSTILL:  0x00AE,
  MSKIRT:  0x00AF,
  M1SPSQ:  0x00B0,
  M2SPSQ:  0x00B1,
  M3SPSQ:  0x00B2,
  M4SPSQ:  0x00B3,
  PMSPSQ:  0x00B4,
  M1SPCT:  0x00B5,
  M2SPCT:  0x00B6,
  M3SPCT:  0x00B7,
  M4SPCT:  0x00B8,
  PMSPCT:  0x00B9,
  M1PIDX:  0x00BA,
  M2PIDX:  0x00BB,
  M3PIDX:  0x00BC,
  M4PIDX:  0x00BD,
  M1PCNT:  0x00BE,
  M2PCNT:  0x00BF,
  M3PCNT:  0x00C0,
  M4PCNT:  0x00C1,
  M1THPS:  0x00C2,
  M2THPS:  0x00C3,
  M3THPS:  0x00C4,
  M4THPS:  0x00C5,
  M1TVPS:  0x00C6,
  M2TVPS:  0x00C7,
  M3TVPS:  0x00C8,
  M4TVPS:  0x00C9,
  M1TIMR:  0x00CA,
  M2TIMR:  0x00CB,
  M3TIMR:  0x00CC,
  M4TIMR:  0x00CD,
  M1STAT:  0x00CE,
  M2STAT:  0x00CF,
  M3STAT:  0x00D0,
  M4STAT:  0x00D1,
  M1SSEQ:  0x00D2,
  M2SSEQ:  0x00D3,
  M3SSEQ:  0x00D4,
  M4SSEQ:  0x00D5,
  M1VDIR:  0x00D6,
  M2VDIR:  0x00D7,
  M3VDIR:  0x00D8,
  M4VDIR:  0x00D9,
  M1HDIR:  0x00DA,
  M2HDIR:  0x00DB,
  M3HDIR:  0x00DC,
  M4HDIR:  0x00DD,
  VCHASF:  0x00DE,
  VCHASD:  0x00DF,
  VCHASS:  0x00E0,
  VFLITF:  0x00E1,
  VFLITD:  0x00E2,
  VFLITV:  0x00E3,
  VFLITS:  0x00E4,
  VFREEZ:  0x00E5,
  VGLPC1:  0x00E6,
  VGLPC2:  0x00E7,
  GULPED:  0x00E8,
  GLPCNT:  0x00E9,
  FIZZLE:  0x00EA,
  FIZPTR:  0x00EB,
  FIZTIM:  0x00EC,
  VFIZST:  0x00ED,
  VFIZSQ:  0x00EE,
  VFIZBS:  0x00EF,
  VFIZFQ:  0x00F0,
  VFIZCT:  0x00F1,
  TWEETR:  0x00F2,
  TWEETF:  0x00F3,
  EATERF:  0x00F4,
  EATERC:  0x00F5,
  EATERT:  0x00F6,
  GOBBLD:  0x00F7,
  GOBBLF:  0x00F8,
  BLINKT:  0x00F9,
  FLSHUP:  0x00FA,
  FLASHT:  0x00FB,
  FLASHC:  0x00FC,
  FLITMR:  0x00FD,
  TUNMSK:  0x00FE,
  TUNCNT:  0x00FF,

  // ── Memory layout (PACMAN.ASM computed addresses) ──
  GAMMEM:  0x0800,  // Game memory base
  PACBUF:  0x0600,  // Pac-Man image buffer (16 bytes)
  MONBUF:  0x0610,  // Monster image buffer (16 bytes)
  INTRDL:  0x0680,  // Intermission display list
  INTMOD:  0x06C0,  // Intermission mode
  INTSEQ:  0x06C1,  // Intermission sequence

  PACMAZ:  0x1400,  // GAMMEM + $0C00 — maze screen memory
  P1SAVE:  0x1800,  // GAMMEM + $1000
  P2SAVE:  0x1C00,  // GAMMEM + $1400
  OPTCHR:  0x2000,  // GAMMEM + $1800 — option charset
  OPTSCN:  0x2400,  // GAMMEM + $1C00 — option screen
  PMADDR:  0x2800,  // GAMMEM + $2000 — P/M graphics base
  TEXT:    0x2800,  // same as PMADDR
  PATSCN:  0x3000,  // GAMMEM + $2800
  AMCSET:  0x3400,  // GAMMEM + $2C00 — attract mode charset
};
