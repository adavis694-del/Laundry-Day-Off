// Canonical site URL. Falls back to localhost if NEXT_PUBLIC_SITE_URL is missing or malformed
// (e.g. "mysite.com" without https://), instead of crashing the build.
function resolve(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try { return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`).origin; } catch {}
  }
  return "http://localhost:3000";
}
export const SITE_URL = resolve();
