import React, { useState } from 'react';
import './SequencerControls.css';
import PatBpmCounter from './PatBpmCounter';
import { editorStore } from '../../app/store/editorStore.js';
import { initAudio } from '../../audio/engine/toneEngine.js';
import { db } from '../../db/db.js';
import { representativeColor } from '../layout/patternStyle.js';

// Панель управления над дорожками секвенсора.
// Слева подпись секции, по центру счётчик BPM и кнопка Play/Stop,
// справа кнопка Save - сохраняет текущий паттерн в главный редактор.
export default function SequencerControls() {
  // Состояние проигрывания берём из глобального стора
  const isPlaying = editorStore((state) => state.isPlaying);
  const setIsPlaying = editorStore((state) => state.setIsPlaying);

  // Короткая отметка "сохранено" для обратной связи на кнопке
  const [saved, setSaved] = useState(false);

  // Переключатель Play/Stop. Аудио-контекст запускаем именно тут,
  // по жесту пользователя - иначе браузер не даст играть звук.
  const handlePlayToggle = async () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      await initAudio();
      setIsPlaying(true);
    }
  };

  // Сохранение текущего паттерна: снимаем размещённые блоки и кладём в Dexie.
  const handleSave = async () => {
    const blocks = editorStore.getState().placedBlocks;
    if (!blocks || blocks.length === 0) return; // пустой паттерн не сохраняем

    // Снимок только нужных полей блока (без лишнего из стора)
    const snapshot = blocks.map((b) => ({
      trackIndex: b.trackIndex,
      step: b.step,
      span: b.span,
      category: b.category,
      noteDarken: b.noteDarken,
      label: b.label,
      sound: b.sound,
    }));

    const count = await db.patterns.count();
    await db.patterns.add({
      name: `Pattern ${count + 1}`,
      blocks: snapshot,
      color: representativeColor(snapshot), // цвет-представитель для подсветок
      createdAt: Date.now(),
    });

    // Кратко показываем, что сохранилось
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="seq-controls">

      {/* Левая часть: подпись секции */}
      <div className="seq-controls-title">
        <span className="seq-title-bar" />
        <span className="seq-title-text">Work Field</span>
      </div>

      {/* Центр: счётчик BPM слева и главная кнопка Play/Stop */}
      <div className="seq-controls-center">
        <PatBpmCounter />

        {/* Во время проигрывания кнопка превращается в Stop */}
        <button
          className={`seq-btn seq-btn-play ${isPlaying ? 'is-playing' : ''}`}
          title={isPlaying ? 'Остановить' : 'Воспроизвести'}
          onClick={handlePlayToggle}
        >
          {isPlaying ? (
            // Иконка стоп - квадрат
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            // Иконка play - треугольник
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
          <span>{isPlaying ? 'Stop' : 'Play'}</span>
        </button>
      </div>

      {/* Правая часть: сохранение паттерна в главный редактор */}
      <div className="seq-controls-buttons">
        <button className="seq-btn seq-btn-save" title="Сохранить паттерн" onClick={handleSave}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

    </div>
  );
}
