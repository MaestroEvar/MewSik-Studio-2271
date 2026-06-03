import React from 'react';

export default function PatTrackRow({ trackIndex, volume, onVolumeChange }) {
  // Массив из 16 шагов
  const totalSteps = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <div className="pat-track-row">
      
      {/* Клетка с номером дорожки */}
      <div className="track-number-cell">
        {trackIndex + 1}
      </div>

      {/* Сетка из 16 блоков */}
      <div className="track-steps-grid">
        {totalSteps.map((step) => {
          const isQuarterEnd = step % 4 === 0 && step !== 16;
          const isGroupAccent = Math.floor((step - 1) / 4) % 2 === 0;
          
          return (
            <div 
              key={step} 
              className={`step-block 
                ${isGroupAccent ? 'step-accent' : 'step-normal'} 
                ${isQuarterEnd ? 'quarter-border' : ''}
              `}
              title={`Step ${step}`}
            />
          );
        })}
      </div>

      {/* Живой ползунок громкости */}
      <div className="track-volume-zone">
        <input 
          type="range" 
          className="volume-slider" 
          min="0" 
          max="100" 
          value={volume} 
          onChange={(e) => onVolumeChange(e.target.value)} 
        />
        <span className="volume-number">{volume}</span>
      </div>

    </div>
  );
}