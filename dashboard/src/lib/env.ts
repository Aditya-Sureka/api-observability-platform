/**
 * Frontend environment configuration.
 *
 * API calls are made same-origin via the Next.js rewrite defined in
 * next.config.ts (source "/api/:path*" -> BACKEND_URL). This keeps the
 * auth cookie first-party and avoids CORS in both dev and prod.
 *
 * Override NEXT_PUBLIC_API_BASE_URL only when calling a backend on a
 * different origin (requires the backend CORS allowlist to be configured).
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const ENV = {
  apiBaseUrl: API_BASE_URL,
  isProd: process.env.NODE_ENV === "production",
};
