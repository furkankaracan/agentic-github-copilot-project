import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';

describe('Opportunity detail', () => {
  it('offers only the transitions the state machine allows', () => {
    renderApp({ route: '/opportunities/opp-002' }); // Prospecting

    expect(screen.getByRole('button', { name: 'Move to Qualification' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as lost' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as won' })).not.toBeInTheDocument();
  });

  it('advances the stage when the user moves it forward', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/opportunities/opp-002' });

    await user.click(screen.getByRole('button', { name: 'Move to Qualification' }));

    expect(screen.getByRole('button', { name: 'Move to Proposal' })).toBeInTheDocument();
  });

  it('creates an order from a won opportunity and opens it', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/opportunities/opp-008' }); // ClosedWon without an order

    await user.click(screen.getByRole('button', { name: 'Create order' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'SO-2026-0003' })).toBeInTheDocument();
  });

  it('offers no actions on a lost opportunity', () => {
    renderApp({ route: '/opportunities/opp-007' });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
