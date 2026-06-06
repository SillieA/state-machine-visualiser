'use client';
import { useStore } from '@/lib/store';
import { useLibraryStore } from '@/lib/libraryStore';
import { ShareButton } from '@/components/ShareButton';
import { exportJSM } from '@/lib/jsm/export';

export function JsmInput() {
  const input = useStore(s => s.input);
  const error = useStore(s => s.error);
  const setInput = useStore(s => s.setInput);
  const resetLayout = useStore(s => s.resetLayout);

  const { activeId, entries, isHydrated, setDrawerOpen } = useLibraryStore();
  const activeEntry = entries.find(e => e.id === activeId);

  // Hydrate on mount
  if (!isHydrated && typeof window !== 'undefined') {
    useLibraryStore.persist.rehydrate();
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 truncate">
          {activeEntry ? activeEntry.name : 'New JSM'}
        </h2>
        <button
          onClick={() => setDrawerOpen(true)}
          className="shrink-0 text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
        >
          ☰ Library
        </button>
      </div>

      <textarea
        className="flex-1 resize-none rounded-md border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder='{ "start": "Pending", "states": [...] }'
        value={input}
        onChange={e => setInput(e.target.value)}
        spellCheck={false}
      />

      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        {isHydrated && (
          <>
            <button
              onClick={resetLayout}
              disabled={!activeEntry}
              className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset Layout
            </button>
            <ShareButton />
            <button
              onClick={() => activeEntry && exportJSM(activeEntry.name, activeEntry.raw)}
              disabled={!activeEntry}
              className="flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Export ↓
            </button>
          </>
        )}
      </div>
    </div>
  );
}
