import { JSMSchema, type JSM } from './schema';

export type ValidationResult =
  | { success: true; data: JSM }
  | { success: false; error: string };

export function validateJSM(input: unknown): ValidationResult {
  const result = JSMSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.message };
}
