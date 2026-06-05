/** Must match `basePath` in next.config.ts */
export const ORGS_BASE = "/orgs";

/** Public asset under `apps/orgs/public` (requires basePath prefix). */
export function orgsPublicAsset(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${ORGS_BASE}${p}`;
}

export function orgsApi(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${ORGS_BASE}${p}`;
}

export function orgsAppPath(path: string): string {
  const raw =
    process.env.NEXT_PUBLIC_ORGS_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_ORGS_URL?.trim() ||
    (process.env.NODE_ENV === "production" ? "https://kifol.io" : "http://localhost:3001");
  const base = raw.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const withPrefix = p.startsWith(ORGS_BASE) ? p : `${ORGS_BASE}${p}`;
  return `${base}${withPrefix}`;
}
