import { headers } from 'next/headers';

/**
 * Resolves the real public origin of the current deployment.
 *
 * Why this exists: hardcoding `NEXT_PUBLIC_BASE_URL` requires the
 * deployer to remember to set it, and forgetting it (the common case)
 * silently falls back to localhost — which is exactly what breaks
 * Open Graph image URLs after deploying. Reading the incoming
 * request's Host header works on every platform (Vercel, Netlify,
 * a plain Node server, etc.) with zero configuration, so it's tried
 * first; env vars remain as explicit overrides for edge cases
 * (custom domains behind a proxy that rewrites Host, for instance).
 */
export async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
  }

  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  } catch {
    // headers() is only available inside a request context; ignore otherwise
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return 'http://localhost:3000';
}
