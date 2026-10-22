/**
 * The single error type thrown by the domain layer.
 *
 * - `code` is stable and machine-readable — tests assert on it.
 * - `message` is user-facing English text — it may change, never assert on it.
 * - `details` carries structured diagnostics (ids, field names), never shown verbatim.
 */
export const DomainErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  NotFound: 'NOT_FOUND',
  InvalidTransition: 'INVALID_TRANSITION',
  Conflict: 'CONFLICT',
} as const;
export type DomainErrorCode = (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: DomainErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
