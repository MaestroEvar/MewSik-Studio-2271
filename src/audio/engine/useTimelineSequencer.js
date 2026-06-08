import { useEffect, useRef } from "react";
import * as Tone from 'tone';
import { editorStore } from "../../app/store/editorStore";
import { initAudio, loadBuffer, triggerSound, getBufferDuration, stopAllSounds, setTrackGain } from './toneEngine.js'

const total_blocks = 16;
const subdivisions = 16;
const total_steps = total_blocks * subdivisions;
const pattern_steps = 16;
const default_bpm = 60;

function buildStepEvents(patterns) {
  const events = Array.from({ length: total_steps }, () => []);

  Object.entries(patterns).forEach(([trackIndex, trackPatterns]) => {
    Object.entries(trackPatterns).forEach(([_, pattern]) => {
      const pos = pattern.position;
      if (!pos) return;
      const startAbsolute = pos.startBlock * subdivisions + pos.startSub;
      const endAbsolute = startAbsolute + pos.length;
      const blocks = pattern.blocks || [];

      for (let step = startAbsolute; step < endAbsolute && step < total_steps; step++) {
        const localStep = (step - startAbsolute) % pattern_steps;
        blocks.forEach(block => {
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
  });

  return events;
}

export function useTimelineSequencer(patterns) {
    const isPlaying = editorStore((s) => s.isPlaying);
    const bpm = editorStore((s) => s.bpm);
    const trackVolumes = editorStore((s) => s.trackVolumes);
    const stepRef = useRef(0);

    const repeatIdRef = useRef(null);
    const cancelledRef = useRef(false);
    const stepEventsRef = useRef([]);

    useEffect(() => {
        stepEventsRef.current = buildStepEvents(patterns);
    }, [patterns]);

    const bpmRef = useRef(Number(bpm) || default_bpm);

    useEffect(() => {
        const value = Number(bpm) || default_bpm;
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

            const allSounds = new Set();
            stepEventsRef.current.forEach(events => events.forEach(e => allSounds.add(e.sound)));
            const urls = [...allSounds];
            await Promise.all(urls.map(u => loadBuffer(u)));
            if (cancelledRef.current) return;

            Tone.Transport.stop();
            Tone.Transport.cancel(0);
            Tone.Transport.position = 0;
            Tone.Transport.bpm.value = bpmRef.current;

            repeatIdRef.current = Tone.Transport.scheduleRepeat((time) => {
                const stepIndex = stepRef.current;

                if (stepIndex >= total_steps) {
                    Tone.Transport.schedule(() => {
                        Tone.Transport.stop();
                        stopAllSounds();
                        editorStore.getState().setIsPlaying(false);
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
        };
    }, [isPlaying]);
}