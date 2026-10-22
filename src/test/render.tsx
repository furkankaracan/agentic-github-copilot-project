import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createSeedState } from '@/data/seed';
import { createTestContext } from '@/domain/context';
import type { CrmState } from '@/domain/types';
import { AppRoutes } from '@/AppRoutes';
import { CrmProvider } from '@/store/CrmStore';

interface Options {
  route?: string;
  state?: CrmState;
}

/** Renders the full app (routes + store) at `route`, using seed data and deterministic ids. */
export function renderApp({ route = '/', state = createSeedState() }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CrmProvider initialState={state} domainContext={createTestContext('2026-10-22T09:00:00.000Z')}>
        <AppRoutes />
      </CrmProvider>
    </MemoryRouter>,
  );
}

/** Renders a single element inside the store and a router, for isolated component tests. */
export function renderWithStore(ui: ReactElement, { route = '/', state = createSeedState() }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CrmProvider initialState={state} domainContext={createTestContext()}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </CrmProvider>
    </MemoryRouter>,
  );
}
