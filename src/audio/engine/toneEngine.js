import * as Tone from 'tone';

export async function initAudio() {
  await Tone.start();
  return Tone.Transport;
}