"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@kifolio/ui";
import { orgsApi } from "@/lib/paths";

export function AcceptInstructorInvite({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(orgsApi("/api/instructors/accept"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to accept invite.");
        return;
      }
      router.push("/dashboard/overview");
      router.refresh();
    } catch {
      setError("Failed to accept invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="discovery"
        className="w-full"
        disabled={loading}
        onClick={() => void accept()}
      >
        {loading ? "Joining..." : "Accept invite"}
      </Button>
    </div>
  );
}
