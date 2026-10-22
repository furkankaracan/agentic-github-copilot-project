import { useContext } from 'react';
import { CrmContext, type CrmContextValue } from './crmContext';

export function useCrm(): CrmContextValue {
  const value = useContext(CrmContext);
  if (!value) {
    // Programming error (missing provider), not a domain rule — DomainError does not apply here.
    throw new TypeError('useCrm must be used inside <CrmProvider>.');
  }
  return value;
}
