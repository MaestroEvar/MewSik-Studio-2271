import { create } from 'zustand';
// этот файл хранит в себе данные состояния: bpm песни, проигрывается ли она сейчас и т.д.
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
}));