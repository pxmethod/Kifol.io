/**
 * Next.js production build. True on Vercel Preview and Production (not on `next dev`).
 */
export function isProductionBuild(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Customer-facing production deployment. False for Vercel Preview / Vercel "development"
 * even when `NODE_ENV` is `production`.
 */
export function isDeployProduction(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === 'production') return true;
  if (vercelEnv === 'preview' || vercelEnv === 'development') return false;
  return process.env.NODE_ENV === 'production';
}
