"use client";

import { useState } from "react";

export function OrgAvatar({
  logo,
  name,
  size = 40,
}: {
  logo?: string | null;
  name: string;
  size?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showLogo = Boolean(logo?.trim()) && !imageFailed;

  if (showLogo) {
    return (
      <img
        src={logo!}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
