"use client";

export function FormFieldError({
  message,
  placement = "below-label",
}: {
  message?: string | null;
  placement?: "below-label" | "form-submit";
}) {
  if (!message) return null;
  if (placement === "form-submit") {
    return (
      <p
        role="alert"
        className="mt-3 w-full text-center text-sm leading-snug text-red-600"
      >
        {message}
      </p>
    );
  }
  return (
    <p
      role="alert"
      className="-mt-1 mb-2 text-left text-sm leading-snug text-red-600"
    >
      {message}
    </p>
  );
}
