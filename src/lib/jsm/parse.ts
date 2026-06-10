import type { Node, Edge } from '@xyflow/react';
import type { JSM, State, EntryAction } from './schema';

export type StateNodeData = {
  label: string;
  entryActions: EntryAction[];
};

export type StateNode = Node<StateNodeData, 'stateNode'>;

export type ParseProgressCallback = (progress: {
  currentIndex: number;
  totalNodes: number;
  currentNodeId: string;
  previousNodeId?: string;
}) => void;

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

export function parseJSM(
  jsm: JSM,
  onProgress?: ParseProgressCallback,
): { nodes: StateNode[]; edges: Edge[] } {
  const flat = flattenStates(jsm.states);
  
  // Create a map of all possible node IDs for target resolution
  const allNodeIds = new Set(flat.map(f => f.id));

  const nodes: StateNode[] = [];
  let previousNodeId: string | undefined;

  for (let i = 0; i < flat.length; i++) {
    const { id, state } = flat[i];
    
    onProgress?.({
      currentIndex: i + 1,
      totalNodes: flat.length,
      currentNodeId: id,
      previousNodeId,
    });

    nodes.push({
      id,
      type: 'stateNode',
      position: { x: 0, y: 0 },
      data: {
        label: id,
        entryActions: state.entryActions ?? [],
      },
    });

    previousNodeId = id;
  }

  const edges: Edge[] = flat.flatMap(({ id, state }) =>
    (state.exitChecks ?? []).map((check, i) => {
      let target = check.goTo;
      
      // Resolve relative targets
      if (!allNodeIds.has(target)) {
        // Try: source.target (sibling of source or child of source)
        if (allNodeIds.has(`${id}.${target}`)) {
          target = `${id}.${target}`;
        } 
        // Try: parent.target (sibling of source's parent)
        else if (id.includes('.')) {
          const sourcePrefix = id.substring(0, id.lastIndexOf('.'));
          const prefixedTarget = `${sourcePrefix}.${target}`;
          if (allNodeIds.has(prefixedTarget)) {
            target = prefixedTarget;
          }
          // Fallback: find any node that ends with .target
          else {
            const match = Array.from(allNodeIds).find(nodeId => nodeId.endsWith(`.${target}`));
            if (match) {
              target = match;
            }
          }
        } else {
          // At root level - try to find any node with this name as suffix
          const match = Array.from(allNodeIds).find(nodeId => nodeId.endsWith(`.${target}`) || nodeId === target);
          if (match) {
            target = match;
          }
        }
      }
      
      return {
        id: `${id}->${check.goTo}-${i}`,
        source: id,
        target,
        label: check.check,
      };
    }),
  );

  return { nodes, edges };
}
