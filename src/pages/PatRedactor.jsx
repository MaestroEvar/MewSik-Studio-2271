import React, { useState, useEffect } from 'react';
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

  const placeBlock = editorStore((state) => state.placeBlock);
  const moveBlock = editorStore((state) => state.moveBlock);

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

  const handleDragEnd = (event) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return; // бросили мимо дорожек

    const data = active.data.current;        // данные перетаскиваемого (звук или готовый блок)
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
      <div className="pat-redactor-container">
        {/* Шапка */}
        <PatHeader />

        <div className="pat-workspace">
          {/* 2. Левая колонка со звуками и кнопкой возврата */}
          <PatSidebar
            tracks={tracks}
            onBackToStudio={onBackToStudio}
          />

          {/* 3. Правая часть экрана, разделенная на дорожки и библиотеку */}
          <div className="pat-right-content">

            {/* Верхняя половина: дорожки секвенсора */}
            <main className="pat-tracks-area">

              {/* Панель управления над дорожками: Play и Save. */}
              <SequencerControls />

              <div className="sequencer-table">
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
