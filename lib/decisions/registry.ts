import { z } from 'zod';
import { OPERATIONS_DECISIONS } from './operations.ts';
import { PRODUCT_DECISIONS } from './products.ts';
import { DecisionSchema, type Decision } from './schema.ts';
import { SERVICE_DECISIONS } from './services.ts';

// Validated at load: a malformed decision (bad recommendation, wrong unit, duplicate id)
// fails the build and the tests instead of reaching the site.
export const DECISIONS: Decision[] = z
  .array(DecisionSchema)
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length, 'Duplicate decision ids')
  .parse([...PRODUCT_DECISIONS, ...SERVICE_DECISIONS, ...OPERATIONS_DECISIONS]);

export const DECISION_GROUPS = [
  { id: 'farmz3d-pricing', title: 'Farmz3D — preços dos produtos' },
  { id: 'operations', title: 'Operação — frete, prazos e canais' },
  { id: 'dockplus-pricing', title: 'DockPlus — preços dos serviços' },
] as const;

const BY_ID = new Map(DECISIONS.map((decision) => [decision.id, decision]));

export function getDecision(id: string) {
  return BY_ID.get(id) ?? null;
}
