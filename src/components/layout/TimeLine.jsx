import './TimeLine.css';
import React, { useState, useEffect } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import PatternPreview from './PatternPreview';
import { getPatternBorderStyle } from './patternStyle.js';
import { editorStore } from '../../app/store/editorStore.js';
import { useTimelineSequencer } from '../../audio/engine/useTimelineSequencer.js';

const TRACK_COUNT = 10; // 10 дорожек
const BLOCK_COUNT = 16; // 16 блоков (тактов) по горизонтали

// Список дорожек строим из количества - имена не используются в разметке
const tracks = Array.from({ length: TRACK_COUNT }, (_, i) => i);

// Одна ячейка-блок дорожки. Это droppable-зона: сюда можно бросить паттерн
// из нижней панели или перенести уже стоящий паттерн.
function TimelineCell({ trackIndex, blockIndex, isBeatStart }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${trackIndex}-${blockIndex}`,
    data: { trackIndex, blockIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`track_block ${isBeatStart ? 'beat_start' : ''} ${isOver ? 'cell_over' : ''}`}
    />
  );
}

// Уже размещённый на таймлайне паттерн. Его можно перетащить на другой блок
// или дорожку (useDraggable), а кликом - удалить.
function PlacedPattern({ placement, currentStep, onRemove }) {
  const { id, trackIndex, blockIndex, pattern } = placement;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${id}`,
    data: { type: 'placed', placementId: id },
  });

  // Защита от случайного удаления: если только что тащили - клик не удаляет
  const draggedRef = React.useRef(false);
  useEffect(() => {
    if (isDragging) draggedRef.current = true;
  }, [isDragging]);

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false; // это был перенос, не удаляем
      return;
    }
    onRemove(id);
  };

  // Позиция и ширина: ровно один блок шириной (квантизация по блокам).
  const leftPercent = (blockIndex / BLOCK_COUNT) * 100;
  const widthPercent = (1 / BLOCK_COUNT) * 100;

  // Подсветка паттерна, когда playhead находится внутри его блока.
  // Один блок = 16 шагов секвенсора, значит блок blockIndex звучит
  // на шагах [blockIndex*16, blockIndex*16 + 16).
  const stepStart = blockIndex * 16;
  const isActive = currentStep >= stepStart && currentStep < stepStart + 16;

  return (
    <div
      ref={setNodeRef}
      className={`placed_pattern_full ${isActive ? 'active' : ''} ${isDragging ? 'is_dragging' : ''}`}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: '#1f1f1f',
        ...getPatternBorderStyle(pattern.blocks, '#1f1f1f'),
      }}
      title={`${pattern.name} (клик - удалить, перетащить - перенести)`}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <PatternPreview blocks={pattern.blocks} />
    </div>
  );
}

export default function TimeLine({ placements, currentStep, onRemovePlacement, selectedProjectId }) {
  const setIsPlaying = editorStore((s) => s.setIsPlaying);

  // Движок проигрывания таймлайна - получает актуальную расстановку
  useTimelineSequencer(placements);

  // Останавливаем воспроизведение при уходе со страницы
  useEffect(() => {
    return () => setIsPlaying(false);
  }, []);

  if (!selectedProjectId) {
    return (
      <div className="app-timeline">
        <div className="timeline-empty-hint">
          <span>The project is not selected</span>
          <span>Select a project from the menu on the left</span>
        </div>
      </div>
    );
  }

  // Полоса воспроизведения. currentStep идёт 0..(16*16-1)=0..255.
  // Переводим его в проценты по всей ширине дорожки.
  const totalSteps = BLOCK_COUNT * 16;
  const playheadPercent = currentStep >= 0 ? (currentStep / totalSteps) * 100 : null;

  return (
    <div className="app-timeline">

      {/* Шапка с номерами блоков */}
      <div className="timeline_header">
        <div className="header_label_spacer" />
        {Array.from({ length: BLOCK_COUNT }, (_, i) => (
          <div key={i} className="header_block">
            <span className="block_number_main">{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="timeline_body">
        <div className="timeline_tracks">
          {tracks.map((trackIndex) => (
            <div key={trackIndex} className="timeline_track">
              <div className="track_label">
                <span className="track_number">{trackIndex + 1}</span>
              </div>

              <div className="track_content">
                {/* Слой сетки: 16 блоков-дропзон */}
                <div className="track_blocks">
                  {Array.from({ length: BLOCK_COUNT }, (_, blockIndex) => (
                    <TimelineCell
                      key={blockIndex}
                      trackIndex={trackIndex}
                      blockIndex={blockIndex}
                      isBeatStart={blockIndex % 4 === 0}
                    />
                  ))}
                </div>

                {/* Слой паттернов поверх сетки */}
                <div className="track_patterns_layer">
                  {placements
                    .filter((p) => p.trackIndex === trackIndex)
                    .map((placement) => (
                      <PlacedPattern
                        key={placement.id}
                        placement={placement}
                        currentStep={currentStep}
                        onRemove={onRemovePlacement}
                      />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Полоса воспроизведения - движется слева направо.
            Лежит поверх дорожек, отступ слева равен ширине колонки с номерами. */}
        {playheadPercent !== null && (
          <div className="playhead_wrapper">
            <div className="playhead" style={{ left: `${playheadPercent}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
