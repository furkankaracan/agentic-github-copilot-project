import type { DomainError } from '@/domain/errors';

/** Renders a DomainError's user-facing message. Never render `error.details` to users. */
export function ErrorBanner({ error }: { error: DomainError | null }) {
  if (!error) return null;
  return (
    <div className="error-banner" role="alert">
      <strong>Couldn’t save.</strong> {error.message}
    </div>
  );
}
