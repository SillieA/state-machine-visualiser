import { describe, it, expect } from 'vitest';
import { parseJSM, applyEdgeDefaults } from './parse';
import type { JSM } from './schema';

const sampleJSM: JSM = {
  start: 'Pending',
  states: [
    {
      name: 'Pending',
      entryActions: [{ check: 'ready', action: 'init' }],
      exitChecks: [
        { check: 'success', goTo: 'Complete.Success' },
        { check: 'error', goTo: 'Complete.Error' },
      ],
    },
    {
      name: 'Complete',
      children: [{ name: 'Success' }, { name: 'Error' }],
    },
  ],
};

describe('parseJSM', () => {
  it('creates a node for every flat and child state', () => {
    const { nodes } = parseJSM(sampleJSM);
    const ids = nodes.map(n => n.id);
    expect(ids).toContain('Pending');
    expect(ids).toContain('Complete');
    expect(ids).toContain('Complete.Success');
    expect(ids).toContain('Complete.Error');
    expect(nodes).toHaveLength(4);
  });

  it('labels child nodes with Parent.Child notation', () => {
    const { nodes } = parseJSM(sampleJSM);
    const successNode = nodes.find(n => n.id === 'Complete.Success');
    expect(successNode?.data.label).toBe('Complete.Success');
  });

  it('attaches entryActions to node data', () => {
    const { nodes } = parseJSM(sampleJSM);
    const pending = nodes.find(n => n.id === 'Pending');
    expect(pending?.data.entryActions).toEqual([{ check: 'ready', action: 'init' }]);
  });

  it('creates edges from exitChecks', () => {
    const { edges } = parseJSM(sampleJSM);
    expect(edges).toHaveLength(2);
    expect(edges[0]).toMatchObject({ source: 'Pending', target: 'Complete.Success', label: 'success' });
    expect(edges[1]).toMatchObject({ source: 'Pending', target: 'Complete.Error', label: 'error' });
  });

  it('sets all initial positions to 0,0', () => {
    const { nodes } = parseJSM(sampleJSM);
    nodes.forEach(n => expect(n.position).toEqual({ x: 0, y: 0 }));
  });

  it('sets node type to stateNode', () => {
    const { nodes } = parseJSM(sampleJSM);
    nodes.forEach(n => expect(n.type).toBe('stateNode'));
  });

  it('creates edges without handles (defaults applied later)', () => {
    const { edges } = parseJSM(sampleJSM);
    expect(edges[0]).not.toHaveProperty('sourceHandle');
    expect(edges[0]).not.toHaveProperty('targetHandle');
  });
});

describe('applyEdgeDefaults', () => {
  it('adds Bottom-s sourceHandle to edges without one', () => {
    const edges = [{ id: 'e1', source: 'A', target: 'B', label: 'test' }];
    const result = applyEdgeDefaults(edges);
    expect(result[0].sourceHandle).toBe('Bottom-s');
  });

  it('adds Top-t targetHandle to edges without one', () => {
    const edges = [{ id: 'e1', source: 'A', target: 'B', label: 'test' }];
    const result = applyEdgeDefaults(edges);
    expect(result[0].targetHandle).toBe('Top-t');
  });

  it('preserves existing handles', () => {
    const edges = [{ id: 'e1', source: 'A', target: 'B', label: 'test', sourceHandle: 'Left-l', targetHandle: 'Right-r' }];
    const result = applyEdgeDefaults(edges);
    expect(result[0].sourceHandle).toBe('Left-l');
    expect(result[0].targetHandle).toBe('Right-r');
  });

  it('roundtrip: parsed edges with defaults render correctly', () => {
    // Parse JSM to get edges (no handles yet)
    const { edges: rawEdges } = parseJSM(sampleJSM);
    // Apply defaults as done in tryParse
    const edgesWithDefaults = applyEdgeDefaults(rawEdges);
    
    // Snapshot captures full edge structure with handles
    expect(edgesWithDefaults).toMatchSnapshot();
  });
});
