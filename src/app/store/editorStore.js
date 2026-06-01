import { create } from 'zustand';
// этот файл хранит в себе данные состояния: bpm песни, проигрывается ли она сейчас и т.д.
export const useEditorStore = create((set) => ({
  bpm: 80,
  isPlaying: false,
  tracks: [],
  blocks: [],
  selectedBlockId: null,
  
  setBpm: (bpm) => set({ bpm }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setTracks: (tracks) => set({ tracks }),
  setBlocks: (blocks) => set({ blocks }),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
}));