"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@kifolio/ui";
import { SealPreview } from "@/components/SealPreview";
import {
  SEAL_TEMPLATES,
  type SealTemplateId,
} from "@/config/sealTemplates";
import { orgsApi } from "@/lib/paths";

export function SealBuilderForm({
  orgName,
  logoUrl,
  initialTemplateId,
}: {
  orgName: string;
  logoUrl: string | null;
  initialTemplateId: SealTemplateId | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<SealTemplateId | null>(
    initialTemplateId
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isDirty = selected !== initialTemplateId;

  const saveSeal = async () => {
    if (!selected) {
      setMessage({
        type: "error",
        text: "Choose a verified badge template first.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(orgsApi("/api/seal"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ sealTemplateId: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to save verified badge.",
        });
        return;
      }
      setMessage({ type: "success", text: "Verified badge saved." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {!logoUrl && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Upload your logo first in{" "}
          <Link
            href="/dashboard/settings/profile"
            className="font-medium underline"
          >
            Profile settings
          </Link>{" "}
          so it appears in your verified badge preview.
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-discovery-black">
          Choose your verified badge
        </h2>
        <p className="mt-1 text-sm text-discovery-grey">
          Your official verified badge will display on all member endorsements,
          promotions and achievements that you and your instructors give out.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {SEAL_TEMPLATES.map((template) => {
            const active = selected === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelected(template.id)}
                className={`flex flex-col rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? "border-discovery-primary bg-discovery-primary/5 ring-2 ring-discovery-primary"
                    : "border-discovery-beige-200 hover:border-discovery-beige-300"
                }`}
              >
                <div className="mb-4 flex justify-center">
                  <SealPreview
                    templateId={template.id}
                    logoUrl={logoUrl}
                    orgName={orgName}
                  />
                </div>
                <p className="font-medium text-discovery-black">
                  {template.label}
                </p>
                <p className="mt-1 text-xs text-discovery-grey">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant="discovery"
        disabled={saving || !selected || !isDirty}
        onClick={() => void saveSeal()}
      >
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
