/**
 * Id and clock helpers. Domain functions receive these through `DomainContext`
 * so tests can make ids and timestamps deterministic.
 */
export interface DomainContext {
  newId: (prefix: string) => string;
  now: () => string;
}

let counter = 0;

export const defaultContext: DomainContext = {
  newId: (prefix) => {
    counter += 1;
    return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
  },
  now: () => new Date().toISOString(),
};

export function createTestContext(startIso = '2026-10-01T09:00:00.000Z'): DomainContext {
  let n = 0;
  return {
    newId: (prefix) => {
      n += 1;
      return `${prefix}-test-${n}`;
    },
    now: () => startIso,
  };
}
