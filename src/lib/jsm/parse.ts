import type { Node, Edge } from '@xyflow/react';
import type { JSM, State, EntryAction } from './schema';

export type StateNodeData = {
  label: string;
  entryActions: EntryAction[];
};

export type StateNode = Node<StateNodeData, 'stateNode'>;

function flattenStates(
  states: State[],
  prefix = '',
): Array<{ id: string; state: State }> {
  return states.flatMap(state => {
    const id = prefix ? `${prefix}.${state.name}` : state.name;
    const entry = { id, state };
    if (state.children?.length) {
      return [entry, ...flattenStates(state.children, id)];
    }
    return [entry];
  });
}

export function applyEdgeDefaults(edges: Edge[]): Edge[] {
  return edges.map(edge => ({
    ...edge,
    sourceHandle: edge.sourceHandle ?? 'Bottom-s',
    targetHandle: edge.targetHandle ?? 'Top-t',
  }));
}

export function parseJSM(jsm: JSM): { nodes: StateNode[]; edges: Edge[] } {
  const flat = flattenStates(jsm.states);

  const nodes: StateNode[] = flat.map(({ id, state }) => ({
    id,
    type: 'stateNode',
    position: { x: 0, y: 0 },
    data: {
      label: id,
      entryActions: state.entryActions ?? [],
    },
  }));

  const edges: Edge[] = flat.flatMap(({ id, state }) =>
    (state.exitChecks ?? []).map((check, i) => ({
      id: `${id}->${check.goTo}-${i}`,
      source: id,
      target: check.goTo,
      label: check.check,
    })),
  );

  return { nodes, edges };
}
