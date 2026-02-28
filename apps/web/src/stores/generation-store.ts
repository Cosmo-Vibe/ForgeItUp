import { create } from 'zustand';
import type { Generation, GenerationStatus } from '@forgeitup/shared';

interface GenerationState {
  currentGenerationId: string | null;
  currentGeneration: Generation | null;
  status: GenerationStatus | null;
  progress: number;
  logs: string[];
  generations: Generation[];
  isPolling: boolean;

  setCurrentGenerationId: (id: string) => void;
  setCurrentGeneration: (generation: Generation) => void;
  updateStatus: (status: GenerationStatus, progress?: number) => void;
  appendLog: (log: string) => void;
  setGenerations: (generations: Generation[]) => void;
  addGeneration: (generation: Generation) => void;
  updateGeneration: (id: string, updates: Partial<Generation>) => void;
  setIsPolling: (polling: boolean) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  currentGenerationId: null,
  currentGeneration: null,
  status: null,
  progress: 0,
  logs: [],
  generations: [],
  isPolling: false,

  setCurrentGenerationId: (id) => set({ currentGenerationId: id }),
  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),
  updateStatus: (status, progress) => set({ status, ...(progress !== undefined && { progress }) }),
  appendLog: (log) =>
    set((state) => ({ logs: [...state.logs, `[${new Date().toISOString()}] ${log}`] })),
  setGenerations: (generations) => set({ generations }),
  addGeneration: (generation) =>
    set((state) => ({ generations: [generation, ...state.generations] })),
  updateGeneration: (id, updates) =>
    set((state) => ({
      generations: state.generations.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  setIsPolling: (isPolling) => set({ isPolling }),
  reset: () =>
    set({
      currentGenerationId: null,
      currentGeneration: null,
      status: null,
      progress: 0,
      logs: [],
    }),
}));
