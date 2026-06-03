import React from 'react';
import './LibraryPage.css';

export default function LibraryPage({ onBack }) {
  return (
    <div className="library-page-container">
      {/* Кнопка возврата в редактор паттернов */}
      <button className="library-back-button" onClick={onBack}>
        ← Назад
      </button>

      <div className="library-center-block">
        <h2>Library</h2>
        <p>Раздел библиотеки звуков будет реализован позже.</p>
      </div>
    </div>
  );
}