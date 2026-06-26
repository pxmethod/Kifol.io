"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@kifolio/ui";
import { orgsApi } from "@/lib/paths";

export function BillingCancelSection({
  canCancel,
  periodEndLabel,
}: {
  canCancel: boolean;
  periodEndLabel: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canCancel) return null;

  const cancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(orgsApi("/api/billing/cancel"), {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel subscription.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-6">
      <Button
        type="button"
        variant="secondary"
        className="text-red-600 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        Cancel subscription
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-discovery-black">
              Cancel subscription?
            </h3>
            <p className="mt-2 text-sm text-discovery-grey">
              Your org will remain active until{" "}
              {periodEndLabel ?? "the end of your billing period"}. After that,
              you and your instructors will lose access.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Keep my plan
              </Button>
              <Button
                type="button"
                variant="discovery"
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
                onClick={() => void cancel()}
              >
                Cancel subscription
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
