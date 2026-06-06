import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { editorStore } from '../../app/store/editorStore.js';

const step_count = 16;                                                  // Количество шагов в одном цикле (16 блоков)
const default_bpm = 60;                                                 // Темп по умолчанию, если BPM не задан

// Лёгкий секвенсор для движения полосы воспроизведения.
// Использует Tone.Transport только как метроном, звуки не играет.
export function usePlayheadSequencer() {
    const isPlaying = editorStore((s) => s.isPlaying);                  // Флаг воспроизведения из стора
    const setCurrentStep = editorStore((s) => s.setCurrentStep);        // Обновление текущего шага (0–15) в сторе
    const bpm = editorStore((s) => s.bpm);                              // Темп BPM из стора

    const bpmRef = useRef(Number(bpm) || default_bpm);                  // Ref для хранения актуального BPM без пересоздания цикла

    useEffect(() => {                                                   // Синхронизация BPM с Tone.Transport при изменении
        const value = Number(bpm) || default_bpm;
        bpmRef.current = value;
        Tone.Transport.bpm.value = value;
    }, [bpm]);

    useEffect(() => {                                                   // Запуск/остановка цикла при переключении isPlaying
        if (!isPlaying) return;                                         // Если не играем ничего не делаем

        let cancelled = false;                                          // Флаг отмены для очистки
        let repeatId = null;                                            // ID повторяющегося события в Tone.Transport

        const startPlayback = async () => {                             // Начать воспроизведение
            await Tone.start();                                         // Запускаем Tone
            Tone.Transport.bpm.value = bpmRef.current;                  // Устанавливаем темп

            let step = 0;                                               // Счётчик шагов

            repeatId = Tone.Transport.scheduleRepeat((time) => {        // Повтор каждую 1/16 ноты
                const stepIndex = step % step_count;                    // Текущий шаг

                Tone.Draw.schedule(() => {                              // Синхронизируем обновление React с аудио-потоком
                    if (!cancelled) setCurrentStep(stepIndex);
                }, time);

                step += 1;
            }, '16n');

            Tone.Transport.start();                                     // Запускаем транспорт
        };

        startPlayback();                                                // Начинаем воспроизведение

        return () => {
            cancelled = true;
            if (repeatId !== null) Tone.Transport.clear(repeatId);
            Tone.Transport.stop();
            Tone.Transport.position = 0;
            setCurrentStep(0);
        };
    }, [isPlaying, setCurrentStep]);
}