import React, { useState } from 'react';
import StudioPage from './pages/StudioPage';
import PatRedactor from './pages/PatRedactor';

export default function App() {
  // 2 экрана: 'studio' и 'patterns'
  const [currentPage, setCurrentPage] = useState('studio');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Тема общая для обеих страниц: 'light' | 'dark'.
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  if (currentPage === 'patterns') {
    return (
      <PatRedactor
        onBackToStudio={() => setCurrentPage('studio')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <StudioPage
      onNavigate={() => setCurrentPage('patterns')}
      selectedProjectId={selectedProjectId}
      onSelectProject={setSelectedProjectId}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
