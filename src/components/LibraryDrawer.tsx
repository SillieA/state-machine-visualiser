'use client';
import { useState } from 'react';
import { useLibraryStore, type SavedJSM } from '@/lib/libraryStore';
import { useStore } from '@/lib/store';
import { exportJSM } from '@/lib/jsm/export';

export function LibraryDrawer() {
  const { entries, activeId, isDrawerOpen, setDrawerOpen, removeEntry, updateEntry } =
    useLibraryStore();
  const loadEntry = useStore(s => s.loadEntry);
  const newJSM = useStore(s => s.newJSM);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const sorted = [...entries].sort((a, b) => b.updatedAt - a.updatedAt);

  function startRename(entry: SavedJSM, e: React.MouseEvent) {
    e.stopPropagation();
    setRenamingId(entry.id);
    setRenameValue(entry.name);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      updateEntry(renamingId, { name: renameValue.trim() });
    }
    setRenamingId(null);
  }

  function handleLoad(entry: SavedJSM) {
    loadEntry(entry.id);
    setDrawerOpen(false);
  }

  function handleNew() {
    newJSM();
    setDrawerOpen(false);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-700">Saved JSMs</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-3 py-2 border-b border-zinc-100 shrink-0">
          <button
            onClick={handleNew}
            className="w-full rounded-md border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 transition-colors"
          >
            + New JSM
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {sorted.length === 0 && (
            <p className="px-4 py-8 text-xs text-zinc-400 text-center">No saved JSMs yet</p>
          )}
          {sorted.map(entry => (
            <div
              key={entry.id}
              className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-zinc-50 transition-colors ${
                entry.id === activeId ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleLoad(entry)}
            >
              <div className="flex-1 min-w-0">
                {renamingId === entry.id ? (
                  <input
                    autoFocus
                    className="w-full text-sm text-zinc-800 border border-blue-400 rounded px-1 py-0.5 outline-none bg-white"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <p
                    className={`text-sm truncate ${
                      entry.id === activeId
                        ? 'text-blue-700 font-medium'
                        : 'text-zinc-700'
                    }`}
                  >
                    {entry.name}
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(entry.updatedAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div
                className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                  title="Rename"
                  onClick={e => startRename(entry, e)}
                >
                  ✏
                </button>
                <button
                  className="p-1.5 rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                  title="Export"
                  onClick={() => exportJSM(entry.name, entry.raw)}
                >
                  ↓
                </button>
                <button
                  className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50"
                  title="Delete"
                  onClick={() => removeEntry(entry.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
