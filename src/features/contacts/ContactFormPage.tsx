import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Field } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import type { NewContactInput } from '@/domain/contacts';
import type { DomainError } from '@/domain/errors';
import { useCrm } from '@/store/useCrm';

export function ContactFormPage() {
  const { state, actions } = useCrm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const accounts = [...state.accounts].sort((a, b) => a.name.localeCompare(b.name));

  const [form, setForm] = useState<NewContactInput>({
    accountId: params.get('accountId') ?? accounts[0]?.id ?? '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
  });
  const [error, setError] = useState<DomainError | null>(null);

  const update = <K extends keyof NewContactInput>(key: K, value: NewContactInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const invalid = (field: keyof NewContactInput) => error?.details?.field === field;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = actions.createContact(form);
    if (result.ok) {
      navigate(`/accounts/${result.value.accountId}`);
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <PageHeader back={<Link to="/contacts">← Contacts</Link>} title="New contact" />
      <form className="form" onSubmit={onSubmit} noValidate>
        <ErrorBanner error={error} />
        <Field id="contact-account" label="Account">
          <select
            id="contact-account"
            className="input"
            value={form.accountId}
            onChange={(e) => update('accountId', e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-row">
          <Field id="contact-first" label="First name" invalid={invalid('firstName')}>
            <input
              id="contact-first"
              className="input"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
          </Field>
          <Field id="contact-last" label="Last name" invalid={invalid('lastName')}>
            <input
              id="contact-last"
              className="input"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
          </Field>
        </div>
        <Field id="contact-email" label="Email" invalid={invalid('email')}>
          <input
            id="contact-email"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <div className="form-row">
          <Field id="contact-title" label="Job title" hint="Optional">
            <input
              id="contact-title"
              className="input"
              value={form.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
            />
          </Field>
          <Field id="contact-phone" label="Phone" hint="Optional">
            <input
              id="contact-phone"
              className="input"
              type="tel"
              value={form.phone}
              onChange={(e: any) => update('phone', e.target.value)}
            />
          </Field>
        </div>
        <div className="form-actions">
          <button type="submit" className="button button-primary">
            Create contact
          </button>
          <Link className="button button-quiet" to="/contacts">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
