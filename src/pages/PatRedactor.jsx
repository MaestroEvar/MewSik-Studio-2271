import React from 'react';
import './PatRedactor.css';

// props.onBack - это функция-колбэк, при вызове вернет нас назад
export default function PatRedactor({ onBack }) {
  return (
    <div className="color-page-container">
      {/* Кнопка возврата*/}
      <button className="back-button" onClick={onBack}>
        ← Вернуться в студию
      </button>
      
      <div className="blocks-wrapper">
        <div className="color-block red-block">Красный блок</div>
        <div className="color-block blue-block">Синий блок</div>
      </div>
    </div>
  );
}