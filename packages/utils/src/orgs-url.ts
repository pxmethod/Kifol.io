/**
 * Base URL for the orgs Next app (includes protocol, no trailing slash).
 * Local dev: http://localhost:3001 with basePath /orgs on routes.
 */
export function getOrgsAppUrl(): string {
  const raw =
    typeof process.env.NEXT_PUBLIC_ORGS_APP_URL === 'string' &&
    process.env.NEXT_PUBLIC_ORGS_APP_URL
      ? process.env.NEXT_PUBLIC_ORGS_APP_URL
      : typeof process.env.NEXT_PUBLIC_ORGS_URL === 'string' &&
          process.env.NEXT_PUBLIC_ORGS_URL
        ? process.env.NEXT_PUBLIC_ORGS_URL
        : process.env.NODE_ENV === 'production'
          ? 'https://kifol.io'
          : 'http://localhost:3001';
  return raw.replace(/\/$/, '');
}

/** Full path to an orgs app route (e.g. login → …/orgs/login). */
export function orgsAppPath(path: string): string {
  const base = getOrgsAppUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const withPrefix = normalized.startsWith('/orgs') ? normalized : `/orgs${normalized}`;
  return `${base}${withPrefix}`;
}
