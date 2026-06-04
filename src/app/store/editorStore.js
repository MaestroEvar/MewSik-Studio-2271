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

export const editorStore = create((set) => ({
  bpm: 80,
  isPlaying: false,
  tracks: [],
  blocks: [],
  selectedBlockId: null,
  
  setBpm: (newBpm) => set({ bpm: newBpm }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setTracks: (tracks) => set({ tracks }),
  setBlocks: (blocks) => set({ blocks }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
    setSelectedCat: (cat) => set({
      selectedCat: cat,
      selectedSounds: cat ? generateCatSounds(cat) : []
    }),
}));