import React from 'react';
import './Header.css';
import PatBpmCounter from './PatBpmCounter';
import { editorStore } from '../../app/store/editorStore.js';

// theme - текущая тема ('light' | 'dark'), onToggleTheme - переключатель из App
export default function Header({ theme, onToggleTheme }) {
  const isPlaying = editorStore((s) => s.isPlaying);
  const setIsPlaying = editorStore((s) => s.setIsPlaying);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const isLight = theme === 'light';

  return (
    <header className="app-header">

      {/* Левая часть: только логотип */}
      <div className="header-left">
        <div className="logo-container">
          <div className="cat-img"></div>
        </div>
      </div>

      {/* Центр — BPM + кнопка воспроизведения */}
      <div className="header-center">
        <PatBpmCounter />
        <button className="play-button" title="Play" onClick={handlePlayToggle}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
          <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
        </button>
      </div>

      {/* Правая часть — только тема и помощь */}
      <div className="header-right">
        <button className="icon-button" title="Помощь">
          <span className="help-text">?</span>
        </button>

        {/* Переключатель темы */}
        <button
          className="icon-button"
          title={isLight ? 'Тёмная тема' : 'Светлая тема'}
          onClick={onToggleTheme}
        >
          {isLight ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
      </div>

    </header>
  );
}
