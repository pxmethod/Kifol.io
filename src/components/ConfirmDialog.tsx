'use client';

import { useId, type ReactNode } from 'react';

export type ConfirmDialogConfirmVariant = 'danger' | 'primary';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  /** Called when the user dismisses via Cancel, the X button, or implied close (same as cancel for now). */
  onCancel: () => void;
  /** Dialog heading (optional but recommended for accessibility). */
  title?: ReactNode;
  /** Body content — plain text or rich nodes. */
  message?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  /** `danger` = red (default for delete / discard); `primary` = orange for affirmative confirmations. */
  confirmVariant?: ConfirmDialogConfirmVariant;
  /** Show the header close control (default true). */
  showCloseButton?: boolean;
}

/**
 * Standard confirmation dialog — use for discard prompts, deletes, and any yes/no or confirm/cancel flow.
 * Styling matches the discovery palette and form actions (pill buttons).
 */
export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  showCloseButton = true,
}: ConfirmDialogProps) {
  const titleId = useId();

  if (!isOpen) return null;

  const confirmClasses =
    confirmVariant === 'primary'
      ? 'bg-discovery-orange hover:bg-discovery-orange-light'
      : 'bg-red-600 hover:bg-red-700';

  const hasVisibleTitle =
    title != null && (typeof title !== 'string' || title.trim() !== '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-discovery-beige-100 bg-discovery-white-100 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between gap-4 border-b border-discovery-beige-100 px-6 py-5">
          <h2 id={titleId} className="pr-2 text-lg font-semibold text-discovery-black">
            {hasVisibleTitle ? title : <span className="sr-only">Confirmation</span>}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded-lg p-1.5 text-discovery-grey transition-colors hover:bg-discovery-beige-100 hover:text-discovery-black"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {message != null && (typeof message !== 'string' || message.trim() !== '') && (
          <div className="px-6 py-5 text-sm leading-relaxed text-discovery-grey">{message}</div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-discovery-beige-100 px-6 py-5 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-pill border border-discovery-beige-300 px-6 py-3 text-center font-medium text-discovery-black transition-colors hover:bg-discovery-beige-100 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full rounded-pill px-6 py-3 text-center font-semibold text-white transition-colors sm:w-auto ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
