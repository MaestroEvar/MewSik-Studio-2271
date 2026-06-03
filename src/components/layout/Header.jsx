import React from 'react';
import './Header.css';
import PatBpmCounter from './PatBpmCounter';
export default function Header() {
  return (
    <header className="app-header">
      
      {/* Левая часть: Логотип и BPM */}
      <div className="header-left">
        <div className="logo-container">
          {/* Картиночка кота.*/}
          <img 
            src="../sprites/boss.png" 
            alt="Mew Logo" 
            className="cat-img" 
            onError={(e) => e.target.style.display = 'none'} 
          />
        </div>

        {/* Контейнер для счетчика BPM */}
        <div className="bpm-container">
          <PatBpmCounter />
        </div>
      </div>

      {/* Центр - Кнопка воспроизведения */}
      <div className="header-center">
        <button className="play-button" title="Play">

          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <polygon points="8,5 19,12 8,19" />
          </svg>
        </button>
      </div>

      {/* Правая системные кнопки (Помощь, Темная тема, Сохранить, Меню) */}
      <div className="header-right">
        {/* Кнопка Помощь (?) */}
        <button className="icon-button" title="Помощь">
          <span className="help-text">?</span>
        </button>

        {/* Кнопка Темная тема (Луна) */}
        <button className="icon-button" title="Переключить тему">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        {/* Кнопка Сохранить */}
        <button className="icon-button" title="Сохранить проект">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>

        {/* Кнопка Меню */}
        <button className="icon-button menu-button" title="Меню">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

    </header>
  );
}