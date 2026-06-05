"use client";

import { useState } from "react";
import Image from "next/image";
import { orgsPublicAsset } from "@/lib/paths";

export function ChecklistImage({
  imageFile,
  label,
}: {
  imageFile: string;
  label: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = orgsPublicAsset(`/onboarding/${imageFile}`);

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-discovery-beige-300">
      {!failed && (
        <Image
          src={src}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      )}
      <span className="sr-only">{label} illustration</span>
    </div>
  );
}
