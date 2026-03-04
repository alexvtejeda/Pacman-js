// audio.js — POKEY 4-channel audio via Web Audio API

let ctx = null;

// Per-channel state
const channels = [null, null, null, null].map(() => ({
  osc: null,
  gain: null,
  freq: 0,
  ctrl: 0,
}));

function ensureContext() {
  if (!ctx) {
    ctx = new AudioContext();
    for (let i = 0; i < 4; i++) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 440;
      osc.connect(gain);
      osc.start();

      channels[i].osc = osc;
      channels[i].gain = gain;
    }
  }
}

// POKEY frequency byte → Hz
// Clock = 1,789,790 Hz (NTSC), divide-by-28 mode unless AUDCTL sets 64kHz
function pokeyFreqToHz(freqByte) {
  return 1789790 / (2 * (freqByte + 1));
}

// AUDC bits: [7:4] = distortion/waveform, [3:0] = volume
function ctrlToVolume(ctrl) {
  return (ctrl & 0x0F) / 15;
}

function ctrlToWaveform(ctrl) {
  const mode = (ctrl >> 4) & 0x0F;
  // Mode 0xA = pure tone, others are noise; approximate all non-zero as square
  if (mode === 0x0A || mode === 0x0C || mode === 0x0E) return 'square';
  if (ctrl === 0) return 'square'; // silent anyway
  return 'sawtooth'; // noise approximation
}

// Called by hardware.js whenever AUDF1-4 or AUDC1-4 are written
export function updateChannel(ch, freqByte, ctrlByte) {
  if (ch < 0 || ch > 3) return;
  ensureContext();

  const c = channels[ch];
  const vol = ctrlToVolume(ctrlByte);
  const hz = pokeyFreqToHz(freqByte);
  const wave = ctrlToWaveform(ctrlByte);

  c.osc.type = wave;
  c.osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.01);
  c.gain.gain.setTargetAtTime(vol * 0.25, ctx.currentTime, 0.01); // *0.25 to prevent clipping
}
