'use client';
import { useEffect } from 'react';
import { JsmInput } from '@/components/JsmInput';
import { FlowChart } from '@/components/FlowChart';
import { LibraryDrawer } from '@/components/LibraryDrawer';
import { InspectorPanel } from '@/components/InspectorPanel';
import { useLibraryStore } from '@/lib/libraryStore';
import { useStore } from '@/lib/store';
import { decodeJSMCompressed } from '@/lib/shareState';

export default function Home() {
  const loadEntry = useStore(s => s.loadEntry);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedEdgeId = useStore(s => s.selectedEdgeId);
  const isHydrated = useLibraryStore(s => s.isHydrated);

  const showInspector = !!(selectedNodeId || selectedEdgeId);

  useEffect(() => {
    // Only run on client after hydration
    if (typeof window === 'undefined' || !isHydrated) return;

    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get('name');
    const data = searchParams.get('data');

    if (name && data) {
      // Decode shared JSM
      const decoded = decodeJSMCompressed(data);

      if (decoded) {
        // Check if JSM with this name already exists
        const { entries, createEntry, updateEntry, setActive } = useLibraryStore.getState();
        const existing = entries.find(e => e.name === name);

        console.warn('Existing entry EXISTS. Delete or rename to import', existing);

        if (!existing) {
          // Create new entry with shared data
          const newId = createEntry(decoded.name, decoded.raw, decoded.positions);

          // Update with additional fields (layout, edge data)
          updateEntry(newId, {
            layoutAlgorithm: decoded.layoutAlgorithm,
            edgeData: decoded.edgeData,
          });
          setActive(newId);
          loadEntry(newId);
        } else {
          // Load existing entry
          setActive(existing.id);
          loadEntry(existing.id);
        }
        return;
      }
    }

    // Fall back to normal initialization
    const { activeId } = useLibraryStore.getState();
    if (activeId) loadEntry(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50">
      <aside className="flex w-80 shrink-0 flex-col border-r border-zinc-200 bg-white p-4">
        <JsmInput />
      </aside>

      <main className="flex-1 overflow-hidden">
        <FlowChart />
      </main>

      {showInspector && (
        <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white overflow-y-auto">
          <InspectorPanel />
        </aside>
      )}

      <LibraryDrawer />

      <div className="pointer-events-none fixed bottom-1 right-2 z-50 select-none font-mono text-[10px] text-zinc-400">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
        {process.env.NEXT_PUBLIC_BUILD_TIME && (
          <span className="ml-1 text-zinc-300">
            ({process.env.NEXT_PUBLIC_BUILD_TIME.slice(0, 16).replace('T', ' ')})
          </span>
        )}
      </div>
    </div>
  );
}
