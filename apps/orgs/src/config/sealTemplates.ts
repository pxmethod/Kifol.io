import { orgsPublicAsset } from "@/lib/paths";

export const SEAL_TEMPLATES = [
  {
    id: "circle",
    label: "Circle",
    previewAsset: orgsPublicAsset("/seals/template-circle-preview.svg"),
    stampAsset: orgsPublicAsset("/seals/template-circle-stamp.svg"),
    description: "Classic circular verified badge. Clean and formal.",
  },
  {
    id: "badge",
    label: "Badge",
    previewAsset: orgsPublicAsset("/seals/template-badge-preview.svg"),
    stampAsset: orgsPublicAsset("/seals/template-badge-stamp.svg"),
    description: "Five-point badge. Great for achievement-focused orgs.",
  },
  {
    id: "shield",
    label: "Shield",
    previewAsset: orgsPublicAsset("/seals/template-shield-preview.svg"),
    stampAsset: orgsPublicAsset("/seals/template-shield-stamp.svg"),
    description: "Shield shape. Strong and authoritative.",
  },
] as const;

export type SealTemplateId = (typeof SEAL_TEMPLATES)[number]["id"];

export function isSealTemplateId(value: string): value is SealTemplateId {
  return SEAL_TEMPLATES.some((t) => t.id === value);
}
