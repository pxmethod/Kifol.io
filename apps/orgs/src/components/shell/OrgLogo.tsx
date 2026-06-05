import { orgsPublicAsset } from "@/lib/paths";

export function OrgLogo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    // Plain img: next/image + basePath breaks SVG optimizer URLs for public assets.
    <img
      src={orgsPublicAsset("/kifolio_orgs_logo_dark.svg")}
      alt="Kifolio"
      width={130}
      height={34}
      className={className}
    />
  );
}
