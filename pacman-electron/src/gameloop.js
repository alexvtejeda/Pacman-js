// gameloop.js — 60fps VBI game loop

import { tickRTCLOK, registerHardware } from './runtime.js';
import { readHW, writeHW } from './hardware.js';
import { initRenderer, render } from './renderer.js';
import { initInput } from './input.js';
import { VBLANK } from '../translated/pacman.js';
import { initData } from './data.js';

// Wire hardware dispatch into runtime (must happen before any game code runs)
registerHardware(readHW, writeHW);

// Initialize all subsystems
initInput();
initRenderer();
initData();  // copy all static tables into mem[]

function frame() {
  tickRTCLOK();
  VBLANK();
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
