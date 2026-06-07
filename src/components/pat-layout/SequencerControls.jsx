import React, { useState } from 'react';
import './SequencerControls.css';
import PatBpmCounter from './PatBpmCounter';
import { editorStore } from '../../app/store/editorStore.js';
import { initAudio } from '../../audio/engine/toneEngine.js';
import { db } from '../../db/db.js';
import { representativeColor } from '../layout/patternStyle.js';

// Панель управления над дорожками секвенсора.
// Слева подпись секции, по центру счётчик BPM и кнопка Play/Stop,
// справа кнопка Save - открывает окно ввода имени и сохраняет паттерн.
export default function SequencerControls() {
  // Состояние проигрывания берём из глобального стора
  const isPlaying = editorStore((state) => state.isPlaying);
  const setIsPlaying = editorStore((state) => state.setIsPlaying);

  // Окно ввода имени паттерна (как при создании проекта)
  const [showModal, setShowModal] = useState(false);
  const [patternName, setPatternName] = useState('');
  // Короткая зелёная отметка "сохранено" на кнопке
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

  // Клик по Save: если есть что сохранять - открываем окно с предложенным именем
  const handleOpenSaveModal = async () => {
    const blocks = editorStore.getState().placedBlocks;
    if (!blocks || blocks.length === 0) return; // пустой паттерн не сохраняем

    const count = await db.patterns.count();
    setPatternName(`Pattern ${count + 1}`); // имя по умолчанию, можно переписать
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPatternName('');
  };

  // Подтверждение: снимаем текущие блоки и кладём в Dexie под введённым именем
  const handleConfirmSave = async () => {
    const name = patternName.trim();
    if (!name) return; // без имени не сохраняем

    const blocks = editorStore.getState().placedBlocks;
    if (!blocks || blocks.length === 0) {
      handleCloseModal();
      return;
    }

    // Снимок только нужных полей блока
    const snapshot = blocks.map((b) => ({
      trackIndex: b.trackIndex,
      step: b.step,
      span: b.span,
      category: b.category,
      noteDarken: b.noteDarken,
      label: b.label,
      sound: b.sound,
    }));

    await db.patterns.add({
      name,
      blocks: snapshot,
      color: representativeColor(snapshot), // цвет-представитель для подсветок
      createdAt: Date.now(),
    });

    setShowModal(false);
    setPatternName('');

    // Кратко показываем зелёное "Saved"
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <>
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

        {/* Правая часть: сохранение паттерна (открывает окно ввода имени) */}
        <div className="seq-controls-buttons">
          <button
            className={`seq-btn seq-btn-save ${saved ? 'is-saved' : ''}`}
            title="Сохранить паттерн"
            onClick={handleOpenSaveModal}
          >
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

      {/* Окно ввода имени паттерна */}
      {showModal && (
        <div className="modal_overlay" onClick={handleCloseModal}>
          <div className="modal_content" onClick={(e) => e.stopPropagation()}>
            <h3>save pattern</h3>
            <input
              type="text"
              className="modal_input"
              placeholder="pattern name"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
                if (e.key === 'Escape') handleCloseModal();
              }}
              onFocus={(e) => e.target.select()}
              autoFocus
            />
            <div className="modal_buttons">
              <button className="modal_btn cancel" onClick={handleCloseModal}>cancel</button>
              <button className="modal_btn create" onClick={handleConfirmSave}>save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
