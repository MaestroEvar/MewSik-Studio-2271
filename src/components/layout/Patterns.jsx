import React from 'react';
import './Patterns.css';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDraggable } from '@dnd-kit/core';
import { db } from '../../db/db.js';
import PatternPreview from './PatternPreview.jsx';
import { getPatternBorderStyle } from './patternStyle.js';

// Одна перетаскиваемая карточка паттерна. Тащим её на таймлайн (useDraggable),
// крестик удаляет паттерн из библиотеки.
function PatternCard({ pattern, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pattern-${pattern.id}`,
    data: { type: 'pattern', pattern },
  });

  return (
    <div
      ref={setNodeRef}
      className={`pattern-card ${isDragging ? 'is-dragging' : ''}`}
      style={getPatternBorderStyle(pattern.blocks, '#242424')}
      {...listeners}
      {...attributes}
    >
      {/* Кнопка удаления паттерна. Гасим pointerDown, чтобы нажатие не начинало drag. */}
      <button
        className="pattern-delete-btn"
        title="Удалить паттерн"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onDelete(e, pattern.id)}
      >×</button>

      {/* Мини-копия паттерна: 5 строк, каждая своим цветом */}
      <div className="pattern-card-preview">
        <PatternPreview blocks={pattern.blocks} />
      </div>

      {/* Название паттерна */}
      <span className="pattern-card-name">{pattern.name}</span>
    </div>
  );
}

export default function Patterns({ onOpenColors }) {
  // Живой список сохранённых паттернов из Dexie - обновляется сам
  const patterns = useLiveQuery(() => db.patterns.toArray(), []) || [];

  // Удаление паттерна. stopPropagation - чтобы клик по крестику не трогал карточку.
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

          <div className="patterns-empty-hint">
            <span className="patterns-empty-icon">🎹</span>
            <span>No patterns found.<br/>Click the "Create Pattern" button.</span>
          </div>

        ) : (

          <div className="patterns-list">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                onDelete={handleDelete}
              />
            ))}
          </div>

        )}

      </div>

    </div>
  );
}
