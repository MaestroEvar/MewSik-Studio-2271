import React, { useState } from 'react';
import StudioPage from './pages/StudioPage';
import ColorPage from './pages/PatRedactor';

export default function App() {
  // Храним имя текущей активной страницы. По умолчанию - 'studio'
  const [currentPage, setCurrentPage] = useState('studio');

  // В зависимости от значения в переменной currentPage, возвращаем нужную страницу
  if (currentPage === 'colors') {
    return <ColorPage onBack={() => setCurrentPage('studio')} />;
  }

  // Если не colors, значит по умолчанию показываем студию
  return <StudioPage onNavigate={() => setCurrentPage('colors')} />;
}