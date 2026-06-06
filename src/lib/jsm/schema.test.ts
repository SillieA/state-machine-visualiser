import { describe, it, expect } from 'vitest';
import { JSMSchema, StateSchema } from './schema';

describe('StateSchema', () => {
  it('accepts a minimal state', () => {
    expect(StateSchema.safeParse({ name: 'Pending' }).success).toBe(true);
  });

  it('accepts entryActions and exitChecks', () => {
    const result = StateSchema.safeParse({
      name: 'Pending',
      entryActions: [{ check: 'cond', action: 'do something' }],
      exitChecks: [{ check: 'done', goTo: 'Complete' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts nested children recursively', () => {
    const result = StateSchema.safeParse({
      name: 'Complete',
      children: [
        { name: 'Success' },
        { name: 'Error', children: [{ name: 'Fatal' }] },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a state without a name', () => {
    expect(StateSchema.safeParse({}).success).toBe(false);
  });
});

describe('JSMSchema', () => {
  it('accepts a valid JSM', () => {
    const result = JSMSchema.safeParse({
      start: 'Pending',
      states: [
        {
          name: 'Pending',
          exitChecks: [{ check: 'done', goTo: 'Complete.Success' }],
        },
        {
          name: 'Complete',
          children: [{ name: 'Success' }, { name: 'Error' }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing start', () => {
    expect(JSMSchema.safeParse({ states: [] }).success).toBe(false);
  });

  it('rejects missing states', () => {
    expect(JSMSchema.safeParse({ start: 'A' }).success).toBe(false);
  });
});
