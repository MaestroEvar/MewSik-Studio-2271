import * as Tone from 'tone';

let isStarted = false;

export async function initAudio() {
    if (!isStarted) {
        await Tone.start();
        isStarted = true;
    }
    return Tone.Transport;
}

export function playSound(url) {
    if (!url) return null;
    const player = new Tone.Player(url).toDestination();
    player.autostart = true;
    return player;
}

export function stopAll() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
}