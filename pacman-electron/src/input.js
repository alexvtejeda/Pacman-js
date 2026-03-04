// input.js — Keyboard → Atari joystick / console key mapping
// Writes joystick / CONSOL state directly into mem[] so hardware.js reads it
// without needing to import this module (breaks circular deps).

import { mem, ADDR } from './runtime.js';

// STICK0 / PORTA bit patterns (active-low: 0 = pressed)
const STICK_IDLE  = 0x0F;
const STICK_UP    = 0x0E;  // bit 0 clear
const STICK_DOWN  = 0x0D;  // bit 1 clear
const STICK_LEFT  = 0x0B;  // bit 2 clear
const STICK_RIGHT = 0x07;  // bit 3 clear

let _stick = STICK_IDLE;

// CONSOL bits (active-low): bit2=OPTION(F2), bit1=SELECT(F3), bit0=START(F4)
// $07 = all released
let _consol = 0x07;

// initInput must be called by gameloop.js after all modules are loaded
export function initInput() {
  mem[ADDR.STICK0] = STICK_IDLE;
  mem[ADDR.PORTA]  = STICK_IDLE;
  mem[ADDR.STRIG0] = 1;  // trigger released
  mem[ADDR.STRIG1] = 1;
  mem[0xD01F]      = _consol;  // CONSOL register initial value
}

function updateMem() {
  mem[ADDR.STICK0] = _stick;
  mem[ADDR.PORTA]  = _stick;
  mem[0xD01F]      = _consol;
}

document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowUp':    _stick = STICK_UP;    break;
    case 'ArrowDown':  _stick = STICK_DOWN;  break;
    case 'ArrowLeft':  _stick = STICK_LEFT;  break;
    case 'ArrowRight': _stick = STICK_RIGHT; break;
    case 'F4': _consol &= ~0x01; break;  // START
    case 'F3': _consol &= ~0x02; break;  // SELECT
    case 'F2': _consol &= ~0x04; break;  // OPTION
    default: return;
  }
  updateMem();
  e.preventDefault();
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      _stick = STICK_IDLE;
      break;
    case 'F4': _consol |= 0x01; break;
    case 'F3': _consol |= 0x02; break;
    case 'F2': _consol |= 0x04; break;
    default: return;
  }
  updateMem();
});
