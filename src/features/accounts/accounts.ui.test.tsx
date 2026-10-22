import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '@/test/render';

describe('Accounts', () => {
  it('filters the list by name or city', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/accounts' });

    await user.type(screen.getByLabelText('Search accounts'), 'stuttgart');

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(2); // header + Fabrikam
    expect(screen.getByRole('link', { name: 'Fabrikam Industries' })).toBeInTheDocument();
  });

  it('creates an account and opens its detail page', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/accounts/new' });

    await user.type(screen.getByLabelText('Name'), 'Proseware Inc.');
    await user.type(screen.getByLabelText('City'), 'Bursa');
    await user.type(screen.getByLabelText('Country'), 'Türkiye');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Proseware Inc.' })).toBeInTheDocument();
  });

  it('shows the domain error when the name is already taken', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/accounts/new' });

    await user.type(screen.getByLabelText('Name'), 'northwind traders');
    await user.type(screen.getByLabelText('City'), 'Istanbul');
    await user.type(screen.getByLabelText('Country'), 'Türkiye');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'New account' })).toBeInTheDocument();
  });
});
