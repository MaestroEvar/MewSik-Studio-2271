import React from 'react';
import './Patterns.css';
export default function Patterns({ onOpenColors }) {
  return (
    <div className="app-patterns">
      <h3>Patterns Bottom</h3>
      
      {/* Наша кнопка перехода */}
      <button className="nav-page-button" onClick={onOpenColors}>
        Редактор патернов →
      </button>
    </div>
  );
}