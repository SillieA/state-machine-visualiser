import { describe, it, expect } from 'vitest';
import { parseJSM } from './parse';
import type { JSM } from './schema';

describe('parseJSM - backward compatibility', () => {
  it('parses JSM without edge handles and creates valid node structure', () => {
    const oldJSM: JSM = {
      entryStateName: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [
            { check: 'success', goTo: 'Complete.Success' },
            { check: 'error', goTo: 'Complete.Error' },
          ],
        },
        {
          name: 'Complete',
          children: [
            { name: 'Success' },
            { name: 'Error' },
          ],
        },
      ],
    };

    const { nodes, edges } = parseJSM(oldJSM);

    // Verify all nodes are created
    expect(nodes).toHaveLength(4);
    expect(nodes.map(n => n.id)).toEqual(['Pending', 'Complete', 'Complete.Success', 'Complete.Error']);

    // Verify all nodes have valid data
    nodes.forEach(node => {
      expect(node.type).toBe('stateNode');
      expect(node.data.label).toBeTruthy();
      expect(node.data.entryActions).toBeDefined();
    });

    // Verify edges are created without explicit handles
    expect(edges).toHaveLength(2);
    edges.forEach(edge => {
      expect(edge.source).toBeTruthy();
      expect(edge.target).toBeTruthy();
      // Edges should NOT have sourceHandle/targetHandle set from parseJSM
      // They get defaults applied during loading in store.ts
      expect(edge.label).toBeTruthy();
    });
  });

  it('parses JSM with mixed nodes (some with actions, some without)', () => {
    const mixedJSM: JSM = {
      entryStateName: 'Start',
      states: [
        {
          name: 'Start',
          entryActions: [
            { check: 'isReady', action: 'initialize' },
            { check: 'hasData', action: 'loadData' },
          ],
          exitChecks: [
            { check: 'ready', goTo: 'Processing' },
          ],
        },
        {
          name: 'Processing',
          exitChecks: [
            { check: 'done', goTo: 'End.Success' },
            { check: 'failed', goTo: 'End.Error' },
          ],
        },
        {
          name: 'End',
          children: [
            { name: 'Success' },
            { name: 'Error' },
          ],
        },
      ],
    };

    const { nodes, edges } = parseJSM(mixedJSM);

    // Verify structure
    expect(nodes).toHaveLength(5);
    expect(edges).toHaveLength(3);

    // Verify Start node has entry actions
    const startNode = nodes.find(n => n.id === 'Start');
    expect(startNode?.data.entryActions).toHaveLength(2);

    // Verify Processing node has no entry actions
    const processingNode = nodes.find(n => n.id === 'Processing');
    expect(processingNode?.data.entryActions).toHaveLength(0);

    // Verify edges point to existing nodes
    edges.forEach(edge => {
      const sourceExists = nodes.some(n => n.id === edge.source);
      const targetExists = nodes.some(n => n.id === edge.target);
      expect(sourceExists).toBe(true);
      expect(targetExists).toBe(true);
    });
  });

  it('handles deeply nested child states without edge handles', () => {
    const nestedJSM: JSM = {
      entryStateName: 'Root',
      states: [
        {
          name: 'Root',
          exitChecks: [{ check: 'proceed', goTo: 'Branch.Sub1' }],
        },
        {
          name: 'Branch',
          children: [
            {
              name: 'Sub1',
              exitChecks: [{ check: 'next', goTo: 'Branch.Sub2' }],
            },
            {
              name: 'Sub2',
              exitChecks: [{ check: 'finish', goTo: 'End' }],
            },
          ],
        },
        {
          name: 'End',
        },
      ],
    };

    const { nodes, edges } = parseJSM(nestedJSM);

    // Verify all nested nodes created
    expect(nodes.map(n => n.id).sort()).toEqual(['Branch', 'Branch.Sub1', 'Branch.Sub2', 'End', 'Root']);

    // Verify all edges reference existing nodes
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      expect(sourceNode).toBeDefined();
      expect(targetNode).toBeDefined();
    });
  });
});
