import * as Tone from 'tone';

let isStarted = false;

// Кэш загруженных аудио-буферов по url.
// Нужен, чтобы один и тот же звук не грузился заново на каждом шаге цикла.
const bufferCache = new Map();

{/* Активные плееры секвенсора. Держим их, чтобы по стопу мгновенно оборвать
    все звуки (особенно длинные Pad, которые тянутся на весь такт).*/}
const activePlayers = new Set();

// Постоянные узлы громкости по дорожкам (trackIndex -> Tone.Gain).
{/* Создаются один раз и живут всё время. Все звуки дорожки вливаются в её узел,
    а громкость меняется ПЛАВНО на самом узле. За счёт этого нет щелчков:
    громкость не трогается на каждом отдельном звуке*/}
const trackGains = new Map();

export async function initAudio() {
    if (!isStarted) {
        await Tone.start();
        isStarted = true;
    }
    return Tone.Transport;
}

// Узел громкости дорожки (создаётся лениво при первом обращении).
function getTrackGain(trackIndex) {
    if (!trackGains.has(trackIndex)) {
        // gain 1 = звук как есть (соответствует громкости 50)
        const gain = new Tone.Gain(1).toDestination();
        trackGains.set(trackIndex, gain);
    }
    return trackGains.get(trackIndex);
}

// Установить громкость дорожки как линейное усиление (1 = звук как есть, 0 = тишина).
// Меняем плавно коротким рампом - чтобы при перетаскивании ползунка не было щелчков.
export function setTrackGain(trackIndex, gainValue) {
    getTrackGain(trackIndex).gain.rampTo(gainValue, 0.02);
}

// Мгновенное проигрывание звука (кнопки "прослушать" в меню кота).
// Возвращает плеер, чтобы вызывающий код мог сам его остановить.
export function playSound(url) {
    if (!url) return null;
    const player = new Tone.Player(url).toDestination();
    // Микро-фейды убирают щелчки на резком фронте буфера
    player.fadeIn = 0.005;
    player.fadeOut = 0.01;
    player.autostart = true;
    return player;
}

// Предзагрузка буфера по url (с кэшированием). Возвращает Promise.
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

// Длительность загруженного буфера в секундах (или null, если ещё не загружен).
// По ней секвенсор считает, как растянуть Pad на весь такт.
export function getBufferDuration(url) {
    const buffer = bufferCache.get(url);
    return buffer ? buffer.duration : null;
}

// Проигрывание звука в точное время transport-а
// time - момент по часам Tone, playbackRate - скорость (для Pad зависит от такта)
// trackIndex - в узел громкости какой дорожки вливать звук
// Сам плеер играет на единичной громкости, а её регулирует узел дорожки
// Плеер сам себя освобождает после окончания, чтобы не копить мусор
export function triggerSound(url, time, playbackRate = 1, trackIndex = 0) {
    if (!url) return;
    const cached = bufferCache.get(url);
    const player = cached
        ? new Tone.Player(cached)
        : new Tone.Player(url);

    player.playbackRate = playbackRate;
    // Микро-фейды на старте и в конце сглаживают резкий фронт буфера -
    // убирают щелчки и хруст (особенно заметные на kick).
    player.fadeIn = 0.005;
    player.fadeOut = 0.01;
    // Вливаем звук в узел громкости дорожки (а не напрямую в выход)
    player.connect(getTrackGain(trackIndex));

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
// Узлы громкости дорожек при этом не трогаем - они постоянные.
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
