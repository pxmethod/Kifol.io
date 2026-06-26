/** Parent web app URL for invite links and portfolio links. */
export function webAppPath(path: string): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_WEB_APP_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://kifol.io"
      : "http://localhost:3000");
  const base = raw.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
