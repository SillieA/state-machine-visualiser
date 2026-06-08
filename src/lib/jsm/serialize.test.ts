import { describe, it, expect } from 'vitest';
import { serializeToJSM } from './serialize';
import type { StateNode } from './parse';
import type { Edge } from '@xyflow/react';

import type { EntryAction } from './schema';

function node(id: string, entryActions: EntryAction[] = []): StateNode {
  return {
    id,
    type: 'stateNode',
    position: { x: 0, y: 0 },
    data: { label: id, entryActions },
  };
}

function edge(source: string, target: string, label: string, i = 0): Edge {
  return { id: `${source}->${target}-${i}`, source, target, label };
}

describe('serializeToJSM', () => {
  it('serializes flat states', () => {
    const nodes = [node('Pending'), node('Done')];
    const edges = [edge('Pending', 'Done', 'finished')];
    const jsm = serializeToJSM(nodes, edges, 'Pending');

    expect(jsm.entryStateName).toBe('Pending');
    expect(jsm.states).toHaveLength(2);
    expect(jsm.states[0]).toMatchObject({
      name: 'Pending',
      exitChecks: [{ check: 'finished', goTo: 'Done' }],
    });
    expect(jsm.states[1]).toMatchObject({ name: 'Done' });
  });

  it('nests child states under their parent', () => {
    const nodes = [node('Complete'), node('Complete.Success'), node('Complete.Error')];
    const jsm = serializeToJSM(nodes, [], 'Complete');

    expect(jsm.states).toHaveLength(1);
    expect(jsm.states[0].name).toBe('Complete');
    expect(jsm.states[0].children).toHaveLength(2);
    expect(jsm.states[0].children![0].name).toBe('Success');
    expect(jsm.states[0].children![1].name).toBe('Error');
  });

  it('uses local name (last segment) for nested state names', () => {
    const nodes = [node('A'), node('A.B'), node('A.B.C')];
    const jsm = serializeToJSM(nodes, [], 'A');

    const a = jsm.states[0];
    expect(a.name).toBe('A');
    expect(a.children![0].name).toBe('B');
    expect(a.children![0].children![0].name).toBe('C');
  });

  it('attaches entry actions to the correct state', () => {
    const nodes = [
      node('Pending', [{ check: 'always', action: 'init' }]),
    ];
    const jsm = serializeToJSM(nodes, [], 'Pending');
    expect(jsm.states[0].entryActions).toEqual([{ check: 'always', action: 'init' }]);
  });

  it('omits empty arrays from output', () => {
    const jsm = serializeToJSM([node('Idle')], [], 'Idle');
    expect(jsm.states[0].entryActions).toBeUndefined();
    expect(jsm.states[0].exitChecks).toBeUndefined();
    expect(jsm.states[0].children).toBeUndefined();
  });

  it('round-trips through parse then serialize', async () => {
    const { parseJSM } = await import('./parse');
    const original = {
      entryStateName: 'Pending',
      states: [
        {
          name: 'Pending',
          entryActions: [{ check: 'ready', action: 'init' }],
          exitChecks: [{ check: 'done', goTo: 'Complete.Success' }],
        },
        {
          name: 'Complete',
          children: [{ name: 'Success' }, { name: 'Error' }],
        },
      ],
    };
    const { nodes, edges } = parseJSM(original);
    const result = serializeToJSM(nodes, edges, 'Pending');
    expect(result).toEqual(original);
  });
});
