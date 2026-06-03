import React from 'react';
import { editorStore } from '../../app/store/editorStore';
import './PatBpmCounter.css';

export default function PatBpmCounter() {
  // Достаем глобальный bpm и функцию его изменения из storeEditor
  const { bpm, setBpm } = editorStore();

  const handleIncrement = () => {
    if (bpm < 300) setBpm(bpm + 1);
  };

  const handleDecrement = () => {
    if (bpm > 20) setBpm(bpm - 1);
  };

  const handleInputChange = (e) => {
    const value = Number(e.target.value);
    // Ограничим пределы BPM 
    if (value >= 20 && value <= 300) {
      setBpm(value);
    } else if (e.target.value === '') {
      setBpm(''); 
    }
  };

  const handleBlur = () => {
    // Если пользователь оставил поле пустым и кликнул мимо, возвращаем дефолт
    if (!bpm) setBpm(80);
  };

  return (
    <div className="pat-bpm-counter">
      <span className="bpm-label">BPM</span>
      <div className="bpm-display-zone">
        <button className="bpm-arrow-btn" onClick={handleDecrement}>−</button>
        <input 
          type="number" 
          className="bpm-input"
          value={bpm}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        <button className="bpm-arrow-btn" onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
}