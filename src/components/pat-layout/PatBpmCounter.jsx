import React, { useState, useEffect } from 'react';
import { editorStore } from '../../app/store/editorStore';
import './PatBpmCounter.css';

// Разумные пределы темпа
const MIN_BPM = 20;
const MAX_BPM = 300;
const DEFAULT_BPM = 80;

export default function PatBpmCounter() {
  // Глобальный bpm и его сеттер из стора
  const bpm = editorStore((s) => s.bpm);
  const setBpm = editorStore((s) => s.setBpm);

  // Локальный черновик поля (строка) - чтобы можно было свободно печатать:
  // стирать, набирать по одной цифре, проходить через промежуточные значения.
  // В стор кладём только готовое валидное число.
  const [draft, setDraft] = useState(String(bpm));

  // Если bpm изменился извне (стрелки, второй счётчик) - подхватываем в поле
  useEffect(() => {
    setDraft(String(bpm));
  }, [bpm]);

  const clamp = (v) => Math.max(MIN_BPM, Math.min(MAX_BPM, v));

  const handleIncrement = () => setBpm(clamp((Number(bpm) || DEFAULT_BPM) + 1));
  const handleDecrement = () => setBpm(clamp((Number(bpm) || DEFAULT_BPM) - 1));

  const handleInputChange = (e) => {
    const raw = e.target.value;
    // Пускаем только цифры (и пустую строку при стирании)
    if (!/^\d*$/.test(raw)) return;
    setDraft(raw);
    // В стор отправляем, только когда это валидное число в пределах -
    // иначе темп проигрывания не дёргается на промежуточных значениях
    const n = Number(raw);
    if (raw !== '' && n >= MIN_BPM && n <= MAX_BPM) {
      setBpm(n);
    }
  };

  const handleBlur = () => {
    // Уходя из поля, приводим к корректному значению
    const n = Number(draft);
    if (draft === '' || Number.isNaN(n)) {
      setBpm(DEFAULT_BPM);
    } else {
      setBpm(clamp(n));
    }
  };

  // Ввод также можно подтвердить Enter-ом (просто снимаем фокус)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <div className="pat-bpm-counter">
      <span className="bpm-label">BPM</span>
      <div className="bpm-display-zone">
        <button className="bpm-arrow-btn" onClick={handleDecrement}>−</button>
        <input
          type="text"
          inputMode="numeric"
          className="bpm-input"
          value={draft}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <button className="bpm-arrow-btn" onClick={handleIncrement}>+</button>
      </div>
    </div>
  );
}
