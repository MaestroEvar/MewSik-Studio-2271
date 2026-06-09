import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Header from '../components/layout/Header';
import Projects from '../components/layout/Projects';
import TimeLine from '../components/layout/TimeLine';
import LineSettings from '../components/layout/LineSettings';
import Patterns from '../components/layout/Patterns';
import PatternPreview from '../components/layout/PatternPreview';
import { getPatternBorderStyle } from '../components/layout/patternStyle.js';
import { editorStore } from '../app/store/editorStore.js';
import './StudioLightTheme.css'; // Светлая тема главного редактора (переопределяет цвета)

export default function StudioPage({ onNavigate, selectedProjectId, onSelectProject, theme, onToggleTheme }) {
  // Размещённые на таймлайне паттерны - плоский массив.
  // Каждый: { id, trackIndex, blockIndex, pattern }. Один блок = один паттерн.
  const [placements, setPlacements] = useState([]);

  // Что сейчас тащим - для превью под курсором (DragOverlay)
  const [activeDrag, setActiveDrag] = useState(null);

  // Текущий шаг таймлайна из стора - для полосы воспроизведения
  const timelineStep = editorStore((s) => s.timelineStep);

  // Сбрасываем расстановку при смене проекта (у каждого проекта своя)
  useEffect(() => {
    setPlacements([]);
  }, [selectedProjectId]);

  // Класс темы вешаем на .app-container через classList, а не через className
  // в JSX. Причина: панели сворачивания (LineSettings/Projects) тоже правят
  // классы этого контейнера напрямую через classList. Если бы тему задавал
  // React, ререндер при смене темы сбрасывал бы классы сворачивания.
  useEffect(() => {
    const el = document.querySelector('.app-container');
    if (!el) return;
    el.classList.toggle('studio-theme-light', theme === 'light');
    el.classList.toggle('studio-theme-dark', theme === 'dark');
  }, [theme]);

  // Порог 6px: клик по карточке-паттерну не считается перетаскиванием,
  // drag начинается только если зажать и потянуть.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Свободен ли блок (учитываем, что один блок вмещает один паттерн).
  // ignoreId - размещение, которое игнорируем (когда двигаем сами себя).
  const isBlockFree = (trackIndex, blockIndex, ignoreId = null) =>
    !placements.some(
      (p) => p.trackIndex === trackIndex && p.blockIndex === blockIndex && p.id !== ignoreId
    );

  const handleDragStart = (event) => {
    const data = event.active.data.current || null;
    if (!data) { setActiveDrag(null); return; }

    // Для уже размещённого паттерна докладываем поле pattern из массива
    // размещений - чтобы DragOverlay мог показать превью под курсором.
    if (data.type === 'placed') {
      const placement = placements.find((p) => p.id === data.placementId);
      setActiveDrag(placement ? { ...data, pattern: placement.pattern } : data);
      return;
    }

    setActiveDrag(data);
  };

  const handleDragEnd = (event) => {
    setActiveDrag(null);
    const { active, over } = event;
    const data = active.data.current;
    if (!data) return;

    // Бросили не на ячейку
    if (!over) return;

    const cell = over.data.current;
    if (!cell || cell.trackIndex === undefined) return;

    if (data.type === 'placed') {
      // Перенос уже размещённого паттерна на новый блок
      const id = data.placementId;
      if (!isBlockFree(cell.trackIndex, cell.blockIndex, id)) return; // занято
      setPlacements((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, trackIndex: cell.trackIndex, blockIndex: cell.blockIndex } : p
        )
      );
    } else if (data.type === 'pattern') {
      // Новое размещение из нижней панели
      if (!isBlockFree(cell.trackIndex, cell.blockIndex)) return; // занято
      setPlacements((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          trackIndex: cell.trackIndex,
          blockIndex: cell.blockIndex,
          pattern: data.pattern,
        },
      ]);
    }
  };

  const handleRemovePlacement = (id) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app-container">
        <Header theme={theme} onToggleTheme={onToggleTheme} />
        <Projects
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
        />
        <TimeLine
          placements={placements}
          currentStep={timelineStep}
          onRemovePlacement={handleRemovePlacement}
          selectedProjectId={selectedProjectId}
        />
        <LineSettings />
        <Patterns onOpenColors={onNavigate} />
      </div>

      {/* Превью паттерна под курсором во время перетаскивания */}
      <DragOverlay dropAnimation={null}>
        {activeDrag?.pattern ? (
          <div
            className="timeline-drag-overlay"
            style={{
              backgroundColor: '#1f1f1f',
              ...getPatternBorderStyle(activeDrag.pattern.blocks, '#1f1f1f'),
            }}
          >
            <PatternPreview blocks={activeDrag.pattern.blocks} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
