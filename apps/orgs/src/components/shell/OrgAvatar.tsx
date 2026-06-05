"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

export function OrgAvatar({
  name,
  logoUrl,
  className = "h-9 w-9",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showLogo = Boolean(logoUrl?.trim()) && !imageFailed;

  if (showLogo) {
    return (
      <img
        src={logoUrl!}
        alt={`${name} logo`}
        className={`${className} shrink-0 rounded-full object-cover`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-discovery-beige-100 text-discovery-gray-700`}
      aria-hidden
    >
      <Building2 className="h-4 w-4" strokeWidth={1.75} />
    </span>
  );
}
