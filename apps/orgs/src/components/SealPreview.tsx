import { SEAL_TEMPLATES, type SealTemplateId } from "@/config/sealTemplates";

export function SealPreview({
  templateId,
  logoUrl,
  orgName,
}: {
  templateId: SealTemplateId;
  logoUrl: string | null;
  orgName: string;
}) {
  const template = SEAL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return null;

  return (
    <div className="mx-auto w-32">
      <div className="relative h-32 w-32">
        <img
          src={template.previewAsset}
          alt=""
          className="h-full w-full"
        />
        {logoUrl && (
          <img
            src={logoUrl}
            alt={orgName}
            className="absolute inset-0 m-auto h-14 w-14 rounded-full object-contain"
          />
        )}
      </div>
      <p className="mt-2 max-w-[128px] truncate text-center text-xs font-semibold text-gray-700">
        {orgName}
      </p>
    </div>
  );
}
