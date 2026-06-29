import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig, SESSION_COOKIE } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";

const SETUP_PATH = "/setup";

// Paths reachable without a session (when auth IS configured).
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/health"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

let warnedNoAuth = false;

export async function middleware(req: NextRequest) {
  const { enabled } = getAuthConfig();
  const { pathname } = req.nextUrl;

  // No ADMIN_PASSWORD configured: lock the app down. Only the setup notice and
  // the health check are reachable; everything else is blocked.
  if (!enabled) {
    if (!warnedNoAuth) {
      warnedNoAuth = true;
      console.warn(
        "[auth] ADMIN_PASSWORD is not set — Caddy UI is locked until it is configured."
      );
    }
    if (pathname === SETUP_PATH || pathname === "/api/health") {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Admin password not configured. Set ADMIN_PASSWORD and restart." },
        { status: 503 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = SETUP_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Auth is configured — the setup page is no longer relevant.
  if (pathname === SETUP_PATH) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) return NextResponse.next();

  // Block the API outright; bounce page requests to the login screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp)$).*)"],
};
