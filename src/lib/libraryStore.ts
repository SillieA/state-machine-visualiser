import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  createdAt: number;
  updatedAt: number;
};

interface LibraryState {
  entries: SavedJSM[];
  activeId: string | null;
  isDrawerOpen: boolean;
  createEntry: (name: string, raw: string, positions: Positions) => string;
  updateEntry: (id: string, patch: Partial<Pick<SavedJSM, 'name' | 'raw' | 'positions' | 'edgeData'>>) => void;
  removeEntry: (id: string) => void;
  setActive: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      entries: [],
      activeId: null,
      isDrawerOpen: false,

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
    }),
    {
      name: 'jsm-library',
      skipHydration: true,
      partialize: (state) => ({ entries: state.entries, activeId: state.activeId }),
    },
  ),
);
