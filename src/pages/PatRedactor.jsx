import React, { useState, useEffect, useRef } from 'react';
import PatHeader from '../components/pat-layout/PatHeader';
import PatSidebar from '../components/pat-layout/PatSidebar';
import PatTrackRow from '../components/pat-layout/PatTrackRow';
import SequencerControls from '../components/pat-layout/SequencerControls';
import Library from '../components/pat-layout/Library';
import { editorStore } from '../app/store/editorStore.js';
import { useSequencer } from '../audio/engine/useSequencer.js';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import './PatRedactor.css';
import './PatLightTheme.css'; // Светлая тема редактора паттернов (переопределяет цвета)
import { db } from '../db/db.js';

// Цвета ролей котов - те же, что в меню и в дорожках.
// Нужны, чтобы превью под курсором красить в цвет категории звука.
const ROLE_COLORS = {
  Lead:  '#a78bfa',
  Bass:  '#f472b6',
  Pad:   '#34d399',
  Drums: '#fbbf24',
};

export default function PatRedactor({ onBackToStudio }) {
  const tracks = ['Kick Drum', 'Snare', 'Closed Hat', 'Open Hat', 'Clap']; // Мусор

  // Данные звука, который сейчас тащим - для красивого превью под курсором
  const [activeDrag, setActiveDrag] = useState(null);
  const [favKey, setFavKey] = useState(0);

  // Тема редактора паттернов: 'light' - светлая, 'dark' - старая тёмная.
  // Переключается кнопкой-луной в шапке. На главную страницу не влияет.
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const placeBlock = editorStore((state) => state.placeBlock);
  const moveBlock = editorStore((state) => state.moveBlock);
  const removeBlock = editorStore((state) => state.removeBlock); // для удаления блока за границей

  // Ref на контейнер дорожек - по нему определяем, бросили ли блок за пределы.
  const tracksTableRef = useRef(null);
  // Последняя позиция курсора - dnd-kit не даёт её в dragEnd надёжно,
  // поэтому отслеживаем сами через глобальный слушатель указателя.
  const pointerRef = useRef({ x: 0, y: 0 });

  // Запоминаем позицию курсора на каждое движение/нажатие указателя.
  useEffect(() => {
    const onPointer = (e) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, []);

  const setIsPlaying = editorStore((s) => s.setIsPlaying);    // Управление воспроизведением

  // Подключаем движок проигрывания паттерна (реагирует на Play/Stop)
  useSequencer();

  // Сенсор с порогом 6px: клик по кнопкам play/star не запускает перетаскивание,
  // драг начинается только если зажать и потянуть.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event) => {
    setActiveDrag(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    setActiveDrag(null);
    const { active, over } = event;

    const data = active.data.current;        // данные перетаскиваемого (звук или готовый блок)

    if (!over) {
      // Бросили не на клетку и не в избранное. Если это уже размещённый блок
      // и курсор оказался за пределами таблицы дорожек - удаляем блок.
      if (data && data.type === 'placed') {
        const table = tracksTableRef.current;
        if (table) {
          const rect = table.getBoundingClientRect();
          const { x, y } = pointerRef.current;
          const outside =
            x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
          if (outside) {
            removeBlock(data.blockId);
          }
        }
      }
      return; // в остальных случаях оставляем как было
    }

    if (over.id === 'favorites-drop-zone') {            // Если бросили звук в избранное
      if (data && data.type === 'sound'){
        if (active.id.startsWith('fav-')) {             // Если звук есть, то не добавляем
          return;
        }

        const cat = editorStore.getState().selectedCat; // Добавляем звук в избранное
        if (cat) {
          const existing = await db.favorites           // Проверяем существует ли уже звук в избранном
            .where('soundId').equals(data.soundId || 0)
            .and(fav => fav.catName === cat.name)
            .first();

          if(!existing){                                // Если такого звука нет в избранном, добавляем
            await db.favorites.add({
              soundId: data.soundId || 0,
              soundName: data.label.split('-').pop(),
              soundPath: data.sound,
              catName: cat.name,
              catCategory: cat.category,
              noteDarken: data.noteDarken || 0,
            });
          }
          setFavKey(prev => prev + 1); // Триггерим перезагрузку избранного
        }
      }
      return; 
    }

    const cell = over.data.current;          // данные клетки (trackIndex, step)
    if (!data || !cell) return;

    if (data.type === 'placed') {
      // Перенос уже вставленного блока на новую клетку
      moveBlock({
        blockId: data.blockId,
        trackIndex: cell.trackIndex,
        step: cell.step,
      });
    } else {
      // Вставка нового звука из меню/избранного. Стор сам применит правила
      // (Pad на всю дорожку строго, обычный звук с заменой того что было).
      placeBlock({
        trackIndex: cell.trackIndex,
        step: cell.step,
        label: data.label,
        sound: data.sound,
        category: data.category,
        noteDarken: data.noteDarken,
      });
    }
  };

  useEffect(() => {             // Прекращает воспроизведение при выходе из редактора паттернов
      return () => {
          setIsPlaying(false);
      };
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`pat-redactor-container pat-theme-${theme}`}>
        {/* Шапка */}
        <PatHeader theme={theme} onToggleTheme={toggleTheme} />

        <div className="pat-workspace">
          {/* 2. Левая колонка со звуками и кнопкой возврата */}
          <PatSidebar
            tracks={tracks}
            onBackToStudio={onBackToStudio}
            key={favKey}
          />

          {/* 3. Правая часть экрана, разделенная на дорожки и библиотеку */}
          <div className="pat-right-content">

            {/* Верхняя половина: дорожки секвенсора */}
            <main className="pat-tracks-area">

              {/* Панель управления над дорожками: Play и Save. */}
              <SequencerControls />

              <div className="sequencer-table" ref={tracksTableRef}>
                {tracks.map((trackName, trackIndex) => (
                  <PatTrackRow
                    key={trackIndex}
                    trackIndex={trackIndex}
                  />
                ))}
              </div>
            </main>

            {/* Нижняя половина: страница библиотеки */}
            <section className="pat-library-area">
              <Library />
            </section>

          </div>
        </div>
      </div>

      {/* Превью блока под курсором во время перетаскивания */}
      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div
            className="drag-overlay-block"
            style={{
              // Тот же цвет роли и то же затемнение по ноте, что и в меню
              '--role': ROLE_COLORS[activeDrag.category] || '#d9a441',
              '--note-darken': activeDrag.noteDarken || 0,
            }}
          >{activeDrag.label}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
