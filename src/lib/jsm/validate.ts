import { JSMSchema, type JSM } from './schema';

export type ValidationResult =
  | { success: true; data: JSM }
  | { success: false; error: string };

interface RawExitCheck {
  goto?: unknown;
  goTo?: unknown;
  [key: string]: unknown;
}

interface RawState {
  exitChecks?: RawExitCheck[];
  children?: RawState[];
  [key: string]: unknown;
}

interface RawJSM {
  start?: unknown;
  entryStateName?: unknown;
  states?: RawState[];
  [key: string]: unknown;
}

// Normalize input to handle both naming conventions
function normalizeJSM(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;

  const obj = input as RawJSM;

  // Handle both 'start' and 'entryStateName'
  if (!('entryStateName' in obj) && 'start' in obj) {
    obj.entryStateName = obj.start;
    delete obj.start;
  }

  // Normalize exitChecks: handle both 'goto' and 'goTo'
  if (obj.states && Array.isArray(obj.states)) {
    const normalizeStates = (states: RawState[]): RawState[] => {
      return states.map(state => {
        if (state.exitChecks && Array.isArray(state.exitChecks)) {
          state.exitChecks = state.exitChecks.map((check: RawExitCheck) => {
            // Handle both 'goto' and 'goTo'
            if (!('goTo' in check) && 'goto' in check) {
              check.goTo = check.goto;
              delete check.goto;
            }
            return check;
          });
        }
        // Recursively normalize children
        if (state.children && Array.isArray(state.children)) {
          state.children = normalizeStates(state.children);
        }
        return state;
      });
    };
    obj.states = normalizeStates(obj.states);
  }

  return obj;
}

export function validateJSM(input: unknown): ValidationResult {
  const normalized = normalizeJSM(input);
  const result = JSMSchema.safeParse(normalized);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.message };
}
