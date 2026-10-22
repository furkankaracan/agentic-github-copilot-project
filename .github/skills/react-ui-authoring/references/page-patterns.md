# Page patterns

## List page — mirror `src/features/accounts/AccountListPage.tsx`

```tsx
export function OrderListPage() {
  const { state } = useCrm();
  const [query, setQuery] = useState('');                    // local UI state only
  const orders = searchOrders(state.orders, query);           // rule lives in the domain

  return (
    <>
      <PageHeader title="Orders" description="…" actions={<Link className="button button-primary" to="/orders/new">New order</Link>} />
      <div className="toolbar">
        <label className="visually-hidden" htmlFor="order-search">Search orders</label>
        <input id="order-search" type="search" className="input search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {orders.length === 0 ? <EmptyState title="No orders match your search" /> : <table className="table">…</table>}
    </>
  );
}
```

## Detail page — mirror `src/features/opportunities/OpportunityDetailPage.tsx`

- `const { id = '' } = useParams()`; look the entity up in `state`; `return <NotFound … />` if missing (all hooks above the early return).
- `PageHeader` with `back={<Link to="/…">← …</Link>}`, the entity name as `title`, a badge as `description`, and lifecycle buttons as `actions` — buttons generated from `allowedTransitions(...)`.
- `<ErrorBanner error={error} />` directly under the header.
- Facts in `<dl className="facts">`, related records in `<section className="section">` with an `<h2>`.

## Form page — mirror `src/features/accounts/AccountFormPage.tsx`

```tsx
const [form, setForm] = useState<NewThingInput>(EMPTY);
const [error, setError] = useState<DomainError | null>(null);
const invalid = (field: keyof NewThingInput) => error?.details?.field === field;

const onSubmit = (event: FormEvent) => {
  event.preventDefault();
  const result = actions.createThing(form);
  if (result.ok) navigate(`/things/${result.value.id}`);
  else setError(result.error);
};

<form className="form" onSubmit={onSubmit} noValidate>
  <ErrorBanner error={error} />
  <Field id="thing-name" label="Name" invalid={invalid('name')}>
    <input id="thing-name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
  </Field>
  <div className="form-actions">
    <button type="submit" className="button button-primary">Create thing</button>
    <Link className="button button-quiet" to="/things">Cancel</Link>
  </div>
</form>
```

- `noValidate`: validation is the domain's job, so the user sees the same message the tests assert.
- Pre-select parent records from the query string (`?accountId=acc-002`) like `ContactFormPage`.
- Edit forms reuse the create form's markup with initial values from the entity; the submit label is "Save changes".

## Confirmation for destructive actions

Use the native `window.confirm('Delete Northwind Traders? This cannot be undone.')` — no modal library. Name the record in the question.

## CSS

Add new classes at the end of the matching section in `src/styles.css`; reuse tokens (`var(--space-4)`, `var(--line)`, `var(--lost)`). Keep the 960px and 600px breakpoints working.
