'use client';
import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionMode,
  type DefaultEdgeOptions,
  type NodeTypes,
  type EdgeTypes,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { useLibraryStore } from '@/lib/libraryStore';
import { StateNode } from './StateNode';
import { EditableEdge } from './EditableEdge';
import { ContextMenu } from './ContextMenu';
import { LayoutSelector } from './LayoutSelector';
import { ProgressBar } from './ProgressBar';
import type { StateNode as StateNodeType } from '@/lib/jsm/parse';

const nodeTypes: NodeTypes = { stateNode: StateNode };
const edgeTypes: EdgeTypes = { editableEdge: EditableEdge };

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'editableEdge',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  style: { strokeWidth: 1.5 },
};

interface ContextMenuState {
  x: number;
  y: number;
  flowX: number;
  flowY: number;
}

export function FlowChart() {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const isLoading = useStore(s => s.isLoading);
  const parseProgress = useStore(s => s.parseProgress);
  const onNodesChange = useStore(s => s.onNodesChange);
  const onEdgesChange = useStore(s => s.onEdgesChange);
  const connectNodes = useStore(s => s.connectNodes);
  const addNode = useStore(s => s.addNode);
  const selectNode = useStore(s => s.selectNode);
  const selectEdge = useStore(s => s.selectEdge);
  const layoutAlgorithm = useStore(s => s.layoutAlgorithm);
  const setLayoutAlgorithm = useStore(s => s.setLayoutAlgorithm);
  const setDrawerOpen = useLibraryStore(s => s.setDrawerOpen);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const handleNodesChange = useCallback(
    (changes: NodeChange<StateNodeType>[]) => onNodesChange(changes),
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => onEdgesChange(changes),
    [onEdgesChange],
  );

  const handleConnect = useCallback(
    (connection: Connection) => connectNodes(connection),
    [connectNodes],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => selectNode(node.id),
    [selectNode],
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => selectEdge(edge.id),
    [selectEdge],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const handlePaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      const rect = flowRef.current?.getBoundingClientRect();
      if (!rect) return;
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        flowX: e.clientX - rect.left,
        flowY: e.clientY - rect.top,
      });
    },
    [],
  );

  if (nodes.length === 0) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400 relative"
        onContextMenu={e => {
          e.preventDefault();
          addNode({ x: 100, y: 100 });
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-lg z-50">
            <div className="flex flex-col items-center gap-3">
              {parseProgress ? (
                <ProgressBar {...parseProgress} />
              ) : (
                <>
                  <div className="w-8 h-8 border-3 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-zinc-600 font-medium">Parsing JSM...</p>
                </>
              )}
            </div>
          </div>
        )}
        <p className="text-sm">Paste a JSM in the left panel, or</p>
        <button
          onClick={() => addNode({ x: 200, y: 150 })}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Add first state
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          or load from Library
        </button>
      </div>
    );
  }

  return (
    <div ref={flowRef} className="h-full w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50 rounded-lg pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            {parseProgress ? (
              <ProgressBar {...parseProgress} />
            ) : (
              <>
                <div className="w-8 h-8 border-3 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-zinc-600 font-medium">Parsing JSM...</p>
              </>
            )}
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <LayoutSelector
            value={layoutAlgorithm}
            onChange={setLayoutAlgorithm}
          />
          <button
            onClick={() => addNode({ x: 200, y: 200 })}
            className="rounded-md bg-white border border-zinc-200 shadow-sm px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            + Add State
          </button>
        </div>
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddNode={() => addNode({ x: contextMenu.flowX, y: contextMenu.flowY })}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
