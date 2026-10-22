import { Link } from 'react-router-dom';
import { EmptyState } from './EmptyState';

export function NotFound({ what = 'Page', backTo = '/', backLabel = 'Back to dashboard' }) {
  return (
    <EmptyState title={`${what} not found`}>
      <p>
        It may have been created in a previous session — demo data resets on reload.{' '}
        <Link to={backTo}>{backLabel}</Link>
      </p>
    </EmptyState>
  );
}
