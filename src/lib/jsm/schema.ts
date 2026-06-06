import { z } from 'zod';

export const EntryActionSchema = z.object({
  check: z.string(),
  action: z.string(),
});

export const ExitCheckSchema = z.object({
  check: z.string(),
  goTo: z.string(),
});

type StateInput = {
  name: string;
  entryActions?: Array<{ check: string; action: string }>;
  exitChecks?: Array<{ check: string; goTo: string }>;
  children?: StateInput[];
};

export const StateSchema: z.ZodType<StateInput> = z.object({
  name: z.string(),
  entryActions: z.array(EntryActionSchema).optional(),
  exitChecks: z.array(ExitCheckSchema).optional(),
  children: z.lazy(() => z.array(StateSchema)).optional(),
});

export const JSMSchema = z.object({
  start: z.string(),
  states: z.array(StateSchema),
});

export type EntryAction = z.infer<typeof EntryActionSchema>;
export type ExitCheck = z.infer<typeof ExitCheckSchema>;
export type State = z.infer<typeof StateSchema>;
export type JSM = z.infer<typeof JSMSchema>;
