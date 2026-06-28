// Read auth configuration from the environment at request time (not build time),
// so it works in the self-hosted standalone server and in middleware.

export const SESSION_COOKIE = "caddyui_session";

export interface AuthConfig {
  password: string;
  enabled: boolean;
  secret: string;
  ttlHours: number;
}

export function getAuthConfig(): AuthConfig {
  const password = process.env.ADMIN_PASSWORD || "";
  const ttl = Number(process.env.SESSION_TTL_HOURS);
  return {
    password,
    enabled: password.length > 0,
    // If no explicit secret, derive one from the password so rotating the
    // password invalidates existing sessions.
    secret: process.env.SESSION_SECRET || (password ? `caddyui:${password}` : "caddyui-dev-secret"),
    ttlHours: Number.isFinite(ttl) && ttl > 0 ? ttl : 168,
  };
}
