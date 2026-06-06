import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutType } from '@/lib/jsm/layout';

export type Positions = Record<string, { x: number; y: number }>;

export type PersistedEdgeData = {
  controlPoint?: { x: number; y: number };
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

export type SavedJSM = {
  id: string;
  name: string;
  raw: string;
  positions: Positions;
  edgeData?: Record<string, PersistedEdgeData>;
  layoutAlgorithm?: LayoutType;
  createdAt: number;
  updatedAt: number;
};

interface LibraryState {
  entries: SavedJSM[];
  activeId: string | null;
  isDrawerOpen: boolean;
  isHydrated: boolean;
  createEntry: (name: string, raw: string, positions: Positions) => string;
  updateEntry: (id: string, patch: Partial<Pick<SavedJSM, 'name' | 'raw' | 'positions' | 'edgeData' | 'layoutAlgorithm'>>) => void;
  removeEntry: (id: string) => void;
  setActive: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      entries: [],
      activeId: null,
      isDrawerOpen: false,
      isHydrated: false,

      createEntry: (name, raw, positions) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        set(state => ({
          entries: [
            { id, name, raw, positions, createdAt: now, updatedAt: now },
            ...state.entries,
          ],
        }));
        return id;
      },

      updateEntry: (id, patch) =>
        set(state => ({
          entries: state.entries.map(e =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
          ),
        })),

      removeEntry: (id) =>
        set(state => ({
          entries: state.entries.filter(e => e.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
        })),

      setActive: (id) => set({ activeId: id }),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'jsm-library',
      skipHydration: true,
      partialize: (state) => ({ entries: state.entries, activeId: state.activeId }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
