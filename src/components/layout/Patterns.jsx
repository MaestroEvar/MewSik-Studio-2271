import React from 'react';
import './Patterns.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db.js';
import PatternPreview from './PatternPreview.jsx';
import { getPatternBorderStyle } from './patternStyle.js';

export default function Patterns({ onOpenColors, selectedPatternId, onSelectPattern }) {
  // Живой список сохранённых паттернов из Dexie - обновляется сам при сохранении/удалении
  const patterns = useLiveQuery(() => db.patterns.toArray(), []) || [];

  // Выбор паттерна (для размещения на таймлайне)
  const handleSelectPattern = (pattern) => {
    if (onSelectPattern) onSelectPattern(pattern);
  };

  // Удаление паттерна. stopPropagation - чтобы клик по крестику не выбирал карточку.
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await db.patterns.delete(id);
  };

  return (
    <div className="app-patterns">

      {/* кнопка создания паттерна */}
      <button className="patterns-create-btn" onClick={onOpenColors}>
        Create pattern +
      </button>

      {/* поле с паттернами */}
      <div className="patterns-field">

        {patterns.length === 0 ? (

          /* Если паттернов нет */
          <div className="patterns-empty-hint">
            <span className="patterns-empty-icon">🎹</span>
            <span>No patterns found.<br/>Click the "Create Pattern" button.</span>
          </div>

        ) : (

          /* Список карточек */
          <div className="patterns-list">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`pattern-card ${selectedPatternId === pattern.id ? 'selected' : ''}`}
                onClick={() => handleSelectPattern(pattern)}
                // Рамка отражает типы котов внутри паттерна (цвет или градиент)
                style={getPatternBorderStyle(pattern.blocks, '#242424')}
              >
                {/* Кнопка удаления паттерна */}
                <button
                  className="pattern-delete-btn"
                  title="Удалить паттерн"
                  onClick={(e) => handleDelete(e, pattern.id)}
                >×</button>

                {/* Мини-копия паттерна: 5 строк, каждая своим цветом */}
                <div className="pattern-card-preview">
                  <PatternPreview blocks={pattern.blocks} />
                </div>

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
