'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import type { EntryAction } from '@/lib/jsm/schema';

function EntryActionRow({
  action,
  onChange,
  onDelete,
}: {
  action: EntryAction;
  onChange: (a: EntryAction) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-1.5 items-start">
      <div className="flex-1 flex flex-col gap-1">
        <input
          className="w-full text-xs text-zinc-800 border border-zinc-200 rounded px-2 py-1 focus:border-blue-400 focus:outline-none"
          placeholder="if condition…"
          value={action.check}
          onChange={e => onChange({ ...action, check: e.target.value })}
        />
        <input
          className="w-full text-xs text-zinc-800 border border-zinc-200 rounded px-2 py-1 focus:border-blue-400 focus:outline-none"
          placeholder="then action…"
          value={action.action}
          onChange={e => onChange({ ...action, action: e.target.value })}
        />
      </div>
      <button
        onClick={onDelete}
        className="mt-1 p-1 text-zinc-300 hover:text-red-400 transition-colors shrink-0"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

export function InspectorPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);
  const selectedEdgeId = useStore(s => s.selectedEdgeId);
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);
  const start = useStore(s => s.start);
  const renameNode = useStore(s => s.renameNode);
  const updateEntryActions = useStore(s => s.updateEntryActions);
  const updateEdgeLabel = useStore(s => s.updateEdgeLabel);
  const deleteNodes = useStore(s => s.deleteNodes);
  const deleteEdges = useStore(s => s.deleteEdges);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  // Local name edit state
  const [nameDraft, setNameDraft] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedNode) {
      const localName = selectedNode.id.split('.').pop()!;
      setNameDraft(localName);
    }
  }, [selectedNode?.id]);

  function commitRename() {
    if (!selectedNode || !nameDraft.trim()) return;
    renameNode(selectedNode.id, nameDraft.trim());
  }

  function addEntryAction() {
    if (!selectedNode) return;
    const actions = [...selectedNode.data.entryActions, { check: '', action: '' }];
    updateEntryActions(selectedNode.id, actions);
  }

  function updateAction(index: number, updated: EntryAction) {
    if (!selectedNode) return;
    const actions = selectedNode.data.entryActions.map((a, i) =>
      i === index ? updated : a,
    );
    updateEntryActions(selectedNode.id, actions);
  }

  function removeAction(index: number) {
    if (!selectedNode) return;
    const actions = selectedNode.data.entryActions.filter((_, i) => i !== index);
    updateEntryActions(selectedNode.id, actions);
  }

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-xs text-zinc-400 text-center leading-relaxed">
          Click a state or transition to inspect and edit
        </p>
      </div>
    );
  }

  if (selectedEdge) {
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Transition
          </h3>
          <button
            onClick={() => deleteEdges([selectedEdge.id])}
            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
        <div className="text-xs text-zinc-500 flex gap-1 items-center">
          <span className="font-medium text-zinc-700">{sourceNode?.data.label ?? selectedEdge.source}</span>
          <span>→</span>
          <span className="font-medium text-zinc-700">{targetNode?.data.label ?? selectedEdge.target}</span>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Condition</label>
          <input
            className="w-full text-xs text-zinc-800 border border-zinc-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none"
            placeholder="condition…"
            value={String(selectedEdge.label ?? '')}
            onChange={e => updateEdgeLabel(selectedEdge.id, e.target.value)}
          />
        </div>
      </div>
    );
  }

  // Node inspector
  const localName = selectedNode!.id.split('.').pop()!;
  const isStart = selectedNode!.id === start;

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          State
        </h3>
        <button
          onClick={() => deleteNodes([selectedNode!.id])}
          className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
        >
          Delete
        </button>
      </div>

      {isStart && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
          Start state
        </span>
      )}

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Name</label>
        <input
          ref={nameInputRef}
          className="w-full text-sm text-zinc-800 border border-zinc-200 rounded px-2 py-1.5 focus:border-blue-400 focus:outline-none font-medium"
          value={nameDraft}
          onChange={e => setNameDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') { commitRename(); nameInputRef.current?.blur(); }
          }}
        />
        {selectedNode!.id !== (selectedNode!.id.split('.').slice(0, -1).join('.') ? `${selectedNode!.id.split('.').slice(0, -1).join('.')}.${nameDraft}` : nameDraft) && (
          <p className="mt-1 text-xs text-zinc-400">Full ID: {selectedNode!.id}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500">Entry Actions</label>
          <button
            onClick={addEntryAction}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            + Add
          </button>
        </div>
        {selectedNode!.data.entryActions.length === 0 ? (
          <p className="text-xs text-zinc-300 italic">None</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedNode!.data.entryActions.map((action, i) => (
              <EntryActionRow
                key={i}
                action={action}
                onChange={updated => updateAction(i, updated)}
                onDelete={() => removeAction(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
