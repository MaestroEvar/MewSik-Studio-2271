import React, { useRef, useEffect, useState } from 'react';
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
// Также по клику вставляет выбранный (через меню) звук - режим "выбрал и кликай".
function StepCell({ trackIndex, step, className, onCellClick, isArmed }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${trackIndex}-${step}`,
    data: { trackIndex, step }, // эти данные читаем в onDragEnd
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'cell-over' : ''} ${isArmed ? 'cell-armed' : ''}`}
      title={`Шаг ${step + 1}`}
      onClick={() => onCellClick(trackIndex, step)}
    />
  );
}

// Уже размещённый блок. Его можно перетащить на другую клетку (useDraggable),
// а кликом - удалить (всегда, даже когда в меню выбран звук для вставки).
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
    // Клик по уже стоящему блоку удаляет его
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

export default function PatTrackRow({ trackIndex }) {
  // 16 шагов дорожки (индексы 0..15)
  const totalSteps = Array.from({ length: 16 }, (_, i) => i);

  // Блоки, размещённые именно на этой дорожке
  const placedBlocks = editorStore((state) => state.placedBlocks);
  const removeBlock = editorStore((state) => state.removeBlock);
  // Текущий проигрываемый шаг - по нему подсвечиваем столбец и активные блоки
  const currentStep = editorStore((state) => state.currentStep);
  const myBlocks = placedBlocks.filter((b) => b.trackIndex === trackIndex);

  // Выбранный для вставки по клику звук и метод вставки.
  // Если звук выбран - клик по клетке ставит его (как клик по таймлайну).
  const selectedSound = editorStore((state) => state.selectedSound);
  const placeBlock = editorStore((state) => state.placeBlock);

  // Клик по клетке: вставляем выбранный звук, если он есть.
  // Звук остаётся выбранным - можно ставить его сколько угодно раз,
  // включая Pad (он тоже остаётся выбранным до повторного клика по нему в меню).
  const handleCellClick = (tIndex, step) => {
    if (!selectedSound) return; // ничего не выбрано - обычная клетка
    placeBlock({
      trackIndex: tIndex,
      step,
      label: selectedSound.label,
      sound: selectedSound.sound,
      category: selectedSound.category,
      noteDarken: selectedSound.noteDarken,
    });
  };

  // Громкость этой дорожки из стора и её сеттер
  const volume = editorStore((state) => state.trackVolumes[trackIndex]);
  const setTrackVolume = editorStore((state) => state.setTrackVolume);

  // Локальный черновик поля громкости - чтобы можно было свободно печатать
  const [volDraft, setVolDraft] = useState(String(volume));
  // Если громкость изменилась извне (потянули ползунок) - подхватываем в поле
  useEffect(() => { setVolDraft(String(volume)); }, [volume]);

  // Ползунок: меняем громкость сразу
  const handleSliderChange = (val) => setTrackVolume(trackIndex, Number(val));

  // Ввод числа с клавиатуры: пускаем только цифры, валидное в стор сразу
  const handleVolInput = (e) => {
    const raw = e.target.value;
    if (!/^\d*$/.test(raw)) return;
    setVolDraft(raw);
    const n = Number(raw);
    if (raw !== '' && n >= 0 && n <= 100) {
      setTrackVolume(trackIndex, n);
    }
  };

  // Привести введённое к диапазону 0..100. 101 и больше становится 100.
  const commitVolume = () => {
    const n = Number(volDraft);
    const clamped = volDraft === '' || Number.isNaN(n)
      ? volume
      : Math.max(0, Math.min(100, n));
    setTrackVolume(trackIndex, clamped);
    setVolDraft(String(clamped));
  };

  // Enter подтверждает ввод (и срабатывает замена 101 -> 100)
  const handleVolKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

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
              onCellClick={handleCellClick}
              isArmed={!!selectedSound}
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

      {/* Зона громкости: ползунок, значок ноты и поле с числом. */}
      <div className="track-volume-zone">
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => handleSliderChange(e.target.value)}
          style={{ '--val': volume / 100 }}
        />

        {/* Значок ноты - подсказка, что это настройки звука */}
        <span className="volume-icon" title="Громкость дорожки">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
               stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </span>

        {/* Число громкости в контейнере, редактируется с клавиатуры */}
        <input
          type="text"
          inputMode="numeric"
          className="volume-input"
          value={volDraft}
          onChange={handleVolInput}
          onBlur={commitVolume}
          onKeyDown={handleVolKeyDown}
        />
      </div>

    </div>
  );
}
