import { DomainError, DomainErrorCode } from './errors';

/** Shared validation helpers. Every failure throws `DomainError` with `VALIDATION_FAILED`. */

export function requireText(value: string | undefined, field: string, label: string): string {
  const trimmed = (value ?? '').trim();
  if (trimmed.length === 0) {
    throw new DomainError(DomainErrorCode.ValidationFailed, `${label} is required.`, { field });
  }
  return trimmed;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireEmail(value: string | undefined, field = 'email'): string {
  const email = requireText(value, field, 'Email').toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new DomainError(DomainErrorCode.ValidationFailed, 'Email address is not valid.', { field });
  }
  return email;
}

export function requirePositiveAmount(value: number, field: string, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(DomainErrorCode.ValidationFailed, `${label} must be greater than zero.`, {
      field,
      value,
    });
  }
  return Math.round(value * 100) / 100;
}

export function requireIsoDate(value: string | undefined, field: string, label: string): string {
  const text = requireText(value, field, label);
  if (Number.isNaN(Date.parse(text))) {
    throw new DomainError(DomainErrorCode.ValidationFailed, `${label} is not a valid date.`, { field });
  }
  return text;
}
