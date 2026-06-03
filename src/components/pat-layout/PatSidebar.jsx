import React from 'react';
import './PatSidebar.css';

/* Заглушки для звуков кота - потом заменим на реальные данные из библиотеки */
const PLACEHOLDER_SOUNDS = ['Звук 1', 'Звук 2', 'Звук 3'];

export default function PatSidebar({ onBackToStudio }) {
  return (
    <aside className="pat-sounds-sidebar">

      {/* Заголовок колонки */}
      <div className="sidebar-title">Tracks & Sounds</div>

      {/* ===== МЕНЮ КОТА ===== */}
      {/* Рамка: картинка выбранного кота + список его звуков */}
      <div className="cat-menu-box">

        {/* Место под картинку кота - пока заглушка */}
        <div className="cat-image-placeholder">
          🐱 Кот не выбран
        </div>

        {/* Список звуков кота - пока заглушки */}
        {PLACEHOLDER_SOUNDS.map((name, index) => (
          <div key={index} className="cat-sound-item">
            <span>{name}</span>

            {/* Две кнопки: Play и Избранное */}
            <div className="cat-sound-btns">

              {/* Кнопка прослушать звук */}
              <button className="sound-btn" title="Прослушать">

              </button>

              {/* Кнопка добавить в избранное (звёздочка) */}
              {/* Класс is-favorite делает звёздочку жёлтой - добавим логику позже */}
              <button className="sound-btn" title="В избранное">
                ☆
              </button>

            </div>
          </div>
        ))}

      </div>

      <div className="favorites-divider">Избранное</div>

      {/* ===== СПИСОК ИЗБРАННЫХ ЗВУКОВ ===== */}
      {/* Пока пустая рамка - наполним когда добавим логику звёздочки */}
      <div className="favorites-box">
        <span className="favorites-empty-hint">
          Нажмите ☆ чтобы добавить звук
        </span>
      </div>

      {/* ===== КНОПКИ ВНИЗУ ===== */}
      <div className="sidebar-buttons-container">
        <button className="sidebar-btn btn-add-sound">
          + Add sound
        </button>
        <button className="sidebar-btn btn-back-main" onClick={onBackToStudio}>
          ← Back to Studio
        </button>
      </div>

    </aside>
  );
}
