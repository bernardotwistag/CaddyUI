import { NextRequest, NextResponse } from "next/server";
import { getAuthConfig, SESSION_COOKIE } from "@/lib/auth/config";
import { verifySessionToken } from "@/lib/auth/session";

// Paths reachable without a session.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/health"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

let warnedNoAuth = false;

export async function middleware(req: NextRequest) {
  const { enabled } = getAuthConfig();
  if (!enabled) {
    if (!warnedNoAuth) {
      warnedNoAuth = true;
      console.warn(
        "[auth] ADMIN_PASSWORD is not set — Caddy UI is running WITHOUT authentication."
      );
    }
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
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
