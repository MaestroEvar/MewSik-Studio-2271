import React, { useState } from 'react';
import PatHeader from '../components/pat-layout/PatHeader';
import PatSidebar from '../components/pat-layout/PatSidebar';
import PatTrackRow from '../components/pat-layout/PatTrackRow';
import SequencerControls from '../components/pat-layout/SequencerControls';
import Library from '../components/pat-layout/Library';
import { editorStore } from '../app/store/editorStore.js';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import './PatRedactor.css';

export default function PatRedactor({ onBackToStudio }) {
  const tracks = ['Kick Drum', 'Snare', 'Closed Hat', 'Open Hat', 'Clap']; // Мусор

  const [volumes, setVolumes] = useState([50, 50, 50, 50, 50]);

  // Данные звука, который сейчас тащим - для красивого превью под курсором
  const [activeDrag, setActiveDrag] = useState(null);

  const placeBlock = editorStore((state) => state.placeBlock);

  const handleVolumeChange = (index, newValue) => {
    const updatedVolumes = [...volumes];
    updatedVolumes[index] = Number(newValue);
    setVolumes(updatedVolumes);
  };

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

    const sound = active.data.current;       // данные звука (label, sound, category)
    const cell = over.data.current;          // данные клетки (trackIndex, step)
    if (!sound || !cell) return;

    // Передаём в стор: он сам решит по правилам (Pad на 4 клетки строго,
    // обычный звук с заменой того что было)
    placeBlock({
      trackIndex: cell.trackIndex,
      step: cell.step,
      label: sound.label,
      sound: sound.sound,
      category: sound.category,
    });
  };

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
                    volume={volumes[trackIndex]}
                    onVolumeChange={(val) => handleVolumeChange(trackIndex, val)}
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
          <div className="drag-overlay-block">{activeDrag.label}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
