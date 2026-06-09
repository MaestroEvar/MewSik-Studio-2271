import React, { useState, useEffect, useRef } from 'react';
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
import './StudioMobile.css'; // Мобильная адаптация главного редактора (только @media)

// База данных для сохранения расстановки паттернов в проекте
import { db } from '../db/db.js';

export default function StudioPage({ onNavigate, selectedProjectId, onSelectProject, theme, onToggleTheme }) {
  // Размещённые на таймлайне паттерны - плоский массив.
  // Каждый: { id, trackIndex, blockIndex, pattern }. Один блок = один паттерн.
  const [placements, setPlacements] = useState([]);

  // Что сейчас тащим - для превью под курсором (DragOverlay)
  const [activeDrag, setActiveDrag] = useState(null);

  // Текущий шаг таймлайна из стора - для полосы воспроизведения
  const timelineStep = editorStore((s) => s.timelineStep);

  // Флаг: расстановка уже загружена из БД для текущего проекта.
  // Нужен, чтобы первый useEffect (загрузка) не перетёрся вторым (сохранение)
  // на пустой массив до того, как реальные данные приедут из Dexie.
  const loadedProjectIdRef = useRef(null);

  // 1. Загрузка расстановки из БД при смене проекта
  useEffect(() => {
    if (!selectedProjectId) {
      loadedProjectIdRef.current = null;
      setPlacements([]);
      return;
    }

    let cancelled = false;
    loadedProjectIdRef.current = null;

    (async () => {
      try {
        const project = await db.projects.get(selectedProjectId);
        if (cancelled) return;
        setPlacements(
          project && Array.isArray(project.placements) ? project.placements : []
        );
        loadedProjectIdRef.current = selectedProjectId;
      } catch (err) {
        console.error('Ошибка загрузки расстановки паттернов:', err);
        if (!cancelled) {
          setPlacements([]);
          loadedProjectIdRef.current = selectedProjectId;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  // 2. Автосохранение в БД при любом изменении расстановки.
  // Срабатывает только после того, как для текущего проекта расстановка уже
  // загружена из БД - иначе мы бы сразу записали пустой массив поверх данных.
  useEffect(() => {
    if (!selectedProjectId) return;
    if (loadedProjectIdRef.current !== selectedProjectId) return;

    db.projects
      .update(selectedProjectId, {
        placements,
        updatedAt: Date.now(),
      })
      .catch((err) => console.error('Ошибка сохранения расстановки:', err));
  }, [placements, selectedProjectId]);

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

  // Drag начинается сразу после нажатия на карточку паттерна.
  // Это улучшает мобильный опыт, где тач должен инициировать перенос без
  // дополнительного перемещения пальцем.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 0 } })
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

    // Бросили мимо таймлайна.
    // Если тащили уже размещённый паттерн - удаляем его из проекта.
    if (!over) {
      if (data.type === 'placed') {
        setPlacements((prev) => prev.filter((p) => p.id !== data.placementId));
      }
      return;
    }

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
      // Новое размещение из нижней панели.
      // Без сохранения в БД, если проект не выбран - чтобы не плодить "ничейные" данные.
      if (!selectedProjectId) return;
      if (!isBlockFree(cell.trackIndex, cell.blockIndex)) return; // занято
      setPlacements((prev) => [
        ...prev,
        {
          // Стабильный строковый id - надёжнее сериализуется в IndexedDB
          id: `placement-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
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