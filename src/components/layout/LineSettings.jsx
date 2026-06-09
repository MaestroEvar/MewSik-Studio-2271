import { useState, useEffect } from 'react';
import './LineSettings.css';

function HelpIcon({ text }) {
  return (
    <div className="help-icon-wrapper">
      <div className="help-icon">?</div>
      <div className="help-tooltip">{text}</div>
    </div>
  );
}

function HSlider({ label, tooltip, min = -100, max = 100, defaultValue = 0 }) {
  const [value, setValue] = useState(defaultValue);
  const displayValue = value > 0 ? `+${value}` : value;

  return (
    <div className="slider-row">
      <div className="slider-label-row">
        <span className="slider-label">{label}</span>
        <HelpIcon text={tooltip} />
      </div>
      <div className="slider-input-row">
        <input
          className="slider-horizontal"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <span className="slider-value">{displayValue}</span>
      </div>
    </div>
  );
}

function VSlider({ label }) {
  
}

export default function LineSettings() {
  const [collapsed, setCollapsed] = useState(true);

  // При первом рендере добавляем класс на контейнер
  useEffect(() => {
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
          appContainer.classList.add('settings-collapsed');
      }
  }, []);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.classList.toggle('settings-collapsed', newCollapsed);
    }
  };

  return (
    <div className={`app-linesettings${collapsed ? ' collapsed' : ''}`}>
      
      {/* Кнопка сворачивания */}
      {!collapsed && (
        <button className="settings-toggle-btn-minus" onClick={handleToggle}>-</button>
      )}

      {/* Кнопка разворота панели */}
      {collapsed && (
        <button className="settings-toggle-btn-gear" 
        onClick={handleToggle}
        title="развернуть панель настроек">
          <svg viewBox="0 0 100 100" width="20" height="20">
            <path d="M93.75 58.75V41.25L78.125 38.75L73.125 33.75L75.625 18.125L60.625 13.125L55.625 18.125L44.375 18.125L39.375 13.125L24.375 18.125L26.875 33.75L21.875 38.75L6.25 41.25V58.75L21.875 61.25L26.875 66.25L24.375 81.875L39.375 86.875L44.375 81.875L55.625 81.875L60.625 86.875L75.625 81.875L73.125 66.25L78.125 61.25L93.75 58.75ZM50 68.75C39.66 68.75 31.25 60.34 31.25 50C31.25 39.66 39.66 31.25 50 31.25C60.34 31.25 68.75 39.66 68.75 50C68.75 60.34 60.34 68.75 50 68.75Z"/>
          </svg>
        </button>
      )}

      <div className={`settings-content ${collapsed ? 'hidden' : ''}`}>
        <div className="settings-section">
          <span className="settings-section-title">Sound settings</span>
          <HSlider label="Track Volume" tooltip="объяснение.txt" defaultValue={0} />
        </div>
      </div>
    </div>
  );
}