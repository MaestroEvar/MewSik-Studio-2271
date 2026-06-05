import { create } from 'zustand';
// этот файл хранит в себе данные состояния: bpm песни, проигрывается ли она сейчас и т.д.

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
// Pad звуки длинные - занимают 4 клетки, остальные - 1.
function getSpanForCategory(category) {
  return category === 'Pad' ? 4 : 1;
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
    const bEnd = b.step + b.span; // не включительно
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
  tracks: [],
  blocks: [],
  selectedBlockId: null,

  // Размещённые на дорожках блоки звуков.
  // Каждый: { id, trackIndex, step, span, label, sound, category }
  placedBlocks: [],

  setBpm: (newBpm) => set({ bpm: newBpm }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setTracks: (tracks) => set({ tracks }),
  setBlocks: (blocks) => set({ blocks }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
    setSelectedCat: (cat) => set({
      selectedCat: cat,
      selectedSounds: cat ? generateCatSounds(cat) : []
    }),

  // Размещение звука на дорожке через drag-and-drop.
  // payload: { trackIndex, step, label, sound, category }
  // Правила:
  //   - Pad (span 4): ставим только если все 4 клетки свободны, иначе ничего.
  //   - Обычный звук (span 1): заменяем блок, который уже стоит в этой клетке.
  placeBlock: ({ trackIndex, step, label, sound, category }) => {
    const span = getSpanForCategory(category);
    const current = get().placedBlocks;

    if (span > 1) {
      // Длинный Pad звук - строгая проверка: все клетки диапазона должны быть свободны
      if (!rangeIsFree(current, trackIndex, step, span)) {
        return; // Заняты - ничего не делаем
      }
      const newBlock = {
        id: Date.now() + Math.random(),
        trackIndex, step, span, label, sound, category,
      };
      set({ placedBlocks: [...current, newBlock] });
      return;
    }

    // Обычный звук на 1 клетку - убираем всё, что пересекается с этой клеткой (замена)
    const cleaned = current.filter((b) => {
      if (b.trackIndex !== trackIndex) return true;
      const bStart = b.step;
      const bEnd = b.step + b.span;
      const overlap = step < bEnd && bStart < step + 1;
      return !overlap; // оставляем только непересекающиеся
    });

    const newBlock = {
      id: Date.now() + Math.random(),
      trackIndex, step, span, label, sound, category,
    };
    set({ placedBlocks: [...cleaned, newBlock] });
  },

  // Удалить один размещённый блок по id
  removeBlock: (id) => set({
    placedBlocks: get().placedBlocks.filter((b) => b.id !== id),
  }),

  // Полностью очистить дорожки
  clearBlocks: () => set({ placedBlocks: [] }),
}));
