import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { createSeedState } from '@/data/seed';
import { defaultContext, type DomainContext } from '@/domain/context';
import { isDomainError } from '@/domain/errors';
import type { CrmState } from '@/domain/types';
import {
  addAccount,
  addContact,
  addOpportunity,
  convertOpportunityToOrder,
  moveOpportunity,
  type CommandOutcome,
  type Result,
} from './commands';
import { CrmContext, type CrmActions } from './crmContext';

interface CrmProviderProps {
  children: ReactNode;
  initialState?: CrmState;
  domainContext?: DomainContext;
}

/**
 * In-memory store. State lives only in the browser tab — a reload restores the seed data.
 * Components call `actions.*` and branch on the returned `Result`; they never mutate state.
 */
export function CrmProvider({ children, initialState, domainContext = defaultContext }: CrmProviderProps) {
  const [state, setState] = useState<CrmState>(() => initialState ?? createSeedState());
  const stateRef = useRef(state);

  const run = useCallback(<T,>(command: (current: CrmState) => CommandOutcome<T>): Result<T> => {
    try {
      const outcome = command(stateRef.current);
      stateRef.current = outcome.state;
      setState(outcome.state);
      return { ok: true, value: outcome.value };
    } catch (error) {
      if (isDomainError(error)) return { ok: false, error };
      throw error;
    }
  }, []);

  const actions = useMemo<CrmActions>(
    () => ({
      createAccount: (input) => run((s) => addAccount(s, input, domainContext)),
      createContact: (input) => run((s) => addContact(s, input, domainContext)),
      createOpportunity: (input) => run((s) => addOpportunity(s, input, domainContext)),
      moveOpportunity: (id, to) => run((s) => moveOpportunity(s, id, to, domainContext)),
      createOrderFromOpportunity: (id) => run((s) => convertOpportunityToOrder(s, id, domainContext)),
    }),
    [run, domainContext],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}
