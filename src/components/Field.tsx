import type { ReactNode } from 'react';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  invalid?: boolean;
  children: ReactNode;
}

/** Label + control + optional hint. Pass the same `id` to the control inside. */
export function Field({ id, label, hint, invalid, children }: FieldProps) {
  return (
    <div className={invalid ? 'field field-invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
