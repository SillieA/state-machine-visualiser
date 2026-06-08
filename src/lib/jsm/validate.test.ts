import { describe, it, expect } from 'vitest';
import { validateJSM } from './validate';

describe('validateJSM normalization', () => {
  it('converts "start" to "entryStateName"', () => {
    const result = validateJSM({
      start: 'Pending',
      states: [{ name: 'Pending' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entryStateName).toBe('Pending');
    }
  });

  it('accepts "entryStateName" directly', () => {
    const result = validateJSM({
      entryStateName: 'Pending',
      states: [{ name: 'Pending' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entryStateName).toBe('Pending');
    }
  });

  it('converts "goto" to "goTo" in exitChecks', () => {
    const result = validateJSM({
      entryStateName: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [{ check: 'done', goto: 'Complete' }],
        },
        { name: 'Complete' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.states[0].exitChecks?.[0]).toMatchObject({
        check: 'done',
        goTo: 'Complete',
      });
    }
  });

  it('accepts "goTo" directly in exitChecks', () => {
    const result = validateJSM({
      entryStateName: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [{ check: 'done', goTo: 'Complete' }],
        },
        { name: 'Complete' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.states[0].exitChecks?.[0]).toMatchObject({
        check: 'done',
        goTo: 'Complete',
      });
    }
  });

  it('handles both "start" and "goto" together', () => {
    const result = validateJSM({
      start: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [{ check: 'done', goto: 'Complete' }],
        },
        { name: 'Complete' },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.entryStateName).toBe('Pending');
      expect(result.data.states[0].exitChecks?.[0]).toMatchObject({
        check: 'done',
        goTo: 'Complete',
      });
    }
  });

  it('normalizes nested states with "goto"', () => {
    const result = validateJSM({
      entryStateName: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [{ check: 'fail', goto: 'Complete.Error' }],
        },
        {
          name: 'Complete',
          children: [
            { name: 'Success' },
            { name: 'Error' },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.states[0].exitChecks?.[0]).toMatchObject({
        check: 'fail',
        goTo: 'Complete.Error',
      });
    }
  });
});
