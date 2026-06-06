'use client';
import { useEffect } from 'react';
import { JsmInput } from '@/components/JsmInput';
import { FlowChart } from '@/components/FlowChart';
import { LibraryDrawer } from '@/components/LibraryDrawer';
import { InspectorPanel } from '@/components/InspectorPanel';
import { useLibraryStore } from '@/lib/libraryStore';
import { useStore } from '@/lib/store';

export default function Home() {
  const loadEntry = useStore(s => s.loadEntry);
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedEdgeId = useStore(s => s.selectedEdgeId);

  const showInspector = !!(selectedNodeId || selectedEdgeId);

  useEffect(() => {
    useLibraryStore.persist.rehydrate();
    const { activeId } = useLibraryStore.getState();
    if (activeId) loadEntry(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    </div>
  );
}
