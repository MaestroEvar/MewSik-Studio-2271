import { create } from 'zustand';
// Этот файл хранит в себе данные состояния: bpm песни, проигрывается ли она сейчас и т.д.

function generateCatSounds(cat) {
  if (!cat.sounds) return [];

  if (cat.category === 'Drums'){
    const drumNames = ['Kick', 'Snare', 'Crash', 'Closed Hat', 'Open Hat'];
    return cat.sounds.map((sound, index) => ({
      id: index + 1,
      name: drumNames[index],
      sound: sound
    }));
  }
  const notes = ['C', 'D', 'E', 'F', 'G'];
  return cat.sounds.map((sound, index) => ({
    id: index + 1,
    name: notes[index],
    sound: sound
  }));
}

// Кол-во дорожек и клеток в секвенсоре (нужно для проверок размещения)
const TRACK_COUNT = 5;
const STEP_COUNT = 16;

// Сколько клеток занимает звук в зависимости от роли кота.
// Pad звуки тянутся на весь такт - занимают все 16 клеток, остальные - 1.
function getSpanForCategory(category) {
  return category === 'Pad' ? 16 : 1;
}

// Проверка: помещается ли блок шириной span на дорожке trackIndex,
// начиная со step. ignoreId - блок, который игнорируем (например при замене самого себя).
function rangeIsFree(blocks, trackIndex, step, span, ignoreId = null) {
  // Не вылезаем за правый край дорожки
  if (step + span > STEP_COUNT) return false;

  // Диапазон клеток нового блока: [step, step + span)
  for (const b of blocks) {
    if (b.trackIndex !== trackIndex) continue;
    if (ignoreId !== null && b.id === ignoreId) continue;

    const bStart = b.step;
    const bEnd = b.step + b.span;
    const newStart = step;
    const newEnd = step + span;

    // Пересечение двух отрезков
    const overlap = newStart < bEnd && bStart < newEnd;
    if (overlap) return false;
  }
  return true;
}

export const editorStore = create((set, get) => ({
  bpm: 80,
  isPlaying: false,
  // Текущий проигрываемый шаг секвенсора (0..15). -1 - ничего не играет.
  // По нему дорожки подсвечивают активный столбец.
  currentStep: -1,
  tracks: [],
  blocks: [],
  selectedBlockId: null,

  // Размещённые на дорожках блоки звуков.
  // Каждый: { id, trackIndex, step, span, label, sound, category, noteDarken }
  placedBlocks: [],

  // Звук, выбранный для вставки по клику (как выбор паттерна на таймлайне).
  // null - ничего не выбрано. Хранит те же данные, что и при перетаскивании:
  // { key, label, sound, category, noteDarken }. Поле key - уникальный ключ
  // источника (звук кота или избранное), по нему подсвечиваем выбранный элемент.
  selectedSound: null,

  // Громкость каждой из дорожек (0..100). 50 - это как звуки звучат фактически
  // (без усиления и ослабления). Ниже 50 тише, выше 50 громче.
  trackVolumes: Array.from({ length: TRACK_COUNT }, () => 50),

  setBpm: (newBpm) => set({ bpm: newBpm }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),

  // Установить громкость одной дорожки
  setTrackVolume: (trackIndex, value) => {
    const next = [...get().trackVolumes];
    next[trackIndex] = value;
    set({ trackVolumes: next });
  },
  setTracks: (tracks) => set({ tracks }),
  setBlocks: (blocks) => set({ blocks }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),

  // Выбрать конкретный звук для вставки (срабатывает по долгому зажатию).
  selectSound: (soundData) => set({ selectedSound: soundData }),

  // Снять выбор только если кликнули по тому же выбранному звуку.
  // Клик по невыбранному звуку ничего не делает.
  unselectIfSame: (key) => {
    const current = get().selectedSound;
    if (current && current.key === key) {
      set({ selectedSound: null });
    }
  },

  // Принудительно снять выбор звука (например при уходе со страницы)
  clearSelectedSound: () => set({ selectedSound: null }),

    setSelectedCat: (cat) => set({
      selectedCat: cat,
      selectedSounds: cat ? generateCatSounds(cat) : []
    }),

  // Размещение звука на дорожке через drag-and-drop.
  // payload: { trackIndex, step, label, sound, category }
  // Правила:
  //   - Pad (span 4): ставим только если все 4 клетки свободны, иначе ничего.
  //   - Обычный звук (span 1): заменяем блок, который уже стоит в этой клетке.
  placeBlock: ({ trackIndex, step, label, sound, category, noteDarken = 0 }) => {
    const span = getSpanForCategory(category);
    const current = get().placedBlocks;

    // Прижимаем step к допустимому диапазону, чтобы блок не вылез за край.
    // Для Pad (span 16) это всегда 0 - его можно бросить в любую клетку дорожки.
    const safeStep = Math.max(0, Math.min(step, STEP_COUNT - span));

    if (span > 1) {
      // Длинный Pad звук - строгая проверка: все клетки диапазона должны быть свободны
      if (!rangeIsFree(current, trackIndex, safeStep, span)) {
        return; // Заняты - ничего не делаем
      }
      const newBlock = {
        id: Date.now() + Math.random(),
        trackIndex, step: safeStep, span, label, sound, category, noteDarken,
      };
      set({ placedBlocks: [...current, newBlock] });
      return;
    }

    // Обычный звук на 1 клетку - убираем всё, что пересекается с этой клеткой (замена)
    const cleaned = current.filter((b) => {
      if (b.trackIndex !== trackIndex) return true;
      const bStart = b.step;
      const bEnd = b.step + b.span;
      const overlap = safeStep < bEnd && bStart < safeStep + 1;
      return !overlap; // оставляем только непересекающиеся
    });

    const newBlock = {
      id: Date.now() + Math.random(),
      trackIndex, step: safeStep, span, label, sound, category, noteDarken,
    };
    set({ placedBlocks: [...cleaned, newBlock] });
  },

  // Перемещение уже размещённого блока на другую клетку
  moveBlock: ({ blockId, trackIndex, step }) => {
    const current = get().placedBlocks;
    const block = current.find((b) => b.id === blockId);
    if (!block) return;

    const span = block.span;
    // Прижимаем step (для Pad всегда 0 - переедет на любую дорожку целиком)
    const safeStep = Math.max(0, Math.min(step, STEP_COUNT - span));

    // Остальные блоки без перемещаемого
    const others = current.filter((b) => b.id !== blockId);

    if (span > 1) {
      // Pad: переезжает, только если на новой дорожке весь диапазон свободен
      if (!rangeIsFree(others, trackIndex, safeStep, span)) return;
      set({ placedBlocks: [...others, { ...block, trackIndex, step: safeStep }] });
      return;
    }

    // Обычный блок: на новой клетке вытесняем то, что там стояло
    const cleaned = others.filter((b) => {
      if (b.trackIndex !== trackIndex) return true;
      const overlap = safeStep < b.step + b.span && b.step < safeStep + 1;
      return !overlap;
    });
    set({ placedBlocks: [...cleaned, { ...block, trackIndex, step: safeStep }] });
  },

  // Удалить один размещённый блок по id
  removeBlock: (id) => set({
    placedBlocks: get().placedBlocks.filter((b) => b.id !== id),
  }),

  // Полностью очистить дорожки
  clearBlocks: () => set({ placedBlocks: [] }),
}));
