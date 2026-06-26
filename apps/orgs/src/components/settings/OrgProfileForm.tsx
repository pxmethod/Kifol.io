"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kifolio/ui";
import { OrgAvatar } from "@/components/shell/OrgAvatar";
import { orgsApi } from "@/lib/paths";

type OrgProfile = {
  name: string;
  slug: string;
  logoUrl: string | null;
  location: string;
  about: string;
};

export function OrgProfileForm({ initial }: { initial: OrgProfile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const updateField = <K extends keyof OrgProfile>(
    key: K,
    value: OrgProfile[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty =
    form.name !== initial.name ||
    form.location !== initial.location ||
    form.about !== initial.about;

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const previous = form;

    try {
      const res = await fetch(orgsApi("/api/profile"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name,
          slug: initial.slug,
          location: form.location,
          about: form.about,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setForm(previous);
        setMessage({ type: "error", text: data.error || "Failed to save." });
        return;
      }
      setMessage({ type: "success", text: "Profile saved." });
      router.refresh();
    } catch {
      setForm(previous);
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (file: File) => {
    setUploading(true);
    setMessage(null);
    const previousLogo = form.logoUrl;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(orgsApi("/api/profile/logo"), {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Upload failed." });
        return;
      }
      updateField("logoUrl", data.logoUrl);
      setMessage({ type: "success", text: "Logo uploaded." });
      router.refresh();
    } catch {
      updateField("logoUrl", previousLogo);
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
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

      <div className="flex items-center gap-4">
        <OrgAvatar
          name={form.name}
          logoUrl={form.logoUrl}
          className="h-16 w-16"
        />
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleLogoChange(file);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading
              ? "Uploading..."
              : form.logoUrl
                ? "Replace logo"
                : "Upload logo"}
          </Button>
          <p className="mt-1 text-xs text-discovery-grey">
            JPEG, PNG, WebP, GIF, or SVG · max 5 MB
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-discovery-grey">
            Organization name
          </label>
          <Input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-discovery-grey/60">
            Slug
          </label>
          <Input value={initial.slug} disabled />
          <p className="mt-1 text-xs text-discovery-grey/60">
            Used in shared URLs. Set at signup and cannot be changed.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-discovery-grey">
            Location
          </label>
          <Input
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="City, state or full address"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-discovery-grey">About</label>
          <textarea
            value={form.about}
            onChange={(e) => updateField("about", e.target.value)}
            maxLength={500}
            rows={4}
            className="mt-1 w-full rounded-lg border border-discovery-beige-200 px-3 py-2 text-sm text-discovery-black focus:border-discovery-primary focus:outline-none focus:ring-1 focus:ring-discovery-primary"
            placeholder="Tell families about your organization (max 500 characters)"
          />
          <p className="mt-1 text-xs text-discovery-grey">
            {form.about.length}/500
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="discovery"
        disabled={saving || !form.name.trim() || !isDirty}
        onClick={() => void saveProfile()}
      >
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
