---
name: react-ui-authoring
description: "Conventions for building Contoso CRM pages and components with React 19, React Router 7 and the hand-written design system in src/styles.css — list/detail/form page anatomy, useCrm actions and Result handling, ErrorBanner, Field, StatusBadge, accessible markup, and UI tests with renderApp. Use when creating or editing anything under src/features/, src/components/, src/AppRoutes.tsx or src/styles.css."
---

# React UI authoring — Contoso CRM

The UI is deliberately plain: function components, local `useState`, one global store via `useCrm()`, one stylesheet. Match the neighbouring page exactly — consistency beats cleverness.

## Orientation (must know)

- Pages live in `src/features/<entities>/` and are named `<Entity>ListPage`, `<Entity>DetailPage`, `<Entity>FormPage`.
- Shared building blocks in `src/components/`: `PageHeader`, `StatusBadge` (`StageBadge`, `OrderStatusBadge`), `ErrorBanner`, `EmptyState`, `Field`, `NotFound`, `Layout`.
- Formatting: `formatMoney`, `formatDate`, `formatPercent` from `src/lib/format.ts`.
- Styling: semantic class names in `src/styles.css` using the CSS custom properties at the top. **No inline styles** except data-driven values (e.g. a bar's `inlineSize`). No CSS-in-JS, no Tailwind, no UI kits, no icon libraries.

## Before writing code

1. Open the closest sibling page and copy its structure (read [references/page-patterns.md](references/page-patterns.md) for the annotated anatomy).
2. Ask the domain, don't decide in the page: `allowedTransitions(stage)`, `isClosedStage(stage)`, `searchAccounts(list, q)`. If the rule you need doesn't exist yet, it belongs to the Domain package — stop and report the dependency.
3. Check `src/components/` before creating a component. Create one only when two pages need it.

## Non-negotiables

- Read state with `const { state, actions } = useCrm()`. Never import seed data in a page.
- Mutate only through `actions.*`; branch on `result.ok`; show `result.error` with `<ErrorBanner>`; never `try/catch`.
- Every input has a `<label>` (use `<Field id label>`); every button names its action; destructive actions use `button-danger`.
- Lists: sortable data in a `<table className="table">` with `<th scope="col">`; numbers right-aligned with `className="num"`.
- Every list has an empty state (`<EmptyState>`); every detail page handles an unknown id with `<NotFound>`.
- New route → `src/AppRoutes.tsx`. New top-level list → also `NAV_ITEMS` in `Layout.tsx`.
- Badge colours come from CSS classes keyed by the enum value (`.badge-stage-<Stage>`, `.badge-order-<Status>`). Add the class when you add a value.

## Self-review (no visual test runner here)

Before reporting done:

1. `npm run verify` passes.
2. Start `npm run dev`, open the page at `http://localhost:5173`, and walk the happy path and one error path with seed data.
3. Check keyboard: tab order reaches every control, focus ring visible.
4. Report the manual steps you ran.
