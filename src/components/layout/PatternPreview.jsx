import React from 'react';
import './PatternPreview.css';
import { ROLE_COLORS } from './patternStyle.js';

const TRACK_COUNT = 5;  // 5 дорожек = 5 строк
const STEP_COUNT = 16;  // 16 шагов = 16 столбцов

// Строит сетку 5x16: для каждой клетки - цвет блока, который её занимает, или null.
// Pad растянут на все 16 клеток, обычный звук занимает свою одну.
function buildGrid(blocks) {
  const grid = Array.from({ length: TRACK_COUNT }, () => Array(STEP_COUNT).fill(null));

  (blocks || []).forEach((b) => {
    if (b.trackIndex < 0 || b.trackIndex >= TRACK_COUNT) return;
    const color = ROLE_COLORS[b.category] || '#878686';
    const start = Math.max(0, b.step);
    const end = Math.min(STEP_COUNT, b.step + (b.span || 1));
    for (let c = start; c < end; c++) {
      grid[b.trackIndex][c] = color;
    }
  });

  return grid;
}

// Мини-копия паттерна: 5 строк по 16 клеток, каждый занятый блок - своим цветом.
// Затемнением по ноте здесь пренебрегаем - показываем чистый цвет категории.
export default function PatternPreview({ blocks }) {
  const grid = buildGrid(blocks);

  return (
    <div className="pattern-preview">
      {grid.map((row, r) =>
        row.map((color, c) => (
          <div
            key={`${r}-${c}`}
            className={`pattern-preview-cell ${color ? 'filled' : ''}`}
            style={color ? { backgroundColor: color } : undefined}
          />
        ))
      )}
    </div>
  );
}
