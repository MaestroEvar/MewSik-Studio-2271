import React, { useState } from 'react';
import StudioPage from './pages/StudioPage';
import PatRedactor from './pages/PatRedactor';

export default function App() {
  // Теперь у нас снова 2 экрана: 'studio' и 'patterns'
  const [currentPage, setCurrentPage] = useState('studio');

  if (currentPage === 'patterns') {
    return <PatRedactor onBackToStudio={() => setCurrentPage('studio')} />;
  }

  return <StudioPage onNavigate={() => setCurrentPage('patterns')} />;
}