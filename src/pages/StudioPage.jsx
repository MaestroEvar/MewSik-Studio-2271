import React from 'react';
import Header from '../components/layout/Header';
import Projects from '../components/layout/Projects';
import TimeLine from '../components/layout/TimeLine';
import LineSettings from '../components/layout/LineSettings';
import Patterns from '../components/layout/Patterns';

// Передаем функцию перехода  внутрь компонента Patterns
export default function StudioPage({ onNavigate }) {
  return (
    <div className="app-container">
      <Header />
      <Projects />
      <TimeLine />
      <LineSettings />
      {/* Передаем функцию клика прямо в панель паттернов, потом переделаем в кнопку */}
      <Patterns onOpenColors={onNavigate} />
    </div>
  );
}