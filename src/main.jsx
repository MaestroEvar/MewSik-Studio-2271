import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
// Короче React находит в html элемент root и внутри него отображает React приложение
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> 
    <App />
  </React.StrictMode>
); 