import React from 'react';
import './PatHeader.css';
import WipPopover from '../WipPopover.jsx';

// theme - текущая тема ('light' | 'dark'), onToggleTheme - переключатель из PatRedactor
export default function PatHeader({ theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <header className="pat-header">
      <div className="pat-header-left">
        <div className="logo-container">
          <div className="cat-img"></div>  {/* <img> заменён на <div> */}
        </div>
        <h1 className="pat-header-title">Pattern Redactor</h1>
      </div>

      <div className="pat-header-right">
        <WipPopover placement="bottom">
          <button className="pat-icon-button" title="Help">?</button>
        </WipPopover>

        {/* Переключатель темы. В светлой теме показываем луну,
            в тёмной - солнце*/}
        <button
          className="pat-icon-button"
          title={isLight ? 'Тёмная тема' : 'Светлая тема'}
          onClick={onToggleTheme}
        >
          {isLight ? (
            // Иконка луны
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            // Иконка солнца
            <svg viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
