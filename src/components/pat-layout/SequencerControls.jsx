import React from 'react';
import './SequencerControls.css';

// Панель управления над дорожками секвенсора.
// Заполняет пространство между шапкой и сеткой, держит Play и Save.
// Пока кнопки чисто визуальные - логику подключим позже.
export default function SequencerControls() {
  return (
    <div className="seq-controls">

      {/* Левая часть: подпись секции */}
      <div className="seq-controls-title">
        <span className="seq-title-bar" />
        <span className="seq-title-text">Рабочее поле</span>
      </div>

      {/* Правая часть: кнопки управления */}
      <div className="seq-controls-buttons">

        {/* Кнопка воспроизведения - основная, янтарная */}
        <button className="seq-btn seq-btn-play" title="Воспроизвести">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <polygon points="8,5 19,12 8,19" />
          </svg>
          <span>Play</span>
        </button>

        {/* Кнопка сохранения паттерна - вторичная */}
        <button className="seq-btn seq-btn-save" title="Сохранить паттерн">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save</span>
        </button>

      </div>
    </div>
  );
}
