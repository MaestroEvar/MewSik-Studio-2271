import React, { useRef, useEffect } from 'react';
import './PatTrackRow.css';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { editorStore } from '../../app/store/editorStore.js';

// Цвета ролей котов - те же, что в библиотеке и нотах паттернов.
// Используются для окраски размещённых блоков по категории звука.
const ROLE_COLORS = {
  Lead:  '#a78bfa',
  Bass:  '#f472b6',
  Pad:   '#34d399',
  Drums: '#fbbf24',
};

// Одна клетка-шаг, которая может принимать перетаскиваемый звук (useDroppable).
function StepCell({ trackIndex, step, className }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${trackIndex}-${step}`,
    data: { trackIndex, step }, // эти данные читаем в onDragEnd
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'cell-over' : ''}`}
      title={`Шаг ${step + 1}`}
    />
  );
}

// Уже размещённый блок. Его можно перетащить на другую клетку (useDraggable),
// а кликом - удалить.
function DraggablePlacedBlock({ block, isBlockPlaying, onRemove }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${block.id}`,
    data: {
      // Тип 'placed' - по нему в onDragEnd отличаем перенос от вставки нового звука
      type: 'placed',
      blockId: block.id,
      label: block.label,
      category: block.category,
      noteDarken: block.noteDarken,
    },
  });

  // Защита от случайного удаления: если блок только что перетаскивали,
  // следующий клик (удаление) гасим.
  const draggedRef = useRef(false);
  useEffect(() => {
    if (isDragging) draggedRef.current = true;
  }, [isDragging]);

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false; // это был перенос, не удаляем
      return;
    }
    onRemove(block.id);
  };

  return (
    <div
      ref={setNodeRef}
      className={`placed-block
        ${isBlockPlaying ? 'is-playing' : ''}
        ${isDragging ? 'is-dragging' : ''}`}
      style={{
        gridColumn: `${block.step + 1} / span ${block.span}`,
        '--role': ROLE_COLORS[block.category] || '#d9a441',
        // Затемнение по ноте - точно как в меню кота
        '--note-darken': block.noteDarken || 0,
      }}
      title={`${block.label} (клик - удалить, перетащить - перенести)`}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <span className="placed-block-label">{block.label}</span>
    </div>
  );
}

export default function PatTrackRow({ trackIndex, volume, onVolumeChange }) {
  // 16 шагов дорожки (индексы 0..15)
  const totalSteps = Array.from({ length: 16 }, (_, i) => i);

  // Блоки, размещённые именно на этой дорожке
  const placedBlocks = editorStore((state) => state.placedBlocks);
  const removeBlock = editorStore((state) => state.removeBlock);
  // Текущий проигрываемый шаг - по нему подсвечиваем столбец и активные блоки
  const currentStep = editorStore((state) => state.currentStep);
  const myBlocks = placedBlocks.filter((b) => b.trackIndex === trackIndex);

  return (
    <div className="pat-track-row">

      {/* Клетка с номером дорожки */}
      <div className="track-number-cell">
        <span className="track-number-value">{String(trackIndex + 1).padStart(2, '0')}</span>
      </div>

      {/* Сетка дорожки. Два совмещённых слоя с ОДИНАКОВОЙ грид-разметкой:
          1) слой клеток-дропзон (16 равных колонок),
          2) слой размещённых блоков поверх него (position: absolute).
          Блоки не участвуют в раскладке клеток, поэтому ничего не сдвигается. */}
      <div className="track-steps-grid">

        {/* Слой клеток */}
        {totalSteps.map((step) => {
          // Каждые 4 шага - граница доли
          const isQuarterEnd = (step + 1) % 4 === 0 && step !== 15;
          // Чередуем группы по 4 шага по светлоте для читаемости такта
          const isGroupAccent = Math.floor(step / 4) % 2 === 0;
          // Первый шаг каждой доли помечаем как сильную долю
          const isBeatStart = step % 4 === 0;
          // Клетка загорается, когда playhead стоит на этом шаге
          const isPlayingStep = step === currentStep;

          const cls = `step-block
            ${isGroupAccent ? 'step-accent' : 'step-normal'}
            ${isQuarterEnd ? 'quarter-border' : ''}
            ${isBeatStart ? 'beat-start' : ''}
            ${isPlayingStep ? 'step-playing' : ''}`;

          return (
            <StepCell
              key={step}
              trackIndex={trackIndex}
              step={step}
              className={cls}
            />
          );
        })}

        {/* Слой блоков: та же сетка из 16 колонок, лежит поверх клеток.
            Каждый блок занимает span колонок через grid-column. */}
        <div className="placed-blocks-layer">
          {myBlocks.map((block) => {
            // Блок звучит, пока playhead находится внутри его диапазона.
            // Для обычного блока это его единственная клетка, для Pad - все 16.
            const isBlockPlaying =
              currentStep >= block.step && currentStep < block.step + block.span;

            return (
              <DraggablePlacedBlock
                key={block.id}
                block={block}
                isBlockPlaying={isBlockPlaying}
                onRemove={removeBlock}
              />
            );
          })}
        </div>
      </div>

      {/* Зона громкости. */}
      <div className="track-volume-zone">
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(e.target.value)}
          style={{ '--val': `${volume}%` }}
        />
        <span className="volume-number">{volume}</span>
      </div>

    </div>
  );
}
