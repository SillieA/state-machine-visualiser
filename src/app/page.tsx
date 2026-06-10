'use client';
import { useEffect, useState } from 'react';
import { JsmInput } from '@/components/JsmInput';
import { FlowChart } from '@/components/FlowChart';
import { LibraryDrawer } from '@/components/LibraryDrawer';
import { InspectorPanel } from '@/components/InspectorPanel';
import { useLibraryStore } from '@/lib/libraryStore';
import { useStore } from '@/lib/store';
import { decodeJSMCompressed } from '@/lib/shareState';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreenSidebar, setFullscreenSidebar] = useState(false);
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
      {fullscreenSidebar ? (
        // Fullscreen sidebar mode
        <aside className="w-full h-full flex flex-col border-r border-zinc-200 bg-white p-4">
          <JsmInput
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleFullscreen={() => setFullscreenSidebar(false)}
            fullscreenMode
          />
        </aside>
      ) : (
        // Normal layout
        <>
          {sidebarOpen && (
            <aside className="w-80 shrink-0 flex flex-col border-r border-zinc-200 bg-white p-4 transition-all duration-300 ease-in-out">
              <JsmInput
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onToggleFullscreen={() => setFullscreenSidebar(true)}
                fullscreenMode={false}
              />
            </aside>
          )}

          <main className="flex-1 overflow-hidden">
            <FlowChart />

            {/* Floating sidebar toggle button */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-3 left-3 z-40 p-2 bg-white text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg shadow-sm border border-zinc-200 transition-colors"
                title="Open sidebar"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </main>

          {showInspector && (
            <aside className="flex w-72 shrink-0 flex-col border-l border-zinc-200 bg-white overflow-y-auto transition-all duration-300">
              <InspectorPanel />
            </aside>
          )}
        </>
      )}

      <LibraryDrawer />

      <div className="pointer-events-none fixed bottom-1 right-32 z-50 select-none font-mono text-[10px] text-zinc-400">
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
