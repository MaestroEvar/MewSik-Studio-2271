import React from 'react';
import './PatHeader.css';

export default function PatHeader() {
  return (
    <header className="pat-header">
      <div className="pat-header-left">
        <div className="logo-container">
          <div className="cat-img"></div>  {/* <img> заменён на <div> */}
        </div>
        <h1 className="pat-header-title">Pattern Redactor</h1>
      </div>

      <div className="pat-header-right">
        <button className="pat-icon-button" title="Help">?</button>
        <button className="pat-icon-button" title="Dark mode">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>
    </header>
  );
}