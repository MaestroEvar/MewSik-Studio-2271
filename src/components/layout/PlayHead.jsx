import React, { useEffect, useState, useRef } from 'react';
import { editorStore } from '../../app/store/editorStore.js';
import './PlayHead.css';

const blocks = 16;                                                      // Количество блоков в TimeLine
const subDivisions = 16;                                                // Количество делений внутри одного блока
const subsPerTick = 4;                                                  // 1 тик метронома = 4 суб-деления = 1/4 блока

export default function PlayHead() {
    const isPlaying = editorStore((s) => s.isPlaying);                  // Флаг воспроизведения из editorStore
    const bpm = editorStore((s) => s.bpm);                              // Текущий bpm
    const [position, setPosition] = useState(0);                        // Точная позиция в суб-делениях
    const startTimeRef = useRef(null);                                  // Время старта
    const animFrameRef = useRef(null);                                  // ID requestAnimationFrame

    useEffect(() => {
        if (!isPlaying) {
            setPosition(0);
            startTimeRef.current = null;
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            return;
        }

        // Один тик метронома = 60 / bpm секунд
        const tickDurationMs = (60 / (Number(bpm) || 60)) * 1000;
        // Одно суб-деление = тик / 4
        const subDurationMs = tickDurationMs / subsPerTick;
        const totalSubs = blocks * subDivisions;                        // 256

        startTimeRef.current = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTimeRef.current;
            // Сколько суб-делений прошло с начала
            const currentPosition = Math.floor(elapsed / subDurationMs);
            setPosition(currentPosition % totalSubs);
            
            animFrameRef.current = requestAnimationFrame(animate);
        };

        animFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying, bpm]);

    if (!isPlaying) return null;

    const totalSubs = blocks * subDivisions;
    const leftPercent = (position / totalSubs) * 100;

    return (
        <div
            className='playhead'
            style={{
                left: `calc(36px + ${leftPercent}%)`,
            }}
        />
    );
}