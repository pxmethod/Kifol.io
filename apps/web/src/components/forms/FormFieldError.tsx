'use client';

/**
 * Standard field validation copy: directly under the field label, left-aligned, before the control.
 * Use `placement="form-submit"` for errors shown after the primary submit action (often centered).
 */
export function FormFieldError({
  id,
  message,
  placement = 'below-label',
  className = '',
}: {
  id?: string;
  message?: string | null;
  placement?: 'below-label' | 'form-submit';
  className?: string;
}) {
  if (!message) return null;
  if (placement === 'form-submit') {
    return (
      <p
        id={id}
        role="alert"
        className={`text-sm leading-snug text-red-600 mt-3 text-center w-full ${className}`.trim()}
      >
        {message}
      </p>
    );
  }
  return (
    <p
      id={id}
      role="alert"
      className={`text-sm leading-snug text-red-600 text-left mb-2 -mt-1 ${className}`.trim()}
    >
      {message}
    </p>
  );
}

/** Multiple messages under one section heading (e.g. Dates *). */
export function FormFieldErrorList({
  id,
  messages,
  className = '',
}: {
  id?: string;
  messages: Array<string | null | undefined>;
  className?: string;
}) {
  const items = messages.filter((m): m is string => typeof m === 'string' && m.length > 0);
  if (items.length === 0) return null;
  return (
    <div id={id} role="alert" className={`mb-3 space-y-1 text-left ${className}`.trim()}>
      {items.map((msg, i) => (
        <p key={i} className="text-sm leading-snug text-red-600">
          {msg}
        </p>
      ))}
    </div>
  );
}
