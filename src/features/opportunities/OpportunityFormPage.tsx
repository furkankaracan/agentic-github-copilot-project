import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { contactFullName, contactsForAccount } from '@/domain/contacts';
import type { DomainError } from '@/domain/errors';
import { useCrm } from '@/store/useCrm';

interface FormState {
  accountId: string;
  primaryContactId: string;
  name: string;
  amount: string;
  expectedCloseDate: string;
}

export function OpportunityFormPage() {
  const { state, actions } = useCrm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const accounts = [...state.accounts].sort((a, b) => a.name.localeCompare(b.name));

  const [form, setForm] = useState<FormState>({
    accountId: params.get('accountId') ?? accounts[0]?.id ?? '',
    primaryContactId: '',
    name: '',
    amount: '',
    expectedCloseDate: '',
  });
  const [error, setError] = useState<DomainError | null>(null);

  const contacts = contactsForAccount(state.contacts, form.accountId);
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const invalid = (field: string) => error?.details?.field === field;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = actions.createOpportunity({
      accountId: form.accountId,
      primaryContactId: form.primaryContactId || undefined,
      name: form.name,
      amount: Number(form.amount),
      expectedCloseDate: form.expectedCloseDate,
    });
    if (result.ok) {
      navigate(`/opportunities/${result.value.id}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <PageHeader back={<Link to="/opportunities">← Opportunities</Link>} title="New opportunity" />
      <form className="form" onSubmit={onSubmit} noValidate>
        <ErrorBanner error={error} />
        <Field id="opp-name" label="Name" invalid={invalid('name')}>
          <input id="opp-name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>
        <div className="form-row">
          <Field id="opp-account" label="Account">
            <select
              id="opp-account"
              className="input"
              value={form.accountId}
              onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value, primaryContactId: '' }))}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="opp-contact" label="Primary contact" hint="Optional" invalid={invalid('primaryContactId')}>
            <select
              id="opp-contact"
              className="input"
              value={form.primaryContactId}
              onChange={(e) => update('primaryContactId', e.target.value)}
            >
              <option value="">No primary contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {contactFullName(c)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field id="opp-amount" label="Amount (EUR)" invalid={invalid('amount')}>
            <input
              id="opp-amount"
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
            />
          </Field>
          <Field id="opp-close" label="Expected close date" invalid={invalid('expectedCloseDate')}>
            <input
              id="opp-close"
              className="input"
              type="date"
              value={form.expectedCloseDate}
              onChange={(e) => update('expectedCloseDate', e.target.value)}
            />
          </Field>
        </div>
        <p className="form-note">New opportunities start in Prospecting.</p>
        <div className="form-actions">
          <button type="submit" className="button button-primary">
            Create opportunity
          </button>
          <Link className="button button-quiet" to="/opportunities">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
