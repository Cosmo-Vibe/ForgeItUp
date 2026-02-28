import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Platform,
  ModType,
  ModLoader,
  GenerationMode,
  FeatureConfig,
} from '@forgeitup/shared';

interface BuilderState {
  // Step tracking
  currentStep: number;

  // Configuration
  platform: Platform | null;
  type: ModType | null;
  loader: ModLoader | null;
  mcVersion: string | null;
  loaderVersion: string | null;
  mode: GenerationMode;

  // Mod metadata
  modId: string;
  modName: string;
  author: string;
  description: string;
  version: string;

  // AI mode
  prompt: string;

  // Manual mode
  features: FeatureConfig[];

  // Actions
  setPlatform: (platform: Platform) => void;
  setType: (type: ModType) => void;
  setLoader: (loader: ModLoader) => void;
  setMcVersion: (version: string) => void;
  setLoaderVersion: (version: string) => void;
  setMode: (mode: GenerationMode) => void;
  setModId: (id: string) => void;
  setModName: (name: string) => void;
  setAuthor: (author: string) => void;
  setDescription: (desc: string) => void;
  setVersion: (version: string) => void;
  setPrompt: (prompt: string) => void;
  addFeature: (feature: FeatureConfig) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, config: Partial<FeatureConfig>) => void;
  reorderFeatures: (features: FeatureConfig[]) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  platform: null,
  type: null,
  loader: null,
  mcVersion: null,
  loaderVersion: null,
  mode: 'ai' as GenerationMode,
  modId: '',
  modName: '',
  author: '',
  description: '',
  version: '1.0.0',
  prompt: '',
  features: [],
};

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set) => ({
      ...initialState,

      setPlatform: (platform) =>
        set({ platform, type: null, loader: null, mcVersion: null, loaderVersion: null }),
      setType: (type) => set({ type }),
      setLoader: (loader) => set({ loader }),
      setMcVersion: (mcVersion) => set({ mcVersion, loaderVersion: null }),
      setLoaderVersion: (loaderVersion) => set({ loaderVersion }),
      setMode: (mode) => set({ mode }),
      setModId: (modId) => set({ modId }),
      setModName: (modName) => set({ modName }),
      setAuthor: (author) => set({ author }),
      setDescription: (description) => set({ description }),
      setVersion: (version) => set({ version }),
      setPrompt: (prompt) => set({ prompt }),

      addFeature: (feature) =>
        set((state) => ({
          features: [...state.features, { ...feature, order: state.features.length }],
        })),

      removeFeature: (id) =>
        set((state) => ({
          features: state.features
            .filter((f) => f.id !== id)
            .map((f, i) => ({ ...f, order: i })),
        })),

      updateFeature: (id, config) =>
        set((state) => ({
          features: state.features.map((f) => (f.id === id ? { ...f, ...config } : f)),
        })),

      reorderFeatures: (features) => set({ features }),

      goToStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      reset: () => set(initialState),
    }),
    { name: 'builder-store' },
  ),
);
