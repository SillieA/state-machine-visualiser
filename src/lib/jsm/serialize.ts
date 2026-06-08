import type { Edge } from '@xyflow/react';
import type { JSM, State, EntryAction } from './schema';
import type { StateNode } from './parse';

function getParentId(id: string): string | null {
  const dot = id.lastIndexOf('.');
  return dot === -1 ? null : id.slice(0, dot);
}

function getLocalName(id: string): string {
  return id.split('.').pop()!;
}

export function serializeToJSM(
  nodes: StateNode[],
  edges: Edge[],
  start: string,
): JSM {
  const exitChecksMap = new Map<string, Array<{ check: string; goTo: string }>>();
  edges.forEach(edge => {
    const label = String(edge.label ?? '').trim();
    const checks = exitChecksMap.get(edge.source) ?? [];
    checks.push({ check: label, goTo: edge.target });
    exitChecksMap.set(edge.source, checks);
  });

  function serializeState(node: StateNode): State {
    const id = node.id;
    const entryActions: EntryAction[] = node.data.entryActions ?? [];
    const exitChecks = exitChecksMap.get(id) ?? [];
    const children = nodes.filter(n => getParentId(n.id) === id);

    return {
      name: getLocalName(id),
      ...(entryActions.length > 0 ? { entryActions } : {}),
      ...(exitChecks.length > 0 ? { exitChecks } : {}),
      ...(children.length > 0 ? { children: children.map(serializeState) } : {}),
    };
  }

  const topLevel = nodes.filter(n => getParentId(n.id) === null);

  return {
    entryStateName: start,
    states: topLevel.map(serializeState),
  };
}
