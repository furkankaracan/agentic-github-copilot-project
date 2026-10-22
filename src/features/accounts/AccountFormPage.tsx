import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import type { NewAccountInput } from '@/domain/accounts';
import type { DomainError } from '@/domain/errors';
import { AccountTier, Industry } from '@/domain/types';
import { useCrm } from '@/store/useCrm';

const EMPTY: NewAccountInput = {
  name: '',
  industry: Industry.Technology,
  tier: AccountTier.SMB,
  city: '',
  country: '',
  website: '',
};

export function AccountFormPage() {
  const { actions } = useCrm();
  const navigate = useNavigate();
  const [form, setForm] = useState<NewAccountInput>(EMPTY);
  const [error, setError] = useState<DomainError | null>(null);

  const update = <K extends keyof NewAccountInput>(key: K, value: NewAccountInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const invalid = (field: keyof NewAccountInput) => error?.details?.field === field;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = actions.createAccount(form);
    if (result.ok) {
      navigate(`/accounts/${result.value.id}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <PageHeader back={<Link to="/accounts">← Accounts</Link>} title="New account" />
      <form className="form" onSubmit={onSubmit} noValidate>
        <ErrorBanner error={error} />
        <Field id="account-name" label="Name" invalid={invalid('name')}>
          <input id="account-name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>
        <div className="form-row">
          <Field id="account-industry" label="Industry">
            <select
              id="account-industry"
              className="input"
              value={form.industry}
              onChange={(e) => update('industry', e.target.value as Industry)}
            >
              {Object.values(Industry).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
          <Field id="account-tier" label="Tier">
            <select
              id="account-tier"
              className="input"
              value={form.tier}
              onChange={(e) => update('tier', e.target.value as AccountTier)}
            >
              {Object.values(AccountTier).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field id="account-city" label="City" invalid={invalid('city')}>
            <input id="account-city" className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </Field>
          <Field id="account-country" label="Country" invalid={invalid('country')}>
            <input
              id="account-country"
              className="input"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
            />
          </Field>
        </div>
        <Field id="account-website" label="Website" hint="Optional">
          <input
            id="account-website"
            className="input"
            type="url"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </Field>
        <div className="form-actions">
          <button type="submit" className="button button-primary">
            Create account
          </button>
          <Link className="button button-quiet" to="/accounts">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
