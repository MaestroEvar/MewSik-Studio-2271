import * as Tone from 'tone';

let isStarted = false;

// Кэш загруженных аудио-буферов по url.
// Нужен, чтобы один и тот же звук не грузился заново на каждом шаге цикла.
const bufferCache = new Map();

// Активные плееры секвенсора. Держим их, чтобы по стопу мгновенно оборвать все звуки
const activePlayers = new Set();

export async function initAudio() {
    if (!isStarted) {
        await Tone.start();
        isStarted = true;
    }
    return Tone.Transport;
}

// Проигрывание звука (кнопки "прослушать" в меню кота)
export function playSound(url) {
    if (!url) return null;
    const player = new Tone.Player(url).toDestination();
    player.autostart = true;
    return player;
}

// Предзагрузка по url (с кэшированием).
// Секвенсор грузит все звуки паттерна перед стартом, чтобы не было задержек.
export function loadBuffer(url) {
    if (!url) return Promise.resolve(null);
    if (bufferCache.has(url)) return Promise.resolve(bufferCache.get(url));
    return new Promise((resolve) => {
        const buffer = new Tone.ToneAudioBuffer(url, () => {
            bufferCache.set(url, buffer);
            resolve(buffer);
        });
    });
}

// Длительность загруженного буфера в секундах.
// По ней секвенсор считает, как растянуть Pad на весь такт.
export function getBufferDuration(url) {
    const buffer = bufferCache.get(url);
    return buffer ? buffer.duration : null;
}

// Проигрывание звука в точное время transport-а.
// time - момент по часам Tone, playbackRate - скорость (для Pad зависит от такта).
// Плеер сам себя освобождает после окончания, чтобы не копить мусор.
export function triggerSound(url, time, playbackRate = 1) {
    if (!url) return;
    const cached = bufferCache.get(url);
    const player = cached
        ? new Tone.Player(cached).toDestination()
        : new Tone.Player(url).toDestination();

    player.playbackRate = playbackRate;
    activePlayers.add(player);
    player.onstop = () => {
        activePlayers.delete(player);
        player.dispose();
    };

    if (cached) {
        // Буфер готов - стартуем строго по расписанию
        player.start(time);
    } else {
        // Ещё грузится - сыграет сразу как будет готов
        player.autostart = true;
    }
}

// Мгновенно оборвать все звучащие звуки секвенсора (вызываем по стопу).
export function stopAllSounds() {
    activePlayers.forEach((player) => {
        player.onstop = null; // снимаем колбэк, чтобы не дёргался при stop
        try { player.stop(); } catch (e) { /* плеер мог уже умолкнуть */ }
        try { player.dispose(); } catch (e) { /* уже освобождён */ }
    });
    activePlayers.clear();
}

export function stopAll() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    stopAllSounds();
}
