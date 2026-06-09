import React, { useState, useEffect, useRef } from 'react';
import './WipPopover.css';
import wipCat from './sprites/work_in_progress.png';

/*
  WipPopover - обёртка вокруг кнопки, которая по клику показывает маленькое
  полупрозрачное всплывающее окошко с котом "work in progress" рядом с кнопкой.
  Окошко закрывается при следующем клике в любом месте страницы (как уведомление).

  props:
    - children: сама кнопка 
    - placement: 'bottom' | 'left' | 'right' - с какой стороны показывать (по умолчанию 'bottom')
*/
export default function WipPopover({ children, placement = 'bottom', block = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Закрытие при клике в любом месте страницы.
  // Вешаем слушатель только когда окошко открыто. 
  useEffect(() => {
    if (!open) return;
    let justOpened = true;
    const onDocClick = () => {
      // первый клик (тот, что открыл) пропускаем, со второго закрываем
      if (justOpened) { justOpened = false; return; }
      setOpen(false);
    };
    // небольшая задержка не нужна - флаг justOpened отрабатывает первый клик
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  // Клик по триггеру: переключаем окошко..
  const handleTriggerClick = () => {
    setOpen((v) => !v);
  };

  return (
    <span className={`wip-wrap${block ? ' wip-wrap-block' : ''}`} ref={wrapRef} onClick={handleTriggerClick}>
      {children}
      {open && (
        <span className={`wip-popover wip-popover-${placement}`} onClick={(e) => e.stopPropagation()}>
          <img src={wipCat} alt="work in progress" className="wip-popover-img" />
        </span>
      )}
    </span>
  );
}
