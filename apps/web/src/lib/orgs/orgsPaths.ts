/** Orgs dashboard URL for emails and cross-app links. */
export function orgsAppPath(path: string): string {
  const raw =
    process.env.NEXT_PUBLIC_ORGS_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_ORGS_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://kifol.io"
      : "http://localhost:3001");
  const base = raw.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const withPrefix = p.startsWith("/orgs") ? p : `/orgs${p}`;
  return `${base}${withPrefix}`;
}
