import React from 'react';
import './PatTrackRow.css';

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

      {/* Зона громкости. Кошачий ползунок - такой же как в LineSettings:
          тонкая дорожка с янтарной заливкой и бегунком-котом (PNG-спрайт). */}
      <div className="track-volume-zone">
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(e.target.value)}
          // Доля заливки дорожки слева от бегунка
          style={{ '--val': `${volume}%` }}
        />
        <span className="volume-number">{volume}</span>
      </div>

    </div>
  );
}
