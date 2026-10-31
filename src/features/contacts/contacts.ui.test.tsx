import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createSeedState } from '@/data/seed';
import { renderApp } from '@/test/render';

function contactNames() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1).map(
    (row) => within(row).getAllByRole('cell')[0]?.textContent,
  );
}

describe('Contacts', () => {
  it('starts with an empty search and all accounts selected', () => {
    renderApp({ route: '/contacts' });

    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveValue('');
    expect(screen.getByText('11 of 11')).toBeInTheDocument();
    expect(contactNames()).toHaveLength(11);
    expect(screen.getByRole('link', { name: 'New contact' })).toHaveAttribute('href', '/contacts/new');
  });

  it('shows phone numbers or a dash in the Phone column after Email', () => {
    renderApp({ route: '/contacts' });
    const table = within(screen.getByRole('table'));

    expect(table.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Name', 'Account', 'Job title', 'Email', 'Phone',
    ]);

    const populatedRow = within(table.getByRole('row', { name: /elif.yilmaz@northwind.example/ }));
    const missingRow = within(table.getByRole('row', { name: /can.demir@northwind.example/ }));

    expect(populatedRow.getAllByRole('cell')[4]).toHaveTextContent('+90 212 555 0101');
    expect(missingRow.getAllByRole('cell')[4]).toHaveTextContent('—');
    expect(populatedRow.queryByRole('link', { name: '+90 212 555 0101' })).not.toBeInTheDocument();
  });

  it.each([
    ['  lEnA  ', ['Lena Schmidt']],
    ['WEBER', ['Jonas Weber']],
    ['FABRIKAM', ['Lena Schmidt', 'Jonas Weber']],
  ])('searches contact names and email with %j', async (query, names) => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });

    await user.type(screen.getByRole('searchbox', { name: 'Search contacts' }), query);

    expect(contactNames()).toEqual(names);
    expect(screen.getByText(`${names.length} of 11`)).toBeInTheDocument();
  });

  it('lists every account alphabetically, including an account without contacts', async () => {
    const user = userEvent.setup();
    const state = createSeedState();
    state.contacts = state.contacts.filter((contact) => contact.accountId !== 'acc-005');
    renderApp({ route: '/contacts', state });
    const account = screen.getByRole('combobox', { name: 'Account' });
    const expectedOptions = [
      'All accounts',
      'Adventure Works',
      'Contoso Cloud',
      'Fabrikam Industries',
      'Litware Labs',
      'Northwind Traders',
      'Tailspin Health',
      'Woodgrove Bank',
    ];

    expect(within(account).getAllByRole('option').map((option) => option.textContent)).toEqual(expectedOptions);

    await user.type(screen.getByRole('searchbox', { name: 'Search contacts' }), 'fabrikam');

    expect(within(account).getAllByRole('option').map((option) => option.textContent)).toEqual(expectedOptions);

    await user.clear(screen.getByRole('searchbox', { name: 'Search contacts' }));
    await user.selectOptions(account, 'acc-005');

    expect(screen.getByText('0 of 10')).toBeInTheDocument();
    expect(screen.getByText('No contacts match your filters')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('filters by account and preserves last-name ordering and contact links', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Account' }), 'acc-004');

    expect(contactNames()).toEqual(['Oliver Bennett', 'Amelia Clarke']);
    expect(screen.getByText('2 of 11')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    for (const row of rows) {
      expect(within(row).getByRole('link', { name: 'Woodgrove Bank' })).toHaveAttribute(
        'href', '/accounts/acc-004',
      );
    }
    expect(screen.getByRole('link', { name: 'oliver.bennett@woodgrove.example' })).toHaveAttribute(
      'href', 'mailto:oliver.bennett@woodgrove.example',
    );
    expect(screen.getByRole('link', { name: 'amelia.clarke@woodgrove.example' })).toHaveAttribute(
      'href', 'mailto:amelia.clarke@woodgrove.example',
    );
  });

  it('combines account-first filtering with search and clears each control independently', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });
    const search = screen.getByRole('searchbox', { name: 'Search contacts' });
    const account = screen.getByRole('combobox', { name: 'Account' });

    await user.selectOptions(account, 'acc-004');
    await user.type(search, 'OLIVER');

    expect(contactNames()).toEqual(['Oliver Bennett']);
    expect(screen.getByText('1 of 11')).toBeInTheDocument();

    await user.clear(search);

    expect(account).toHaveValue('acc-004');
    expect(contactNames()).toEqual(['Oliver Bennett', 'Amelia Clarke']);
    expect(screen.getByText('2 of 11')).toBeInTheDocument();

    await user.type(search, 'OLIVER');
    await user.selectOptions(account, '');

    expect(search).toHaveValue('OLIVER');
    expect(contactNames()).toEqual(['Oliver Bennett']);

    await user.clear(search);

    expect(contactNames()).toHaveLength(11);
    expect(screen.getByText('11 of 11')).toBeInTheDocument();
  });

  it('combines search-first filtering with account and recovers from an empty intersection', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });
    const search = screen.getByRole('searchbox', { name: 'Search contacts' });
    const account = screen.getByRole('combobox', { name: 'Account' });

    await user.type(search, 'fabrikam');
    await user.selectOptions(account, 'acc-002');

    expect(contactNames()).toEqual(['Lena Schmidt', 'Jonas Weber']);
    expect(screen.getByText('2 of 11')).toBeInTheDocument();

    await user.selectOptions(account, 'acc-004');

    expect(screen.getByText('No contacts match your filters')).toBeInTheDocument();
    expect(screen.getByText('Try a different search or account.')).toBeInTheDocument();
    expect(screen.getByText('0 of 11')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.selectOptions(account, '');

    expect(search).toHaveValue('fabrikam');
    expect(contactNames()).toEqual(['Lena Schmidt', 'Jonas Weber']);
    expect(screen.getByText('2 of 11')).toBeInTheDocument();
  });

  it.each(['no-such-contact', 'Fabrikam Industries'])('shows no matches for query %j', async (query) => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });
    const search = screen.getByRole('searchbox', { name: 'Search contacts' });

    await user.type(search, query);

    expect(screen.getByText('No contacts match your filters')).toBeInTheDocument();
    expect(screen.getByText('0 of 11')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.clear(search);

    expect(contactNames()).toHaveLength(11);
    expect(screen.getByText('11 of 11')).toBeInTheDocument();
  });

  it('keeps the original empty-list state and usable controls when there are no contacts', () => {
    renderApp({ route: '/contacts', state: { ...createSeedState(), contacts: [] } });

    expect(screen.getByText('No contacts yet')).toBeInTheDocument();
    expect(screen.getByText('0 of 0')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search contacts' })).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveValue('');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation from search to the account filter', async () => {
    const user = userEvent.setup();
    renderApp({ route: '/contacts' });
    const search = screen.getByRole('searchbox', { name: 'Search contacts' });
    const account = screen.getByRole('combobox', { name: 'Account' });

    await user.click(search);
    await user.keyboard('fabrikam');
    await user.tab();

    expect(account).toHaveFocus();
    expect(contactNames()).toEqual(['Lena Schmidt', 'Jonas Weber']);

    await user.tab({ shift: true });

    expect(search).toHaveFocus();
  });
});
