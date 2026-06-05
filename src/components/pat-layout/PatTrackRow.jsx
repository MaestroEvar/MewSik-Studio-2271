import React from 'react';
import './PatTrackRow.css';

// Минималистичный силуэт головы кота - бегунок ползунка громкости. Цвета задаются через currentColor и классы.
function CatHeadIcon() {
  return (
    <svg viewBox="0 0 32 28" className="cat-thumb-svg" aria-hidden="true">
      {/* Силуэт головы с ушами одной линией */}
      <path
        className="cat-silhouette"
        d="M5 3 L11 9 Q16 7 21 9 L27 3 L25 13 Q24 22 16 23 Q8 22 7 13 Z"
      />
      {/* Глаза, цвета янтарь */}
      <path className="cat-eye" d="M11 13 q2 -2 4 0" />
      <path className="cat-eye" d="M17 13 q2 -2 4 0" />
    </svg>
  );
}

export default function PatTrackRow({ trackIndex, volume, onVolumeChange }) {
  // Массив из 16 шагов. Дорожки оставляем пустыми - заполнять их будет пользователь через dnd-kit, который добавим позже.
  const totalSteps = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="pat-track-row">

      {/* Клетка с номером дорожки */}
      <div className="track-number-cell">
        <span className="track-number-value">{String(trackIndex + 1).padStart(2, '0')}</span>
      </div>

      {/* Сетка из 16 пустых клеток.
          grid-template-columns даёт 16 равных колонок: в будущем один блок
          звука сможет занимать несколько клеток через grid-column: span N. */}
      <div className="track-steps-grid">
        {totalSteps.map((step) => {
          // Каждые 4 шага - граница доли
          const isQuarterEnd = step % 4 === 0 && step !== 16;
          // Чередуем группы по 4 шага по светлоте для читаемости такта
          const isGroupAccent = Math.floor((step - 1) / 4) % 2 === 0;
          // Первый шаг каждой доли помечаем как сильную долю
          const isBeatStart = (step - 1) % 4 === 0;

          return (
            <div
              key={step}
              className={`step-block
                ${isGroupAccent ? 'step-accent' : 'step-normal'}
                ${isQuarterEnd ? 'quarter-border' : ''}
                ${isBeatStart ? 'beat-start' : ''}
              `}
              title={`Шаг ${step}`}
            />
          );
        })}
      </div>

      {/* Зона громкости*/}
      <div className="track-volume-zone">
        <div className="volume-slider-wrap">
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(e.target.value)}
            style={{ '--val': `${volume}%` }}
          />
          {/* Голова кота поверх инпута как бегунок */}
          <span
            className="cat-thumb"
            style={{ '--val': `${volume}%` }}
          >
            <CatHeadIcon />
          </span>
        </div>
        <span className="volume-number">{volume}</span>
      </div>

    </div>
  );
}
