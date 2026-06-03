import React from 'react';
import PatBpmCounter from './PatBpmCounter';
export default function PatHeader() {
  return (
    <header className="pat-header">
      <div className="pat-header-left">
        <span className="pat-header-emoji">🐱</span>
        <h1 className="pat-header-title">Pattern Redactor</h1>
      </div>
      
      <div className="pat-header-center">
        <button className="pat-play-button">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <polygon points="8,5 19,12 8,19" />
          </svg>
        </button>
        {/*Счетчик BPM*/}
        <PatBpmCounter />
      </div>

      <div className="pat-header-right">
        <button className="pat-icon-button">?</button>
        <button className="pat-icon-button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>
  );
}