import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { editorStore } from '../../app/store/editorStore.js';
import { initAudio, loadBuffer, triggerSound, getBufferDuration, stopAllSounds } from './toneEngine.js';

// Кол-во шагов в паттерне (ряд из 16 клеток = 16 шестнадцатых нот)
const STEP_COUNT = 16;

// Базовый темп проигрывания.
// Пока фиксированный 60 bpm: 4 шага в секунду (шестнадцатая = 0.25с). Нужно подправить после реализации bpm
// Смена BPM: когда будем её реализовывать - заменить эту константу на bpm из стора.
const BASE_BPM = 60;

// Хук подключает проигрывание паттерна. Висит в PatRedactor.
// Следит за isPlaying в сторе: запускает цикл при старте, гасит при стопе.
export function useSequencer() {
  const isPlaying = editorStore((s) => s.isPlaying);
  const placedBlocks = editorStore((s) => s.placedBlocks);
  const setCurrentStep = editorStore((s) => s.setCurrentStep);

  // Свежие блоки держим в ref - чтобы колбэк Transport всегда видел актуальные
  // данные, не пересоздавая сам цикл при каждой правке паттерна.
  const blocksRef = useRef(placedBlocks);
  useEffect(() => {
    blocksRef.current = placedBlocks;
    // Заодно подгружаем буферы (кэшируются) - чтобы Pad, добавленный во время
    // игры, сразу знал свою длительность и корректно растягивался на такт.
    placedBlocks.forEach((b) => loadBuffer(b.sound));
  }, [placedBlocks]);

  useEffect(() => {
    // Играем только когда нажат Play
    if (!isPlaying) return;

    let cancelled = false;
    let repeatId = null;

    const startPlayback = async () => {
      // Аудио-контекст должен быть запущен (обычно уже сделано кнопкой Play)
      await initAudio();

      // Предзагружаем все уникальные звуки паттерна, чтобы они стартовали без задержек
      const urls = [...new Set(blocksRef.current.map((b) => b.sound))];
      await Promise.all(urls.map((u) => loadBuffer(u)));
      if (cancelled) return;

      let step = 0;
      Tone.Transport.bpm.value = BASE_BPM;

      // Длительность одного такта в секундах: 4 доли по (60 / bpm) секунд.
      // Считается от текущего темпа - то есть растяжение не зависит от bpm.
      const barSeconds = (60 / BASE_BPM) * 4;

      // На каждую шестнадцатую: играем блоки этого столбца и двигаем подсветку
      repeatId = Tone.Transport.scheduleRepeat((time) => {
        const stepIndex = step % STEP_COUNT;

        // Блоки, которые СТАРТУЮТ на этом шаге (Pad стартует только на своей первой клетке)
        const blocksHere = blocksRef.current.filter((b) => b.step === stepIndex);

        blocksHere.forEach((b) => {
          let rate = 1;
          if (b.category === 'Pad') {
            {/* Pad тянется на весь такт. Звуковой файл короче такта, поэтому
            замедляем его так, чтобы он закончился ровно к концу паттерна
            и тут же стартовал заново на следующем круге. */}
            const dur = getBufferDuration(b.sound);
            rate = dur ? (dur / barSeconds) : 1;
          }
          triggerSound(b.sound, time, rate);
        });

        // Подсветку столбца синхронизируем с аудио через Tone.Draw
        Tone.Draw.schedule(() => {
          if (!cancelled) setCurrentStep(stepIndex);
        }, time);

        step += 1; // дойдя до 16, цикл сам начнётся заново (через % STEP_COUNT)
      }, '16n');

      Tone.Transport.start();
    };

    startPlayback();

    // Очистка при стопе/уходе со страницы: глушим цикл, обрываем звуки, сбрасываем подсветку
    return () => {
      cancelled = true;
      if (repeatId !== null) Tone.Transport.clear(repeatId);
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      stopAllSounds(); // мгновенно обрываем все звучащие звуки, включая длинные Pad
      setCurrentStep(-1);
    };
  }, [isPlaying, setCurrentStep]);
}
