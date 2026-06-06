import React from 'react';
import './Patterns.css';

/* Заглушки паттернов — потом заменим реальными данными из стора */
const PLACEHOLDER_PATTERNS = [
  {
    id: 1,
    name: 'Pattern 1',
    /* Мини-превью: 16 шагов, 1 = активный, 0 = пустой */
    grid: [1,0,0,0, 1,0,1,0, 0,0,1,0, 1,0,0,1,1,1,0,0, 0,0,1,1, 1,0,0,1, 0,1,1,0,1,1,0,0, 0,0,1,1, 1,0,0,1, 0,1,1,0,1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    color: '#a78bfa',
  },
  {
    id: 2,
    name: 'Pattern 2',
    grid: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    color: '#34d399',
  },
  {
    id: 3,
    name: 'Pattern 3',
    grid: [1,1,0,0, 0,0,1,1, 1,0,0,1, 0,1,1,0,1,1,0,0, 0,0,1,1, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 1,0,0,0,1,1, 1,0,0,1,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0,1,0,1,0, 1,0,1,0, 0,0,1,1, 1,0,0,1,],
    color: '#fbbf24',
  },
];

/* Мини-сетка 16 точек внутри блока */
function MiniGrid({ steps, color }) {
  return (
    <div className="pattern-mini-grid">
      {steps.map((active, i) => (
        <div
          key={i}
          className={`pattern-mini-step ${active ? 'active' : ''}`}
          style={active ? { backgroundColor: color } : {}}
        />
      ))}
    </div>
  );
}

export default function Patterns({ onOpenColors, selectedPatternId, onSelectPattern }) {
  // обработчик выбора паттерна
  const handleSelectPattern = (pattern) => {
    if (onSelectPattern) {
      onSelectPattern(pattern);
    }
  };

  return (
    <div className="app-patterns">

      {/* кнопка создания паттерна*/}
      <button className="patterns-create-btn" onClick={onOpenColors}>
        Create pattern
      </button>

      {/*поле с паттернами*/}
      <div className="patterns-field">

        {PLACEHOLDER_PATTERNS.length === 0 ? (

          /* Если паттернов нет */
          <div className="patterns-empty-hint">
            <span className="patterns-empty-icon">🎹</span>
            <span>Паттернов пока нет.<br/>Нажмите кнопку выше!</span>
          </div>

        ) : (

          /* Список карточек */
          <div className="patterns-list">
            {PLACEHOLDER_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                className={`pattern-card ${selectedPatternId === pattern.id ? 'selected' : ''}`}
                onClick={() => handleSelectPattern(pattern)}
                style={{ '--card-accent': pattern.color }}
              >
                {/* Цветная полоска-акцент сверху карточки */}
                <div className="pattern-card-bar" />

                {/* Мини-превью сетки 16 шагов */}
                <MiniGrid steps={pattern.grid} color={pattern.color} />
                
                {/* Название паттерна */}
                <span className="pattern-card-name">{pattern.name}</span>

              </div>
            ))}
          </div>

        )}

      </div>

    </div>
  );
}