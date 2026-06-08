import { useEffect, useRef } from "react";
import * as Tone from 'tone';
import { editorStore } from "../../app/store/editorStore";
import { initAudio, loadBuffer, triggerSound, getBufferDuration, stopAllSounds, setTrackGain } from './toneEngine.js'

const TOTAL_BLOCKS = 16;
const SUBDIVISIONS = 16;        // 16 шагов в одном блоке (как в паттерне)
const TOTAL_STEPS = TOTAL_BLOCKS * SUBDIVISIONS; // 256 шагов на всю дорожку
const PATTERN_STEPS = 16;       // паттерн - это 16 шагов
const DEFAULT_BPM = 60;

// Разворачиваем плоский массив размещений в таблицу событий по шагам.
// placements: [{ trackIndex, blockIndex, pattern }]. Блок blockIndex звучит
// на абсолютных шагах [blockIndex*16, blockIndex*16 + 16).
function buildStepEvents(placements) {
  const events = Array.from({ length: TOTAL_STEPS }, () => []);

  placements.forEach((placement) => {
    const { trackIndex, blockIndex, pattern } = placement;
    const startAbsolute = blockIndex * SUBDIVISIONS;
    const endAbsolute = startAbsolute + PATTERN_STEPS;
    const blocks = pattern.blocks || [];

    for (let step = startAbsolute; step < endAbsolute && step < TOTAL_STEPS; step++) {
      const localStep = step - startAbsolute;
      blocks.forEach((block) => {
        if (block.step === localStep) {
          events[step].push({
            sound: block.sound,
            category: block.category,
            trackIndex: Number(trackIndex),
          });
        }
      });
    }
  });

  return events;
}

export function useTimelineSequencer(placements) {
  const isPlaying = editorStore((s) => s.isPlaying);
  const bpm = editorStore((s) => s.bpm);
  const trackVolumes = editorStore((s) => s.trackVolumes);
  const setTimelineStep = editorStore((s) => s.setTimelineStep);

  const stepRef = useRef(0);
  const repeatIdRef = useRef(null);
  const cancelledRef = useRef(false);
  const stepEventsRef = useRef([]);

  // Свежие события держим в ref - чтобы менять расстановку, не пересоздавая цикл
  useEffect(() => {
    stepEventsRef.current = buildStepEvents(placements || []);
  }, [placements]);

  const bpmRef = useRef(Number(bpm) || DEFAULT_BPM);
  useEffect(() => {
    const value = Number(bpm) || DEFAULT_BPM;
    bpmRef.current = value;
    Tone.Transport.bpm.value = value;
  }, [bpm]);

  useEffect(() => {
    trackVolumes.forEach((v, i) => setTrackGain(i, (v ?? 50) / 50));
  }, [trackVolumes]);

  useEffect(() => {
    if (!isPlaying) return;

    cancelledRef.current = false;

    const startPlayback = async () => {
      await initAudio();
      stepRef.current = 0;

      // Предзагружаем все уникальные звуки расстановки
      const allSounds = new Set();
      stepEventsRef.current.forEach((events) => events.forEach((e) => allSounds.add(e.sound)));
      await Promise.all([...allSounds].map((u) => loadBuffer(u)));
      if (cancelledRef.current) return;

      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Tone.Transport.position = 0;
      Tone.Transport.bpm.value = bpmRef.current;

      repeatIdRef.current = Tone.Transport.scheduleRepeat((time) => {
        const stepIndex = stepRef.current;

        // Дошли до конца - останавливаемся и сбрасываем полосу воспроизведения
        if (stepIndex >= TOTAL_STEPS) {
          Tone.Transport.schedule(() => {
            Tone.Transport.stop();
            stopAllSounds();
            editorStore.getState().setIsPlaying(false);
            editorStore.getState().setTimelineStep(-1);
          }, time + 0.05);
          return;
        }

        const events = stepEventsRef.current[stepIndex] || [];
        const barSeconds = (60 / bpmRef.current) * 4;

        events.forEach(({ sound, category, trackIndex }) => {
          let rate = 1;
          if (category === 'Pad') {
            const dur = getBufferDuration(sound);
            rate = dur ? (dur / barSeconds) : 1;
          }
          triggerSound(sound, time, rate, trackIndex);
        });

        // Двигаем полосу воспроизведения синхронно с аудио
        const drawStep = stepIndex;
        Tone.Draw.schedule(() => {
          if (!cancelledRef.current) setTimelineStep(drawStep);
        }, time);

        stepRef.current += 1;
      }, '16n');

      Tone.Transport.start();
    };

    startPlayback();

    return () => {
      cancelledRef.current = true;
      if (repeatIdRef.current !== null) {
        Tone.Transport.clear(repeatIdRef.current);
        repeatIdRef.current = null;
      }
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Tone.Transport.position = 0;
      stopAllSounds();
      editorStore.getState().setIsPlaying(false);
      setTimelineStep(-1);
    };
  }, [isPlaying]);
}
